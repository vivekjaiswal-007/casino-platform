import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'

const allGames = [
  { name: 'Aviator', path: '/games/aviator', icon: '✈️', category: 'Crash', color: '#ff4444', players: 1247, badge: 'HOT' },
  { name: 'Crash Rocket', path: '/games/crash-rocket', icon: '🚀', category: 'Crash', color: '#9944ff', players: 892, badge: 'NEW' },
  { name: 'Teen Patti', path: '/games/teen-patti', icon: '♠️', category: 'Indian', color: '#c9a227', players: 2341, badge: 'HOT' },
  { name: 'Roulette', path: '/games/roulette', icon: '🎡', category: 'Casino', color: '#00d084', players: 678 },
  { name: 'Blackjack', path: '/games/blackjack', icon: '🃏', category: 'Cards', color: '#4488ff', players: 543 },
  { name: 'Slot Machine', path: '/games/slots', icon: '🎰', category: 'Slots', color: '#ff9900', players: 1890, badge: 'HOT' },
  { name: 'Mines', path: '/games/mines', icon: '💎', category: 'Arcade', color: '#00d084', players: 445 },
  { name: 'Plinko', path: '/games/plinko', icon: '⚡', category: 'Arcade', color: '#ff4488', players: 334 },
  { name: 'Andar Bahar', path: '/games/andar-bahar', icon: '🎯', category: 'Indian', color: '#ff9900', players: 789 },
  { name: 'Dragon Tiger', path: '/games/dragon-tiger', icon: '🐉', category: 'Casino', color: '#ff4444', players: 567 },
  { name: 'Poker', path: '/games/poker', icon: '♣️', category: 'Cards', color: '#9944ff', players: 234 },
  { name: 'Baccarat', path: '/games/baccarat', icon: '🎴', category: 'Casino', color: '#4488ff', players: 378 },
  { name: 'Hi-Lo', path: '/games/hi-lo', icon: '📈', category: 'Cards', color: '#00d084', players: 291 },
  { name: 'Lucky Wheel', path: '/games/lucky-wheel', icon: '🎡', category: 'Arcade', color: '#c9a227', players: 623 },
  { name: 'Color Pred.', path: '/games/color-prediction', icon: '🎨', category: 'Prediction', color: '#ff4488', players: 1102 },
  { name: 'Sic Bo', path: '/games/sic-bo', icon: '🎲', category: 'Dice', color: '#ff9900', players: 198 },
  { name: 'Dice', path: '/games/dice', icon: '⚀', category: 'Dice', color: '#4488ff', players: 512 },
  { name: 'Chicken Road', path: '/games/chicken-road', icon: '🐔', category: 'Arcade', color: '#ff4444', players: 287, badge: 'NEW' },
  { name: 'Tower', path: '/games/tower', icon: '🗼', category: 'Arcade', color: '#9944ff', players: 341 },
  { name: 'Spin & Win', path: '/games/spin-win', icon: '🎪', category: 'Slots', color: '#00d084', players: 456 },
]

function GameCard({ game }) {
  return (
    <Link to={game.path}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = game.color + '60'
        e.currentTarget.style.boxShadow = `0 8px 30px ${game.color}20`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = ''
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '80px', height: '80px',
          background: `radial-gradient(circle, ${game.color}20 0%, transparent 70%)`,
          borderRadius: '0 12px 0 0'
        }} />

        {/* Badge */}
        {game.badge && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
            background: game.badge === 'HOT' ? 'rgba(255,68,68,0.2)' : 'rgba(68,136,255,0.2)',
            color: game.badge === 'HOT' ? '#ff5050' : '#4488ff',
            border: `1px solid ${game.badge === 'HOT' ? 'rgba(255,68,68,0.4)' : 'rgba(68,136,255,0.4)'}`,
            letterSpacing: '0.5px'
          }}>{game.badge}</div>
        )}

        <div style={{ fontSize: '36px', marginBottom: '12px' }}>{game.icon}</div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{game.name}</h3>
        <p style={{ fontSize: '12px', color: game.color, fontWeight: '600', marginBottom: '8px' }}>{game.category}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d084', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{game.players.toLocaleString()} playing</span>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const { user } = useStore()
  const trending = allGames.filter(g => g.badge).slice(0, 6)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero */}
      {!user && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,162,39,0.1) 0%, rgba(153,68,255,0.1) 100%)',
          border: '1px solid rgba(201,162,39,0.2)',
          borderRadius: '16px',
          padding: '48px',
          marginBottom: '32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(201,162,39,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(153,68,255,0.05) 0%, transparent 60%)'
          }} />
          <h1 style={{
            fontFamily: 'Cinzel, serif', fontSize: '48px', fontWeight: '900',
            marginBottom: '16px', lineHeight: 1.1
          }}><span className="gold-text">Royal Bet</span><br/>Casino</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '32px' }}>
            20+ Premium Casino Games • Instant Payouts • Fair Play
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/signup"><button className="btn-gold" style={{ padding: '14px 40px', fontSize: '16px' }}>
              Get 1000 Free Coins 🎁
            </button></Link>
            <Link to="/lobby"><button className="btn-outline" style={{ padding: '14px 40px', fontSize: '16px' }}>
              Browse Games
            </button></Link>
          </div>
        </div>
      )}

      {/* Welcome back */}
      {user && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(22,22,31,0) 100%)',
          border: '1px solid rgba(201,162,39,0.2)',
          borderRadius: '12px',
          padding: '20px 28px',
          marginBottom: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Good to have you back,</p>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{user.username} 👑</h2>
          </div>
          <Link to="/lobby">
            <button className="btn-gold">Play Now</button>
          </Link>
        </div>
      )}

      {/* Trending */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🔥 <span className="gold-text">Trending Now</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {trending.map(game => <GameCard key={game.path} game={game} />)}
        </div>
      </section>

      {/* Live Casino Promo Banner */}
      <section style={{ marginBottom: '36px' }}>
        <Link to="/live-casino" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            background: 'linear-gradient(105deg,#0c0714,#1a103c,#200c1e)',
            border: '1px solid rgba(201,162,39,0.25)',
            borderRadius: '16px',
            padding: 'clamp(18px,4vw,28px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px', flexWrap: 'wrap',
            position: 'relative', overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.25)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {/* bg glow */}
            <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.07),transparent)', pointerEvents: 'none' }}/>
            <div style={{ position: 'absolute', left: -20, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,38,58,0.07),transparent)', pointerEvents: 'none' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8304a', boxShadow: '0 0 8px #e8304a', animation: 'pulse 1.4s infinite' }}/>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#e8304a', letterSpacing: '2px', textTransform: 'uppercase' }}>LIVE NOW</span>
              </div>
              <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(16px,4vw,22px)', color: '#fff', marginBottom: '6px' }}>
                🎰 <span style={{ color: '#c9a227' }}>Mac88</span> Live Casino
              </h3>
              <p style={{ color: '#888', fontSize: '13px', maxWidth: '380px' }}>
                Real money games — Slots, Teen Patti, Andar Bahar, Dragon Tiger, Fishing &amp; more. Powered by SoftAPI.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 'clamp(2rem,8vw,4rem)' }}>🎰</span>
              <div style={{
                background: 'linear-gradient(135deg,#8a6a1a,#c9a227)',
                borderRadius: '10px', padding: '10px 20px',
                color: '#0a0800', fontWeight: 800, fontSize: '13px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(201,162,39,0.35)',
              }}>
                Play Live →
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* All Games */}
      <section>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🎮 <span className="gold-text">All Games</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {allGames.map(game => <GameCard key={game.path} game={game} />)}
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </div>
  )
}
