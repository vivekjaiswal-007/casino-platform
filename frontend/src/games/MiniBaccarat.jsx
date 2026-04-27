import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const mkDeck=()=>SUITS.flatMap(s=>RANKS.map(r=>({s,r}))).sort(()=>Math.random()-0.5)
const bv=c=>{if(['10','J','Q','K'].includes(c.r))return 0;if(c.r==='A')return 1;return parseInt(c.r)}
const handVal=h=>h.reduce((s,c)=>s+bv(c),0)%10
const isRed=c=>c.s==='♥'||c.s==='♦'

function MCard({c}){return(
  <div style={{width:'clamp(36px,10vw,52px)',height:'clamp(50px,14vw,72px)',background:'white',borderRadius:'6px',border:'2px solid #ccc',padding:'3px',boxShadow:'0 3px 8px rgba(0,0,0,0.4)',display:'flex',flexDirection:'column',flexShrink:0}}>
    <div style={{fontSize:'clamp(8px,2vw,11px)',fontWeight:'900',color:isRed(c)?'#cc2222':'#111'}}>{c.r}</div>
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(12px,4vw,18px)',color:isRed(c)?'#cc2222':'#111'}}>{c.s}</div>
  </div>
)}

const BETS=[{id:'player',label:'Player',pay:'1:1',col:'#4488ff'},{id:'banker',label:'Banker',pay:'0.95:1',col:'#ff4444'},{id:'tie',label:'Tie',pay:'8:1',col:'#00d084'}]
const AMOUNTS=[50,100,200,500,1000]

export default function MiniBaccarat(){
  const {balance,setBalance}=useStore()
  const {logBet}=useBet()
  const [bet,setBet]=useState({side:'player',amount:100})
  const [phase,setPhase]=useState('bet')
  const [pCards,setPCards]=useState([]),[bCards,setBCards]=useState([])
  const [result,setResult]=useState(null)

  const deal=()=>{
    if(bet.amount>balance)return toast.error('Insufficient balance')
    setBalance(b=>b-bet.amount); setPhase('dealing')
    const d=mkDeck()
    let pc=[d[0],d[2]],bc=[d[1],d[3]],rem=d.slice(4)
    let pv=handVal(pc),bv2=handVal(bc)
    if(pv<=5){pc.push(rem.shift());pv=handVal(pc)}
    if(bv2<=5){bc.push(rem.shift());bv2=handVal(bc)}
    setPCards(pc); setBCards(bc)
    sounds.cardDeal()

    setTimeout(()=>{
      const winner=pv>bv2?'player':bv2>pv?'banker':'tie'
      let win=0
      if(bet.side===winner){
        win=bet.side==='tie'?bet.amount*9:bet.side==='banker'?Math.floor(bet.amount*1.95):bet.amount*2
        setBalance(b=>b+win); sounds.win()
        toast.success(`${winner.toUpperCase()} wins! +${win} 🪙`)
        logBet('mini-baccarat',bet.amount,win)
      } else {
        sounds.loss()
        toast.error(`${winner.toUpperCase()} wins. Lost ${bet.amount} 🪙`)
        logBet('mini-baccarat',bet.amount,0)
      }
      setResult({winner,pv,bv2,win})
      setPhase('result')
    },600)
  }

  return(
    <div style={{maxWidth:'800px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(20px,5vw,28px)',marginBottom:'16px'}}>
        🎴 <span className="gold-text">Mini Baccarat</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{background:'radial-gradient(ellipse,#1a2a1a,#0d180d)',border:'2px solid var(--gold)',borderRadius:'16px',padding:'18px',marginBottom:'12px'}}>
            {['Player','Banker'].map((label,li)=>{
              const cards=li===0?pCards:bCards
              const val=li===0?result?.pv:result?.bv2
              const won=result&&result.winner===(li===0?'player':'banker')
              return(
                <div key={label} style={{marginBottom:'14px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',border:`1px solid ${won?'rgba(201,162,39,0.4)':'rgba(255,255,255,0.06)'}`}}>
                  <div style={{color:li===0?'#4488ff':'#ff4444',fontWeight:'700',fontSize:'13px',minWidth:'60px'}}>{label}</div>
                  <div style={{display:'flex',gap:'6px',flex:1,justifyContent:'center'}}>
                    {cards.length>0?cards.map((c,i)=><MCard key={i} c={c}/>):Array(2).fill(null).map((_,i)=><div key={i} style={{width:'clamp(36px,10vw,52px)',height:'clamp(50px,14vw,72px)',background:'linear-gradient(135deg,#1a1a4e,#2a2a8e)',borderRadius:'6px'}}/>)}
                  </div>
                  <div style={{fontWeight:'900',fontSize:'22px',color:won?'#c9a227':'#555',minWidth:'40px',textAlign:'right'}}>{val??''}</div>
                </div>
              )
            })}
            {result&&(
              <div style={{textAlign:'center',padding:'10px',borderRadius:'8px',background:'rgba(201,162,39,0.08)',border:'1px solid rgba(201,162,39,0.2)',marginTop:'6px',fontSize:'15px',fontWeight:'800',color:result.win>0?'#00d084':result.winner==='tie'?'#c9a227':'#ff4444'}}>
                {result.winner.toUpperCase()} WINS {result.win>0?`• +${result.win} 🪙`:''}
              </div>
            )}
          </div>
        </div>

        <div className="game-panel-right">
          {/* Side selector */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'12px',marginBottom:'10px'}}>
            <div style={{fontSize:'11px',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'8px'}}>Bet On</div>
            <div style={{display:'flex',gap:'6px'}}>
              {BETS.map(b=>(
                <button key={b.id} onClick={()=>setBet(p=>({...p,side:b.id}))} style={{flex:1,padding:'8px 4px',borderRadius:'7px',border:`1.5px solid ${bet.side===b.id?b.col:'var(--border)'}`,background:bet.side===b.id?`${b.col}18`:'var(--bg-hover)',color:bet.side===b.id?b.col:'var(--text-muted)',fontWeight:'700',fontSize:'11px',cursor:'pointer',textAlign:'center'}}>
                  <div>{b.label}</div>
                  <div style={{fontSize:'9px',opacity:0.7}}>{b.pay}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount selector */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'12px',marginBottom:'10px'}}>
            <div style={{fontSize:'11px',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'8px'}}>Amount</div>
            <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
              {AMOUNTS.map(a=>(
                <button key={a} onClick={()=>setBet(p=>({...p,amount:a}))} style={{flex:'1 1 30%',padding:'8px 4px',borderRadius:'6px',border:`1px solid ${bet.amount===a?'var(--gold)':'var(--border)'}`,background:bet.amount===a?'rgba(201,162,39,0.15)':'var(--bg-hover)',color:bet.amount===a?'var(--gold)':'var(--text-secondary)',fontWeight:'700',fontSize:'12px',cursor:'pointer'}}>
                  🪙{a>=1000?`${a/1000}K`:a}
                </button>
              ))}
            </div>
          </div>

          {phase==='result'?(
            <button onClick={()=>{setPhase('bet');setPCards([]);setBCards([]);setResult(null)}} className="btn-gold" style={{width:'100%',padding:'13px',fontSize:'14px'}}>🔄 New Round</button>
          ):(
            <button onClick={deal} disabled={phase!=='bet'} className="btn-gold" style={{width:'100%',padding:'13px',fontSize:'14px',opacity:phase!=='bet'?0.5:1}}>
              {phase==='dealing'?'⏳ Dealing...':'🃏 DEAL'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
