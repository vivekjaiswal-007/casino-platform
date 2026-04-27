import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../App'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('admin@royalbet.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ username: 'admin', email: 'admin@royalbet.com', password: 'admin123', secret: 'admin_panel_secret_key' })
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  // If already logged in, redirect
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const user = localStorage.getItem('admin_user')
    if (token && user) {
      try {
        const u = JSON.parse(user)
        if (u.role === 'admin') navigate(from, { replace: true })
      } catch {}
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Enter email and password')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { emailOrPhone: email, password })

      if (!data.user || data.user.role !== 'admin') {
        toast.error('❌ This account does not have admin access.')
        setLoading(false)
        return
      }

      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      toast.success(`✅ Welcome back, ${data.user.username}!`)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check credentials.'
      toast.error(`❌ ${msg}`)
    }
    setLoading(false)
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await api.post('/admin/create', {
        username: createForm.username,
        email: createForm.email,
        password: createForm.password,
        adminSecret: createForm.secret
      })
      toast.success(`✅ Admin account created! Now login.`)
      setShowCreate(false)
      setEmail(createForm.email)
      setPassword(createForm.password)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create admin'
      toast.error(`❌ ${msg}`)
    }
    setCreating(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.1) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg,#c9a227,#f0c84a)',
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(201,162,39,0.3)'
          }}>♠</div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: '24px', fontWeight: '700', color: '#c9a227' }}>
            RoyalBet Admin
          </h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>Casino Management Panel</p>
        </div>

        {/* Login Form */}
        {!showCreate ? (
          <div style={{
            background: '#16161f', border: '1px solid rgba(201,162,39,0.2)',
            borderRadius: '16px', padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
              Admin Login
            </h2>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#888', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Admin Email
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  required placeholder="admin@royalbet.com"
                  autoComplete="email"
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: '#1e1e2a', border: '1px solid #2a2a3a',
                    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#c9a227'}
                  onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#888', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Password
                </label>
                <input
                  type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="Enter admin password"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: '#1e1e2a', border: '1px solid #2a2a3a',
                    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#c9a227'}
                  onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px', marginTop: '4px',
                  background: loading ? 'rgba(201,162,39,0.3)' : 'linear-gradient(135deg,#c9a227,#f0c84a)',
                  border: 'none', borderRadius: '8px',
                  color: loading ? 'rgba(0,0,0,0.4)' : '#0a0a0f',
                  fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                {loading ? 'Logging in...' : '🔐 Login'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: '#2a2a3a' }} />
              <span style={{ color: '#444', fontSize: '12px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#2a2a3a' }} />
            </div>

            <button
              onClick={() => setShowCreate(true)}
              style={{
                width: '100%', padding: '11px',
                background: 'rgba(153,68,255,0.1)', border: '1px solid rgba(153,68,255,0.3)',
                borderRadius: '8px', color: '#9944ff', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              ➕ Create New Admin Account
            </button>

            {/* Help box */}
            <div style={{
              marginTop: '16px', padding: '12px', background: 'rgba(201,162,39,0.05)',
              borderRadius: '8px', border: '1px solid rgba(201,162,39,0.1)'
            }}>
              <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', marginBottom: '4px' }}>
                Default credentials:
              </p>
              <p style={{ color: '#888', fontSize: '12px', textAlign: 'center', fontFamily: 'monospace' }}>
                admin@royalbet.com / admin123
              </p>
            </div>
          </div>
        ) : (
          /* Create Admin Form */
          <div style={{
            background: '#16161f', border: '1px solid rgba(153,68,255,0.3)',
            borderRadius: '16px', padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <button onClick={() => setShowCreate(false)} style={{
                background: '#1e1e2a', border: '1px solid #2a2a3a', color: '#888',
                borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer'
              }}>← Back</button>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>Create Admin Account</h2>
            </div>

            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Username', key: 'username', type: 'text', placeholder: 'admin' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'admin@royalbet.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Strong password' },
                { label: 'Admin Secret Key', key: 'secret', type: 'text', placeholder: 'admin_panel_secret_key' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', color: '#888', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {label}
                  </label>
                  <input
                    type={type} value={createForm[key]}
                    onChange={e => setCreateForm(prev => ({ ...prev, [key]: e.target.value }))}
                    required placeholder={placeholder}
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: '#1e1e2a', border: '1px solid #2a2a3a',
                      borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#9944ff'}
                    onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                  />
                </div>
              ))}

              <div style={{ padding: '10px', background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.15)', borderRadius: '8px', fontSize: '12px', color: '#aaa88888' }}>
                ⚠️ Default secret key: <code style={{ color: '#c9a227' }}>admin_panel_secret_key</code><br/>
                Change in backend/.env: <code style={{ color: '#c9a227' }}>ADMIN_SECRET=your_key</code>
              </div>

              <button type="submit" disabled={creating} style={{
                width: '100%', padding: '13px',
                background: creating ? 'rgba(153,68,255,0.3)' : 'linear-gradient(135deg,#9944ff,#7722cc)',
                border: 'none', borderRadius: '8px', color: 'white',
                fontSize: '15px', fontWeight: '800', cursor: creating ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {creating ? 'Creating...' : '✅ Create Admin Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
