import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const ZONES = [
  { label:'10x',  mult:10,  color:'#9944ff', weight:3  },
  { label:'5x',   mult:5,   color:'#ff4444', weight:7  },
  { label:'3x',   mult:3,   color:'#ff8800', weight:12 },
  { label:'2x',   mult:2,   color:'#c9a227', weight:18 },
  { label:'1.5x', mult:1.5, color:'#00d084', weight:25 },
  { label:'❌',   mult:0,   color:'#333',    weight:35 },
]

const POOL = ZONES.flatMap(z => Array(z.weight).fill(z))

export default function BallDrop() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [balls, setBalls] = useState([])
  const [betAmt, setBetAmt] = useState(0)

  const play = (amount) => {
    setBalance(b => b - amount)
    setBetAmt(amount)
    setPhase('dropping')
    setBalls([])

    // Drop 5 balls
    const results = Array(5).fill(null).map(() => POOL[Math.floor(Math.random() * POOL.length)])
    let i = 0
    const interval = setInterval(() => {
      setBalls(prev => [...prev, { ...results[i], id: i, dropping: true }])
      sounds.plinkoHit()
      i++
      if (i === 5) {
        clearInterval(interval)
        setTimeout(() => {
          const wins = results.filter(r => r.mult > 0)
          const totalWin = wins.reduce((s, r) => s + Math.floor(amount / 5 * r.mult), 0)
          if (totalWin > 0) {
            setBalance(b => b + totalWin)
            sounds.win()
            toast.success(`🎉 Won ${totalWin} 🪙!`)
            logBet('ball-drop', amount, totalWin)
          } else {
            sounds.loss()
            toast.error(`No wins! Lost ${amount} 🪙`)
            logBet('ball-drop', amount, 0)
          }
          setPhase('result')
        }, 600)
      }
    }, 400)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        ⚽ <span className="gold-text">Ball Drop</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', minHeight: '280px' }}>
            {/* Zones */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {ZONES.map((z, i) => (
                <div key={i} style={{ flex: 1, padding: 'clamp(6px,2vw,10px) 4px', borderRadius: '8px', textAlign: 'center', background: `${z.color}18`, border: `1px solid ${z.color}44` }}>
                  <div style={{ fontSize: 'clamp(10px,2.5vw,13px)', fontWeight: '800', color: z.color }}>{z.label}</div>
                </div>
              ))}
            </div>

            {/* Balls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', minHeight: '120px', alignItems: 'center' }}>
              {phase === 'bet' && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚽</div>
                  5 balls will drop!<br/>
                  <span style={{ fontSize: '12px' }}>Each ball = 1/5 of your bet</span>
                </div>
              )}
              {balls.map(b => (
                <div key={b.id} style={{ padding: '10px 14px', borderRadius: '10px', background: `${b.color}22`, border: `2px solid ${b.color}`, color: b.color, fontWeight: '900', fontSize: 'clamp(13px,3vw,16px)', animation: 'dropBall 0.4s ease' }}>
                  ⚽ {b.label}
                </div>
              ))}
            </div>

            {phase === 'result' && balls.length === 5 && (
              <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {balls.filter(b => b.mult > 0).length} winning ball(s) — Total: 🪙{balls.reduce((s,b) => s + (b.mult > 0 ? Math.floor(betAmt/5*b.mult) : 0), 0)}
              </div>
            )}
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={() => { setPhase('bet'); setBalls([]) }} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              🔄 Drop Again
            </button>
          ) : (
            <BetPanel onBet={play} disabled={phase !== 'bet'} />
          )}
        </div>
      </div>
      <style>{`@keyframes dropBall{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
