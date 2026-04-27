import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SUITS = ['♠','♥','♦','♣']
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const makeDeck = () => SUITS.flatMap(s => RANKS.map(r => ({s,r}))).sort(()=>Math.random()-0.5)
const isRed = c => c.s === '♥' || c.s === '♦'
const rankVal = r => RANKS.indexOf(r)

const PAYOUTS = [
  { name:'Royal Flush',    check: h => isStraightFlush(h) && rankVal(h[4].r)===12,                        pay: 250, color:'#f0c84a' },
  { name:'Straight Flush', check: h => isStraightFlush(h),                                                 pay: 50,  color:'#9944ff' },
  { name:'Four of a Kind', check: h => getGroups(h)[0]===4,                                                pay: 25,  color:'#ff4444' },
  { name:'Full House',     check: h => getGroups(h)[0]===3 && getGroups(h)[1]===2,                        pay: 9,   color:'#ff8800' },
  { name:'Flush',          check: h => isFlush(h),                                                         pay: 6,   color:'#4488ff' },
  { name:'Straight',       check: h => isStraight(h),                                                      pay: 4,   color:'#00d084' },
  { name:'Three of a Kind',check: h => getGroups(h)[0]===3,                                                pay: 3,   color:'#c9a227' },
  { name:'Two Pair',       check: h => getGroups(h)[0]===2 && getGroups(h)[1]===2,                        pay: 2,   color:'#888' },
  { name:'Jacks or Better',check: h => getGroups(h)[0]===2 && highPair(h),                                pay: 1,   color:'#666' },
]

function getGroups(h) {
  const c={}; h.forEach(card=>c[card.r]=(c[card.r]||0)+1)
  return Object.values(c).sort((a,b)=>b-a)
}
function isFlush(h) { return h.every(c=>c.s===h[0].s) }
function isStraight(h) {
  const vals = h.map(c=>rankVal(c.r)).sort((a,b)=>a-b)
  if(vals[4]-vals[0]===4 && new Set(vals).size===5) return true
  if(vals.join(',') === '0,1,2,3,12') return true
  return false
}
function isStraightFlush(h) { return isFlush(h) && isStraight(h) }
function highPair(h) {
  const c={}; h.forEach(card=>c[card.r]=(c[card.r]||0)+1)
  return Object.entries(c).some(([r,n])=>n===2&&['J','Q','K','A'].includes(r))
}
function evalHand(h) {
  const sorted = [...h].sort((a,b)=>rankVal(a.r)-rankVal(b.r))
  for (const p of PAYOUTS) { if (p.check(sorted)) return p }
  return null
}

function Card({ card, held, onClick, phase }) {
  const w = 'clamp(52px,13vw,72px)', h = 'clamp(74px,18vw,102px)'
  return (
    <div onClick={onClick} style={{ position:'relative', cursor: phase==='hold'?'pointer':'default' }}>
      <div style={{ width:w, height:h, background:'white', borderRadius:'8px', border:`3px solid ${held?'#c9a227':'#ccc'}`, padding:'4px', display:'flex', flexDirection:'column', boxShadow: held?'0 0 12px rgba(201,162,39,0.5)':'0 4px 12px rgba(0,0,0,0.4)', transition:'all 0.2s', transform: held?'translateY(-8px)':'none' }}>
        <div style={{fontSize:'clamp(9px,2.5vw,13px)',fontWeight:'900',color:isRed(card)?'#cc2222':'#111'}}>{card.r}</div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(16px,5vw,26px)',color:isRed(card)?'#cc2222':'#111'}}>{card.s}</div>
        <div style={{fontSize:'clamp(9px,2.5vw,13px)',fontWeight:'900',color:isRed(card)?'#cc2222':'#111',alignSelf:'flex-end',transform:'rotate(180deg)'}}>{card.r}</div>
      </div>
      {held && <div style={{ position:'absolute', bottom:'-22px', left:'50%', transform:'translateX(-50%)', fontSize:'10px', fontWeight:'700', color:'#c9a227', whiteSpace:'nowrap' }}>HOLD</div>}
    </div>
  )
}

export default function VideoPoker() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [hand, setHand] = useState([])
  const [held, setHeld] = useState([false,false,false,false,false])
  const [deck, setDeck] = useState([])
  const [result, setResult] = useState(null)
  const [betAmt, setBetAmt] = useState(0)

  const deal = (amount) => {
    setBalance(b => b - amount)
    setBetAmt(amount)
    const d = makeDeck()
    setHand(d.slice(0,5))
    setDeck(d.slice(5))
    setHeld([false,false,false,false,false])
    setResult(null)
    setPhase('hold')
    sounds.cardShuffle()
  }

  const toggleHold = (i) => {
    if (phase !== 'hold') return
    sounds.cardFlip()
    setHeld(prev => { const n=[...prev]; n[i]=!n[i]; return n })
  }

  const draw = () => {
    const newDeck = [...deck]
    const newHand = hand.map((c, i) => held[i] ? c : newDeck.pop())
    setHand(newHand)
    setDeck(newDeck)
    setPhase('result')
    sounds.cardDeal()

    const win = evalHand(newHand)
    if (win) {
      const payout = betAmt * win.pay
      setBalance(b => b + payout)
      sounds.bigWin()
      toast.success(`🎉 ${win.name}! Won ${payout} 🪙`)
      logBet('video-poker', betAmt, payout)
      setResult(win)
    } else {
      sounds.loss()
      toast.error(`No winning hand. Lost ${betAmt} 🪙`)
      logBet('video-poker', betAmt, 0)
      setResult(null)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        🎰 <span className="gold-text">Video Poker</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'radial-gradient(ellipse,#1a4a2a,#0d2e1a)', border: '2px solid var(--gold)', borderRadius: '16px', padding: '20px', marginBottom: '14px' }}>
            {hand.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.4)', fontSize:'16px' }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>🃏</div>
                Place your bet to deal!
              </div>
            ) : (
              <>
                <div style={{ display:'flex', gap:'clamp(6px,2vw,12px)', justifyContent:'center', marginBottom:'20px' }}>
                  {hand.map((card, i) => (
                    <Card key={i} card={card} held={held[i]} onClick={() => toggleHold(i)} phase={phase} />
                  ))}
                </div>
                <div style={{ height:'22px', display:'flex', justifyContent:'center', alignItems:'center', marginBottom:'8px' }}>
                  {result && <span style={{ color: result.color, fontWeight:'800', fontSize:'16px' }}>✨ {result.name}! {result.pay}x</span>}
                  {phase === 'hold' && <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>Tap cards to hold them</span>}
                </div>
              </>
            )}
          </div>

          {/* Paytable */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'10px', padding:'12px' }}>
            <div style={{ color:'var(--text-secondary)', fontSize:'11px', marginBottom:'8px', fontWeight:'600', textTransform:'uppercase' }}>Paytable</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'4px 16px' }}>
              {PAYOUTS.slice(0,6).map(p => (
                <React.Fragment key={p.name}>
                  <span style={{ fontSize:'12px', color: result?.name===p.name ? p.color : '#666' }}>{p.name}</span>
                  <span style={{ fontSize:'12px', fontWeight:'700', color: result?.name===p.name ? p.color : '#555' }}>{p.pay}x</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="game-panel-right" style={{ marginTop: held.some(Boolean) ? '30px' : '0' }}>
          {phase === 'hold' && (
            <button onClick={draw} className="btn-gold" style={{ width:'100%', padding:'14px', fontSize:'15px', marginBottom:'12px' }}>
              🃏 Draw Cards
            </button>
          )}
          {phase === 'result' && (
            <button onClick={() => { setPhase('bet'); setHand([]); setResult(null) }} className="btn-gold" style={{ width:'100%', padding:'14px', fontSize:'15px', marginBottom:'12px' }}>
              🔄 New Game
            </button>
          )}
          <BetPanel onBet={deal} disabled={phase !== 'bet'} />
        </div>
      </div>
    </div>
  )
}
