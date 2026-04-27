import React, { useState, useEffect } from 'react'
import { api } from '../App'
import toast from 'react-hot-toast'

const GAMES = [
  { id: 'aviator',      name: 'Aviator',          icon: '✈️',  isCrash: true  },
  { id: 'crashBall',    name: 'Crash Ball',        icon: '⚽',  isCrash: true  },
  { id: 'crashRocket',  name: 'Crash Rocket',      icon: '🚀',  isCrash: true  },
  { id: 'mines',        name: 'Mines',             icon: '💣',  isCrash: false },
  { id: 'plinko',       name: 'Plinko',            icon: '⚡',  isCrash: false },
  { id: 'dice',         name: 'Dice',              icon: '🎲',  isCrash: false },
  { id: 'hiLo',         name: 'Hi-Lo',             icon: '📈',  isCrash: false },
  { id: 'slots',        name: 'Slot Machine',      icon: '🎰',  isCrash: false },
  { id: 'roulette',     name: 'Roulette',          icon: '🎡',  isCrash: false },
  { id: 'blackjack',    name: 'Blackjack',         icon: '🃏',  isCrash: false },
  { id: 'baccarat',     name: 'Baccarat',          icon: '🎴',  isCrash: false },
  { id: 'teenPatti',    name: 'Teen Patti',        icon: '♠️',  isCrash: false },
  { id: 'colorPrediction', name: 'Color Prediction', icon: '🎨', isCrash: false },
  { id: 'luckyWheel',   name: 'Lucky Wheel',       icon: '🎡',  isCrash: false },
  { id: 'keno',         name: 'Keno',              icon: '🎱',  isCrash: false },
  { id: 'coinFlip',     name: 'Coin Flip',         icon: '🪙',  isCrash: false },
]

const DEFAULTS = {
  enabled: true, houseEdge: 3, minBet: 10, maxBet: 50000, maxMultiplier: 100,
  forcedCrashEnabled: false, forcedCrashAt: 0, forcedWinRate: 0
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: '46px', height: '26px', borderRadius: '13px', border: 'none', background: value ? '#00d084' : '#2a2a3a', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
    </button>
  )
}

function NumInput({ value, onChange, min, max, step = 1, suffix = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
        style={{ width: '90px', padding: '7px 8px', background: '#1e1e2a', border: '1px solid #2a2a3a', borderRadius: '7px', color: 'white', fontSize: '13px', fontWeight: '700', outline: 'none', textAlign: 'center' }}
        onFocus={e => e.target.style.borderColor = '#c9a227'}
        onBlur={e => e.target.style.borderColor = '#2a2a3a'} />
      {suffix && <span style={{ color: '#666', fontSize: '12px' }}>{suffix}</span>}
    </div>
  )
}

export default function GameControl() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState('aviator')

  useEffect(() => {
    api.get('/admin/game-settings')
      .then(r => { setSettings(r.data.settings || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const get = (gameId) => ({ ...DEFAULTS, ...(settings[gameId] || {}) })

  const set = (gameId, key, val) => {
    setSettings(prev => ({
      ...prev,
      [gameId]: { ...DEFAULTS, ...(prev[gameId] || {}), [key]: val }
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.post('/admin/game-settings', { settings })
      toast.success('✅ Game settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  const resetGame = (gameId) => {
    setSettings(prev => ({ ...prev, [gameId]: { ...DEFAULTS } }))
    toast.success(`${gameId} reset to defaults`)
  }

  const selGame = GAMES.find(g => g.id === selected)
  const selSettings = get(selected)

  const S = {
    label: { color: '#666', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'block' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    section: { background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '16px', marginBottom: '14px' },
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #2a2a3a', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,24px)', color: '#c9a227', marginBottom: '3px' }}>
            🎮 Game Control
          </h1>
          <p style={{ color: '#555', fontSize: '12px' }}>Control each game's behavior, odds, and limits</p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ padding: '10px 24px', background: saving ? 'rgba(201,162,39,0.25)' : 'linear-gradient(135deg,#c9a227,#f0c84a)', border: 'none', borderRadius: '9px', color: saving ? 'rgba(0,0,0,0.4)' : '#0a0a0f', fontWeight: '800', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? '⏳ Saving...' : '💾 Save All Changes'}
        </button>
      </div>

      {/* Quick overview - all games toggle */}
      <div style={S.section}>
        <div style={{ fontWeight: '700', color: '#ccc', fontSize: '13px', marginBottom: '12px' }}>Quick Enable / Disable</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
          {GAMES.map(game => {
            const gs = get(game.id)
            return (
              <div key={game.id} onClick={() => setSelected(game.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '9px', background: selected === game.id ? 'rgba(201,162,39,0.1)' : '#1a1a2a', border: `1px solid ${selected === game.id ? 'rgba(201,162,39,0.35)' : '#2a2a3a'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                  <span style={{ fontSize: '15px', flexShrink: 0 }}>{game.icon}</span>
                  <span style={{ fontSize: '12px', color: '#ccc', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.name}</span>
                </div>
                <Toggle value={gs.enabled} onChange={v => set(game.id, 'enabled', v)} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail editor */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Game selector */}
        <div>
          <div style={{ fontWeight: '700', color: '#ccc', fontSize: '13px', marginBottom: '10px' }}>Select Game to Edit</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '400px', overflowY: 'auto' }}>
            {GAMES.map(game => {
              const gs = get(game.id)
              return (
                <button key={game.id} onClick={() => setSelected(game.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '9px', border: `1px solid ${selected === game.id ? '#c9a227' : '#2a2a3a'}`, background: selected === game.id ? 'rgba(201,162,39,0.1)' : '#16161f', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '18px' }}>{game.icon}</span>
                  <span style={{ flex: 1, fontSize: '13px', color: '#ccc', fontWeight: '600' }}>{game.name}</span>
                  <span style={{ fontSize: '11px', color: gs.enabled ? '#00d084' : '#ff4444', fontWeight: '700' }}>
                    {gs.enabled ? 'ON' : 'OFF'}
                  </span>
                  {game.isCrash && gs.forcedCrashEnabled && (
                    <span style={{ fontSize: '10px', background: 'rgba(255,68,68,0.2)', color: '#ff4444', padding: '2px 6px', borderRadius: '4px' }}>FORCED</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Settings editor */}
        <div>
          {selGame && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '24px' }}>{selGame.icon}</span>
                <div>
                  <div style={{ fontWeight: '800', color: 'white', fontSize: '16px' }}>{selGame.name}</div>
                  <div style={{ fontSize: '11px', color: '#555' }}>Configure game behavior</div>
                </div>
                <button onClick={() => resetGame(selected)}
                  style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: '6px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontSize: '11px', cursor: 'pointer' }}>
                  Reset
                </button>
              </div>

              {/* Basic settings */}
              <div style={S.section}>
                <div style={{ fontWeight: '700', color: '#c9a227', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Basic Settings</div>

                <div style={S.row}>
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Game Enabled</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>Players can access this game</div>
                  </div>
                  <Toggle value={selSettings.enabled} onChange={v => set(selected, 'enabled', v)} />
                </div>

                <div style={S.row}>
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>House Edge</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>Casino profit percentage</div>
                  </div>
                  <NumInput value={selSettings.houseEdge} onChange={v => set(selected, 'houseEdge', Math.max(0, Math.min(50, v)))} min={0} max={50} step={0.5} suffix="%" />
                </div>

                <div style={S.row}>
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Min Bet</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>Minimum coins per bet</div>
                  </div>
                  <NumInput value={selSettings.minBet} onChange={v => set(selected, 'minBet', Math.max(1, v))} min={1} suffix="🪙" />
                </div>

                <div style={{ ...S.row, borderBottom: 'none' }}>
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Max Bet</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>Maximum coins per bet</div>
                  </div>
                  <NumInput value={selSettings.maxBet} onChange={v => set(selected, 'maxBet', Math.max(selSettings.minBet, v))} min={100} suffix="🪙" />
                </div>
              </div>

              {/* Crash game controls */}
              {selGame.isCrash && (
                <div style={{ ...S.section, border: '1px solid rgba(255,68,68,0.25)' }}>
                  <div style={{ fontWeight: '700', color: '#ff4444', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    🎯 Crash Control
                  </div>

                  <div style={S.row}>
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Max Multiplier</div>
                      <div style={{ color: '#555', fontSize: '11px' }}>Cap before auto crash</div>
                    </div>
                    <NumInput value={selSettings.maxMultiplier} onChange={v => set(selected, 'maxMultiplier', Math.max(2, v))} min={2} suffix="x" />
                  </div>

                  <div style={S.row}>
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Force Crash At</div>
                      <div style={{ color: '#555', fontSize: '11px' }}>Override next crash point</div>
                    </div>
                    <Toggle value={selSettings.forcedCrashEnabled || false} onChange={v => set(selected, 'forcedCrashEnabled', v)} />
                  </div>

                  {selSettings.forcedCrashEnabled && (
                    <div style={{ padding: '12px', background: 'rgba(255,68,68,0.08)', borderRadius: '8px', marginBottom: '8px' }}>
                      <label style={S.label}>Crash At Multiplier</label>
                      <NumInput value={selSettings.forcedCrashAt || 1.5} onChange={v => set(selected, 'forcedCrashAt', Math.max(1.01, v))} min={1.01} step={0.1} suffix="x" />
                      <div style={{ fontSize: '11px', color: '#ff6666', marginTop: '6px' }}>
                        ⚠️ Game will crash exactly at {selSettings.forcedCrashAt || 1.5}x every round
                      </div>
                    </div>
                  )}

                  <div style={{ ...S.row, borderBottom: 'none' }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Force Win Rate</div>
                      <div style={{ color: '#555', fontSize: '11px' }}>% rounds that reach 2x+</div>
                    </div>
                    <NumInput value={selSettings.forcedWinRate || 0} onChange={v => set(selected, 'forcedWinRate', Math.max(0, Math.min(95, v)))} min={0} max={95} suffix="%" />
                  </div>
                </div>
              )}

              {/* Win rate control for non-crash */}
              {!selGame.isCrash && (
                <div style={{ ...S.section, border: '1px solid rgba(201,162,39,0.2)' }}>
                  <div style={{ fontWeight: '700', color: '#c9a227', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    📊 Win Rate Control
                  </div>
                  <div style={S.row}>
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Forced Win Rate</div>
                      <div style={{ color: '#555', fontSize: '11px' }}>0 = natural odds, set % to override</div>
                    </div>
                    <NumInput value={selSettings.forcedWinRate || 0} onChange={v => set(selected, 'forcedWinRate', Math.max(0, Math.min(95, v)))} min={0} max={95} suffix="%" />
                  </div>
                  <div style={{ ...S.row, borderBottom: 'none' }}>
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Max Payout Per Bet</div>
                      <div style={{ color: '#555', fontSize: '11px' }}>Cap single win amount</div>
                    </div>
                    <NumInput value={selSettings.maxPayout || 100000} onChange={v => set(selected, 'maxPayout', Math.max(1000, v))} min={1000} suffix="🪙" />
                  </div>
                </div>
              )}

              {/* Live status */}
              <div style={{ padding: '12px 14px', background: selSettings.enabled ? 'rgba(0,208,132,0.06)' : 'rgba(255,68,68,0.06)', border: `1px solid ${selSettings.enabled ? 'rgba(0,208,132,0.2)' : 'rgba(255,68,68,0.2)'}`, borderRadius: '8px', fontSize: '12px', color: selSettings.enabled ? '#00d084' : '#ff4444' }}>
                {selSettings.enabled
                  ? `✅ ${selGame.name} is ACTIVE — House Edge: ${selSettings.houseEdge}% — Bets: 🪙${selSettings.minBet}–${selSettings.maxBet.toLocaleString()}`
                  : `⛔ ${selGame.name} is DISABLED — Players cannot access this game`
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: '8px', fontSize: '12px', color: '#888' }}>
        💡 <strong style={{ color: '#c9a227' }}>Tip:</strong> Changes take effect on next game round. Force Crash At overrides the random crash point for crash games.
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
