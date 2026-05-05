import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, api } from '../store/useStore'
import toast from 'react-hot-toast'

// Return page
function ReturnPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navigate('/live-casino'), 3000)
    return () => clearTimeout(t)
  }, [navigate])
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>🎮</div>
      <h2 style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold)' }}>Game Over!</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Returning to Live Casino...</p>
    </div>
  )
}

const PROVIDER_CONFIG = {
  mac88: {
    label: 'Mac88 Live Casino',
    icon: '🎰',
    color: '#00d084',
    gradient: 'linear-gradient(135deg,rgba(0,208,132,0.15),rgba(0,208,132,0.05))',
    border: 'rgba(0,208,132,0.3)',
    categories: ['table','lottery','crash','slots','virtual','casual'],
    catLabels: { table:'Table Games', lottery:'Lottery', crash:'Crash Games', slots:'Slots', virtual:'Virtual', casual:'Casual' },
    catIcons:  { table:'🎲', lottery:'🎯', crash:'✈️', slots:'🎰', virtual:'🖥️', casual:'🎮' },
  },
  evolution: {
    label: 'Evolution Live Casino',
    icon: '👑',
    color: '#9944ff',
    gradient: 'linear-gradient(135deg,rgba(153,68,255,0.15),rgba(153,68,255,0.05))',
    border: 'rgba(153,68,255,0.3)',
    categories: ['evolution'],
    catLabels: { evolution:'All Games' },
    catIcons:  { evolution:'👑' },
  },
}

const GAME_EMOJI = {
  'Dragon Tiger':'🐉','Teen Patti':'♠️','Baccarat':'🎴','Roulette':'🎡',
  'Andar Bahar':'🎯','Blackjack':'🃏','Sic Bo':'🎲','Poker':'♣️',
  'Aviator':'✈️','Crash':'💥','Mines':'💣','Plinko':'🎳',
  'Bollywood Casino':'🎬','Dream Wheel':'🎡','Funky Time':'🎉',
  'Lightning':'⚡','Speed':'🚀','Cricket':'🏏','Color':'🎨',
}

function getEmoji(name) {
  for (const [key, emoji] of Object.entries(GAME_EMOJI)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '🎮'
}

function GameCard({ game, onPlay, launching }) {
  const isEvolution = game.category === 'evolution'
  const color = isEvolution ? '#9944ff' : '#00d084'
  const busy = launching === game.game_uid

  return (
    <div onClick={() => !busy && onPlay(game)}
      style={{ background: 'var(--bg-card)', border: `1px solid ${color}28`, borderRadius: '12px', overflow: 'hidden', cursor: busy ? 'not-allowed' : 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = color + '60' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = color + '28' }}
    >
      <div style={{ height: '3px', background: `linear-gradient(90deg,${color},${color}55)` }} />
      <div style={{ padding: '14px 10px 10px', textAlign: 'center' }}>
        <div style={{ width: '100%', height: '90px', borderRadius: '6px', marginBottom: '6px', overflow: 'hidden', position: 'relative' }}>
          {game.category === 'evolution' && game.img ? (
            <img src={game.img} alt={game.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;background:linear-gradient(135deg,#9944ff22,#9944ff44)">' + getEmoji(game.name) + '</div>' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', background: 'linear-gradient(135deg,#00208844,#00d08422)' }}>
              {getEmoji(game.name)}
            </div>
          )}
        </div>
        <div style={{ fontSize: 'clamp(10px,2.2vw,12px)', fontWeight: '700', color: '#ddd', marginBottom: '6px', lineHeight: 1.3 }}>{game.name}</div>
        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
          {game.hot && <span style={{ fontSize: '8px', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,68,68,0.18)', color: '#ff6666' }}>🔥 HOT</span>}
          {game.new && <span style={{ fontSize: '8px', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', background: 'rgba(0,208,132,0.18)', color: '#00d084' }}>✨ NEW</span>}
          <span style={{ fontSize: '8px', fontWeight: '700', padding: '2px 5px', borderRadius: '4px', background: color + '18', color, textTransform: 'uppercase' }}>
            {isEvolution ? 'EVO' : 'M88'}
          </span>
        </div>
        <button onClick={e => { e.stopPropagation(); onPlay(game) }} disabled={busy}
          style={{ width: '100%', padding: '7px', border: 'none', borderRadius: '7px', background: busy ? color + '44' : `linear-gradient(135deg,${color},${color}bb)`, color: busy ? 'rgba(255,255,255,0.5)' : 'white', fontSize: '11px', fontWeight: '800', cursor: busy ? 'not-allowed' : 'pointer' }}>
          {busy ? '⏳...' : '▶ PLAY'}
        </button>
      </div>
      {busy && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
        <div style={{ width: '28px', height: '28px', border: `3px solid ${color}44`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>}
    </div>
  )
}

// Auto-scroll carousel row
function CarouselRow({ games, onPlay, launching, color, speed = 30 }) {
  const rowRef = React.useRef(null)
  const animRef = React.useRef(null)
  const pausedRef = React.useRef(false)
  const posRef = React.useRef(0)

  // Duplicate games for infinite loop
  const doubled = [...games, ...games]

  React.useEffect(function() {
    const row = rowRef.current
    if (!row) return
    const CARD_W = 150 // card width + gap
    const totalW = games.length * CARD_W

    function animate() {
      if (!pausedRef.current) {
        posRef.current += 0.5
        if (posRef.current >= totalW) posRef.current = 0
        if (row) row.scrollLeft = posRef.current
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return function() { cancelAnimationFrame(animRef.current) }
  }, [games.length])

  function handleMouseEnter() { pausedRef.current = true }
  function handleMouseLeave() { pausedRef.current = false }
  function handleTouchStart() { pausedRef.current = true }
  function handleTouchEnd() { setTimeout(function() { pausedRef.current = false }, 2000) }

  function scrollLeft() {
    pausedRef.current = true
    posRef.current = Math.max(0, posRef.current - 300)
    if (rowRef.current) rowRef.current.scrollLeft = posRef.current
    setTimeout(function() { pausedRef.current = false }, 1500)
  }
  function scrollRight() {
    pausedRef.current = true
    posRef.current += 300
    if (rowRef.current) rowRef.current.scrollLeft = posRef.current
    setTimeout(function() { pausedRef.current = false }, 1500)
  }

  return (
    <div style={{ position: 'relative', marginBottom: '10px' }}>
      <button onClick={scrollLeft}
        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '32px', height: '32px', borderRadius: '50%', background: color + 'cc', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ‹
      </button>
      <div ref={rowRef}
        style={{ display: 'flex', gap: '10px', overflowX: 'scroll', scrollBehavior: 'auto', paddingBottom: '4px', paddingLeft: '36px', paddingRight: '36px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      >
        <style>{'.carousel-row::-webkit-scrollbar{display:none}'}</style>
        {doubled.map(function(g, i) {
          return (
            <div key={g.game_uid + '-' + i} style={{ flexShrink: 0, width: '140px' }}>
              <GameCard game={g} onPlay={onPlay} launching={launching} />
            </div>
          )
        })}
      </div>
      <button onClick={scrollRight}
        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '32px', height: '32px', borderRadius: '50%', background: color + 'cc', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ›
      </button>
    </div>
  )
}

// Provider Section - 30 games per row, auto-scroll carousel
function ProviderSection({ provider, games, onPlay, launching, onViewAll }) {
  const cfg = PROVIDER_CONFIG[provider]

  // Split games into rows of 30
  const rows = []
  for (let i = 0; i < games.length; i += 30) {
    rows.push(games.slice(i, i + 30))
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Provider Header */}
      <div style={{ padding: '14px 16px', background: cfg.gradient, border: `1px solid ${cfg.border}`, borderRadius: '14px 14px 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>{cfg.icon}</span>
        <div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(13px,3vw,17px)', color: cfg.color, fontWeight: '700' }}>{cfg.label}</div>
          <div style={{ color: '#666', fontSize: '11px' }}>{games.length} games</div>
        </div>
      </div>

      {/* Carousel Rows */}
      <div style={{ padding: '12px 0', background: 'var(--bg-card)', border: `1px solid ${cfg.border}`, borderTop: 'none', borderRadius: '0 0 14px 14px' }}>
        {rows.map(function(row, idx) {
          return <CarouselRow key={idx} games={row} onPlay={onPlay} launching={launching} color={cfg.color} />
        })}
      </div>
    </div>
  )
}

// All Games Page for a specific provider
function ProviderPage({ provider, games, onPlay, launching, onBack }) {
  const cfg = PROVIDER_CONFIG[provider]
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = games.filter(g => {
    if (cat !== 'all' && g.category !== cat) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const cats = ['all', ...cfg.categories]

  return (
    <div>
      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={onBack}
          style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
          ← Back
        </button>
        <div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(16px,4vw,22px)', color: cfg.color, margin: 0 }}>
            {cfg.icon} {cfg.label}
          </h2>
          <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>{games.length} games</p>
        </div>
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search games..."
        style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = cfg.color}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
        {cats.map(c => {
          const active = cat === c
          const count = c === 'all' ? games.length : games.filter(g => g.category === c).length
          const label = c === 'all' ? '🎮 All' : (cfg.catIcons[c] || '') + ' ' + (cfg.catLabels[c] || c)
          return (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: '7px 12px', borderRadius: '20px', border: `1px solid ${active ? cfg.color : 'var(--border)'}`, background: active ? cfg.color + '18' : 'var(--bg-card)', color: active ? cfg.color : 'var(--text-secondary)', fontWeight: active ? '700' : '400', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Games */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '10px' }}>
        {filtered.map(g => <GameCard key={g.game_uid} game={g} onPlay={onPlay} launching={launching} />)}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p>No games found</p>
        </div>
      )}
    </div>
  )
}

export default function LiveCasino() {
  const { user, balance } = useStore()
  const navigate = useNavigate()

  if (window.location.pathname === '/live-casino/return') return <ReturnPage />

  const [allGames, setAllGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(null)
  const [modal, setModal] = useState(null)
  const [view, setView] = useState('home') // home | mac88 | evolution
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/live-casino/games')
      .then(function(r) {
        const data = r.data
        const list = data && Array.isArray(data.games) ? data.games : Array.isArray(data) ? data : []
        setAllGames(list)
        setLoading(false)
      })
      .catch(function() { setLoading(false); toast.error('Failed to load games') })
  }, [])

  const mac88Games = allGames.filter(g => g.category !== 'evolution')
  const evolutionGames = allGames.filter(g => g.category === 'evolution')

  async function playGame(game) {
    if (!user) { toast.error('Please login to play!'); navigate('/login'); return }
    if (balance < 1) { toast.error('Insufficient balance!'); return }
    setLaunching(game.game_uid)
    try {
      const resp = await api.post('/live-casino/launch', { game_uid: game.game_uid, language: 'hi', currency_code: 'INR' })
      const data = resp.data
      if (data.success && data.gameUrl) {
        setModal(data.gameUrl)
        toast.success(game.name + ' launching!')
      } else {
        toast.error(data.message || 'Launch failed')
      }
    } catch (err) {
      toast.error(err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Game launch failed')
    }
    setLaunching(null)
  }

  // Home search
  const homeSearch = search
    ? allGames.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Game iframe modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#0a0a0f', flexShrink: 0 }}>
            <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel,serif', fontSize: '16px' }}>🎮 Live Game</span>
            <button onClick={() => setModal(null)}
              style={{ padding: '8px 20px', background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', borderRadius: '8px', color: '#ff6666', cursor: 'pointer', fontWeight: '700' }}>
              ✕ Exit Game
            </button>
          </div>
          <iframe src={modal} style={{ flex: 1, border: 'none' }} allow="autoplay; fullscreen" title="Live Game" />
        </div>
      )}

      {/* Provider page view */}
      {view === 'mac88' && (
        <ProviderPage provider="mac88" games={mac88Games} onPlay={playGame} launching={launching} onBack={() => setView('home')} />
      )}
      {view === 'evolution' && (
        <ProviderPage provider="evolution" games={evolutionGames} onPlay={playGame} launching={launching} onBack={() => setView('home')} />
      )}

      {/* Home view */}
      {view === 'home' && (
        <>
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#ff4444', letterSpacing: '2px', padding: '3px 8px', background: 'rgba(255,68,68,0.15)', borderRadius: '4px', border: '1px solid rgba(255,68,68,0.3)', animation: 'livePulse 1.5s ease infinite' }}>● LIVE</span>
              <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,26px)', margin: 0 }}>
                <span className="gold-text">Live Casino</span>
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              {allGames.length} games • Mac88 + Evolution • Real money
            </p>
          </div>

          {/* Balance */}
          <div style={{ padding: '12px 16px', background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Your Balance</span>
            <span style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '16px' }}>🪙 {balance ? balance.toLocaleString() : 0}</span>
          </div>

          {/* Global Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search all games..."
              style={{ width: '100%', padding: '11px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #2a2a3a', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : homeSearch ? (
            <>
              <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>{homeSearch.length} results for "{search}"</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '10px' }}>
                {homeSearch.map(g => <GameCard key={g.game_uid} game={g} onPlay={playGame} launching={launching} />)}
              </div>
              {homeSearch.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No games found</div>}
            </>
          ) : (
            <>
              {/* Mac88 Section */}
              <ProviderSection
                provider="mac88"
                games={mac88Games}
                onPlay={playGame}
                launching={launching}
                onViewAll={() => setView('mac88')}
              />

              {/* Evolution Section */}
              <ProviderSection
                provider="evolution"
                games={evolutionGames}
                onPlay={playGame}
                launching={launching}
                onViewAll={() => setView('evolution')}
              />
            </>
          )}

          {!user && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>Login to play live games! 🎰</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => navigate('/login')} className="btn-gold" style={{ padding: '9px 20px' }}>Login</button>
                <button onClick={() => navigate('/signup')} style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Sign Up Free</button>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        @keyframes livePulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>
    </div>
  )
}
//v63
