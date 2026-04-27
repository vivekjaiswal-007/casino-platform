import AIDealer from '../components/AIDealer'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

// Weighted symbols: more weight = appears more often
const SYMBOLS_WEIGHTED = [
  { sym: '🍒', name: 'Cherry',  value: 1.5,color: '#ff4444', weight: 25 },
  { sym: '🍋', name: 'Lemon',   value: 2,  color: '#ffcc00', weight: 22 },
  { sym: '🍊', name: 'Orange',  value: 3,  color: '#ff8800', weight: 18 },
  { sym: '🍇', name: 'Grape',   value: 4,  color: '#9944ff', weight: 14 },
  { sym: '🔔', name: 'Bell',    value: 6,  color: '#c9a227', weight: 10 },
  { sym: '💎', name: 'Diamond', value: 12, color: '#44ccff', weight: 6  },
  { sym: '7️⃣', name: 'Seven',  value: 20, color: '#ff4488', weight: 3  },
  { sym: '🃏', name: 'Wild',    value: 35, color: '#f0c84a', weight: 2  },
]
// Build flat weighted array for fast random pick
const SYMBOLS = (() => {
  const arr = []
  SYMBOLS_WEIGHTED.forEach(s => { for(let i=0;i<s.weight;i++) arr.push(s) })
  return arr
})()

const REEL_COUNT = 3
const VISIBLE = 3
const SYM_H = 80
const W = 560, H = 320

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function SlotMachine() {
  const [dealerPhase, setDealerPhase] = React.useState('idle')
  const canvasRef = useRef(null)
  const { setBalance } = useStore()
  const [spinning, setSpinning] = useState(false)
  const [totalWin, setTotalWin] = useState(0)

  const reelsRef = useRef(
    Array(REEL_COUNT).fill(null).map(() => ({
      symbols: Array(20).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]),
      offset: 0,
      speed: 0,
      spinning: false,
    }))
  )

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, W, H)

    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#0f0f1a'); bg.addColorStop(1, '#1a1a2e')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    const reelW = (W - 60) / REEL_COUNT
    const startX = 30

    reelsRef.current.forEach((reel, ri) => {
      const rx = startX + ri * reelW
      const ry = 20

      // Reel bg
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      roundedRect(ctx, rx, ry, reelW - 8, VISIBLE * SYM_H, 10)
      ctx.fill()

      ctx.save()
      roundedRect(ctx, rx, ry, reelW - 8, VISIBLE * SYM_H, 10)
      ctx.clip()

      const offsetMod = reel.offset % SYM_H
      const startIdx = Math.floor(reel.offset / SYM_H)

      for (let row = -1; row <= VISIBLE + 1; row++) {
        const idx = ((startIdx + row) % reel.symbols.length + reel.symbols.length) % reel.symbols.length
        const sym = reel.symbols[idx]
        const sy = ry + row * SYM_H - offsetMod
        if (sy > H + 20 || sy < -SYM_H) continue
        ctx.font = '42px serif'; ctx.textAlign = 'center'
        ctx.fillText(sym.sym, rx + (reelW - 8) / 2, sy + SYM_H * 0.62)
      }
      ctx.restore()

      // Frame
      const frameG = ctx.createLinearGradient(rx, 0, rx + reelW - 8, 0)
      frameG.addColorStop(0, '#9a7a10'); frameG.addColorStop(0.5, '#f0c84a'); frameG.addColorStop(1, '#9a7a10')
      ctx.strokeStyle = frameG; ctx.lineWidth = 3
      roundedRect(ctx, rx, ry, reelW - 8, VISIBLE * SYM_H, 10); ctx.stroke()
    })

    // Win line
    ctx.strokeStyle = 'rgba(201,162,39,0.35)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(20, H/2); ctx.lineTo(W-20, H/2); ctx.stroke()
    ctx.setLineDash([])

    if (totalWin > 0) {
      ctx.fillStyle = 'rgba(201,162,39,0.06)'; ctx.fillRect(0, 0, W, H)
      ctx.font = 'bold 26px Cinzel'; ctx.textAlign = 'center'
      ctx.fillStyle = '#f0c84a'; ctx.shadowBlur = 20; ctx.shadowColor = '#c9a227'
      ctx.fillText(`🎉 WIN! ${totalWin} 🪙`, W/2, H - 12); ctx.shadowBlur = 0
    }
  }, [totalWin])

  useEffect(() => {
    let raf
    const loop = () => {
      reelsRef.current.forEach(reel => { if (reel.spinning) reel.offset += reel.speed })
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [draw])

  const spin = (amount) => {
    setDealerPhase('shuffling')
    setTimeout(()=>setDealerPhase('dealing'),600)
    if (spinning) return
    setTotalWin(0)
    sounds.slotSpin(); setSpinning(true)
    setBalance(b => b - amount)

    const targets = reelsRef.current.map(() =>
      Array(VISIBLE).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    )

    reelsRef.current.forEach((reel, i) => { reel.spinning = true; reel.speed = 15 + i * 2 })

    reelsRef.current.forEach((reel, i) => {
      setTimeout(() => {
        reel.spinning = false; reel.speed = 0
        reel.offset = Math.round(reel.offset / SYM_H) * SYM_H
        const base = Math.floor(reel.offset / SYM_H) % reel.symbols.length
        targets[i].forEach((sym, r) => {
          reel.symbols[(base + r) % reel.symbols.length] = sym
        })

        if (i === REEL_COUNT - 1) {
          const midRow = Math.floor(VISIBLE / 2)
          const mid = reelsRef.current.map(r => {
            const idx = (Math.floor(r.offset / SYM_H) + midRow) % r.symbols.length
            return r.symbols[idx]
          })

          let win = 0
          const isWild = s => s.sym === '🃏'
          // 3 of a kind (big win)
          if (mid[0].sym === mid[1].sym && mid[1].sym === mid[2].sym) {
            win = Math.floor(amount * mid[0].value * 4)
          }
          // 3 wilds = jackpot
          else if (mid.every(isWild)) {
            win = Math.floor(amount * 80)
          }
          // 2 wilds + any = treat non-wild as 3-of-kind
          else if (mid.filter(isWild).length === 2) {
            const nonWild = mid.find(s => !isWild(s))
            win = Math.floor(amount * (nonWild?.value || 2) * 2)
          }
          // 1 wild + 2 matching = 3-of-kind payout at lower rate
          else if (mid.filter(isWild).length === 1) {
            const nonWilds = mid.filter(s => !isWild(s))
            if (nonWilds[0].sym === nonWilds[1].sym) win = Math.floor(amount * nonWilds[0].value * 1.5)
          }
          // No wilds: only 3-of-kind wins (no 2-of-kind payout)

          setTotalWin(win)
          if (win > 0) {
            setBalance(b => b + win)
            setDealerPhase('lose'); toast.success(`🎰 Won ${win} coins!`)
          } else {
            setDealerPhase('win'); toast.error('No match — Try again!')
          }
          setSpinning(false)
        }
      }, 1000 + i * 500 + Math.random() * 400)
    })
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}><AIDealer phase={dealerPhase} compact={true} /></div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', marginBottom: '20px' }}>
        🎰 <span className="gold-text">Slot Machine</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{
            background: 'linear-gradient(180deg,#2a1a00,#1a1000)',
            border: '3px solid var(--gold)', borderRadius: '20px', padding: '20px',
            boxShadow: '0 0 40px rgba(201,162,39,0.25), inset 0 0 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ textAlign: 'center', fontFamily: 'Cinzel,serif', fontSize: '16px', marginBottom: '14px', color: 'var(--gold)', letterSpacing: '2px' }}>
              🎰 ROYAL SLOTS 🎰
            </div>
            <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
            {spinning && (
              <div style={{ textAlign: 'center', marginTop: '10px', color: 'var(--gold)', fontSize: '13px', fontWeight: '600' }}>
                Spinning...
              </div>
            )}
          </div>

          <div style={{ marginTop: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
            <h3 style={{ color: 'var(--gold)', marginBottom: '10px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pay Table</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
              {SYMBOLS.map(s => (
                <div key={s.sym} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-hover)', borderRadius: '8px', border: `1px solid ${s.color}30` }}>
                  <div style={{ fontSize: '22px' }}>{s.sym}</div>
                  <div style={{ fontSize: '11px', color: s.color, fontWeight: '700', marginTop: '2px' }}>{s.value}x</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BetPanel onBet={spin} disabled={spinning} />
      </div>
    </div>
  )
}
