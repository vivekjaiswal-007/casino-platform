import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, api } from '../store/useStore'
import toast from 'react-hot-toast'

// Return page after game exit
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
      <p style={{ color: 'var(--text-secondary)' }}>Returning to Mac88 Live Casino...</p>
    </div>
  )
}

const CAT_COLORS = { table: '#00d084', lottery: '#c9a227', arcade: '#9944ff', slots: '#ff8800', fishing: '#4488ff' }
const CAT_ICONS  = { table: '🎲', lottery: '🎯', arcade: '🕹️', slots: '🎰', fishing: '🎣' }
const CAT_LABELS = { table: 'Table Games', lottery: 'Lottery', arcade: 'Arcade', slots: 'Slots', fishing: 'Fishing' }

const GAME_EMOJI = {
  '1 Day Dragon Tiger': '🐉', '10-10 Cricket': '🏏', '20-20 Teen Patti': '♠️',
  '29 Baccarat': '🎴', '3 Cards Judgement': '🃏', '32 Cards': '🃏',
  '5 Five Cricket': '🏏', '6 Player Poker': '♣️', 'AK47 Teen Patti': '🔫',
  'AK47 VR': '🥽', 'Amar Akbar Anthony': '🎭',
  '5D Lottery 1': '🎯', '5D Lottery 3': '🎯', '5D Lottery 5': '🎯', '5D Lottery 10': '🎯',
}

function GameCard({ game, onPlay, launching }) {
  const color = CAT_COLORS[game.category] || '#c9a227'
  const emoji = GAME_EMOJI[game.name] || '🎮'
  const busy  = launching === game.game_uid

  return (
    <div
      onClick={() => !busy && onPlay(game)}
      style={{
        background: 'var(--bg-card)', border: `1px solid ${color}28`,
        borderRadius: '14px', overflow: 'hidden', cursor: busy ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', position: 'relative', opacity: busy ? 0.8 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = color + '60' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = color + '28' }}
    >
      <div style={{ height: '4px', background: `linear-gradient(90deg,${color},${color}55)` }} />
      <div style={{ padding: '16px 12px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(30px,7vw,44px)', marginBottom: '8px' }}>{emoji}</div>
        <div style={{ fontSize: 'clamp(11px,2.5vw,13px)', fontWeight: '700', color: '#ddd', marginBottom: '8px', lineHeight: 1.3 }}>
          {game.name}
        </div>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
          {game.hot && <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,68,68,0.18)', color: '#ff6666', border: '1px solid rgba(255,68,68,0.25)' }}>🔥 HOT</span>}
          {game.new && <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,208,132,0.18)', color: '#00d084', border: '1px solid rgba(0,208,132,0.25)' }}>✨ NEW</span>}
          <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: color + '18', color, border: `1px solid ${color}30`, textTransform: 'uppercase' }}>Mac88</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onPlay(game) }}
          disabled={busy}
          style={{
            width: '100%', padding: '8px', border: 'none', borderRadius: '8px',
            background: busy ? color + '44' : `linear-gradient(135deg,${color},${color}bb)`,
            color: busy ? 'rgba(255,255,255,0.5)' : 'white',
            fontSize: '12px', fontWeight: '800', cursor: busy ? 'not-allowed' : 'pointer',
          }}>
          {busy ? '⏳ Loading...' : '▶ PLAY NOW'}
        </button>
      </div>
      {busy && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>
          <div style={{ width: '32px', height: '32px', border: `3px solid ${color}44`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
    </div>
  )
}

export default function LiveCasino() {
  const { user, balance } = useStore()
  const navigate = useNavigate()

  // Return page
  if (window.location.pathname === '/live-casino/return') return <ReturnPage />

  const [games,    setGames]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [launching,setLaunching]= useState(null)
  const [cat,      setCat]      = useState('all')
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/live-casino/games')
      .then(function(r) {
        var data = r.data
        var list = []
        if (data && Array.isArray(data.games)) list = data.games
        else if (Array.isArray(data)) list = data
        setGames(list)
        setLoading(false)
      })
      .catch(function() {
        setError('Failed to load games. Please refresh.')
        setLoading(false)
      })
  }, [])

  async function playGame(game) {
    if (!user) { toast.error('Please login to play!'); navigate('/login'); return }
    if (balance < 1) { toast.error('Insufficient balance!'); return }
    setLaunching(game.game_uid)
    try {
      const resp = await api.post('/live-casino/launch', {
        game_uid: game.game_uid,
        language: 'hi',
        currency_code: 'INR',
      })
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

  const cats = ['all', 'table', 'evolution', 'crash', 'lottery', 'slots', 'virtual', 'casual']
  const filtered = games.filter(function(g) {
    if (cat !== 'all' && g.category !== cat) return false
    if (search && g.name.toLowerCase().indexOf(search.toLowerCase()) === -1) return false
    return true
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Game iframe modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#0a0a0f' }}>
            <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel,serif', fontSize: '16px' }}>🎮 Mac88 Live Game</span>
            <button onClick={() => setModal(null)}
              style={{ padding: '8px 20px', background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', borderRadius: '8px', color: '#ff6666', cursor: 'pointer', fontWeight: '700' }}>
              ✕ Exit Game
            </button>
          </div>
          <iframe src={modal} style={{ flex: 1, border: 'none' }} allow="autoplay; fullscreen" title="Mac88 Game" />
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', color: '#ff4444', letterSpacing: '2px', padding: '3px 8px', background: 'rgba(255,68,68,0.15)', borderRadius: '4px', border: '1px solid rgba(255,68,68,0.3)', animation: 'livePulse 1.5s ease infinite' }}>● LIVE</span>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,26px)', margin: 0 }}>
            <span className="gold-text">Mac88 Live Casino</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          {games.length} games • Real money • Instant launch
        </p>
      </div>

      {/* Balance banner */}
      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg,rgba(201,162,39,0.1),rgba(0,208,132,0.08))', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🎰</span>
          <div>
            <div style={{ fontWeight: '700', color: '#ddd', fontSize: '14px' }}>Mac88 Games — Official</div>
            <div style={{ color: '#666', fontSize: '12px' }}>Table Games • Lottery • Real Money</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '15px' }}>🪙 {balance ? balance.toLocaleString() : 0}</div>
          <div style={{ color: '#555', fontSize: '11px' }}>Your Balance</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <input value={search} onChange={function(e) { setSearch(e.target.value) }}
          placeholder="🔍 Search Mac88 games..."
          style={{ width: '100%', padding: '11px 16px 11px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          onFocus={function(e) { e.target.style.borderColor = 'var(--gold)' }}
          onBlur={function(e) { e.target.style.borderColor = 'var(--border)' }}
        />
        {search && <button onClick={function() { setSearch('') }} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {cats.map(function(c2) {
          const active = cat === c2
          const color = c2 === 'all' ? 'var(--gold)' : CAT_COLORS[c2] || 'var(--gold)'
          const label = c2 === 'all' ? '🎮 All Games' : (CAT_ICONS[c2] || '') + ' ' + (CAT_LABELS[c2] || c2)
          const count = c2 === 'all' ? games.length : games.filter(function(g) { return g.category === c2 }).length
          return (
            <button key={c2} onClick={function() { setCat(c2) }}
              style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid ' + (active ? color : 'var(--border)'), background: active ? color + '18' : 'var(--bg-card)', color: active ? color : 'var(--text-secondary)', fontWeight: active ? '700' : '400', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Games */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #2a2a3a', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#ff4444' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <p>{error}</p>
          <button onClick={function() { window.location.reload() }} style={{ padding: '10px 20px', background: 'var(--gold)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p>No games found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '12px' }}>
          {filtered.map(function(game) {
            return <GameCard key={game.game_uid} game={game} onPlay={playGame} launching={launching} />
          })}
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>Login to play Mac88 live games! 🎰</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={function() { navigate('/login') }} className="btn-gold" style={{ padding: '9px 20px' }}>Login</button>
            <button onClick={function() { navigate('/signup') }} style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Sign Up Free</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        @keyframes livePulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>
    </div>
  )
}
