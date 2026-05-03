import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const CHOICES = [
  { id: 'rock',     label: '✊ Rock',     beats: 'scissors', emoji: '✊' },
  { id: 'paper',    label: '✋ Paper',    beats: 'rock',     emoji: '✋' },
  { id: 'scissors', label: '✌️ Scissors', beats: 'paper',    emoji: '✌️' },
]

export default function RockPaperScissors() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [choice, setChoice] = useState(null)
  const [phase, setPhase] = useState('bet')
  const [result, setResult] = useState(null)
  const [houseChoice, setHouseChoice] = useState(null)
  const [betAmt, setBetAmt] = useState(0)
  const [countdown, setCountdown] = useState(null)

  const play = (amount) => {
    if (!choice) return toast.error('Pick Rock, Paper, or Scissors!')
    setBalance(b => b - amount)
    setBetAmt(amount)
    setPhase('reveal')
    setCountdown(3)

    let c = 3
    const cd = setInterval(() => {
      c--
      setCountdown(c)
      sounds.tick()
      if (c === 0) {
        clearInterval(cd)
        sounds.tickFinal()
        const hc = CHOICES[Math.floor(Math.random() * 3)]
        setHouseChoice(hc)
        setCountdown(null)

        const playerChoice = CHOICES.find(c => c.id === choice)
        let outcome
        if (playerChoice.id === hc.id) {
          outcome = 'tie'
          setBalance(b => b + amount) // return bet
          sounds.cardFlip()
          toast('🤝 Tie! Bet returned.')
          logBet('rps', amount, amount)
        } else if (playerChoice.beats === hc.id) {
          outcome = 'win'
          const win = amount * 2
          setBalance(b => b + win)
          sounds.win()
          toast.success(`🎉 ${playerChoice.emoji} beats ${hc.emoji}! Won ${win} 🪙`)
          logBet('rps', amount, win)
        } else {
          outcome = 'lose'
          sounds.loss()
          toast.error(`${hc.emoji} beats ${playerChoice.emoji}! Lost ${amount} 🪙`)
          logBet('rps', amount, 0)
        }
        setResult(outcome)
        setPhase('result')
      }
    }, 700)
  }

  const reset = () => { setPhase('bet'); setResult(null); setHouseChoice(null); setChoice(null); setCountdown(null) }

  const playerChoice = CHOICES.find(c => c.id === choice)

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        ✊ <span className="gold-text">Rock Paper Scissors</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            {/* VS display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: '24px', padding: '20px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>You</div>
                <div style={{ fontSize: 'clamp(50px,15vw,80px)', filter: playerChoice ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'all 0.3s' }}>
                  {playerChoice ? playerChoice.emoji : '❓'}
                </div>
                {playerChoice && <div style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '13px' }}>{playerChoice.label}</div>}
              </div>
              <div style={{ fontSize: 'clamp(18px,5vw,24px)', color: '#444', fontWeight: '900' }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>House</div>
                <div style={{ fontSize: 'clamp(50px,15vw,80px)', transition: 'all 0.3s' }}>
                  {countdown ? countdown : houseChoice ? houseChoice.emoji : '❓'}
                </div>
                {houseChoice && !countdown && <div style={{ color: '#4488ff', fontWeight: '700', fontSize: '13px' }}>{houseChoice.label}</div>}
              </div>
            </div>

            {/* Choices */}
            {(phase === 'bet' || phase === 'reveal') && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                {CHOICES.map(c => (
                  <button key={c.id} onClick={() => phase === 'bet' && setChoice(c.id)}
                    style={{ flex: 1, padding: '14px 8px', borderRadius: '12px', border: `2px solid ${choice === c.id ? 'var(--gold)' : 'var(--border)'}`, background: choice === c.id ? 'rgba(201,162,39,0.15)' : 'var(--bg-hover)', cursor: phase === 'bet' ? 'pointer' : 'default', textAlign: 'center', transition: 'all 0.2s', opacity: phase === 'reveal' ? 0.6 : 1 }}>
                    <div style={{ fontSize: 'clamp(24px,7vw,36px)', marginBottom: '4px' }}>{c.emoji}</div>
                    <div style={{ fontSize: '11px', color: choice === c.id ? 'var(--gold)' : 'var(--text-muted)', fontWeight: '600' }}>
                      {c.id.charAt(0).toUpperCase() + c.id.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {result && (
              <div style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', background: result === 'win' ? 'rgba(0,208,132,0.1)' : result === 'lose' ? 'rgba(255,68,68,0.1)' : 'rgba(201,162,39,0.1)', border: `1px solid ${result === 'win' ? 'rgba(0,208,132,0.3)' : result === 'lose' ? 'rgba(255,68,68,0.3)' : 'rgba(201,162,39,0.3)'}`, fontSize: '20px', fontWeight: '900', color: result === 'win' ? '#00d084' : result === 'lose' ? '#ff4444' : '#c9a227' }}>
                {result === 'win' ? '🎉 You Win! 2x' : result === 'lose' ? '😞 House Wins' : '🤝 Tie — Bet Returned'}
              </div>
            )}
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={reset} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              🔄 Play Again
            </button>
          ) : (
            <BetPanel onBet={play} disabled={phase !== 'bet' || !choice} />
          )}
        </div>
      </div>
    </div>
  )
}
