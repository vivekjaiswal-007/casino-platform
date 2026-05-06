import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, api } from '../store/useStore'
import toast from 'react-hot-toast'

const FEATURED = [
  { name: 'Aviator',          path: '/games/aviator',          icon: '✈️', color: '#ff4444' },
  { name: 'Crash Rocket',     path: '/games/crash-rocket',     icon: '🚀', color: '#9944ff' },
  { name: 'Color Prediction', path: '/games/color-prediction', icon: '🎨', color: '#ff4488' },
  { name: 'Chicken Road',     path: '/games/chicken-road',     icon: '🐔', color: '#ff9900' },
  { name: 'Mines',            path: '/games/mines',            icon: '💎', color: '#00d084' },
  { name: 'Dragon Tiger',     path: '/games/dragon-tiger',     icon: '🐉', color: '#ff4444' },
]

const LUCKY_SPORT = { game_uid: '7004', name: 'LuckSportGaming', icon: '🏆', color: '#c9a227' }

const EXTRA_GAMES = [
  { name: 'Teen Patti',   path: '/games/teen-patti',   icon: '♠️', color: '#c9a227' },
  { name: 'Roulette',     path: '/games/roulette',     icon: '🎡', color: '#00d084' },
  { name: 'Blackjack',    path: '/games/blackjack',    icon: '🃏', color: '#4488ff' },
  { name: 'Andar Bahar',  path: '/games/andar-bahar',  icon: '🎯', color: '#ff9900' },
  { name: 'Plinko',       path: '/games/plinko',       icon: '⚡', color: '#ff4488' },
  { name: 'Hi-Lo',        path: '/games/hi-lo',        icon: '📈', color: '#00d084' },
  { name: 'Lucky Wheel',  path: '/games/lucky-wheel',  icon: '🎡', color: '#c9a227' },
  { name: 'Sic Bo',       path: '/games/sic-bo',       icon: '🎲', color: '#ff9900' },
  { name: 'Poker',        path: '/games/poker',        icon: '♣️', color: '#9944ff' },
]

const ROW_TAGS = [
  { label: '🆕 New Launch',      color: '#4488ff' },
  { label: '🔥 Trending Games',  color: '#ff4444' },
  { label: '⭐ Recommended',     color: '#c9a227' },
  { label: '🎯 Popular Picks',   color: '#00d084' },
  { label: '🏆 Top Rated',       color: '#ff9900' },
  { label: '💥 Crash & Win',     color: '#ff4488' },
  { label: '🎲 Table Games',     color: '#9944ff' },
  { label: '🎰 Slots & More',    color: '#ff9900' },
]

function FeaturedCard({ game }) {
  return (
    <Link to={game.path} style={{ textDecoration: 'none' }}>
      <div style={{
        aspectRatio: '16/9',
        background: `linear-gradient(135deg,${game.color}33,#12121a)`,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <div style={{ fontSize: 'clamp(30px,6vw,42px)', marginBottom: '8px' }}>{game.icon}</div>
        <div style={{ fontSize: 'clamp(11px,2.5vw,14px)', fontWeight: '700', color: '#ddd' }}>{game.name}</div>
      </div>
    </Link>
  )
}




function CricketBanner({ onPlay, launching }) {
  const LUCKY = { game_uid: '7004', name: 'LuckSportGaming' }
  
  return (
    <section style={{ marginBottom: '20px' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3951/1193',
        borderRadius: '14px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2f5e 30%, #0d3d1a 70%, #0a1628 100%)',
        minHeight: '120px',
      }}>
        {/* Background image - replace src with your image URL */}
        <img
          src="/banner-cricket.jpg"
          alt="Cricket Banner"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => e.target.style.display = 'none'}
        />

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(16px,4vw,48px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', animation: 'pulse 1.4s infinite' }} />
            <span style={{ fontSize: 'clamp(9px,1.5vw,13px)', color: '#ff4444', fontWeight: '800', letterSpacing: '2px' }}>LIVE NOW</span>
          </div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(16px,4vw,42px)', color: 'white', marginBottom: 'clamp(4px,1vw,12px)', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            🏏 Live Cricket<br/>
            <span style={{ color: '#c9a227' }}>Betting</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(9px,1.8vw,16px)', marginBottom: 'clamp(10px,2vw,24px)' }}>
            IPL • T20 • PSL • Real Money
          </p>
          <button
            onClick={() => onPlay(LUCKY)}
            disabled={launching === '7004'}
            style={{
              alignSelf: 'flex-start',
              padding: 'clamp(8px,1.5vw,16px) clamp(16px,3vw,36px)',
              background: launching === '7004' ? '#555' : 'linear-gradient(135deg,#c9a227,#f0c040)',
              border: 'none',
              borderRadius: 'clamp(6px,1vw,10px)',
              color: '#0a0800',
              fontWeight: '800',
              fontSize: 'clamp(11px,2vw,18px)',
              cursor: launching === '7004' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(201,162,39,0.4)',
            }}
            onMouseEnter={e => { if(launching !== '7004') e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            {launching === '7004' ? '⏳ Loading...' : '🏏 Play Cricket Now'}
          </button>
        </div>
      </div>
    </section>
  )
}

function LuckySportEmbed() {
  const [url, setUrl] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(function() {
    api.post('/live-casino/launch', { game_uid: '7004', language: 'hi', currency_code: 'INR' })
      .then(function(r) {
        if (r.data.success && r.data.gameUrl) {
          setUrl(r.data.gameUrl)
        } else {
          setError(true)
        }
        setLoading(false)
      })
      .catch(function() { setError(true); setLoading(false) })
  }, [])

  if (error) return null
  if (loading) return (
    <div style={{ height: '400px', background: '#1a1a28', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#555', fontSize: '14px' }}>
      ⏳ Loading Live Sports...
    </div>
  )

  return (
    <section style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', animation: 'pulse 1.4s infinite' }} />
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#ddd' }}>🏏 Live Sports Betting</span>
      </div>
      <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#1a1a28' }}>
        <iframe
          src={url}
          style={{ width: '100%', height: '500px', border: 'none', display: 'block' }}
          allow="autoplay; fullscreen"
          title="Live Sports"
        />
      </div>
    </section>
  )
}

function AutoScrollRow({ children, count }) {
  const rowRef = React.useRef(null)
  const animRef = React.useRef(null)
  const pausedRef = React.useRef(false)
  const posRef = React.useRef(0)

  React.useEffect(function() {
    const row = rowRef.current
    if (!row) return
    const CARD_W = 158
    const totalW = count * CARD_W

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
  }, [count])

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={function() { pausedRef.current = true; posRef.current = Math.max(0, posRef.current - 300); if(rowRef.current) rowRef.current.scrollLeft = posRef.current; setTimeout(function(){ pausedRef.current = false }, 1500) }}
        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ‹
      </button>
      <div ref={rowRef}
        style={{ display: 'flex', gap: '8px', overflowX: 'scroll', paddingBottom: '4px', paddingLeft: '32px', paddingRight: '32px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={function() { pausedRef.current = true }}
        onMouseLeave={function() { pausedRef.current = false }}
        onTouchStart={function() { pausedRef.current = true }}
        onTouchEnd={function() { setTimeout(function(){ pausedRef.current = false }, 2000) }}
      >
        {children}
        {children}
      </div>
      <button onClick={function() { pausedRef.current = true; posRef.current += 300; if(rowRef.current) rowRef.current.scrollLeft = posRef.current; setTimeout(function(){ pausedRef.current = false }, 1500) }}
        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ›
      </button>
    </div>
  )
}

export default function Home() {
  const { user, balance } = useStore()
  const navigate = useNavigate()
  const [liveGames, setLiveGames] = useState([])
  const [launching, setLaunching] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(function() {
    api.get('/live-casino/games')
      .then(r => setLiveGames(r.data.games || []))
      .catch(() => {})
  }, [])

  async function launchGame(game) {
    if (!user) { toast.error('Please login to play!'); navigate('/login'); return }
    if (balance < 1) { toast.error('Insufficient balance!'); return }
    setLaunching(game.game_uid)
    try {
      const res = await api.post('/live-casino/launch', { game_uid: game.game_uid, language: 'hi', currency_code: 'INR' })
      if (res.data.success && res.data.gameUrl) {
        setModal(res.data.gameUrl)
      } else {
        toast.error(res.data.message || 'Launch failed')
      }
    } catch(e) {
      toast.error('Game launch failed')
    }
    setLaunching(null)
  }

  // Split live games into rows of 20
  const rows = []
  for (let i = 0; i < liveGames.length; i += 20) {
    rows.push(liveGames.slice(i, i + 20))
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Game iframe modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#0a0a0f', flexShrink: 0 }}>
            <span style={{ color: '#c9a227', fontFamily: 'Cinzel,serif', fontSize: '16px' }}>🎮 Live Game</span>
            <button onClick={() => setModal(null)}
              style={{ padding: '8px 20px', background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', borderRadius: '8px', color: '#ff6666', cursor: 'pointer', fontWeight: '700' }}>
              ✕ Exit Game
            </button>
          </div>
          <iframe src={modal} style={{ flex: 1, border: 'none' }} allow="autoplay; fullscreen" title="Live Game" />
        </div>
      )}

      {/* Welcome */}
      {user && (
        <div style={{ padding: '12px 16px', background: 'rgba(201,162,39,0.06)', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Welcome back</div>
            <div style={{ fontSize: '17px', fontWeight: '700' }}>{user.username} 👑</div>
          </div>
          <span style={{ color: '#c9a227', fontWeight: '700' }}>🪙 {balance?.toLocaleString() || 0}</span>
        </div>
      )}

      {/* Cricket Banner */}
      <CricketBanner onPlay={launchGame} launching={launching} />

      {/* LuckySport Live Cricket Embed */}
      {user && <LuckySportEmbed />}

      {/* 6 Featured Games — 3 per row 16:9 */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {FEATURED.map((g, i) => <FeaturedCard key={i} game={g} />)}
        </div>
      </section>
      {/* Live Casino Games rows */}
      {rows.map((row, idx) => (
        <section key={idx} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              background: (ROW_TAGS[idx] || ROW_TAGS[0]).color + '18',
              border: `1px solid ${(ROW_TAGS[idx] || ROW_TAGS[0]).color}44`,
              borderRadius: '20px',
              padding: '4px 14px',
              color: (ROW_TAGS[idx] || ROW_TAGS[0]).color,
              fontSize: '12px',
              fontWeight: '700',
            }}>
              {(ROW_TAGS[idx] || { label: `🎮 Games ${idx+1}` }).label}
            </span>
          </div>
          <AutoScrollRow count={row.length}>
            {row.map((g, i) => {
              const busy = launching === g.game_uid
              return (
                <div key={i} onClick={() => !busy && launchGame(g)}
                  style={{ flexShrink: 0, width: '150px', background: '#1a1a28', borderRadius: '10px', overflow: 'hidden', cursor: busy ? 'wait' : 'pointer', transition: 'transform 0.2s', opacity: busy ? 0.7 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  {g.img ? (
                    <img src={g.img} alt={g.name} style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.style.display='none' }}
                    />
                  ) : (
                    <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', background: '#222' }}>🎰</div>
                  )}
                  <div style={{ padding: '5px 7px', fontSize: '10px', color: '#bbb', fontWeight: '600', lineHeight: 1.3 }}>
                    {busy ? '⏳ Loading...' : g.name}
                  </div>
                </div>
              )
            })}
          </AutoScrollRow>
        </section>
      ))}

      {/* Remaining Platform Games */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ background: '#c9a22718', border: '1px solid #c9a22744', borderRadius: '20px', padding: '4px 14px', color: '#c9a227', fontSize: '12px', fontWeight: '700' }}>
            🎮 More Games
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {EXTRA_GAMES.map((g, i) => (
            <Link key={i} to={g.path} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: '150px', background: '#1a1a28', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', background: g.color + '22' }}>
                  {g.icon}
                </div>
                <div style={{ padding: '5px 7px', fontSize: '10px', color: '#bbb', fontWeight: '600', lineHeight: 1.3 }}>{g.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hero for non-logged in */}
      {!user && (
        <div style={{ textAlign: 'center', padding: '32px 16px', background: 'rgba(201,162,39,0.05)', borderRadius: '14px', marginTop: '16px' }}>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(24px,5vw,40px)', marginBottom: '10px' }}>
            <span className="gold-text">Royal Bet</span> Casino
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>248+ Live Games • Instant Payouts</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/signup"><button className="btn-gold" style={{ padding: '12px 28px' }}>Get 1000 Free Coins 🎁</button></Link>
            <Link to="/login"><button style={{ padding: '12px 28px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#aaa', cursor: 'pointer', fontSize: '14px' }}>Login</button></Link>
          </div>
        </div>
      )}

    </div>
  )
}
