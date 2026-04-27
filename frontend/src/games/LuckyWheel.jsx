import React, { useRef, useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

const SEGS = [
  {l:'2x',m:2,c:'#c9a227'},{l:'LOSE',m:0,c:'#ff4444'},{l:'3x',m:3,c:'#4488ff'},{l:'LOSE',m:0,c:'#ff4444'},
  {l:'1.5x',m:1.5,c:'#00d084'},{l:'LOSE',m:0,c:'#ff4444'},{l:'5x',m:5,c:'#9944ff'},{l:'LOSE',m:0,c:'#ff4444'},
  {l:'2x',m:2,c:'#c9a227'},{l:'LOSE',m:0,c:'#ff4444'},{l:'10x',m:10,c:'#f0c84a'},{l:'LOSE',m:0,c:'#ff4444'},
]
const W=400,H=400,CX=200,CY=200,R=178

export default function LuckyWheel() {
  const canvasRef = useRef(null)
  const angleRef = useRef(0)
  const speedRef = useRef(0)
  const spinRef = useRef(false)
  const betRef = useRef(0)
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let raf
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) { raf=requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0,0,W,H)

      if (spinRef.current) {
        speedRef.current = Math.max(0, speedRef.current * 0.989)
        angleRef.current += speedRef.current
        if (speedRef.current < 0.005) {
          spinRef.current = false; setSpinning(false)
          const sliceAngle = (Math.PI*2)/SEGS.length
          const norm = ((-angleRef.current%(Math.PI*2))+(Math.PI*2))%(Math.PI*2)
          const winIdx = Math.floor(norm/sliceAngle)%SEGS.length
          const winner = SEGS[winIdx]; setResult(winner)
          const win = Math.floor(betRef.current*winner.m)
          if(win>0){setBalance(b=>b+win);sounds.win(); toast.success(`${winner.l}! +${win} 🪙 🎡`);logBet('lucky-wheel',betRef.current,win)}
          else{toast.error('No win this spin!');logBet('lucky-wheel',betRef.current,0)}
        }
      }

      const sliceAngle = (Math.PI*2)/SEGS.length
      const rimG = ctx.createLinearGradient(CX-R-8,CY,CX+R+8,CY)
      rimG.addColorStop(0,'#9a7a10'); rimG.addColorStop(0.5,'#f0c84a'); rimG.addColorStop(1,'#9a7a10')
      ctx.beginPath(); ctx.arc(CX,CY,R+8,0,Math.PI*2); ctx.fillStyle=rimG; ctx.fill()

      SEGS.forEach((seg,i)=>{
        const start=angleRef.current+i*sliceAngle-Math.PI/2, end=start+sliceAngle
        ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,R,start,end); ctx.closePath()
        ctx.fillStyle=seg.c; ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=1.5; ctx.stroke()
        const mid=start+sliceAngle/2
        const tx=CX+R*0.68*Math.cos(mid),ty=CY+R*0.68*Math.sin(mid)
        ctx.save(); ctx.translate(tx,ty); ctx.rotate(mid+Math.PI/2)
        ctx.font=`bold ${seg.l.length>3?10:12}px Outfit`; ctx.fillStyle='white'; ctx.textAlign='center'; ctx.textBaseline='middle'
        ctx.shadowBlur=3; ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.fillText(seg.l,0,0); ctx.shadowBlur=0; ctx.restore()
      })

      const cG = ctx.createRadialGradient(CX-4,CY-4,2,CX,CY,26)
      cG.addColorStop(0,'#f0c84a'); cG.addColorStop(1,'#8a6010')
      ctx.beginPath(); ctx.arc(CX,CY,26,0,Math.PI*2); ctx.fillStyle=cG; ctx.fill()
      ctx.font='bold 15px Cinzel'; ctx.fillStyle='#0a0a0f'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('♠',CX,CY)

      ctx.beginPath(); ctx.moveTo(CX-10,CY-R-16); ctx.lineTo(CX+10,CY-R-16); ctx.lineTo(CX,CY-R+6); ctx.closePath()
      ctx.fillStyle='#ff4444'; ctx.shadowBlur=8; ctx.shadowColor='#ff4444'; ctx.fill(); ctx.shadowBlur=0

      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(raf)
  },[setBalance])

  const doSpin = (amount) => {
    if(spinRef.current) return
    setBalance(b=>b-amount); betRef.current=amount; setResult(null)
    speedRef.current=0.32+Math.random()*0.14; sounds.wheelSpin(); spinRef.current=true; setSpinning(true)
  }

  return (
    <div style={{ maxWidth:'800px',margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif',fontSize:'clamp(18px,4vw,26px)',marginBottom:'16px' }}>
        🎡 <span className="gold-text">Lucky Wheel</span>
      </h1>
      <div className="game-layout" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))' }}>
        <div style={{ textAlign:'center' }}>
          <canvas ref={canvasRef} width={W} height={H} style={{ width:'100%',maxWidth:'400px',borderRadius:'50%',display:'block',margin:'0 auto',boxShadow:spinning?'0 0 40px rgba(201,162,39,0.5)':'0 8px 36px rgba(0,0,0,0.5)' }} />
          {result && (
            <div style={{ marginTop:'14px',padding:'12px 24px',borderRadius:'12px',display:'inline-block',background:result.m>0?'rgba(0,208,132,0.12)':'rgba(255,68,68,0.12)',border:`1px solid ${result.m>0?'rgba(0,208,132,0.3)':'rgba(255,68,68,0.3)'}`,fontSize:'22px',fontWeight:'900',color:result.m>0?'#00d084':'#ff4444' }}>
              {result.l}{result.m>0?` — +${Math.floor(betRef.current*result.m)} 🪙`:''}
            </div>
          )}
        </div>
        <div className="game-panel-right"><BetPanel onBet={doSpin} disabled={spinning} /></div>
      </div>
    </div>
  )
}
