import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const COLS = 9          // number of road lanes
const MULTS = [1.5, 2.1, 3.0, 4.1, 5.4, 7.2, 9.8, 13.5, 19.0]
const DIFFICULTY = {
  Easy:     { truckChance: 0.25, label: 'Easy',     color: '#00d084' },
  Medium:   { truckChance: 0.42, label: 'Medium',   color: '#c9a227' },
  Hard:     { truckChance: 0.58, label: 'Hard',      color: '#ff8800' },
  Hardcore: { truckChance: 0.75, label: 'Hardcore', color: '#ff4444' },
}

// Vehicles: top-to-bottom, different styles
const VEHICLES = [
  { color: '#f5c518', accent: '#e8a800', w: 56, h: 80, label: 'TAXI' },
  { color: '#2a5caa', accent: '#1a3c7a', w: 60, h: 95, label: 'TRUCK' },
  { color: '#cc2222', accent: '#991111', w: 50, h: 70, label: 'CAR' },
  { color: '#555', accent: '#333', w: 64, h: 100, label: 'BUS' },
]

export default function ChickenRoad() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const { setBalance } = useStore()
  const { logBet } = useBet()

  // Game state refs (for canvas loop)
  const phaseRef = useRef('idle')       // idle | playing | dead | cashout
  const posRef = useRef(0)              // current column (0 = start pad)
  const betRef = useRef(0)
  const diffRef = useRef('Easy')
  const tilesRef = useRef([])           // 'safe' | 'truck' | 'unknown' per col
  const truckAnimRef = useRef([])       // moving truck y positions per lane
  const chickenXRef = useRef(0)        // pixel x of chicken
  const chickenYRef = useRef(0)        // pixel y (vertical bounce)
  const jumpAnim = useRef({ active: false, progress: 0, fromX: 0, toX: 0 })
  const frameRef = useRef(0)

  // React state
  const [phase, setPhase] = useState('idle')
  const [pos, setPos] = useState(0)
  const [diff, setDiff] = useState('Easy')
  const [currentMult, setCurrentMult] = useState(1)
  const [betAmount, setBetAmount] = useState(0)

  // ── Layout constants (calculated in draw) ──
  const ROAD_START_X = 100   // start platform x
  const CHICKEN_START_X = 52
  const ROAD_Y_TOP = 20
  const ROAD_Y_BOT_RATIO = 0.78 // road takes 78% of height

  // ── Initialize trucks ──
  const initTrucks = useCallback(() => {
    truckAnimRef.current = Array(COLS).fill(null).map(() => ({
      y: -Math.random() * 300,
      speed: 1.2 + Math.random() * 1.8,
      vehicle: VEHICLES[Math.floor(Math.random() * VEHICLES.length)],
      active: Math.random() > 0.4
    }))
  }, [])

  // ── Start game ──
  const startGame = (amount) => {
    setBalance(b => b - amount)
    betRef.current = amount
    setBetAmount(amount)
    phaseRef.current = 'playing'
    setPhase('playing')
    posRef.current = 0
    setPos(0)
    tilesRef.current = Array(COLS).fill('unknown')
    chickenXRef.current = CHICKEN_START_X
    jumpAnim.current = { active: false, progress: 0, fromX: CHICKEN_START_X, toX: CHICKEN_START_X }
    setCurrentMult(1)
    initTrucks()
    sounds.betPlace()
    toast.success(`🐔 Game on! ${DIFFICULTY[diffRef.current].label} mode`)
  }

  // ── Jump to next column ──
  const jump = useCallback(() => {
    if (phaseRef.current !== 'playing' || jumpAnim.current.active) return
    const col = posRef.current
    if (col >= COLS) return

    sounds.chickenJump()

    const hasTruck = Math.random() < DIFFICULTY[diffRef.current].truckChance
    const newTiles = [...tilesRef.current]
    newTiles[col] = hasTruck ? 'truck' : 'safe'
    tilesRef.current = newTiles

    // Calculate target X pixel
    const canvas = canvasRef.current
    const W = canvas ? canvas.width : 800
    const colW = (W - ROAD_START_X - 20) / COLS
    const targetX = ROAD_START_X + col * colW + colW / 2

    // Start jump animation
    jumpAnim.current = {
      active: true, progress: 0,
      fromX: chickenXRef.current, toX: targetX
    }

    if (hasTruck) {
      // Will die when animation completes
      setTimeout(() => {
        sounds.chickenBurn(); sounds.truckHorn()
        phaseRef.current = 'dead'
        setPhase('dead')
        logBet('chicken-road', betRef.current, 0)
        toast.error(`🚛 Hit by vehicle! Lost ${betRef.current} 🪙`)
      }, 350)
    } else {
      const newPos = col + 1
      posRef.current = newPos
      setPos(newPos)
      const mult = MULTS[col]
      setCurrentMult(mult)
      sounds.win(); sounds.coinDrop()
      toast.success(`✅ Safe! ${mult}x`, { duration: 800 })
    }
  }, [diff, logBet])

  // ── Cash out ──
  const doCashout = useCallback(() => {
    if (phaseRef.current !== 'playing' || posRef.current === 0) return
    const mult = MULTS[posRef.current - 1]
    const win = Math.floor(betRef.current * mult)
    setBalance(b => b + win)
    logBet('chicken-road', betRef.current, win)
    sounds.cashout(); sounds.coinCollect()
    phaseRef.current = 'cashout'
    setPhase('cashout')
    toast.success(`💰 Cashed out at ${mult}x! +${win} 🪙`)
  }, [logBet, setBalance])

  // ── Canvas responsive resize ──
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      const w = container.clientWidth
      const h = Math.min(Math.max(w * 0.5, 220), 380)
      canvas.width = Math.max(w, 320)
      canvas.height = Math.round(w * 0.475)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ── Canvas draw loop ──
  useEffect(() => {
    let raf

    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) { raf = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      const W = canvas.width, H = canvas.height
      frameRef.current++

      ctx.clearRect(0, 0, W, H)

      // ── Road area dimensions ──
      const roadH = H * 0.72
      const roadTop = H * 0.04
      const colW = (W - ROAD_START_X - 16) / COLS
      const chickenRow = roadTop + roadH * 0.5  // vertical center of road

      // ── Background ──
      const bgG = ctx.createLinearGradient(0, 0, 0, H)
      bgG.addColorStop(0, '#1a1a2e'); bgG.addColorStop(1, '#16213e')
      ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H)

      // ── Road surface ──
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(ROAD_START_X, roadTop, W - ROAD_START_X - 10, roadH)

      // Road lane lines (dashed white)
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 2
      ctx.setLineDash([18, 14])
      for (let c = 1; c < COLS; c++) {
        const lx = ROAD_START_X + c * colW
        ctx.beginPath(); ctx.moveTo(lx, roadTop + 4); ctx.lineTo(lx, roadTop + roadH - 4); ctx.stroke()
      }
      ctx.setLineDash([])

      // Road top/bottom edge
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(ROAD_START_X, roadTop); ctx.lineTo(W - 10, roadTop); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ROAD_START_X, roadTop + roadH); ctx.lineTo(W - 10, roadTop + roadH); ctx.stroke()

      // ── Tiles — circular multiplier displays ──
      for (let c = 0; c < COLS; c++) {
        const tx = ROAD_START_X + c * colW + colW / 2
        const ty = chickenRow
        const tile = tilesRef.current[c]
        const isCurrent = c === posRef.current && phaseRef.current === 'playing'
        const mult = MULTS[c]

        // Circular tile base
        const radius = Math.min(colW * 0.4, 34)
        ctx.beginPath(); ctx.arc(tx, ty, radius, 0, Math.PI * 2)

        if (tile === 'truck') {
          // Hit tile — red flash
          ctx.fillStyle = `rgba(255,50,50,${0.5 + 0.3 * Math.sin(frameRef.current * 0.15)})`
        } else if (tile === 'safe') {
          ctx.fillStyle = 'rgba(0,208,132,0.3)'
        } else if (isCurrent) {
          ctx.fillStyle = `rgba(201,162,39,${0.2 + 0.1 * Math.sin(frameRef.current * 0.08)})`
        } else {
          ctx.fillStyle = 'rgba(50,50,60,0.85)'
        }
        ctx.fill()

        // Tile border
        ctx.strokeStyle = tile === 'truck' ? '#ff4444' : tile === 'safe' ? '#00d084' : isCurrent ? '#c9a227' : 'rgba(255,255,255,0.12)'
        ctx.lineWidth = isCurrent ? 2.5 : 1.5
        ctx.stroke()

        // Multiplier text
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.font = `bold ${radius > 28 ? 13 : 11}px Outfit`
        ctx.fillStyle = tile === 'truck' ? '#ff6666' : tile === 'safe' ? '#00d084' : isCurrent ? '#f0c84a' : 'rgba(255,255,255,0.5)'
        ctx.fillText(`${mult}x`, tx, ty)
      }

      // ── Moving vehicles ──
      const trucks = truckAnimRef.current
      for (let c = 0; c < COLS; c++) {
        if (!trucks[c] || !trucks[c].active) continue
        const t = trucks[c]
        const tx = ROAD_START_X + c * colW + colW / 2
        const vW = Math.min(colW - 8, t.vehicle.w)
        const vH = t.vehicle.h * 0.8

        // Animate truck
        if (phaseRef.current === 'playing' || phaseRef.current === 'idle') {
          t.y += t.speed
          if (t.y > H + 20) {
            t.y = -vH - Math.random() * 200
            t.speed = 1.2 + Math.random() * 1.8
            t.vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)]
          }
        }

        const vx = tx - vW / 2
        const vy = roadTop + t.y % (roadH + vH) - vH

        if (vy < roadTop - vH || vy > roadTop + roadH) continue

        ctx.save()
        ctx.beginPath()
        ctx.rect(ROAD_START_X + c * colW + 3, roadTop, colW - 6, roadH)
        ctx.clip()

        // Vehicle body
        ctx.fillStyle = t.vehicle.color
        ctx.beginPath()
        ctx.roundRect(vx, vy, vW, vH, 6)
        ctx.fill()

        // Vehicle cab/roof
        ctx.fillStyle = t.vehicle.accent
        ctx.beginPath()
        ctx.roundRect(vx + 4, vy, vW - 8, vH * 0.38, [4, 4, 0, 0])
        ctx.fill()

        // Windshield
        ctx.fillStyle = 'rgba(150,230,255,0.75)'
        ctx.beginPath()
        ctx.roundRect(vx + 7, vy + 4, vW - 14, vH * 0.22, 3)
        ctx.fill()

        // Wheels
        ctx.fillStyle = '#222'
        for (const [wx, wy] of [[vx + 4, vy + vH - 12], [vx + vW - 14, vy + vH - 12]]) {
          ctx.beginPath(); ctx.ellipse(wx + 5, wy + 5, 6, 5, 0, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#555'; ctx.beginPath(); ctx.ellipse(wx + 5, wy + 5, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#222'
        }

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.font = `bold ${Math.max(8, vW * 0.16)}px Outfit`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(t.vehicle.label, tx, vy + vH * 0.62)

        ctx.restore()
      }

      // ── Start platform (grass) ──
      ctx.fillStyle = '#2d5a27'
      ctx.beginPath(); ctx.roundRect(0, roadTop, ROAD_START_X - 4, roadH, [0, 8, 8, 0]); ctx.fill()
      ctx.strokeStyle = '#4a8a3f'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(0, roadTop, ROAD_START_X - 4, roadH, [0, 8, 8, 0]); ctx.stroke()

      // Grass stripes
      ctx.strokeStyle = 'rgba(74,138,63,0.5)'; ctx.lineWidth = 3
      for (let i = 0; i < 4; i++) {
        const gy = roadTop + 10 + i * (roadH / 4)
        ctx.beginPath(); ctx.moveTo(8, gy); ctx.lineTo(ROAD_START_X - 12, gy); ctx.stroke()
      }

      // Coin icon on platform
      ctx.beginPath(); ctx.arc(ROAD_START_X / 2, chickenRow - 28, 18, 0, Math.PI * 2)
      const cg = ctx.createRadialGradient(ROAD_START_X / 2 - 4, chickenRow - 32, 2, ROAD_START_X / 2, chickenRow - 28, 18)
      cg.addColorStop(0, '#f0c84a'); cg.addColorStop(1, '#c9a227')
      ctx.fillStyle = cg; ctx.fill()
      ctx.strokeStyle = '#9a7a10'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#0a0a0f'; ctx.font = 'bold 13px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🐔', ROAD_START_X / 2, chickenRow - 28)

      // ── Jump animation ──
      const j = jumpAnim.current
      if (j.active) {
        j.progress += 0.08
        if (j.progress >= 1) { j.progress = 1; j.active = false }
        chickenXRef.current = j.fromX + (j.toX - j.fromX) * j.progress
      }

      // ── Draw Chicken ──
      const cx = chickenXRef.current
      const bounce = phaseRef.current === 'playing' ? Math.sin(frameRef.current * 0.12) * 3 : 0
      const cy = chickenRow + bounce
      const dead = phaseRef.current === 'dead'
      const sc = 1.2

      ctx.save()
      ctx.translate(cx, cy)
      if (dead) ctx.rotate(Math.min(jumpAnim.current.progress * Math.PI, Math.PI) * 0.8)

      // Body
      const bodyG = ctx.createRadialGradient(-4, -4, 2, 0, 0, 22 * sc)
      bodyG.addColorStop(0, dead ? '#e0e0e0' : '#ffffff')
      bodyG.addColorStop(0.6, dead ? '#c0c0c0' : '#f5f5f5')
      bodyG.addColorStop(1, dead ? '#999' : '#ddd')
      ctx.fillStyle = bodyG
      ctx.beginPath(); ctx.ellipse(0, 0, 22 * sc, 18 * sc, 0, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = dead ? '#888' : '#ccc'; ctx.lineWidth = 1.5; ctx.stroke()

      // Head
      const headG = ctx.createRadialGradient(-2, -6, 1, 0, -8, 12)
      headG.addColorStop(0, dead ? '#ddd' : '#fff')
      headG.addColorStop(1, dead ? '#aaa' : '#eee')
      ctx.fillStyle = headG
      ctx.beginPath(); ctx.ellipse(14 * sc, -16 * sc, 12 * sc, 11 * sc, 0.2, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = dead ? '#888' : '#ccc'; ctx.lineWidth = 1.5; ctx.stroke()

      // Comb (red)
      if (!dead) {
        ctx.fillStyle = '#cc2222'
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.arc(10 * sc + i * 5 * sc, -26 * sc + Math.abs(i - 1) * 3 * sc, 4 * sc, 0, Math.PI * 2); ctx.fill()
        }
      }

      // Beak
      ctx.fillStyle = dead ? '#888' : '#f0a830'
      ctx.beginPath(); ctx.moveTo(24 * sc, -16 * sc); ctx.lineTo(32 * sc, -13 * sc); ctx.lineTo(24 * sc, -10 * sc); ctx.closePath(); ctx.fill()

      // Eye
      ctx.fillStyle = dead ? '#555' : '#1a1a1a'
      ctx.beginPath(); ctx.arc(20 * sc, -18 * sc, 3 * sc, 0, Math.PI * 2); ctx.fill()
      if (!dead) { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(21 * sc, -19 * sc, 1 * sc, 0, Math.PI * 2); ctx.fill() }
      if (dead) { // X eyes
        ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(17 * sc, -21 * sc); ctx.lineTo(23 * sc, -15 * sc); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(23 * sc, -21 * sc); ctx.lineTo(17 * sc, -15 * sc); ctx.stroke()
      }

      // Wattle
      ctx.fillStyle = '#cc2222'
      ctx.beginPath(); ctx.ellipse(22 * sc, -10 * sc, 4 * sc, 6 * sc, 0.3, 0, Math.PI * 2); ctx.fill()

      // Wings
      ctx.fillStyle = dead ? '#c0c0c0' : '#f0f0f0'
      ctx.beginPath(); ctx.ellipse(-8 * sc, 4 * sc, 10 * sc, 7 * sc, -0.3 + bounce * 0.05, 0, Math.PI * 2); ctx.fill()

      // Legs
      ctx.strokeStyle = dead ? '#999' : '#f0a830'; ctx.lineWidth = 2.5 * sc
      const legBounce = Math.sin(frameRef.current * 0.2) * (phaseRef.current === 'playing' ? 4 : 0)
      ctx.beginPath(); ctx.moveTo(4 * sc, 16 * sc); ctx.lineTo(2 * sc, 28 * sc + legBounce); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(12 * sc, 16 * sc); ctx.lineTo(14 * sc, 28 * sc - legBounce); ctx.stroke()

      // Tail feathers
      ctx.fillStyle = dead ? '#c0c0c0' : '#e8e8e8'
      ctx.beginPath(); ctx.moveTo(-22 * sc, -4 * sc); ctx.lineTo(-32 * sc, -12 * sc); ctx.lineTo(-24 * sc, 2 * sc); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(-22 * sc, 0); ctx.lineTo(-30 * sc, 4 * sc); ctx.lineTo(-20 * sc, 8 * sc); ctx.closePath(); ctx.fill()

      ctx.restore()

      // ── Current multiplier badge below chicken ──
      if (phaseRef.current === 'playing' && posRef.current > 0) {
        const badgeX = chickenXRef.current
        const badgeY = chickenRow + 36
        ctx.beginPath()
        const mult = MULTS[posRef.current - 1]
        ctx.fillStyle = 'rgba(0,0,0,0.75)'
        const bw = 58, bh = 24
        ctx.roundRect(badgeX - bw / 2, badgeY - bh / 2, bw, bh, 8)
        ctx.fill()
        ctx.fillStyle = '#f0c84a'
        ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(`${mult}x`, badgeX, badgeY)
      }

      // ── HUD top-left ──
      if (phaseRef.current === 'playing') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.beginPath(); ctx.roundRect(8, 8, 180, 34, 8); ctx.fill()
        ctx.fillStyle = '#00d084'; ctx.font = 'bold 13px Outfit'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillText(`Column ${posRef.current}/${COLS}`, 18, 25)
        ctx.fillStyle = '#c9a227'; ctx.textAlign = 'right'
        const mult = posRef.current > 0 ? MULTS[posRef.current - 1] : 1
        ctx.fillText(`💰 ${Math.floor(betRef.current * mult)}`, 182, 25)
      }

      // ── Game Over overlay ──
      if (phaseRef.current === 'dead') {
        ctx.fillStyle = 'rgba(180,0,0,0.35)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#ff4444'; ctx.font = 'bold 32px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000'
        ctx.fillText('💥 HIT!', W / 2, H / 2 - 16)
        ctx.shadowBlur = 0
        ctx.fillStyle = '#ffaaaa'; ctx.font = '16px Outfit'
        ctx.fillText(`Lost ${betRef.current} coins`, W / 2, H / 2 + 18)
      }

      if (phaseRef.current === 'cashout') {
        ctx.fillStyle = 'rgba(0,150,100,0.3)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#00d084'; ctx.font = 'bold 28px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.shadowBlur = 16; ctx.shadowColor = '#00ff88'
        const mult = MULTS[posRef.current - 1]
        ctx.fillText(`💰 ${mult}x Cashout!`, W / 2, H / 2 - 14)
        ctx.shadowBlur = 0
        ctx.fillStyle = '#aaffcc'; ctx.font = '16px Outfit'
        ctx.fillText(`+${Math.floor(betRef.current * mult)} coins`, W / 2, H / 2 + 16)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const resetGame = () => {
    phaseRef.current = 'idle'
    setPhase('idle')
    setPos(0)
    posRef.current = 0
    setCurrentMult(1)
    chickenXRef.current = CHICKEN_START_X
    tilesRef.current = Array(COLS).fill('unknown')
    initTrucks()
  }

  const canCashout = phase === 'playing' && pos > 0

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Mobile landscape hint */}
      <style>{`
        @media (max-width: 768px) and (orientation: portrait) {
          .chicken-road-wrap {
            position: fixed !important;
            inset: 0;
            z-index: 9999;
            background: #1a1a2e;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .chicken-road-rotate-msg {
            display: flex !important;
          }
        }
        @media (max-width: 768px) and (orientation: landscape) {
          .chicken-road-wrap {
            position: fixed !important;
            inset: 0;
            z-index: 9999;
            background: #1a1a2e;
            display: block;
            overflow-y: auto;
          }
          .chicken-road-rotate-msg {
            display: none !important;
          }
        }
      `}</style>
      {/* Rotate message - portrait only */}
      <div className="chicken-road-rotate-msg" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e', position: 'fixed', inset: 0, zIndex: 99999, color: 'white', textAlign: 'center', gap: '16px' }}>
        <div style={{ fontSize: '60px' }}>🔄</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#c9a227' }}>Rotate your phone</div>
        <div style={{ fontSize: '14px', color: '#888' }}>Chicken Road is best in landscape mode</div>
      </div>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(16px,3.5vw,24px)', marginBottom: '10px' }}>
        🐔 <span className="gold-text">Chicken Road</span>
      </h1>

      <div className="game-layout">
        {/* Canvas */}
        <div>
          <div ref={containerRef} style={{ width: '100%' }}>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'block', background: '#1a1a2e', cursor: phase === 'playing' ? 'pointer' : 'default', touchAction: 'none' }}
              onClick={phase === 'playing' ? jump : undefined}
            />
          </div>

          {/* Action bar */}
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'stretch' }}>
            {/* Difficulty selector */}
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Difficulty — <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>Chance of being hit</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Object.entries(DIFFICULTY).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => { if (phase === 'idle') { setDiff(key); diffRef.current = key } }}
                    disabled={phase !== 'idle'}
                    style={{
                      flex: 1, padding: '7px 4px', borderRadius: '7px', fontSize: '11px', fontWeight: '700',
                      background: diff === key ? `${val.color}22` : 'var(--bg-hover)',
                      border: `1.5px solid ${diff === key ? val.color : 'var(--border)'}`,
                      color: diff === key ? val.color : 'var(--text-muted)',
                      cursor: phase !== 'idle' ? 'not-allowed' : 'pointer',
                      opacity: phase !== 'idle' ? 0.55 : 1,
                      transition: 'all 0.2s'
                    }}
                  >{key}</button>
                ))}
              </div>
            </div>

            {/* Go / Cashout / Next */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
              {phase === 'playing' ? (
                <>
                  <button onClick={jump} style={{
                    flex: 1, padding: '10px', borderRadius: '9px', fontWeight: '900',
                    fontSize: '16px', background: 'linear-gradient(135deg,#00d084,#00a866)',
                    border: 'none', color: 'white', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,208,132,0.4)',
                    letterSpacing: '1px'
                  }}>GO →</button>
                  {canCashout && (
                    <button onClick={doCashout} style={{
                      flex: 1, padding: '8px', borderRadius: '9px', fontWeight: '800',
                      fontSize: '13px', background: 'linear-gradient(135deg,#c9a227,#f0c84a)',
                      border: 'none', color: '#0a0a0f', cursor: 'pointer'
                    }}>
                      CASH OUT<br />
                      <span style={{ fontSize: '11px' }}>{Math.floor(betAmount * currentMult)} 🪙</span>
                    </button>
                  )}
                </>
              ) : (phase === 'dead' || phase === 'cashout') ? (
                <button onClick={resetGame} className="btn-gold" style={{ flex: 1, padding: '12px', fontSize: '14px' }}>
                  Play Again
                </button>
              ) : null}
            </div>
          </div>

          {/* Multiplier path */}
          <div style={{ marginTop: '10px', display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
            {MULTS.map((m, i) => {
              const isReached = i < pos
              const isCurrent = i === pos - 1 && phase === 'playing'
              const isNext = i === pos && phase === 'playing'
              return (
                <div key={i} style={{
                  flex: 1, minWidth: '52px', padding: '6px 4px', borderRadius: '8px', textAlign: 'center',
                  background: isReached ? 'rgba(0,208,132,0.15)' : isCurrent ? 'rgba(201,162,39,0.2)' : isNext ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isReached ? 'rgba(0,208,132,0.35)' : isCurrent ? 'var(--gold)' : isNext ? 'rgba(255,255,255,0.15)' : 'var(--border)'}`,
                  transition: 'all 0.3s'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: isReached ? '#00d084' : isCurrent ? '#f0c84a' : isNext ? 'white' : 'var(--text-muted)' }}>
                    {isReached ? '✓' : isNext ? '→' : `${i + 1}`}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: isReached ? '#00d084' : isCurrent ? '#f0c84a' : isNext ? '#ccc' : 'var(--text-muted)' }}>
                    {m}x
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bet panel */}
        <div className="game-panel-right">
          <BetPanel onBet={startGame} disabled={phase === 'playing'} />

          {/* Stats */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '13px' }}>
            <h4 style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Current Game
            </h4>
            {[
              { l: 'Difficulty', v: diff, c: DIFFICULTY[diff].color },
              { l: 'Column', v: `${pos} / ${COLS}`, c: 'white' },
              { l: 'Multiplier', v: pos > 0 ? `${MULTS[pos - 1]}x` : '—', c: '#c9a227' },
              { l: 'Potential Win', v: pos > 0 ? `🪙 ${Math.floor(betAmount * MULTS[pos - 1])}` : '—', c: '#00d084' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.l}</span>
                <span style={{ color: s.c, fontWeight: '700' }}>{s.v}</span>
              </div>
            ))}
          </div>

          {/* How to play */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '13px' }}>
            <h4 style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              How to Play
            </h4>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.9, paddingLeft: '14px' }}>
              <li>Click GO → to move right</li>
              <li>Avoid the vehicles!</li>
              <li>Each safe step = higher multiplier</li>
              <li>Cash out before getting hit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
