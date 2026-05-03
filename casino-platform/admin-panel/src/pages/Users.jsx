import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../App'
import toast from 'react-hot-toast'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [blocking, setBlocking] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { search, page, limit: 20 } })
      setUsers(data.users); setPagination(data.pagination)
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }, [search, page])

  useEffect(() => { load() }, [load])

  const handleBlock = async (id, isBlocked) => {
    setBlocking(id)
    try {
      const { data } = await api.patch(`/admin/users/${id}/block`)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: data.isBlocked } : u))
      toast.success(data.message)
    } catch { toast.error('Failed') }
    setBlocking(null)
  }

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(18px,4vw,22px)', color:'#c9a227', marginBottom:'3px' }}>👥 Users</h1>
        <p style={{ color:'#555', fontSize:'12px' }}>{pagination.total||0} registered users</p>
      </div>

      <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
        placeholder="🔍 Search username or email..."
        style={{ width:'100%', maxWidth:'380px', padding:'10px 14px', background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'9px', color:'white', fontSize:'13px', outline:'none', marginBottom:'16px', display:'block' }}
        onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'}
      />

      <div style={{ background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'12px', overflow:'hidden' }}>
        <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          <table style={{ minWidth:'560px', width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #2a2a3a', background:'rgba(255,255,255,0.02)' }}>
                {['User','Balance','Total Bets','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding:'40px', textAlign:'center' }}>
                  <div style={{ width:'28px', height:'28px', border:'3px solid #2a2a3a', borderTopColor:'#c9a227', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:'40px', textAlign:'center', color:'#444' }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.025)' }}>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`hsl(${u.username.charCodeAt(0)*7},55%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', flexShrink:0 }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <Link to={`/users/${u._id}`} style={{ color:'white', fontWeight:'600', fontSize:'13px' }}>{u.username}</Link>
                        {u.role==='admin' && <span style={{ marginLeft:'5px', fontSize:'9px', padding:'1px 4px', background:'rgba(201,162,39,0.2)', color:'#c9a227', borderRadius:'3px', fontWeight:'700' }}>ADMIN</span>}
                        <div style={{ fontSize:'11px', color:'#555' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:'13px', color:'#c9a227', fontWeight:'700' }}>🪙{u.balance?.toLocaleString()}</td>
                  <td style={{ padding:'11px 14px', fontSize:'13px', color:'#888' }}>{u.totalBets?.toLocaleString()||0}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ padding:'2px 7px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', background:u.isBlocked?'rgba(255,68,68,0.15)':'rgba(0,208,132,0.15)', color:u.isBlocked?'#ff4444':'#00d084', border:`1px solid ${u.isBlocked?'rgba(255,68,68,0.3)':'rgba(0,208,132,0.3)'}` }}>
                      {u.isBlocked?'BLOCKED':'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding:'11px 14px', fontSize:'11px', color:'#555', whiteSpace:'nowrap' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                      <Link to={`/users/${u._id}`}>
                        <button style={{ padding:'5px 10px', borderRadius:'5px', background:'rgba(68,136,255,0.15)', border:'1px solid rgba(68,136,255,0.3)', color:'#4488ff', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>View</button>
                      </Link>
                      {u.role!=='admin' && (
                        <button onClick={()=>handleBlock(u._id,u.isBlocked)} disabled={blocking===u._id}
                          style={{ padding:'5px 10px', borderRadius:'5px', background:u.isBlocked?'rgba(0,208,132,0.15)':'rgba(255,68,68,0.12)', border:`1px solid ${u.isBlocked?'rgba(0,208,132,0.3)':'rgba(255,68,68,0.3)'}`, color:u.isBlocked?'#00d084':'#ff4444', fontSize:'11px', fontWeight:'700', cursor:blocking===u._id?'not-allowed':'pointer', opacity:blocking===u._id?0.5:1 }}>
                          {u.isBlocked?'Unblock':'Block'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginTop:'16px', flexWrap:'wrap' }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'6px 12px', borderRadius:'6px', background:'#16161f', border:'1px solid #2a2a3a', color:'#888', cursor:'pointer', fontSize:'12px' }}>← Prev</button>
          {[...Array(Math.min(pagination.pages,6))].map((_,i)=>(
            <button key={i} onClick={()=>setPage(i+1)} style={{ padding:'6px 12px', borderRadius:'6px', background:page===i+1?'rgba(201,162,39,0.2)':'#16161f', border:`1px solid ${page===i+1?'#c9a227':'#2a2a3a'}`, color:page===i+1?'#c9a227':'#888', cursor:'pointer', fontSize:'12px' }}>{i+1}</button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} style={{ padding:'6px 12px', borderRadius:'6px', background:'#16161f', border:'1px solid #2a2a3a', color:'#888', cursor:'pointer', fontSize:'12px' }}>Next →</button>
        </div>
      )}
    </div>
  )
}
