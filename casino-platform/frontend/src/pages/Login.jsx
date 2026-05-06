import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = {
  width: '100%', padding: '12px 14px',
  background: 'var(--bg-hover)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'white', fontSize: '16px', outline: 'none',
  transition: 'border-color 0.2s'
}

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useStore()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!emailOrPhone.trim()) return toast.error('Enter email or phone number')
    if (!password) return toast.error('Enter your password')

    const res = await login(emailOrPhone.trim(), password)
    if (res.success) {
      toast.success('Welcome back! 🎮')
      navigate('/')
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 65%)',
      padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#c9a227,#f0c84a)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 10px', boxShadow: '0 6px 20px rgba(201,162,39,0.3)', color: '#0a0a0f', fontWeight: '900' }}>♠</div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: '22px', fontWeight: '700' }} className="gold-text">New Mahadev Gaming</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}>Welcome back, player 🎮</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '26px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email or Mobile Number
              </label>
              <input type="text" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} required
                placeholder="your@email.com  or  9876543210"
                style={IS}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <Link to="/forgot-password" style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: '600' }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Your password"
                  style={{ ...IS, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={isLoading}
              style={{ width: '100%', padding: '13px', fontSize: '15px', marginTop: '4px' }}>
              {isLoading ? '⏳ Logging in...' : '🔐 Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            No account? <Link to="/signup" style={{ color: 'var(--gold)', fontWeight: '700' }}>Sign up free →</Link>
          </p>

          <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(201,162,39,0.05)', borderRadius: '8px', border: '1px solid rgba(201,162,39,0.1)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Demo: admin@newmahadevgaming.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
