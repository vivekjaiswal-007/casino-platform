import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import BetPanel from '../components/BetPanel'
import toast from 'react-hot-toast'
import useBet from '../hooks/useBet'
import sounds from '../utils/sounds'

/* ═══════════════════════════════════════
   DICE GAME
═══════════════════════════════════════ */
export function DiceGame() {
  const { setBalance } = useStore()
  const { logBet } = useBet()
  const [result, setResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [target, setTarget] = useState(50)
  const [betOver, setBetOver] = useState(true)
  const [display, setDisplay] = useState(50)
  const ivRef = useRef(null)

  const payout = betOver
    ? parseFloat((99 / (100 - target) * 0.97).toFixed(2))
    : parseFloat((99 / target * 0.97).toFixed(2))
  const winChance = betOver ? 100 - target : target

  const roll = (amount) => {
    setBalance(b => b - amount)  // deduct bet
    setRolling(true); setResult(null)
    let count = 0
    ivRef.current = setInterval(() => {
      setDisplay(Math.ceil(Math.random() * 99))
      count++
      if (count > 14) {
        clearInterval(ivRef.current)
        const r = Math.ceil(Math.random() * 99)
        setDisplay(r); setRolling(false)
        const win = betOver ? r > target : r < target
        setResult({ value: r, win })
        if (win) { const w = Math.floor(amount * payout); setBalance(b => b + w); toast.success(`🎲 ${r} — Won ${w} 🪙 at ${payout}x`); logBet('dice', amount, w) }
        else { toast.error(`🎲 ${r} — Need ${betOver?'>':'<'}${target}. Lost ${amount} 🪙!`); logBet('dice', amount, 0) }
      }
    }, 60)
  }

  return (
    <div style={{ maxWidth:'700px', margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(18px,4vw,26px)', marginBottom:'16px' }}>
        ⚀ <span className="gold-text">Dice</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'clamp(20px,5vw,40px)',textAlign:'center',marginBottom:'14px' }}>
            <div style={{ fontSize:'clamp(60px,15vw,96px)',fontWeight:'900',fontFamily:'Cinzel,serif',lineHeight:1,color:result?(result.win?'#00d084':'#ff4444'):'#c9a227',textShadow:result?(result.win?'0 0 30px rgba(0,208,132,0.4)':'0 0 30px rgba(255,68,68,0.4)'):'none',transition:'color 0.3s' }}>{display}</div>
            {result && <div style={{ marginTop:'10px',fontSize:'16px',fontWeight:'700',color:result.win?'#00d084':'#ff4444' }}>{result.win?'🎉 WIN!':'❌ LOSE'} — needed {betOver?'>':'<'}{target}</div>}
          </div>
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'18px',marginBottom:'12px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'12px',flexWrap:'wrap',gap:'8px' }}>
              {[{l:'Target',v:target,c:'var(--gold)'},{l:'Payout',v:`${payout}x`,c:'#00d084'},{l:'Win Chance',v:`${winChance}%`,c:'#4488ff'}].map(s=>(
                <div key={s.l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'10px',color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'3px' }}>{s.l}</div>
                  <div style={{ fontSize:'clamp(20px,4vw,28px)',fontWeight:'900',color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
            <input type="range" min="2" max="97" value={target} onChange={e=>setTarget(Number(e.target.value))} style={{ width:'100%',accentColor:'#c9a227',cursor:'pointer',height:'6px' }} />
            <div style={{ display:'flex',gap:'8px',marginTop:'12px' }}>
              {[{l:'Roll Over',v:true},{l:'Roll Under',v:false}].map(b=>(
                <button key={b.l} onClick={()=>setBetOver(b.v)} style={{ flex:1,padding:'10px',borderRadius:'8px',fontWeight:'700',fontSize:'13px',background:betOver===b.v?'rgba(201,162,39,0.2)':'var(--bg-hover)',border:`1px solid ${betOver===b.v?'var(--gold)':'var(--border)'}`,color:betOver===b.v?'var(--gold)':'var(--text-secondary)',cursor:'pointer' }}>{b.l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="game-panel-right"><BetPanel onBet={roll} disabled={rolling} /></div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   HI-LO GAME  (with auto cashout)
═══════════════════════════════════════ */
const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K']
function freshDeck(){const d=[];for(const s of SUITS)for(const r of RANKS)d.push({rank:r,suit:s});return d.sort(()=>Math.random()-0.5)}

export function HiLoGame() {
  const { setBalance } = useStore()
  const { logBet: logHiLoBet } = useBet()
  const [deck, setDeck] = useState(()=>freshDeck())
  const [idx, setIdx] = useState(0)
  const [card, setCard] = useState(null)
  const [phase, setPhase] = useState('bet')
  const [bet, setBet] = useState(0)
  const [mult, setMult] = useState(1)
  const [streak, setStreak] = useState(0)
  const [result, setResult] = useState(null)
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [autoTarget, setAutoTarget] = useState(3.0)
  const betRef = useRef(0)
  const multRef = useRef(1)
  const autoRef = useRef(null)

  // Auto cashout check
  useEffect(() => {
    if (!autoEnabled || phase !== 'playing') return
    if (multRef.current >= autoTarget) { doCashout(); return }
    autoRef.current = setInterval(() => {
      if (multRef.current >= autoTarget) { clearInterval(autoRef.current); doCashout() }
    }, 200)
    return () => clearInterval(autoRef.current)
  }, [autoEnabled, autoTarget, phase, streak])

  const start = (amount) => {
    setBalance(b=>b-amount)  // deduct bet
    const d = freshDeck(); setDeck(d); setIdx(1); setCard(d[0])
    betRef.current = amount; setBet(amount); setPhase('playing')
    multRef.current = 1; setMult(1); setStreak(0); setResult(null)
  }

  const guess = (dir) => {
    if (phase !== 'playing') return
    if(dir==='higher')sounds.hiloHigher();else sounds.hiloLower(); sounds.cardReveal(); const next = deck[idx]
    if (!next) { doCashout(); return }
    const cr = RANKS.indexOf(card.rank), nr = RANKS.indexOf(next.rank)
    setIdx(i=>i+1); setCard(next)
    if (nr === cr) { toast('Same rank!',{icon:'🤝',duration:700}); return }
    const correct = dir==='higher'?nr>cr:nr<cr
    if (correct) {
      const nm = parseFloat((mult*1.52).toFixed(2))
      multRef.current = nm; setMult(nm); setStreak(s=>s+1)
      toast.success(`Correct! ${nm}x`,{duration:600})
    } else {
      clearInterval(autoRef.current); setPhase('result'); setResult('lose')
      toast.error('Wrong! Lost your bet.'); logHiLoBet('hi-lo', betRef.current, 0)
    }
  }

  const doCashout = () => {
    if (phase !== 'playing') return
    clearInterval(autoRef.current)
    const win = Math.floor(betRef.current * multRef.current)
    setBalance(b => b + win); setPhase('result'); setResult('win')
    toast.success(`Cashed out at ${multRef.current.toFixed(2)}x! +${win} 🪙`); logHiLoBet('hi-lo', betRef.current, win)
  }

  const isRed = card && (card.suit==='♥'||card.suit==='♦')

  return (
    <div style={{ maxWidth:'700px',margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif',fontSize:'clamp(18px,4vw,26px)',marginBottom:'16px' }}>
        📈 <span className="gold-text">Hi-Lo</span>
      </h1>
      <div className="game-layout">
        <div>
          <div style={{ background:'radial-gradient(ellipse,#1a4a2a,#0d2e1a)',border:'3px solid var(--gold)',borderRadius:'18px',padding:'clamp(20px,5vw,36px)',textAlign:'center',minHeight:'280px' }}>
            {!card ? (
              <div style={{ paddingTop:'50px' }}><div style={{ fontSize:'48px',marginBottom:'12px' }}>📈</div><p style={{ color:'rgba(255,255,255,0.5)' }}>Place bet to start</p></div>
            ) : (
              <>
                <div style={{ display:'flex',justifyContent:'center',gap:'16px',marginBottom:'14px',flexWrap:'wrap' }}>
                  <span style={{ color:'var(--gold)',fontSize:'13px' }}>Streak: {streak}</span>
                  <span style={{ color:'#00d084',fontSize:'13px',fontWeight:'700' }}>{mult.toFixed(2)}x</span>
                  {autoEnabled && <span style={{ color:'#9944ff',fontSize:'12px' }}>Auto @{autoTarget}x</span>}
                </div>
                <div style={{ display:'inline-block',padding:'10px',background:'rgba(255,255,255,0.06)',borderRadius:'12px' }}>
                  <div style={{ width:'clamp(80px,20vw,100px)',height:'clamp(110px,28vw,140px)',background:'white',borderRadius:'9px',border:`3px solid ${result==='win'?'#c9a227':'#ddd'}`,display:'flex',flexDirection:'column',padding:'7px',boxShadow:'0 6px 20px rgba(0,0,0,0.5)',animation:'dealCard 0.35s ease' }}>
                    <div style={{ fontSize:'clamp(11px,3vw,16px)',fontWeight:'900',color:isRed?'#cc2222':'#111' }}>{card.rank}</div>
                    <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'clamp(28px,8vw,40px)',color:isRed?'#cc2222':'#111' }}>{card.suit}</div>
                  </div>
                </div>
                {result && <div style={{ marginTop:'14px',fontSize:'20px',fontWeight:'800',color:result==='win'?'#00d084':'#ff4444' }}>{result==='win'?'🎉 Cashed Out!':'❌ Wrong Guess!'}</div>}
              </>
            )}
          </div>

          {phase==='playing' && (
            <div style={{ display:'flex',gap:'8px',marginTop:'12px',flexWrap:'wrap' }}>
              <button onClick={()=>guess('higher')} style={{ flex:2,minWidth:'80px',padding:'13px',borderRadius:'10px',fontWeight:'800',fontSize:'14px',background:'rgba(0,208,132,0.18)',border:'2px solid #00d084',color:'#00d084',cursor:'pointer' }}>⬆️ Higher</button>
              <button onClick={doCashout} style={{ flex:1,minWidth:'60px',padding:'13px',borderRadius:'10px',fontWeight:'800',fontSize:'13px',background:'rgba(201,162,39,0.18)',border:'2px solid var(--gold)',color:'var(--gold)',cursor:'pointer' }}>💰</button>
              <button onClick={()=>guess('lower')} style={{ flex:2,minWidth:'80px',padding:'13px',borderRadius:'10px',fontWeight:'800',fontSize:'14px',background:'rgba(255,68,68,0.18)',border:'2px solid #ff4444',color:'#ff4444',cursor:'pointer' }}>⬇️ Lower</button>
            </div>
          )}
          {phase==='result' && <button onClick={()=>setPhase('bet')} className="btn-gold" style={{ width:'100%',marginTop:'12px',padding:'13px' }}>New Game</button>}
        </div>

        <div className="game-panel-right">
          <BetPanel onBet={start} disabled={phase!=='bet'} />
          {/* Auto cashout */}
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'12px',padding:'14px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:autoEnabled?'10px':'0' }}>
              <span style={{ color:'#9944ff',fontSize:'12px',fontWeight:'700' }}>⚡ Auto Cashout</span>
              <button onClick={()=>setAutoEnabled(!autoEnabled)} style={{ width:'40px',height:'21px',borderRadius:'11px',border:'none',background:autoEnabled?'#9944ff':'#2a2a3a',cursor:'pointer',position:'relative',transition:'background 0.3s' }}>
                <div style={{ width:'15px',height:'15px',borderRadius:'50%',background:'white',position:'absolute',top:'3px',left:autoEnabled?'22px':'3px',transition:'left 0.3s' }} />
              </button>
            </div>
            {autoEnabled && (
              <>
                <div style={{ display:'flex',gap:'4px',marginBottom:'6px',flexWrap:'wrap' }}>
                  {[2,3,5,10,20].map(m=>(
                    <button key={m} onClick={()=>setAutoTarget(m)} style={{ flex:1,minWidth:'30px',padding:'5px 2px',borderRadius:'5px',fontSize:'11px',fontWeight:'700',background:autoTarget===m?'rgba(153,68,255,0.28)':'var(--bg-hover)',border:`1px solid ${autoTarget===m?'#9944ff':'var(--border)'}`,color:autoTarget===m?'#9944ff':'var(--text-secondary)',cursor:'pointer' }}>{m}x</button>
                  ))}
                </div>
                <input type="number" value={autoTarget} onChange={e=>setAutoTarget(Math.max(1.5,Number(e.target.value)))} step="0.5" min="1.5"
                  style={{ width:'100%',padding:'6px',background:'var(--bg-hover)',border:'1px solid #3a3a4a',borderRadius:'6px',color:'#9944ff',fontSize:'13px',fontWeight:'700',textAlign:'center',outline:'none' }} />
                <p style={{ color:'var(--text-muted)',fontSize:'10px',marginTop:'4px',textAlign:'center' }}>Auto cashout at {autoTarget}x</p>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes dealCard{from{opacity:0;transform:translateY(-15px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ═══════════════════════════════════════
   SPIN & WIN
═══════════════════════════════════════ */
const SW_SEGS = [{l:'2x',m:2,c:'#c9a227'},{l:'LOSE',m:0,c:'#ff4444'},{l:'3x',m:3,c:'#4488ff'},{l:'LOSE',m:0,c:'#ff4444'},{l:'1.5x',m:1.5,c:'#00d084'},{l:'LOSE',m:0,c:'#ff4444'},{l:'5x',m:5,c:'#9944ff'},{l:'LOSE',m:0,c:'#ff4444'}]

export function SpinWin() {
  const { setBalance } = useStore()
  const { logBet: logSpinBet } = useBet()
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const betRef = useRef(0)

  const spin = (amount) => {
    if (spinning) return
    setBalance(b=>b-amount); betRef.current=amount; setSpinning(true); setResult(null)
    const winIdx = Math.floor(Math.random()*SW_SEGS.length)
    const sliceAngle = 360/SW_SEGS.length
    const target = rotation + 1440 + (SW_SEGS.length-winIdx)*sliceAngle - sliceAngle/2
    setRotation(target)
    setTimeout(()=>{
      setSpinning(false); const seg=SW_SEGS[winIdx]; setResult(seg)
      const win=Math.floor(betRef.current*seg.m)
      if(win>0){setBalance(b=>b+win);toast.success(`${seg.l}! +${win} 🪙`);sounds.win(); sounds.coinCollect(); logSpinBet('spin-win',betRef.current,win)}
      else{toast.error('No win this spin!');sounds.loss();logSpinBet('spin-win',betRef.current,0)}
    },4100)
  }

  return (
    <div style={{ maxWidth:'700px',margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif',fontSize:'clamp(18px,4vw,26px)',marginBottom:'16px' }}>🎪 <span className="gold-text">Spin &amp; Win</span></h1>
      <div className="game-layout">
        <div style={{ textAlign:'center' }}>
          <div style={{ position:'relative',display:'inline-block',marginBottom:'14px' }}>
            <div style={{ width:0,height:0,position:'absolute',top:'-4px',left:'50%',transform:'translateX(-50%)',borderLeft:'11px solid transparent',borderRight:'11px solid transparent',borderTop:'22px solid var(--gold)',zIndex:10 }} />
            <div style={{ width:'clamp(240px,60vw,300px)',height:'clamp(240px,60vw,300px)',borderRadius:'50%',overflow:'hidden',border:'5px solid var(--gold)',boxShadow:spinning?'0 0 35px rgba(201,162,39,0.5)':'0 8px 36px rgba(0,0,0,0.5)',transform:`rotate(${rotation}deg)`,transition:spinning?'transform 4s cubic-bezier(0.17,0,0.08,1)':'none',background:`conic-gradient(${SW_SEGS.map((s,i)=>`${s.c} ${i*(100/SW_SEGS.length)}% ${(i+1)*(100/SW_SEGS.length)}%`).join(',')})`,position:'relative' }}>
              {SW_SEGS.map((s,i)=>{
                const a=(i+0.5)*(360/SW_SEGS.length),r=(a-90)*Math.PI/180
                const sz=150
                return <div key={i} style={{ position:'absolute',left:`${50+45*Math.cos(r)}%`,top:`${50+45*Math.sin(r)}%`,transform:`translate(-50%,-50%) rotate(${a}deg)`,color:'white',fontWeight:'900',fontSize:'clamp(10px,2.5vw,12px)',textShadow:'0 1px 3px rgba(0,0,0,0.9)',pointerEvents:'none',whiteSpace:'nowrap' }}>{s.l}</div>
              })}
            </div>
          </div>
          {result && (
            <div style={{ padding:'12px 24px',borderRadius:'12px',display:'inline-block',background:result.m>0?'rgba(0,208,132,0.12)':'rgba(255,68,68,0.12)',border:`1px solid ${result.m>0?'rgba(0,208,132,0.3)':'rgba(255,68,68,0.3)'}`,fontSize:'20px',fontWeight:'900',color:result.m>0?'#00d084':'#ff4444' }}>
              {result.l}{result.m>0?` — +${Math.floor(betRef.current*result.m)} 🪙`:''}
            </div>
          )}
        </div>
        <div className="game-panel-right"><BetPanel onBet={spin} disabled={spinning} /></div>
      </div>
    </div>
  )
}

export default DiceGame
