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

export default function Signup() {
  const navigate = useNavigate()
  const { signup, isLoading } = useStore()
  const [username, setUsername] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone)
  const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone)
  const contactValid = isPhone || isEmail

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return toast.error('Enter a username')
    if (!contactValid) return toast.error('Enter valid email or 10-digit mobile number')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    const res = await signup(username.trim(), emailOrPhone.trim(), password)
    if (res.success) {
      toast.success('🎉 Account created! 1000 free coins added!')
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#c9a227,#f0c84a)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 10px', boxShadow: '0 6px 20px rgba(201,162,39,0.3)', color: '#0a0a0f', fontWeight: '900' }}>♠</div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: '22px', fontWeight: '700' }} className="gold-text">Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}>
            Get <span style={{ color: 'var(--gold)', fontWeight: '700' }}>1,000 free coins</span> instantly!
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '26px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Username
              </label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="CasinoKing123" style={IS}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>3–20 chars, letters/numbers only</div>
            </div>

            {/* Email or Phone */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email or Mobile Number
              </label>
              <input type="text" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} required
                placeholder="your@email.com  or  9876543210"
                style={{ ...IS, borderColor: emailOrPhone && !contactValid ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = contactValid || !emailOrPhone ? 'var(--gold)' : 'var(--red)'}
                onBlur={e => e.target.style.borderColor = emailOrPhone && !contactValid ? 'var(--red)' : 'var(--border)'} />
              {emailOrPhone && !contactValid && (
                <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '3px' }}>⚠️ Enter valid email or 10-digit Indian mobile</div>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Min 6 characters" style={{ ...IS, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={isLoading || !contactValid}
              style={{ width: '100%', padding: '13px', fontSize: '15px', marginTop: '4px' }}>
              {isLoading ? '⏳ Creating...' : '🎮 Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Have an account? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: '600' }}>Login →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
