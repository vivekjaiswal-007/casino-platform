import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../App'
import toast from 'react-hot-toast'

const S = {
  card: { background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'12px', overflow:'hidden' },
  th: { padding:'10px 14px', textAlign:'left', fontSize:'10px', color:'#555', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' },
  td: { padding:'11px 14px', fontSize:'13px', borderBottom:'1px solid rgba(255,255,255,0.03)' },
  input: { width:'100%', padding:'10px 14px', background:'#1e1e2a', border:'1px solid #2a2a3a', borderRadius:'8px', color:'white', fontSize:'14px' },
}

function Badge({ status }) {
  const map = { pending:['#c9a227','rgba(201,162,39,0.15)'], approved:['#00d084','rgba(0,208,132,0.15)'], rejected:['#ff4444','rgba(255,68,68,0.15)'] }
  const [col, bg] = map[status] || map.pending
  return <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', color:col, background:bg, border:`1px solid ${col}30` }}>{status?.toUpperCase()}</span>
}

function RejectModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={onClose}>
      <div style={{ background:'#16161f', border:'1px solid rgba(255,68,68,0.3)', borderRadius:'14px', padding:'24px', width:'340px', maxWidth:'90vw' }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ color:'#ff4444', marginBottom:'16px', fontSize:'16px' }}>❌ Reject Withdrawal</h3>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block', color:'#888', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Reason (optional)</label>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Invalid UPI ID, Payment failed"
            style={{ ...S.input, height:'80px', resize:'vertical' }}
            onFocus={e=>e.target.style.borderColor='#ff4444'}
            onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', background:'#1e1e2a', border:'1px solid #2a2a3a', borderRadius:'8px', color:'#888', cursor:'pointer', fontSize:'13px' }}>Cancel</button>
          <button onClick={()=>onConfirm(reason)} style={{ flex:1, padding:'10px', background:'rgba(255,68,68,0.15)', border:'1px solid rgba(255,68,68,0.3)', borderRadius:'8px', color:'#ff4444', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>Reject & Refund</button>
        </div>
      </div>
    </div>
  )
}

export default function Withdrawals() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [processing, setProcessing] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [stats, setStats] = useState({ pending:0, approved:0, rejected:0, totalAmount:0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (filter !== 'all') params.status = filter
      const { data } = await api.get('/admin/withdrawals', { params })
      setRequests(data.requests || [])
      setPagination(data.pagination || {})
    } catch { toast.error('Failed to load') }
    setLoading(false)
  }, [page, filter])

  const loadStats = async () => {
    try {
      const [p, a, r] = await Promise.all([
        api.get('/admin/withdrawals?status=pending&limit=1'),
        api.get('/admin/withdrawals?status=approved&limit=1'),
        api.get('/admin/withdrawals?status=rejected&limit=1'),
      ])
      setStats({ pending: p.data.pagination?.total || 0, approved: a.data.pagination?.total || 0, rejected: r.data.pagination?.total || 0 })
    } catch {}
  }

  useEffect(() => { load(); loadStats() }, [load])

  const approve = async (id, username, amount) => {
    setProcessing(id)
    try {
      const { data } = await api.post(`/admin/withdrawals/${id}/approve`)
      toast.success(data.message)
      setRequests(prev => prev.map(r => r._id === id ? { ...r, withdrawStatus:'approved', type:'withdraw_approved' } : r))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setProcessing(null)
  }

  const reject = async (id, reason) => {
    setProcessing(id)
    try {
      const { data } = await api.post(`/admin/withdrawals/${id}/reject`, { reason })
      toast.success(data.message)
      setRequests(prev => prev.map(r => r._id === id ? { ...r, withdrawStatus:'rejected', type:'withdraw_rejected', rejectionReason:reason } : r))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setProcessing(null)
    setRejectModal(null)
  }

  return (
    <div>
      <div style={{ marginBottom:'22px' }}>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(18px,4vw,22px)', color:'#c9a227', marginBottom:'4px' }}>💸 Withdrawal Requests</h1>
        <p style={{ color:'#555', fontSize:'13px' }}>Approve or reject player withdrawal requests</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Pending', val:stats.pending, color:'#c9a227', icon:'⏳' },
          { label:'Approved', val:stats.approved, color:'#00d084', icon:'✅' },
          { label:'Rejected', val:stats.rejected, color:'#ff4444', icon:'❌' },
        ].map(s => (
          <div key={s.label} style={{ background:'#16161f', border:`1px solid ${s.color}22`, borderLeft:`3px solid ${s.color}`, borderRadius:'10px', padding:'14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
              <span style={{ color:'#666', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</span>
              <span style={{ fontSize:'16px' }}>{s.icon}</span>
            </div>
            <div style={{ fontSize:'24px', fontWeight:'900', color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'16px', borderBottom:'1px solid #2a2a3a', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={()=>{setFilter(f);setPage(1)}} style={{
            padding:'9px 16px', background:'none', border:'none',
            borderBottom:`2px solid ${filter===f?'#c9a227':'transparent'}`,
            color:filter===f?'#c9a227':'#666', fontWeight:filter===f?'700':'400',
            fontSize:'13px', cursor:'pointer', marginBottom:'-1px', whiteSpace:'nowrap', flexShrink:0, textTransform:'capitalize'
          }}>{f === 'all' ? '📋 All' : f === 'pending' ? `⏳ Pending${stats.pending>0?` (${stats.pending})`:''}`  : f === 'approved' ? '✅ Approved' : '❌ Rejected'}</button>
        ))}
      </div>

      <div style={S.card}>
        <div className="ov-x">
          <table style={{ minWidth:'600px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #2a2a3a', background:'rgba(255,255,255,0.02)' }}>
                {['User','Amount','UPI ID','Status','Requested','Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', padding:'40px' }}>
                  <div style={{ width:'32px', height:'32px', border:'3px solid #2a2a3a', borderTopColor:'#c9a227', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
                </td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', padding:'40px', color:'#444' }}>No withdrawal requests found</td></tr>
              ) : requests.map((req, i) => (
                <tr key={i}>
                  <td style={S.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:`hsl(${(req.userId?.username||'u').charCodeAt(0)*7},55%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', flexShrink:0 }}>
                        {(req.userId?.username||'?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:'13px', color:'white', fontWeight:'600' }}>{req.userId?.username||'—'}</div>
                        <div style={{ fontSize:'11px', color:'#555' }}>{req.userId?.email||''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...S.td, color:'#ff6666', fontWeight:'800', fontSize:'14px' }}>₹{req.amount?.toLocaleString()}</td>
                  <td style={{ ...S.td }}>
                    <div style={{ fontSize:'12px', color:'#c9a227', fontWeight:'600', wordBreak:'break-all' }}>{req.upiId||'—'}</div>
                    {req.upiName && <div style={{ fontSize:'11px', color:'#666' }}>{req.upiName}</div>}
                  </td>
                  <td style={S.td}><Badge status={req.withdrawStatus} /></td>
                  <td style={{ ...S.td, fontSize:'11px', color:'#555', whiteSpace:'nowrap' }}>
                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'}
                  </td>
                  <td style={S.td}>
                    {req.withdrawStatus === 'pending' ? (
                      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                        <button onClick={() => approve(req._id, req.userId?.username, req.amount)} disabled={processing===req._id}
                          style={{ padding:'5px 12px', borderRadius:'6px', background:'rgba(0,208,132,0.15)', border:'1px solid rgba(0,208,132,0.3)', color:'#00d084', fontSize:'12px', fontWeight:'700', cursor:processing===req._id?'not-allowed':'pointer', opacity:processing===req._id?0.5:1 }}>
                          {processing===req._id ? '...' : '✅ Approve'}
                        </button>
                        <button onClick={() => setRejectModal(req)} disabled={processing===req._id}
                          style={{ padding:'5px 12px', borderRadius:'6px', background:'rgba(255,68,68,0.12)', border:'1px solid rgba(255,68,68,0.3)', color:'#ff4444', fontSize:'12px', fontWeight:'700', cursor:processing===req._id?'not-allowed':'pointer', opacity:processing===req._id?0.5:1 }}>
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:'12px', color: req.withdrawStatus==='approved'?'#00d084':'#ff4444' }}>
                          {req.withdrawStatus==='approved' ? '✅ Paid' : '❌ Refunded'}
                        </div>
                        {req.rejectionReason && <div style={{ fontSize:'11px', color:'#666', marginTop:'2px' }}>Reason: {req.rejectionReason}</div>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginTop:'16px', flexWrap:'wrap' }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'6px 12px', borderRadius:'6px', background:'#16161f', border:'1px solid #2a2a3a', color:'#888', cursor:'pointer', fontSize:'13px' }}>← Prev</button>
          {[...Array(Math.min(pagination.pages,7))].map((_,i)=>(
            <button key={i} onClick={()=>setPage(i+1)} style={{ padding:'6px 12px', borderRadius:'6px', background:page===i+1?'rgba(201,162,39,0.2)':'#16161f', border:`1px solid ${page===i+1?'#c9a227':'#2a2a3a'}`, color:page===i+1?'#c9a227':'#888', cursor:'pointer', fontSize:'13px' }}>{i+1}</button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} style={{ padding:'6px 12px', borderRadius:'6px', background:'#16161f', border:'1px solid #2a2a3a', color:'#888', cursor:'pointer', fontSize:'13px' }}>Next →</button>
        </div>
      )}

      {rejectModal && <RejectModal onClose={()=>setRejectModal(null)} onConfirm={(reason)=>reject(rejectModal._id, reason)} />}

      <style>{`.ov-x{overflow-x:auto;-webkit-overflow-scrolling:touch}`}</style>
    </div>
  )
}
