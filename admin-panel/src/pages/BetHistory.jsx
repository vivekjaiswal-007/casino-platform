import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../App'

const GAMES = ['all','aviator','crash-rocket','color-prediction','roulette','blackjack',
  'baccarat','teen-patti','andar-bahar','poker','slots','dragon-tiger',
  'sic-bo','dice','lucky-wheel','mines','plinko','chicken-road','tower','hi-lo','spin-win']

const COLORS = { aviator:'#ff4444','crash-rocket':'#9944ff',roulette:'#00d084',
  blackjack:'#4488ff',slots:'#ff9900','teen-patti':'#c9a227','color-prediction':'#ff4488',
  mines:'#00d084',plinko:'#4488ff',tower:'#9944ff',dice:'#00d084','lucky-wheel':'#c9a227',
  'hi-lo':'#4488ff','spin-win':'#ff4488','chicken-road':'#ff9900','sic-bo':'#9944ff' }

export default function BetHistory() {
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [game, setGame] = useState('all')
  const [wagered, setWagered] = useState(0)
  const [payout, setPayout] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, limit: 30 })
      if (game !== 'all') params.set('game', game)
      const { data } = await api.get(`/admin/bets?${params}`)
      const betList = data.bets || []
      setBets(betList)
      setPagination(data.pagination || { total: betList.length, pages: 1 })
      setWagered(betList.reduce((s, b) => s + (b.betAmount || 0), 0))
      setPayout(betList.reduce((s, b) => s + (b.payout || 0), 0))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bet history')
      setBets([])
    }
    setLoading(false)
  }, [page, game])

  useEffect(() => { load() }, [load])

  const S = {
    card: { background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '12px', overflow: 'hidden' },
    th: { padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.02)' },
    td: { padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.025)' },
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,22px)', color: '#c9a227', marginBottom: '3px' }}>
          🎲 Bet History
        </h1>
        <p style={{ color: '#555', fontSize: '12px' }}>
          All game bets — {pagination.total?.toLocaleString() || 0} total
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '8px', marginBottom: '16px', color: '#ff6666', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button onClick={load} style={{ padding: '4px 12px', background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '6px', color: '#ff6666', cursor: 'pointer', fontSize: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { l: 'Page Bets', v: bets.length, c: '#4488ff', i: '🎲' },
          { l: 'Wagered', v: `🪙${wagered.toLocaleString()}`, c: '#c9a227', i: '📤' },
          { l: 'Payout', v: `🪙${payout.toLocaleString()}`, c: '#00d084', i: '📥' },
          { l: 'House Edge', v: wagered > 0 ? `${(((wagered - payout) / wagered) * 100).toFixed(1)}%` : '—', c: '#ff4488', i: '💰' },
        ].map(s => (
          <div key={s.l} style={{ background: '#16161f', border: `1px solid ${s.c}20`, borderLeft: `3px solid ${s.c}`, borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</span>
              <span style={{ fontSize: '14px' }}>{s.i}</span>
            </div>
            <div style={{ fontSize: 'clamp(14px,2.5vw,18px)', fontWeight: '900', color: 'white' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Game filter */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
        {GAMES.map(g => {
          const col = COLORS[g] || '#c9a227'
          return (
            <button key={g} onClick={() => { setGame(g); setPage(1) }} style={{
              padding: '5px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
              background: game === g ? `${col}22` : '#16161f',
              border: `1px solid ${game === g ? col : '#2a2a3a'}`,
              color: game === g ? col : '#666', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              textTransform: 'capitalize'
            }}>
              {g === 'all' ? '🎮 All' : g.replace(/-/g, ' ')}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={S.card}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #2a2a3a', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#555', fontSize: '13px' }}>Loading bets...</p>
          </div>
        ) : bets.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎲</div>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '4px' }}>
              {game !== 'all' ? `No bets found for ${game.replace(/-/g, ' ')}` : 'No bets yet'}
            </p>
            <p style={{ color: '#444', fontSize: '12px' }}>
              {game !== 'all' ? 'Try selecting a different game' : 'Players haven\'t started betting'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ minWidth: '560px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['User', 'Game', 'Bet Amount', 'Payout', 'P&L', 'Status', 'Date'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bets.map((bet, i) => {
                  const col = COLORS[bet.game] || '#888'
                  const isWin = bet.status === 'won'
                  const pnl = isWin ? ((bet.payout || 0) - (bet.betAmount || 0)) : -(bet.betAmount || 0)
                  return (
                    <tr key={bet._id || i} style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `hsl(${((bet.userId?.username || 'u').charCodeAt(0)) * 7},50%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                            {(bet.userId?.username || '?')[0].toUpperCase()}
                          </div>
                          <span style={{ color: '#ccc', fontSize: '12px' }}>{bet.userId?.username || '—'}</span>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: `${col}18`, color: col, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                          {bet.game?.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td style={{ ...S.td, color: '#c9a227', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        🪙 {(bet.betAmount || 0).toLocaleString()}
                      </td>
                      <td style={{ ...S.td, color: isWin ? '#00d084' : '#555', whiteSpace: 'nowrap' }}>
                        {isWin ? `🪙 ${(bet.payout || 0).toLocaleString()}` : '—'}
                      </td>
                      <td style={{ ...S.td, color: pnl >= 0 ? '#00d084' : '#ff4444', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} 🪙
                      </td>
                      <td style={S.td}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700',
                          background: isWin ? 'rgba(0,208,132,0.15)' : bet.status === 'pending' ? 'rgba(201,162,39,0.15)' : 'rgba(255,68,68,0.15)',
                          color: isWin ? '#00d084' : bet.status === 'pending' ? '#c9a227' : '#ff4444'
                        }}>
                          {(bet.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ ...S.td, fontSize: '11px', color: '#444', whiteSpace: 'nowrap' }}>
                        {bet.createdAt ? new Date(bet.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#16161f', border: '1px solid #2a2a3a', color: '#888', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: page === 1 ? 0.5 : 1 }}>
            ← Prev
          </button>
          {[...Array(Math.min(pagination.pages, 7))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
              background: page === i + 1 ? 'rgba(201,162,39,0.2)' : '#16161f',
              border: `1px solid ${page === i + 1 ? '#c9a227' : '#2a2a3a'}`,
              color: page === i + 1 ? '#c9a227' : '#888', cursor: 'pointer'
            }}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#16161f', border: '1px solid #2a2a3a', color: '#888', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: page === pagination.pages ? 0.5 : 1 }}>
            Next →
          </button>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
