import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import toast from 'react-hot-toast'

const ROLE_COLOR = { supermaster: '#9944ff', master: '#4488ff', agent: '#00d084', user: '#c9a227' }

export default function MyDownline({ config }) {
  const { color, canCreate } = config
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [blocking, setBlocking] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const { data } = await api.get(`/hierarchy/downline?${params}`)
      setUsers(data.users || [])
      setPagination(data.pagination || { total: 0, pages: 1 })
    } catch {
      toast.error('Failed to load')
    }
    setLoading(false)
  }, [page, search, roleFilter])

  useEffect(() => { load() }, [load])

  const handleBlock = async (id, isBlocked) => {
    setBlocking(id)
    try {
      const { data } = await api.patch(`/hierarchy/downline/${id}/block`)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: data.isBlocked } : u))
      toast.success(data.message)
    } catch {
      toast.error('Failed')
    }
    setBlocking(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(18px,4vw,22px)', color }}>👥 My Downline</h1>
        <Link to="/create">
          <button style={{ padding: '8px 16px', borderRadius: '8px', background: `${color}18`, border: `1px solid ${color}35`, color, fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            ➕ Create Account
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="🔍 Search username..."
          style={{ flex: 1, minWidth: '180px', padding: '8px 12px', background: '#16161f', border: `1px solid ${color}25`, borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = color}
          onBlur={e => e.target.style.borderColor = `${color}25`}
        />
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', background: '#16161f', border: `1px solid ${color}25`, borderRadius: '8px', color: 'white', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
          <option value="">All Roles</option>
          {canCreate.map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
        <div style={{ padding: '8px 14px', background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '8px', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center' }}>
          {pagination.total} total
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ minWidth: '580px', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3a', background: 'rgba(255,255,255,0.02)' }}>
                {['User', 'Role', 'Balance', 'Commission', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '50px', textAlign: 'center' }}>
                    <div style={{ width: '28px', height: '28px', border: `3px solid #2a2a3a`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: '#444', fontSize: '13px' }}>
                    No accounts yet. <Link to="/create" style={{ color }}>Create one →</Link>
                  </td>
                </tr>
              ) : users.map(u => {
                const rc = ROLE_COLOR[u.role] || '#888'
                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `hsl(${u.username.charCodeAt(0) * 7 % 360}, 50%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ddd' }}>{u.username}</div>
                          <div style={{ fontSize: '11px', color: '#444' }}>{u.email || u.phone || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: `${rc}18`, color: rc, textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', color: '#c9a227', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      🪙 {(u.balance || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', color, fontWeight: '700' }}>
                      {u.commissionRate || 0}%
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: u.isBlocked ? 'rgba(255,68,68,0.15)' : 'rgba(0,208,132,0.15)', color: u.isBlocked ? '#ff4444' : '#00d084' }}>
                        {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <Link to={`/downline/${u._id}`}>
                          <button style={{ padding: '4px 10px', borderRadius: '5px', background: `${color}18`, border: `1px solid ${color}30`, color, fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                            View
                          </button>
                        </Link>
                        <button
                          onClick={() => handleBlock(u._id, u.isBlocked)}
                          disabled={blocking === u._id}
                          style={{ padding: '4px 10px', borderRadius: '5px', background: u.isBlocked ? 'rgba(0,208,132,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${u.isBlocked ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, color: u.isBlocked ? '#00d084' : '#ff4444', fontSize: '11px', fontWeight: '700', cursor: blocking === u._id ? 'not-allowed' : 'pointer', opacity: blocking === u._id ? 0.5 : 1 }}>
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#16161f', border: '1px solid #2a2a3a', color: '#888', cursor: 'pointer', fontSize: '12px', opacity: page === 1 ? 0.5 : 1 }}>
            ← Prev
          </button>
          {[...Array(Math.min(pagination.pages, 6))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{ padding: '6px 12px', borderRadius: '6px', background: page === i + 1 ? `${color}22` : '#16161f', border: `1px solid ${page === i + 1 ? color : '#2a2a3a'}`, color: page === i + 1 ? color : '#888', cursor: 'pointer', fontSize: '12px' }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#16161f', border: '1px solid #2a2a3a', color: '#888', cursor: 'pointer', fontSize: '12px', opacity: page === pagination.pages ? 0.5 : 1 }}>
            Next →
          </button>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
