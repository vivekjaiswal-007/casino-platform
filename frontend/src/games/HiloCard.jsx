import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SUITS = ['♠','♥','♦','♣']
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const makeDeck = () => SUITS.flatMap(s=>RANKS.map(r=>({s,r}))).sort(()=>Math.random()-0.5)
const isRed = c => c.s==='♥'||c.s==='♦'
const rv = r => RANKS.indexOf(r)

export default function HiloCard() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [deck, setDeck] = useState([])
  const [current, setCurrent] = useState(null)
  const [next, setNext] = useState(null)
  const [streak, setStreak] = useState(0)
  const [mult, setMult] = useState(1)
  const [bet, setBet] = useState(0)
  const [history, setHistory] = useState([])
  const [revealing, setRevealing] = useState(false)

  const start = (amount) => {
    setBalance(b => b - amount)
    setBet(amount)
    const d = makeDeck()
    setCurrent(d[0]); setDeck(d.slice(1))
    setStreak(0); setMult(1)
    setHistory([]); setNext(null)
    setPhase('playing')
    sounds.cardDeal()
  }

  const guess = (dir) => {
    if (phase !== 'playing' || revealing) return
    setRevealing(true)
    const n = deck[0]
    const rest = deck.slice(1)
    setNext(n)
    sounds.cardReveal()

    setTimeout(() => {
      const cv = rv(current.r), nv = rv(n.r)
      const correct = dir === 'higher' ? nv > cv : nv < cv
      const same = nv === cv

      if (same) {
        toast('Same card! No change', { icon: '🤝', duration: 800 })
        setCurrent(n); setDeck(rest); setNext(null); setRevealing(false)
        return
      }

      if (correct) {
        const newMult = parseFloat((mult * 1.6).toFixed(2))
        setMult(newMult); setStreak(s => s + 1)
        setHistory(h => [...h, { card: n, dir, correct: true }])
        setCurrent(n); setDeck(rest); setNext(null); setRevealing(false)
        sounds.win()
        toast.success(`✅ ${dir==='higher'?'Higher':'Lower'}! ${newMult}x`, { duration: 700 })
      } else {
        setHistory(h => [...h, { card: n, dir, correct: false }])
        setPhase('lost')
        setRevealing(false)
        sounds.loss()
        toast.error(`❌ Wrong! Lost ${bet} 🪙`)
        logBet('hilo-card', bet, 0)
      }
    }, 500)
  }

  const cashout = () => {
    const win = Math.floor(bet * mult)
    setBalance(b => b + win)
    setPhase('cashed')
    sounds.cashout()
    toast.success(`💰 Cashed out at ${mult}x! Won ${win} 🪙`)
    logBet('hilo-card', bet, win)
  }

  const Card = ({ card, size = 'lg' }) => {
    if (!card) return null
    const w = size === 'lg' ? 'clamp(70px,18vw,100px)' : 'clamp(36px,10vw,52px)'
    const h = size === 'lg' ? 'clamp(98px,25vw,140px)' : 'clamp(50px,14vw,74px)'
    const fs = size === 'lg' ? 'clamp(11px,3vw,16px)' : 'clamp(8px,2vw,11px)'
    const ss = size === 'lg' ? 'clamp(24px,7vw,38px)' : 'clamp(14px,4vw,22px)'
    return (
      <div style={{ width:w,height:h,background:'white',borderRadius:'10px',border:'2px solid #ccc',padding:'5px',boxShadow:'0 6px 20px rgba(0,0,0,0.4)',display:'flex',flexDirection:'column',animation:'dealCard 0.3s ease' }}>
        <div style={{ fontSize:fs,fontWeight:'900',color:isRed(card)?'#cc2222':'#111' }}>{card.r}</div>
        <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:ss,color:isRed(card)?'#cc2222':'#111' }}>{card.s}</div>
        <div style={{ fontSize:fs,fontWeight:'900',color:isRed(card)?'#cc2222':'#111',alignSelf:'flex-end',transform:'rotate(180deg)' }}>{card.r}</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(20px,5vw,28px)', marginBottom:'16px' }}>
        🃏 <span className="gold-text">Hilo Card</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background:'radial-gradient(ellipse,#1a2a4a,#0d1a2e)', border:'2px solid var(--gold)', borderRadius:'16px', padding:'20px', marginBottom:'12px', minHeight:'260px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            {phase === 'bet' ? (
              <div style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'15px' }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>🃏</div>
                Place bet to start!
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'16px' }}>
                  {history.slice(-2).map((h,i) => (
                    <div key={i} style={{ opacity: 0.4 }}>
                      <Card card={h.card} size="sm" />
                    </div>
                  ))}
                  {history.length > 0 && <div style={{ color:'#555', fontSize:'18px' }}>→</div>}
                  <Card card={current} size="lg" />
                  {next && <>
                    <div style={{ color:'var(--gold)', fontSize:'18px' }}>→</div>
                    <Card card={next} size="lg" />
                  </>}
                </div>

                <div style={{ display:'flex', gap:'16px', fontSize:'14px', color:'var(--text-secondary)' }}>
                  <span>Streak: <strong style={{ color:'var(--gold)' }}>{streak}</strong></span>
                  <span>Multiplier: <strong style={{ color:'#00d084' }}>{mult}x</strong></span>
                  <span>Win: <strong style={{ color:'#c9a227' }}>🪙{Math.floor(bet*mult)}</strong></span>
                </div>

                {(phase === 'lost' || phase === 'cashed') && (
                  <div style={{ marginTop:'14px', padding:'12px 24px', borderRadius:'10px', background: phase==='cashed'?'rgba(0,208,132,0.12)':'rgba(255,68,68,0.1)', border:`1px solid ${phase==='cashed'?'rgba(0,208,132,0.3)':'rgba(255,68,68,0.3)'}`, fontSize:'18px', fontWeight:'900', color: phase==='cashed'?'#00d084':'#ff4444' }}>
                    {phase==='cashed' ? `💰 Won ${Math.floor(bet*mult)} 🪙` : `💥 Wrong guess!`}
                  </div>
                )}
              </>
            )}
          </div>

          {phase === 'playing' && (
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => guess('higher')} style={{ flex:1,padding:'14px',borderRadius:'10px',background:'rgba(0,208,132,0.12)',border:'1px solid rgba(0,208,132,0.3)',color:'#00d084',fontWeight:'800',fontSize:'15px',cursor:'pointer' }}>
                ⬆️ Higher
              </button>
              <button onClick={cashout} style={{ padding:'14px 18px',borderRadius:'10px',background:'rgba(201,162,39,0.12)',border:'1px solid rgba(201,162,39,0.3)',color:'var(--gold)',fontWeight:'800',fontSize:'14px',cursor:'pointer',whiteSpace:'nowrap' }}>
                💰 {mult}x
              </button>
              <button onClick={() => guess('lower')} style={{ flex:1,padding:'14px',borderRadius:'10px',background:'rgba(255,68,68,0.1)',border:'1px solid rgba(255,68,68,0.3)',color:'#ff4444',fontWeight:'800',fontSize:'15px',cursor:'pointer' }}>
                ⬇️ Lower
              </button>
            </div>
          )}
        </div>
        <div className="game-panel-right">
          {(phase === 'lost' || phase === 'cashed') && (
            <button onClick={() => { setPhase('bet'); setCurrent(null); setNext(null); setHistory([]) }} className="btn-gold" style={{ width:'100%',padding:'14px',fontSize:'15px',marginBottom:'12px' }}>
              🔄 New Game
            </button>
          )}
          <BetPanel onBet={start} disabled={phase !== 'bet'} />
        </div>
      </div>
      <style>{`@keyframes dealCard{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
