import React, { useState, useRef, useEffect } from 'react'
import { useStore, api } from '../store/useStore'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

function genCrash(max, forced) {
  if (forced > 1.0) return parseFloat(Math.min(forced, max).toFixed(2))
  const r = Math.random()
  let c
  if      (r < 0.06) c = 1.00 + Math.random() * 0.15
  else if (r < 0.36) c = 1.15 + Math.random() * 0.85
  else if (r < 0.60) c = 2.00 + Math.random() * 1.50
  else if (r < 0.76) c = 3.50 + Math.random() * 3.00
  else if (r < 0.88) c = 6.50 + Math.random() * 8.50
  else if (r < 0.96) c = 15.0 + Math.random() * 20.0
  else               c = 35.0 + Math.random() * 65.0
  return parseFloat(Math.min(c, max).toFixed(2))
}

export default function CrashBall() {
  const storeRef = useRef(useStore.getState())
  useEffect(() => useStore.subscribe(s => { storeRef.current = s }), [])
  const { logBet } = useBet()
  const canvasRef = useRef(null)

  // ALL mutable game state lives here - never in React state for game logic
  const G = useRef({
    phase: 'waiting',   // waiting | playing | crashed | cashed
    mult: 1.00,
    crashAt: 2.00,
    countdown: 5,
    placed: false,
    cashedOut: false,
    betAmt: 0,
    autoCashAt: 2.00,
    autoEnabled: false,
    trail: [],
    ballX: 80, ballY: 280,
    settings: { maxMultiplier: 100, forcedCrashEnabled: false, forcedCrashAt: 0 },
    _interval: null,
    _cdTimer: null,
  })

  // React display state - only for UI rendering
  const [ui, setUi] = useState({
    phase: 'waiting', mult: '1.00', countdown: 5,
    placed: false, cashed: false, liveWin: 0
  })
  const [betAmt, setBetAmt] = useState(100)
  const [tab, setTab] = useState('Manual')
  const [autoCashAt, setAutoCashAt] = useState(2.0)
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [history, setHistory] = useState([2.31, 1.45, 5.44, 1.08, 12.3, 3.20, 1.55, 7.8])

  // Sync UI controls -> G ref
  useEffect(() => { G.current.autoCashAt = autoCashAt }, [autoCashAt])
  useEffect(() => { G.current.autoEnabled = autoEnabled }, [autoEnabled])

  // Fetch admin settings
  useEffect(() => {
    api.get('/admin/game-settings/crashBall')
      .then(r => { if (r.data) G.current.settings = r.data })
      .catch(() => {})
  }, [])

  // ── CORE GAME LOOP (pure refs, zero stale closure risk) ──
  useEffect(() => {
    const g = G.current

    function doRound() {
      clearInterval(g._interval)
      clearInterval(g._cdTimer)

      // Generate crash point
      const s = g.settings
      g.crashAt = genCrash(
        s.maxMultiplier || 100,
        s.forcedCrashEnabled ? (parseFloat(s.forcedCrashAt) || 0) : 0
      )

      // Reset
      g.phase = 'waiting'; g.mult = 1.00; g.placed = false; g.cashedOut = false
      g.trail = []; g.ballX = 80; g.ballY = 280; g.countdown = 5
      setUi({ phase: 'waiting', mult: '1.00', countdown: 5, placed: false, cashed: false, liveWin: 0 })

      // Auto re-bet
      if (g.autoEnabled) {
        const bal = storeRef.current.balance
        const ba = betAmt  // captured from closure but betAmt doesn't change the round start timing
        if (bal >= ba) {
          setTimeout(() => {
            if (g.phase === 'waiting' && !g.placed) placeBet(ba)
          }, 100)
        }
      }

      // Countdown 5→0
      g._cdTimer = setInterval(() => {
        g.countdown = Math.max(0, g.countdown - 1)
        if (g.countdown <= 3) sounds.tickFinal()
        else sounds.tick()
        setUi(p => ({ ...p, countdown: g.countdown }))
        if (g.countdown <= 0) {
          clearInterval(g._cdTimer)
          doFlight()
        }
      }, 1000)
    }

    function doFlight() {
      g.phase = 'playing'; g.mult = 1.00
      setUi(p => ({ ...p, phase: 'playing', mult: '1.00' }))
      sounds.rocketLaunch()

      g._interval = setInterval(() => {
        // Grow multiplier
        g.mult = parseFloat((g.mult * 1.015).toFixed(2))

        // Move ball on arc
        const progress = Math.min((g.mult - 1) / 6, 1)
        g.ballX = 80 + progress * 560
        g.ballY = 280 - progress * 230
        g.trail.push({ x: g.ballX, y: g.ballY })
        if (g.trail.length > 70) g.trail.shift()

        // Subtle sound at milestones
        if (g.mult >= 1.5 && Math.round(g.mult * 10) % 5 === 0) {
          sounds.multRise(g.mult)
        }

        // Live win display
        const liveWin = g.placed && !g.cashedOut ? Math.floor(g.betAmt * g.mult) : 0
        setUi(p => ({ ...p, mult: g.mult.toFixed(2), liveWin }))

        // Auto cashout check
        if (g.placed && !g.cashedOut && g.autoEnabled && g.mult >= g.autoCashAt) {
          doCashout()
          return
        }

        // Crash check — compare against pre-generated crashAt
        if (g.mult >= g.crashAt) {
          clearInterval(g._interval)
          g.phase = 'crashed'
          const finalMult = g.mult.toFixed(2)
          setUi(p => ({ ...p, phase: 'crashed', mult: finalMult, liveWin: 0 }))
          setHistory(h => [parseFloat(finalMult), ...h.slice(0, 11)])
          sounds.crash()

          if (g.placed && !g.cashedOut) {
            toast.error(`💥 Crashed at ${finalMult}x! Lost ${g.betAmt} 🪙`)
            logBet('crash-ball', g.betAmt, 0)
          }

          setTimeout(doRound, 3500)
        }
      }, 80)
    }

    function placeBet(amount) {
      if (g.phase !== 'waiting') return toast.error('Wait for next round!')
      const bal = storeRef.current.balance
      if (!amount || amount <= 0 || amount > bal) return toast.error('Invalid bet amount')
      storeRef.current.setBalance(b => b - amount)
      g.betAmt = amount; g.placed = true; g.cashedOut = false
      setUi(p => ({ ...p, placed: true, cashed: false }))
      sounds.betPlace()
      toast.success(`✅ Bet ${amount} placed!`, { duration: 1500 })
    }

    function doCashout() {
      if (g.phase !== 'playing' || !g.placed || g.cashedOut) return
      const m = g.mult
      const win = Math.floor(g.betAmt * m)
      g.cashedOut = true; g.phase = 'cashed'
      storeRef.current.setBalance(b => b + win)
      setUi(p => ({ ...p, phase: 'cashed', cashed: true, liveWin: 0 }))
      sounds.cashout(); sounds.win()
      toast.success(`💰 Cashed ${m.toFixed(2)}x! Won ${win} 🪙`)
      logBet('crash-ball', g.betAmt, win)
      setHistory(h => [parseFloat(m.toFixed(2)), ...h.slice(0, 11)])
    }

    // Expose to React handlers
    G.current._placeBet = placeBet
    G.current._cashout = doCashout

    doRound()

    return () => {
      clearInterval(g._interval)
      clearInterval(g._cdTimer)
    }
  }, []) // Empty deps - intentional, everything via refs

  // ── CANVAS DRAW LOOP ──
  useEffect(() => {
    let raf
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) { raf = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      const W = canvas.width, H = canvas.height
      const g = G.current

      ctx.clearRect(0, 0, W, H)

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0d1117'); bg.addColorStop(1, '#090d13')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1
      for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

      const ph = g.phase, trail = g.trail, m = g.mult

      // Trail fill
      if (trail.length > 1) {
        ctx.beginPath()
        ctx.moveTo(trail[0].x, H - 15)
        trail.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.lineTo(trail[trail.length - 1].x, H - 15)
        ctx.closePath()
        const fg = ctx.createLinearGradient(0, 0, 0, H)
        const col = ph === 'crashed' ? '255,68,68' : ph === 'cashed' ? '0,208,132' : '201,162,39'
        fg.addColorStop(0, `rgba(${col},0.18)`); fg.addColorStop(1, 'transparent')
        ctx.fillStyle = fg; ctx.fill()

        // Trail line
        ctx.beginPath()
        trail.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
        ctx.strokeStyle = `rgba(${col},0.7)`; ctx.lineWidth = 3; ctx.lineJoin = 'round'
        ctx.shadowBlur = 8; ctx.shadowColor = `rgba(${col},0.5)`
        ctx.stroke(); ctx.shadowBlur = 0
      }

      // Ball
      if (ph !== 'waiting' && trail.length > 0) {
        const bc = ph === 'crashed' ? '#ff4444' : ph === 'cashed' ? '#00d084' : '#f0c84a'
        const bx = g.ballX, by = g.ballY
        const gr = ctx.createRadialGradient(bx - 4, by - 4, 2, bx, by, 13)
        gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, bc); gr.addColorStop(1, bc + '55')
        ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2)
        ctx.fillStyle = gr; ctx.shadowBlur = 20; ctx.shadowColor = bc; ctx.fill(); ctx.shadowBlur = 0
        ctx.strokeStyle = bc; ctx.lineWidth = 2; ctx.stroke()
      }

      // Text
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      if (ph === 'playing') {
        ctx.font = `900 ${W < 450 ? 46 : 56}px Arial`
        ctx.fillStyle = '#f0c84a'
        ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(201,162,39,0.5)'
        ctx.fillText(`${m.toFixed(2)}x`, W / 2, H * 0.38); ctx.shadowBlur = 0
      } else if (ph === 'crashed') {
        ctx.font = `700 ${W < 450 ? 16 : 20}px Arial`; ctx.fillStyle = '#ff8888'
        ctx.fillText('FLEW AWAY', W / 2, H * 0.26)
        ctx.font = `900 ${W < 450 ? 44 : 54}px Arial`; ctx.fillStyle = '#ff4444'
        ctx.shadowBlur = 16; ctx.shadowColor = '#ff0000'
        ctx.fillText(`${m.toFixed(2)}x`, W / 2, H * 0.48); ctx.shadowBlur = 0
      } else if (ph === 'cashed') {
        ctx.font = `900 ${W < 450 ? 44 : 54}px Arial`; ctx.fillStyle = '#00d084'
        ctx.shadowBlur = 14; ctx.shadowColor = '#00ff88'
        ctx.fillText(`${m.toFixed(2)}x`, W / 2, H * 0.40); ctx.shadowBlur = 0
        ctx.font = '700 16px Arial'; ctx.fillStyle = '#00a866'
        ctx.fillText('✅ Cashed Out!', W / 2, H * 0.57)
      } else {
        ctx.font = '700 15px Arial'; ctx.fillStyle = 'rgba(150,140,180,0.6)'
        ctx.fillText('Waiting for next round...', W / 2, H * 0.38)
        ctx.font = '900 48px Arial'; ctx.fillStyle = '#c9a227'
        ctx.shadowBlur = 12; ctx.shadowColor = '#c9a227'
        ctx.fillText(String(g.countdown), W / 2, H * 0.56); ctx.shadowBlur = 0
        ctx.font = '13px Arial'; ctx.fillStyle = 'rgba(130,120,160,0.4)'
        ctx.fillText('Place your bets!', W / 2, H * 0.70)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Handlers wired to refs
  const handleBet = () => G.current._placeBet && G.current._placeBet(betAmt)
  const handleCashout = () => G.current._cashout && G.current._cashout()

  const { balance } = useStore()
  const IS = { background: '#1a1a2a', border: '1px solid #2a2a3e', borderRadius: '8px', color: 'white', fontSize: '15px', fontWeight: '700', outline: 'none', textAlign: 'center', padding: '8px' }
  const canBet = ui.phase === 'waiting' && !ui.placed && betAmt > 0 && betAmt <= balance

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,26px)', marginBottom: '10px' }}>
        ⚽ <span className="gold-text">Crash Ball</span>
      </h1>

      {/* History bar */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
        {history.map((h, i) => (
          <span key={i} style={{ padding: '2px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0, background: h < 2 ? 'rgba(255,68,68,0.2)' : h < 5 ? 'rgba(80,200,80,0.15)' : 'rgba(201,162,39,0.2)', color: h < 2 ? '#ff6666' : h < 5 ? '#88cc88' : '#c9a227', border: `1px solid ${h < 2 ? 'rgba(255,68,68,0.3)' : h < 5 ? 'rgba(80,200,80,0.25)' : 'rgba(201,162,39,0.3)'}` }}>
            {Number(h).toFixed(2)}x
          </span>
        ))}
      </div>

      <div className="game-layout">
        {/* Canvas */}
        <div>
          <canvas ref={canvasRef} width={700} height={340}
            style={{ width: '100%', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'block' }} />
          <div style={{ marginTop: '8px', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {ui.phase === 'waiting' && `⏳ Next round in ${ui.countdown}s`}
            {ui.phase === 'playing' && !ui.placed && `🚀 ${ui.mult}x — Place bet for next round`}
            {ui.phase === 'playing' && ui.placed && !ui.cashed && `🚀 ${ui.mult}x — Cash out anytime!`}
            {ui.phase === 'crashed' && `💥 Crashed at ${ui.mult}x`}
            {ui.phase === 'cashed' && `✅ Cashed out at ${ui.mult}x`}
          </div>
        </div>

        {/* Bet Panel */}
        <div className="game-panel-right">
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '5px', gap: '4px' }}>
              {['Manual', 'Auto'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'white' : '#555', transition: 'all 0.2s' }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ padding: '12px' }}>
              {/* Balance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(201,162,39,0.07)', borderRadius: '7px', border: '1px solid rgba(201,162,39,0.15)', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Balance</span>
                <span style={{ color: 'var(--gold)', fontWeight: '700' }}>🪙 {balance.toLocaleString()}</span>
              </div>

              {/* Amount controls */}
              <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                <button onClick={() => setBetAmt(a => Math.max(10, Math.floor(a / 2)))} style={{ ...IS, width: '34px', flexShrink: 0, cursor: 'pointer' }}>½</button>
                <input type="number" value={betAmt} onChange={e => setBetAmt(Math.max(1, Number(e.target.value)))}
                  style={{ ...IS, flex: 1, minWidth: 0 }} />
                <button onClick={() => setBetAmt(a => Math.min(balance, a * 2))} style={{ ...IS, width: '34px', flexShrink: 0, cursor: 'pointer' }}>2x</button>
              </div>

              {/* Quick amounts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px', marginBottom: '10px' }}>
                {[50, 100, 500, 1000, 5000].map(a => (
                  <button key={a} onClick={() => setBetAmt(a)}
                    style={{ padding: '5px 2px', borderRadius: '6px', border: `1px solid ${betAmt === a ? 'var(--gold)' : 'var(--border)'}`, background: betAmt === a ? 'rgba(201,162,39,0.18)' : 'var(--bg-hover)', color: betAmt === a ? 'var(--gold)' : '#666', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>

              {/* AUTO TAB: cashout settings */}
              {tab === 'Auto' && (
                <div style={{ background: 'rgba(153,68,255,0.07)', border: '1px solid rgba(153,68,255,0.2)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                  <div style={{ color: '#9944ff', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>⚡ Auto Cashout</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ color: '#777', fontSize: '11px', flexShrink: 0 }}>Cash out at:</span>
                    <input type="number" value={autoCashAt} onChange={e => setAutoCashAt(Math.max(1.01, Number(e.target.value)))} step="0.1" min="1.01"
                      style={{ flex: 1, padding: '6px 8px', background: '#1a1a2a', border: '1px solid rgba(153,68,255,0.3)', borderRadius: '7px', color: '#9944ff', fontSize: '14px', fontWeight: '800', outline: 'none', textAlign: 'center' }} />
                    <span style={{ color: '#9944ff', fontWeight: '900', fontSize: '14px' }}>x</span>
                  </div>
                  {/* Quick presets */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {[1.5, 2, 3, 5, 10, 20, 50].map(m => (
                      <button key={m} onClick={() => setAutoCashAt(m)}
                        style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: autoCashAt === m ? 'rgba(153,68,255,0.3)' : 'var(--bg-hover)', border: `1px solid ${autoCashAt === m ? '#9944ff' : 'var(--border)'}`, color: autoCashAt === m ? '#9944ff' : '#555' }}>
                        {m}x
                      </button>
                    ))}
                  </div>
                  {/* Enable toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#777', fontSize: '12px' }}>Auto Bet ON</span>
                    <button onClick={() => setAutoEnabled(e => !e)}
                      style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: autoEnabled ? '#9944ff' : '#2a2a3e', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: autoEnabled ? '23px' : '3px', transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                    </button>
                  </div>
                  {autoEnabled && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#9944ff', padding: '5px 8px', background: 'rgba(153,68,255,0.1)', borderRadius: '5px' }}>
                      ✅ Will auto-cashout at {autoCashAt}x each round
                    </div>
                  )}
                </div>
              )}

              {/* CASH OUT button — shows when playing with active bet */}
              {ui.phase === 'playing' && ui.placed && !ui.cashed && (
                <button onClick={handleCashout}
                  style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '11px', background: 'linear-gradient(135deg,#00d084,#00a866)', color: 'white', fontSize: '16px', fontWeight: '900', cursor: 'pointer', marginBottom: '8px', boxShadow: '0 4px 18px rgba(0,208,132,0.4)', animation: 'cbPulse 0.9s ease infinite' }}>
                  💰 CASH OUT {ui.mult}x
                  {ui.liveWin > 0 && <div style={{ fontSize: '13px', opacity: 0.9 }}>{ui.liveWin.toLocaleString()} 🪙</div>}
                </button>
              )}

              {/* BET button / status */}
              {ui.phase === 'waiting' && !ui.placed ? (
                <button onClick={handleBet} disabled={!canBet}
                  style={{ width: '100%', padding: '13px', border: 'none', borderRadius: '11px', background: canBet ? 'linear-gradient(135deg,#c9a227,#f0c84a)' : 'rgba(201,162,39,0.2)', color: canBet ? '#0a0a0f' : 'rgba(255,255,255,0.3)', fontSize: '15px', fontWeight: '900', cursor: canBet ? 'pointer' : 'not-allowed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Bet {betAmt.toLocaleString()} 🪙
                </button>
              ) : ui.phase === 'waiting' && ui.placed ? (
                <div style={{ padding: '13px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '10px', textAlign: 'center', color: 'var(--gold)', fontWeight: '700', fontSize: '14px' }}>
                  ✅ Bet {betAmt.toLocaleString()} placed — Round starting!
                </div>
              ) : ui.phase === 'playing' && !ui.placed ? (
                <div style={{ padding: '13px', background: 'var(--bg-hover)', borderRadius: '10px', textAlign: 'center', color: '#555', fontSize: '13px' }}>
                  Place bet for next round
                </div>
              ) : ui.phase === 'crashed' ? (
                <div style={{ padding: '13px', background: ui.placed && !ui.cashed ? 'rgba(255,68,68,0.1)' : 'var(--bg-hover)', border: ui.placed && !ui.cashed ? '1px solid rgba(255,68,68,0.3)' : '1px solid transparent', borderRadius: '10px', textAlign: 'center', color: ui.placed && !ui.cashed ? '#ff4444' : '#555', fontWeight: '700' }}>
                  {ui.placed && !ui.cashed ? `💥 Lost ${G.current.betAmt.toLocaleString()} 🪙` : 'Next round starting...'}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes cbPulse{0%,100%{box-shadow:0 4px 18px rgba(0,208,132,0.4)}50%{box-shadow:0 6px 30px rgba(0,208,132,0.7)}}`}</style>
    </div>
  )
}
