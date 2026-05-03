import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const MODES = [
  { label: '1-5',  max: 5,  mult: 4.5,  color: '#00d084' },
  { label: '1-10', max: 10, mult: 9,    color: '#4488ff' },
  { label: '1-25', max: 25, mult: 22,   color: '#c9a227' },
  { label: '1-50', max: 50, mult: 45,   color: '#ff8800' },
  { label: '1-100',max: 100,mult: 90,   color: '#ff4444' },
]

export default function NumberGuess() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [modeIdx, setModeIdx] = useState(1)
  const [guess, setGuess] = useState('')
  const [phase, setPhase] = useState('bet')
  const [result, setResult] = useState(null)
  const [secret, setSecret] = useState(null)
  const mode = MODES[modeIdx]

  const play = (amount) => {
    const g = parseInt(guess)
    if (!g || g < 1 || g > mode.max) return toast.error(`Pick a number 1–${mode.max}`)
    setBalance(b => b - amount)
    setPhase('result')
    const s = Math.floor(Math.random() * mode.max) + 1
    setSecret(s)
    if (s === g) {
      const win = Math.floor(amount * mode.mult)
      setBalance(b => b + win)
      sounds.bigWin()
      toast.success(`🎉 Correct! ${s} — Won ${win} 🪙`)
      logBet('number-guess', amount, win)
      setResult({ win: true, win_amt: win, amount })
    } else {
      sounds.loss()
      toast.error(`❌ It was ${s}! Lost ${amount} 🪙`)
      logBet('number-guess', amount, 0)
      setResult({ win: false, amount })
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🔢 <span className="gold-text">Number Guess</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Range</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {MODES.map((m, i) => (
                  <button key={i} onClick={() => { if (phase === 'bet') { setModeIdx(i); setGuess('') } }}
                    style={{ padding: '7px 14px', borderRadius: '7px', fontWeight: '700', fontSize: '13px', cursor: phase === 'bet' ? 'pointer' : 'default', background: modeIdx === i ? `${m.color}20` : 'var(--bg-hover)', border: `1.5px solid ${modeIdx === i ? m.color : 'var(--border)'}`, color: modeIdx === i ? m.color : 'var(--text-secondary)' }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '60px', marginBottom: '12px' }}>
                {phase === 'result' ? (result?.win ? '🎉' : '😞') : '🤔'}
              </div>

              {phase === 'bet' && (
                <>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '14px' }}>
                    Pick 1–{mode.max} • Wins <strong style={{ color: mode.color }}>{mode.mult}x</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="number" value={guess} min={1} max={mode.max}
                      onChange={e => setGuess(e.target.value)}
                      placeholder={`1–${mode.max}`}
                      style={{ width: '110px', padding: '14px', background: 'var(--bg-hover)', border: `2px solid ${mode.color}44`, borderRadius: '10px', color: 'white', fontSize: '24px', fontWeight: '900', textAlign: 'center', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = mode.color}
                      onBlur={e => e.target.style.borderColor = `${mode.color}44`}
                    />
                  </div>
                  {/* Quick pick grid */}
                  {mode.max <= 25 && (
                    <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                      {Array.from({length: mode.max}, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setGuess(String(n))}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', background: guess === String(n) ? `${mode.color}20` : 'var(--bg-hover)', border: `1.5px solid ${guess === String(n) ? mode.color : 'var(--border)'}`, color: guess === String(n) ? mode.color : 'var(--text-secondary)' }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {phase === 'result' && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: mode.color, marginBottom: '8px' }}>
                    The number was: {secret}
                  </div>
                  <div style={{ padding: '14px 24px', borderRadius: '12px', display: 'inline-block', background: result?.win ? 'rgba(0,208,132,0.12)' : 'rgba(255,68,68,0.1)', border: `1px solid ${result?.win ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, fontSize: '18px', fontWeight: '800', color: result?.win ? '#00d084' : '#ff4444' }}>
                    {result?.win ? `🎉 Won ${result.win_amt} 🪙` : `❌ Lost ${result?.amount} 🪙`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={() => { setPhase('bet'); setResult(null); setSecret(null); setGuess('') }} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              🔄 Play Again
            </button>
          ) : (
            <BetPanel onBet={play} disabled={phase !== 'bet' || !guess} />
          )}
        </div>
      </div>
    </div>
  )
}
