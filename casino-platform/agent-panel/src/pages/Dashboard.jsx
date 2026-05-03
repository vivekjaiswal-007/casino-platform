import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getUser } from '../api'

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{ background: '#16161f', border: `1px solid ${color}22`, borderLeft: `3px solid ${color}`, borderRadius: '10px', padding: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '15px' }}>{icon}</span>
      </div>
      <div style={{ fontSize: 'clamp(16px,3vw,20px)', fontWeight: '900', color }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard({ config }) {
  const { color, icon, title } = config
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = getUser()

  useEffect(() => {
    api.get('/hierarchy/dashboard')
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(() => {
        setStats({
          balance: user.balance || 0,
          commissionRate: user.commissionRate || 0,
          commissionEarned: 0,
          totalUsers: 0,
          totalDirectDownline: 0,
          totalWagered: 0,
          totalPayout: 0,
          houseProfit: 0,
          totalMasters: 0,
          totalAgents: 0,
          recentBets: []
        })
        setLoading(false)
      })
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(18px,4vw,22px)', color, marginBottom: '3px' }}>
            {icon} Dashboard
          </h1>
          <p style={{ color: '#555', fontSize: '12px' }}>
            Welcome back, <strong style={{ color: '#ccc' }}>{user.username}</strong> &mdash; {user.role}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/create">
            <button style={{ padding: '8px 16px', borderRadius: '8px', background: `${color}18`, border: `1px solid ${color}35`, color, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              ➕ Create Account
            </button>
          </Link>
          <Link to="/wallet">
            <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              💸 Transfer
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div style={{ width: '36px', height: '36px', border: `3px solid #2a2a3a`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <StatCard label="My Balance" value={`🪙 ${(stats.balance || 0).toLocaleString()}`} color={color} icon="💰" />
            <StatCard label="Commission Rate" value={`${stats.commissionRate || 0}%`} color="#c9a227" icon="📊" />
            <StatCard label="Commission Earned" value={`🪙 ${(stats.commissionEarned || 0).toLocaleString()}`} color="#00d084" icon="💎" />
            <StatCard label="Total Users" value={(stats.totalUsers || 0).toLocaleString()} color="#4488ff" icon="👥" />
            <StatCard label="Direct Downline" value={(stats.totalDirectDownline || 0).toLocaleString()} color={color} icon="🔗" />
            <StatCard label="Total Wagered" value={`🪙 ${(stats.totalWagered || 0).toLocaleString()}`} color="#9944ff" icon="📤" />
            <StatCard label="House Profit" value={`🪙 ${(stats.houseProfit || 0).toLocaleString()}`} color="#00d084" icon="🏦" />
          </div>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {[
              { to: '/create', label: '➕ Create Account', desc: 'Add master / agent / user', c: color },
              { to: '/downline', label: '👥 My Downline', desc: 'View & manage accounts', c: '#4488ff' },
              { to: '/wallet', label: '💸 Wallet Transfer', desc: 'Add or reclaim coins', c: '#00d084' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#16161f', border: `1px solid ${item.c}20`, borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${item.c}50`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `${item.c}20`}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: item.c, marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Bets */}
          <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a3a', fontWeight: '700', fontSize: '13px', color: '#ccc' }}>
              Recent Bets — Your Downline
            </div>
            {!stats.recentBets?.length ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#444', fontSize: '13px' }}>
                No bets yet from your downline 🎮
              </div>
            ) : stats.recentBets.slice(0, 8).map((bet, i) => {
              const pnl = bet.status === 'won' ? (bet.payout - bet.betAmount) : -bet.betAmount
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.025)', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#ccc' }}>
                      <strong>{bet.userId?.username || '—'}</strong> &mdash; <span style={{ textTransform: 'capitalize' }}>{bet.game}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#444' }}>{bet.createdAt ? new Date(bet.createdAt).toLocaleString('en-IN') : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#c9a227', fontWeight: '700', fontSize: '13px' }}>🪙 {bet.betAmount}</div>
                    <span style={{ padding: '1px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', background: bet.status === 'won' ? 'rgba(0,208,132,0.15)' : 'rgba(255,68,68,0.12)', color: bet.status === 'won' ? '#00d084' : '#ff4444' }}>
                      {bet.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
