import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SUITS = ['♠','♥','♦','♣']
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const makeDeck = () => SUITS.flatMap(s=>RANKS.map((r,i)=>({s,r,v:i+2}))).sort(()=>Math.random()-0.5)
const isRed = c => c.s==='♥'||c.s==='♦'

function BigCard({ card, flipped }) {
  return (
    <div style={{ width:'clamp(80px,22vw,120px)',height:'clamp(112px,30vw,168px)', background: flipped ? 'linear-gradient(135deg,#1a1a4e,#2a2a8e)' : 'white', borderRadius:'12px', border:'3px solid #ccc', padding:'8px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', transition:'all 0.3s', animation: !flipped ? 'flipCard 0.4s ease' : 'none' }}>
      {!flipped && card && <>
        <div style={{fontSize:'clamp(12px,3vw,17px)',fontWeight:'900',color:isRed(card)?'#cc2222':'#111'}}>{card.r}</div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(30px,9vw,52px)',color:isRed(card)?'#cc2222':'#111'}}>{card.s}</div>
        <div style={{fontSize:'clamp(12px,3vw,17px)',fontWeight:'900',color:isRed(card)?'#cc2222':'#111',alignSelf:'flex-end',transform:'rotate(180deg)'}}>{card.r}</div>
      </>}
    </div>
  )
}

export default function WarGame() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [playerCard, setPlayerCard] = useState(null)
  const [dealerCard, setDealerCard] = useState(null)
  const [result, setResult] = useState(null)
  const [flipped, setFlipped] = useState(true)
  const [betAmt, setBetAmt] = useState(0)
  const [warPhase, setWarPhase] = useState(false)

  const deal = (amount) => {
    setBalance(b => b - amount)
    setBetAmt(amount)
    setFlipped(true)
    setPlayerCard(null); setDealerCard(null); setResult(null); setWarPhase(false)
    setPhase('dealing')
    sounds.cardDeal()

    const deck = makeDeck()
    const pc = deck[0], dc = deck[1]
    setPlayerCard(pc)

    setTimeout(() => {
      setFlipped(false)
      setDealerCard(dc)
      sounds.cardReveal()
      setTimeout(() => resolve(pc, dc, amount), 600)
    }, 600)
  }

  const resolve = (pc, dc, amount) => {
    if (pc.v > dc.v) {
      const win = amount * 2
      setBalance(b => b + win)
      setResult('win')
      sounds.win()
      toast.success(`🎉 ${pc.r} beats ${dc.r}! Won ${win} 🪙`)
      logBet('war', amount, win)
    } else if (dc.v > pc.v) {
      setResult('lose')
      sounds.loss()
      toast.error(`${dc.r} beats ${pc.r}! Lost ${amount} 🪙`)
      logBet('war', amount, 0)
    } else {
      // Tie — return bet
      setBalance(b => b + amount)
      setResult('tie')
      sounds.cardFlip()
      toast('⚔️ WAR! Tie — bet returned', { icon: '⚔️' })
      logBet('war', amount, amount)
    }
    setPhase('result')
  }

  const reset = () => { setPhase('bet'); setPlayerCard(null); setDealerCard(null); setResult(null); setWarPhase(false) }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '16px' }}>
        ⚔️ <span className="gold-text">War</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background: 'radial-gradient(ellipse,#1a2a4a,#0d1a2e)', border: '2px solid var(--gold)', borderRadius: '16px', padding: '28px', textAlign: 'center', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase' }}>You</div>
                <BigCard card={playerCard} flipped={!playerCard} />
                {playerCard && <div style={{ marginTop: '8px', fontWeight: '700', color: 'var(--gold)', fontSize: '14px' }}>{playerCard.r} of {playerCard.s}</div>}
              </div>

              <div style={{ fontSize: 'clamp(28px,8vw,44px)', color: result === 'win' ? '#00d084' : result === 'lose' ? '#ff4444' : result === 'tie' ? '#c9a227' : '#444', fontWeight: '900', transition: 'color 0.3s' }}>
                {result === 'win' ? '🏆' : result === 'lose' ? '💔' : result === 'tie' ? '⚔️' : 'VS'}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase' }}>Dealer</div>
                <BigCard card={dealerCard} flipped={flipped || !dealerCard} />
                {dealerCard && !flipped && <div style={{ marginTop: '8px', fontWeight: '700', color: '#4488ff', fontSize: '14px' }}>{dealerCard.r} of {dealerCard.s}</div>}
              </div>
            </div>

            {result && (
              <div style={{ padding: '14px 24px', borderRadius: '12px', display: 'inline-block', margin: '0 auto', background: result === 'win' ? 'rgba(0,208,132,0.12)' : result === 'lose' ? 'rgba(255,68,68,0.1)' : 'rgba(201,162,39,0.1)', border: `1px solid ${result === 'win' ? 'rgba(0,208,132,0.3)' : result === 'lose' ? 'rgba(255,68,68,0.3)' : 'rgba(201,162,39,0.3)'}`, fontSize: '18px', fontWeight: '900', color: result === 'win' ? '#00d084' : result === 'lose' ? '#ff4444' : '#c9a227' }}>
                {result === 'win' ? '🏆 You Win! 2x' : result === 'lose' ? '💔 Dealer Wins' : '⚔️ WAR — Tie!'}
              </div>
            )}

            {phase === 'bet' && (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Higher card wins! • Pays <strong style={{ color: 'var(--gold)' }}>2x</strong> • Tie = bet returned
              </div>
            )}
          </div>
        </div>
        <div className="game-panel-right">
          {phase === 'result' ? (
            <button onClick={reset} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              ⚔️ Next Battle
            </button>
          ) : (
            <BetPanel onBet={deal} disabled={phase !== 'bet'} />
          )}
        </div>
      </div>
      <style>{`@keyframes flipCard{from{transform:rotateY(90deg)}to{transform:rotateY(0)}}`}</style>
    </div>
  )
}
