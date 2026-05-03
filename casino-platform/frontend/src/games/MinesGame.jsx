import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

const GRID = 25
const MINE_OPTS = [3, 5, 10, 15, 20]

function calcMult(revealed, mines) {
  if (revealed === 0) return 1
  const safe = GRID - mines
  let m = 1
  for (let i = 0; i < revealed; i++) m *= (safe - i) / (GRID - i) * (1 / 0.97)
  return Math.max(1.01, parseFloat(m.toFixed(2)))
}

export default function MinesGame() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [mineCount, setMineCount] = useState(5)
  const [state, setState] = useState('idle')
  const [cells, setCells] = useState(Array(GRID).fill(null))
  const [bet, setBet] = useState(0)
  const [found, setFound] = useState(0)
  const [mult, setMult] = useState(1)

  const minesRef = useRef(new Set())
  const betRef = useRef(0)
  const cellsRef = useRef(Array(GRID).fill(null))

  const start = (amount) => {
    const s = new Set()
    while (s.size < mineCount) s.add(Math.floor(Math.random() * GRID))
    minesRef.current = s
    betRef.current = amount
    const fresh = Array(GRID).fill(null)
    cellsRef.current = fresh
    setCells([...fresh])
    setState('playing')
    setBet(amount)
    setFound(0)
    setMult(1)
    setBalance(b => b - amount)
  }

  const reveal = (idx) => {
    if (state !== 'playing') return
    if (cellsRef.current[idx] !== null) return

    const next = [...cellsRef.current]
    if (minesRef.current.has(idx)) {
      next[idx] = 'mine'
      minesRef.current.forEach(m => { next[m] = 'mine' })
      cellsRef.current = next
      setCells([...next])
      setState('lost')
      toast.error(`💣 Mine! Lost ${betRef.current} coins.`)
      return
    }

    next[idx] = 'gem'
    cellsRef.current = next
    setCells([...next])

    const gems = next.filter(c => c === 'gem').length
    setFound(gems)
    const m = calcMult(gems, mineCount)
    setMult(m)

    if (gems === GRID - mineCount) {
      const win = Math.floor(betRef.current * m)
      setBalance(b => b + win)
      sounds.bigWin(); sounds.coinCollect(); setState('won')
      toast.success(`🏆 All gems! +${win} 🪙 at ${m}x`)
      logBet('mines', betRef.current, win)
    }
  }

  const cashout = () => {
    if (state !== 'playing' || found === 0) return
    const win = Math.floor(betRef.current * mult)
    const next = [...cellsRef.current]
    minesRef.current.forEach(m => { if (next[m] === null) next[m] = 'mine' })
    cellsRef.current = next
    setCells([...next])
    setBalance(b => b + win)
    sounds.cashout(); setState('cashout')
    toast.success(`💰 Cashed out at ${mult}x! +${win} 🪙`)
    logBet('mines', betRef.current, win)
  }

  const reset = () => {
    cellsRef.current = Array(GRID).fill(null)
    minesRef.current = new Set()
    setCells(Array(GRID).fill(null))
    setState('idle')
    setFound(0)
    setMult(1)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,26px)', marginBottom: '16px' }}>
        💎 <span className="gold-text">Mines</span>
      </h1>
      <div className="game-layout">
        <div>
          {state === 'playing' && found > 0 && (
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 16px',background:'rgba(0,208,132,0.08)',border:'1px solid rgba(0,208,132,0.3)',borderRadius:'10px',marginBottom:'12px',flexWrap:'wrap',gap:'8px' }}>
              <div>
                <div style={{ color:'var(--text-secondary)',fontSize:'11px' }}>Multiplier</div>
                <div style={{ color:'#00d084',fontSize:'26px',fontWeight:'900',lineHeight:1 }}>{mult}x</div>
              </div>
              <div>
                <div style={{ color:'var(--text-secondary)',fontSize:'11px' }}>Gems</div>
                <div style={{ color:'#00d084',fontSize:'20px',fontWeight:'700' }}>{found}/{GRID-mineCount}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:'var(--text-secondary)',fontSize:'11px' }}>Win if cashout</div>
                <div style={{ color:'#00d084',fontSize:'18px',fontWeight:'700' }}>{Math.floor(bet*mult)} 🪙</div>
              </div>
              <button onClick={cashout} style={{ padding:'10px 18px',background:'linear-gradient(135deg,#00d084,#00a866)',border:'none',borderRadius:'9px',color:'white',fontWeight:'800',fontSize:'13px',cursor:'pointer',boxShadow:'0 4px 14px rgba(0,208,132,0.35)' }}>
                CASHOUT
              </button>
            </div>
          )}

          <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'clamp(5px,1.5vw,10px)',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'clamp(10px,2vw,16px)' }}>
            {cells.map((cell, idx) => {
              const isMine = cell === 'mine'
              const isGem = cell === 'gem'
              const canClick = state === 'playing' && cell === null
              return (
                <button key={idx} onClick={() => reveal(idx)}
                  style={{
                    aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'clamp(16px,4vw,24px)',
                    background: isMine ? 'rgba(255,68,68,0.22)' : isGem ? 'rgba(0,208,132,0.2)' : canClick ? 'var(--bg-hover)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isMine?'#ff4444':isGem?'#00d084':canClick?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)'}`,
                    borderRadius:'8px', cursor:canClick?'pointer':'default',
                    transition:'all 0.15s', outline:'none',
                    boxShadow: isMine?'0 0 10px rgba(255,68,68,0.3)' : isGem?'0 0 10px rgba(0,208,132,0.25)' : 'none'
                  }}
                  onMouseEnter={e => { if(canClick){e.currentTarget.style.background='rgba(201,162,39,0.18)';e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.transform='scale(1.1)'}}}
                  onMouseLeave={e => { if(canClick){e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.transform='scale(1)'}}}
                >
                  {isMine ? '💣' : isGem ? '💎' : canClick ? '' : '·'}
                </button>
              )
            })}
          </div>

          {(state==='won'||state==='lost'||state==='cashout') && (
            <>
              <div style={{ marginTop:'12px',textAlign:'center',padding:'13px',borderRadius:'10px',background:state==='lost'?'rgba(255,68,68,0.1)':'rgba(0,208,132,0.1)',border:`1px solid ${state==='lost'?'rgba(255,68,68,0.3)':'rgba(0,208,132,0.3)'}`,fontSize:'17px',fontWeight:'800',color:state==='lost'?'#ff4444':'#00d084' }}>
                {state==='won'?'🏆 All Gems Found!':state==='cashout'?'💰 Cashed Out!':'💣 Blown Up!'}
              </div>
              <button onClick={reset} className="btn-gold" style={{ width:'100%',marginTop:'10px',padding:'12px' }}>Play Again</button>
            </>
          )}
        </div>

        <div className="game-panel-right">
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'14px' }}>
            <label style={{ color:'var(--text-secondary)',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'8px' }}>💣 Mines Count</label>
            <div style={{ display:'flex',gap:'5px' }}>
              {MINE_OPTS.map(c => (
                <button key={c} onClick={()=>state==='idle'&&setMineCount(c)} disabled={state==='playing'}
                  style={{ flex:1,padding:'8px 4px',borderRadius:'6px',fontSize:'12px',fontWeight:'800',background:mineCount===c?'rgba(255,68,68,0.22)':'var(--bg-hover)',border:`2px solid ${mineCount===c?'#ff4444':'var(--border)'}`,color:mineCount===c?'#ff4444':'var(--text-secondary)',cursor:state==='playing'?'not-allowed':'pointer',opacity:state==='playing'?0.5:1,boxShadow:mineCount===c?'0 0 8px rgba(255,68,68,0.25)':'none' }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ marginTop:'8px',display:'flex',justifyContent:'space-between',fontSize:'11px' }}>
              <span style={{ color:'var(--text-muted)' }}>Safe: {GRID-mineCount}</span>
              <span style={{ color:'var(--gold)' }}>Max: {calcMult(GRID-mineCount,mineCount).toFixed(2)}x</span>
            </div>
          </div>
          <BetPanel onBet={start} disabled={state==='playing'} />
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'13px' }}>
            <h4 style={{ color:'var(--gold)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'8px' }}>Payout ({mineCount} mines)</h4>
            {[1,3,5,10,GRID-mineCount].filter(g=>g<=GRID-mineCount).map(g=>(
              <div key={g} style={{ display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'12px' }}>
                <span style={{ color:'var(--text-secondary)' }}>💎 {g} gem{g>1?'s':''}</span>
                <span style={{ color:'var(--gold)',fontWeight:'700' }}>{calcMult(g,mineCount)}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
