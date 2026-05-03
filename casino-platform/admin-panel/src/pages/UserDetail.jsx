import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../App'
import toast from 'react-hot-toast'

function PasswordModal({ onClose, onConfirm }) {
  const [pw, setPw] = React.useState('')
  const [show, setShow] = React.useState(false)
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'16px' }} onClick={onClose}>
      <div style={{ background:'#16161f',border:'1px solid rgba(153,68,255,0.3)',borderRadius:'14px',padding:'24px',width:'100%',maxWidth:'340px' }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ color:'#9944ff',marginBottom:'16px',fontSize:'15px',fontWeight:'700' }}>🔐 Change Password</h3>
        <label style={{ display:'block',color:'#888',fontSize:'10px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'5px' }}>New Password (min 6 chars)</label>
        <div style={{ position:'relative',marginBottom:'16px' }}>
          <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
            placeholder="Enter new password" autoFocus
            style={{ width:'100%',padding:'11px 42px 11px 14px',background:'#1e1e2a',border:'1px solid rgba(153,68,255,0.4)',borderRadius:'8px',color:'white',fontSize:'14px',outline:'none' }} />
          <button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#666',cursor:'pointer',fontSize:'16px' }}>
            {show?'🙈':'👁️'}
          </button>
        </div>
        {pw && pw.length < 6 && <div style={{ color:'#ff4444',fontSize:'11px',marginBottom:'10px' }}>⚠️ At least 6 characters required</div>}
        <div style={{ display:'flex',gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1,padding:'11px',borderRadius:'8px',background:'#1e1e2a',border:'1px solid #2a2a3a',color:'#888',cursor:'pointer',fontSize:'13px' }}>Cancel</button>
          <button onClick={()=>pw.length>=6&&onConfirm(pw)} disabled={pw.length<6}
            style={{ flex:1,padding:'11px',borderRadius:'8px',background:pw.length>=6?'rgba(153,68,255,0.18)':'rgba(153,68,255,0.06)',border:`1px solid rgba(153,68,255,${pw.length>=6?'0.4':'0.15'})`,color:pw.length>=6?'#9944ff':'#555',cursor:pw.length>=6?'pointer':'not-allowed',fontSize:'13px',fontWeight:'700' }}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}

function Modal({ title, color, onClose, onConfirm, placeholder, defaultVal }) {
  const [amount, setAmount] = useState(defaultVal || '')
  const [reason, setReason] = useState('')
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'16px' }} onClick={onClose}>
      <div style={{ background:'#16161f',border:`1px solid ${color}40`,borderRadius:'14px',padding:'24px',width:'100%',maxWidth:'340px',boxShadow:`0 0 40px ${color}15` }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ color,marginBottom:'18px',fontSize:'15px',fontWeight:'700' }}>{title}</h3>
        <div style={{ marginBottom:'12px' }}>
          <label style={{ display:'block',color:'#888',fontSize:'10px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'5px' }}>Amount (coins)</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={placeholder||'Enter amount'}
            style={{ width:'100%',padding:'11px 14px',background:'#1e1e2a',border:`1px solid ${color}40`,borderRadius:'8px',color:'white',fontSize:'15px',fontWeight:'700',textAlign:'center',outline:'none' }} autoFocus />
        </div>
        <div style={{ marginBottom:'18px' }}>
          <label style={{ display:'block',color:'#888',fontSize:'10px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'5px' }}>Reason (optional)</label>
          <input type="text" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Enter reason..."
            style={{ width:'100%',padding:'10px 14px',background:'#1e1e2a',border:'1px solid #2a2a3a',borderRadius:'8px',color:'white',fontSize:'13px',outline:'none' }} />
        </div>
        <div style={{ display:'flex',gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1,padding:'11px',borderRadius:'8px',background:'#1e1e2a',border:'1px solid #2a2a3a',color:'#888',cursor:'pointer',fontSize:'13px' }}>Cancel</button>
          <button onClick={()=>amount&&onConfirm(Number(amount),reason)} style={{ flex:1,padding:'11px',borderRadius:'8px',background:`${color}18`,border:`1px solid ${color}40`,color,cursor:'pointer',fontSize:'13px',fontWeight:'700' }}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(r => setData(r.data))
      .catch(() => { toast.error('User not found'); navigate('/users') })
      .finally(() => setLoading(false))
  }, [id])

  const action = async (type, amount, reason) => {
    setBusy(true)
    try {
      let res
      if (type === 'add') res = await api.post(`/admin/users/${id}/add-coins`, { amount, reason })
      else if (type === 'remove') res = await api.post(`/admin/users/${id}/remove-coins`, { amount, reason })
      else if (type === 'reset') res = await api.post(`/admin/users/${id}/reset-wallet`, { amount })
      toast.success(res.data.message)
      setData(prev => ({ ...prev, user: { ...prev.user, balance: res.data.newBalance } }))
      setModal(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setBusy(false)
  }

  const changePassword = async (newPassword) => {
    setBusy(true)
    try {
      const { data } = await api.post(`/admin/users/${id}/change-password`, { newPassword })
      toast.success(data.message)
      setModal(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setBusy(false)
  }

  const toggleBlock = async () => {
    setBusy(true)
    try {
      const { data: d } = await api.patch(`/admin/users/${id}/block`)
      setData(prev => ({ ...prev, user: { ...prev.user, isBlocked: d.isBlocked } }))
      toast.success(d.message)
    } catch { toast.error('Failed') }
    setBusy(false)
  }

  if (loading) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'60vh' }}><div style={{ width:'32px',height:'32px',border:'3px solid #2a2a3a',borderTopColor:'#c9a227',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} /></div>
  if (!data) return null

  const { user, bets = [], transactions = [], stats = {} } = data

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:'12px',marginBottom:'22px',flexWrap:'wrap' }}>
        <button onClick={()=>navigate('/users')} style={{ padding:'7px 14px',borderRadius:'7px',background:'#16161f',border:'1px solid #2a2a3a',color:'#888',cursor:'pointer',fontSize:'12px',flexShrink:0 }}>← Back</button>
        <div style={{ flex:1,minWidth:'120px' }}>
          <h1 style={{ fontFamily:'Cinzel,serif',fontSize:'clamp(16px,3vw,20px)',color:'#c9a227',marginBottom:'2px' }}>{user.username}</h1>
          <p style={{ color:'#555',fontSize:'12px' }}>{user.email}</p>
        </div>
        <span style={{ padding:'4px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:'700',background:user.isBlocked?'rgba(255,68,68,0.15)':'rgba(0,208,132,0.15)',color:user.isBlocked?'#ff4444':'#00d084',border:`1px solid ${user.isBlocked?'rgba(255,68,68,0.3)':'rgba(0,208,132,0.3)'}`,flexShrink:0 }}>
          {user.isBlocked?'BLOCKED':'ACTIVE'}
        </span>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'16px' }}>
        {/* Left column */}
        <div style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
          {/* Profile */}
          <div style={{ background:'#16161f',border:'1px solid #2a2a3a',borderRadius:'12px',padding:'18px' }}>
            <div style={{ display:'flex',gap:'12px',alignItems:'center',marginBottom:'16px' }}>
              <div style={{ width:'44px',height:'44px',borderRadius:'50%',background:`hsl(${user.username.charCodeAt(0)*7},55%,40%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'700',flexShrink:0 }}>
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:'700',fontSize:'15px' }}>{user.username}</div>
                <div style={{ color:'#666',fontSize:'11px' }}>ID: {user._id?.slice(-8)}</div>
              </div>
            </div>
            {[
              { l:'Email', v:user.email },
              { l:'Role', v:user.role?.toUpperCase() },
              { l:'Last Login', v:user.lastLogin?new Date(user.lastLogin).toLocaleDateString():'—' },
              { l:'Total Wagered', v:`🪙 ${user.totalBets?.toLocaleString()||0}` },
              { l:'Total Won', v:`🪙 ${user.totalWon?.toLocaleString()||0}` },
            ].map(({ l, v }) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'13px' }}>
                <span style={{ color:'#666' }}>{l}</span>
                <span style={{ color:'#ccc',fontWeight:'500',textAlign:'right',maxWidth:'60%',wordBreak:'break-all' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Wallet actions */}
          <div style={{ background:'#16161f',border:'1px solid rgba(201,162,39,0.25)',borderRadius:'12px',padding:'18px' }}>
            <div style={{ textAlign:'center',marginBottom:'14px' }}>
              <div style={{ color:'#888',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px' }}>Balance</div>
              <div style={{ fontSize:'32px',fontWeight:'900',color:'#c9a227' }}>🪙 {user.balance?.toLocaleString()}</div>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
              {[
                { label:'➕ Add Coins', type:'add', color:'#00d084', bg:'rgba(0,208,132,0.12)' },
                { label:'➖ Remove Coins', type:'remove', color:'#ff4444', bg:'rgba(255,68,68,0.1)' },
                { label:'🔄 Reset Wallet', type:'reset', color:'#c9a227', bg:'rgba(201,162,39,0.1)' },
                { label:'🔐 Change Password', type:'password', color:'#9944ff', bg:'rgba(153,68,255,0.1)' },
              ].map(({ label, type, color, bg }) => (
                <button key={type} onClick={()=>setModal(type==='password'?'password':type)} style={{ width:'100%',padding:'10px',borderRadius:'8px',fontWeight:'700',cursor:'pointer',background:bg,border:`1px solid ${color}40`,color,fontSize:'13px',transition:'opacity 0.2s' }}>
                  {label}
                </button>
              ))}
              {user.role !== 'admin' && (
                <button onClick={toggleBlock} disabled={busy} style={{ width:'100%',padding:'10px',borderRadius:'8px',fontWeight:'700',cursor:busy?'not-allowed':'pointer',background:user.isBlocked?'rgba(0,208,132,0.1)':'rgba(255,68,68,0.1)',border:`1px solid ${user.isBlocked?'rgba(0,208,132,0.3)':'rgba(255,68,68,0.3)'}`,color:user.isBlocked?'#00d084':'#ff4444',fontSize:'13px',opacity:busy?0.5:1 }}>
                  {user.isBlocked?'✅ Unblock User':'🚫 Block User'}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ background:'#16161f',border:'1px solid #2a2a3a',borderRadius:'12px',padding:'16px' }}>
            <h4 style={{ color:'#888',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'12px' }}>Betting Stats</h4>
            {[
              { l:'Total Bets', v:stats.totalBets||0, c:'#4488ff' },
              { l:'Won', v:stats.totalWon?`🪙${stats.totalWon.toLocaleString()}`:0, c:'#00d084' },
              { l:'Lost', v:stats.totalLost?`🪙${stats.totalLost.toLocaleString()}`:0, c:'#ff4444' },
              { l:'Net P&L', v:stats.netPL!==undefined?`${stats.netPL>=0?'+':''}${stats.netPL?.toLocaleString()}`:0, c:stats.netPL>=0?'#00d084':'#ff4444' },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'13px' }}>
                <span style={{ color:'#666' }}>{l}</span>
                <span style={{ color:c,fontWeight:'700' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
          {/* Recent bets */}
          <div style={{ background:'#16161f',border:'1px solid #2a2a3a',borderRadius:'12px',overflow:'hidden' }}>
            <div style={{ padding:'12px 16px',borderBottom:'1px solid #2a2a3a',fontWeight:'700',fontSize:'13px' }}>🎲 Recent Bets</div>
            {bets.length===0 ? <div style={{ padding:'24px',textAlign:'center',color:'#444',fontSize:'13px' }}>No bets yet</div> : (
              <div style={{ overflowX:'auto',WebkitOverflowScrolling:'touch' }}>
                <table style={{ minWidth:'380px',width:'100%',borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #1e1e2a',background:'rgba(255,255,255,0.02)' }}>
                      {['Game','Bet','Payout','Status','Date'].map(h=>(
                        <th key={h} style={{ padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#444',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bets.map((bet,i)=>(
                      <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.025)' }}>
                        <td style={{ padding:'9px 12px',fontSize:'12px',textTransform:'capitalize',color:'white' }}>{bet.game?.replace(/-/g,' ')}</td>
                        <td style={{ padding:'9px 12px',fontSize:'12px',color:'#c9a227',fontWeight:'700' }}>🪙{bet.betAmount}</td>
                        <td style={{ padding:'9px 12px',fontSize:'12px',color:bet.payout>0?'#00d084':'#555' }}>{bet.payout>0?`🪙${bet.payout}`:'—'}</td>
                        <td style={{ padding:'9px 12px' }}>
                          <span style={{ padding:'2px 6px',borderRadius:'20px',fontSize:'10px',fontWeight:'700',background:bet.status==='won'?'rgba(0,208,132,0.15)':'rgba(255,68,68,0.15)',color:bet.status==='won'?'#00d084':'#ff4444' }}>{bet.status?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding:'9px 12px',fontSize:'10px',color:'#444',whiteSpace:'nowrap' }}>{bet.createdAt?new Date(bet.createdAt).toLocaleDateString():'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div style={{ background:'#16161f',border:'1px solid #2a2a3a',borderRadius:'12px',overflow:'hidden' }}>
            <div style={{ padding:'12px 16px',borderBottom:'1px solid #2a2a3a',fontWeight:'700',fontSize:'13px' }}>💳 Wallet Transactions</div>
            {transactions.length===0 ? <div style={{ padding:'24px',textAlign:'center',color:'#444',fontSize:'13px' }}>No transactions</div> : (
              <div style={{ overflowX:'auto',WebkitOverflowScrolling:'touch' }}>
                <table style={{ minWidth:'400px',width:'100%',borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #1e1e2a',background:'rgba(255,255,255,0.02)' }}>
                      {['Type','Amount','Balance After','Description','Date'].map(h=>(
                        <th key={h} style={{ padding:'8px 12px',textAlign:'left',fontSize:'10px',color:'#444',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx,i)=>{
                      const isCredit=['credit','win','admin_add','bonus','admin_reset','deposit','withdraw_rejected'].includes(tx.type)
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.025)' }}>
                          <td style={{ padding:'9px 12px' }}>
                            <span style={{ padding:'2px 6px',borderRadius:'4px',fontSize:'10px',fontWeight:'700',background:isCredit?'rgba(0,208,132,0.1)':'rgba(255,68,68,0.1)',color:isCredit?'#00d084':'#ff4444' }}>
                              {tx.type.replace(/_/g,' ').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding:'9px 12px',fontSize:'12px',color:isCredit?'#00d084':'#ff4444',fontWeight:'700' }}>
                            {isCredit?'+':'−'}🪙{tx.amount?.toLocaleString()}
                          </td>
                          <td style={{ padding:'9px 12px',fontSize:'12px',color:'#c9a227' }}>🪙{tx.balanceAfter?.toLocaleString()}</td>
                          <td style={{ padding:'9px 12px',fontSize:'11px',color:'#555',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tx.description||'—'}</td>
                          <td style={{ padding:'9px 12px',fontSize:'10px',color:'#444',whiteSpace:'nowrap' }}>{tx.createdAt?new Date(tx.createdAt).toLocaleDateString():'—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal==='add' && <Modal title="➕ Add Coins" color="#00d084" onClose={()=>setModal(null)} onConfirm={(a,r)=>action('add',a,r)} placeholder="e.g. 500" />}
      {modal==='remove' && <Modal title="➖ Remove Coins" color="#ff4444" onClose={()=>setModal(null)} onConfirm={(a,r)=>action('remove',a,r)} placeholder="e.g. 200" />}
      {modal==='password' && <PasswordModal onClose={()=>setModal(null)} onConfirm={changePassword} />}
      {modal==='reset' && <Modal title="🔄 Reset Wallet" color="#c9a227" onClose={()=>setModal(null)} onConfirm={(a,r)=>action('reset',a,r)} placeholder="Reset to amount (default 1000)" defaultVal={1000} />}
    </div>
  )
}
