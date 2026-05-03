import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../api'

export default function PanelLayout({ config }) {
  const { title, color, icon } = config
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const user = getUser()

  useEffect(() => {
    const h = () => { setIsMobile(window.innerWidth < 768); if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => setSidebarOpen(false), [location.pathname])

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/create', label: 'Create Account', icon: '➕' },
    { path: '/downline', label: 'My Downline', icon: '👥' },
    { path: '/wallet', label: 'Wallet Transfer', icon: '💸' },
  ]

  const isActive = (p) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)

  const S = {
    sidebar: {
      width: '210px', background: '#0d0d18',
      borderRight: `1px solid ${color}22`,
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
      transition: 'transform 0.28s ease',
      transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      boxShadow: isMobile && sidebarOpen ? '4px 0 24px rgba(0,0,0,0.6)' : 'none'
    }
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Outfit',sans-serif", color:'white' }}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={{ padding:'16px', borderBottom:`1px solid ${color}18`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'34px', height:'34px', background:`linear-gradient(135deg,${color},${color}88)`, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px' }}>{icon}</div>
            <div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:'700', color }}>{title}</div>
              <div style={{ fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'1px' }}>RoyalBet</div>
            </div>
          </div>
          {isMobile && <button onClick={()=>setSidebarOpen(false)} style={{ background:'none', border:'none', color:'#666', fontSize:'18px', cursor:'pointer' }}>✕</button>}
        </div>

        {/* User info */}
        <div style={{ padding:'12px 16px', borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:`linear-gradient(135deg,${color},${color}66)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', flexShrink:0 }}>
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#ccc' }}>{user.username}</div>
              <div style={{ fontSize:'10px', color, textTransform:'uppercase', letterSpacing:'0.5px' }}>{user.role}</div>
            </div>
          </div>
          {/* Balance */}
          <div style={{ marginTop:'10px', padding:'8px 10px', background:`${color}12`, border:`1px solid ${color}25`, borderRadius:'8px', textAlign:'center' }}>
            <div style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>BALANCE</div>
            <div style={{ fontSize:'18px', fontWeight:'900', color }}>🪙 {(user.balance||0).toLocaleString()}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
          {navItems.map(item => {
            const active = isActive(item.path)
            return (
              <Link key={item.path} to={item.path} style={{ display:'block', textDecoration:'none' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'10px 16px', margin:'2px 6px', borderRadius:'8px',
                  background: active ? `${color}18` : 'transparent',
                  borderLeft: `2px solid ${active ? color : 'transparent'}`,
                  color: active ? color : '#7777aa',
                  fontSize:'13px', fontWeight: active ? '600' : '400',
                  cursor:'pointer', transition:'all 0.15s'
                }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent' }}>
                  <span style={{ fontSize:'15px' }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Commission info */}
        {user.commissionRate > 0 && (
          <div style={{ padding:'10px 14px', margin:'0 8px 6px', background:`${color}10`, border:`1px solid ${color}20`, borderRadius:'8px' }}>
            <div style={{ fontSize:'10px', color:'#666', marginBottom:'2px' }}>MY COMMISSION RATE</div>
            <div style={{ fontSize:'16px', fontWeight:'800', color }}>{user.commissionRate}%</div>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={logout} style={{ width:'100%', padding:'9px', borderRadius:'7px', background:'rgba(255,68,68,0.08)', border:'1px solid rgba(255,68,68,0.18)', color:'#ff6666', cursor:'pointer', fontSize:'12px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:199 }} />
      )}

      {/* Main */}
      <main style={{ flex:1, marginLeft: isMobile ? 0 : '210px', display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Mobile header */}
        {isMobile && (
          <div style={{ height:'52px', background:'#0d0d18', borderBottom:`1px solid ${color}18`, display:'flex', alignItems:'center', padding:'0 14px', gap:'12px', position:'sticky', top:0, zIndex:100 }}>
            <button onClick={()=>setSidebarOpen(true)} style={{ background:'none', border:'none', color:'#888', fontSize:'20px', cursor:'pointer' }}>☰</button>
            <span style={{ fontFamily:'Cinzel,serif', color, fontSize:'14px', fontWeight:'700' }}>{icon} {title}</span>
            <span style={{ marginLeft:'auto', color, fontSize:'13px', fontWeight:'700' }}>🪙{(user.balance||0).toLocaleString()}</span>
          </div>
        )}
        <div style={{ flex:1, padding: isMobile ? '14px 12px' : '24px 28px' }}>
          <Outlet />
        </div>
      </main>

      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0a0f;color:#fff}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:${color};border-radius:2px}a{text-decoration:none;color:inherit}button{cursor:pointer;font-family:'Outfit',sans-serif;border:none;outline:none}input,select{font-family:'Outfit',sans-serif;outline:none}.ov-x{overflow-x:auto;-webkit-overflow-scrolling:touch}table{width:100%;border-collapse:collapse}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@media(max-width:480px){th,td{padding:7px 8px!important;font-size:11px!important}}`}</style>
    </div>
  )
}
