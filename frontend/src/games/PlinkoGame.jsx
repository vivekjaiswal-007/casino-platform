import React, { useRef, useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

const MULTS = [110,41,10,5,3,1.5,0,0,0,0,1.5,3,5,10,41,110]
const ROWS=14,PEG_R=5,BALL_R=8,W=560,H=520

export default function PlinkoGame() {
  const canvasRef = useRef(null)
  const ballsRef = useRef([])
  const pegsRef = useRef([])
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const pegs=[]
    for(let row=0;row<ROWS;row++){const cols=row+3,sx=W/2-(cols-1)*28/2;for(let col=0;col<cols;col++)pegs.push({x:sx+col*28,y:60+row*33})}
    pegsRef.current=pegs
  },[])

  useEffect(()=>{
    let raf
    const loop=()=>{
      const canvas=canvasRef.current
      if(!canvas){raf=requestAnimationFrame(loop);return}
      const ctx=canvas.getContext('2d')
      ctx.clearRect(0,0,W,H)
      const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a0a1a');bg.addColorStop(1,'#111128');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
      pegsRef.current.forEach(peg=>{ctx.beginPath();ctx.arc(peg.x,peg.y,PEG_R,0,Math.PI*2);const g=ctx.createRadialGradient(peg.x-1,peg.y-1,0,peg.x,peg.y,PEG_R);g.addColorStop(0,'#fff');g.addColorStop(1,'#9999cc');ctx.fillStyle=g;ctx.fill()})
      const bW=W/MULTS.length
      MULTS.forEach((mult,i)=>{const bx=i*bW,by=H-55,isZ=mult===0,col=isZ?'#444455':mult>=41?'#c9a227':mult>=10?'#ff4488':mult>=3?'#00d084':'#4488ff';ctx.fillStyle=col+'22';ctx.fillRect(bx+2,by,bW-4,50);ctx.strokeStyle=col+'80';ctx.lineWidth=1.5;ctx.strokeRect(bx+2,by,bW-4,50);ctx.fillStyle=isZ?'#444455':col;ctx.font=`bold ${mult>=10?10:9}px Outfit`;ctx.textAlign='center';ctx.fillText(isZ?'0x':`${mult}x`,bx+bW/2,by+30)})
      const toRemove=[]
      ballsRef.current.forEach(ball=>{
        if(ball.settled)return
        ball.trail=ball.trail||[];ball.trail.push({x:ball.x,y:ball.y});if(ball.trail.length>8)ball.trail.shift()
        ball.vy+=0.25;ball.vx*=0.99;ball.x+=ball.vx;ball.y+=ball.vy
        pegsRef.current.forEach(peg=>{const dx=ball.x-peg.x,dy=ball.y-peg.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<PEG_R+BALL_R){const nx=dx/dist,ny=dy/dist,ov=PEG_R+BALL_R-dist;ball.x+=nx*ov;ball.y+=ny*ov;const dot=ball.vx*nx+ball.vy*ny;sounds.plinkoHit(); ball.vx=(ball.vx-2*dot*nx)*0.6;ball.vy=(ball.vy-2*dot*ny)*0.6;ball.vx+=(Math.random()-0.5)*1.5;if(Math.abs(ball.vy)<2)ball.vy=2}})
        if(ball.x<BALL_R){ball.x=BALL_R;ball.vx=Math.abs(ball.vx)}
        if(ball.x>W-BALL_R){ball.x=W-BALL_R;ball.vx=-Math.abs(ball.vx)}
        if(ball.y>H-50){ball.settled=true;ball.y=H-50;const idx=Math.min(MULTS.length-1,Math.max(0,Math.floor(ball.x/(W/MULTS.length))));const mult=MULTS[idx];const win=Math.floor(ball.bet*mult);setBalance(b=>b+win);logBet('plinko',ball.bet,win);sounds.plinkoLand(); if(mult===0){sounds.loss();toast.error(`0x — Lost ${ball.bet} 🪙`)}else if(mult>=41){sounds.bigWin();toast.success(`🎉 ${mult}x JACKPOT! +${win} 🪙`)}else if(mult>=10){sounds.win();toast.success(`💰 ${mult}x! +${win} 🪙`)}else if(mult>=3){sounds.win();toast(`✅ ${mult}x — ${win} 🪙`)}else{toast(`${mult}x — ${win} 🪙`,{icon:'😐'})};toRemove.push(ball)}
        if(ball.trail)ball.trail.forEach((pt,ti)=>{ctx.beginPath();ctx.arc(pt.x,pt.y,BALL_R*(ti/ball.trail.length)*0.5,0,Math.PI*2);ctx.fillStyle=`rgba(201,162,39,${(ti/ball.trail.length)*0.25})`;ctx.fill()})
        ctx.beginPath();ctx.arc(ball.x,ball.y,BALL_R,0,Math.PI*2);const bg2=ctx.createRadialGradient(ball.x-2,ball.y-2,1,ball.x,ball.y,BALL_R);bg2.addColorStop(0,'#f0c84a');bg2.addColorStop(0.6,'#c9a227');bg2.addColorStop(1,'#8a6010');ctx.fillStyle=bg2;ctx.shadowBlur=10;ctx.shadowColor='#c9a227';ctx.fill();ctx.shadowBlur=0
      })
      if(toRemove.length){toRemove.forEach(b=>setTimeout(()=>{ballsRef.current=ballsRef.current.filter(x=>x!==b);setActive(ballsRef.current.length)},600))}
      raf=requestAnimationFrame(loop)
    }
    raf=requestAnimationFrame(loop)
    return()=>cancelAnimationFrame(raf)
  },[setBalance])

  const drop=(amount)=>{
    setBalance(b=>b-amount);const ball={x:W/2+(Math.random()-0.5)*20,y:20,vx:(Math.random()-0.5)*2,vy:2,bet:amount,settled:false,trail:[]};ballsRef.current.push(ball);setActive(ballsRef.current.length)
  }

  return (
    <div style={{ maxWidth:'900px',margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif',fontSize:'clamp(18px,4vw,26px)',marginBottom:'16px' }}>⚡ <span className="gold-text">Plinko</span></h1>
      <div className="game-layout">
        <canvas ref={canvasRef} width={W} height={H} style={{ width:'100%',borderRadius:'12px',border:'1px solid var(--border)',display:'block' }} />
        <div className="game-panel-right">
          <BetPanel onBet={drop} />
          {active>0&&<div style={{ padding:'10px',background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.3)',borderRadius:'8px',textAlign:'center',color:'var(--gold)',fontSize:'13px' }}>🎯 {active} ball{active>1?'s':''} in play</div>}
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'13px' }}>
            <h4 style={{ color:'var(--gold)',marginBottom:'9px',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.5px' }}>Multipliers</h4>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'3px' }}>
              {MULTS.map((m,i)=>(
                <span key={i} style={{ padding:'2px 6px',borderRadius:'4px',fontSize:'11px',fontWeight:'700',background:m===0?'rgba(60,60,80,0.4)':m>=41?'rgba(201,162,39,0.22)':m>=10?'rgba(255,68,136,0.18)':m>=3?'rgba(0,208,132,0.14)':'rgba(68,136,255,0.14)',color:m===0?'#444455':m>=41?'#c9a227':m>=10?'#ff4488':m>=3?'#00d084':'#4488ff' }}>{m}x</span>
              ))}
            </div>
            <p style={{ color:'var(--text-muted)',fontSize:'10px',marginTop:'6px' }}>⚠️ 4 zero buckets in center</p>
          </div>
        </div>
      </div>
    </div>
  )
}
