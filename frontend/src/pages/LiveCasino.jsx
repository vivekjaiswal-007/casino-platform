import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, api } from '../store/useStore'

// ─── Category config ────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',     label: 'All Games',  icon: '🎮' },
  { id: 'slots',   label: 'Slots',      icon: '🎰' },
  { id: 'table',   label: 'Table',      icon: '🃏' },
  { id: 'fishing', label: 'Fishing',    icon: '🎣' },
  { id: 'arcade',  label: 'Arcade',     icon: '🕹️' },
]

// ─── Fallback emoji per category ────────────────────────────────────────────
const CATEGORY_EMOJI = {
  slots:   '🎰',
  table:   '🃏',
  fishing: '🎣',
  arcade:  '🕹️',
}

// ─── Gradient per category ──────────────────────────────────────────────────
const CATEGORY_GRAD = {
  slots:   'linear-gradient(135deg,#1a0a2e,#3d1468)',
  table:   'linear-gradient(135deg,#0a1e28,#14486e)',
  fishing: 'linear-gradient(135deg,#071a1a,#0d4a3d)',
  arcade:  'linear-gradient(135deg,#1a1200,#4a3000)',
}

// ─── Full-screen game modal ──────────────────────────────────────────────────
function GameModal({ gameUrl, gameName, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.96)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#0c0e16',
        borderBottom: '1px solid rgba(201,162,39,0.2)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#00d084',
            boxShadow: '0 0 8px #00d084',
            animation: 'pulse 1.5s infinite',
          }}/>
          <span style={{ fontFamily: 'Cinzel,serif', color: '#c9a227', fontSize: '14px', fontWeight: 700 }}>
            LIVE
          </span>
          <span style={{ color: '#ccc', fontSize: '13px' }}>{gameName}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.35)',
            color: '#ff6666', borderRadius: '8px', padding: '6px 14px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 700,
          }}
        >
          ✕ Exit Game
        </button>
      </div>

      {/* Game iframe */}
      <iframe
        src={gameUrl}
        style={{ flex: 1, border: 'none', width: '100%' }}
        allow="fullscreen; autoplay"
        allowFullScreen
        title={gameName}
      />

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}

// ─── Individual Game Card ────────────────────────────────────────────────────
function LiveGameCard({ game, onPlay, launching }) {
  const [hovered, setHovered] = useState(false)
  const isLaunching = launching === game.game_uid
  const grad = CATEGORY_GRAD[game.category] || CATEGORY_GRAD.slots

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(201,162,39,0.12)' : 'none',
        position: 'relative',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        aspectRatio: '16/10',
        background: grad,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Try actual image, fallback to emoji */}
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        ) : null}
        <div style={{
          fontSize: '3rem',
          display: game.image ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%', height: '100%',
        }}>
          {CATEGORY_EMOJI[game.category]}
        </div>

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015)1px,transparent 1px)',
          backgroundSize: '20px 20px',
        }}/>

        {/* LIVE badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(192,38,58,0.92)',
          padding: '3px 8px',
          borderRadius: '5px',
          fontSize: '9px', fontWeight: 800,
          letterSpacing: '1.5px',
          display: 'flex', alignItems: 'center', gap: '4px',
          color: 'white',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'blink 1.2s infinite' }}/>
          LIVE
        </div>

        {/* HOT / NEW badges */}
        {game.hot && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(255,68,68,0.85)',
            padding: '3px 8px', borderRadius: '5px',
            fontSize: '9px', fontWeight: 800, color: 'white',
          }}>🔥 HOT</div>
        )}
        {game.new && !game.hot && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,208,132,0.85)',
            padding: '3px 8px', borderRadius: '5px',
            fontSize: '9px', fontWeight: 800, color: 'white',
          }}>✨ NEW</div>
        )}

        {/* Hover play overlay */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}>
            <button
              onClick={() => onPlay(game)}
              disabled={isLaunching}
              style={{
                background: 'linear-gradient(135deg,#8a6a1a,#c9a227)',
                border: 'none',
                borderRadius: '24px',
                padding: '11px 26px',
                color: '#0a0800',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 20px rgba(201,162,39,0.5)',
                transform: 'scale(1.0)',
                transition: 'transform 0.15s',
              }}
            >
              {isLaunching ? (
                <>
                  <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span>
                  Loading…
                </>
              ) : (
                <>▶ Play Now</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px', background: '#1a1f35' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#eee', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {game.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#666', textTransform: 'capitalize' }}>
            {game.category}
          </span>
          <span style={{ fontSize: '10px', color: '#00d084', fontWeight: 600 }}>
            JILI
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}

// ─── Return/redirect landing ─────────────────────────────────────────────────
function ReturnPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navigate('/live-casino'), 3000)
    return () => clearTimeout(t)
  }, [navigate])
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '3rem' }}>🎰</div>
      <h2 style={{ fontFamily: 'Cinzel,serif', color: '#c9a227' }}>Game Ended</h2>
      <p style={{ color: '#888' }}>Returning to Live Casino…</p>
    </div>
  )
}

// ─── Main LiveCasino page ────────────────────────────────────────────────────
export default function LiveCasino() {
  const { user, balance, fetchBalance } = useStore()
  const navigate = useNavigate()
  const [games, setGames]             = useState([])
  const [cat, setCat]                 = useState('all')
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(true)
  const [launching, setLaunching]     = useState(null)   // game_uid being launched
  const [error, setError]             = useState('')
  const [activeGame, setActiveGame]   = useState(null)   // { url, name }
  const [loginPrompt, setLoginPrompt] = useState(false)

  // If URL is /live-casino/return, show return page
  if (window.location.pathname === '/live-casino/return') return <ReturnPage />

  // Load game list
  useEffect(() => {
    setLoading(true)
    api.get(`/live-casino/games${cat !== 'all' ? `?category=${cat}` : ''}`)
      .then(r => { setGames(r.data.games || []); setLoading(false) })
      .catch(err => {
        console.error(err)
        setLoading(false)
        setError('Failed to load games. Please refresh.')
      })
  }, [cat])

  const filtered = games.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  )

  const handlePlay = async (game) => {
    if (!user) { setLoginPrompt(true); return }
    setError('')
    setLaunching(game.game_uid)

    try {
      const { data } = await api.post('/live-casino/launch', {
        game_uid:      game.game_uid,
        language:      'en',
        currency_code: 'INR',
      })

      if (!data.success || !data.gameUrl) {
        throw new Error(data.message || 'Failed to launch game')
      }

      // Refresh balance
      if (fetchBalance) fetchBalance()

      // Open in modal
      setActiveGame({ url: data.gameUrl, name: game.name })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Launch failed. Try again.')
    } finally {
      setLaunching(null)
    }
  }

  const handleCloseGame = () => {
    setActiveGame(null)
    if (fetchBalance) fetchBalance()
  }

  return (
    <>
      {/* Full-screen game modal */}
      {activeGame && (
        <GameModal
          gameUrl={activeGame.url}
          gameName={activeGame.name}
          onClose={handleCloseGame}
        />
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(105deg,#0c0714,#1a103c,#200c1e)',
          borderRadius: '16px',
          padding: 'clamp(18px,4vw,28px)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(201,162,39,0.18)',
        }}>
          {/* bg glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.08),transparent 70%)', pointerEvents: 'none' }}/>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#e8304a', boxShadow: '0 0 10px #e8304a', animation: 'livePulse 1.4s infinite' }}/>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#e8304a', textTransform: 'uppercase' }}>Live Casino</span>
              </div>
              <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,5vw,26px)', color: '#fff', marginBottom: '4px' }}>
                🎰 <span style={{ color: '#c9a227' }}>JILI</span> Live Casino
              </h1>
              <p style={{ color: '#888', fontSize: '13px' }}>
                {games.length} games powered by SoftAPI • Real money • Instant launch
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {user ? (
                <div style={{
                  background: 'rgba(201,162,39,0.1)',
                  border: '1px solid rgba(201,162,39,0.3)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}>
                  <span style={{ fontSize: '10px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Balance</span>
                  <span style={{ fontFamily: 'Cinzel,serif', fontSize: '18px', fontWeight: 700, color: '#c9a227' }}>
                    ₹{(balance || 0).toFixed(2)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'linear-gradient(135deg,#c0263a,#e8304a)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 22px',
                    color: 'white', fontWeight: 700, fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(192,38,58,0.4)',
                  }}
                >
                  Login to Play →
                </button>
              )}
            </div>
          </div>

          <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(232,48,74,0.5)}50%{opacity:0.7;transform:scale(1.3);box-shadow:0 0 0 6px rgba(232,48,74,0)}}`}</style>
        </div>

        {/* ── Login prompt banner ── */}
        {loginPrompt && !user && (
          <div style={{
            background: 'rgba(192,38,58,0.12)',
            border: '1px solid rgba(192,38,58,0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            flexWrap: 'wrap',
          }}>
            <span style={{ color: '#ff8899', fontSize: '13px' }}>🔒 You need to login to play live casino games.</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => navigate('/login')} style={{ background: '#e8304a', border: 'none', color: 'white', borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Login</button>
              <button onClick={() => navigate('/signup')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ccc', borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px' }}>Sign Up</button>
              <button onClick={() => setLoginPrompt(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div style={{
            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ff8888', fontSize: '13px',
          }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ff8888', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
        )}

        {/* ── Category tabs ── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => { setCat(c.id); setSearch('') }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1px solid ${cat === c.id ? '#c9a227' : 'rgba(255,255,255,0.08)'}`,
                background: cat === c.id ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.03)',
                color: cat === c.id ? '#c9a227' : '#777',
                fontWeight: cat === c.id ? 700 : 400,
                fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search live games…"
            style={{
              width: '100%', padding: '10px 16px 10px 40px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#c9a227'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
        </div>

        {/* ── Games grid ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '14px',
                aspectRatio: '4/3',
                animation: 'shimmer 1.5s infinite',
                backgroundImage: 'linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0) 100%)',
                backgroundSize: '200% 100%',
              }}/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎰</div>
            <p>No games found{search ? ` for "${search}"` : ''}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px' }}>
            {filtered.map(game => (
              <LiveGameCard
                key={game.game_uid}
                game={game}
                onPlay={handlePlay}
                launching={launching}
              />
            ))}
          </div>
        )}

        {/* ── Info strip ── */}
        <div style={{
          marginTop: '28px',
          background: 'rgba(201,162,39,0.05)',
          border: '1px solid rgba(201,162,39,0.12)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex', flexWrap: 'wrap', gap: '16px',
        }}>
          {[
            { icon: '🔒', label: 'Secure', desc: 'AES-256 encrypted sessions' },
            { icon: '⚡', label: 'Instant', desc: 'Games launch in seconds' },
            { icon: '💰', label: 'Real Money', desc: 'Win real INR coins' },
            { icon: '📱', label: 'Mobile Ready', desc: 'Play on any device' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 0 180px' }}>
              <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#c9a227' }}>{f.label}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      </div>
    </>
  )
}
