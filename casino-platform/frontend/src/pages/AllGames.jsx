import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../store/useStore'

const PLATFORM_GAMES = [
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
  { name: 'Slot Machine',     path: '/games/slots',            icon: '🎰', color: '#ff9900', cat: 'Slots' },
  { name: 'Spin & Win',       path: '/games/spin-win',         icon: '🎪', color: '#00d084', cat: 'Slots' },
  { name: 'Tower',            path: '/games/tower',            icon: '🗼', color: '#9944ff', cat: 'Arcade' },
]

const CATS = ['All', 'Crash', 'Casino', 'Indian', 'Cards', 'Arcade', 'Slots', 'Dice', 'Prediction', 'Live']

export default function AllGames() {
  const [liveGames, setLiveGames] = useState([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    api.get('/live-casino/games')
      .then(function(r) {
        setLiveGames(r.data.games || [])
        setLoading(false)
      })
      .catch(function() { setLoading(false) })
  }, [])

  const liveAsGames = liveGames.map(function(g) {
    return {
      name: g.name,
      path: '/live-casino',
      icon: '🎰',
      color: g.category === 'evolution' ? '#9944ff' : '#00d084',
      cat: 'Live',
      img: g.img || null,
    }
  })

  const all = [...PLATFORM_GAMES, ...liveAsGames]

  const filtered = all.filter(function(g) {
    const matchCat = cat === 'All' || g.cat === cat
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,24px)', marginBottom: '4px' }}>
          🎮 <span className="gold-text">All Games</span>
          <span style={{ fontSize: '13px', color: '#555', fontWeight: '400', marginLeft: '8px' }}>({filtered.length})</span>
        </h1>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={function(e) { setSearch(e.target.value) }}
        placeholder="🔍 Search games..."
        style={{ width: '100%', padding: '10px 14px', background: '#1a1a28', border: '1px solid #2a2a3a', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
      />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', scrollbarWidth: 'none' }}>
        {CATS.map(function(c) {
          const active = cat === c
          return (
            <button key={c} onClick={function() { setCat(c) }}
              style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid ' + (active ? '#c9a227' : '#2a2a3a'), background: active ? 'rgba(201,162,39,0.15)' : '#1a1a28', color: active ? '#c9a227' : '#888', fontSize: '11px', fontWeight: active ? '700' : '400', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {c}
            </button>
          )
        })}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: '8px' }}>
          {filtered.map(function(g, i) {
            return (
              <Link key={i} to={g.path} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#1a1a28', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={function(e) { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={function(e) { e.currentTarget.style.transform = 'none' }}
                >
                  {g.img ? (
                    <img src={g.img} alt={g.name} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                      onError={function(e) { e.target.style.display='none' }}
                    />
                  ) : (
                    <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: g.color + '18' }}>
                      {g.icon}
                    </div>
                  )}
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#ccc', lineHeight: 1.3 }}>{g.name}</div>
                    <div style={{ fontSize: '9px', color: g.color, marginTop: '2px' }}>{g.cat}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
          No games found
        </div>
      )}
    </div>
  )
}
