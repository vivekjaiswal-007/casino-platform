import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import toast from 'react-hot-toast'

export default function UserDetail({ config }) {
  const { color } = config
  const { id } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState(null)
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPw, setNewPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [commission, setCommission] = useState(0)
  const [transferAmt, setTransferAmt] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    api.get(`/hierarchy/downline/${id}`)
      .then(r => {
        setUserData(r.data.user)
        setStats(r.data.stats)
        setBets(r.data.bets || [])
        setCommission(r.data.user?.commissionRate || 0)
        setLoading(false)
      })
      .catch(() => {
        toast.error('User not found')
        navigate('/downline')
      })
  }, [id])

  const doAction = async (action, body) => {
    setBusy(true)
    try {
      let res
      if (action === 'password') res = await api.post(`/hierarchy/downline/${id}/change-password`, body)
      else if (action === 'commission') res = await api.post(`/hierarchy/downline/${id}/commission`, body)
      else if (action === 'block') res = await api.patch(`/hierarchy/downline/${id}/block`)
      else if (action === 'transfer') res = await api.post('/hierarchy/wallet/transfer', { userId: id, ...body })
      else if (action === 'reclaim') res = await api.post('/hierarchy/wallet/reclaim', { userId: id, ...body })

      toast.success(res.data.message || 'Done!')
      // Update local state
      if (action === 'block') setUserData(p => ({ ...p, isBlocked: res.data.isBlocked }))
      if (action === 'commission') setUserData(p => ({ ...p, commissionRate: body.commissionRate }))
      if (action === 'transfer') { setUserData(p => ({ ...p, balance: (p.balance || 0) + Number(body.amount) })); setTransferAmt('') }
      if (action === 'reclaim') { setUserData(p => ({ ...p, balance: Math.max(0, (p.balance || 0) - Number(body.amount)) })); setTransferAmt('') }
      if (action === 'password') setNewPw('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
    setBusy(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: '36px', height: '36px', border: `3px solid #2a2a3a`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!userData) return null

  const IS = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25`, borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }
  const fo = e => e.target.style.borderColor = color
  const bl = e => e.target.style.borderColor = `${color}25`
  const ROLE_COLOR = { supermaster: '#9944ff', master: '#4488ff', agent: '#00d084', user: '#c9a227' }
  const rc = ROLE_COLOR[userData.role] || '#888'

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/downline')}
          style={{ padding: '7px 14px', borderRadius: '7px', background: '#16161f', border: '1px solid #2a2a3a', color: '#888', cursor: 'pointer', fontSize: '12px' }}>
          ← Back
        </button>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `hsl(${userData.username.charCodeAt(0) * 7 % 360}, 50%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800' }}>
          {userData.username[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(16px,3vw,20px)', color, marginBottom: '2px' }}>
            {userData.username}
          </h1>
          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: `${rc}18`, color: rc, textTransform: 'capitalize', marginRight: '6px' }}>
            {userData.role}
          </span>
          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: userData.isBlocked ? 'rgba(255,68,68,0.15)' : 'rgba(0,208,132,0.15)', color: userData.isBlocked ? '#ff4444' : '#00d084' }}>
            {userData.isBlocked ? 'BLOCKED' : 'ACTIVE'}
          </span>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#c9a227' }}>🪙 {(userData.balance || 0).toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: '#555' }}>Current Balance</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '18px', borderBottom: '1px solid #2a2a3a', overflowX: 'auto' }}>
        {['profile', 'actions', 'bets'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? color : 'transparent'}`, color: activeTab === tab ? color : '#666', fontWeight: activeTab === tab ? '700' : '400', fontSize: '13px', cursor: 'pointer', marginBottom: '-1px', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#16161f', border: `1px solid ${color}22`, borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ color, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Profile Info</h3>
            {[
              ['Email', userData.email || '—'],
              ['Phone', userData.phone || '—'],
              ['Role', userData.role],
              ['Balance', `🪙 ${(userData.balance || 0).toLocaleString()}`],
              ['Commission Rate', `${userData.commissionRate || 0}%`],
              ['Joined', userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN') : '—'],
              ['Last Login', userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString('en-IN') : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', gap: '8px' }}>
                <span style={{ color: '#666', flexShrink: 0 }}>{l}</span>
                <span style={{ color: '#ccc', fontWeight: '500', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ color, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Betting Stats</h3>
            {[
              ['Total Bets', stats?.totalBets || 0, '#4488ff'],
              ['Total Wagered', `🪙 ${(stats?.totalWagered || 0).toLocaleString()}`, '#c9a227'],
              ['Total Payout', `🪙 ${(stats?.totalPayout || 0).toLocaleString()}`, '#00d084'],
              ['Net P&L', `${stats?.netPL >= 0 ? '+' : ''}${(stats?.netPL || 0).toLocaleString()} 🪙`, stats?.netPL >= 0 ? '#00d084' : '#ff4444'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                <span style={{ color: '#666' }}>{l}</span>
                <span style={{ color: c, fontWeight: '700' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Wallet */}
          <div style={{ background: '#16161f', border: `1px solid ${color}22`, borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ color, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Wallet Actions</h3>
            <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount (🪙 Coins)</label>
            <input type="number" value={transferAmt} onChange={e => setTransferAmt(e.target.value)}
              placeholder="Enter amount" min="1" style={{ ...IS, marginBottom: '10px' }} onFocus={fo} onBlur={bl} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button onClick={() => transferAmt && doAction('transfer', { amount: Number(transferAmt) })} disabled={busy || !transferAmt}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.3)', color: '#00d084', fontWeight: '700', fontSize: '13px', cursor: busy || !transferAmt ? 'not-allowed' : 'pointer', opacity: busy || !transferAmt ? 0.5 : 1 }}>
                ➕ Add Coins
              </button>
              <button onClick={() => transferAmt && doAction('reclaim', { amount: Number(transferAmt) })} disabled={busy || !transferAmt}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontWeight: '700', fontSize: '13px', cursor: busy || !transferAmt ? 'not-allowed' : 'pointer', opacity: busy || !transferAmt ? 0.5 : 1 }}>
                ➖ Remove
              </button>
            </div>

            {/* Commission */}
            <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Commission Rate (%)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="number" value={commission} onChange={e => setCommission(Math.max(0, Math.min(100, Number(e.target.value))))}
                min="0" max="100" step="0.5" style={{ ...IS, flex: 1 }} onFocus={fo} onBlur={bl} />
              <button onClick={() => doAction('commission', { commissionRate: commission })} disabled={busy}
                style={{ padding: '10px 16px', borderRadius: '8px', background: `${color}18`, border: `1px solid ${color}35`, color, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                Save
              </button>
            </div>

            {/* Password */}
            <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Change Password</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="New password (min 6)" style={{ ...IS, paddingRight: '40px' }} onFocus={fo} onBlur={bl} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              <button onClick={() => newPw.length >= 6 && doAction('password', { newPassword: newPw })} disabled={busy || newPw.length < 6}
                style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(153,68,255,0.12)', border: '1px solid rgba(153,68,255,0.3)', color: '#9944ff', fontWeight: '700', fontSize: '14px', cursor: newPw.length < 6 ? 'not-allowed' : 'pointer', opacity: newPw.length < 6 ? 0.5 : 1 }}>
                🔐
              </button>
            </div>

            {/* Block */}
            <button onClick={() => doAction('block', {})} disabled={busy}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', background: userData.isBlocked ? 'rgba(0,208,132,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${userData.isBlocked ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, color: userData.isBlocked ? '#00d084' : '#ff4444' }}>
              {userData.isBlocked ? '✅ Unblock User' : '🚫 Block User'}
            </button>
          </div>
        </div>
      )}

      {/* Bets Tab */}
      {activeTab === 'bets' && (
        <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '12px', overflow: 'hidden' }}>
          {bets.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#444', fontSize: '13px' }}>No bets found 🎮</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '500px', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3a', background: 'rgba(255,255,255,0.02)' }}>
                    {['Game', 'Bet', 'Payout', 'Result', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                      <td style={{ padding: '10px 14px', fontSize: '13px', textTransform: 'capitalize', color: '#ccc' }}>{bet.game}</td>
                      <td style={{ padding: '10px 14px', fontSize: '13px', color: '#c9a227', fontWeight: '700' }}>🪙 {bet.betAmount}</td>
                      <td style={{ padding: '10px 14px', fontSize: '13px', color: '#00d084', fontWeight: '700' }}>{bet.payout > 0 ? `🪙 ${bet.payout}` : '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: bet.status === 'won' ? 'rgba(0,208,132,0.15)' : 'rgba(255,68,68,0.12)', color: bet.status === 'won' ? '#00d084' : '#ff4444' }}>
                          {bet.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '11px', color: '#444' }}>
                        {bet.createdAt ? new Date(bet.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
