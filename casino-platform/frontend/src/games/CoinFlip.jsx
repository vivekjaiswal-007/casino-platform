import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

export default function CoinFlip() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [side, setSide] = useState('heads')
  const [phase, setPhase] = useState('bet')
  const [result, setResult] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const rafRef = useRef(null)
  const rotRef = useRef(0)

  const flip = (amount) => {
    setBalance(b => b - amount)
    setPhase('flipping')
    setSpinning(true)
    setResult(null)

    const outcome = Math.random() < 0.5 ? 'heads' : 'tails'
    let speed = 30, rot = rotRef.current

    const animate = () => {
      rot += speed
      rotRef.current = rot
      setRotation(rot)
      speed *= 0.985
      if (speed > 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        // Snap to final face
        const finalRot = outcome === 'heads' ? Math.ceil(rot / 180) * 180 : Math.ceil(rot / 180) * 180 + 90
        setRotation(finalRot)
        rotRef.current = finalRot
        setSpinning(false)
        setResult(outcome)
        setPhase('result')

        const won = outcome === side
        if (won) {
          const win = amount * 2
          setBalance(b => b + win)
          sounds.win()
          toast.success(`🎉 ${outcome.toUpperCase()}! Won ${win} 🪙`)
          logBet('coin-flip', amount, win)
        } else {
          sounds.loss()
          toast.error(`${outcome.toUpperCase()}! Lost ${amount} 🪙`)
          logBet('coin-flip', amount, 0)
        }
      }
    }
    rafRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const faceUp = (rotation % 360) < 180 ? 'heads' : 'tails'

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🪙 <span className="gold-text">Coin Flip</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            {/* Coin */}
            <div style={{ perspective: '400px', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: 'clamp(100px,30vw,140px)', height: 'clamp(100px,30vw,140px)', position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${rotation}deg)`, transition: spinning ? 'none' : 'transform 0.3s' }}>
                {/* Heads */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '50%', background: 'linear-gradient(135deg,#f0c84a,#c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(201,162,39,0.4), inset 0 2px 4px rgba(255,255,255,0.3)', border: '4px solid #9a7a10' }}>
                  <span style={{ fontSize: 'clamp(32px,10vw,48px)' }}>♛</span>
                </div>
                {/* Tails */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '50%', background: 'linear-gradient(135deg,#c0c0c0,#888)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotateY(180deg)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '4px solid #666' }}>
                  <span style={{ fontSize: 'clamp(32px,10vw,48px)' }}>🦅</span>
                </div>
              </div>
            </div>

            {/* Pick side */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              {['heads', 'tails'].map(s => (
                <button key={s} onClick={() => phase === 'bet' && setSide(s)}
                  style={{ padding: '12px 28px', borderRadius: '10px', fontWeight: '800', fontSize: '15px', textTransform: 'capitalize', cursor: phase === 'bet' ? 'pointer' : 'default', background: side === s ? 'rgba(201,162,39,0.18)' : 'var(--bg-hover)', border: `2px solid ${side === s ? 'var(--gold)' : 'var(--border)'}`, color: side === s ? 'var(--gold)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  {s === 'heads' ? '♛ Heads' : '🦅 Tails'}
                </button>
              ))}
            </div>

            {phase === 'result' && result && (
              <div style={{ padding: '16px', borderRadius: '12px', background: result === side ? 'rgba(0,208,132,0.12)' : 'rgba(255,68,68,0.1)', border: `1px solid ${result === side ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, fontSize: '20px', fontWeight: '900', color: result === side ? '#00d084' : '#ff4444' }}>
                {result === side ? `🎉 ${result.toUpperCase()} — You Win!` : `😞 ${result.toUpperCase()} — You Lose`}
              </div>
            )}

            {phase === 'flipping' && (
              <div style={{ color: 'var(--gold)', fontSize: '16px', fontWeight: '700' }}>Flipping...</div>
            )}

            {phase === 'bet' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Pick a side, then place your bet! Pays <strong style={{ color: 'var(--gold)' }}>2x</strong>
              </div>
            )}
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={() => { setPhase('bet'); setResult(null) }} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              🔄 Flip Again
            </button>
          ) : (
            <BetPanel onBet={flip} disabled={phase !== 'bet'} />
          )}
        </div>
      </div>
    </div>
  )
}
