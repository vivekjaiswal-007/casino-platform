import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api, loginUser, isLoggedIn } from '../api'
import toast from 'react-hot-toast'

export default function Login({ config }) {
  const { title, color, icon, role } = config
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isLoggedIn(role)) { navigate(from, { replace: true }); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!emailOrPhone || !password) return toast.error('Enter email/phone and password')
    setLoading(true)
    try {
      const { data } = await api.post('/hierarchy/login', { emailOrPhone, password, expectedRole: role })
      loginUser(data.token, data.user)
      toast.success(`Welcome, ${data.user.username}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  const IS = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${color}44`,
    borderRadius: '8px', color: 'white', fontSize: '16px', outline: 'none'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', backgroundImage: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 60%)`, padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', background: `linear-gradient(135deg, ${color}, ${color}88)`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 12px', boxShadow: `0 6px 24px ${color}44` }}>{icon}</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: '700', color }}>{title}</h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>RoyalBet Casino Platform</p>
        </div>

        <div style={{ background: '#16161f', border: `1px solid ${color}25`, borderRadius: '16px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email or Phone</label>
              <input
                type="text" value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                required placeholder="your@email.com or 9876543210"
                style={IS}
                onFocus={e => e.target.style.borderColor = color}
                onBlur={e => e.target.style.borderColor = `${color}44`}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#777', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="Your password"
                  style={{ ...IS, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = color}
                  onBlur={e => e.target.style.borderColor = `${color}44`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg, ${color}, ${color}aa)`, border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
              {loading ? '⏳ Logging in...' : `${icon} Login to ${title}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
