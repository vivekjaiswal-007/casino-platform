import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// ── Featured 6 games on home (3 per row, 16:9) ──────────────────────────────
const FEATURED = [
  { name: 'Aviator',          path: '/games/aviator',          icon: '✈️', color: '#ff4444' },
  { name: 'Crash Rocket',     path: '/games/crash-rocket',     icon: '🚀', color: '#9944ff' },
  { name: 'Color Prediction', path: '/games/color-prediction', icon: '🎨', color: '#ff4488' },
  { name: 'Chicken Road',     path: '/games/chicken-road',     icon: '🐔', color: '#ff9900' },
  { name: 'Mines',            path: '/games/mines',            icon: '💎', color: '#00d084' },
  { name: 'Dragon Tiger',     path: '/games/dragon-tiger',     icon: '🐉', color: '#ff4444' },
]

// ── All platform games ───────────────────────────────────────────────────────
const ALL_GAMES = [
  { name: 'Aviator',          path: '/games/aviator',          icon: '✈️', color: '#ff4444', cat: 'Crash' },
  { name: 'Crash Rocket',     path: '/games/crash-rocket',     icon: '🚀', color: '#9944ff', cat: 'Crash' },
  { name: 'Color Prediction', path: '/games/color-prediction', icon: '🎨', color: '#ff4488', cat: 'Prediction' },
  { name: 'Chicken Road',     path: '/games/chicken-road',     icon: '🐔', color: '#ff9900', cat: 'Crash' },
  { name: 'Mines',            path: '/games/mines',            icon: '💎', color: '#00d084', cat: 'Arcade' },
  { name: 'Dragon Tiger',     path: '/games/dragon-tiger',     icon: '🐉', color: '#ff4444', cat: 'Casino' },
  { name: 'Teen Patti',       path: '/games/teen-patti',       icon: '♠️', color: '#c9a227', cat: 'Indian' },
  { name: 'Roulette',         path: '/games/roulette',         icon: '🎡', color: '#00d084', cat: 'Casino' },
  { name: 'Blackjack',        path: '/games/blackjack',        icon: '🃏', color: '#4488ff', cat: 'Cards' },
  { name: 'Andar Bahar',      path: '/games/andar-bahar',      icon: '🎯', color: '#ff9900', cat: 'Indian' },
  { name: 'Plinko',           path: '/games/plinko',           icon: '⚡', color: '#ff4488', cat: 'Arcade' },
  { name: 'Hi-Lo',            path: '/games/hi-lo',            icon: '📈', color: '#00d084', cat: 'Cards' },
  { name: 'Lucky Wheel',      path: '/games/lucky-wheel',      icon: '🎡', color: '#c9a227', cat: 'Arcade' },
  { name: 'Sic Bo',           path: '/games/sic-bo',           icon: '🎲', color: '#ff9900', cat: 'Dice' },
  { name: 'Dice',             path: '/games/dice',             icon: '⚀', color: '#4488ff', cat: 'Dice' },
  { name: 'Poker',            path: '/games/poker',            icon: '♣️', color: '#9944ff', cat: 'Cards' },
  { name: 'Baccarat',         path: '/games/baccarat',         icon: '🎴', color: '#4488ff', cat: 'Casino' },
  { name: 'Tower',            path: '/games/tower',            icon: '🗼', color: '#9944ff', cat: 'Arcade' },
  { name: 'Spin & Win',       path: '/games/spin-win',         icon: '🎪', color: '#00d084', cat: 'Slots' },
  { name: 'Slot Machine',     path: '/games/slots',            icon: '🎰', color: '#ff9900', cat: 'Slots' },
]

// ── Sections with row tags ───────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'new-launch',
    tag: '🆕 New Launch',
    tagColor: '#4488ff',
    games: [
      { name: 'Chicken Road',     path: '/games/chicken-road',     icon: '🐔', color: '#ff9900' },
      { name: 'Crash Rocket',     path: '/games/crash-rocket',     icon: '🚀', color: '#9944ff' },
      { name: 'Color Prediction', path: '/games/color-prediction', icon: '🎨', color: '#ff4488' },
      { name: 'Plinko',           path: '/games/plinko',           icon: '⚡', color: '#ff4488' },
      { name: 'Tower',            path: '/games/tower',            icon: '🗼', color: '#9944ff' },
      { name: 'Dice',             path: '/games/dice',             icon: '⚀', color: '#4488ff' },
    ],
  },
  {
    id: 'trending',
    tag: '🔥 Trending Games',
    tagColor: '#ff4444',
    games: [
      { name: 'Aviator',    path: '/games/aviator',          icon: '✈️', color: '#ff4444' },
      { name: 'Teen Patti', path: '/games/teen-patti',       icon: '♠️', color: '#c9a227' },
      { name: 'Mines',      path: '/games/mines',            icon: '💎', color: '#00d084' },
      { name: 'Roulette',   path: '/games/roulette',         icon: '🎡', color: '#00d084' },
      { name: 'Andar Bahar',path: '/games/andar-bahar',      icon: '🎯', color: '#ff9900' },
      { name: 'Lucky Wheel',path: '/games/lucky-wheel',      icon: '🎡', color: '#c9a227' },
    ],
  },
  {
    id: 'recommended',
    tag: '⭐ Recommended Games',
    tagColor: '#c9a227',
    games: [
      { name: 'Dragon Tiger', path: '/games/dragon-tiger',   icon: '🐉', color: '#ff4444' },
      { name: 'Blackjack',    path: '/games/blackjack',      icon: '🃏', color: '#4488ff' },
      { name: 'Poker',        path: '/games/poker',          icon: '♣️', color: '#9944ff' },
      { name: 'Baccarat',     path: '/games/baccarat',       icon: '🎴', color: '#4488ff' },
      { name: 'Hi-Lo',        path: '/games/hi-lo',          icon: '📈', color: '#00d084' },
      { name: 'Sic Bo',       path: '/games/sic-bo',         icon: '🎲', color: '#ff9900' },
    ],
  },
  {
    id: 'live-casino',
    tag: '🔴 Live Casino Games',
    tagColor: '#e8304a',
    link: '/live-casino',
    games: [
      { name: '1 Day Dragon Tiger', path: '/live-casino', icon: '🐉', color: '#ff4444' },
      { name: 'Teen Patti Live',    path: '/live-casino', icon: '♠️', color: '#c9a227' },
      { name: 'Bollywood Casino',   path: '/live-casino', icon: '🎬', color: '#ff9900' },
      { name: 'Andar Bahar Live',   path: '/live-casino', icon: '🎯', color: '#00d084' },
      { name: 'Roulette Live',      path: '/live-casino', icon: '🎡', color: '#9944ff' },
      { name: 'Dragon Tiger Live',  path: '/live-casino', icon: '🐲', color: '#ff4488' },
    ],
  },
  {
    id: 'slots',
    tag: '🎰 Slots',
    tagColor: '#ff9900',
    games: [
      { name: 'Slot Machine', path: '/games/slots',     icon: '🎰', color: '#ff9900' },
      { name: 'Spin & Win',   path: '/games/spin-win',  icon: '🎪', color: '#00d084' },
      { name: 'Lucky Wheel',  path: '/games/lucky-wheel',icon: '🎡', color: '#c9a227' },
      { name: 'Plinko',       path: '/games/plinko',    icon: '⚡', color: '#ff4488' },
      { name: 'Mines',        path: '/games/mines',     icon: '💎', color: '#00d084' },
      { name: 'Tower',        path: '/games/tower',     icon: '🗼', color: '#9944ff' },
    ],
  },
]

// ── Featured Card (16:9, 3 per row) ─────────────────────────────────────────
function FeaturedCard({ game }) {
  return (
    <Link to={game.path} style={{ textDecoration: 'none' }}>
      <div style={{
        aspectRatio: '16/9',
        background: `linear-gradient(135deg, ${game.color}22, #12121a)`,
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${game.color}30` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <div style={{ fontSize: 'clamp(28px,6vw,40px)', marginBottom: '8px' }}>{game.icon}</div>
        <div style={{ fontSize: 'clamp(11px,2.5vw,14px)', fontWeight: '700', color: '#ddd' }}>{game.name}</div>
      </div>
    </Link>
  )
}

// ── Small Game Card (for section rows) ──────────────────────────────────────
function MiniCard({ game }) {
  return (
    <Link to={game.path} style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div style={{
        width: '110px',
        background: '#1a1a28',
        borderRadius: '10px',
        padding: '12px 8px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <div style={{ fontSize: '28px', marginBottom: '6px' }}>{game.icon}</div>
        <div style={{ fontSize: '10px', fontWeight: '600', color: '#aaa', lineHeight: 1.3 }}>{game.name}</div>
      </div>
    </Link>
  )
}

// ── Section Row ──────────────────────────────────────────────────────────────
function SectionRow({ section, onTagClick }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={() => onTagClick(section.id)}
          style={{
            background: section.tagColor + '18',
            border: `1px solid ${section.tagColor}44`,
            borderRadius: '20px',
            padding: '4px 14px',
            color: section.tagColor,
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
          }}>
          {section.tag}
        </button>
        <Link to={section.link || '/lobby'} style={{ color: '#555', fontSize: '11px', textDecoration: 'none' }}>See all →</Link>
      </div>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {section.games.map((g, i) => <MiniCard key={i} game={g} />)}
      </div>
    </div>
  )
}


// ── Live Games on Home ───────────────────────────────────────────────────────
function LiveGamesHome() {
  const [games, setGames] = React.useState([])

  React.useEffect(function() {
    fetch('/api/live-casino/games')
      .then(function(r) { return r.json() })
      .then(function(d) { setGames(d.games || []) })
      .catch(function() {})
  }, [])

  if (games.length === 0) return null

  // Split by provider
  const mac88 = games.filter(function(g) { return g.category !== 'evolution' })
  const evo = games.filter(function(g) { return g.category === 'evolution' })

  function GameRow({ title, list }) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#aaa', marginBottom: '8px' }}>{title}</div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {list.map(function(g, i) {
            return (
              <Link key={i} to="/live-casino" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: '110px', background: '#1a1a28', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' }}>
                  {g.img ? (
                    <img src={g.img} alt={g.name} style={{ width: '100%', height: '65px', objectFit: 'cover', display: 'block' }}
                      onError={function(e) { e.target.style.display='none' }}
                    />
                  ) : (
                    <div style={{ height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', background: '#222' }}>🎰</div>
                  )}
                  <div style={{ padding: '5px 6px', fontSize: '9px', color: '#aaa', fontWeight: '600', lineHeight: 1.3 }}>{g.name}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Split mac88 into rows of 20
  const mac88Titles = ['🔥 Hot Games','⭐ Featured','🎯 Popular','🆕 New Arrivals','🏆 Top Picks','🎰 Casino Classics','💥 Crash & Win','🎲 Table Games']
  const mac88Rows = []
  for (var i = 0; i < mac88.length; i += 20) {
    mac88Rows.push({ title: mac88Titles[mac88Rows.length] || '🎮 Games', list: mac88.slice(i, i + 20) })
  }

  const evoTitles = ['👑 Evolution Premium','⚡ Lightning Series','🃏 Live Blackjack','🎡 Live Roulette','🎴 Live Baccarat']
  const evoRows = []
  for (var j = 0; j < evo.length; j += 20) {
    evoRows.push({ title: evoTitles[evoRows.length] || '👑 Evolution', list: evo.slice(j, j + 20) })
  }

  return (
    <section style={{ marginBottom: '24px' }}>
      <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🔴 <span className="gold-text">Live Casino</span>
      </h2>
      {mac88Rows.map(function(row, i) { return <GameRow key={'m'+i} title={row.title} list={row.list} /> })}
      {evoRows.map(function(row, i) { return <GameRow key={'e'+i} title={row.title} list={row.list} /> })}
    </section>
  )
}

// ── Main Home ────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(null)

  function handleTagClick(sectionId) {
    const section = SECTIONS.find(s => s.id === sectionId)
    if (section) {
      setActiveSection(section)
    }
  }

  // Section detail view
  if (activeSection) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => setActiveSection(null)}
            style={{ background: '#1a1a28', border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#aaa', cursor: 'pointer', fontSize: '13px' }}>
            ← Back
          </button>
          <span style={{ color: activeSection.tagColor, fontWeight: '700', fontSize: '16px' }}>{activeSection.tag}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '10px' }}>
          {activeSection.games.map((g, i) => (
            <Link key={i} to={g.path} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#1a1a28',
                borderRadius: '12px',
                padding: '16px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{g.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#ddd' }}>{g.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero - not logged in */}
      {!user && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(201,162,39,0.08),rgba(153,68,255,0.08))',
          borderRadius: '14px',
          padding: 'clamp(24px,5vw,40px)',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,6vw,48px)', marginBottom: '10px' }}>
            <span className="gold-text">Royal Bet</span> Casino
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
            20+ Premium Games • Instant Payouts • Fair Play
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/signup"><button className="btn-gold" style={{ padding: '12px 28px' }}>Get 1000 Free Coins 🎁</button></Link>
            <Link to="/lobby"><button className="btn-outline" style={{ padding: '12px 28px' }}>Browse Games</button></Link>
          </div>
        </div>
      )}

      {/* Welcome back */}
      {user && (
        <div style={{
          background: 'rgba(201,162,39,0.06)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: '#666', fontSize: '12px' }}>Welcome back,</p>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{user.username} 👑</h2>
          </div>
          <Link to="/lobby"><button className="btn-gold">Play Now</button></Link>
        </div>
      )}

      {/* Featured 6 games - 3 per row 16:9 */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {FEATURED.map((g, i) => <FeaturedCard key={i} game={g} />)}
        </div>
      </section>

      {/* Section rows with tags */}
      {SECTIONS.map(section => (
        <SectionRow key={section.id} section={section} onTagClick={handleTagClick} />
      ))}


      {/* Live Casino Games on Home */}
      <LiveGamesHome />

      {/* Live Casino Banner */}
      <section style={{ marginBottom: '24px' }}>
        <Link to="/live-casino" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(105deg,#0c0714,#1a103c)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8304a', animation: 'pulse 1.4s infinite' }}/>
                <span style={{ fontSize: '10px', color: '#e8304a', fontWeight: '700', letterSpacing: '2px' }}>LIVE NOW</span>
              </div>
              <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '18px', color: '#c9a227', marginBottom: '4px' }}>🎰 Live Casino</h3>
              <p style={{ color: '#666', fontSize: '12px' }}>Mac88 + Evolution • 248 Games</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#8a6a1a,#c9a227)', borderRadius: '8px', padding: '10px 18px', color: '#0a0800', fontWeight: '800', fontSize: '13px' }}>
              Play Live →
            </div>
          </div>
        </Link>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
