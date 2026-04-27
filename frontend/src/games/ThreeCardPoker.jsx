import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SUITS=['♠','♥','♦','♣'],RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const mkDeck=()=>SUITS.flatMap(s=>RANKS.map((r,i)=>({s,r,v:i+2}))).sort(()=>Math.random()-0.5)
const isRed=c=>c.s==='♥'||c.s==='♦'

function evalThree(h){
  const vals=h.map(c=>c.v).sort((a,b)=>a-b)
  const suits=h.map(c=>c.s)
  const ranks=h.map(c=>c.r)
  const flush=suits.every(s=>s===suits[0])
  const straight=vals[2]-vals[0]===2&&new Set(vals).size===3
  const counts={}; ranks.forEach(r=>counts[r]=(counts[r]||0)+1)
  const cv=Object.values(counts).sort((a,b)=>b-a)
  if(flush&&straight) return {name:'Straight Flush',score:6,mult:10}
  if(cv[0]===3) return {name:'Three of a Kind',score:5,mult:5}
  if(straight) return {name:'Straight',score:4,mult:4}
  if(flush) return {name:'Flush',score:3,mult:3}
  if(cv[0]===2) return {name:'Pair',score:2,mult:2}
  return {name:'High Card: '+h.sort((a,b)=>b.v-a.v)[0].r,score:1,mult:0}
}

function Card3({card}){
  return(
    <div style={{width:'clamp(52px,14vw,72px)',height:'clamp(74px,20vw,102px)',background:'white',borderRadius:'8px',border:'2px solid #ccc',padding:'4px',boxShadow:'0 4px 12px rgba(0,0,0,0.4)',display:'flex',flexDirection:'column',animation:'deal3 0.3s ease',flexShrink:0}}>
      <div style={{fontSize:'clamp(9px,2.5vw,13px)',fontWeight:'900',color:isRed(card)?'#cc2222':'#111'}}>{card.r}</div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(18px,5vw,28px)',color:isRed(card)?'#cc2222':'#111'}}>{card.s}</div>
      <div style={{fontSize:'clamp(9px,2.5vw,13px)',fontWeight:'900',color:isRed(card)?'#cc2222':'#111',alignSelf:'flex-end',transform:'rotate(180deg)'}}>{card.r}</div>
    </div>
  )
}

export default function ThreeCardPoker() {
  const {setBalance}=useStore()
  const {logBet}=useBet()
  const [phase,setPhase]=useState('bet')
  const [pHand,setPHand]=useState([])
  const [dHand,setDHand]=useState([])
  const [result,setResult]=useState(null)
  const [betAmt,setBetAmt]=useState(0)

  const deal=(amount)=>{
    setBalance(b=>b-amount); setBetAmt(amount)
    const d=mkDeck()
    setPHand(d.slice(0,3)); setDHand(d.slice(3,6))
    setPhase('show'); setResult(null)
    sounds.cardDeal()
    setTimeout(()=>{
      const ph=evalThree(d.slice(0,3)),dh=evalThree(d.slice(3,6))
      let pay=0, outcome
      if(ph.score>dh.score){outcome='win';pay=amount*(ph.mult>0?ph.mult:2)}
      else if(dh.score>ph.score){outcome='lose';pay=0}
      else{outcome='tie';pay=amount}
      setResult({ph,dh,outcome,pay})
      if(pay>0)setBalance(b=>b+pay)
      if(outcome==='win'){sounds.win();toast.success(`🎉 ${ph.name}! Won ${pay} 🪙`);logBet('three-card-poker',amount,pay)}
      else if(outcome==='lose'){sounds.loss();toast.error(`Dealer's ${dh.name} wins! Lost ${amount} 🪙`);logBet('three-card-poker',amount,0)}
      else{sounds.cardFlip();toast('🤝 Tie — bet returned');logBet('three-card-poker',amount,amount)}
      setPhase('result')
    },800)
  }

  return(
    <div style={{maxWidth:'800px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(20px,5vw,28px)',marginBottom:'16px'}}>
        🃏 <span className="gold-text">Three Card Poker</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{background:'radial-gradient(ellipse,#1a3a2a,#0d2418)',border:'2px solid var(--gold)',borderRadius:'16px',padding:'20px',marginBottom:'12px',minHeight:'280px'}}>
            {['Dealer','Player'].map((label,li)=>{
              const hand=li===0?dHand:pHand
              const res=result?li===0?result.dh:result.ph:null
              return(
                <div key={label} style={{marginBottom:'16px',textAlign:'center'}}>
                  <div style={{color:'var(--text-secondary)',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                    {label}
                    {res&&<span style={{color:li===0?(result.outcome==='lose'?'#00d084':'#ff4444'):(result.outcome==='win'?'#00d084':'#ff4444'),fontWeight:'700',fontSize:'12px'}}>{res.name}</span>}
                  </div>
                  <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
                    {hand.length>0?hand.map((c,i)=><Card3 key={i} card={c}/>):Array(3).fill(null).map((_,i)=><div key={i} style={{width:'clamp(52px,14vw,72px)',height:'clamp(74px,20vw,102px)',background:'linear-gradient(135deg,#1a1a4e,#2a2a8e)',borderRadius:'8px',border:'2px solid #2a2a3a'}}/>)}
                  </div>
                </div>
              )
            })}
            {result&&(
              <div style={{textAlign:'center',padding:'12px',borderRadius:'10px',background:result.outcome==='win'?'rgba(0,208,132,0.1)':result.outcome==='lose'?'rgba(255,68,68,0.1)':'rgba(201,162,39,0.1)',border:`1px solid ${result.outcome==='win'?'rgba(0,208,132,0.3)':result.outcome==='lose'?'rgba(255,68,68,0.3)':'rgba(201,162,39,0.3)'}`,fontSize:'16px',fontWeight:'900',color:result.outcome==='win'?'#00d084':result.outcome==='lose'?'#ff4444':'#c9a227',marginTop:'10px'}}>
                {result.outcome==='win'?`🎉 You Win! +${result.pay} 🪙`:result.outcome==='lose'?`😞 Dealer Wins`:`🤝 Tie — Bet Returned`}
              </div>
            )}
          </div>
          {/* Paytable */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'10px',padding:'12px',fontSize:'12px'}}>
            <div style={{color:'var(--text-muted)',marginBottom:'6px',fontWeight:'600',textTransform:'uppercase',fontSize:'11px'}}>Paytable</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {[['Straight Flush','10x','#f0c84a'],['Three of a Kind','5x','#9944ff'],['Straight','4x','#00d084'],['Flush','3x','#4488ff'],['Pair','2x','#c9a227']].map(([n,p,c])=>(
                <div key={n} style={{padding:'4px 10px',borderRadius:'5px',background:`${c}15`,border:`1px solid ${c}33`,color:c,fontWeight:'700'}}>{n} {p}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="game-panel-right">
          {phase==='result'?(
            <button onClick={()=>{setPhase('bet');setPHand([]);setDHand([]);setResult(null)}} className="btn-gold" style={{width:'100%',padding:'14px',fontSize:'15px'}}>🔄 New Hand</button>
          ):(
            <BetPanel onBet={deal} disabled={phase!=='bet'}/>
          )}
        </div>
      </div>
      <style>{`@keyframes deal3{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
