import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SEGS = [
  { label: '2x', mult: 2,   color: '#4488ff', weight: 25 },
  { label: '3x', mult: 3,   color: '#00d084', weight: 20 },
  { label: '5x', mult: 5,   color: '#c9a227', weight: 15 },
  { label: '10x',mult: 10,  color: '#ff8800', weight: 10 },
  { label: '20x',mult: 20,  color: '#ff4444', weight: 6  },
  { label: '50x',mult: 50,  color: '#9944ff', weight: 4  },
  { label: '❌',  mult: 0,   color: '#333',    weight: 20 },
]

// Expand by weight
const WHEEL = (() => {
  const arr = []
  SEGS.forEach(s => { for (let i = 0; i < s.weight; i++) arr.push(s) })
  return arr.sort(() => Math.random() - 0.5)
})()

const SEG_ANGLE = 360 / WHEEL.length

export default function WheelOfFortune() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const rotRef = useRef(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [phase, setPhase] = useState('bet')

  useEffect(() => {
    drawWheel(0)
  }, [])

  const drawWheel = (rot) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, CX = W/2, CY = W/2, R = W/2 - 10

    ctx.clearRect(0, 0, W, W)

    // Shadow
    ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2); ctx.fillStyle='#0a0a0f'; ctx.fill()
    ctx.shadowBlur = 0

    const n = WHEEL.length
    WHEEL.forEach((seg, i) => {
      const startAngle = (rot + i * SEG_ANGLE - 90) * Math.PI / 180
      const endAngle = (rot + (i+1) * SEG_ANGLE - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(CX, CY)
      ctx.arc(CX, CY, R, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color + '88'
      ctx.fill()
      ctx.strokeStyle = '#0a0a0f'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label
      const midAngle = (rot + (i + 0.5) * SEG_ANGLE - 90) * Math.PI / 180
      const tx = CX + Math.cos(midAngle) * R * 0.72
      const ty = CY + Math.sin(midAngle) * R * 0.72
      ctx.save()
      ctx.translate(tx, ty)
      ctx.rotate(midAngle + Math.PI/2)
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.max(9, Math.min(14, 400/n))}px Outfit`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(seg.label, 0, 0)
      ctx.restore()
    })

    // Center hub
    ctx.beginPath(); ctx.arc(CX, CY, 22, 0, Math.PI*2)
    const g = ctx.createRadialGradient(CX-4, CY-4, 2, CX, CY, 22)
    g.addColorStop(0,'#f0c84a'); g.addColorStop(1,'#c9a227')
    ctx.fillStyle = g; ctx.fill()
    ctx.strokeStyle = '#9a7a10'; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = '#0a0a0f'; ctx.font = 'bold 16px Outfit'
    ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText('♠', CX, CY)
  }

  const spin = (amount) => {
    if (spinning) return
    setBalance(b => b - amount)
    setResult(null); setPhase('spinning'); setSpinning(true)
    sounds.wheelSpin()

    // Pick result
    const winIdx = Math.floor(Math.random() * WHEEL.length)
    const winSeg = WHEEL[winIdx]
    const targetAngle = -(winIdx * SEG_ANGLE + SEG_ANGLE/2)
    const totalSpin = 1440 + 720 * Math.random() + targetAngle - (rotRef.current % 360)
    const finalRot = rotRef.current + totalSpin

    let start = null
    const duration = 4000

    const animate = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = rotRef.current + totalSpin * eased
      drawWheel(current)
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        rotRef.current = finalRot % 360
        setSpinning(false)
        setPhase('result')
        setResult(winSeg)
        if (winSeg.mult > 0) {
          const win = Math.floor(amount * winSeg.mult)
          setBalance(b => b + win)
          sounds.bigWin()
          toast.success(`🎉 ${winSeg.label}! Won ${win} 🪙`)
          logBet('wheel-fortune', amount, win)
        } else {
          sounds.loss()
          toast.error(`❌ No win. Lost ${amount} 🪙`)
          logBet('wheel-fortune', amount, 0)
        }
      }
    }
    requestAnimationFrame(animate)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🎡 <span className="gold-text">Wheel of Fortune</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Pointer */}
            <div style={{ position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, fontSize: '28px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>▼</div>
            <canvas ref={canvasRef} width={320} height={320}
              style={{ maxWidth: '100%', borderRadius: '50%', border: '4px solid var(--gold)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }} />
          </div>

          {result && phase === 'result' && (
            <div style={{ marginTop: '16px', padding: '16px', textAlign: 'center', borderRadius: '12px', background: result.mult > 0 ? 'rgba(0,208,132,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${result.mult > 0 ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, fontSize: '22px', fontWeight: '900', color: result.mult > 0 ? '#00d084' : '#ff4444' }}>
              {result.mult > 0 ? `🎉 ${result.label} — You Win!` : `❌ No win this time!`}
            </div>
          )}

          {/* Payout table */}
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {SEGS.filter(s => s.mult > 0).map(s => (
              <div key={s.label} style={{ padding: '5px 10px', borderRadius: '6px', background: `${s.color}18`, border: `1px solid ${s.color}44`, fontSize: '12px', color: s.color, fontWeight: '700' }}>
                {s.label}
              </div>
            ))}
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={() => { setPhase('bet'); setResult(null) }} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px', marginBottom: '12px' }}>
              🔄 Spin Again
            </button>
          ) : null}
          <BetPanel onBet={spin} disabled={spinning} />
        </div>
      </div>
    </div>
  )
}
