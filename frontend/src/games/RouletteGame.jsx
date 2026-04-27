import LiveRoundBar from '../components/LiveRoundBar'
import AIDealer from '../components/AIDealer'
import React, { useRef, useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

const NUMBERS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]
const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
const getColor = n => n === 0 ? '#00a838' : RED.includes(n) ? '#cc2222' : '#111111'
const W = 420, H = 420, CX = 210, CY = 210, R = 178

export default function RouletteGame() {
  const [dealerPhase, setDealerPhase] = React.useState('idle')
  const [roundPhase, setRoundPhase] = React.useState('betting')
  const [countdown, setCountdown] = React.useState(15)
  const [roundId, setRoundId] = React.useState(Math.floor(Math.random()*90000)+10000)
  const lcdRef = React.useRef(15), lPhaseRef = React.useRef('betting')
  React.useEffect(() => {
    const tick = () => {
      if(lPhaseRef.current==='betting'){
        lcdRef.current--; setCountdown(lcdRef.current)
        if(lcdRef.current<=3&&lcdRef.current>0)sounds.tickFinal()
        if(lcdRef.current<=0){lPhaseRef.current='locked';setRoundPhase('locked');lcdRef.current=1}
      } else if(lPhaseRef.current==='locked'){
        lcdRef.current--
        if(lcdRef.current<=0){lPhaseRef.current='result';setRoundPhase('result');lcdRef.current=7}
      } else if(lPhaseRef.current==='result'){
        lcdRef.current--
        if(lcdRef.current<=0){lPhaseRef.current='next';setRoundPhase('next');lcdRef.current=2}
      } else if(lPhaseRef.current==='next'){
        lcdRef.current--
        if(lcdRef.current<=0){lPhaseRef.current='betting';setRoundPhase('betting');lcdRef.current=15;setCountdown(15);setRoundId(r=>r+1);sounds.tick()}
      }
    }
    const iv=setInterval(tick,1000); return ()=>clearInterval(iv)
  }, [])
  const canvasRef = useRef(null)
  const wheelAngleRef = useRef(0)
  const ballRef = useRef({ angle: 0, radius: 168, speed: 0.15, decelerating: false })
  const spinningRef = useRef(false)
  const { setBalance } = useStore()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [bets, setBets] = useState({})
  const [chipValue, setChipValue] = useState(50)
  const betsRef = useRef({})

  // Keep betsRef in sync
  useEffect(() => { betsRef.current = bets }, [bets])

  const resolveResult = (winNum) => {
    spinningRef.current = false
    setSpinning(false)
    setResult(winNum)

    const isRed = RED.includes(winNum)
    const isBlack = !RED.includes(winNum) && winNum !== 0
    const isEven = winNum > 0 && winNum % 2 === 0
    const isLow = winNum >= 1 && winNum <= 18
    const isHigh = winNum >= 19 && winNum <= 36

    let win = 0
    Object.entries(betsRef.current).forEach(([key, amt]) => {
      if (!amt) return
      if (key === `n${winNum}`) win += amt * 36
      if (key === 'red' && isRed) win += amt * 2
      if (key === 'black' && isBlack) win += amt * 2
      if (key === 'even' && isEven) win += amt * 2
      if (key === 'odd' && !isEven && winNum > 0) win += amt * 2
      if (key === '1-18' && isLow) win += amt * 2
      if (key === '19-36' && isHigh) win += amt * 2
    })

    if (win > 0) {
      setBalance(b => b + win)
      toast.success(`🎡 ${winNum} (${isRed?'Red':isBlack?'Black':'Green'}) — Won ${win} coins!`)
    } else {
      toast.error(`${winNum} — No win this round`)
    }
    setBets({})
  }

  useEffect(() => {
    let raf
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) { raf = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)

      const sliceAngle = (Math.PI * 2) / NUMBERS.length
      wheelAngleRef.current += 0.005

      // Outer gold rim
      const rimG = ctx.createLinearGradient(CX-R-12, CY, CX+R+12, CY)
      rimG.addColorStop(0, '#9a7a10'); rimG.addColorStop(0.5, '#f0c84a'); rimG.addColorStop(1, '#9a7a10')
      ctx.beginPath(); ctx.arc(CX, CY, R + 10, 0, Math.PI*2)
      ctx.fillStyle = rimG; ctx.fill()

      // Segments
      NUMBERS.forEach((num, i) => {
        const start = wheelAngleRef.current + i * sliceAngle - Math.PI/2
        const end = start + sliceAngle
        ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R, start, end); ctx.closePath()
        ctx.fillStyle = getColor(num); ctx.fill()
        ctx.strokeStyle = 'rgba(201,162,39,0.25)'; ctx.lineWidth = 0.5; ctx.stroke()

        const mid = start + sliceAngle/2
        const tx = CX + R * 0.76 * Math.cos(mid), ty = CY + R * 0.76 * Math.sin(mid)
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(mid + Math.PI/2)
        ctx.font = 'bold 8px Outfit'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(String(num), 0, 0); ctx.restore()
      })

      // Inner circle
      const innerG = ctx.createRadialGradient(CX, CY, 0, CX, CY, 88)
      innerG.addColorStop(0, '#1a1a2e'); innerG.addColorStop(0.8, '#0d0d1a'); innerG.addColorStop(1, '#c9a227')
      ctx.beginPath(); ctx.arc(CX, CY, 88, 0, Math.PI*2); ctx.fillStyle = innerG; ctx.fill()
      ctx.font = 'bold 22px Cinzel'; ctx.fillStyle = '#c9a227'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('♠', CX, CY)

      // Ball physics
      const ball = ballRef.current
      if (spinningRef.current) {
        if (ball.decelerating) {
          ball.speed = Math.max(0, ball.speed * 0.993)
          ball.radius = Math.min(168, ball.radius + 0.25)
          if (ball.speed < 0.008) {
            const norm = ((-(ball.angle - wheelAngleRef.current) % (Math.PI*2)) + Math.PI*2) % (Math.PI*2)
            const idx = Math.floor(norm / sliceAngle) % NUMBERS.length
            resolveResult(NUMBERS[idx])
          }
        }
        ball.angle -= ball.speed
      }

      const bx = CX + ball.radius * Math.cos(ball.angle)
      const by = CY + ball.radius * Math.sin(ball.angle)
      ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI*2)
      const bg2 = ctx.createRadialGradient(bx-2, by-2, 1, bx, by, 8)
      bg2.addColorStop(0, 'white'); bg2.addColorStop(1, '#cccccc')
      ctx.fillStyle = bg2; ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(255,255,255,0.7)'; ctx.fill(); ctx.shadowBlur = 0

      // Pointer
      ctx.beginPath()
      ctx.moveTo(CX-8, CY-R-12); ctx.lineTo(CX+8, CY-R-12); ctx.lineTo(CX, CY-R+6); ctx.closePath()
      ctx.fillStyle = '#ff4444'; ctx.fill()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const spin = () => {
    if (spinningRef.current) return
    const totalBet = Object.values(bets).reduce((a, b) => a + (b||0), 0)
    if (totalBet === 0) return toast.error('Place a bet first!')
    setBalance(b => b - totalBet)
    setResult(null)
    ballRef.current.radius = 168
    ballRef.current.speed = 0.22 + Math.random() * 0.08
    ballRef.current.decelerating = false
    spinningRef.current = true
    sounds.rouletteSpin(); setSpinning(true)
    setTimeout(() => { ballRef.current.decelerating = true }, 3000 + Math.random() * 2000)
  }

  const placeBet = (key) => {
    setBets(prev => ({ ...prev, [key]: (prev[key] || 0) + chipValue }))
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <LiveRoundBar phase={roundPhase} countdown={countdown} roundId={roundId} color="#00d084" />
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', marginBottom: '20px' }}>
        🎡 <span className="gold-text">Roulette</span>
      </h1>
      <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}>
        <AIDealer phase={dealerPhase} compact={true} />
      </div>
      <div className="game-layout">
        <div>
          <canvas ref={canvasRef} width={W} height={H} style={{
            width: '100%', borderRadius: '50%', display: 'block',
            boxShadow: spinning ? '0 0 40px rgba(201,162,39,0.4)' : '0 8px 40px rgba(0,0,0,0.5)'
          }} />
          {result !== null && (
            <div style={{
              marginTop: '16px', textAlign: 'center', padding: '14px', borderRadius: '12px',
              background: `${getColor(result)}25`, border: `2px solid ${getColor(result)}60`
            }}>
              <div style={{ fontSize: '38px', fontWeight: '900', color: getColor(result) }}>{result}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                {RED.includes(result) ? 'Red' : result === 0 ? 'Green' : 'Black'}
                {result > 0 ? (result % 2 === 0 ? ' • Even' : ' • Odd') : ''}
                {result >= 1 && result <= 18 ? ' • 1–18' : result >= 19 ? ' • 19–36' : ''}
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chip Value</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[10, 50, 100, 500].map(v => (
                <button key={v} onClick={() => setChipValue(v)} style={{
                  padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px',
                  background: chipValue === v ? 'rgba(201,162,39,0.2)' : 'var(--bg-hover)',
                  border: `1px solid ${chipValue === v ? 'var(--gold)' : 'var(--border)'}`,
                  color: chipValue === v ? 'var(--gold)' : 'var(--text-secondary)', cursor: 'pointer'
                }}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            {[
              { key:'red', label:'🔴 Red', color:'#cc2222' },
              { key:'black', label:'⚫ Black', color:'#555' },
              { key:'even', label:'Even', color:'#4488ff' },
              { key:'odd', label:'Odd', color:'#9944ff' },
              { key:'1-18', label:'1–18 Low', color:'#00d084' },
              { key:'19-36', label:'19–36 High', color:'#ff9900' },
            ].map(({ key, label, color }) => (
              <button key={key} onClick={() => placeBet(key)} style={{
                padding: '12px 8px', borderRadius: '8px', fontWeight: '700', fontSize: '13px',
                background: bets[key] ? `${color}25` : 'var(--bg-card)',
                border: `1px solid ${bets[key] ? color : 'var(--border)'}`,
                color: bets[key] ? color : 'var(--text-secondary)', cursor: 'pointer', position: 'relative'
              }}>
                {label} — 2x
                {bets[key] > 0 && <span style={{ position:'absolute', top:'-6px', right:'-6px', background: color, color:'white', borderRadius:'10px', fontSize:'10px', padding:'1px 5px', fontWeight:'800' }}>{bets[key]}</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '4px', marginBottom: '14px' }}>
            {Array(37).fill(null).map((_, n) => (
              <button key={n} onClick={() => placeBet(`n${n}`)} style={{
                padding: '6px 2px', borderRadius: '4px', fontWeight: '800', fontSize: '11px',
                background: bets[`n${n}`] ? `${getColor(n)}80` : getColor(n),
                border: `1px solid ${bets[`n${n}`] ? '#f0c84a' : 'transparent'}`,
                color: 'white', cursor: 'pointer'
              }}>{n}</button>
            ))}
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'10px' }}>
            <span style={{ color:'var(--text-secondary)' }}>Total Bet:</span>
            <span style={{ color:'var(--gold)', fontWeight:'700' }}>
              {Object.values(bets).reduce((a,b)=>a+(b||0),0)} 🪙
            </span>
          </div>

          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={spin} disabled={spinning} style={{
              flex:1, padding:'14px', borderRadius:'10px', fontWeight:'800', fontSize:'15px',
              background: spinning ? 'rgba(201,162,39,0.3)' : 'linear-gradient(135deg,#c9a227,#f0c84a)',
              border:'none', color: spinning ? 'rgba(0,0,0,0.4)' : '#0a0a0f', cursor: spinning ? 'not-allowed' : 'pointer',
              textTransform:'uppercase', letterSpacing:'1px'
            }}>{spinning ? 'Spinning...' : '🎡 Spin'}</button>
            <button onClick={() => setBets({})} style={{
              padding:'14px 18px', borderRadius:'10px', background:'var(--bg-hover)',
              border:'1px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer'
            }}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  )
}
