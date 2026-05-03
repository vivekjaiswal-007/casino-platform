import React, { useState, useEffect, useRef, useCallback } from 'react'
import AIDealer from '../components/AIDealer'
import LiveRoundBar from '../components/LiveRoundBar'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

const SUITS = ['♠','♥','♦','♣']
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

function makeDeck() {
  const d = []
  for (const s of SUITS) for (const r of RANKS) d.push({ suit:s, rank:r })
  return d.sort(() => Math.random() - 0.5)
}

function isRed(card) { return card.suit==='♥'||card.suit==='♦' }

function CardEl({ card, hidden, size='md' }) {
  const w = size==='sm'?48:size==='md'?64:100
  const h = size==='sm'?68:size==='md'?90:140
  const fs = size==='sm'?9:size==='md'?11:16
  const symFs = size==='sm'?16:size==='md'?22:42
  return (
    <div style={{
      width:w, height:h, background: hidden?'linear-gradient(135deg,#1a1a4e,#2a2a8e)':'white',
      borderRadius:'7px', border:'2px solid #ccc', padding:'4px',
      boxShadow:'0 4px 12px rgba(0,0,0,0.4)', flexShrink:0,
      display:'flex', flexDirection:'column', animation:'dealCard 0.3s ease both'
    }}>
      {!hidden && card && <>
        <div style={{fontSize:fs,fontWeight:'900',color:isRed(card)?'#cc2222':'#111'}}>{card.rank}</div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:symFs,color:isRed(card)?'#cc2222':'#111'}}>{card.suit}</div>
        <div style={{fontSize:fs,fontWeight:'900',color:isRed(card)?'#cc2222':'#111',alignSelf:'flex-end',transform:'rotate(180deg)'}}>{card.rank}</div>
      </>}
    </div>
  )
}

/* ──────────── BLACKJACK ──────────── */
function bj21(hand) {
  let t=0, aces=0
  for (const c of hand) {
    if (['J','Q','K'].includes(c.rank)) t+=10
    else if (c.rank==='A') { t+=11; aces++ }
    else t+=parseInt(c.rank)
  }
  while (t>21&&aces>0){t-=10;aces--}
  return t
}

export function BlackjackGame() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [deck, setDeck] = useState([])
  const [player, setPlayer] = useState([])
  const [dealer, setDealer] = useState([])
  const [bet, setBet] = useState(0)
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')

  const deal = (amount) => {
    setBalance(b=>b-amount)  // deduct bet
    setDealerPhase('shuffling')
    setTimeout(() => setDealerPhase('dealing'), 700)
    const d = makeDeck()
    const p=[d.pop(),d.pop()], dl=[d.pop(),d.pop()]
    setDeck(d); setPlayer(p); setDealer(dl); setBet(amount)
    setPhase('playing'); setResult(null); setMsg('')
    setTimeout(() => setDealerPhase('waiting'), 1400)
    if (bj21(p)===21) setTimeout(()=>end(p,dl,d,'bj'),400)
  }

  const hit = () => {
    const d=[...deck], card=d.pop(), np=[...player,card]
    setDeck(d); setPlayer(np)
    const t=bj21(np)
    if (t>21) setTimeout(()=>end(np,dealer,d,'bust'),300)
    else if (t===21) setTimeout(()=>standWith(np,d),300)
  }

  const standWith = (ph=player, d=deck) => {
    let dh=[...dealer], dk=[...d]
    while(bj21(dh)<17) dh.push(dk.pop())
    setDealer(dh); setDeck(dk); end(ph,dh,dk)
  }

  const dbl = () => {
    if (player.length>2) return
    const d=[...deck], card=d.pop(), np=[...player,card]
    setDeck(d); setPlayer(np)
    setBalance(b=>b-bet)  // deduct extra bet for double down
    setBet(b=>b*2)
    setTimeout(()=>standWith(np,d),300)
  }

  const end = (ph, dh, d, special) => {
    setPhase('result')
    const pt=bj21(ph), dt=bj21(dh)
    let outcome, pay
    if (special==='bj') { outcome='bj'; pay=Math.floor(bet*2.5); setMsg('🃏 Blackjack! 3:2') }
    else if (special==='bust'||pt>21) { outcome='lose'; pay=0; setMsg('💥 Bust!') }
    else if (dt>21) { outcome='win'; pay=bet*2; setMsg('🎉 Dealer busts!') }
    else if (pt>dt) { outcome='win'; pay=bet*2; setMsg('🎉 You win!') }
    else if (pt===dt) { outcome='push'; pay=bet; setMsg('🤝 Push') }
    else { outcome='lose'; pay=0; setMsg('😞 Dealer wins') }
    setResult(outcome)
    if (pay>0) setBalance(b=>b+pay)
    logBet('blackjack', bet, pay)
    setDealerPhase(outcome==='win'||outcome==='bj' ? 'lose' : outcome==='lose' ? 'win' : 'tie')
    if (outcome==='win'||outcome==='bj') { sounds.win(); toast.success(`Won ${pay} coins!`) }
    else if (outcome==='lose') { sounds.loss(); toast.error(`Dealer wins. Lost ${bet} 🪙`) }
    else toast('Push — bet returned')
  }

  const col = result==='win'||result==='bj'?'#00d084':result==='push'?'#c9a227':'#ff4444'

  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'28px',marginBottom:'20px'}}>🃏 <span className="gold-text">Blackjack</span></h1>
      <div className="game-layout">
        <div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>
            <AIDealer phase={dealerPhase} compact={true} />
          </div>
          <div style={{background:'radial-gradient(ellipse,#1a4a2a,#0d2e1a)',border:'3px solid var(--gold)',borderRadius:'20px',padding:'30px',minHeight:'420px',boxShadow:'inset 0 0 60px rgba(0,0,0,0.5)'}}>
            {phase==='bet'&&<div style={{textAlign:'center',paddingTop:'60px'}}><div style={{fontSize:'60px',marginBottom:'14px'}}>🃏</div><p style={{color:'rgba(255,255,255,0.55)',fontSize:'16px'}}>Place your bet to deal</p><p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px',marginTop:'8px'}}>Blackjack pays 3:2 • Dealer stands soft 17</p></div>}
            {phase!=='bet'&&<>
              <div style={{marginBottom:'18px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                  <span style={{color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>Dealer</span>
                  <span style={{padding:'2px 10px',borderRadius:'20px',fontWeight:'700',fontSize:'14px',background:result?`${col}20`:'rgba(255,255,255,0.07)',color:result?col:'white',border:`1px solid ${result?col+'40':'rgba(255,255,255,0.12)'}`}}>{phase==='playing'?'?':bj21(dealer)}</span>
                </div>
                <div style={{display:'flex',gap:'8px'}}>{dealer.map((c,i)=><CardEl key={i} card={c} hidden={phase==='playing'&&i===1} size="md"/>)}</div>
              </div>
              {result&&<div style={{textAlign:'center',padding:'10px',borderRadius:'10px',background:`${col}18`,border:`1px solid ${col}40`,marginBottom:'14px',fontSize:'18px',fontWeight:'800',color:col}}>{msg}</div>}
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                  <span style={{color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>You</span>
                  <span style={{padding:'2px 10px',borderRadius:'20px',fontWeight:'700',fontSize:'14px',background:'rgba(0,208,132,0.12)',color:'#00d084',border:'1px solid rgba(0,208,132,0.3)'}}>{bj21(player)}</span>
                </div>
                <div style={{display:'flex',gap:'8px'}}>{player.map((c,i)=><CardEl key={i} card={c} size="md"/>)}</div>
              </div>
            </>}
          </div>
          {phase==='playing'&&<div style={{display:'flex',gap:'10px',marginTop:'14px'}}>
            {[{l:'👊 Hit',fn:hit,col:'#4488ff'},{l:'✋ Stand',fn:()=>standWith(),col:'#ff4444'},{l:'2x Double',fn:dbl,col:'#c9a227',dis:player.length>2}].map(({l,fn,col,dis})=>(
              <button key={l} onClick={fn} disabled={dis} style={{flex:1,padding:'13px',borderRadius:'10px',fontWeight:'800',fontSize:'14px',border:`2px solid ${col}`,background:dis?'transparent':`${col}18`,color:dis?'rgba(255,255,255,0.25)':col,cursor:dis?'not-allowed':'pointer'}}>{l}</button>
            ))}
          </div>}
          {phase==='result'&&<button onClick={()=>setPhase('bet')} className="btn-gold" style={{width:'100%',marginTop:'14px',padding:'14px'}}>New Hand</button>}
        </div>
        <BetPanel onBet={deal} disabled={phase!=='bet'}/>
      </div>
      <style>{`@keyframes dealCard{from{opacity:0;transform:translateY(-25px) rotate(-4deg)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ──────────── BACCARAT ──────────── */
function bacVal(c){if(['J','Q','K'].includes(c.rank))return 0;if(c.rank==='A')return 1;return Math.min(parseInt(c.rank),9)}
function bacHand(h){return h.reduce((s,c)=>(s+bacVal(c))%10,0)}

export function BaccaratGame() {
  const { balance, setBalance } = useStore()
  const { logBet } = useBet()
  const [dealerPhase, setDealerPhase] = useState('idle')

  // Live round state
  const [roundPhase, setRoundPhase] = useState('betting') // betting|locked|result|next
  const [countdown, setCountdown] = useState(10)
  const [roundId, setRoundId] = useState(Math.floor(Math.random()*90000)+10000)
  const cdRef = useRef(10)
  const phaseRef = useRef('betting')
  const timerRef = useRef(null)

  // Game state
  const [pCards, setPCards] = useState([])
  const [bCards, setBCards] = useState([])
  const [betSide, setBetSide] = useState(null)
  const [betAmt, setBetAmt] = useState(0)
  const [betPlaced, setBetPlaced] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const betRef = useRef({ side: null, amt: 0, placed: false })

  const bacHand = (cards) => {
    let t = cards.reduce((s,c) => {
      const v = ['10','J','Q','K'].includes(c.rank) ? 0 : c.rank==='A' ? 1 : parseInt(c.rank)
      return s + v
    }, 0)
    return t % 10
  }

  const runRound = useCallback(() => {
    // Deal cards
    const d = makeDeck()
    let pc=[d[0],d[2]], bc=[d[1],d[3]], rem=d.slice(4)
    let pv=bacHand(pc), bv=bacHand(bc)
    if(pv<=5){pc.push(rem.shift());pv=bacHand(pc)}
    if(bv<=5){bc.push(rem.shift());bv=bacHand(bc)}
    setPCards(pc); setBCards(bc)
    const winner = pv>bv?'player':bv>pv?'banker':'tie'
    setResult({ winner, pv, bv })
    setDealerPhase('dealing')

    // Settle bets
    const b = betRef.current
    if (b.placed && b.side) {
      let win = 0
      if(b.side===winner){ win = b.side==='tie'?b.amt*9:b.side==='banker'?Math.floor(b.amt*1.95):b.amt*2 }
      if(win>0){
        setBalance(v=>v+win); sounds.win(); sounds.coinCollect()
        toast.success(`${winner.toUpperCase()} wins! +${win} 🪙`)
        logBet('baccarat', b.amt, win)
        setDealerPhase('lose')
      } else {
        sounds.loss()
        toast.error(`${winner.toUpperCase()} wins. Lost ${b.amt} 🪙`)
        logBet('baccarat', b.amt, 0)
        setDealerPhase('win')
      }
    }
    setHistory(h => [winner, ...h.slice(0,11)])
  }, [setBalance, logBet])

  // Live round timer
  useEffect(() => {
    const BETTING = 10, LOCK = 1, RESULT = 4, NEXT = 1

    const tick = () => {
      if (phaseRef.current === 'betting') {
        cdRef.current--
        setCountdown(cdRef.current)
        if (cdRef.current <= 3 && cdRef.current > 0) sounds.tickFinal()
        if (cdRef.current <= 0) { phaseRef.current = 'locked'; setRoundPhase('locked'); cdRef.current = LOCK }
      } else if (phaseRef.current === 'locked') {
        cdRef.current--
        if (cdRef.current <= 0) {
          phaseRef.current = 'result'; setRoundPhase('result')
          cdRef.current = RESULT
          runRound()
        }
      } else if (phaseRef.current === 'result') {
        cdRef.current--
        if (cdRef.current <= 0) { phaseRef.current = 'next'; setRoundPhase('next'); cdRef.current = NEXT }
      } else if (phaseRef.current === 'next') {
        cdRef.current--
        if (cdRef.current <= 0) {
          // Reset for next round
          phaseRef.current = 'betting'; setRoundPhase('betting')
          cdRef.current = BETTING; setCountdown(BETTING)
          setRoundId(r => r+1)
          setPCards([]); setBCards([]); setResult(null)
          betRef.current = { side: null, amt: 0, placed: false }
          setBetPlaced(false); setBetSide(null); setBetAmt(0)
          setDealerPhase('idle')
          sounds.tick()
        }
      }
    }
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [runRound])

  const placeBet = (side, amount) => {
    if (phaseRef.current !== 'betting') return toast.error('Betting closed!')
    if (betRef.current.placed) return toast.error('Bet already placed!')
    if (amount > balance) return toast.error('Insufficient balance')
    setBalance(b => b-amount)
    betRef.current = { side, amt: amount, placed: true }
    setBetSide(side); setBetAmt(amount); setBetPlaced(true)
    setDealerPhase('shuffling')
    sounds.betPlace()
    toast.success(`🎴 Bet ${amount} on ${side.toUpperCase()}!`, { duration: 1500 })
  }

  const sides = [
    {id:'player', label:'Player', pay:'1:1', col:'#4488ff'},
    {id:'banker', label:'Banker', pay:'0.95:1', col:'#ff4444'},
    {id:'tie', label:'Tie', pay:'8:1', col:'#00d084'},
  ]

  const [betInput, setBetInput] = useState(100)
  const canBet = roundPhase === 'betting' && !betPlaced

  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(18px,4vw,26px)',marginBottom:'10px'}}>
        🎴 <span className="gold-text">Baccarat</span>
      </h1>
      <LiveRoundBar phase={roundPhase} countdown={countdown} roundId={roundId} color="#c9a227" />

      <div className="game-layout">
        <div>
          {/* Dealer */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}>
            <AIDealer phase={dealerPhase} compact={true} />
          </div>

          {/* Table */}
          <div style={{background:'radial-gradient(ellipse,#1a4a2a,#0d2e1a)',border:'2px solid var(--gold)',borderRadius:'16px',padding:'20px',minHeight:'280px'}}>
            {/* History pills */}
            <div style={{display:'flex',gap:'4px',marginBottom:'14px',flexWrap:'wrap'}}>
              {history.map((h,i)=>(
                <span key={i} style={{width:'20px',height:'20px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'800',flexShrink:0,background:h==='player'?'#4488ff':h==='banker'?'#ff4444':'#00d084',color:'white'}}>
                  {h==='player'?'P':h==='banker'?'B':'T'}
                </span>
              ))}
            </div>

            {/* Cards */}
            {(pCards.length>0||bCards.length>0) ? (
              <div style={{display:'flex',gap:'20px',justifyContent:'center',flexWrap:'wrap'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{color:'rgba(255,255,255,0.6)',fontSize:'11px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Banker</div>
                  <div style={{display:'flex',gap:'6px',justifyContent:'center'}}>
                    {bCards.map((card,i)=><CardEl key={i} card={card} size="md"/>)}
                  </div>
                  {result && <div style={{marginTop:'8px',fontSize:'20px',fontWeight:'900',color:result.winner==='banker'?'#c9a227':'rgba(255,255,255,0.5)'}}>{result.bv}</div>}
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{color:'rgba(255,255,255,0.6)',fontSize:'11px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>Player</div>
                  <div style={{display:'flex',gap:'6px',justifyContent:'center'}}>
                    {pCards.map((card,i)=><CardEl key={i} card={card} size="md"/>)}
                  </div>
                  {result && <div style={{marginTop:'8px',fontSize:'20px',fontWeight:'900',color:result.winner==='player'?'#c9a227':'rgba(255,255,255,0.5)'}}>{result.pv}</div>}
                </div>
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'40px 0',color:'rgba(255,255,255,0.35)',fontSize:'14px'}}>
                {roundPhase==='betting' ? '🎴 Place your bet — Cards will be dealt when bets close' : '⏳ Preparing next round...'}
              </div>
            )}

            {/* Result banner */}
            {result && (
              <div style={{textAlign:'center',marginTop:'14px',padding:'12px',borderRadius:'10px',background:result.winner==='player'?'rgba(68,136,255,0.2)':result.winner==='banker'?'rgba(255,68,68,0.2)':'rgba(0,208,132,0.2)',border:`1px solid ${result.winner==='player'?'rgba(68,136,255,0.4)':result.winner==='banker'?'rgba(255,68,68,0.4)':'rgba(0,208,132,0.4)'}`,fontSize:'18px',fontWeight:'900',color:result.winner==='player'?'#6699ff':result.winner==='banker'?'#ff6666':'#00d084'}}>
                {result.winner==='player'?'👤 PLAYER WINS':result.winner==='banker'?'🏦 BANKER WINS':'🤝 TIE!'}
                {betPlaced && betSide && (
                  <div style={{fontSize:'13px',marginTop:'4px',color:betSide===result.winner?'#00d084':'#ff6666'}}>
                    {betSide===result.winner ? `✅ You won!` : `❌ You lost ${betAmt} 🪙`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bet panel */}
        <div className="game-panel-right">
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'14px'}}>
            <div style={{fontSize:'11px',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'10px'}}>
              {canBet ? `⏱ ${countdown}s to place bet` : roundPhase==='locked'?'🔒 Bets Closed':roundPhase==='result'?'📊 Result':roundPhase==='next'?'⏳ Next round soon...':''}
            </div>

            {/* Side buttons */}
            <div style={{display:'flex',gap:'6px',marginBottom:'12px'}}>
              {sides.map(s=>(
                <button key={s.id} onClick={()=>canBet&&setBetSide(s.id)} disabled={!canBet}
                  style={{flex:1,padding:'10px 4px',borderRadius:'8px',border:`2px solid ${betSide===s.id?s.col:'var(--border)'}`,background:betSide===s.id?`${s.col}20`:'var(--bg-hover)',color:betSide===s.id?s.col:'var(--text-secondary)',fontWeight:'700',fontSize:'12px',cursor:canBet?'pointer':'not-allowed',opacity:canBet?1:0.6,transition:'all 0.2s'}}>
                  <div>{s.label}</div>
                  <div style={{fontSize:'10px',opacity:0.7}}>{s.pay}</div>
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{marginBottom:'10px'}}>
              <label style={{display:'block',color:'var(--text-muted)',fontSize:'10px',fontWeight:'600',marginBottom:'5px',textTransform:'uppercase'}}>Bet Amount</label>
              <div style={{display:'flex',gap:'5px'}}>
                <button onClick={()=>setBetInput(v=>Math.max(10,Math.floor(v/2)))} style={{padding:'6px 10px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'#888',cursor:'pointer'}}>½</button>
                <input type="number" value={betInput} onChange={e=>setBetInput(Math.max(1,Number(e.target.value)))}
                  style={{flex:1,padding:'8px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'white',fontSize:'14px',fontWeight:'700',outline:'none',textAlign:'center'}} />
                <button onClick={()=>setBetInput(v=>Math.min(balance,v*2))} style={{padding:'6px 10px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'#888',cursor:'pointer'}}>2x</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px',marginTop:'5px'}}>
                {[50,100,500,1000].map(a=>(
                  <button key={a} onClick={()=>setBetInput(a)}
                    style={{padding:'5px',borderRadius:'5px',border:`1px solid ${betInput===a?'var(--gold)':'var(--border)'}`,background:betInput===a?'rgba(201,162,39,0.15)':'var(--bg-hover)',color:betInput===a?'var(--gold)':'#666',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>
                    {a>=1000?`${a/1000}K`:a}
                  </button>
                ))}
              </div>
            </div>

            {/* Balance */}
            <div style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'rgba(201,162,39,0.07)',borderRadius:'7px',border:'1px solid rgba(201,162,39,0.15)',marginBottom:'10px'}}>
              <span style={{color:'var(--text-secondary)',fontSize:'12px'}}>Balance</span>
              <span style={{color:'var(--gold)',fontWeight:'700'}}>🪙 {balance.toLocaleString()}</span>
            </div>

            {/* Bet button */}
            {!betPlaced ? (
              <button onClick={()=>betSide&&placeBet(betSide,betInput)} disabled={!canBet||!betSide||betInput>balance}
                style={{width:'100%',padding:'13px',border:'none',borderRadius:'10px',background:canBet&&betSide&&betInput<=balance?'linear-gradient(135deg,#c9a227,#f0c84a)':'rgba(201,162,39,0.15)',color:canBet&&betSide&&betInput<=balance?'#0a0a0f':'rgba(255,255,255,0.3)',fontSize:'14px',fontWeight:'900',cursor:canBet&&betSide?'pointer':'not-allowed',textTransform:'uppercase'}}>
                {!betSide?'Pick a side first':!canBet?'Wait for next round':`Bet ${betInput.toLocaleString()} on ${betSide.toUpperCase()}`}
              </button>
            ) : (
              <div style={{padding:'12px',background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.3)',borderRadius:'10px',textAlign:'center'}}>
                <div style={{color:'var(--gold)',fontWeight:'700',fontSize:'13px'}}>
                  ✅ {betAmt.toLocaleString()} on {betSide?.toUpperCase()}
                </div>
                <div style={{color:'#666',fontSize:'11px',marginTop:'2px'}}>Waiting for result...</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes dealCard{from{opacity:0;transform:translateY(-20px) rotate(-5deg)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

export function TeenPattiGame() {
  const { balance, setBalance } = useStore()
  const { logBet } = useBet()
  const [dealerPhase, setDealerPhase] = useState('idle')
  const [roundPhase, setRoundPhase] = useState('betting')
  const [countdown, setCountdown] = useState(10)
  const [roundId, setRoundId] = useState(Math.floor(Math.random()*90000)+10000)
  const cdRef = useRef(10), phaseRef = useRef('betting')
  const [pCards, setPCards] = useState([])
  const [dCards, setDCards] = useState([])
  const [betPlaced, setBetPlaced] = useState(false)
  const [betAmt, setBetAmt] = useState(0)
  const [betInput, setBetInput] = useState(100)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const betRef = useRef({ amt: 0, placed: false })

  const runRound = () => {
    const d = makeDeck()
    const pc = [d[0],d[2],d[4]], dc = [d[1],d[3],d[5]]
    setPCards(pc); setDCards(dc)
    setDealerPhase('dealing')
    const pr = tpRank(pc), dr = tpRank(dc)
    const outcome = pr.score>dr.score?'win':dr.score>pr.score?'lose':'tie'
    setResult({ outcome, pr, dr })
    setHistory(h => [outcome, ...h.slice(0,11)])
    const b = betRef.current
    if (b.placed) {
      if(outcome==='win'){const w=b.amt*2;setBalance(v=>v+w);sounds.win();logBet('teen-patti',b.amt,w);toast.success(`${pr.name}! +${w} 🪙`);setDealerPhase('lose')}
      else if(outcome==='lose'){sounds.loss();logBet('teen-patti',b.amt,0);toast.error(`Dealer ${dr.name}! Lost ${b.amt} 🪙`);setDealerPhase('win')}
      else{setBalance(v=>v+b.amt);logBet('teen-patti',b.amt,b.amt);toast('🤝 Tie! Returned');setDealerPhase('tie')}
    }
  }

  useEffect(() => {
    const BETTING=10,LOCK=1,RESULT=5,NEXT=1
    const tick = () => {
      if(phaseRef.current==='betting'){
        cdRef.current--; setCountdown(cdRef.current)
        if(cdRef.current<=3&&cdRef.current>0)sounds.tickFinal()
        if(cdRef.current<=0){phaseRef.current='locked';setRoundPhase('locked');cdRef.current=LOCK}
      } else if(phaseRef.current==='locked'){
        cdRef.current--
        if(cdRef.current<=0){phaseRef.current='result';setRoundPhase('result');cdRef.current=RESULT;runRound()}
      } else if(phaseRef.current==='result'){
        cdRef.current--
        if(cdRef.current<=0){phaseRef.current='next';setRoundPhase('next');cdRef.current=NEXT}
      } else if(phaseRef.current==='next'){
        cdRef.current--
        if(cdRef.current<=0){
          phaseRef.current='betting';setRoundPhase('betting');cdRef.current=BETTING;setCountdown(BETTING)
          setRoundId(r=>r+1);setPCards([]);setDCards([]);setResult(null)
          betRef.current={amt:0,placed:false};setBetPlaced(false);setBetAmt(0);setDealerPhase('idle')
          sounds.tick()
        }
      }
    }
    const iv = setInterval(tick,1000)
    return () => clearInterval(iv)
  }, [])

  const placeBet = () => {
    if(phaseRef.current!=='betting') return toast.error('Bets closed!')
    if(betRef.current.placed) return toast.error('Already bet!')
    if(betInput>balance) return toast.error('Insufficient balance')
    setBalance(b=>b-betInput)
    betRef.current={amt:betInput,placed:true}
    setBetAmt(betInput);setBetPlaced(true)
    setDealerPhase('shuffling'); sounds.betPlace()
    toast.success(`♠️ Bet ${betInput} placed!`,{duration:1500})
  }

  const canBet = roundPhase==='betting'&&!betPlaced

  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(18px,4vw,26px)',marginBottom:'10px'}}>♠️ <span className="gold-text">Teen Patti</span></h1>
      <LiveRoundBar phase={roundPhase} countdown={countdown} roundId={roundId} />
      <div className="game-layout">
        <div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}>
            <AIDealer phase={dealerPhase} compact={true} />
          </div>
          <div style={{background:'radial-gradient(ellipse,#1a4a2a,#0d2e1a)',border:'2px solid var(--gold)',borderRadius:'16px',padding:'20px',minHeight:'260px'}}>
            {/* History */}
            <div style={{display:'flex',gap:'4px',marginBottom:'12px',flexWrap:'wrap'}}>
              {history.map((h,i)=>(
                <span key={i} style={{width:'18px',height:'18px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',fontWeight:'800',flexShrink:0,background:h==='win'?'#00d084':h==='lose'?'#ff4444':'#c9a227',color:'white'}}>
                  {h==='win'?'W':h==='lose'?'L':'T'}
                </span>
              ))}
            </div>
            {pCards.length>0 ? (<>
              <div style={{marginBottom:'14px'}}>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'11px',marginBottom:'6px'}}>Dealer {result&&<span style={{color:'var(--gold)'}}>{result.dr.name}</span>}</div>
                <div style={{display:'flex',gap:'6px'}}>{dCards.map((c2,i)=><CardEl key={i} card={c2} size="md"/>)}</div>
              </div>
              <div>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'11px',marginBottom:'6px'}}>You {result&&<span style={{color:'var(--gold)'}}>{result.pr.name}</span>}</div>
                <div style={{display:'flex',gap:'6px'}}>{pCards.map((c2,i)=><CardEl key={i} card={c2} size="md"/>)}</div>
              </div>
              {result&&<div style={{textAlign:'center',marginTop:'12px',padding:'10px',borderRadius:'8px',background:result.outcome==='win'?'rgba(0,208,132,0.15)':result.outcome==='lose'?'rgba(255,68,68,0.15)':'rgba(201,162,39,0.15)',color:result.outcome==='win'?'#00d084':result.outcome==='lose'?'#ff4444':'#c9a227',fontWeight:'800',fontSize:'16px'}}>
                {result.outcome==='win'?'🎉 You Win!':result.outcome==='lose'?'😞 Dealer Wins':'🤝 Tie'}
              </div>}
            </>) : (
              <div style={{textAlign:'center',padding:'50px 0',color:'rgba(255,255,255,0.3)',fontSize:'14px'}}>
                {roundPhase==='betting'?'♠️ Place your bet — Cards dealt after timer':'⏳ Preparing cards...'}
              </div>
            )}
          </div>
        </div>
        <div className="game-panel-right">
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'14px'}}>
            <div style={{fontSize:'11px',color:canBet?'#00d084':'#666',marginBottom:'10px',fontWeight:'600'}}>
              {canBet?`⏱ ${countdown}s — Place your bet`:roundPhase==='locked'?'🔒 Bets Closed':roundPhase==='result'?'📊 Showing Result':'⏳ Next round soon'}
            </div>
            <div style={{marginBottom:'10px'}}>
              <div style={{display:'flex',gap:'5px'}}>
                <button onClick={()=>setBetInput(v=>Math.max(10,Math.floor(v/2)))} style={{padding:'6px 10px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'#888',cursor:'pointer'}}>½</button>
                <input type="number" value={betInput} onChange={e=>setBetInput(Math.max(1,Number(e.target.value)))}
                  style={{flex:1,padding:'8px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'white',fontSize:'15px',fontWeight:'700',outline:'none',textAlign:'center'}} />
                <button onClick={()=>setBetInput(v=>Math.min(balance,v*2))} style={{padding:'6px 10px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'#888',cursor:'pointer'}}>2x</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px',marginTop:'5px'}}>
                {[50,100,500,1000].map(a=><button key={a} onClick={()=>setBetInput(a)} style={{padding:'5px',borderRadius:'5px',border:`1px solid ${betInput===a?'var(--gold)':'var(--border)'}`,background:betInput===a?'rgba(201,162,39,0.15)':'var(--bg-hover)',color:betInput===a?'var(--gold)':'#666',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>{a>=1000?`${a/1000}K`:a}</button>)}
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'rgba(201,162,39,0.07)',borderRadius:'7px',border:'1px solid rgba(201,162,39,0.15)',marginBottom:'10px'}}>
              <span style={{color:'var(--text-secondary)',fontSize:'12px'}}>Balance</span>
              <span style={{color:'var(--gold)',fontWeight:'700'}}>🪙 {balance.toLocaleString()}</span>
            </div>
            {!betPlaced ? (
              <button onClick={placeBet} disabled={!canBet||betInput>balance}
                style={{width:'100%',padding:'13px',border:'none',borderRadius:'10px',background:canBet&&betInput<=balance?'linear-gradient(135deg,#c9a227,#f0c84a)':'rgba(201,162,39,0.15)',color:canBet&&betInput<=balance?'#0a0a0f':'rgba(255,255,255,0.3)',fontSize:'14px',fontWeight:'900',cursor:canBet?'pointer':'not-allowed',textTransform:'uppercase'}}>
                {canBet?`Bet ${betInput.toLocaleString()} 🪙`:'Wait for next round'}
              </button>
            ) : (
              <div style={{padding:'12px',background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.3)',borderRadius:'10px',textAlign:'center'}}>
                <div style={{color:'var(--gold)',fontWeight:'700'}}>✅ {betAmt.toLocaleString()} placed!</div>
                <div style={{color:'#666',fontSize:'11px',marginTop:'2px'}}>Good luck! 🍀</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AndarBahar() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [joker, setJoker] = useState(null)
  const [andar, setAndar] = useState([])
  const [bahar, setBahar] = useState([])
  const [betSide, setBetSide] = useState('andar')
  const [result, setResult] = useState(null)
  const [dealerPhase, setDealerPhase] = useState('idle')
  const timerRef = React.useRef(null)

  const deal = (amount) => {
    setBalance(b=>b-amount)  // deduct bet
    setDealerPhase('shuffling')
    setTimeout(()=>setDealerPhase('dealing'),500)
    clearTimeout(timerRef.current)
    const d=makeDeck()
    const jk=d.shift()
    setJoker(jk);setAndar([]);setBahar([]);setPhase('dealing');setResult(null)
    let an=[],bh=[],found=false,i=0
    const step=()=>{
      if(found){
        setPhase('result')
        const winner=found
        setResult(winner)
        const win=betSide===winner?Math.floor(amount*(winner==='andar'?1.9:2)):0
        if(win>0){setBalance(b=>b+win);sounds.win();sounds.coinCollect();logBet('andar-bahar',amount,win);toast.success(`${winner.toUpperCase()} wins! +${win} coins!`);setDealerPhase('lose')}
        else{sounds.loss();logBet('andar-bahar',amount,0);toast.error(`${winner==='andar'?'Bahar':'Andar'} wins. You lost ${amount} 🪙`);setDealerPhase('win')}
        return
      }
      const card=d[i++]
      if(i%2===1){an=[...an,card];setAndar([...an]);if(card.rank===jk.rank){found='andar'}}
      else{bh=[...bh,card];setBahar([...bh]);if(card.rank===jk.rank){found='bahar'}}
      timerRef.current=setTimeout(step,380)
    }
    setTimeout(step,280)
  }

  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'28px',marginBottom:'20px'}}>🎯 <span className="gold-text">Andar Bahar</span></h1>
      <div className="game-layout">
        <div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}>
            <AIDealer phase={dealerPhase} compact={true} />
          </div>
          <div style={{display:'flex',gap:'12px',marginBottom:'14px'}}>
            {[{id:'andar',label:'Andar (Inside)',col:'#4488ff',pay:'1.9:1'},{id:'bahar',label:'Bahar (Outside)',col:'#ff4444',pay:'2:1'}].map(s=>(
              <button key={s.id} onClick={()=>setBetSide(s.id)} style={{flex:1,padding:'13px 8px',borderRadius:'10px',fontWeight:'700',background:betSide===s.id?`${s.col}20`:'var(--bg-hover)',border:`2px solid ${betSide===s.id?s.col:'var(--border)'}`,color:betSide===s.id?s.col:'var(--text-secondary)',cursor:'pointer'}}>
                <div style={{fontSize:'14px'}}>{s.label}</div><div style={{fontSize:'11px',opacity:0.65}}>{s.pay}</div>
              </button>
            ))}
          </div>
          <div style={{background:'radial-gradient(ellipse,#1a4a2a,#0d2e1a)',border:'3px solid var(--gold)',borderRadius:'20px',padding:'24px',minHeight:'320px'}}>
            {joker&&<div style={{textAlign:'center',marginBottom:'18px'}}>
              <div style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginBottom:'8px'}}>Joker Card</div>
              <div style={{display:'inline-block',padding:'8px',background:'rgba(201,162,39,0.18)',borderRadius:'10px',border:'2px solid var(--gold)'}}><CardEl card={joker} size="md"/></div>
            </div>}
            {!joker&&<div style={{textAlign:'center',paddingTop:'50px'}}><div style={{fontSize:'50px',marginBottom:'12px'}}>🎯</div><p style={{color:'rgba(255,255,255,0.5)'}}>Choose side and place bet</p></div>}
            {(andar.length>0||bahar.length>0)&&<>
              <div style={{marginBottom:'14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{color:'#4488ff',fontWeight:'700',fontSize:'13px'}}>ANDAR</span>
                  {result==='andar'&&<span style={{color:'#c9a227',fontSize:'12px'}}>⭐ WIN</span>}
                </div>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',minHeight:'72px',alignItems:'center'}}>{andar.map((c,i)=><CardEl key={i} card={c} size="sm"/>)}</div>
              </div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{color:'#ff4444',fontWeight:'700',fontSize:'13px'}}>BAHAR</span>
                  {result==='bahar'&&<span style={{color:'#c9a227',fontSize:'12px'}}>⭐ WIN</span>}
                </div>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',minHeight:'72px',alignItems:'center'}}>{bahar.map((c,i)=><CardEl key={i} card={c} size="sm"/>)}</div>
              </div>
            </>}
          </div>
          {phase==='result'&&<button onClick={()=>{setPhase('bet');setJoker(null);setAndar([]);setBahar([]);setResult(null)}} className="btn-gold" style={{width:'100%',marginTop:'12px',padding:'13px'}}>New Round</button>}
        </div>
        {/* Simple bet panel - no autobet for Andar Bahar */}
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'14px'}}>
            <div style={{fontSize:'11px',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'10px'}}>Place Bet</div>
            {['100','200','500','1000'].map(a=>(
              <button key={a} onClick={()=>phase==='bet'&&deal(Number(a))} disabled={phase!=='bet'}
                style={{display:'block',width:'100%',padding:'11px',marginBottom:'8px',borderRadius:'8px',fontWeight:'700',fontSize:'14px',background:phase!=='bet'?'rgba(201,162,39,0.08)':'linear-gradient(135deg,#c9a227,#f0c84a)',border:'none',color:phase!=='bet'?'rgba(0,0,0,0.3)':'#0a0a0f',cursor:phase!=='bet'?'not-allowed':'pointer'}}>
                🪙 {Number(a).toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes dealCard{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

/* ──────────── DRAGON TIGER ──────────── */
export function DragonTiger() {
  const { balance, setBalance } = useStore()
  const { logBet } = useBet()
  const [dealerPhase, setDealerPhase] = useState('idle')
  const [roundPhase, setRoundPhase] = useState('betting')
  const [countdown, setCountdown] = useState(10)
  const [roundId, setRoundId] = useState(Math.floor(Math.random()*90000)+10000)
  const cdRef = useRef(10), phaseRef = useRef('betting')
  const [dc, setDc] = useState(null), [tc, setTc] = useState(null)
  const [betSide, setBetSide] = useState(null)
  const [betInput, setBetInput] = useState(100)
  const [betPlaced, setBetPlaced] = useState(false)
  const [betAmt, setBetAmt] = useState(0)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const betRef = useRef({ side: null, amt: 0, placed: false })

  const RANKS_VAL = {'A':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13}

  const runRound = () => {
    const d = makeDeck()
    const dCard=d[0], tCard=d[1]
    setDc(dCard); setTc(tCard)
    setDealerPhase('dealing')
    const dv=RANKS_VAL[dCard.rank], tv=RANKS_VAL[tCard.rank]
    const winner = dv>tv?'dragon':tv>dv?'tiger':'tie'
    setResult({ winner, dCard, tCard })
    setHistory(h => [winner, ...h.slice(0,11)])
    const b = betRef.current
    if(b.placed && b.side) {
      let win=0
      if(b.side===winner && winner!=='tie') win=b.amt*2
      else if(b.side==='tie' && winner==='tie') win=b.amt*9
      if(win>0){setBalance(v=>v+win);sounds.win();sounds.coinCollect();logBet('dragon-tiger',b.amt,win);toast.success(`${winner.toUpperCase()} wins! +${win} 🪙`);setDealerPhase('lose')}
      else{sounds.loss();logBet('dragon-tiger',b.amt,0);toast.error(`${winner.toUpperCase()} wins. Lost ${b.amt} 🪙`);setDealerPhase('win')}
    }
  }

  useEffect(() => {
    const BETTING=10,LOCK=1,RESULT=4,NEXT=1
    const tick = () => {
      if(phaseRef.current==='betting'){
        cdRef.current--;setCountdown(cdRef.current)
        if(cdRef.current<=3&&cdRef.current>0)sounds.tickFinal()
        if(cdRef.current<=0){phaseRef.current='locked';setRoundPhase('locked');cdRef.current=LOCK}
      } else if(phaseRef.current==='locked'){
        cdRef.current--
        if(cdRef.current<=0){phaseRef.current='result';setRoundPhase('result');cdRef.current=RESULT;runRound()}
      } else if(phaseRef.current==='result'){
        cdRef.current--
        if(cdRef.current<=0){phaseRef.current='next';setRoundPhase('next');cdRef.current=NEXT}
      } else if(phaseRef.current==='next'){
        cdRef.current--
        if(cdRef.current<=0){
          phaseRef.current='betting';setRoundPhase('betting');cdRef.current=BETTING;setCountdown(BETTING)
          setRoundId(r=>r+1);setDc(null);setTc(null);setResult(null)
          betRef.current={side:null,amt:0,placed:false};setBetPlaced(false);setBetSide(null);setBetAmt(0);setDealerPhase('idle')
          sounds.tick()
        }
      }
    }
    const iv=setInterval(tick,1000)
    return () => clearInterval(iv)
  }, [])

  const placeBet = (side) => {
    if(phaseRef.current!=='betting') return toast.error('Bets closed!')
    if(betRef.current.placed) return toast.error('Already bet!')
    if(betInput>balance) return toast.error('Insufficient balance')
    setBalance(b=>b-betInput)
    betRef.current={side,amt:betInput,placed:true}
    setBetSide(side);setBetAmt(betInput);setBetPlaced(true)
    setDealerPhase('shuffling');sounds.betPlace()
    toast.success(`🐉 Bet ${betInput} on ${side.toUpperCase()}!`,{duration:1500})
  }

  const canBet=roundPhase==='betting'&&!betPlaced
  const sides=[{id:'dragon',label:'🐉 Dragon',col:'#ff4444'},{id:'tiger',label:'🐯 Tiger',col:'#ff8800'},{id:'tie',label:'🤝 Tie',col:'#00d084',pay:'8:1'}]

  const BigCard = ({card,side}) => card ? (
    <div style={{textAlign:'center'}}>
      <div style={{color:'rgba(255,255,255,0.6)',fontSize:'11px',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'1px'}}>{side}</div>
      <CardEl card={card} size="lg"/>
      {result&&<div style={{marginTop:'8px',fontSize:'22px',fontWeight:'900',color:result.winner===side.toLowerCase()?'#c9a227':'rgba(255,255,255,0.4)'}}>{RANKS_VAL[card.rank]}</div>}
    </div>
  ) : (
    <div style={{textAlign:'center',width:'100px'}}>
      <div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',marginBottom:'8px',textTransform:'uppercase'}}>{side}</div>
      <div style={{width:'64px',height:'90px',background:'linear-gradient(135deg,#1a1a4e,#2a2a8e)',borderRadius:'7px',border:'2px solid rgba(255,255,255,0.1)',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>?</div>
    </div>
  )

  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(18px,4vw,26px)',marginBottom:'10px'}}>🐉 <span className="gold-text">Dragon Tiger</span></h1>
      <LiveRoundBar phase={roundPhase} countdown={countdown} roundId={roundId} color="#ff4444" />
      <div className="game-layout">
        <div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}>
            <AIDealer phase={dealerPhase} compact={true} />
          </div>
          <div style={{background:'radial-gradient(ellipse,#1a2a4a,#0d1a2e)',border:'2px solid var(--gold)',borderRadius:'16px',padding:'24px',minHeight:'240px'}}>
            <div style={{display:'flex',gap:'4px',marginBottom:'14px',flexWrap:'wrap'}}>
              {history.map((h,i)=><span key={i} style={{width:'18px',height:'18px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',fontWeight:'800',flexShrink:0,background:h==='dragon'?'#ff4444':h==='tiger'?'#ff8800':'#00d084',color:'white'}}>{h==='dragon'?'D':h==='tiger'?'T':'T'}</span>)}
            </div>
            <div style={{display:'flex',justifyContent:'space-around',alignItems:'center',padding:'10px 0'}}>
              <BigCard card={dc} side="Dragon" />
              <div style={{fontSize:'clamp(20px,5vw,28px)',color:'rgba(255,255,255,0.3)',fontWeight:'900'}}>VS</div>
              <BigCard card={tc} side="Tiger" />
            </div>
            {result&&<div style={{textAlign:'center',marginTop:'12px',padding:'12px',borderRadius:'10px',background:result.winner==='dragon'?'rgba(255,68,68,0.2)':result.winner==='tiger'?'rgba(255,136,0,0.2)':'rgba(0,208,132,0.2)',fontSize:'18px',fontWeight:'900',color:result.winner==='dragon'?'#ff6666':result.winner==='tiger'?'#ff9933':'#00d084'}}>
              {result.winner==='dragon'?'🐉 DRAGON WINS!':result.winner==='tiger'?'🐯 TIGER WINS!':'🤝 TIE!'}
              {betPlaced&&betSide&&<div style={{fontSize:'13px',marginTop:'4px',color:betSide===result.winner?'#00d084':'#ff6666'}}>{betSide===result.winner?`✅ You won!`:`❌ Lost ${betAmt} 🪙`}</div>}
            </div>}
          </div>
        </div>
        <div className="game-panel-right">
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'14px'}}>
            <div style={{fontSize:'11px',color:canBet?'#00d084':'#666',marginBottom:'10px',fontWeight:'600'}}>
              {canBet?`⏱ ${countdown}s to bet`:roundPhase==='locked'?'🔒 Closed':roundPhase==='result'?'📊 Result':'⏳ Next round'}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px'}}>
              {sides.map(s=>(
                <button key={s.id} onClick={()=>canBet&&placeBet(s.id)} disabled={!canBet}
                  style={{padding:'11px',borderRadius:'9px',border:`2px solid ${betSide===s.id&&betPlaced?s.col:'var(--border)'}`,background:betSide===s.id&&betPlaced?`${s.col}20`:'var(--bg-hover)',color:betSide===s.id&&betPlaced?s.col:'var(--text-secondary)',fontWeight:'700',fontSize:'14px',cursor:canBet?'pointer':'not-allowed',opacity:canBet?1:0.6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span>{s.label}</span>
                  {s.pay&&<span style={{fontSize:'11px',opacity:0.7}}>{s.pay}</span>}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:'5px',marginBottom:'8px'}}>
              <button onClick={()=>setBetInput(v=>Math.max(10,Math.floor(v/2)))} style={{padding:'6px 10px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'#888',cursor:'pointer'}}>½</button>
              <input type="number" value={betInput} onChange={e=>setBetInput(Math.max(1,Number(e.target.value)))}
                style={{flex:1,padding:'8px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'white',fontSize:'14px',fontWeight:'700',outline:'none',textAlign:'center'}} />
              <button onClick={()=>setBetInput(v=>Math.min(balance,v*2))} style={{padding:'6px 10px',background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'6px',color:'#888',cursor:'pointer'}}>2x</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px',marginBottom:'10px'}}>
              {[50,100,500,1000].map(a=><button key={a} onClick={()=>setBetInput(a)} style={{padding:'5px',borderRadius:'5px',border:`1px solid ${betInput===a?'var(--gold)':'var(--border)'}`,background:betInput===a?'rgba(201,162,39,0.15)':'var(--bg-hover)',color:betInput===a?'var(--gold)':'#666',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>{a>=1000?`${a/1000}K`:a}</button>)}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'rgba(201,162,39,0.07)',borderRadius:'7px',border:'1px solid rgba(201,162,39,0.15)',marginBottom:'10px'}}>
              <span style={{color:'var(--text-secondary)',fontSize:'12px'}}>Balance</span>
              <span style={{color:'var(--gold)',fontWeight:'700'}}>🪙 {balance.toLocaleString()}</span>
            </div>
            {betPlaced&&<div style={{padding:'12px',background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.3)',borderRadius:'10px',textAlign:'center'}}>
              <div style={{color:'var(--gold)',fontWeight:'700'}}>✅ {betAmt} on {betSide?.toUpperCase()}</div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PokerGame() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [pCards, setPCards] = useState([])
  const [dCards, setDCards] = useState([])
  const [comm, setComm] = useState([])
  const [bet, setBet] = useState(0)
  const [result, setResult] = useState(null)
  const [showDealer, setShowDealer] = useState(false)
  const deckRef = React.useRef([])

  const deal = (amount) => {
    const d=makeDeck()
    setPCards([d[0],d[2]]);setDCards([d[1],d[3]])
    setComm([d[4],d[5],d[6]]);deckRef.current=d.slice(7)
    setBet(amount);setPhase('preflop');setShowDealer(false);setResult(null)
  }

  const call = () => { setPhase('flop') }
  const raise = () => { setBalance(b=>b-bet); setBet(b=>b*2); setPhase('flop'); toast.success('Raised!') }
  const fold = () => { setPhase('result'); setShowDealer(true); setResult({outcome:'fold'}) }

  const showdown = () => {
    setShowDealer(true); setPhase('result')
    const ph=evalHand([...pCards,...comm.slice(0,3)])
    const dh=evalHand([...dCards,...comm.slice(0,3)])
    let outcome,pay
    if(ph.score>dh.score){outcome='win';pay=bet*2}
    else if(dh.score>ph.score){outcome='lose';pay=0}
    else{outcome='tie';pay=bet}
    setResult({outcome,ph,dh})
    if(pay>0)setBalance(b=>b+pay)
    logBet('poker',bet,pay)
    if(outcome==='win'){sounds.win();toast.success(`${ph.name} beats ${dh.name}! +${pay} coins!`)}
    else if(outcome==='lose'){sounds.loss();toast.error(`${dh.name} wins! Lost ${bet} 🪙`)}
    else toast('🤝 Tie — bet returned.')
  }

  const col=result?.outcome==='win'?'#00d084':result?.outcome==='lose'?'#ff4444':'#c9a227'

  return (
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'28px',marginBottom:'20px'}}>♣️ <span className="gold-text">Poker</span></h1>
      <div className="game-layout">
        <div>
          <div style={{background:'radial-gradient(ellipse,#1a4a2a,#0d2e1a)',border:'3px solid var(--gold)',borderRadius:'20px',padding:'28px',minHeight:'400px',boxShadow:'inset 0 0 60px rgba(0,0,0,0.5)'}}>
            {phase==='bet'&&<div style={{textAlign:'center',paddingTop:'60px'}}><div style={{fontSize:'50px',marginBottom:'12px'}}>♠️</div><p style={{color:'rgba(255,255,255,0.5)'}}>Place bet to deal</p></div>}
            {phase!=='bet'&&<>
              <div style={{marginBottom:'14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{color:'rgba(255,255,255,0.5)',fontSize:'12px'}}>Dealer {showDealer&&result&&`— ${result.dh?.name}`}</span>
                </div>
                <div style={{display:'flex',gap:'7px'}}>{dCards.map((c,i)=><CardEl key={i} card={c} hidden={!showDealer} size="sm"/>)}</div>
              </div>
              <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',borderBottom:'1px solid rgba(255,255,255,0.1)',padding:'14px 0',margin:'10px 0',textAlign:'center'}}>
                <div style={{color:'rgba(255,255,255,0.45)',fontSize:'11px',marginBottom:'8px'}}>Community Cards</div>
                <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>{comm.map((c,i)=><CardEl key={i} card={c} size="sm"/>)}</div>
              </div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{color:'rgba(255,255,255,0.5)',fontSize:'12px'}}>You — {evalHand([...pCards,...comm.slice(0,3)]).name}</span>
                </div>
                <div style={{display:'flex',gap:'7px'}}>{pCards.map((c,i)=><CardEl key={i} card={c} size="sm"/>)}</div>
              </div>
              {result&&<div style={{marginTop:'14px',textAlign:'center',padding:'10px',borderRadius:'10px',background:`${col}18`,border:`1px solid ${col}40`,fontSize:'16px',fontWeight:'800',color:col}}>
                {result.outcome==='win'?'🎉 You Win!':result.outcome==='lose'?'😞 Dealer Wins':result.outcome==='fold'?'🏳️ Folded':'🤝 Tie'}
              </div>}
            </>}
          </div>
          {phase==='preflop'&&<div style={{display:'flex',gap:'10px',marginTop:'12px'}}>
            <button onClick={call} style={{flex:1,padding:'12px',borderRadius:'10px',fontWeight:'800',background:'rgba(0,208,132,0.2)',border:'2px solid #00d084',color:'#00d084',cursor:'pointer'}}>Call</button>
            <button onClick={raise} style={{flex:1,padding:'12px',borderRadius:'10px',fontWeight:'800',background:'rgba(201,162,39,0.2)',border:'2px solid var(--gold)',color:'var(--gold)',cursor:'pointer'}}>Raise 2x</button>
            <button onClick={fold} style={{flex:1,padding:'12px',borderRadius:'10px',fontWeight:'800',background:'rgba(255,68,68,0.15)',border:'2px solid #ff4444',color:'#ff4444',cursor:'pointer'}}>Fold</button>
          </div>}
          {phase==='flop'&&<div style={{display:'flex',gap:'10px',marginTop:'12px'}}>
            <button onClick={showdown} style={{flex:2,padding:'12px',borderRadius:'10px',fontWeight:'800',background:'linear-gradient(135deg,#c9a227,#f0c84a)',border:'none',color:'#0a0a0f',cursor:'pointer'}}>Showdown</button>
            <button onClick={fold} style={{flex:1,padding:'12px',borderRadius:'10px',fontWeight:'800',background:'rgba(255,68,68,0.15)',border:'2px solid #ff4444',color:'#ff4444',cursor:'pointer'}}>Fold</button>
          </div>}
          {phase==='result'&&<button onClick={()=>setPhase('bet')} className="btn-gold" style={{width:'100%',marginTop:'12px',padding:'13px'}}>New Round</button>}
        </div>
        <BetPanel onBet={deal} disabled={phase!=='bet'}/>
      </div>
      <style>{`@keyframes dealCard{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ──────────── TOWER ──────────── */
const LEVELS=10, COLS=4
const TMULTS=[1.2,1.5,2,2.8,4,5.5,8,11,16,24]

export function TowerGame() {
  const { setBalance } = useStore()
  const [phase, setPhase] = useState('idle')
  const [level, setLevel] = useState(0)
  const [bet, setBet] = useState(0)
  const [grid, setGrid] = useState([])
  const [revealed, setRevealed] = useState({})
  const [result, setResult] = useState(null)

  const start = (amount) => {
    setBalance(b=>b-amount); setBet(amount); setPhase('playing')
    setLevel(0); setRevealed({}); setResult(null)
    const g=[]
    for(let r=0;r<LEVELS;r++){
      const bomb=Math.floor(Math.random()*COLS)
      g.push(Array(COLS).fill('safe').map((_,c)=>c===bomb?'bomb':'safe'))
    }
    setGrid(g)
    toast.success('Climb the tower!')
  }

  const pick=(row,col)=>{
    if(phase!=='playing') return
    const activeRow=LEVELS-1-level
    if(row!==activeRow) return
    const cell=grid[row]?.[col]
    const key=`${row}_${col}`
    setRevealed(prev=>({...prev,[key]:cell}))
    // Reveal whole row
    const rowReveal={}
    grid[row].forEach((c,ci)=>rowReveal[`${row}_${ci}`]=c)
    if(cell==='bomb'){
      setRevealed(prev=>({...prev,...rowReveal}))
      setPhase('lost');setResult('lost')
      toast.error(`💣 Bomb! Lost ${bet} coins.`)
    } else {
      const next=level+1
      if(next>=LEVELS){
        const win=Math.floor(bet*TMULTS[LEVELS-1])
        setBalance(b=>b+win);setPhase('won');setResult('won')
        toast.success(`🏆 Tower conquered! +${win} coins!`)
      } else {
        setLevel(next)
        toast.success(`Level ${next}! ${TMULTS[next-1]}x`,{duration:700})
      }
    }
  }

  const cashout=()=>{
    if(phase!=='playing'||level===0)return
    const mult=TMULTS[level-1]
    const win=Math.floor(bet*mult)
    setBalance(b=>b+win);setPhase('cashout');setResult('cashout')
    toast.success(`💰 Cashed out at ${mult}x! +${win} coins!`)
  }

  const activeRow=LEVELS-1-level

  return (
    <div style={{maxWidth:'700px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'28px',marginBottom:'20px'}}>🗼 <span className="gold-text">Tower</span></h1>
      <div className="game-layout">
        <div>
          {phase==='playing'&&level>0&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'rgba(0,208,132,0.1)',border:'1px solid rgba(0,208,132,0.3)',borderRadius:'10px',marginBottom:'14px'}}>
            <span style={{color:'var(--text-secondary)',fontSize:'13px'}}>Level {level}/{LEVELS}</span>
            <span style={{color:'#00d084',fontWeight:'900',fontSize:'20px'}}>{TMULTS[level-1]}x</span>
            <button onClick={cashout} style={{padding:'8px 16px',borderRadius:'8px',fontWeight:'700',background:'linear-gradient(135deg,#00d084,#00a866)',border:'none',color:'white',cursor:'pointer',fontSize:'13px'}}>Cashout</button>
          </div>}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'14px',display:'flex',flexDirection:'column',gap:'5px'}}>
            {Array(LEVELS).fill(null).map((_,rowIdx)=>{
              const displayRow=LEVELS-1-rowIdx
              const isActive=phase==='playing'&&displayRow===activeRow
              const isPast=displayRow>activeRow&&phase!=='idle'
              const mult=TMULTS[rowIdx]
              return(
                <div key={rowIdx} style={{display:'flex',gap:'5px',alignItems:'center',opacity:displayRow<activeRow&&phase==='playing'?0.45:1}}>
                  <div style={{width:'38px',fontSize:'11px',fontWeight:'700',textAlign:'right',color:isActive?'#00d084':'var(--text-muted)'}}>{mult}x</div>
                  {Array(COLS).fill(null).map((_,col)=>{
                    const key=`${displayRow}_${col}`
                    const rev=revealed[key]
                    const clickable=isActive&&!rev
                    return(
                      <button key={col} onClick={()=>pick(displayRow,col)} style={{
                        flex:1,height:'42px',borderRadius:'7px',fontSize:'18px',
                        background:rev==='bomb'?'rgba(255,68,68,0.28)':rev==='safe'?'rgba(0,208,132,0.28)':isActive?'rgba(201,162,39,0.12)':'var(--bg-hover)',
                        border:rev==='bomb'?'2px solid #ff4444':rev==='safe'?'2px solid #00d084':isActive?'2px solid rgba(201,162,39,0.45)':'1px solid var(--border)',
                        color:rev==='bomb'?'#ff4444':rev==='safe'?'#00d084':'var(--text-muted)',
                        cursor:clickable?'pointer':'default',transition:'all 0.15s'
                      }}
                      onMouseEnter={e=>{if(clickable){e.currentTarget.style.background='rgba(201,162,39,0.28)';e.currentTarget.style.transform='scale(1.06)'}}}
                      onMouseLeave={e=>{if(clickable){e.currentTarget.style.background='rgba(201,162,39,0.12)';e.currentTarget.style.transform='scale(1)'}}}>
                        {rev==='bomb'?'💣':rev==='safe'?'✅':isActive?'?':'·'}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
          {(result==='lost'||result==='won'||result==='cashout')&&(
            <div style={{marginTop:'10px',textAlign:'center',padding:'14px',borderRadius:'10px',background:result!=='lost'?'rgba(0,208,132,0.1)':'rgba(255,68,68,0.1)',border:`1px solid ${result!=='lost'?'rgba(0,208,132,0.3)':'rgba(255,68,68,0.3)'}`,fontSize:'18px',fontWeight:'800',color:result!=='lost'?'#00d084':'#ff4444'}}>
              {result==='won'?'🏆 Tower Conquered!':result==='cashout'?'💰 Cashed Out!':'💣 Game Over!'}
            </div>
          )}
          {phase!=='idle'&&phase!=='playing'&&<button onClick={()=>setPhase('idle')} className="btn-gold" style={{width:'100%',marginTop:'10px',padding:'12px'}}>Play Again</button>}
        </div>
        <BetPanel onBet={start} disabled={phase==='playing'}/>
      </div>
    </div>
  )
}

export default BlackjackGame
