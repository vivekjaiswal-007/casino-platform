import React, { useState, useEffect } from 'react'
import { api, getUser } from '../api'
import toast from 'react-hot-toast'

export default function WalletTransfer({ config }) {
  const { color } = config
  const me = getUser()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [mode, setMode] = useState('transfer') // transfer | reclaim
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(true)
  const [myBalance, setMyBalance] = useState(me.balance || 0)

  useEffect(() => {
    api.get('/hierarchy/downline?limit=100')
      .then(r => { setUsers(r.data.users || []); setUsersLoading(false) })
      .catch(() => setUsersLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUser) return toast.error('Please select a user')
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount')

    setLoading(true)
    try {
      const endpoint = mode === 'transfer' ? '/hierarchy/wallet/transfer' : '/hierarchy/wallet/reclaim'
      const { data } = await api.post(endpoint, {
        userId: selectedUser._id,
        amount: Number(amount),
        note
      })
      toast.success(data.message)
      if (data.newBalance !== undefined) setMyBalance(data.newBalance)

      // Update user in list
      setUsers(prev => prev.map(u => {
        if (u._id === selectedUser._id) {
          return { ...u, balance: mode === 'transfer' ? (u.balance || 0) + Number(amount) : Math.max(0, (u.balance || 0) - Number(amount)) }
        }
        return u
      }))
      setSelectedUser(prev => prev ? { ...prev, balance: mode === 'transfer' ? (prev.balance || 0) + Number(amount) : Math.max(0, (prev.balance || 0) - Number(amount)) } : null)
      setAmount('')
      setNote('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed')
    }
    setLoading(false)
  }

  const IS = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${color}25`,
    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none'
  }
  const modeColor = mode === 'transfer' ? '#00d084' : '#ff4444'

  return (
    <div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(18px,4vw,22px)', color, marginBottom: '20px' }}>
        💸 Wallet Transfer
      </h1>

      {/* My balance */}
      <div style={{ padding: '14px 18px', background: `${color}10`, border: `1px solid ${color}22`, borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Balance</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color }}>🪙 {myBalance.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#555', textAlign: 'right' }}>
          <div>Total Downline: {users.length}</div>
          <div>Mode: <strong style={{ color: modeColor }}>{mode === 'transfer' ? 'Add to downline' : 'Reclaim from downline'}</strong></div>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setMode('transfer')}
          style={{ flex: 1, padding: '11px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', background: mode === 'transfer' ? 'rgba(0,208,132,0.15)' : '#16161f', border: `1px solid ${mode === 'transfer' ? 'rgba(0,208,132,0.4)' : '#2a2a3a'}`, color: mode === 'transfer' ? '#00d084' : '#666', cursor: 'pointer', transition: 'all 0.2s' }}>
          ➕ Add to Downline
        </button>
        <button onClick={() => setMode('reclaim')}
          style={{ flex: 1, padding: '11px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', background: mode === 'reclaim' ? 'rgba(255,68,68,0.12)' : '#16161f', border: `1px solid ${mode === 'reclaim' ? 'rgba(255,68,68,0.4)' : '#2a2a3a'}`, color: mode === 'reclaim' ? '#ff4444' : '#666', cursor: 'pointer', transition: 'all 0.2s' }}>
          ➖ Reclaim from Downline
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Transfer form */}
        <div style={{ background: '#16161f', border: `1px solid ${modeColor}22`, borderRadius: '14px', padding: '22px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select User</label>
              {usersLoading ? (
                <div style={{ padding: '12px', color: '#555', fontSize: '13px' }}>Loading...</div>
              ) : (
                <select
                  value={selectedUser?._id || ''}
                  onChange={e => setSelectedUser(users.find(u => u._id === e.target.value) || null)}
                  required
                  style={{ ...IS, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = modeColor}
                  onBlur={e => e.target.style.borderColor = `${color}25`}>
                  <option value="">-- Select from downline ({users.length}) --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.username} ({u.role}) — 🪙{(u.balance || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount (🪙 Coins)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                required min="1" placeholder="Enter coin amount"
                style={IS}
                onFocus={e => e.target.style.borderColor = modeColor}
                onBlur={e => e.target.style.borderColor = `${color}25`} />
              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '7px', flexWrap: 'wrap' }}>
                {[100, 500, 1000, 5000, 10000].map(a => (
                  <button key={a} type="button" onClick={() => setAmount(String(a))}
                    style={{ padding: '3px 10px', borderRadius: '5px', background: amount === String(a) ? `${modeColor}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${amount === String(a) ? modeColor : 'rgba(255,255,255,0.08)'}`, color: amount === String(a) ? modeColor : '#666', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Note (optional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Bonus, Recharge, Penalty..."
                style={IS}
                onFocus={e => e.target.style.borderColor = modeColor}
                onBlur={e => e.target.style.borderColor = `${color}25`} />
            </div>

            <button type="submit" disabled={loading || !selectedUser || !amount}
              style={{ width: '100%', padding: '13px', background: loading ? `${modeColor}44` : `linear-gradient(135deg, ${modeColor}, ${modeColor}99)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '800', cursor: loading || !selectedUser || !amount ? 'not-allowed' : 'pointer', opacity: loading || !selectedUser || !amount ? 0.6 : 1 }}>
              {loading ? '⏳ Processing...' : mode === 'transfer' ? `➕ Add 🪙${amount || '0'} to ${selectedUser?.username || 'user'}` : `➖ Reclaim 🪙${amount || '0'} from ${selectedUser?.username || 'user'}`}
            </button>
          </form>
        </div>

        {/* Selected user info */}
        {selectedUser && (
          <div style={{ background: '#16161f', border: `1px solid ${color}20`, borderRadius: '14px', padding: '22px' }}>
            <h3 style={{ color, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Selected User</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `hsl(${selectedUser.username.charCodeAt(0) * 7 % 360}, 50%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800' }}>
                {selectedUser.username[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ddd' }}>{selectedUser.username}</div>
                <div style={{ fontSize: '12px', color: '#555', textTransform: 'capitalize' }}>{selectedUser.role}</div>
              </div>
            </div>
            {[
              ['Current Balance', `🪙 ${(selectedUser.balance || 0).toLocaleString()}`, '#c9a227'],
              ['Commission Rate', `${selectedUser.commissionRate || 0}%`, color],
              ['Status', selectedUser.isBlocked ? '🔴 Blocked' : '🟢 Active', selectedUser.isBlocked ? '#ff4444' : '#00d084'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                <span style={{ color: '#666' }}>{l}</span>
                <span style={{ color: c, fontWeight: '700' }}>{v}</span>
              </div>
            ))}
            {amount && (
              <div style={{ marginTop: '16px', padding: '12px', background: `${modeColor}10`, border: `1px solid ${modeColor}25`, borderRadius: '8px', fontSize: '13px' }}>
                <div style={{ color: '#777', marginBottom: '4px', fontSize: '11px' }}>After transaction:</div>
                <div style={{ color: modeColor, fontWeight: '800', fontSize: '16px' }}>
                  🪙 {mode === 'transfer'
                    ? ((selectedUser.balance || 0) + Number(amount)).toLocaleString()
                    : Math.max(0, (selectedUser.balance || 0) - Number(amount)).toLocaleString()
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
