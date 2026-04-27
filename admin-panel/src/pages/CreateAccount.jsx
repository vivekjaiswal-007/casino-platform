import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../App'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'supermaster', label: '👑 Supermaster', color: '#9944ff', desc: 'Top-level manager' },
  { id: 'master',      label: '⭐ Master',      color: '#4488ff', desc: 'Regional manager' },
  { id: 'agent',       label: '🎯 Agent',       color: '#00d084', desc: 'Local dealer' },
  { id: 'user',        label: '👤 User',         color: '#c9a227', desc: 'Player account' },
]

export default function CreateAccount() {
  const navigate = useNavigate()
  const [role, setRole] = useState('user')
  const [form, setForm] = useState({ username: '', emailOrPhone: '', password: '', commissionRate: 0, initialBalance: 0 })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const selected = ROLES.find(r => r.id === role)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim()) return toast.error('Username required')
    if (!form.emailOrPhone.trim()) return toast.error('Email or phone required')
    if (form.password.length < 6) return toast.error('Password min 6 characters')

    setLoading(true)
    try {
      const { data } = await api.post('/hierarchy/create', {
        username: form.username.trim(),
        emailOrPhone: form.emailOrPhone.trim(),
        password: form.password,
        role,
        commissionRate: Number(form.commissionRate),
        initialBalance: Number(form.initialBalance),
      })
      toast.success(data.message || `${role} created!`)
      if (role === 'user') navigate('/users')
      else navigate('/users')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account')
    }
    setLoading(false)
  }

  const IS = {
    width: '100%', padding: '11px 14px',
    background: '#1e1e2a', border: '1px solid #2a2a3a',
    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none'
  }
  const LB = { display: 'block', color: '#888', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }
  const fo = c => e => e.target.style.borderColor = c
  const bl = e => e.target.style.borderColor = '#2a2a3a'

  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,24px)', color: '#c9a227', marginBottom: '4px' }}>
          ➕ Create Account
        </h1>
        <p style={{ color: '#555', fontSize: '13px' }}>Create supermaster, master, agent, or user accounts</p>
      </div>

      {/* Role selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {ROLES.map(r => (
          <button key={r.id} type="button" onClick={() => setRole(r.id)}
            style={{ padding: '14px 10px', borderRadius: '10px', border: `2px solid ${role === r.id ? r.color : '#2a2a3a'}`, background: role === r.id ? `${r.color}15` : '#16161f', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{r.label.split(' ')[0]}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: role === r.id ? r.color : '#888' }}>{r.label.split(' ').slice(1).join(' ')}</div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{r.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '540px', background: '#16161f', border: `1px solid ${selected.color}22`, borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '10px 14px', background: `${selected.color}10`, border: `1px solid ${selected.color}22`, borderRadius: '8px' }}>
          <span style={{ fontSize: '20px' }}>{selected.label.split(' ')[0]}</span>
          <div>
            <div style={{ fontWeight: '700', color: selected.color, fontSize: '14px' }}>{selected.label}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>{selected.desc}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={LB}>Username</label>
            <input type="text" value={form.username} onChange={e => set('username', e.target.value)}
              required placeholder="e.g. master_mumbai" style={IS}
              onFocus={fo(selected.color)} onBlur={bl} />
          </div>

          <div>
            <label style={LB}>Email or Mobile Number</label>
            <input type="text" value={form.emailOrPhone} onChange={e => set('emailOrPhone', e.target.value)}
              required placeholder="email@domain.com  or  9876543210" style={IS}
              onFocus={fo(selected.color)} onBlur={bl} />
          </div>

          <div>
            <label style={LB}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)}
                required placeholder="Min 6 characters"
                style={{ ...IS, paddingRight: '44px' }}
                onFocus={fo(selected.color)} onBlur={bl} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {role !== 'user' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={LB}>Commission Rate (%)</label>
                <input type="number" value={form.commissionRate}
                  onChange={e => set('commissionRate', Math.max(0, Math.min(100, Number(e.target.value))))}
                  min="0" max="100" step="0.5" style={IS}
                  onFocus={fo(selected.color)} onBlur={bl} />
                <p style={{ color: '#444', fontSize: '10px', marginTop: '3px' }}>% of downline losses</p>
              </div>
              <div>
                <label style={LB}>Initial Balance 🪙</label>
                <input type="number" value={form.initialBalance}
                  onChange={e => set('initialBalance', Math.max(0, Number(e.target.value)))}
                  min="0" style={IS}
                  onFocus={fo(selected.color)} onBlur={bl} />
                <p style={{ color: '#444', fontSize: '10px', marginTop: '3px' }}>Starting coins</p>
              </div>
            </div>
          )}

          {role === 'user' && (
            <div>
              <label style={LB}>Initial Balance 🪙</label>
              <input type="number" value={form.initialBalance}
                onChange={e => set('initialBalance', Math.max(0, Number(e.target.value)))}
                min="0" style={IS}
                onFocus={fo(selected.color)} onBlur={bl} />
              <p style={{ color: '#444', fontSize: '10px', marginTop: '3px' }}>0 = default welcome bonus</p>
            </div>
          )}

          <div style={{ padding: '12px 14px', background: `${selected.color}0d`, border: `1px solid ${selected.color}20`, borderRadius: '8px', fontSize: '13px', color: '#777' }}>
            Creating: <strong style={{ color: selected.color }}>{selected.label}</strong>
            {role !== 'user' && <> &mdash; Commission: <strong style={{ color: selected.color }}>{form.commissionRate}%</strong></>}
            &mdash; Balance: <strong style={{ color: selected.color }}>🪙 {Number(form.initialBalance).toLocaleString()}</strong>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? `${selected.color}44` : `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Creating...' : `✅ Create ${selected.label}`}
          </button>
        </form>
      </div>
    </div>
  )
}
