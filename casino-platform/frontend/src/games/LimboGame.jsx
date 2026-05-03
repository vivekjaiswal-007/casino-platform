import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

function randMultiplier() {
  const r = Math.random()
  if (r < 0.5) return 1 + Math.random() * 0.9
  if (r < 0.75) return 1.9 + Math.random() * 1.5
  if (r < 0.90) return 3.4 + Math.random() * 4
  if (r < 0.97) return 7.4 + Math.random() * 15
  return 22 + Math.random() * 100
}

export default function LimboGame() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [target, setTarget] = useState(2.0)
  const [phase, setPhase] = useState('bet')
  const [result, setResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [displayMult, setDisplayMult] = useState(null)
  const intRef = useRef(null)

  const winChance = Math.min(99, (1 / target * 100)).toFixed(1)
  const payout = (target * 0.97).toFixed(2)

  const play = (amount) => {
    setBalance(b => b - amount)
    setPhase('rolling')
    setRolling(true)
    setResult(null)
    setDisplayMult(null)

    const outcome = randMultiplier()
    let count = 0

    intRef.current = setInterval(() => {
      const fake = parseFloat((1 + Math.random() * 150).toFixed(2))
      setDisplayMult(fake)
      count++
      if (count > 20) {
        clearInterval(intRef.current)
        setDisplayMult(parseFloat(outcome.toFixed(2)))
        setRolling(false)
        setPhase('result')

        const won = outcome >= target
        if (won) {
          const win = Math.floor(amount * parseFloat(payout))
          setBalance(b => b + win)
          sounds.win()
          toast.success(`🎉 ${outcome.toFixed(2)}x ≥ ${target}x! Won ${win} 🪙`)
          logBet('limbo', amount, win)
          setResult({ win: true, val: outcome.toFixed(2), winAmt: win })
        } else {
          sounds.loss()
          toast.error(`${outcome.toFixed(2)}x < ${target}x! Lost ${amount} 🪙`)
          logBet('limbo', amount, 0)
          setResult({ win: false, val: outcome.toFixed(2) })
        }
      }
    }, 60)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🎯 <span className="gold-text">Limbo</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            {/* Result display */}
            <div style={{ fontSize: 'clamp(48px,15vw,80px)', fontWeight: '900', fontFamily: 'Cinzel,serif', minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: phase === 'result' ? (result?.win ? '#00d084' : '#ff4444') : 'var(--gold)', textShadow: `0 0 20px ${phase === 'result' ? (result?.win ? 'rgba(0,208,132,0.5)' : 'rgba(255,68,68,0.5)') : 'rgba(201,162,39,0.4)'}`, transition: 'color 0.3s' }}>
              {displayMult ? `${displayMult}x` : '?'}
            </div>

            {/* Target setter */}
            <div style={{ margin: '20px 0', padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Your Target Multiplier
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setTarget(t => Math.max(1.01, parseFloat((t - 0.5).toFixed(2))))} disabled={phase !== 'bet'}
                  style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'white', fontSize: '20px', cursor: 'pointer', fontWeight: '700' }}>−</button>
                <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--gold)', minWidth: '100px', textAlign: 'center' }}>
                  {target.toFixed(2)}x
                </div>
                <button onClick={() => setTarget(t => parseFloat((t + 0.5).toFixed(2)))} disabled={phase !== 'bet'}
                  style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'white', fontSize: '20px', cursor: 'pointer', fontWeight: '700' }}>+</button>
              </div>
              {/* Quick targets */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                {[1.5, 2, 3, 5, 10, 25, 50].map(t => (
                  <button key={t} onClick={() => phase === 'bet' && setTarget(t)}
                    style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', background: target === t ? 'rgba(201,162,39,0.2)' : 'var(--bg-card)', border: `1px solid ${target === t ? 'var(--gold)' : 'var(--border)'}`, color: target === t ? 'var(--gold)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                    {t}x
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { l: 'Win Chance', v: `${winChance}%`, c: '#00d084' },
                { l: 'Payout',     v: `${payout}x`,    c: 'var(--gold)' },
              ].map(s => (
                <div key={s.l} style={{ padding: '8px 16px', background: 'var(--bg-hover)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.l}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={() => { setPhase('bet'); setResult(null); setDisplayMult(null) }} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px', marginBottom: '12px' }}>
              🔄 Roll Again
            </button>
          ) : null}
          <BetPanel onBet={play} disabled={phase !== 'bet'} />
        </div>
      </div>
    </div>
  )
}
