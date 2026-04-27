import React from 'react'

export default function LiveRoundBar({ phase, countdown, roundId }) {
  const cfg = {
    betting: { bg: 'rgba(0,208,132,0.1)', border: 'rgba(0,208,132,0.3)', color: '#00d084', label: '🟢 PLACE BETS', max: 10 },
    dealing: { bg: 'rgba(201,162,39,0.1)', border: 'rgba(201,162,39,0.3)', color: '#c9a227', label: '🎴 DEALING...', max: 3 },
    result:  { bg: 'rgba(68,136,255,0.1)', border: 'rgba(68,136,255,0.3)', color: '#4488ff', label: '📊 RESULT', max: 5 },
  }
  const c = cfg[phase] || cfg.betting
  const pct = Math.max(0, Math.min(100, (countdown / c.max) * 100))

  return (
    <div style={{ marginBottom: '12px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 6px #ff4444', animation: 'livePulse 1s ease infinite' }} />
        <span style={{ color: '#ff6666', fontSize: '10px', fontWeight: '800', letterSpacing: '1px' }}>LIVE</span>
      </div>
      <span style={{ color: c.color, fontWeight: '800', fontSize: '13px', flex: 1 }}>{c.label}</span>
      <span style={{ color: '#555', fontSize: '11px', flexShrink: 0 }}>Round #{roundId}</span>
      <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
        <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={c.color} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.95s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, fontWeight: '900', fontSize: '13px' }}>
          {countdown}
        </div>
      </div>
      <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}`}</style>
    </div>
  )
}
