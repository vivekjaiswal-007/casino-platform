import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../store/useStore'
import toast from 'react-hot-toast'

const IS = {
  width: '100%', padding: '12px 14px',
  background: 'var(--bg-hover)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'white', fontSize: '16px', outline: 'none',
  transition: 'border-color 0.2s'
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!emailOrPhone.trim()) return toast.error('Enter your email or phone number')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', {
        emailOrPhone: emailOrPhone.trim(),
        newPassword
      })
      toast.success(data.message)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed. Check your email/phone.')
    }
    setLoading(false)
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
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#c9a227,#f0c84a)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 10px', color: '#0a0a0f' }}>🔑</div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: '20px', fontWeight: '700', color: 'var(--gold)' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Enter your registered email/phone and set a new password</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '26px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>✅</div>
              <div style={{ color: '#00d084', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Password Reset!</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Redirecting to login...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Registered Email or Phone
                </label>
                <input type="text" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} required
                  placeholder="your@email.com  or  9876543210"
                  style={IS}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                    placeholder="Min 6 characters"
                    style={{ ...IS, paddingRight: '44px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Confirm New Password
                </label>
                <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  placeholder="Repeat new password"
                  style={{ ...IS, borderColor: confirmPassword && newPassword !== confirmPassword ? 'var(--red)' : 'var(--border)' }}
                  onFocus={e => e.target.style.borderColor = confirmPassword && newPassword !== confirmPassword ? 'var(--red)' : 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = confirmPassword && newPassword !== confirmPassword ? 'var(--red)' : 'var(--border)'} />
                {confirmPassword && newPassword !== confirmPassword && (
                  <div style={{ fontSize: '11px', color: 'var(--red)', marginTop: '3px' }}>⚠️ Passwords do not match</div>
                )}
              </div>

              <button type="submit" className="btn-gold"
                disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                style={{ width: '100%', padding: '13px', fontSize: '15px', marginTop: '4px' }}>
                {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: '600' }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
