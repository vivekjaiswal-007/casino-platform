import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const ZONES = [
  { id:'tl', label:'Top Left',     x:'20%',  y:'20%' },
  { id:'tm', label:'Top Mid',      x:'50%',  y:'15%' },
  { id:'tr', label:'Top Right',    x:'80%',  y:'20%' },
  { id:'ml', label:'Mid Left',     x:'20%',  y:'50%' },
  { id:'mm', label:'Centre',       x:'50%',  y:'50%' },
  { id:'mr', label:'Mid Right',    x:'80%',  y:'50%' },
]

export default function PenaltyShootout() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('pick')
  const [picked, setPicked] = useState(null)
  const [gkZone, setGkZone] = useState(null)
  const [result, setResult] = useState(null)
  const [betAmt, setBetAmt] = useState(0)
  const [shooting, setShooting] = useState(false)

  const shoot = (amount) => {
    if (!picked) return toast.error('Pick a corner first!')
    setBalance(b => b - amount)
    setBetAmt(amount)
    setShooting(true)
    sounds.betPlace()

    setTimeout(() => {
      const gk = ZONES[Math.floor(Math.random() * ZONES.length)]
      setGkZone(gk)
      const scored = gk.id !== picked
      setResult({ scored, gk })
      setShooting(false)

      if (scored) {
        const win = amount * 2
        setBalance(b => b + win)
        sounds.bigWin()
        toast.success(`⚽ GOAL! Won ${win} 🪙`)
        logBet('penalty', amount, win)
      } else {
        sounds.loss()
        toast.error(`🧤 Saved! GK guessed correctly. Lost ${amount} 🪙`)
        logBet('penalty', amount, 0)
      }
      setPhase('result')
    }, 1200)
  }

  const reset = () => { setPhase('pick'); setPicked(null); setGkZone(null); setResult(null); setShooting(false) }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        ⚽ <span className="gold-text">Penalty Shootout</span>
      </h1>
      <div className="game-layout">
        <div>
          {/* Goal visual */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '60%', background: 'linear-gradient(180deg,#1a5c1a 0%,#2d8a2d 60%,#3aaa3a 100%)', borderRadius: '16px', border: '3px solid #1a8a1a', overflow: 'hidden', marginBottom: '14px' }}>
            {/* Goal posts */}
            <div style={{ position: 'absolute', top: '8%', left: '15%', right: '15%', height: '55%', border: '4px solid white', borderBottom: 'none', borderRadius: '2px 2px 0 0' }}>
              {/* Net */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.15) 0,rgba(255,255,255,0.15) 1px,transparent 1px,transparent 12px),repeating-linear-gradient(90deg,rgba(255,255,255,0.15) 0,rgba(255,255,255,0.15) 1px,transparent 1px,transparent 12px)' }} />
            </div>

            {/* Zone buttons */}
            {ZONES.map(z => (
              <button key={z.id} onClick={() => phase === 'pick' && setPicked(z.id)}
                style={{ position: 'absolute', transform: 'translate(-50%,-50%)', left: z.x, top: z.y, width: 'clamp(36px,10vw,52px)', height: 'clamp(36px,10vw,52px)', borderRadius: '50%', border: `3px solid ${picked === z.id ? '#f0c84a' : 'rgba(255,255,255,0.5)'}`, background: picked === z.id ? 'rgba(240,200,74,0.3)' : 'rgba(255,255,255,0.1)', cursor: phase === 'pick' ? 'pointer' : 'default', zIndex: 2, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {result && gkZone?.id === z.id && (
                  <span style={{ fontSize: '20px' }}>🧤</span>
                )}
                {result && picked === z.id && result.scored && (
                  <span style={{ fontSize: '18px' }}>⚽</span>
                )}
              </button>
            ))}

            {/* Ball */}
            {shooting && (
              <div style={{ position: 'absolute', bottom: '10%', left: `${ZONES.find(z=>z.id===picked)?.x || '50%'}`, transform: 'translateX(-50%)', fontSize: '28px', animation: 'shootBall 1.2s ease forwards' }}>⚽</div>
            )}

            {/* Status */}
            <div style={{ position: 'absolute', bottom: '4%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {phase === 'pick' && <span style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Pick a corner to shoot!</span>}
              {shooting && <span style={{ background: 'rgba(0,0,0,0.7)', color: '#f0c84a', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>Shooting... 🎯</span>}
              {result && <span style={{ background: result.scored ? 'rgba(0,200,80,0.8)' : 'rgba(200,0,0,0.8)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: '900' }}>{result.scored ? '⚽ GOAL!' : '🧤 SAVED!'}</span>}
            </div>
          </div>

          {picked && phase === 'pick' && (
            <div style={{ padding: '8px 12px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)', borderRadius: '8px', fontSize: '13px', color: 'var(--gold)', textAlign: 'center' }}>
              🎯 Shooting {ZONES.find(z=>z.id===picked)?.label} — Pays <strong>2x</strong>
            </div>
          )}
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={reset} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              ⚽ Take Another Penalty
            </button>
          ) : (
            <BetPanel onBet={shoot} disabled={phase !== 'pick' || !picked || shooting} />
          )}
        </div>
      </div>
      <style>{`@keyframes shootBall{0%{bottom:10%;opacity:1;font-size:28px}100%{bottom:45%;left:${ZONES.find(z=>z.id===picked)?.x||'50%'};opacity:0;font-size:12px}}`}</style>
    </div>
  )
}
