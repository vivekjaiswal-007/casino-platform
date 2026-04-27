import React, { useRef, useState, useEffect } from 'react'
import { useStore, api } from '../store/useStore'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

function BetControls({ phase, phaseRef, multRef, setBalance }) {
  const { balance } = useStore()
  const { logBet } = useBet()
  const [betAmt, setBetAmt] = useState(100)
  const [placed, setPlaced] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashMult, setCashMult] = useState(null)
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [autoTarget, setAutoTarget] = useState(2.0)
  const betRef = useRef(0)
  const autoCashRef = useRef(2.0)
  const placedRef = useRef(false)
  const cashedOutRef = useRef(false)
  const autoIntervalRef = useRef(null)

  useEffect(() => {
    if (phase === 'waiting') {
      setPlaced(false); setCashedOut(false); setCashMult(null)
      placedRef.current = false; cashedOutRef.current = false
      clearInterval(autoIntervalRef.current)
    }
    if (phase === 'flying' && autoEnabled && placedRef.current) {
      autoIntervalRef.current = setInterval(() => {
        if (phaseRef.current !== 'flying' || cashedOutRef.current) { clearInterval(autoIntervalRef.current); return }
        if (multRef.current >= autoTarget) { clearInterval(autoIntervalRef.current); doCashout() }
      }, 80)
    }
    return () => clearInterval(autoIntervalRef.current)
  }, [phase, autoEnabled, autoTarget])

  const placeBet = () => {
    if (phaseRef.current !== 'waiting') return toast.error('Wait for next round!')
    if (betAmt <= 0 || betAmt > balance) return toast.error('Invalid amount')
    setBalance(b => b - betAmt); betRef.current = betAmt
    setPlaced(true); placedRef.current = true; cashedOutRef.current = false; setCashedOut(false)
    toast.success(`Bet ₹${betAmt} placed!`)
  }

  const doCashout = () => {
    if (!placedRef.current || cashedOutRef.current || phaseRef.current !== 'flying') return
    const m = multRef.current; const win = Math.floor(betRef.current * m)
    setBalance(b => b + win); cashedOutRef.current = true; setCashedOut(true); setCashMult(m)
    sounds.cashout(); toast.success(`🚀 Cashed ${m.toFixed(2)}x! +${win} 🪙`)
    logBet('crash-rocket', betRef.current, win)
  }

  const canBet = !placed && phase === 'waiting' && betAmt > 0 && betAmt <= balance

  return (
    <div style={{ background: '#12121e', border: `1px solid ${placed && !cashedOut && phase === 'flying' ? 'rgba(0,255,136,0.4)' : '#1e1e2e'}`, borderRadius: '12px', padding: '14px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <input type="number" value={betAmt} onChange={e => !placed && setBetAmt(Math.max(1, Number(e.target.value)))}
          disabled={placed}
          style={{ flex: 1, padding: '9px', background: '#1e1e2e', border: '1px solid #2a2a3a', borderRadius: '7px', color: placed ? '#555' : 'white', fontSize: '15px', fontWeight: '700', textAlign: 'center', outline: 'none', minWidth: 0 }} />
        <button onClick={() => !placed && setBetAmt(a => Math.max(1, Math.floor(a/2)))} style={{ padding: '9px 10px', background: '#1e1e2e', border: '1px solid #2a2a3a', color: '#666', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>½</button>
        <button onClick={() => !placed && setBetAmt(a => Math.min(balance, a*2))} style={{ padding: '9px 10px', background: '#1e1e2e', border: '1px solid #2a2a3a', color: '#666', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>2x</button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
        {[50,100,500,1000].map(a => (
          <button key={a} onClick={() => !placed && setBetAmt(a)} style={{
            flex: 1, padding: '6px 2px', borderRadius: '5px', fontSize: '11px', fontWeight: '600',
            background: betAmt === a ? 'rgba(153,68,255,0.2)' : '#1e1e2e',
            border: `1px solid ${betAmt === a ? '#9944ff' : '#2a2a3a'}`,
            color: betAmt === a ? '#9944ff' : '#666', cursor: 'pointer'
          }}>{a >= 1000 ? `${a/1000}K` : a}</button>
        ))}
      </div>

      {/* Auto cashout */}
      <div style={{ marginBottom: '10px', background: 'rgba(153,68,255,0.06)', border: '1px solid rgba(153,68,255,0.18)', borderRadius: '8px', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: autoEnabled ? '8px' : '0' }}>
          <span style={{ color: '#9944ff', fontSize: '12px', fontWeight: '700' }}>⚡ Auto Cashout</span>
          <button onClick={() => setAutoEnabled(!autoEnabled)} style={{
            width: '40px', height: '20px', borderRadius: '10px', border: 'none',
            background: autoEnabled ? '#9944ff' : '#2a2a3a', cursor: 'pointer', position: 'relative', transition: 'background 0.3s'
          }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: autoEnabled ? '23px' : '3px', transition: 'left 0.3s' }} />
          </button>
        </div>
        {autoEnabled && (
          <>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
              {[1.5, 2, 3, 5, 10].map(m => (
                <button key={m} onClick={() => setAutoTarget(m)} style={{
                  flex: 1, minWidth: '30px', padding: '5px 2px', borderRadius: '5px', fontSize: '11px', fontWeight: '700',
                  background: autoTarget === m ? 'rgba(153,68,255,0.3)' : '#1e1e2e',
                  border: `1px solid ${autoTarget === m ? '#9944ff' : '#2a2a3a'}`,
                  color: autoTarget === m ? '#9944ff' : '#666', cursor: 'pointer'
                }}>{m}x</button>
              ))}
            </div>
            <input type="number" value={autoTarget} onChange={e => setAutoTarget(Math.max(1.01, Number(e.target.value)))}
              step="0.1" min="1.01"
              style={{ width: '100%', padding: '6px', background: '#1e1e2e', border: '1px solid #3a3a4a', borderRadius: '6px', color: '#9944ff', fontSize: '13px', fontWeight: '700', textAlign: 'center', outline: 'none' }} />
          </>
        )}
      </div>

      {!placed ? (
        <button onClick={placeBet} disabled={!canBet} style={{
          width: '100%', padding: '12px', border: 'none', borderRadius: '9px',
          background: canBet ? 'linear-gradient(135deg,#9944ff,#7722cc)' : 'rgba(153,68,255,0.15)',
          color: canBet ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: '800',
          cursor: canBet ? 'pointer' : 'not-allowed', textTransform: 'uppercase'
        }}>{phase === 'waiting' ? `🚀 Bet ${betAmt}` : 'Next Round'}</button>
      ) : cashedOut ? (
        <div style={{ padding: '11px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '9px', textAlign: 'center' }}>
          <div style={{ color: '#00ff88', fontWeight: '800' }}>✅ {cashMult?.toFixed(2)}x = +{Math.floor(betAmt * cashMult)} 🪙</div>
        </div>
      ) : phase === 'crashed' ? (
        <div style={{ padding: '11px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '9px', textAlign: 'center' }}>
          <div style={{ color: '#ff4444', fontWeight: '800' }}>💥 Lost {betAmt} 🪙</div>
        </div>
      ) : (
        <button onClick={doCashout} style={{
          width: '100%', padding: '12px', border: 'none', borderRadius: '9px',
          background: 'linear-gradient(135deg,#00d084,#00a866)', color: 'white',
          fontSize: '14px', fontWeight: '800', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,208,132,0.35)'
        }}>
          CASHOUT {autoEnabled ? `(Auto @${autoTarget}x)` : ''}<br/>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>= {Math.floor(betAmt * (multRef.current || 1))} 🪙</span>
        </button>
      )}
    </div>
  )
}

export default function CrashRocket() {
  const canvasRef = useRef(null)
  const gsRef = useRef({ maxMultiplier: 100, forcedCrashEnabled: false, forcedCrashAt: 0, enabled: true })
  useEffect(() => { api.get('/admin/game-settings/crashRocket').then(r => { if(r.data) gsRef.current = r.data }).catch(()=>{}) }, [])
  const { setBalance } = useStore()

  const [phase, setPhase] = useState('waiting')
  const [multiplier, setMultiplier] = useState(1.0)
  const [countdown, setCountdown] = useState(5)
  const [history, setHistory] = useState([1.42, 8.3, 0.99, 3.21, 15.5, 2.04, 0.98, 6.7])

  const multRef = useRef(1.0)
  const phaseRef = useRef('waiting')
  const crashPointRef = useRef(2.0)
  // gameSettings used in crash generation
  const startTimeRef = useRef(0)
  const countdownRef = useRef(5)
  const graphPtsRef = useRef([])

  const generateCrash = () => {
    const max = gsRef.current.maxMultiplier || 100
    const forced = gsRef.current.forcedCrashEnabled ? gsRef.current.forcedCrashAt : 0
    if (forced > 1) return Math.min(forced, max)
    const crash = Math.max(1.01, parseFloat((1 / (1 - Math.random() * 0.97)).toFixed(2)))
    return Math.min(crash, max)
  }

  useEffect(() => {
    let cdTimer, crashTimeout
    const reset = () => { phaseRef.current = 'waiting'; setPhase('waiting'); multRef.current = 1.0; setMultiplier(1.0); graphPtsRef.current = [] }
    const startCountdown = () => {
      reset(); let c = 5; countdownRef.current = c; setCountdown(c)
      cdTimer = setInterval(() => { c--; countdownRef.current = c; setCountdown(c); if (c <= 0) { clearInterval(cdTimer); startFlight() } }, 1000)
    }
    const startFlight = () => {
      crashPointRef.current = generateCrash(); startTimeRef.current = Date.now()
      phaseRef.current = 'flying'; setPhase('flying'); graphPtsRef.current = []
      const tick = () => {
        const el = (Date.now() - startTimeRef.current) / 1000
        const m = parseFloat((Math.pow(1.07, el * 8)).toFixed(2))
        multRef.current = m; setMultiplier(m)
        graphPtsRef.current.push({ t: el, m })
        if (graphPtsRef.current.length > 400) graphPtsRef.current.shift()
        if (m >= crashPointRef.current) {
          phaseRef.current = 'crashed'; setPhase('crashed'); multRef.current = crashPointRef.current; setMultiplier(crashPointRef.current)
          setHistory(h => [crashPointRef.current, ...h.slice(0, 19)])
          crashTimeout = setTimeout(startCountdown, 4500); return
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    startCountdown()
    return () => { clearInterval(cdTimer); clearTimeout(crashTimeout) }
  }, [])

  useEffect(() => {
    let raf
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) { raf = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#050510'); bg.addColorStop(1, '#0a0820')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < 80; i++) { const x=(i*61+3)%W,y=(i*43+7)%(H*0.9); ctx.fillStyle=`rgba(200,210,255,${0.1+0.15*Math.sin(Date.now()/900+i)})`; ctx.fillRect(x,y,1,1) }

      const ph = phaseRef.current, m = multRef.current, pts = graphPtsRef.current
      const PL=54,PB=38,PT=58,PR=18,gW=W-PL-PR,gH=H-PT-PB
      const maxM = Math.max(2, m * 1.15)
      const yTicks=[1,1.5,2,3,5,10,20,50,100]
      yTicks.forEach(tick => {
        if (tick > maxM*1.1) return
        const yy = PT+gH-(Math.log(Math.max(tick,1))/Math.log(Math.max(maxM,1.01)))*gH
        ctx.strokeStyle='rgba(100,100,180,0.1)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(PL,yy); ctx.lineTo(W-PR,yy); ctx.stroke()
        ctx.fillStyle='rgba(150,150,200,0.45)'; ctx.font='10px monospace'; ctx.textAlign='right'; ctx.fillText(`${tick}x`,PL-5,yy+3)
      })
      ctx.strokeStyle='rgba(100,100,200,0.2)'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(PL,H-PB); ctx.lineTo(W-PR,H-PB); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(PL,PT); ctx.lineTo(PL,H-PB); ctx.stroke()
      const totalT=pts.length>0?pts[pts.length-1].t:0
      const toC=(pt)=>({ x:PL+(pt.t/Math.max(totalT,0.01))*gW, y:PT+gH-(Math.log(Math.max(pt.m,1))/Math.log(Math.max(maxM,1.01)))*gH })

      if (pts.length > 1) {
        const lc = ph==='crashed'?'#ff4444':'#9944ff'
        ctx.beginPath(); const fp=toC(pts[0]); ctx.moveTo(fp.x,H-PB)
        pts.forEach(p => { const cp=toC(p); ctx.lineTo(cp.x,cp.y) })
        const lp=toC(pts[pts.length-1]); ctx.lineTo(lp.x,H-PB); ctx.closePath()
        const fg=ctx.createLinearGradient(0,PT,0,H-PB)
        fg.addColorStop(0,ph==='crashed'?'rgba(255,68,68,0.22)':'rgba(153,68,255,0.25)'); fg.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=fg; ctx.fill()
        ctx.beginPath(); pts.forEach((p,i)=>{const cp=toC(p);i===0?ctx.moveTo(cp.x,cp.y):ctx.lineTo(cp.x,cp.y)})
        ctx.strokeStyle=lc; ctx.lineWidth=2.5; ctx.shadowBlur=10; ctx.shadowColor=lc; ctx.stroke(); ctx.shadowBlur=0

        if (ph !== 'crashed') {
          const tip=toC(pts[pts.length-1]), prev=toC(pts[Math.max(0,pts.length-5)])
          const ang=Math.atan2(tip.y-prev.y,tip.x-prev.x)
          ctx.save(); ctx.translate(tip.x,tip.y); ctx.rotate(ang)
          // Rocket body
          ctx.fillStyle='#c9a227'; ctx.beginPath(); ctx.ellipse(0,0,11,5,0,0,Math.PI*2); ctx.fill()
          ctx.fillStyle='#f0c84a'; ctx.beginPath(); ctx.moveTo(11,0); ctx.lineTo(5,-4); ctx.lineTo(5,4); ctx.closePath(); ctx.fill()
          ctx.fillStyle='#ff8800'
          ctx.beginPath(); ctx.moveTo(-5,-5); ctx.lineTo(-12,-12); ctx.lineTo(-10,-5); ctx.closePath(); ctx.fill()
          ctx.beginPath(); ctx.moveTo(-5,5); ctx.lineTo(-12,12); ctx.lineTo(-10,5); ctx.closePath(); ctx.fill()
          const fLen=(12+Math.sin(Date.now()/40)*5); const fg2=ctx.createLinearGradient(-11,0,-11-fLen,0)
          fg2.addColorStop(0,'rgba(255,220,0,0.95)'); fg2.addColorStop(0.5,'rgba(255,80,0,0.7)'); fg2.addColorStop(1,'transparent')
          ctx.fillStyle=fg2; ctx.beginPath(); ctx.ellipse(-11-fLen/2,0,fLen/2,3,0,0,Math.PI*2); ctx.fill()
          ctx.restore()
          ctx.beginPath(); ctx.arc(tip.x,tip.y,3,0,Math.PI*2); ctx.fillStyle='#9944ff'; ctx.shadowBlur=10; ctx.shadowColor='#9944ff'; ctx.fill(); ctx.shadowBlur=0
        } else {
          const tip=toC(pts[pts.length-1])
          for(let sp=0;sp<16;sp++){const a=(sp/16)*Math.PI*2,d=18+Math.sin(Date.now()/60+sp)*10; ctx.beginPath(); ctx.arc(tip.x+Math.cos(a)*d,tip.y+Math.sin(a)*d,2.5,0,Math.PI*2); ctx.fillStyle=`hsl(${sp*22},100%,60%)`; ctx.shadowBlur=6; ctx.shadowColor=`hsl(${sp*22},100%,60%)`; ctx.fill(); ctx.shadowBlur=0}
        }
      }

      const col=ph==='crashed'?'#ff4444':m>=10?'#00ff88':m>=2?'#9944ff':'#ffffff'
      ctx.textAlign='center'; ctx.font='bold 38px "Courier New",monospace'; ctx.fillStyle=col; ctx.shadowBlur=20; ctx.shadowColor=col
      ctx.fillText(ph==='crashed'?`CRASHED ${m.toFixed(2)}x`:`${m.toFixed(2)}x`,W/2,50); ctx.shadowBlur=0
      if (ph==='waiting') { ctx.fillStyle='rgba(153,68,255,0.8)'; ctx.font='bold 15px Outfit'; ctx.fillText(`⏳ Next round in ${countdownRef.current}s`,W/2,50) }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (gsRef.current.enabled === false) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h2 style={{ color: '#ff4444', fontFamily: 'Cinzel,serif', marginBottom: '8px' }}>Game Disabled</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Crash Rocket is temporarily unavailable.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,26px)', marginBottom: '12px' }}>
        🚀 <span className="gold-text">Crash Rocket</span>
      </h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {history.map((h, i) => (
          <span key={i} style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', background: h < 2 ? 'rgba(255,68,68,0.18)' : 'rgba(153,68,255,0.18)', color: h < 2 ? '#ff5555' : '#9955ff', border: `1px solid ${h < 2 ? 'rgba(255,68,68,0.3)' : 'rgba(153,68,255,0.3)'}` }}>{Number(h).toFixed(2)}x</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          <canvas ref={canvasRef} width={700} height={420} style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(100,100,200,0.2)', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: 'clamp(240px,28vw,280px)', flexShrink: 0 }}>
          <BetControls phase={phase} phaseRef={phaseRef} multRef={multRef} setBalance={setBalance} />
          <BetControls phase={phase} phaseRef={phaseRef} multRef={multRef} setBalance={setBalance} />
        </div>
      </div>
    </div>
  )
}
