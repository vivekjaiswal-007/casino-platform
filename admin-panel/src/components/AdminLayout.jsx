import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/bets', label: 'Bets', icon: '🎲' },
  { path: '/withdrawals', label: 'Withdrawals', icon: '💸' },
  { path: '/create', label: 'Create Account', icon: '➕' },
    { path: '/game-control', label: 'Game Control', icon: '🎮' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => { setIsMobile(window.innerWidth < 768); if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const adminUser = (() => { try { return JSON.parse(localStorage.getItem('admin_user') || '{}') } catch { return {} } })()

  const logout = () => { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); navigate('/login') }

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const Sidebar = () => (
    <aside style={{
      width: '210px', background: '#0d0d18',
      borderRight: '1px solid rgba(201,162,39,0.12)',
      display: 'flex', flexDirection: 'column',
      position: isMobile ? 'fixed' : 'fixed',
      top: 0, left: isMobile ? (sidebarOpen ? 0 : '-220px') : 0,
      bottom: 0, zIndex: 200,
      transition: isMobile ? 'left 0.3s ease' : 'none',
      boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.5)' : 'none'
    }}>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#c9a227,#f0c84a)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>♠</div>
          <div>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: '13px', fontWeight: '700', color: '#c9a227' }}>RoyalBet</div>
            <div style={{ fontSize: '9px', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</div>
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>✕</button>
        )}
      </div>

      {/* Admin info */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#9a7a10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
            {adminUser.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#ccc' }}>{adminUser.username || 'Admin'}</div>
            <div style={{ fontSize: '9px', color: '#c9a227', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Administrator</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px', margin: '1px 6px', borderRadius: '8px',
                background: active ? 'rgba(201,162,39,0.12)' : 'transparent',
                borderLeft: `2px solid ${active ? '#c9a227' : 'transparent'}`,
                color: active ? '#c9a227' : '#7777aa',
                fontSize: '13px', fontWeight: active ? '600' : '400',
                transition: 'all 0.15s', cursor: 'pointer'
              }}>
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={logout} style={{ width: '100%', padding: '9px', borderRadius: '7px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.18)', color: '#ff6666', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Outfit',sans-serif" }}>
      <Sidebar />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }} />
      )}

      {/* Main */}
      <main style={{ flex: 1, marginLeft: isMobile ? 0 : '210px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile header */}
        {isMobile && (
          <div style={{ height: '52px', background: '#0d0d18', borderBottom: '1px solid rgba(201,162,39,0.12)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>☰</button>
            <span style={{ fontFamily: 'Cinzel,serif', color: '#c9a227', fontSize: '15px', fontWeight: '700' }}>RoyalBet Admin</span>
          </div>
        )}

        <div style={{ flex: 1, padding: isMobile ? '14px 12px' : '24px 28px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0f;color:#fff;font-family:'Outfit',sans-serif}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:#c9a227;border-radius:2px}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        a{text-decoration:none;color:inherit}
        button{cursor:pointer;font-family:'Outfit',sans-serif;border:none;outline:none}
        input,select{font-family:'Outfit',sans-serif;outline:none}
        table{width:100%;border-collapse:collapse}
        .ov-x{overflow-x:auto;-webkit-overflow-scrolling:touch}
        @media(max-width:480px){
          .hide-xs{display:none!important}
          th,td{padding:8px!important}
        }
      `}</style>
    </div>
  )
}
