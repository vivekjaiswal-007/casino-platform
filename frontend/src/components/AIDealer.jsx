/**
 * AIDealer — Animated casino dealer character
 * Shows shuffle animation, deal animation, and expressions
 * Props:
 *   phase: 'idle' | 'shuffling' | 'dealing' | 'waiting' | 'win' | 'lose' | 'tie'
 *   name: dealer name string
 *   compact: boolean (smaller version)
 */
import React, { useEffect, useRef, useState } from 'react'

const DEALER_NAMES = ['Priya', 'Rahul', 'Meera', 'Arjun', 'Kavya', 'Rohan']
const DEALER_NAME = DEALER_NAMES[Math.floor(Math.random() * DEALER_NAMES.length)]

// Animated card deck SVG - shuffling effect
function ShuffleCards({ active }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!active) { setFrame(0); return }
    const iv = setInterval(() => setFrame(f => (f + 1) % 8), 120)
    return () => clearInterval(iv)
  }, [active])

  const cards = [0, 1, 2, 3, 4]
  return (
    <div style={{ position: 'relative', width: '80px', height: '56px', margin: '0 auto' }}>
      {cards.map((i) => {
        const offset = active
          ? Math.sin((frame + i * 1.5) * 0.9) * 10
          : i * 2
        const rot = active
          ? Math.cos((frame + i) * 0.7) * 12
          : (i - 2) * 4
        const scale = active && i === Math.floor(frame / 2) % 5 ? 1.12 : 1
        return (
          <div key={i} style={{
            position: 'absolute',
            top: active ? `${10 + offset}px` : `${i * 1.5}px`,
            left: active ? `${20 + offset * 0.5}px` : `${i * 2}px`,
            width: '38px', height: '52px',
            background: i % 2 === 0
              ? 'linear-gradient(135deg,#1a1a4e,#2a2a7e)'
              : 'linear-gradient(135deg,#2a1a4e,#4a2a8e)',
            borderRadius: '5px',
            border: '1.5px solid rgba(255,255,255,0.15)',
            transform: `rotate(${rot}deg) scale(${scale})`,
            transition: active ? 'none' : 'all 0.4s',
            boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
          }}>
            {/* Card back pattern */}
            <div style={{ position: 'absolute', inset: '3px', borderRadius: '3px', background: 'repeating-linear-gradient(45deg,rgba(201,162,39,0.15) 0px,transparent 2px,transparent 4px,rgba(201,162,39,0.1) 6px)', border: '1px solid rgba(201,162,39,0.2)' }} />
          </div>
        )
      })}
    </div>
  )
}

// Dealer face - SVG character
function DealerFace({ expression, size = 80 }) {
  const s = size
  const expressions = {
    idle:    { mouth: 'M-8,2 Q0,6 8,2',     eyeL: 'circle', eyeR: 'circle', brow: 0 },
    shuffling:{ mouth: 'M-8,0 Q0,8 8,0',    eyeL: 'circle', eyeR: 'circle', brow: -2 },
    dealing: { mouth: 'M-8,0 Q0,7 8,0',     eyeL: 'focused', eyeR: 'focused', brow: -1 },
    waiting: { mouth: 'M-8,2 Q0,5 8,2',     eyeL: 'circle', eyeR: 'circle', brow: 0 },
    win:     { mouth: 'M-10,-2 Q0,10 10,-2', eyeL: 'happy', eyeR: 'happy', brow: 2 },
    lose:    { mouth: 'M-8,4 Q0,-2 8,4',     eyeL: 'circle', eyeR: 'circle', brow: -3 },
    tie:     { mouth: 'M-8,2 Q0,4 8,2',      eyeL: 'circle', eyeR: 'circle', brow: 0 },
  }
  const e = expressions[expression] || expressions.idle

  return (
    <svg width={s} height={s} viewBox="-40 -40 80 80" style={{ overflow: 'visible' }}>
      {/* Head shadow */}
      <ellipse cx="2" cy="28" rx="22" ry="6" fill="rgba(0,0,0,0.2)" />

      {/* Head */}
      <ellipse cx="0" cy="-2" rx="26" ry="28"
        fill="url(#faceGrad)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />

      {/* Gradient def */}
      <defs>
        <radialGradient id="faceGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#f5c5a0" />
          <stop offset="100%" stopColor="#d4956a" />
        </radialGradient>
        <radialGradient id="eyeGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#4a3a8a" />
          <stop offset="100%" stopColor="#1a0a3a" />
        </radialGradient>
      </defs>

      {/* Hair */}
      <ellipse cx="0" cy="-26" rx="27" ry="10" fill="#2a1a0a" />
      <rect x="-27" y="-30" width="54" height="12" rx="5" fill="#2a1a0a" />
      {/* Hair side parts */}
      <ellipse cx="-22" cy="-15" rx="8" ry="18" fill="#2a1a0a" />
      <ellipse cx="22" cy="-15" rx="8" ry="18" fill="#2a1a0a" />

      {/* Bow tie */}
      <polygon points="-12,26 -2,30 -12,34" fill="#c9a227" />
      <polygon points="12,26 2,30 12,34" fill="#c9a227" />
      <circle cx="0" cy="30" r="3" fill="#f0c84a" />

      {/* Collar */}
      <polygon points="-14,22 0,32 14,22 8,38 -8,38" fill="white" />
      <polygon points="-4,22 0,30 4,22" fill="#1a1a2e" />

      {/* Eyebrows */}
      <path d={`M-18,${-12+e.brow} Q-12,${-16+e.brow} -6,${-12+e.brow}`}
        stroke="#3a2010" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d={`M6,${-12+e.brow} Q12,${-16+e.brow} 18,${-12+e.brow}`}
        stroke="#3a2010" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      {e.eyeL === 'happy' ? (
        <>
          <path d="M-17,-4 Q-12,-9 -7,-4" stroke="#2a1a0a" strokeWidth="2.5" fill="none" />
          <path d="M7,-4 Q12,-9 17,-4" stroke="#2a1a0a" strokeWidth="2.5" fill="none" />
        </>
      ) : e.eyeL === 'focused' ? (
        <>
          <ellipse cx="-12" cy="-5" rx="6" ry="5" fill="url(#eyeGrad)" />
          <ellipse cx="12" cy="-5" rx="6" ry="5" fill="url(#eyeGrad)" />
          <circle cx="-11" cy="-5" r="2.5" fill="#0a0520" />
          <circle cx="13" cy="-5" r="2.5" fill="#0a0520" />
          <circle cx="-10" cy="-6.5" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="14" cy="-6.5" r="1" fill="rgba(255,255,255,0.7)" />
          {/* Half-lid */}
          <path d="M-18,-7 Q-12,-3 -6,-7" stroke="#c9856a" strokeWidth="2" fill="none" />
          <path d="M6,-7 Q12,-3 18,-7" stroke="#c9856a" strokeWidth="2" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="-12" cy="-5" rx="6" ry="5.5" fill="url(#eyeGrad)" />
          <ellipse cx="12" cy="-5" rx="6" ry="5.5" fill="url(#eyeGrad)" />
          <circle cx="-11" cy="-5" r="3" fill="#0a0520" />
          <circle cx="13" cy="-5" r="3" fill="#0a0520" />
          <circle cx="-9.5" cy="-7" r="1.2" fill="rgba(255,255,255,0.8)" />
          <circle cx="14.5" cy="-7" r="1.2" fill="rgba(255,255,255,0.8)" />
          {/* Eyelid */}
          <path d="M-18,-7 Q-12,-2 -6,-7" stroke="#c9856a" strokeWidth="1.5" fill="none" />
          <path d="M6,-7 Q12,-2 18,-7" stroke="#c9856a" strokeWidth="1.5" fill="none" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="-4" cy="4" rx="2" ry="1.5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="4" cy="4" rx="2" ry="1.5" fill="rgba(0,0,0,0.1)" />
      <path d="M-4,2 Q0,5 4,2" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />

      {/* Mouth */}
      <path d={e.mouth}
        transform="translate(0,14)"
        stroke="#8a3a2a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {expression === 'win' && (
        <path d="M-10,-2 Q0,10 10,-2" transform="translate(0,14)"
          fill="rgba(255,150,120,0.3)" />
      )}

      {/* Cheeks when happy */}
      {(expression === 'win' || expression === 'shuffling') && (
        <>
          <ellipse cx="-19" cy="6" rx="6" ry="4" fill="rgba(255,120,100,0.25)" />
          <ellipse cx="19" cy="6" rx="6" ry="4" fill="rgba(255,120,100,0.25)" />
        </>
      )}

      {/* Ear studs */}
      <circle cx="-26" cy="2" r="2.5" fill="#c9a227" />
      <circle cx="26" cy="2" r="2.5" fill="#c9a227" />
    </svg>
  )
}

// Flying card animation
function FlyingCard({ from, to, onDone }) {
  const [pos, setPos] = useState({ x: from.x, y: from.y, rot: -20, opacity: 0, scale: 0.5 })

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPos({ x: to.x, y: to.y, rot: 0, opacity: 1, scale: 1 })
    }, 50)
    const t2 = setTimeout(onDone, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{
      position: 'fixed', zIndex: 9999, pointerEvents: 'none',
      left: `${pos.x}px`, top: `${pos.y}px`,
      transform: `rotate(${pos.rot}deg) scale(${pos.scale})`,
      opacity: pos.opacity,
      transition: 'all 0.45s cubic-bezier(0.2,0.8,0.3,1)',
      width: '40px', height: '56px',
      background: 'linear-gradient(135deg,#1a1a4e,#2a2a7e)',
      borderRadius: '5px', border: '1.5px solid rgba(255,255,255,0.2)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{ position: 'absolute', inset: '3px', borderRadius: '3px', background: 'repeating-linear-gradient(45deg,rgba(201,162,39,0.15) 0px,transparent 2px,transparent 4px,rgba(201,162,39,0.1) 6px)', border: '1px solid rgba(201,162,39,0.2)' }} />
    </div>
  )
}

export default function AIDealer({ phase = 'idle', compact = false, dealerRef }) {
  const [expression, setExpression] = useState('idle')
  const [talking, setTalking] = useState(false)
  const [message, setMessage] = useState('')
  const [cardAnim, setCardAnim] = useState(false)
  const nameRef = useRef(DEALER_NAME)

  const MESSAGES = {
    idle:      ['Place your bet to begin!', 'Good luck today! 🍀', 'Ready when you are...', 'Take your time 😊'],
    shuffling: ['Shuffling the deck...', 'Watch carefully! 👀', 'Fresh shuffle incoming!', 'Mixing it up!'],
    dealing:   ['Here come the cards!', 'Dealing now...', 'Let\'s see what we get!', 'Cards coming your way!'],
    waiting:   ['Your move!', 'What will you do?', 'Think carefully...', 'The choice is yours!'],
    win:       ['Congratulations! 🎉', 'Well played! 🏆', 'You\'re on fire! 🔥', 'Excellent hand!', 'Amazing! 🎊'],
    lose:      ['Better luck next time!', 'So close! Try again?', 'The cards weren\'t kind...', 'Don\'t give up! 💪'],
    tie:       ['It\'s a tie! Bet returned.', 'Equal match! 🤝', 'A draw! Interesting...'],
  }

  useEffect(() => {
    setExpression(phase)
    const msgs = MESSAGES[phase] || MESSAGES.idle
    const msg = msgs[Math.floor(Math.random() * msgs.length)]
    setMessage(msg)
    setTalking(true)
    setCardAnim(phase === 'shuffling' || phase === 'dealing')
    const t = setTimeout(() => setTalking(false), 2500)
    return () => clearTimeout(t)
  }, [phase])

  // Expose dealer element ref for flying card animation
  const dealerEl = useRef(null)
  useEffect(() => {
    if (dealerRef) dealerRef.current = dealerEl.current
  }, [])

  const size = compact ? 64 : 80

  return (
    <div ref={dealerEl} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
      {/* Speech bubble */}
      <div style={{
        position: 'relative', minWidth: '120px', maxWidth: '200px',
        padding: '8px 12px', background: 'rgba(255,255,255,0.92)',
        borderRadius: '14px', border: '1px solid rgba(201,162,39,0.3)',
        textAlign: 'center', fontSize: '12px', fontWeight: '600',
        color: '#1a1a2e', lineHeight: 1.3,
        opacity: talking ? 1 : 0,
        transform: talking ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.96)',
        transition: 'all 0.3s cubic-bezier(0.2,0.8,0.3,1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}>
        {message}
        {/* Bubble tail */}
        <div style={{
          position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
          borderTop: '7px solid rgba(255,255,255,0.92)',
        }} />
      </div>

      {/* Dealer body */}
      <div style={{ position: 'relative' }}>
        {/* Glow ring when active */}
        {(phase === 'dealing' || phase === 'shuffling') && (
          <div style={{
            position: 'absolute', inset: '-8px', borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(201,162,39,0.2),transparent 70%)',
            animation: 'dealerGlow 1s ease infinite',
          }} />
        )}

        {/* Face */}
        <DealerFace expression={expression} size={size} />

        {/* Win star burst */}
        {phase === 'win' && (
          <div style={{ position: 'absolute', top: '-12px', right: '-12px', fontSize: '20px', animation: 'starPop 0.5s ease' }}>
            ⭐
          </div>
        )}
      </div>

      {/* Cards in dealer's hand */}
      <ShuffleCards active={cardAnim} />

      {/* Dealer name tag */}
      <div style={{
        padding: '3px 12px', borderRadius: '20px',
        background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)',
        fontSize: '11px', fontWeight: '700', color: '#c9a227',
        letterSpacing: '0.5px',
      }}>
        🎰 {nameRef.current}
      </div>

      <style>{`
        @keyframes dealerGlow {
          0%,100% { opacity:0.6; transform:scale(1); }
          50% { opacity:1; transform:scale(1.05); }
        }
        @keyframes starPop {
          0% { transform:scale(0) rotate(-30deg); opacity:0; }
          60% { transform:scale(1.3) rotate(10deg); opacity:1; }
          100% { transform:scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes bubbleIn {
          0% { opacity:0; transform:scale(0.8) translateY(8px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
