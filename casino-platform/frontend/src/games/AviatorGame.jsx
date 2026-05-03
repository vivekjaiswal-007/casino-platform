import React, { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '../store/useStore'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

const generateCrash = (maxMult = 100, forcedCrash = 0) => {
  if (forcedCrash > 1) return Math.min(forcedCrash, maxMult)
  const r = Math.random()
  let crash
  if (r < 0.05) crash = 1.0
  else if (r < 0.40) crash = 1.0 + Math.random() * 0.8
  else if (r < 0.68) crash = 1.8 + Math.random() * 1.5
  else if (r < 0.85) crash = 3.3 + Math.random() * 3.7
  else if (r < 0.94) crash = 7 + Math.random() * 13
  else crash = 20 + Math.random() * 80
  return Math.min(parseFloat(crash.toFixed(2)), maxMult)
}

function AviatorBetPanel({ panelId, phase, phaseRef, multRef, setBalance, balance }) {
  const { logBet } = useBet()
  const [tab, setTab] = useState('Bet')
  const [amount, setAmount] = useState(100)
  const [placed, setPlaced] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashMult, setCashMult] = useState(null)
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [autoCashAt, setAutoCashAt] = useState(2.0)
  const betRef = useRef(0)
  const placedRef = useRef(false)
  const cashedRef = useRef(false)
  const autoRef = useRef(null)

  useEffect(() => {
    if (tab !== 'Auto' || !autoEnabled || !placedRef.current || cashedRef.current) return
    if (phaseRef.current !== 'flying') return
    autoRef.current = setInterval(() => {
      if (!placedRef.current || cashedRef.current || phaseRef.current !== 'flying') { clearInterval(autoRef.current); return }
      if (multRef.current >= autoCashAt) { doCashout(); clearInterval(autoRef.current) }
    }, 80)
    return () => clearInterval(autoRef.current)
  }, [tab, autoEnabled, phase, autoCashAt])

  useEffect(() => {
    if (phase === 'waiting') {
      setPlaced(false); setCashedOut(false); setCashMult(null)
      placedRef.current = false; cashedRef.current = false
      clearInterval(autoRef.current)
      if (tab === 'Auto' && autoEnabled) {
        setTimeout(() => { if (phaseRef.current === 'waiting') doPlaceBet() }, 150)
      }
    }
    if (phase === 'crashed') {
      clearInterval(autoRef.current)
      if (placedRef.current && !cashedRef.current) {
        sounds.loss(); logBet('aviator', betRef.current, 0)
      }
    }
  }, [phase])

  const doPlaceBet = useCallback(() => {
    if (phaseRef.current !== 'waiting') return
    if (amount <= 0 || amount > balance) return toast.error('Invalid bet')
    setBalance(b => b - amount)
    betRef.current = amount
    placedRef.current = true; cashedRef.current = false
    setPlaced(true); setCashedOut(false); setCashMult(null)
    sounds.betPlace()
  }, [amount, balance])

  const doCashout = useCallback(() => {
    if (!placedRef.current || cashedRef.current || phaseRef.current !== 'flying') return
    const m = multRef.current
    const win = Math.floor(betRef.current * m)
    setBalance(b => b + win)
    cashedRef.current = true
    setCashedOut(true); setCashMult(m)
    sounds.cashout()
    toast.success(`✈️ Cashed ${m.toFixed(2)}x! +${win} 🪙`)
    logBet('aviator', betRef.current, win)
  }, [])

  const liveWin = placed && !cashedOut && phase === 'flying'
    ? Math.floor(amount * (multRef.current || 1)) : null
  const canBet = !placed && phase === 'waiting' && amount > 0 && amount <= balance

  const IS = { background: '#1e1e2e', border: '1px solid #2a2a42', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '700', outline: 'none', textAlign: 'center', padding: '8px' }

  return (
    <div style={{ background: '#13131f', borderRadius: '14px', border: '1px solid #1e1e32', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', background: '#0a0a15', padding: '6px', gap: '4px' }}>
        {['Bet', 'Auto'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '8px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', background: tab === t ? '#1e1e2e' : 'transparent', color: tab === t ? 'white' : '#444', transition: 'all 0.2s' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 12px 14px' }}>
        {/* Amount */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
          <button onClick={() => !placed && setAmount(a => Math.max(10, Math.floor(a / 2)))} disabled={placed}
            style={{ ...IS, width: '36px', height: '36px', padding: 0, borderRadius: '50%', flexShrink: 0, opacity: placed ? 0.4 : 1, cursor: placed ? 'not-allowed' : 'pointer', fontSize: '20px' }}>−</button>
          <input type="number" value={amount} onChange={e => !placed && setAmount(Math.max(1, Number(e.target.value)))} disabled={placed}
            style={{ ...IS, flex: 1, opacity: placed ? 0.6 : 1, fontSize: '18px' }} />
          <button onClick={() => !placed && setAmount(a => Math.min(balance, a * 2))} disabled={placed}
            style={{ ...IS, width: '36px', height: '36px', padding: 0, borderRadius: '50%', flexShrink: 0, opacity: placed ? 0.4 : 1, cursor: placed ? 'not-allowed' : 'pointer', fontSize: '14px' }}>+</button>
        </div>

        {/* Quick amounts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '5px', marginBottom: '5px' }}>
          {[100, 200, 500, 1000].map(a => (
            <button key={a} onClick={() => !placed && setAmount(a)} disabled={placed}
              style={{ padding: '6px 2px', borderRadius: '7px', border: `1px solid ${amount === a ? '#3a3a5e' : '#1e1e2e'}`, background: amount === a ? '#2a2a3e' : '#1a1a2a', color: amount === a ? 'white' : '#555', fontSize: '12px', fontWeight: '700', cursor: placed ? 'not-allowed' : 'pointer', opacity: placed ? 0.5 : 1 }}>
              {a >= 1000 ? `${a/1000}K` : a}
            </button>
          ))}
        </div>
        {/* Quick amounts row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '5px', marginBottom: '10px' }}>
          {[2000, 5000, 10000, 50000].map(a => (
            <button key={a} onClick={() => !placed && setAmount(a)} disabled={placed}
              style={{ padding: '6px 2px', borderRadius: '7px', border: `1px solid ${amount === a ? '#3a3a5e' : '#1e1e2e'}`, background: amount === a ? '#2a2a3e' : '#1a1a2a', color: amount === a ? 'white' : '#555', fontSize: '11px', fontWeight: '700', cursor: placed ? 'not-allowed' : 'pointer', opacity: placed ? 0.5 : 1 }}>
              {a >= 1000 ? `${a/1000}K` : a}
            </button>
          ))}
        </div>

        {/* Auto tab settings */}
        {tab === 'Auto' && (
          <div style={{ marginBottom: '10px', background: '#0a0a15', borderRadius: '10px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#777', fontSize: '12px', fontWeight: '600' }}>Auto cashout at</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="number" value={autoCashAt} onChange={e => setAutoCashAt(Math.max(1.01, Number(e.target.value)))} step="0.1" min="1.01"
                  style={{ ...IS, width: '70px', fontSize: '14px', border: '1px solid #3a3a5e' }} />
                <span style={{ color: '#00d084', fontWeight: '900' }}>x</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {[1.5, 2, 3, 5, 10, 20].map(m => (
                <button key={m} onClick={() => setAutoCashAt(m)}
                  style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: autoCashAt === m ? 'rgba(153,68,255,0.3)' : '#1a1a2a', border: `1px solid ${autoCashAt === m ? '#9944ff' : '#2a2a3a'}`, color: autoCashAt === m ? '#9944ff' : '#555' }}>
                  {m}x
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '12px' }}>Enable Auto Bet</span>
              <button onClick={() => setAutoEnabled(!autoEnabled)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: autoEnabled ? '#00d084' : '#2a2a3e', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: autoEnabled ? '23px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!placed ? (
          <button onClick={doPlaceBet} disabled={!canBet}
            style={{ width: '100%', padding: '14px 10px', border: 'none', borderRadius: '12px', background: canBet ? 'linear-gradient(180deg,#2ade7c,#16aa55)' : '#1a2a1a', color: canBet ? 'white' : '#2a4a2a', fontSize: '16px', fontWeight: '900', cursor: canBet ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: canBet ? '0 4px 16px rgba(42,222,124,0.3)' : 'none' }}>
            <div>Bet</div>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>{amount.toLocaleString()} 🪙</div>
          </button>
        ) : cashedOut ? (
          <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.3)', textAlign: 'center' }}>
            <div style={{ color: '#00d084', fontWeight: '800', fontSize: '16px' }}>✅ {cashMult?.toFixed(2)}x</div>
            <div style={{ color: '#00a866', fontSize: '12px' }}>+{Math.floor(amount * (cashMult||1)).toLocaleString()} 🪙</div>
          </div>
        ) : phase === 'crashed' ? (
          <div style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', textAlign: 'center' }}>
            <div style={{ color: '#ff5555', fontWeight: '800', fontSize: '15px' }}>💥 Lost</div>
            <div style={{ color: '#cc4444', fontSize: '12px' }}>{amount.toLocaleString()} 🪙</div>
          </div>
        ) : (
          <button onClick={doCashout}
            style={{ width: '100%', padding: liveWin ? '10px 10px' : '14px 10px', border: 'none', borderRadius: '12px', background: 'linear-gradient(180deg,#f5b830,#c9870a)', color: '#0a0800', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,184,48,0.4)', animation: 'avPulse 0.9s ease infinite' }}>
            <div>CASH OUT</div>
            {liveWin && <div style={{ fontSize: '13px', opacity: 0.85 }}>{liveWin.toLocaleString()} 🪙</div>}
          </button>
        )}
      </div>
    </div>
  )
}

export default function AviatorGame() {
  const canvasRef = useRef(null)
  const { balance, setBalance } = useStore()
  const gameSettingsRef = useRef({ maxMultiplier: 100, forcedCrashEnabled: false, forcedCrashAt: 0, enabled: true })
  useEffect(() => { api.get('/admin/game-settings/aviator').then(r => { if(r.data) gameSettingsRef.current = r.data }).catch(()=>{}) }, [])
  const [phase, setPhase] = useState('waiting')
  const [multiplier, setMultiplier] = useState(1.0)
  const [countdown, setCountdown] = useState(5)
  const [history, setHistory] = useState([3.21, 1.45, 7.82, 0.98, 12.5, 2.34, 1.01, 5.67])
  const phaseRef = useRef('waiting')
  const multRef = useRef(1.0)
  const crashPointRef = useRef(2.0)
  const startTimeRef = useRef(0)
  const countdownRef = useRef(5)
  const graphPtsRef = useRef([])

  useEffect(() => {
    let cdTimer, crashTimeout

    const reset = () => {
      phaseRef.current = 'waiting'; setPhase('waiting')
      multRef.current = 1.0; setMultiplier(1.0)
      graphPtsRef.current = []
    }

    const startCountdown = () => {
      reset()
      let c = 5; countdownRef.current = c; setCountdown(c)
      cdTimer = setInterval(() => {
        c--; countdownRef.current = c; setCountdown(c)
        if (c <= 3) sounds.tickFinal(); else sounds.tick()
        if (c <= 0) { clearInterval(cdTimer); startFlight() }
      }, 1000)
    }

    const startFlight = () => {
      crashPointRef.current = generateCrash(gameSettingsRef.current.maxMultiplier || 100, gameSettingsRef.current.forcedCrashEnabled ? gameSettingsRef.current.forcedCrashAt : 0)
      startTimeRef.current = Date.now()
      phaseRef.current = 'flying'; setPhase('flying')
      graphPtsRef.current = []
      sounds.planeFly()
      const tick = () => {
        const el = (Date.now() - startTimeRef.current) / 1000
        const m = parseFloat((Math.pow(Math.E, el * 0.09) + el * 0.03).toFixed(2))
        multRef.current = m; setMultiplier(m)
        if (Math.floor(m * 2) !== Math.floor((m - 0.01) * 2)) sounds.multRise(m)
        graphPtsRef.current.push({ t: el, m })
        if (graphPtsRef.current.length > 400) graphPtsRef.current.shift()
        if (m >= crashPointRef.current) {
          phaseRef.current = 'crashed'; setPhase('crashed')
          multRef.current = crashPointRef.current; setMultiplier(crashPointRef.current)
          setHistory(h => [crashPointRef.current, ...h.slice(0, 19)])
          sounds.crash()
          crashTimeout = setTimeout(startCountdown, 4000)
          return
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

      // Background — dark purple like reference
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#180830'); bg.addColorStop(1, '#0d0818')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Light rays
      const t = Date.now()
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + 0.5
        ctx.save(); ctx.translate(W * 0.2, H)
        ctx.rotate(ang - Math.PI * 0.7)
        const rG = ctx.createLinearGradient(0, 0, 0, -H * 1.5)
        rG.addColorStop(0, 'rgba(80,20,160,0.08)'); rG.addColorStop(1, 'transparent')
        ctx.fillStyle = rG
        ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.lineTo(8, -H * 1.5); ctx.lineTo(-8, -H * 1.5); ctx.closePath()
        ctx.fill(); ctx.restore()
      }

      // Stars
      for (let i = 0; i < 60; i++) {
        const x = (i * 79 + 17) % W; const y = (i * 47 + 13) % (H * 0.8)
        const tw = 0.08 + 0.12 * Math.sin(t / (700 + i * 40) + i)
        ctx.fillStyle = `rgba(200,180,255,${tw})`; ctx.fillRect(x, y, 1.3, 1.3)
      }

      const ph = phaseRef.current, m = multRef.current, pts = graphPtsRef.current
      const PL = 8, PB = 28, PT = 15, PR = 8
      const gW = W - PL - PR, gH = H - PT - PB
      const maxM = Math.max(2, m * 1.2)
      const totalT = pts.length > 0 ? pts[pts.length - 1].t : 1

      const toC = pt => ({
        x: PL + (pt.t / Math.max(totalT, 0.01)) * gW,
        y: PT + gH - (Math.log(Math.max(pt.m, 1)) / Math.log(Math.max(maxM, 1.01))) * gH
      })

      if (pts.length > 1) {
        const lc = ph === 'crashed' ? '#ff4444' : '#dd2233'
        // Fill
        ctx.beginPath()
        ctx.moveTo(toC(pts[0]).x, H - PB)
        pts.forEach(p => { const c = toC(p); ctx.lineTo(c.x, c.y) })
        const lp = toC(pts[pts.length-1]); ctx.lineTo(lp.x, H - PB); ctx.closePath()
        const fG = ctx.createLinearGradient(0, PT, 0, H - PB)
        fG.addColorStop(0, ph === 'crashed' ? 'rgba(255,68,68,0.35)' : 'rgba(220,34,51,0.35)')
        fG.addColorStop(1, 'rgba(0,0,0,0.01)')
        ctx.fillStyle = fG; ctx.fill()

        // Line
        ctx.beginPath()
        pts.forEach((p, i) => { const c = toC(p); i===0 ? ctx.moveTo(c.x,c.y) : ctx.lineTo(c.x,c.y) })
        ctx.strokeStyle = lc; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'
        ctx.shadowBlur = 10; ctx.shadowColor = lc; ctx.stroke(); ctx.shadowBlur = 0

        // Red plane
        if (ph === 'flying' && pts.length > 3) {
          const lp2 = toC(pts[pts.length-1])
          const pp = toC(pts[Math.max(0, pts.length-8)])
          const ang = Math.atan2(lp2.y - pp.y, lp2.x - pp.x)
          const sc = 1.3
          ctx.save(); ctx.translate(lp2.x, lp2.y); ctx.rotate(ang)

          // Smoke
          for (let ci = 3; ci >= 0; ci--) {
            ctx.beginPath(); ctx.arc((-18-ci*9)*sc, Math.sin(ci*1.4)*2*sc, (4-ci*0.5)*sc, 0, Math.PI*2)
            ctx.fillStyle = `rgba(180,180,220,${(1-ci/4)*0.15})`; ctx.fill()
          }
          // Body
          ctx.fillStyle = '#cc1122'
          ctx.beginPath()
          ctx.moveTo(24*sc, 0); ctx.bezierCurveTo(18*sc,-4*sc,4*sc,-6*sc,-14*sc,-4*sc)
          ctx.lineTo(-18*sc,-2*sc); ctx.lineTo(-18*sc,2*sc); ctx.lineTo(-14*sc,4*sc)
          ctx.bezierCurveTo(4*sc,6*sc,18*sc,4*sc,24*sc,0); ctx.fill()
          // Wing
          ctx.fillStyle = '#aa0011'
          ctx.beginPath(); ctx.moveTo(5*sc,-4*sc); ctx.lineTo(-5*sc,-18*sc); ctx.lineTo(-14*sc,-14*sc); ctx.lineTo(-11*sc,-4*sc); ctx.closePath(); ctx.fill()
          // Propeller
          const pa = t/60
          ctx.save(); ctx.translate(24*sc, 0); ctx.rotate(pa)
          ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2.5
          ctx.beginPath(); ctx.moveTo(0,-9*sc); ctx.lineTo(0,9*sc); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(-9*sc,0); ctx.lineTo(9*sc,0); ctx.stroke()
          ctx.restore()
          ctx.restore()
        }
      }

      // Multiplier text
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      if (ph === 'flying') {
        const fs = Math.min(W * 0.14, 56)
        ctx.font = `900 ${fs}px Arial,sans-serif`
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = 24; ctx.shadowColor = 'rgba(255,255,255,0.3)'
        ctx.fillText(`${m.toFixed(2)}x`, W/2, H*0.4)
        ctx.shadowBlur = 0
      } else if (ph === 'crashed') {
        ctx.font = `900 ${Math.min(W*0.09,34)}px Arial,sans-serif`
        ctx.fillStyle = '#ff4444'
        ctx.fillText('FLEW AWAY @', W/2, H*0.32)
        ctx.font = `900 ${Math.min(W*0.13,50)}px Arial,sans-serif`
        ctx.shadowBlur = 16; ctx.shadowColor = '#ff2222'
        ctx.fillText(`${m.toFixed(2)}x`, W/2, H*0.52)
        ctx.shadowBlur = 0
      } else {
        ctx.font = `700 ${Math.min(W*0.055,18)}px Arial,sans-serif`
        ctx.fillStyle = 'rgba(180,160,220,0.6)'
        ctx.fillText('Waiting for next round...', W/2, H*0.38)
        ctx.font = `900 ${Math.min(W*0.12,44)}px Arial,sans-serif`
        ctx.fillStyle = '#c9a227'
        ctx.shadowBlur = 12; ctx.shadowColor = '#c9a227'
        ctx.fillText(`${countdown}`, W/2, H*0.55)
        ctx.shadowBlur = 0
        ctx.font = `${Math.min(W*0.04,13)}px Arial,sans-serif`
        ctx.fillStyle = 'rgba(140,130,170,0.45)'
        ctx.fillText('Place your bets!', W/2, H*0.67)
      }

      ctx.strokeStyle = 'rgba(100,60,180,0.25)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(PL, H-PB); ctx.lineTo(W-PR, H-PB); ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (gameSettingsRef.current.enabled === false) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h2 style={{ color: '#ff4444', fontFamily: 'Cinzel,serif', marginBottom: '8px' }}>Game Disabled</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Aviator is temporarily unavailable.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', background: '#0d0d18', fontFamily: "'Outfit',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px 4px' }}>
        <span style={{ fontFamily: 'Cinzel,serif', fontSize: '22px', fontWeight: '900', color: '#ff3344', textShadow: '0 0 14px rgba(255,50,60,0.5)' }}>✈ Aviator</span>
        <span style={{ color: '#00d084', fontWeight: '800', fontSize: '15px' }}>🪙 {balance?.toLocaleString()}</span>
      </div>

      {/* History bar */}
      <div style={{ display: 'flex', gap: '5px', padding: '4px 14px 8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {history.slice(0,10).map((h,i) => (
          <span key={i} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0, background: h < 2 ? 'rgba(255,68,68,0.2)' : h < 10 ? 'rgba(80,180,80,0.15)' : 'rgba(201,162,39,0.2)', color: h < 2 ? '#ff6666' : h < 10 ? '#66cc66' : '#c9a227', border: `1px solid ${h < 2 ? 'rgba(255,68,68,0.3)' : h < 10 ? 'rgba(80,180,80,0.25)' : 'rgba(201,162,39,0.3)'}` }}>
            {Number(h).toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ padding: '0 8px 8px' }}>
        <canvas ref={canvasRef} width={544} height={300}
          style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
      </div>

      {/* Bet Panels */}
      <div style={{ padding: '0 8px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AviatorBetPanel panelId={1} phase={phase} phaseRef={phaseRef} multRef={multRef} setBalance={setBalance} balance={balance} />
        <AviatorBetPanel panelId={2} phase={phase} phaseRef={phaseRef} multRef={multRef} setBalance={setBalance} balance={balance} />
      </div>
      <style>{`@keyframes avPulse{0%,100%{box-shadow:0 4px 20px rgba(245,184,48,0.4)}50%{box-shadow:0 4px 32px rgba(245,184,48,0.75)}}`}</style>
    </div>
  )
}
