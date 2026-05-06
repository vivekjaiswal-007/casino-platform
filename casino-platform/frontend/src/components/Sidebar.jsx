import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const MENU = [
  {
    cat: 'CRASH', icon: '🚀',
    items: [
      { name: 'Aviator',       path: '/games/aviator',        icon: '✈️', badge: 'HOT' },
      { name: 'Crash Rocket',  path: '/games/crash-rocket',   icon: '🚀', badge: 'HOT' },
      { name: 'Crash Ball',    path: '/games/crash-ball',     icon: '⚽', badge: 'NEW' },
      { name: 'Limbo',         path: '/games/limbo',          icon: '🎯', badge: 'NEW' },
    ]
  },
  {
    cat: 'CASINO', icon: '🎰',
    items: [
      { name: 'Roulette',      path: '/games/roulette',       icon: '🎡' },
      { name: 'Blackjack',     path: '/games/blackjack',      icon: '🃏' },
      { name: 'Baccarat',      path: '/games/baccarat',       icon: '🎴' },
      { name: 'Dragon Tiger',  path: '/games/dragon-tiger',   icon: '🐉' },
      { name: 'Slot Machine',  path: '/games/slots',          icon: '🎰', badge: 'HOT' },
      { name: 'Video Poker',   path: '/games/video-poker',    icon: '🃏' },
    ]
  },
  {
    cat: 'INDIAN', icon: '🇮🇳',
    items: [
      { name: 'Teen Patti',    path: '/games/teen-patti',     icon: '♠️', badge: 'HOT' },
      { name: 'Andar Bahar',   path: '/games/andar-bahar',    icon: '🎯', badge: 'HOT' },
      { name: 'Color Pred.',   path: '/games/color-prediction',icon: '🎨' },
    ]
  },
  {
    cat: 'CARDS', icon: '🃏',
    items: [
      { name: 'Poker',         path: '/games/poker',          icon: '♣️' },
      { name: 'Hi-Lo',         path: '/games/hi-lo',          icon: '📈' },
      { name: 'Hilo Card',     path: '/games/hilo-card',      icon: '🃏' },
      { name: 'War',           path: '/games/war',            icon: '⚔️' },
      { name: 'BJ Switch',     path: '/games/blackjack-switch',icon:'🔄' },
      { name: '3 Card Poker',  path: '/games/three-card-poker',icon:'🃏' },
      { name: 'Mini Bacc.',    path: '/games/mini-baccarat',  icon: '🎴' },
    ]
  },
  {
    cat: 'WHEEL', icon: '🎡',
    items: [
      { name: 'Lucky Wheel',   path: '/games/lucky-wheel',    icon: '🎡' },
      { name: 'Spin & Win',    path: '/games/spin-win',       icon: '🎪' },
      { name: 'Wheel Fortune', path: '/games/wheel-fortune',  icon: '🎡' },
    ]
  },
  {
    cat: 'DICE', icon: '🎲',
    items: [
      { name: 'Dice',          path: '/games/dice',           icon: '🎲' },
      { name: 'Sic Bo',        path: '/games/sic-bo',         icon: '🎲' },
      { name: 'Dice Battle',   path: '/games/dice-battle',    icon: '⚔️' },
    ]
  },
  {
    cat: 'GRID', icon: '💎',
    items: [
      { name: 'Mines',         path: '/games/mines',          icon: '💎', badge: 'HOT' },
      { name: 'Plinko',        path: '/games/plinko',         icon: '⚡' },
      { name: 'Keno',          path: '/games/keno',           icon: '🎱' },
      { name: 'Ball Drop',     path: '/games/ball-drop',      icon: '⚽' },
    ]
  },
  {
    cat: 'INSTANT', icon: '⚡',
    items: [
      { name: 'Coin Flip',     path: '/games/coin-flip',      icon: '🪙' },
      { name: 'Number Guess',  path: '/games/number-guess',   icon: '🔢' },
      { name: 'Rock Paper..', path: '/games/rps',             icon: '✊' },
      { name: 'Hot & Cold',    path: '/games/hot-cold',       icon: '🔥' },
      { name: 'Lucky 7s',      path: '/games/lucky-7s',       icon: '7️⃣' },
      { name: 'Scratch Card',  path: '/games/scratch-card',   icon: '🎴' },
    ]
  },
  {
    cat: 'ADVENTURE', icon: '🐔',
    items: [
      { name: 'Chicken Road',  path: '/games/chicken-road',   icon: '🐔', badge: 'HOT' },
      { name: 'Tower',         path: '/games/tower',          icon: '🗼' },
      { name: 'Penalty',       path: '/games/penalty',        icon: '⚽' },
    ]
  },
]

export default function Sidebar({ className, sidebarOpen }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState({})

  const toggleCat = (cat) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  const showLabels = sidebarOpen

  return (
    <aside className={className} style={{ overflowY: 'auto', overflowX: 'hidden' }}>


      {/* Live Casino — SoftAPI */}
      <Link to="/live-casino" style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '10px',
          padding: showLabels ? '11px 16px' : '11px',
          justifyContent: showLabels ? 'flex-start' : 'center',
          margin: '0 6px 4px',
          borderRadius: '9px',
          background: location.pathname.startsWith('/live-casino') ? 'rgba(192,38,58,0.14)' : 'transparent',
          border: location.pathname.startsWith('/live-casino') ? '1px solid rgba(192,38,58,0.35)' : '1px solid transparent',
          color: location.pathname.startsWith('/live-casino') ? '#e8304a' : 'var(--text-secondary)',
          transition: 'all 0.2s',
          textDecoration: 'none',
        }}>
          <span style={{ fontSize: '17px', minWidth: '20px', textAlign: 'center', flexShrink: 0 }}>📺</span>
          {showLabels && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Live Casino</span>
              <span style={{
                fontSize: '9px', fontWeight: 800, padding: '2px 6px',
                borderRadius: '4px', background: 'rgba(192,38,58,0.25)',
                color: '#e8304a', border: '1px solid rgba(192,38,58,0.3)',
                letterSpacing: '0.5px', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8304a', display: 'inline-block', animation: 'liveDot 1.4s infinite' }}/>
                LIVE
              </span>
            </div>
          )}
        </div>
      </Link>
      <style>{`@keyframes liveDot{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Categories */}
      {MENU.map(({ cat, icon, items }) => {
        const isOpen = collapsed[cat] !== true // default open
        const hasActive = items.some(i => location.pathname === i.path)

        return (
          <div key={cat}>
            {showLabels ? (
              <button
                onClick={() => toggleCat(cat)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 16px 3px',
                  color: hasActive ? 'var(--gold)' : 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px' }}>{icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase' }}>{cat}</span>
                </div>
                <span style={{ fontSize: '9px', color: '#555', transition: 'transform 0.2s', transform: isOpen ? 'rotate(0)' : 'rotate(-90deg)' }}>▼</span>
              </button>
            ) : (
              <div style={{ padding: '5px 0', display: 'flex', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{icon}</span>
              </div>
            )}

            {(isOpen || !showLabels) && items.map(({ name, path, icon: ico, badge }) => {
              const active = location.pathname === path
              return (
                <Link key={path} to={path} style={{ display: 'block', textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: '8px',
                      padding: showLabels ? '7px 16px' : '8px',
                      justifyContent: showLabels ? 'flex-start' : 'center',
                      margin: '1px 5px',
                      borderRadius: '7px',
                      background: active ? 'rgba(201,162,39,0.11)' : 'transparent',
                      borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                      color: active ? 'var(--gold)' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: active ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: '14px', minWidth: '18px', textAlign: 'center', flexShrink: 0 }}>{ico}</span>
                    {showLabels && (
                      <>
                        <span style={{ whiteSpace: 'nowrap', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px' }}>{name}</span>
                        {badge && (
                          <span style={{
                            fontSize: '8px', fontWeight: '800', padding: '1px 4px', borderRadius: '3px',
                            background: badge === 'HOT' ? 'rgba(255,80,80,0.18)' : 'rgba(68,136,255,0.18)',
                            color: badge === 'HOT' ? '#ff5050' : '#4488ff',
                            border: `1px solid ${badge === 'HOT' ? 'rgba(255,80,80,0.3)' : 'rgba(68,136,255,0.3)'}`,
                            letterSpacing: '0.3px', flexShrink: 0
                          }}>{badge}</span>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              )
            })}

            {showLabels && <div style={{ height: '3px' }} />}
          </div>
        )
      })}

      <div style={{ height: '20px' }} />
    </aside>
  )
}
//v76fix
