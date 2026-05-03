import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const CARDS = ['🃏','🂡','🂢','🂣','🂤','🂥','🂦','🂧','🂨','🂩','🂪','🂫','🂭','🂮']

export default function HotCold() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [pick, setPick] = useState('hot')
  const [result, setResult] = useState(null)
  const [numbers, setNumbers] = useState([])

  const play = (amount) => {
    setBalance(b => b - amount)
    setPhase('spinning')
    setNumbers([])
    setResult(null)

    const drawn = Math.floor(Math.random() * 100) + 1
    const isHot = drawn >= 55 // 55-100 = hot (46%), 1-54 = cold (54%)
    const won = (pick === 'hot' && isHot) || (pick === 'cold' && !isHot)

    let i = 0
    const interval = setInterval(() => {
      setNumbers(prev => [...prev.slice(-4), Math.floor(Math.random() * 100) + 1])
      i++
      if (i > 15) {
        clearInterval(interval)
        setNumbers([drawn])
        setResult({ drawn, isHot, won })
        setPhase('result')
        if (won) {
          const win = amount * 1.9
          setBalance(b => b + win)
          sounds.win()
          toast.success(`🎉 ${drawn} is ${isHot ? '🔥 Hot' : '❄️ Cold'}! Won ${Math.floor(win)} 🪙`)
          logBet('hot-cold', amount, Math.floor(win))
        } else {
          sounds.loss()
          toast.error(`${drawn} is ${isHot ? '🔥 Hot' : '❄️ Cold'}. Lost ${amount} 🪙`)
          logBet('hot-cold', amount, 0)
        }
      }
    }, 80)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🔥 <span className="gold-text">Hot & Cold</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: 'clamp(60px,20vw,90px)', fontWeight: '900', color: result ? (result.isHot ? '#ff4444' : '#44ccff') : 'var(--gold)', textShadow: `0 0 20px ${result ? (result.isHot ? 'rgba(255,68,68,0.4)' : 'rgba(68,204,255,0.4)') : 'rgba(201,162,39,0.4)'}`, transition: 'all 0.3s', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {phase === 'spinning' ? (numbers[numbers.length - 1] || '?') :
                 result ? result.drawn :
                 '?'}
              </div>
              {result && (
                <div style={{ fontSize: '24px', fontWeight: '700', color: result.isHot ? '#ff4444' : '#44ccff' }}>
                  {result.isHot ? '🔥 HOT (55-100)' : '❄️ COLD (1-54)'}
                </div>
              )}
            </div>

            {/* Pick */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {[['hot','🔥 Hot (55-100)','#ff4444','rgba(255,68,68,0.1)'],['cold','❄️ Cold (1-54)','#44ccff','rgba(68,204,255,0.1)']].map(([id, label, color, bg]) => (
                <button key={id} onClick={() => phase === 'bet' && setPick(id)}
                  style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${pick === id ? color : 'var(--border)'}`, background: pick === id ? bg : 'var(--bg-hover)', color: pick === id ? color : 'var(--text-secondary)', fontWeight: '700', fontSize: '14px', cursor: phase === 'bet' ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Pays <strong style={{ color: 'var(--gold)' }}>1.9x</strong> •
              Hot: 46% chance • Cold: 54% chance
            </div>

            {result && (
              <div style={{ marginTop: '14px', padding: '14px', borderRadius: '12px', textAlign: 'center', background: result.won ? 'rgba(0,208,132,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${result.won ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, fontSize: '18px', fontWeight: '900', color: result.won ? '#00d084' : '#ff4444' }}>
                {result.won ? '🎉 You Win! 1.9x' : '❌ You Lose'}
              </div>
            )}
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={() => { setPhase('bet'); setResult(null); setNumbers([]) }} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              🔄 Play Again
            </button>
          ) : (
            <BetPanel onBet={play} disabled={phase !== 'bet'} />
          )}
        </div>
      </div>
    </div>
  )
}
