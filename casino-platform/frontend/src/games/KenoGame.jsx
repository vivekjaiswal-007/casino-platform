import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const TOTAL = 80
const DRAWN = 20
const MAX_PICK = 10

const PAYOUT_TABLE = {
  1: [0, 3],
  2: [0, 0, 9],
  3: [0, 0, 2, 27],
  4: [0, 0, 0, 5, 72],
  5: [0, 0, 0, 2, 12, 120],
  6: [0, 0, 0, 0, 4, 28, 500],
  7: [0, 0, 0, 0, 2, 8, 80, 1000],
  8: [0, 0, 0, 0, 0, 4, 30, 200, 2000],
  9: [0, 0, 0, 0, 0, 2, 12, 80, 500, 5000],
  10:[0, 0, 0, 0, 0, 0, 6, 40, 200, 1000, 10000],
}

export default function KenoGame() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [picked, setPicked] = useState(new Set())
  const [drawn, setDrawn] = useState([])
  const [phase, setPhase] = useState('pick') // pick | drawing | result
  const [matches, setMatches] = useState(0)
  const [betAmt, setBetAmt] = useState(0)
  const [winAmt, setWinAmt] = useState(0)

  const toggleNum = (n) => {
    if (phase !== 'pick') return
    setPicked(prev => {
      const s = new Set(prev)
      if (s.has(n)) s.delete(n)
      else if (s.size < MAX_PICK) s.add(n)
      else toast.error(`Max ${MAX_PICK} numbers!`)
      return s
    })
  }

  const play = (amount) => {
    if (picked.size < 1) return toast.error('Pick at least 1 number!')
    setBalance(b => b - amount)
    setBetAmt(amount)
    setPhase('drawing')
    setDrawn([])

    const pool = Array.from({length: TOTAL}, (_, i) => i + 1)
    const shuffled = pool.sort(() => Math.random() - 0.5)
    const drawnNums = shuffled.slice(0, DRAWN)

    let i = 0
    const interval = setInterval(() => {
      setDrawn(drawnNums.slice(0, i + 1))
      i++
      if (i === DRAWN) {
        clearInterval(interval)
        const m = drawnNums.filter(n => picked.has(n)).length
        setMatches(m)
        const payouts = PAYOUT_TABLE[picked.size] || []
        const mult = payouts[m] || 0
        const win = amount * mult
        setWinAmt(win)
        if (win > 0) {
          setBalance(b => b + win)
          sounds.bigWin()
          toast.success(`🎉 ${m} matches! Won ${win} 🪙`)
          logBet('keno', amount, win)
        } else {
          sounds.loss()
          toast.error(`${m} matches. Better luck next time!`)
          logBet('keno', amount, 0)
        }
        setPhase('result')
      }
    }, 80)
  }

  const reset = () => { setPhase('pick'); setDrawn([]); setMatches(0); setPicked(new Set()); setWinAmt(0) }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🎱 <span className="gold-text">Keno</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Picked: <strong style={{ color: 'var(--gold)' }}>{picked.size}</strong>/{MAX_PICK}
              </span>
              {phase === 'drawing' && <span style={{ color: '#4488ff', fontSize: '13px' }}>Drawing: {drawn.length}/{DRAWN}</span>}
              {phase === 'result' && <span style={{ color: matches > 0 ? '#00d084' : '#ff4444', fontSize: '13px', fontWeight: '700' }}>
                Matches: {matches} {winAmt > 0 ? `→ Won 🪙${winAmt}` : '→ No win'}
              </span>}
              {phase === 'pick' && <button onClick={() => setPicked(new Set())} style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontSize: '12px', cursor: 'pointer' }}>Clear</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px' }}>
              {Array.from({length: TOTAL}, (_, i) => i + 1).map(n => {
                const isPicked = picked.has(n)
                const isDrawn = drawn.includes(n)
                const isMatch = isPicked && isDrawn
                return (
                  <button key={n} onClick={() => toggleNum(n)}
                    style={{
                      aspectRatio: '1', borderRadius: '6px', fontSize: 'clamp(9px,2vw,13px)', fontWeight: '700',
                      border: `1.5px solid ${isMatch ? '#00d084' : isPicked ? 'var(--gold)' : isDrawn ? '#4488ff' : 'var(--border)'}`,
                      background: isMatch ? 'rgba(0,208,132,0.25)' : isPicked ? 'rgba(201,162,39,0.18)' : isDrawn ? 'rgba(68,136,255,0.18)' : 'var(--bg-hover)',
                      color: isMatch ? '#00d084' : isPicked ? 'var(--gold)' : isDrawn ? '#4488ff' : 'var(--text-secondary)',
                      cursor: phase === 'pick' ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                      padding: '4px 2px',
                    }}>
                    {n}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payout table */}
          {picked.size > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Payouts for {picked.size} picks:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(PAYOUT_TABLE[picked.size] || []).map((mult, m) => mult > 0 ? (
                  <div key={m} style={{ padding: '4px 10px', borderRadius: '6px', background: matches === m && phase === 'result' ? 'rgba(0,208,132,0.2)' : 'var(--bg-hover)', border: `1px solid ${matches === m && phase === 'result' ? '#00d084' : 'var(--border)'}`, color: matches === m && phase === 'result' ? '#00d084' : 'var(--text-secondary)' }}>
                    {m} match → <strong>{mult}x</strong>
                  </div>
                ) : null)}
              </div>
            </div>
          )}
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={reset} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>🔄 Play Again</button>
          ) : (
            <BetPanel onBet={play} disabled={phase !== 'pick' || picked.size === 0} />
          )}
        </div>
      </div>
    </div>
  )
}
