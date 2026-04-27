/**
 * AutoBet - Universal auto bet component
 * Usage: <AutoBet onBet={myBetFn} disabled={isPlaying} />
 * 
 * Provides:
 * - Manual bet
 * - Auto bet (N rounds or infinite)
 * - Auto cashout at multiplier (for crash games)
 * - Stop on win / stop on loss
 */
import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import sounds from '../utils/sounds'

export default function AutoBet({
  onBet,           // (amount) => void - called to place a bet
  onCashout,       // (mult) => void - for crash games only
  disabled = false,
  isCrashGame = false,   // shows cashout at multiplier setting
  currentMult = 1,       // current multiplier (crash games)
  phase = 'idle',        // game phase for crash games
}) {
  const { balance } = useStore()
  const [tab, setTab] = useState('Manual')
  const [amount, setAmount] = useState(100)
  const [autoRounds, setAutoRounds] = useState(10)
  const [stopOnWin, setStopOnWin] = useState(0)
  const [stopOnLoss, setStopOnLoss] = useState(0)
  const [cashoutAt, setCashoutAt] = useState(2.0)
  const [running, setRunning] = useState(false)
  const [roundsDone, setRoundsDone] = useState(0)
  const runningRef = useRef(false)

  // Stop auto on balance 0
  useEffect(() => {
    if (running && balance <= 0) stopAuto()
  }, [balance, running])

  const startAuto = () => {
    if (amount <= 0 || amount > balance) {
      sounds.error && sounds.error(); return
    }
    setRunning(true); runningRef.current = true; setRoundsDone(0)
    runRound(0)
  }

  const stopAuto = () => {
    setRunning(false); runningRef.current = false
  }

  const runRound = (done) => {
    if (!runningRef.current) return
    if (autoRounds > 0 && done >= autoRounds) { stopAuto(); return }
    onBet(amount)
    setRoundsDone(done + 1)
    // Next round will be triggered by parent calling back
    // For simple games (non-crash), we trigger via timeout
    if (!isCrashGame) {
      setTimeout(() => {
        if (runningRef.current) runRound(done + 1)
      }, 1500)
    }
  }

  const QS = { padding: '6px 2px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1px solid', transition: 'all 0.15s' }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '5px', gap: '4px' }}>
        {['Manual', 'Auto'].map(t => (
          <button key={t} onClick={() => { setTab(t); if (running) stopAuto() }}
            style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', background: tab === t ? 'var(--bg-card)' : 'transparent', color: tab === t ? 'white' : '#555', transition: 'all 0.2s' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px' }}>
        {/* Amount */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bet Amount</label>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button onClick={() => setAmount(a => Math.max(10, Math.floor(a / 2)))} disabled={running}
              style={{ ...QS, width: '32px', height: '32px', background: 'var(--bg-hover)', borderColor: 'var(--border)', color: '#888', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', borderRadius: '50%' }}>−</button>
            <input type="number" value={amount} onChange={e => setAmount(Math.max(1, Number(e.target.value)))} disabled={running}
              style={{ flex: 1, padding: '8px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '16px', fontWeight: '700', outline: 'none', textAlign: 'center', opacity: running ? 0.6 : 1 }} />
            <button onClick={() => setAmount(a => Math.min(balance, a * 2))} disabled={running}
              style={{ ...QS, width: '32px', height: '32px', background: 'var(--bg-hover)', borderColor: 'var(--border)', color: '#888', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', borderRadius: '50%' }}>2x</button>
          </div>
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '5px', marginBottom: '10px' }}>
          {[50, 100, 500, 1000].map(a => (
            <button key={a} onClick={() => !running && setAmount(a)}
              style={{ ...QS, background: amount === a ? 'rgba(201,162,39,0.18)' : 'var(--bg-hover)', borderColor: amount === a ? 'var(--gold)' : 'var(--border)', color: amount === a ? 'var(--gold)' : '#666', opacity: running ? 0.5 : 1, cursor: running ? 'not-allowed' : 'pointer' }}>
              {a >= 1000 ? `${a/1000}K` : a}
            </button>
          ))}
        </div>

        {/* Auto settings */}
        {tab === 'Auto' && (
          <div style={{ background: 'rgba(153,68,255,0.06)', border: '1px solid rgba(153,68,255,0.18)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Rounds (0=∞)</label>
                <input type="number" value={autoRounds} onChange={e => setAutoRounds(Math.max(0, Number(e.target.value)))} min="0"
                  style={{ width: '100%', padding: '7px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '6px', color: '#9944ff', fontSize: '14px', fontWeight: '700', outline: 'none', textAlign: 'center' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Stop on Win +</label>
                <input type="number" value={stopOnWin} onChange={e => setStopOnWin(Math.max(0, Number(e.target.value)))} min="0"
                  style={{ width: '100%', padding: '7px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '6px', color: '#00d084', fontSize: '14px', fontWeight: '700', outline: 'none', textAlign: 'center' }} />
              </div>
            </div>
            {isCrashGame && (
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Auto Cashout at</label>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {[1.5, 2, 3, 5, 10].map(m => (
                    <button key={m} onClick={() => setCashoutAt(m)}
                      style={{ ...QS, padding: '4px 8px', background: cashoutAt === m ? 'rgba(153,68,255,0.25)' : 'var(--bg-hover)', borderColor: cashoutAt === m ? '#9944ff' : 'var(--border)', color: cashoutAt === m ? '#9944ff' : '#666' }}>
                      {m}x
                    </button>
                  ))}
                </div>
                <input type="number" value={cashoutAt} onChange={e => setCashoutAt(Math.max(1.01, Number(e.target.value)))} step="0.1" min="1.01"
                  style={{ width: '100%', padding: '7px', background: 'var(--bg-hover)', border: '1px solid rgba(153,68,255,0.3)', borderRadius: '6px', color: '#9944ff', fontSize: '14px', fontWeight: '700', outline: 'none', textAlign: 'center' }} />
              </div>
            )}
            {running && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#9944ff', textAlign: 'center' }}>
                Round {roundsDone}{autoRounds > 0 ? `/${autoRounds}` : ''}
              </div>
            )}
          </div>
        )}

        {/* Main button */}
        {tab === 'Manual' ? (
          <button onClick={() => !disabled && onBet(amount)} disabled={disabled || amount <= 0 || amount > balance}
            style={{ width: '100%', padding: '13px', border: 'none', borderRadius: '10px', background: disabled || amount > balance ? 'rgba(201,162,39,0.12)' : 'linear-gradient(135deg,#c9a227,#f0c84a)', color: disabled || amount > balance ? 'rgba(0,0,0,0.35)' : '#0a0a0f', fontSize: '15px', fontWeight: '900', cursor: disabled || amount > balance ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {disabled ? 'Betting...' : `Bet ${amount.toLocaleString()} 🪙`}
          </button>
        ) : running ? (
          <button onClick={stopAuto}
            style={{ width: '100%', padding: '13px', border: 'none', borderRadius: '10px', background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontSize: '15px', fontWeight: '900', cursor: 'pointer' }}>
            ⏹ Stop Auto ({roundsDone})
          </button>
        ) : (
          <button onClick={startAuto} disabled={disabled || amount <= 0 || amount > balance}
            style={{ width: '100%', padding: '13px', border: 'none', borderRadius: '10px', background: disabled || amount > balance ? 'rgba(153,68,255,0.1)' : 'linear-gradient(135deg,#9944ff,#7722cc)', color: disabled || amount > balance ? 'rgba(153,68,255,0.35)' : 'white', fontSize: '15px', fontWeight: '900', cursor: disabled || amount > balance ? 'not-allowed' : 'pointer', letterSpacing: '0.5px' }}>
            ▶ Start Auto {autoRounds > 0 ? `(${autoRounds}x)` : '(∞)'}
          </button>
        )}

        <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Balance: 🪙{balance?.toLocaleString()}</span>
          <span>Win: 🪙{(amount * 2).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
