import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore, api } from '../store/useStore'

const CATEGORIES = [
  { id: 'all',       label: 'All Games',      icon: '🎮' },
  { id: 'crash',     label: 'Crash',          icon: '🚀' },
  { id: 'cards',     label: 'Cards',          icon: '🃏' },
  { id: 'dice',      label: 'Dice',           icon: '🎲' },
  { id: 'slots',     label: 'Slots',          icon: '🎰' },
  { id: 'wheel',     label: 'Wheel & Spin',   icon: '🎡' },
  { id: 'grid',      label: 'Grid & Mine',    icon: '💎' },
  { id: 'instant',   label: 'Instant Win',    icon: '⚡' },
  { id: 'adventure', label: 'Adventure',      icon: '🐔' },
]

const ALL_GAMES = [
  // ── CRASH ──
  { id:'aviator',          settingKey:'aviator',       name:'Aviator',           icon:'✈️',  cat:'crash',     color:'#ff4444', hot:true,  new:false },
  { id:'crash-rocket',     settingKey:'crashRocket',   name:'Crash Rocket',      icon:'🚀',  cat:'crash',     color:'#9944ff', hot:true,  new:false },
  { id:'crash-ball',       settingKey:'crashBall',     name:'Crash Ball',        icon:'⚽',  cat:'crash',     color:'#4488ff', hot:false, new:true  },
  { id:'limbo',            settingKey:'limbo',         name:'Limbo',             icon:'🎯',  cat:'crash',     color:'#00d084', hot:false, new:true  },

  // ── CARDS ──
  { id:'blackjack',        settingKey:'blackjack',     name:'Blackjack',         icon:'🃏',  cat:'cards',     color:'#4488ff', hot:false },
  { id:'baccarat',         settingKey:'baccarat',      name:'Baccarat',          icon:'🎴',  cat:'cards',     color:'#c9a227', hot:false },
  { id:'teen-patti',       settingKey:'teenPatti',     name:'Teen Patti',        icon:'♠️',  cat:'cards',     color:'#ff4488', hot:true  },
  { id:'andar-bahar',      settingKey:'andarBahar',    name:'Andar Bahar',       icon:'🎯',  cat:'cards',     color:'#00d084', hot:true  },
  { id:'poker',            settingKey:'poker',         name:'Poker',             icon:'♣️',  cat:'cards',     color:'#9944ff', hot:false },
  { id:'dragon-tiger',     settingKey:'dragonTiger',   name:'Dragon Tiger',      icon:'🐉',  cat:'cards',     color:'#ff4444', hot:true  },
  { id:'hi-lo',            settingKey:'hiLo',          name:'Hi-Lo',             icon:'📈',  cat:'cards',     color:'#4488ff', hot:false },
  { id:'video-poker',      settingKey:'videoPoker',    name:'Video Poker',       icon:'🎰',  cat:'cards',     color:'#ff8800', hot:false, new:true },
  { id:'hilo-card',        settingKey:'hiloCard',      name:'Hilo Card',         icon:'🃏',  cat:'cards',     color:'#00d084', hot:false, new:true },
  { id:'war',              settingKey:'war',           name:'War',               icon:'⚔️',  cat:'cards',     color:'#c9a227', hot:false, new:true },
  { id:'blackjack-switch', settingKey:'blackjackSwitch',name:'Blackjack Switch', icon:'🔄',  cat:'cards',     color:'#4488ff', hot:false, new:true },
  { id:'three-card-poker', settingKey:'threeCardPoker',name:'3 Card Poker',      icon:'🃏',  cat:'cards',     color:'#9944ff', hot:false, new:true },
  { id:'mini-baccarat',    settingKey:'miniBaccarat',  name:'Mini Baccarat',     icon:'🎴',  cat:'cards',     color:'#c9a227', hot:false, new:true },

  // ── DICE ──
  { id:'dice',             settingKey:'dice',          name:'Dice',              icon:'🎲',  cat:'dice',      color:'#00d084', hot:false },
  { id:'sic-bo',           settingKey:'sicBo',         name:'Sic Bo',            icon:'🎲',  cat:'dice',      color:'#ff8800', hot:false },
  { id:'dice-battle',      settingKey:'diceBattle',    name:'Dice Battle',       icon:'⚔️',  cat:'dice',      color:'#ff4444', hot:false, new:true },

  // ── SLOTS ──
  { id:'slots',            settingKey:'slots',         name:'Slot Machine',      icon:'🎰',  cat:'slots',     color:'#ff8800', hot:true  },
  { id:'lucky-7s',         settingKey:'lucky7s',       name:'Lucky 7s',          icon:'7️⃣',  cat:'slots',     color:'#c9a227', hot:false, new:true },
  { id:'scratch-card',     settingKey:'scratchCard',   name:'Scratch Card',      icon:'🎴',  cat:'slots',     color:'#9944ff', hot:false, new:true },

  // ── WHEEL ──
  { id:'roulette',         settingKey:'roulette',      name:'Roulette',          icon:'🎡',  cat:'wheel',     color:'#00d084', hot:false },
  { id:'lucky-wheel',      settingKey:'luckyWheel',    name:'Lucky Wheel',       icon:'🎡',  cat:'wheel',     color:'#c9a227', hot:false },
  { id:'spin-win',         settingKey:'spinWin',       name:'Spin & Win',        icon:'🎪',  cat:'wheel',     color:'#ff4488', hot:false },
  { id:'wheel-fortune',    settingKey:'wheelFortune',  name:'Wheel of Fortune',  icon:'🎡',  cat:'wheel',     color:'#9944ff', hot:false, new:true },
  { id:'color-prediction', settingKey:'colorPrediction',name:'Color Prediction', icon:'🎨',  cat:'wheel',     color:'#ff4488', hot:false },

  // ── GRID ──
  { id:'mines',            settingKey:'mines',         name:'Mines',             icon:'💎',  cat:'grid',      color:'#00d084', hot:true  },
  { id:'plinko',           settingKey:'plinko',        name:'Plinko',            icon:'⚡',  cat:'grid',      color:'#9944ff', hot:false },
  { id:'keno',             settingKey:'keno',          name:'Keno',              icon:'🎱',  cat:'grid',      color:'#4488ff', hot:false, new:true },
  { id:'ball-drop',        settingKey:'ballDrop',      name:'Ball Drop',         icon:'⚽',  cat:'grid',      color:'#ff8800', hot:false, new:true },

  // ── INSTANT ──
  { id:'coin-flip',        settingKey:'coinFlip',      name:'Coin Flip',         icon:'🪙',  cat:'instant',   color:'#c9a227', hot:false, new:true },
  { id:'number-guess',     settingKey:'numberGuess',   name:'Number Guess',      icon:'🔢',  cat:'instant',   color:'#4488ff', hot:false, new:true },
  { id:'rps',              settingKey:'rps',           name:'Rock Paper Scissors',icon:'✊', cat:'instant',   color:'#00d084', hot:false, new:true },
  { id:'hot-cold',         settingKey:'hotCold',       name:'Hot & Cold',        icon:'🔥',  cat:'instant',   color:'#ff4444', hot:false, new:true },

  // ── ADVENTURE ──
  { id:'chicken-road',     settingKey:'chickenRoad',   name:'Chicken Road',      icon:'🐔',  cat:'adventure', color:'#ff8800', hot:true  },
  { id:'tower',            settingKey:'tower',         name:'Tower',             icon:'🗼',  cat:'adventure', color:'#9944ff', hot:false },
  { id:'penalty',          settingKey:'penalty',       name:'Penalty Shootout',  icon:'⚽',  cat:'adventure', color:'#00d084', hot:false, new:true },
]

function GameCard({ game, disabled }) {
  return (
    <Link to={disabled ? '#' : `/games/${game.id}`}
      style={{ textDecoration: 'none', pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{
        background: disabled ? '#111118' : 'var(--bg-card)',
        border: `1px solid ${disabled ? '#1a1a1a' : `${game.color}28`}`,
        borderRadius: '14px', padding: '0', overflow: 'hidden',
        transition: 'all 0.22s', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, position: 'relative',
      }}
        onMouseEnter={e => !disabled && (e.currentTarget.style.transform = 'translateY(-3px)', e.currentTarget.style.borderColor = `${game.color}60`, e.currentTarget.style.boxShadow = `0 8px 24px ${game.color}18`)}
        onMouseLeave={e => (e.currentTarget.style.transform = 'none', e.currentTarget.style.borderColor = `${game.color}28`, e.currentTarget.style.boxShadow = 'none')}
      >
        {/* Color band top */}
        <div style={{ height: '4px', background: `linear-gradient(90deg,${game.color},${game.color}66)` }} />

        <div style={{ padding: '14px 12px 12px' }}>
          {/* Icon */}
          <div style={{ fontSize: 'clamp(28px,6vw,36px)', marginBottom: '8px', lineHeight: 1 }}>
            {game.icon}
          </div>

          {/* Name */}
          <div style={{ fontSize: 'clamp(11px,2.5vw,13px)', fontWeight: '700', color: disabled ? '#444' : '#ddd', lineHeight: 1.2, marginBottom: '6px' }}>
            {game.name}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {game.hot && !disabled && (
              <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,68,68,0.18)', color: '#ff6666', border: '1px solid rgba(255,68,68,0.25)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                🔥 Hot
              </span>
            )}
            {game.new && !disabled && (
              <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,208,132,0.18)', color: '#00d084', border: '1px solid rgba(0,208,132,0.25)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                ✨ New
              </span>
            )}
            {disabled && (
              <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}>
                🚫 Off
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function GameLobby() {
  const { user } = useStore()
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [gameSettings, setGameSettings] = useState({})
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Fetch all game settings from admin
  useEffect(() => {
    api.get('/admin/game-settings/all')
      .then(r => { setGameSettings(r.data || {}); setSettingsLoaded(true) })
      .catch(() => setSettingsLoaded(true))
  }, [])

  const isDisabled = (game) => {
    if (!settingsLoaded) return false
    const s = gameSettings[game.settingKey]
    return s && s.enabled === false
  }

  const filtered = ALL_GAMES.filter(g => {
    if (cat !== 'all' && g.cat !== cat) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Split by category for "all" view
  const catGroups = cat === 'all'
    ? CATEGORIES.filter(c => c.id !== 'all').map(c => ({
        ...c,
        games: filtered.filter(g => g.cat === c.id)
      })).filter(c => c.games.length > 0)
    : null

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(20px,5vw,28px)', marginBottom: '4px' }}>
          🎮 <span className="gold-text">Game Lobby</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {ALL_GAMES.length} games • {ALL_GAMES.filter(g => g.hot).length} hot 🔥 • {ALL_GAMES.filter(g => g.new).length} new ✨
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search games..."
          style={{ width: '100%', padding: '11px 16px 11px 40px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
        {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '18px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ padding: '8px 14px', borderRadius: '20px', border: `1px solid ${cat === c.id ? 'var(--gold)' : 'var(--border)'}`, background: cat === c.id ? 'rgba(201,162,39,0.15)' : 'var(--bg-card)', color: cat === c.id ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: cat === c.id ? '700' : '400', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}>
            {c.icon} {c.label}
            {c.id !== 'all' && <span style={{ marginLeft: '5px', fontSize: '10px', opacity: 0.6 }}>
              ({ALL_GAMES.filter(g => g.cat === c.id).length})
            </span>}
          </button>
        ))}
      </div>

      {/* Games */}
      {search || cat !== 'all' ? (
        // Flat grid for search or specific category
        <div>
          {cat !== 'all' && !search && (
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{CATEGORIES.find(c2 => c2.id === cat)?.icon}</span>
              <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: '18px', color: 'var(--gold)' }}>
                {CATEGORIES.find(c2 => c2.id === cat)?.label}
              </h2>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{filtered.length} games</span>
            </div>
          )}
          {search && (
            <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              Found <strong style={{ color: 'white' }}>{filtered.length}</strong> games for "{search}"
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
            {filtered.map(game => <GameCard key={game.id} game={game} disabled={isDisabled(game)} />)}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <p>No games found</p>
            </div>
          )}
        </div>
      ) : (
        // Grouped by category
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {catGroups.map(group => (
            <div key={group.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{group.icon}</span>
                  <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(14px,3vw,18px)', color: 'var(--gold)' }}>
                    {group.label}
                  </h2>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({group.games.length})</span>
                </div>
                <button onClick={() => setCat(group.id)}
                  style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)', color: 'var(--gold)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                  See All →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                {group.games.map(game => <GameCard key={game.id} game={game} disabled={isDisabled(game)} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>
            Login to play all games and win real coins! 🪙
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/login"><button className="btn-gold" style={{ padding: '9px 20px' }}>Login</button></Link>
            <Link to="/signup"><button style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Sign Up Free</button></Link>
          </div>
        </div>
      )}
    </div>
  )
}
