import React, { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'
import toast from 'react-hot-toast'

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅']

export default function DiceBattle() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [phase, setPhase] = useState('bet')
  const [playerDice, setPlayerDice] = useState([1,1])
  const [dealerDice, setDealerDice] = useState([1,1])
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState(null)
  const ivRef = useRef(null)

  const roll = (amount) => {
    setBalance(b => b - amount)
    setRolling(true); setResult(null); setPhase('rolling')
    sounds.diceRoll()

    let count = 0
    ivRef.current = setInterval(() => {
      setPlayerDice([Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)])
      setDealerDice([Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)])
      count++
      if (count > 18) {
        clearInterval(ivRef.current)
        const pd1=Math.ceil(Math.random()*6), pd2=Math.ceil(Math.random()*6)
        const dd1=Math.ceil(Math.random()*6), dd2=Math.ceil(Math.random()*6)
        setPlayerDice([pd1,pd2]); setDealerDice([dd1,dd2])
        setRolling(false)

        const pSum=pd1+pd2, dSum=dd1+dd2
        if(pSum>dSum){
          const win=amount*2; setBalance(b=>b+win)
          sounds.win(); toast.success(`🎉 ${pSum} vs ${dSum}! Won ${win} 🪙`)
          logBet('dice-battle',amount,win); setResult({type:'win',pSum,dSum,win})
        } else if(dSum>pSum){
          sounds.loss(); toast.error(`${pSum} vs ${dSum}. Lost ${amount} 🪙`)
          logBet('dice-battle',amount,0); setResult({type:'lose',pSum,dSum})
        } else {
          setBalance(b=>b+amount); sounds.cardFlip()
          toast('🤝 Tie! Bet returned.'); logBet('dice-battle',amount,amount)
          setResult({type:'tie',pSum,dSum})
        }
        setPhase('result')
      }
    }, 70)
  }

  const DicePair = ({dice, label, color}) => (
    <div style={{textAlign:'center'}}>
      <div style={{color:'var(--text-secondary)',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',marginBottom:'10px'}}>{label}</div>
      <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
        {dice.map((d,i)=>(
          <div key={i} style={{width:'clamp(52px,15vw,72px)',height:'clamp(52px,15vw,72px)',background:'white',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(28px,8vw,42px)',boxShadow:`0 4px 16px ${color}44`,border:`3px solid ${color}44`,transition:'all 0.1s'}}>
            {DICE_FACES[d-1]}
          </div>
        ))}
      </div>
      <div style={{marginTop:'10px',fontSize:'24px',fontWeight:'900',color}}>{dice[0]+dice[1]}</div>
    </div>
  )

  return (
    <div style={{maxWidth:'700px',margin:'0 auto'}}>
      <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(20px,5vw,28px)',marginBottom:'16px'}}>
        🎲 <span className="gold-text">Dice Battle</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'28px',textAlign:'center',minHeight:'260px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div style={{display:'flex',justifyContent:'space-around',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'20px'}}>
              <DicePair dice={playerDice} label="You" color="#00d084"/>
              <div style={{fontSize:'clamp(24px,7vw,36px)',color:result?result.type==='win'?'#00d084':result.type==='lose'?'#ff4444':'#c9a227':'#444',fontWeight:'900'}}>
                {result?result.type==='win'?'🏆':result.type==='lose'?'💔':'🤝':'VS'}
              </div>
              <DicePair dice={dealerDice} label="Dealer" color="#ff4444"/>
            </div>

            {result&&(
              <div style={{padding:'14px',borderRadius:'12px',background:result.type==='win'?'rgba(0,208,132,0.1)':result.type==='lose'?'rgba(255,68,68,0.1)':'rgba(201,162,39,0.1)',border:`1px solid ${result.type==='win'?'rgba(0,208,132,0.3)':result.type==='lose'?'rgba(255,68,68,0.3)':'rgba(201,162,39,0.3)'}`,fontSize:'18px',fontWeight:'900',color:result.type==='win'?'#00d084':result.type==='lose'?'#ff4444':'#c9a227'}}>
                {result.type==='win'?`🏆 ${result.pSum} > ${result.dSum} — Won ${result.win} 🪙`:result.type==='lose'?`💔 ${result.pSum} < ${result.dSum}`:`🤝 ${result.pSum} = ${result.dSum} — Tie!`}
              </div>
            )}

            {phase==='bet'&&<div style={{color:'var(--text-muted)',fontSize:'13px'}}>Roll 2 dice vs dealer! Higher sum wins • Pays <strong style={{color:'var(--gold)'}}>2x</strong></div>}
          </div>
        </div>
        <div className="game-panel-right">
          {phase==='result'?(
            <button onClick={()=>{setPhase('bet');setResult(null)}} className="btn-gold" style={{width:'100%',padding:'14px',fontSize:'15px'}}>🎲 Roll Again</button>
          ):(
            <BetPanel onBet={roll} disabled={phase!=='bet'}/>
          )}
        </div>
      </div>
    </div>
  )
}
