import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import sounds from '../utils/sounds'

export default function BetPanel({ onBet, disabled, minBet = 10, maxBet = 10000, extraContent, noAuto = false, showCashoutAt = false, onCashoutAtChange }) {
  const { balance, user } = useStore()
  const [betAmount, setBetAmount] = useState(100)
  const [autoMode, setAutoMode] = useState(false)
  // Reset auto mode if noAuto prop changes
  React.useEffect(() => { if(noAuto) setAutoMode(false) }, [noAuto])
  const [autoBets, setAutoBets] = useState(10)
  const [autoDelay, setAutoDelay] = useState(2)
  const [autoRunning, setAutoRunning] = useState(false)
  const [autoCount, setAutoCount] = useState(0)
  const [stopOnWin, setStopOnWin] = useState(false)
  const [stopOnLoss, setStopOnLoss] = useState(false)
  const [cashoutAt, setCashoutAt] = useState(2.0)
  React.useEffect(() => { if (onCashoutAtChange) onCashoutAtChange(cashoutAt) }, [cashoutAt])
  const autoRef = useRef(null)
  const autoCountRef = useRef(0)
  const autoRunRef = useRef(false)

  const quickAmounts = [50, 100, 500, 1000, 5000]

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(autoRef.current)
      autoRunRef.current = false
    }
  }, [])

  const handleBet = () => {
    sounds.betPlace()
    if (!user || betAmount < minBet || betAmount > balance || disabled) return
    onBet(betAmount)
  }

  const startAuto = () => {
    sounds.betPlace()
    if (!user || betAmount < minBet || betAmount > balance) return
    setAutoRunning(true)
    autoRunRef.current = true
    autoCountRef.current = 0
    setAutoCount(0)
    runNextAuto()
  }

  const stopAuto = () => {
    setAutoRunning(false)
    autoRunRef.current = false
    clearTimeout(autoRef.current)
  }

  const runNextAuto = () => {
    if (!autoRunRef.current) return
    const currentCount = autoCountRef.current
    if (currentCount >= autoBets) {
      setAutoRunning(false)
      autoRunRef.current = false
      return
    }
    // Check balance
    const currentBalance = useStore.getState().balance
    if (betAmount > currentBalance) {
      setAutoRunning(false)
      autoRunRef.current = false
      return
    }
    autoCountRef.current = currentCount + 1
    setAutoCount(currentCount + 1)
    onBet(betAmount)

    autoRef.current = setTimeout(() => {
      runNextAuto()
    }, autoDelay * 1000)
  }

  const canBet = user && betAmount >= minBet && betAmount <= balance && !disabled

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%'
    }}>
      {/* Balance */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '9px 13px',
        background: 'rgba(201,162,39,0.07)', borderRadius: '8px',
        border: '1px solid rgba(201,162,39,0.15)'
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Balance</span>
        <span style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '15px' }}>
          🪙 {Number(balance).toLocaleString()}
        </span>
      </div>

      {/* Manual / Auto tabs - hidden when noAuto=true */}
      {!noAuto &&
      <div style={{ display: 'flex', gap: '6px' }}>
        {['Manual', 'Auto'].map(tab => (
          <button key={tab} onClick={() => { setAutoMode(tab === 'Auto'); stopAuto() }} style={{
            flex: 1, padding: '8px', borderRadius: '7px', fontSize: '13px', fontWeight: '700',
            background: (tab === 'Auto') === autoMode ? 'rgba(201,162,39,0.2)' : 'var(--bg-hover)',
            border: `1px solid ${(tab === 'Auto') === autoMode ? 'var(--gold)' : 'var(--border)'}`,
            color: (tab === 'Auto') === autoMode ? 'var(--gold)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>{tab}</button>
        ))}
      </div>}
      {noAuto && false /* auto mode forced off */}

      {/* Bet Amount */}
      <div>
        <label style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
          Bet Amount
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setBetAmount(Math.max(minBet, Math.floor(betAmount / 2)))} style={{
            background: 'var(--bg-hover)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: '6px', padding: '7px 10px', fontSize: '12px',
            minWidth: '36px'
          }}>½</button>
          <input
            type="number" value={betAmount}
            onChange={e => setBetAmount(Math.max(0, Number(e.target.value)))}
            min={minBet} max={Math.min(maxBet, balance)}
            style={{
              flex: 1, background: 'var(--bg-hover)', border: '1px solid var(--border)',
              color: 'white', borderRadius: '8px', padding: '7px 10px',
              fontSize: '15px', fontWeight: '700', textAlign: 'center', outline: 'none',
              minWidth: 0
            }}
          />
          <button onClick={() => setBetAmount(Math.min(maxBet, balance, betAmount * 2))} style={{
            background: 'var(--bg-hover)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: '6px', padding: '7px 10px', fontSize: '12px',
            minWidth: '36px'
          }}>2x</button>
        </div>
      </div>

      {/* Quick Amounts */}
      <div className="quick-amounts" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {quickAmounts.map(a => (
          <button key={a} onClick={() => setBetAmount(a)} style={{
            flex: 1, minWidth: '40px',
            background: betAmount === a ? 'rgba(201,162,39,0.2)' : 'var(--bg-hover)',
            border: `1px solid ${betAmount === a ? 'var(--gold)' : 'var(--border)'}`,
            color: betAmount === a ? 'var(--gold)' : 'var(--text-secondary)',
            borderRadius: '6px', padding: '5px 3px', fontSize: '11px', fontWeight: '600'
          }}>{a >= 1000 ? `${a/1000}K` : a}</button>
        ))}
        <button onClick={() => setBetAmount(balance)} style={{
          flex: 1, minWidth: '40px',
          background: 'var(--bg-hover)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', borderRadius: '6px', padding: '5px 3px', fontSize: '11px', fontWeight: '600'
        }}>MAX</button>
      </div>

      {/* Auto Bet Options */}
      {autoMode && !noAuto && (
        <div style={{
          background: 'rgba(153,68,255,0.08)', border: '1px solid rgba(153,68,255,0.25)',
          borderRadius: '10px', padding: '12px',
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                Number of Bets
              </label>
              <input type="number" value={autoBets} onChange={e => setAutoBets(Math.max(1, Number(e.target.value)))}
                min={1} max={1000}
                style={{
                  width: '100%', padding: '7px 10px', background: 'var(--bg-hover)',
                  border: '1px solid var(--border)', borderRadius: '7px',
                  color: 'white', fontSize: '14px', fontWeight: '700', outline: 'none', textAlign: 'center'
                }} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
                Delay (sec)
              </label>
              <input type="number" value={autoDelay} onChange={e => setAutoDelay(Math.max(0.5, Number(e.target.value)))}
                min={0.5} max={10} step={0.5}
                style={{
                  width: '100%', padding: '7px 10px', background: 'var(--bg-hover)',
                  border: '1px solid var(--border)', borderRadius: '7px',
                  color: 'white', fontSize: '14px', fontWeight: '700', outline: 'none', textAlign: 'center'
                }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ label: 'Stop on Win', val: stopOnWin, set: setStopOnWin }, { label: 'Stop on Loss', val: stopOnLoss, set: setStopOnLoss }].map(({ label, val, set }) => (
              <button key={label} onClick={() => set(!val)} style={{
                flex: 1, padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                background: val ? 'rgba(201,162,39,0.2)' : 'var(--bg-hover)',
                border: `1px solid ${val ? 'var(--gold)' : 'var(--border)'}`,
                color: val ? 'var(--gold)' : 'var(--text-secondary)', cursor: 'pointer'
              }}>{val ? '✓ ' : ''}{label}</button>
            ))}
          </div>

          {showCashoutAt && (
            <div>
              <label style={{ color:'var(--text-secondary)',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>
                Auto Cashout At
              </label>
              <div style={{ display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'6px' }}>
                {[1.5,2,3,5,10,20].map(m=>(
                  <button key={m} onClick={()=>setCashoutAt(m)}
                    style={{ padding:'4px 8px',borderRadius:'5px',fontSize:'11px',fontWeight:'700',cursor:'pointer',
                      background:cashoutAt===m?'rgba(153,68,255,0.25)':'var(--bg-hover)',
                      border:`1px solid ${cashoutAt===m?'#9944ff':'var(--border)'}`,
                      color:cashoutAt===m?'#9944ff':'#666' }}>
                    {m}x
                  </button>
                ))}
              </div>
              <input type="number" value={cashoutAt} onChange={e=>setCashoutAt(Math.max(1.01,Number(e.target.value)))} step="0.1" min="1.01"
                style={{ width:'100%',padding:'7px 10px',background:'var(--bg-hover)',border:'1px solid rgba(153,68,255,0.3)',
                  borderRadius:'7px',color:'#9944ff',fontSize:'14px',fontWeight:'700',outline:'none',textAlign:'center' }} />
            </div>
          )}
          {autoRunning && (
            <div style={{
              background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)',
              borderRadius: '8px', padding: '8px 12px', textAlign: 'center'
            }}>
              <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: '700' }}>
                🔄 Bet {autoCount} / {autoBets}
              </span>
            </div>
          )}
        </div>
      )}

      {extraContent}

      {/* Bet / Auto Button */}
      {(!autoMode || noAuto) ? (
        <button onClick={handleBet} disabled={!canBet} style={{
          width: '100%', padding: '13px',
          background: !canBet ? 'rgba(201,162,39,0.25)' : 'linear-gradient(135deg,#c9a227,#f0c84a)',
          border: 'none', borderRadius: '10px',
          color: !canBet ? 'rgba(10,10,15,0.5)' : '#0a0a0f',
          fontSize: '15px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase',
          transition: 'all 0.3s',
          cursor: !canBet ? 'not-allowed' : 'pointer'
        }}>
          {!user ? 'Login to Bet' : betAmount > balance ? 'Low Balance' : disabled ? 'Game Running...' : `Bet ${betAmount.toLocaleString()} 🪙`}
        </button>
      ) : (
        <button
          onClick={autoRunning ? stopAuto : startAuto}
          disabled={!autoRunning && !canBet}
          style={{
            width: '100%', padding: '13px', border: 'none', borderRadius: '10px',
            background: autoRunning
              ? 'linear-gradient(135deg,#ff4444,#cc2222)'
              : !canBet ? 'rgba(153,68,255,0.2)' : 'linear-gradient(135deg,#9944ff,#7722cc)',
            color: (!autoRunning && !canBet) ? 'rgba(255,255,255,0.3)' : 'white',
            fontSize: '15px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase',
            cursor: (!autoRunning && !canBet) ? 'not-allowed' : 'pointer'
          }}>
          {autoRunning ? `⏹ Stop Auto (${autoCount}/${autoBets})` : `▶ Start Auto (${autoBets}x)`}
        </button>
      )}

      {betAmount > balance && user && (
        <p style={{ color: 'var(--red)', fontSize: '11px', textAlign: 'center', marginTop: '-6px' }}>
          Insufficient balance
        </p>
      )}
    </div>
  )
}
