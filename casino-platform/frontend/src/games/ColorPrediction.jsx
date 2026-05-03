import React, { useState, useRef, useEffect } from 'react'
import LiveRoundBar from '../components/LiveRoundBar'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

const COLORS = [
  { name: 'Red', color: '#ff4444', payout: 2 },
  { name: 'Green', color: '#00d084', payout: 2 },
  { name: 'Blue', color: '#4488ff', payout: 2 },
  { name: 'Yellow', color: '#f0c84a', payout: 2 },
  { name: 'Purple', color: '#9944ff', payout: 3 },
  { name: 'Orange', color: '#ff8800', payout: 3 },
]

export default function ColorPrediction() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const canvasRef = useRef(null)
  const angleRef = useRef(0)
  const spinRef = useRef(false)
  const speedRef = useRef(0)
  const betRef = useRef(0)
  const pickedRef = useRef(null)

  const [phase, setPhase] = useState('bet') // bet | spinning | result
  const [roundPhase, setRoundPhase] = useState('betting')
  const [countdown, setCountdown] = useState(10)
  const [roundId, setRoundId] = useState(Math.floor(Math.random()*90000)+10000)
  const cdRef = useRef(10), rPhaseRef = useRef('betting')

  // Live round timer - auto cycle
  useEffect(() => {
    const tick = () => {
      if(rPhaseRef.current==='betting'){
        cdRef.current--; setCountdown(cdRef.current)
        if(cdRef.current<=3&&cdRef.current>0) sounds.tickFinal()
        if(cdRef.current<=0){ rPhaseRef.current='locked'; setRoundPhase('locked'); cdRef.current=1 }
      } else if(rPhaseRef.current==='locked'){
        cdRef.current--
        if(cdRef.current<=0){ rPhaseRef.current='result'; setRoundPhase('result'); cdRef.current=6 }
      } else if(rPhaseRef.current==='result'){
        cdRef.current--
        if(cdRef.current<=0){ rPhaseRef.current='next'; setRoundPhase('next'); cdRef.current=2 }
      } else if(rPhaseRef.current==='next'){
        cdRef.current--
        if(cdRef.current<=0){
          rPhaseRef.current='betting'; setRoundPhase('betting'); cdRef.current=10; setCountdown(10)
          setRoundId(r=>r+1); sounds.tick()
        }
      }
    }
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])
  const [picked, setPicked] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const cdRef = useRef(null)

  useEffect(() => {
    let raf
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) { raf = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      const W = canvas.width, H = canvas.height
      const CX = W / 2, CY = H / 2, R = Math.min(W, H) / 2 - 14
      ctx.clearRect(0, 0, W, H)

      // BG
      ctx.fillStyle = '#0d0d1a'
      ctx.fillRect(0, 0, W, H)

      if (spinRef.current) {
        speedRef.current = Math.max(0, speedRef.current * 0.988)
        angleRef.current += speedRef.current
        if (speedRef.current < 0.006) {
          spinRef.current = false
          const sliceAngle = (Math.PI * 2) / COLORS.length
          const norm = ((-angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
          const winIdx = Math.floor(norm / sliceAngle) % COLORS.length
          const winner = COLORS[winIdx]
          setResult(winner)
          setPhase('result')
          setHistory(h => [winner, ...h.slice(0, 11)])
          const bet = betRef.current
          const selected = pickedRef.current
          if (selected && selected.name === winner.name) {
            const win = Math.floor(bet * winner.payout)
            setBalance(b => b + win)
            sounds.bigWin(); sounds.colorReveal(); logBet('color-prediction', bet, win)
            toast.success(`🎉 ${winner.name}! Won ${win} 🪙 at ${winner.payout}x`)
          } else {
            if (selected && bet > 0) logBet('color-prediction', bet, 0)
            toast.error(`${winner.name} — ${selected ? `You picked ${selected.name}` : 'No bet'}. Lost!`)
          }
        }
      }

      // Draw slices
      const sliceAngle = (Math.PI * 2) / COLORS.length
      COLORS.forEach((col, i) => {
        const start = angleRef.current + i * sliceAngle - Math.PI / 2
        const end = start + sliceAngle
        ctx.beginPath()
        ctx.moveTo(CX, CY)
        ctx.arc(CX, CY, R, start, end)
        ctx.closePath()
        ctx.fillStyle = col.color
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Label
        const mid = start + sliceAngle / 2
        const tx = CX + R * 0.65 * Math.cos(mid)
        const ty = CY + R * 0.65 * Math.sin(mid)
        ctx.save()
        ctx.translate(tx, ty)
        ctx.rotate(mid + Math.PI / 2)
        ctx.font = 'bold 11px Outfit'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowBlur = 4
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.fillText(col.name, 0, 0)
        ctx.fillText(`${col.payout}x`, 0, 13)
        ctx.shadowBlur = 0
        ctx.restore()
      })

      // Rim
      ctx.beginPath()
      ctx.arc(CX, CY, R + 2, 0, Math.PI * 2)
      ctx.strokeStyle = '#c9a227'
      ctx.lineWidth = 4
      ctx.stroke()

      // Center
      const cg = ctx.createRadialGradient(CX - 3, CY - 3, 1, CX, CY, 22)
      cg.addColorStop(0, '#f0c84a')
      cg.addColorStop(1, '#7a5a00')
      ctx.beginPath()
      ctx.arc(CX, CY, 22, 0, Math.PI * 2)
      ctx.fillStyle = cg
      ctx.fill()
      ctx.font = 'bold 14px Cinzel'
      ctx.fillStyle = '#0a0a0f'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('♠', CX, CY)

      // Pointer
      ctx.beginPath()
      ctx.moveTo(CX - 10, CY - R - 18)
      ctx.lineTo(CX + 10, CY - R - 18)
      ctx.lineTo(CX, CY - R + 8)
      ctx.closePath()
      ctx.fillStyle = '#ff4444'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#ff4444'
      ctx.fill()
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'bet') return
    setCountdown(10)
    cdRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(cdRef.current)
          autoSpin()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(cdRef.current)
  }, [phase])

  const autoSpin = () => {
    clearInterval(cdRef.current)
    speedRef.current = 0.3 + Math.random() * 0.12
    spinRef.current = true
    sounds.colorSpin(); setPhase('spinning')
  }

  const placeBet = (amount) => {
    if (!picked) return toast.error('Pick a color first!')
    setBalance(b => b - amount)
    betRef.current = amount
    pickedRef.current = picked
    clearInterval(cdRef.current)
    speedRef.current = 0.3 + Math.random() * 0.12
    spinRef.current = true
    sounds.colorSpin(); setPhase('spinning')
  }

  const reset = () => {
    setPicked(null)
    pickedRef.current = null
    setResult(null)
    betRef.current = 0
    setPhase('bet')
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <LiveRoundBar phase={roundPhase} countdown={countdown} roundId={roundId} color="#ff4488" />
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,26px)', marginBottom: '16px' }}>
        🎨 <span className="gold-text">Color Prediction</span>
      </h1>

      {/* History */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        {history.map((h, i) => (
          <span key={i} style={{ width: '26px', height: '26px', borderRadius: '50%', background: h.color, flexShrink: 0, display: 'inline-block', boxShadow: `0 0 6px ${h.color}60`, border: '2px solid rgba(255,255,255,0.2)' }} title={h.name} />
        ))}
      </div>

      <div className="game-layout">
        <div>
          {/* Countdown */}
          {phase === 'bet' && (
            <div style={{ textAlign: 'center', marginBottom: '10px', padding: '8px', background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: '700' }}>⏳ Auto spin in {countdown}s — Pick your color!</span>
            </div>
          )}

          <canvas ref={canvasRef} width={360} height={360} style={{
            width: '100%', maxWidth: '360px', display: 'block', margin: '0 auto',
            borderRadius: '50%', boxShadow: spinRef.current ? '0 0 40px rgba(201,162,39,0.4)' : '0 8px 40px rgba(0,0,0,0.6)'
          }} />

          {/* Color picker */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '7px', marginTop: '14px' }}>
            {COLORS.map(c => (
              <button key={c.name} onClick={() => phase === 'bet' && setPicked(c)}
                disabled={phase !== 'bet'}
                style={{
                  padding: '10px 6px', borderRadius: '9px', cursor: phase === 'bet' ? 'pointer' : 'default',
                  background: picked?.name === c.name ? `${c.color}30` : 'var(--bg-hover)',
                  border: `2px solid ${picked?.name === c.name ? c.color : 'var(--border)'}`,
                  color: picked?.name === c.name ? c.color : 'var(--text-secondary)',
                  fontWeight: '700', fontSize: '12px', transition: 'all 0.2s',
                  boxShadow: picked?.name === c.name ? `0 0 12px ${c.color}40` : 'none'
                }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.color, margin: '0 auto 4px', border: '2px solid rgba(255,255,255,0.3)' }} />
                {c.name} {c.payout}x
              </button>
            ))}
          </div>

          {result && phase === 'result' && (
            <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', textAlign: 'center', background: `${result.color}15`, border: `1px solid ${result.color}40` }}>
              <div style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: result.color, verticalAlign: 'middle', marginRight: '8px' }} />
              <span style={{ color: result.color, fontWeight: '800', fontSize: '16px' }}>
                {result.name} wins! {picked?.name === result.name ? `🎉 +${Math.floor(betRef.current * result.payout)} 🪙` : betRef.current > 0 ? '❌ Lost' : ''}
              </span>
              <br />
              <button onClick={reset} className="btn-gold" style={{ marginTop: '10px', padding: '10px 24px' }}>Next Round</button>
            </div>
          )}
        </div>

        <div className="game-panel-right">
          <BetPanel onBet={placeBet} disabled={phase !== 'bet'} />
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '13px' }}>
            <h4 style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Payouts</h4>
            {COLORS.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)' }}>{c.name}</span>
                <span style={{ color: c.color, fontWeight: '700', fontSize: '12px' }}>{c.payout}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
