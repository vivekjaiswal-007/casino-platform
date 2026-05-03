import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SYMBOLS = [
  { sym: '💎', value: 50, color: '#44ccff' },
  { sym: '🌟', value: 25, color: '#f0c84a' },
  { sym: '🍀', value: 15, color: '#00d084' },
  { sym: '🎯', value: 10, color: '#ff8800' },
  { sym: '🔮', value: 8,  color: '#9944ff' },
  { sym: '🎲', value: 5,  color: '#4488ff' },
  { sym: '🍒', value: 3,  color: '#ff4444' },
  { sym: '💰', value: 2,  color: '#c9a227' },
]

function generateCard() {
  // 3x3 grid, sometimes 3 of a kind
  const hasJackpot = Math.random() < 0.3
  if (hasJackpot) {
    const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    const grid = Array(9).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    const pos = [0,1,2,3,4,5,6,7,8].sort(() => Math.random()-0.5).slice(0,3)
    pos.forEach(p => grid[p] = sym)
    return grid
  }
  return Array(9).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
}

export default function ScratchCard() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [grid, setGrid] = useState([])
  const [revealed, setRevealed] = useState(Array(9).fill(false))
  const [betAmt, setBetAmt] = useState(0)
  const [winAmt, setWinAmt] = useState(0)
  const [autoRevealing, setAutoRevealing] = useState(false)

  const startGame = (amount) => {
    setBalance(b => b - amount)
    setBetAmt(amount)
    const g = generateCard()
    setGrid(g)
    setRevealed(Array(9).fill(false))
    setPhase('scratch')
    setWinAmt(0)
    sounds.betPlace()
  }

  const reveal = (idx) => {
    if (phase !== 'scratch' || revealed[idx]) return
    sounds.cardFlip()
    const newRev = [...revealed]; newRev[idx] = true; setRevealed(newRev)
    if (newRev.every(Boolean)) checkWin(newRev)
  }

  const revealAll = () => {
    if (autoRevealing) return
    setAutoRevealing(true)
    let i = 0
    const not = revealed.map((r, idx) => !r ? idx : -1).filter(x => x >= 0)
    const interval = setInterval(() => {
      if (i >= not.length) { clearInterval(interval); setAutoRevealing(false); checkWin(Array(9).fill(true)); return }
      sounds.cardFlip()
      const newRev = [...revealed]
      not.slice(0, i+1).forEach(idx => newRev[idx] = true)
      setRevealed(newRev); i++
    }, 120)
  }

  const checkWin = (rev) => {
    if (!rev.every(Boolean) || !grid.length) return
    // Check for 3 matching in row, col, or diagonal
    const lines = [
      [0,1,2],[3,4,5],[6,7,8], // rows
      [0,3,6],[1,4,7],[2,5,8], // cols
      [0,4,8],[2,4,6],          // diags
    ]
    let totalWin = 0
    const wins = []
    lines.forEach(line => {
      const syms = line.map(i => grid[i]?.sym)
      if (syms[0] === syms[1] && syms[1] === syms[2]) {
        const sym = SYMBOLS.find(s => s.sym === syms[0])
        if (sym) { totalWin += betAmt * sym.value; wins.push(`${syms[0]} x3 = ${sym.value}x`) }
      }
    })
    setWinAmt(totalWin)
    setPhase('result')
    if (totalWin > 0) {
      setBalance(b => b + totalWin)
      sounds.bigWin()
      toast.success(`🎉 Won ${totalWin} 🪙! ${wins.join(', ')}`)
      logBet('scratch-card', betAmt, totalWin)
    } else {
      sounds.loss()
      toast.error(`No match. Lost ${betAmt} 🪙`)
      logBet('scratch-card', betAmt, 0)
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🎴 <span className="gold-text">Scratch Card</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            {phase === 'bet' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '60px', marginBottom: '12px' }}>🎴</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Match 3 symbols to win!</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>💎 = 50x • 🌟 = 25x • 🍀 = 15x • 🎯 = 10x</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '14px' }}>
                  {Array(9).fill(null).map((_, i) => (
                    <button key={i} onClick={() => reveal(i)}
                      style={{ aspectRatio: '1', borderRadius: '12px', border: `2px solid ${revealed[i] ? grid[i]?.color+'44' : 'var(--border)'}`, background: revealed[i] ? `${grid[i]?.color}18` : 'linear-gradient(135deg,#2a2a3a,#1a1a2e)', cursor: revealed[i] ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(24px,8vw,40px)', transition: 'all 0.2s', transform: revealed[i] ? 'scale(1)' : 'scale(1)', position: 'relative', overflow: 'hidden' }}>
                      {revealed[i] ? (
                        <div style={{ textAlign: 'center' }}>
                          <div>{grid[i]?.sym}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '28px', color: '#444' }}>?</div>
                      )}
                    </button>
                  ))}
                </div>

                {phase === 'scratch' && !revealed.every(Boolean) && (
                  <button onClick={revealAll} disabled={autoRevealing}
                    style={{ width: '100%', padding: '11px', borderRadius: '9px', background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', color: 'var(--gold)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}>
                    ⚡ Reveal All
                  </button>
                )}

                {phase === 'result' && (
                  <div style={{ textAlign: 'center', padding: '14px', borderRadius: '10px', background: winAmt > 0 ? 'rgba(0,208,132,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${winAmt > 0 ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, fontSize: '18px', fontWeight: '900', color: winAmt > 0 ? '#00d084' : '#ff4444' }}>
                    {winAmt > 0 ? `🎉 Won ${winAmt} 🪙!` : `❌ No match — Lost ${betAmt} 🪙`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={() => { setPhase('bet'); setGrid([]); setRevealed(Array(9).fill(false)) }} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              🎴 New Card
            </button>
          ) : (
            <BetPanel onBet={startGame} disabled={phase !== 'bet'} />
          )}
        </div>
      </div>
    </div>
  )
}
