import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getUser } from '../api'
import toast from 'react-hot-toast'

export default function CreateAccount({ config }) {
  const { color, canCreate } = config
  const navigate = useNavigate()
  const me = getUser()
  const [form, setForm] = useState({
    username: '', emailOrPhone: '', password: '',
    role: canCreate[0], commissionRate: 0, initialBalance: 0
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.emailOrPhone.trim() || !form.password) {
      return toast.error('All fields are required')
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.initialBalance > (me.balance || 0)) return toast.error('Insufficient balance to allocate')

    setLoading(true)
    try {
      const { data } = await api.post('/hierarchy/create', {
        username: form.username.trim(),
        emailOrPhone: form.emailOrPhone.trim(),
        password: form.password,
        role: form.role,
        commissionRate: Number(form.commissionRate),
        initialBalance: Number(form.initialBalance)
      })
      toast.success(data.message)
      navigate('/downline')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account')
    }
    setLoading(false)
  }

  const IS = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${color}28`,
    borderRadius: '8px', color: 'white', fontSize: '14px'
  }
  const LB = {
    display: 'block', color: '#777', fontSize: '11px',
    fontWeight: '600', marginBottom: '5px',
    textTransform: 'uppercase', letterSpacing: '0.5px'
  }
  const focus = (e) => { e.target.style.borderColor = color }
  const blur = (e) => { e.target.style.borderColor = `${color}28` }

  const roleLabels = { master: 'Master', agent: 'Agent', user: 'User', supermaster: 'Supermaster' }

  return (
    <div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(18px,4vw,22px)', color, marginBottom: '20px' }}>
        ➕ Create Account
      </h1>

      <div style={{ maxWidth: '520px' }}>
        <div style={{ background: '#16161f', border: `1px solid ${color}22`, borderRadius: '14px', padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Role selector */}
            <div>
              <label style={LB}>Account Type</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {canCreate.map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => set('role', r)}
                    style={{
                      padding: '7px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: '700',
                      background: form.role === r ? `${color}22` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${form.role === r ? color : 'rgba(255,255,255,0.08)'}`,
                      color: form.role === r ? color : '#666', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    {roleLabels[r] || r}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div>
              <label style={LB}>Username</label>
              <input type="text" value={form.username} onChange={e => set('username', e.target.value)}
                required placeholder="e.g. agent_mumbai" style={IS}
                onFocus={focus} onBlur={blur} />
              <div style={{ fontSize: '11px', color: '#444', marginTop: '3px' }}>3–20 chars, letters/numbers/underscore</div>
            </div>

            {/* Email/Phone */}
            <div>
              <label style={LB}>Email or Mobile Number</label>
              <input type="text" value={form.emailOrPhone} onChange={e => set('emailOrPhone', e.target.value)}
                required placeholder="email@domain.com  or  9876543210" style={IS}
                onFocus={focus} onBlur={blur} />
            </div>

            {/* Password */}
            <div>
              <label style={LB}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required placeholder="Min 6 characters"
                  style={{ ...IS, paddingRight: '44px' }}
                  onFocus={focus} onBlur={blur} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '15px' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Commission + Balance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={LB}>Commission Rate (%)</label>
                <input type="number" value={form.commissionRate}
                  onChange={e => set('commissionRate', Math.max(0, Math.min(100, Number(e.target.value))))}
                  min="0" max="100" step="0.5" style={IS}
                  onFocus={focus} onBlur={blur} />
                <div style={{ fontSize: '10px', color: '#444', marginTop: '3px' }}>% of downline losses</div>
              </div>
              <div>
                <label style={LB}>Initial Balance 🪙</label>
                <input type="number" value={form.initialBalance}
                  onChange={e => set('initialBalance', Math.max(0, Number(e.target.value)))}
                  min="0" style={IS}
                  onFocus={focus} onBlur={blur} />
                <div style={{ fontSize: '10px', color: '#444', marginTop: '3px' }}>From your balance</div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '12px 14px', background: `${color}0d`, border: `1px solid ${color}22`, borderRadius: '8px', fontSize: '13px', color: '#888' }}>
              Creating: <strong style={{ color }}>{roleLabels[form.role]}</strong> account &mdash;
              Commission: <strong style={{ color }}>{form.commissionRate}%</strong> &mdash;
              Coins: <strong style={{ color }}>🪙 {Number(form.initialBalance).toLocaleString()}</strong>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? `${color}55` : `linear-gradient(135deg, ${color}, ${color}99)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Creating...' : `✅ Create ${roleLabels[form.role] || form.role} Account`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
