import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SYMS = [
  { s:'7️⃣', v:77,  w:3  },
  { s:'💰', v:20,  w:6  },
  { s:'🍀', v:10,  w:10 },
  { s:'⭐', v:7,   w:14 },
  { s:'🔔', v:5,   w:18 },
  { s:'🍋', v:3,   w:25 },
  { s:'🍒', v:2,   w:34 },
]
const POOL = SYMS.flatMap(s => Array(s.w).fill(s))

export default function Lucky7s() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [reels, setReels] = useState([['🍒','🍒','🍒'],['🍋','🍋','🍋'],['🔔','🔔','🔔']])
  const [spinning, setSpinning] = useState(false)
  const [phase, setPhase] = useState('bet')
  const [win, setWin] = useState(null)
  const [betAmt, setBetAmt] = useState(0)

  const spin = (amount) => {
    if (spinning) return
    setBalance(b => b - amount)
    setBetAmt(amount)
    setSpinning(true)
    setPhase('spinning')
    setWin(null)
    sounds.slotSpin()

    // Generate final results
    const results = Array(3).fill(null).map(() => {
      const mid = POOL[Math.floor(Math.random() * POOL.length)]
      return [
        POOL[Math.floor(Math.random() * POOL.length)].s,
        mid,
        POOL[Math.floor(Math.random() * POOL.length)].s,
      ]
    })

    // Animate each reel stopping
    results.forEach((res, i) => {
      const delay = 800 + i * 500
      const spinInterval = setInterval(() => {
        setReels(prev => {
          const n = [...prev]
          n[i] = [
            POOL[Math.floor(Math.random() * POOL.length)].s,
            POOL[Math.floor(Math.random() * POOL.length)].s,
            POOL[Math.floor(Math.random() * POOL.length)].s,
          ]
          return n
        })
      }, 80)

      setTimeout(() => {
        clearInterval(spinInterval)
        sounds.slotStop()
        setReels(prev => {
          const n = [...prev]
          n[i] = [res[0], res[1].s, res[2]]
          return n
        })
        if (i === 2) {
          setTimeout(() => {
            const midSyms = results.map(r => r[1])
            let totalWin = 0
            if (midSyms[0].s === midSyms[1].s && midSyms[1].s === midSyms[2].s) {
              totalWin = amount * midSyms[0].v
              sounds.jackpot()
              toast.success(`🎰 ${midSyms[0].s}${midSyms[0].s}${midSyms[0].s} — Won ${totalWin} 🪙!`)
            } else if (midSyms.filter(s => s.s === '7️⃣').length === 2) {
              totalWin = amount * 10
              sounds.win()
              toast.success(`7️⃣7️⃣ Two 7s! Won ${totalWin} 🪙!`)
            } else if (midSyms.some(s => s.s === '7️⃣')) {
              totalWin = amount * 2
              sounds.win()
              toast.success(`7️⃣ Lucky 7! Won ${totalWin} 🪙!`)
            } else {
              sounds.loss()
              toast.error('No match. Try again!')
            }

            if (totalWin > 0) { setBalance(b => b + totalWin); logBet('lucky-7s', amount, totalWin) }
            else logBet('lucky-7s', amount, 0)

            setWin(totalWin)
            setSpinning(false)
            setPhase('result')
          }, 200)
        }
      }, delay)
    })
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        7️⃣ <span className="gold-text">Lucky 7s</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'radial-gradient(ellipse,#1a1a2e,#0d0d18)', border: '3px solid var(--gold)', borderRadius: '20px', padding: '24px', marginBottom: '14px', textAlign: 'center' }}>
            {/* Reels */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              {reels.map((reel, ri) => (
                <div key={ri} style={{ background: '#0a0a14', border: '2px solid #2a2a3a', borderRadius: '12px', padding: '8px', overflow: 'hidden', height: 'clamp(130px,35vw,180px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 'clamp(70px,20vw,100px)' }}>
                  {reel.map((sym, si) => (
                    <div key={si} style={{ fontSize: 'clamp(24px,7vw,38px)', lineHeight: '1.4', textAlign: 'center', opacity: si === 1 ? 1 : 0.35, background: si === 1 && !spinning ? 'rgba(201,162,39,0.08)' : 'transparent', borderRadius: '6px', padding: '2px' }}>
                      {sym}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Pay line indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ height: '2px', flex: 1, background: 'rgba(201,162,39,0.4)' }} />
              <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '600', whiteSpace: 'nowrap' }}>PAY LINE</span>
              <div style={{ height: '2px', flex: 1, background: 'rgba(201,162,39,0.4)' }} />
            </div>

            {win !== null && (
              <div style={{ fontSize: '20px', fontWeight: '900', color: win > 0 ? '#00d084' : '#ff4444' }}>
                {win > 0 ? `🎉 +${win} 🪙` : '❌ No match'}
              </div>
            )}
          </div>

          {/* Paytable */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Paytable</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '6px' }}>
              {SYMS.slice(0,4).map(s => (
                <div key={s.s} style={{ padding: '5px 10px', background: 'var(--bg-hover)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{s.s}{s.s}{s.s}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: '700' }}>{s.v}x</span>
                </div>
              ))}
              <div style={{ padding: '5px 10px', background: 'var(--bg-hover)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>7️⃣7️⃣</span><span style={{ color: '#c9a227', fontWeight: '700' }}>10x</span>
              </div>
              <div style={{ padding: '5px 10px', background: 'var(--bg-hover)', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>7️⃣</span><span style={{ color: '#888', fontWeight: '700' }}>2x</span>
              </div>
            </div>
          </div>
        </div>
        <div className="game-panel-right">
          <BetPanel onBet={spin} disabled={spinning} />
        </div>
      </div>
    </div>
  )
}
