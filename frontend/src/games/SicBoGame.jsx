import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

function Die({ value, rolling }) {
  const DOT_POS = {
    1: [[50,50]],
    2: [[25,25],[75,75]],
    3: [[25,25],[50,50],[75,75]],
    4: [[25,25],[75,25],[25,75],[75,75]],
    5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
    6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
  }
  const dots = DOT_POS[value] || DOT_POS[1]
  return (
    <div style={{
      width: '80px', height: '80px', background: 'white', borderRadius: '14px',
      border: '2px solid #ddd', position: 'relative', flexShrink: 0,
      boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
      animation: rolling ? 'rollDie 0.15s linear infinite' : 'none',
      transition: 'box-shadow 0.3s'
    }}>
      {dots.map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute', left: `${x - 9}%`, top: `${y - 9}%`,
          width: '18%', height: '18%', background: '#1a1a2e', borderRadius: '50%'
        }} />
      ))}
    </div>
  )
}

export default function SicBoGame() {
  const { balance, setBalance } = useStore()
  const { logBet } = useBet()
  const [dice, setDice] = useState([1, 2, 3])
  const [rolling, setRolling] = useState(false)
  const [bets, setBets] = useState({})
  const [betAmount, setBetAmount] = useState(100)
  const [result, setResult] = useState(null)
  const rollIntervalRef = useRef(null)

  const placeBet = (key) => {
    if (betAmount > balance) return toast.error('Insufficient balance')
    setBets(prev => ({ ...prev, [key]: (prev[key] || 0) + betAmount }))
  }

  const rollDice = () => {
    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0)
    if (!totalBet) return toast.error('Place a bet first!')
    if (totalBet > balance) return toast.error('Insufficient balance')
    setBalance(b => b - totalBet)
    sounds.sicBoShake(); setRolling(true)
    setResult(null)

    let count = 0
    rollIntervalRef.current = setInterval(() => {
      setDice([Math.ceil(Math.random()*6), Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)])
      count++
      if (count > 16) {
        clearInterval(rollIntervalRef.current)
        const final = [Math.ceil(Math.random()*6), Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)]
        setDice(final)
        setRolling(false)
        resolveResult(final, totalBet, { ...bets })
      }
    }, 75)
  }

  const resolveResult = (d, totalBet, currentBets) => {
    const sum = d[0] + d[1] + d[2]
    const isSmall = sum >= 4 && sum <= 10
    const isBig = sum >= 11 && sum <= 17
    const isTriple = d[0] === d[1] && d[1] === d[2]
    const isOdd = sum % 2 !== 0
    let win = 0
    const PAYOUTS = { 4:60,5:30,6:17,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:17,16:30,17:60 }

    Object.entries(currentBets).forEach(([key, amt]) => {
      if (!amt) return
      if (key === 'small' && isSmall && !isTriple) win += amt * 2
      if (key === 'big' && isBig && !isTriple) win += amt * 2
      if (key === 'odd' && isOdd) win += amt * 2
      if (key === 'even' && !isOdd && sum !== 0) win += amt * 2
      if (key === 'triple' && isTriple) win += amt * 30
      if (key === `sum_${sum}`) win += amt * (PAYOUTS[sum] || 6)
    })

    setResult({ sum, isSmall, isBig, isTriple, isOdd })
    if (win > 0) {
      setBalance(b => b + win)
      sounds.win(); sounds.coinCollect()
      toast.success(`Sum: ${sum} — Won ${win} coins!`)
    } else {
      sounds.loss()
      toast.error(`Sum: ${sum} — No win this roll.`)
    }
    setBets({})
  }

  const betBtns = [
    { key: 'small', label: 'Small (4–10)', color: '#4488ff', payout: '1:1' },
    { key: 'big', label: 'Big (11–17)', color: '#ff4444', payout: '1:1' },
    { key: 'odd', label: 'Odd', color: '#9944ff', payout: '1:1' },
    { key: 'even', label: 'Even', color: '#00d084', payout: '1:1' },
    { key: 'triple', label: 'Any Triple', color: '#c9a227', payout: '30:1' },
  ]

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', marginBottom: '20px' }}>
        🎲 <span className="gold-text">Sic Bo</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
              {dice.map((d, i) => <Die key={i} value={d} rolling={rolling} />)}
            </div>
            {result && (
              <div style={{
                display: 'inline-block', padding: '10px 24px', borderRadius: '10px',
                background: result.isTriple ? 'rgba(201,162,39,0.2)' : result.isSmall ? 'rgba(68,136,255,0.15)' : 'rgba(255,68,68,0.15)',
                border: `1px solid ${result.isTriple ? 'rgba(201,162,39,0.4)' : result.isSmall ? 'rgba(68,136,255,0.3)' : 'rgba(255,68,68,0.3)'}`
              }}>
                <div style={{ fontSize: '26px', fontWeight: '900', color: result.isTriple ? '#c9a227' : result.isSmall ? '#4488ff' : '#ff4444' }}>
                  Sum: {result.sum}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {result.isTriple ? 'TRIPLE!' : result.isSmall ? 'Small' : 'Big'} • {result.isOdd ? 'Odd' : 'Even'}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chip Value</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[10, 50, 100, 500].map(v => (
                <button key={v} onClick={() => setBetAmount(v)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
                  background: betAmount === v ? 'rgba(201,162,39,0.2)' : 'var(--bg-hover)',
                  border: `1px solid ${betAmount === v ? 'var(--gold)' : 'var(--border)'}`,
                  color: betAmount === v ? 'var(--gold)' : 'var(--text-secondary)', cursor: 'pointer'
                }}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {betBtns.map(b => (
              <button key={b.key} onClick={() => placeBet(b.key)} style={{
                padding: '12px 8px', borderRadius: '8px', fontWeight: '700',
                background: bets[b.key] ? `${b.color}22` : 'var(--bg-hover)',
                border: `1px solid ${bets[b.key] ? b.color : 'var(--border)'}`,
                color: bets[b.key] ? b.color : 'var(--text-secondary)', cursor: 'pointer', position: 'relative'
              }}>
                <div style={{ fontSize: '13px' }}>{b.label}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{b.payout}</div>
                {bets[b.key] > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: b.color, color: 'white', borderRadius: '10px', fontSize: '10px', padding: '1px 5px', fontWeight: '800' }}>{bets[b.key]}</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '12px' }}>
            {[4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n => (
              <button key={n} onClick={() => placeBet(`sum_${n}`)} style={{
                padding: '8px 2px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                background: bets[`sum_${n}`] ? 'rgba(201,162,39,0.2)' : 'var(--bg-hover)',
                border: `1px solid ${bets[`sum_${n}`] ? 'var(--gold)' : 'var(--border)'}`,
                color: bets[`sum_${n}`] ? 'var(--gold)' : 'var(--text-secondary)', cursor: 'pointer'
              }}>{n}</button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Bet:</span>
            <span style={{ color: 'var(--gold)', fontWeight: '700' }}>{Object.values(bets).reduce((a,b)=>a+b,0)} 🪙</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={rollDice} disabled={rolling} style={{
              flex: 1, padding: '14px', borderRadius: '10px', fontWeight: '800', fontSize: '15px',
              background: rolling ? 'rgba(201,162,39,0.3)' : 'linear-gradient(135deg,#c9a227,#f0c84a)',
              border: 'none', color: rolling ? 'rgba(0,0,0,0.4)' : '#0a0a0f', cursor: rolling ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}>{rolling ? 'Rolling...' : '🎲 Roll Dice'}</button>
            <button onClick={() => setBets({})} style={{ padding: '14px 18px', borderRadius: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Clear</button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Balance</span>
            <span style={{ color: 'var(--gold)', fontWeight: '700' }}>🪙 {balance.toLocaleString()}</span>
          </div>
          <h4 style={{ color: 'var(--gold)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sum Payouts</h4>
          {[{ range:'4 or 17', pay:'60:1'},{range:'5 or 16',pay:'30:1'},{range:'6 or 15',pay:'17:1'},{range:'7 or 14',pay:'12:1'},{range:'8 or 13',pay:'8:1'},{range:'9–12',pay:'6:1'}].map(p => (
            <div key={p.range} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{p.range}</span>
              <span style={{ color: 'var(--gold)', fontWeight: '700' }}>{p.pay}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes rollDie{0%{transform:rotate(0deg) scale(1.05)}25%{transform:rotate(90deg) scale(0.95)}50%{transform:rotate(180deg) scale(1.05)}75%{transform:rotate(270deg) scale(0.95)}100%{transform:rotate(360deg) scale(1)}}`}</style>
    </div>
  )
}
