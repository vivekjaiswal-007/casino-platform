import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SUITS=['♠','♥','♦','♣'], RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const mkDeck = ()=>SUITS.flatMap(s=>RANKS.map(r=>({s,r}))).sort(()=>Math.random()-0.5)
const isRed = c=>c.s==='♥'||c.s==='♦'
function bv(h){let t=0,a=0;for(const c of h){if(['J','Q','K'].includes(c.r))t+=10;else if(c.r==='A'){t+=11;a++}else t+=parseInt(c.r)};while(t>21&&a>0){t-=10;a--};return t}

function MiniCard({card,hidden}){
  const w='clamp(40px,11vw,56px)',h='clamp(56px,15vw,80px)'
  return(
    <div style={{width:w,height:h,background:hidden?'linear-gradient(135deg,#1a1a4e,#2a2a8e)':'white',borderRadius:'6px',border:'2px solid #ccc',padding:'3px',boxShadow:'0 3px 8px rgba(0,0,0,0.4)',display:'flex',flexDirection:'column',flexShrink:0}}>
      {!hidden&&card&&<>
        <div style={{fontSize:'clamp(8px,2vw,11px)',fontWeight:'900',color:isRed(card)?'#cc2222':'#111'}}>{card.r}</div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(14px,4vw,20px)',color:isRed(card)?'#cc2222':'#111'}}>{card.s}</div>
      </>}
    </div>
  )
}

export default function BlackjackSwitch() {
  const {setBalance}=useStore()
  const {logBet}=useBet()
  const [phase,setPhase]=useState('bet')
  const [deck,setDeck]=useState([])
  const [h1,setH1]=useState([]),[h2,setH2]=useState([]),[dealer,setDealer]=useState([])
  const [bet,setBet]=useState(0)
  const [switched,setSwitched]=useState(false)
  const [result,setResult]=useState(null)

  const deal=(amount)=>{
    setBalance(b=>b-amount); setBet(amount)
    const d=mkDeck()
    setH1([d[0],d[2]]); setH2([d[1],d[3]]); setDealer([d[4],d[5]])
    setDeck(d.slice(6)); setPhase('switch'); setSwitched(false); setResult(null)
    sounds.cardDeal()
  }

  const doSwitch=()=>{
    // Switch top cards of each hand
    const top1=h1[h1.length-1], top2=h2[h2.length-1]
    setH1(p=>[...p.slice(0,-1),top2])
    setH2(p=>[...p.slice(0,-1),top1])
    setSwitched(true)
    sounds.cardFlip()
    toast('Cards switched!',{icon:'🔄',duration:700})
  }

  const standBoth=()=>{
    setPhase('dealer')
    let dh=[...dealer],dk=[...deck]
    while(bv(dh)<17){dh.push(dk.pop())}
    setDealer(dh)
    sounds.cardReveal()

    const dv=bv(dh)
    const v1=bv(h1), v2=bv(h2)
    let totalPay=0

    const getOutcome=(pv)=>{
      if(pv>21) return 'bust'
      if(dv>21||pv>dv) return 'win'
      if(pv===dv) return 'push'
      return 'lose'
    }

    const o1=getOutcome(v1), o2=getOutcome(v2)
    ;[o1,o2].forEach(o=>{
      if(o==='win') totalPay+=bet
      else if(o==='push') totalPay+=0
    })
    if(totalPay>0) setBalance(b=>b+totalPay+(bet*2))  // return both bets + profit
    else if(o1==='push'||o2==='push') setBalance(b=>b+bet)  // return at least one bet

    const msg = `H1:${o1.toUpperCase()} H2:${o2.toUpperCase()}`
    setResult({o1,o2,dv,v1,v2,totalPay})
    if(totalPay>0){sounds.bigWin();toast.success(`${msg}! +${totalPay} 🪙`);logBet('blackjack-switch',bet*2,totalPay)}
    else{sounds.loss();toast.error(msg);logBet('blackjack-switch',bet*2,0)}
    setPhase('result')
  }

  const getCol=(o)=>o==='win'?'#00d084':o==='push'?'#c9a227':'#ff4444'

  return(
    <div style={{maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(20px,5vw,28px)',marginBottom:'16px'}}>
        🃏 <span className="gold-text">Blackjack Switch</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{background:'radial-gradient(ellipse,#1a3a2a,#0d2418)',border:'2px solid var(--gold)',borderRadius:'16px',padding:'18px',marginBottom:'12px'}}>
            {/* Dealer */}
            <div style={{marginBottom:'16px',textAlign:'center'}}>
              <div style={{color:'var(--text-secondary)',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',marginBottom:'8px'}}>Dealer {dealer.length>0&&phase==='result'?bv(dealer):''}</div>
              <div style={{display:'flex',gap:'6px',justifyContent:'center',flexWrap:'wrap'}}>
                {dealer.map((c,i)=><MiniCard key={i} card={c} hidden={i>0&&phase!=='result'&&phase!=='dealer'}/>)}
              </div>
            </div>

            {/* Hands */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {[[h1,'Hand 1',result?.v1,result?.o1],[h2,'Hand 2',result?.v2,result?.o2]].map(([hand,label,val,outcome],hi)=>(
                <div key={hi} style={{background:`${outcome?getCol(outcome):'rgba(255,255,255,0.04)'}18`,border:`1px solid ${outcome?getCol(outcome):'rgba(255,255,255,0.08)'}`,borderRadius:'10px',padding:'10px',textAlign:'center'}}>
                  <div style={{color:outcome?getCol(outcome):'var(--text-secondary)',fontSize:'11px',fontWeight:'700',textTransform:'uppercase',marginBottom:'8px'}}>
                    {label} {val?`(${val})`:''}
                    {outcome&&<span style={{marginLeft:'6px'}}>{outcome.toUpperCase()}</span>}
                  </div>
                  <div style={{display:'flex',gap:'5px',justifyContent:'center',flexWrap:'wrap'}}>
                    {hand.map((c,i)=><MiniCard key={i} card={c}/>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {phase==='switch'&&(
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={doSwitch} disabled={switched} style={{flex:1,padding:'12px',borderRadius:'9px',background:switched?'rgba(153,68,255,0.05)':'rgba(153,68,255,0.12)',border:`1px solid rgba(153,68,255,${switched?'0.1':'0.3'})`,color:switched?'#555':'#9944ff',fontWeight:'700',fontSize:'13px',cursor:switched?'not-allowed':'pointer'}}>
                🔄 Switch Top Cards{switched?' (done)':''}
              </button>
              <button onClick={standBoth} style={{flex:1,padding:'12px',borderRadius:'9px',background:'rgba(201,162,39,0.12)',border:'1px solid rgba(201,162,39,0.3)',color:'var(--gold)',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>
                ✋ Stand Both
              </button>
            </div>
          )}
        </div>
        <div className="game-panel-right">
          {phase==='result'?(
            <button onClick={()=>{setPhase('bet');setH1([]);setH2([]);setDealer([]);setResult(null)}} className="btn-gold" style={{width:'100%',padding:'14px',fontSize:'15px'}}>🔄 New Game</button>
          ):(
            <BetPanel onBet={deal} disabled={phase!=='bet'}/>
          )}
          <div style={{marginTop:'10px',padding:'12px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'10px',fontSize:'12px',color:'var(--text-muted)'}}>
            💡 Two hands! Optionally switch top cards before standing.
          </div>
        </div>
      </div>
    </div>
  )
}
