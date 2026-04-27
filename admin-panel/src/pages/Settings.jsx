import React, { useState, useEffect } from 'react'
import { api } from '../App'
import toast from 'react-hot-toast'

const inputStyle = { width:'100%', padding:'10px 14px', background:'#1e1e2a', border:'1px solid #2a2a3a', borderRadius:'8px', color:'white', fontSize:'14px', outline:'none', transition:'border-color 0.2s' }
const labelStyle = { display:'block', color:'#888', fontSize:'11px', fontWeight:'600', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.5px' }

function QRPreview({ upiId, name, amount }) {
  if (!upiId) return null
  const upiStr = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name||'RoyalBet')}&am=${amount}&cu=INR`
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}&margin=10`
  return (
    <div style={{ textAlign:'center', marginTop:'12px' }}>
      <div style={{ display:'inline-block', padding:'10px', background:'white', borderRadius:'10px', border:'2px solid #c9a227', boxShadow:'0 0 20px rgba(201,162,39,0.2)' }}>
        <img src={url} alt="QR" width={160} height={160} style={{ display:'block' }} />
      </div>
      <div style={{ marginTop:'8px', fontSize:'12px', color:'#c9a227', fontWeight:'700', wordBreak:'break-all' }}>{upiId}</div>
    </div>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('qr')
  const [saving, setSaving] = useState(false)
  const [previewAmount, setPreviewAmount] = useState(500)

  // QR Codes list
  const [qrCodes, setQrCodes] = useState([])
  const [newQR, setNewQR] = useState({ upiId:'', name:'', description:'' })
  const [addingQR, setAddingQR] = useState(false)

  // Site settings
  const [siteName, setSiteName] = useState('RoyalBet Casino')
  const [welcomeBonus, setWelcomeBonus] = useState(1000)
  const [minDeposit, setMinDeposit] = useState(100)
  const [minWithdraw, setMinWithdraw] = useState(100)
  const [waNumber, setWaNumber] = useState('+971553858340')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Password
  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' })

  useEffect(() => {
    api.get('/admin/settings').then(r => {
      if (r.data.qrCodes) setQrCodes(r.data.qrCodes)
      if (r.data.siteName) setSiteName(r.data.siteName)
      if (r.data.welcomeBonus) setWelcomeBonus(r.data.welcomeBonus)
      if (r.data.minDeposit) setMinDeposit(r.data.minDeposit)
      if (r.data.minWithdraw) setMinWithdraw(r.data.minWithdraw)
      if (r.data.waNumber) setWaNumber(r.data.waNumber)
      if (r.data.maintenanceMode !== undefined) setMaintenanceMode(r.data.maintenanceMode)
    }).catch(()=>{})
  }, [])

  const saveQRList = async (list) => {
    setSaving(true)
    try {
      await api.post('/admin/settings', { qrCodes: list })
      toast.success('✅ QR codes saved!')
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const addQR = async () => {
    if (!newQR.upiId.trim()) return toast.error('UPI ID is required')
    setAddingQR(true)
    const updated = [...qrCodes, { ...newQR, active: true, id: Date.now() }]
    setQrCodes(updated)
    await saveQRList(updated)
    setNewQR({ upiId:'', name:'', description:'' })
    setAddingQR(false)
  }

  const toggleQR = async (idx) => {
    const updated = qrCodes.map((q,i) => i===idx ? {...q, active:!q.active} : q)
    setQrCodes(updated)
    await saveQRList(updated)
  }

  const deleteQR = async (idx) => {
    const updated = qrCodes.filter((_,i) => i!==idx)
    setQrCodes(updated)
    await saveQRList(updated)
    toast.success('QR code removed')
  }

  const saveSite = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings', { siteName, welcomeBonus, minDeposit, minWithdraw, maintenanceMode, waNumber })
      toast.success('✅ Site settings saved!')
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const changePw = async (e) => {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPw.length < 6) return toast.error('Min 6 characters')
    setSaving(true)
    try {
      await api.post('/admin/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw })
      toast.success('✅ Password changed!')
      setPwForm({ current:'', newPw:'', confirm:'' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const TABS = [
    { id:'qr', label:'📱 QR Codes' },
    { id:'site', label:'🌐 Site' },
    { id:'pw', label:'🔐 Password' },
  ]

  return (
    <div>
      <div style={{ marginBottom:'22px' }}>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(18px,4vw,22px)', color:'#c9a227', marginBottom:'4px' }}>⚙️ Settings</h1>
        <p style={{ color:'#555', fontSize:'13px' }}>Manage QR codes, UPI payments, site configuration</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'22px', borderBottom:'1px solid #2a2a3a', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:'9px 16px', background:'none', border:'none',
            borderBottom:`2px solid ${tab===t.id?'#c9a227':'transparent'}`,
            color:tab===t.id?'#c9a227':'#666', fontWeight:tab===t.id?'700':'400',
            fontSize:'13px', cursor:'pointer', marginBottom:'-1px', whiteSpace:'nowrap', flexShrink:0
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── QR CODES TAB ── */}
      {tab === 'qr' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'20px' }}>
          {/* Add new QR */}
          <div style={{ background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'14px', padding:'20px' }}>
            <h3 style={{ color:'white', fontSize:'15px', fontWeight:'700', marginBottom:'16px' }}>➕ Add New UPI / QR Code</h3>
            <p style={{ color:'#666', fontSize:'12px', marginBottom:'16px', lineHeight:1.6 }}>
              Add multiple UPI IDs. Players can choose which one to pay to when depositing.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div>
                <label style={labelStyle}>UPI ID *</label>
                <input type="text" value={newQR.upiId} onChange={e=>setNewQR(p=>({...p,upiId:e.target.value}))}
                  placeholder="9876543210@upi or name@gpay"
                  style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              </div>
              <div>
                <label style={labelStyle}>Display Name *</label>
                <input type="text" value={newQR.name} onChange={e=>setNewQR(p=>({...p,name:e.target.value}))}
                  placeholder="e.g. Main Account, PhonePe"
                  style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              </div>
              <div>
                <label style={labelStyle}>Description (optional)</label>
                <input type="text" value={newQR.description} onChange={e=>setNewQR(p=>({...p,description:e.target.value}))}
                  placeholder="e.g. Preferred payment option"
                  style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              </div>

              {/* Preview */}
              {newQR.upiId && <QRPreview upiId={newQR.upiId} name={newQR.name} amount={previewAmount} />}

              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <span style={{ color:'#666', fontSize:'12px', flexShrink:0 }}>Preview ₹</span>
                <input type="number" value={previewAmount} onChange={e=>setPreviewAmount(Number(e.target.value))}
                  style={{ ...inputStyle, width:'100px' }}
                  onFocus={e=>e.target.style.borderColor='#4488ff'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              </div>

              <button onClick={addQR} disabled={addingQR||!newQR.upiId} style={{
                width:'100%', padding:'12px',
                background:addingQR||!newQR.upiId?'rgba(201,162,39,0.2)':'linear-gradient(135deg,#c9a227,#f0c84a)',
                border:'none', borderRadius:'9px', color:addingQR||!newQR.upiId?'rgba(0,0,0,0.4)':'#0a0a0f',
                fontSize:'14px', fontWeight:'800', cursor:addingQR||!newQR.upiId?'not-allowed':'pointer', textTransform:'uppercase'
              }}>
                {addingQR ? 'Adding...' : '➕ Add QR Code'}
              </button>
            </div>
          </div>

          {/* Existing QR codes */}
          <div>
            <div style={{ background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'14px', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #2a2a3a' }}>
                <h3 style={{ color:'white', fontSize:'15px', fontWeight:'700' }}>📋 Active QR Codes ({qrCodes.length})</h3>
              </div>
              {qrCodes.length === 0 ? (
                <div style={{ padding:'30px', textAlign:'center', color:'#444', fontSize:'14px' }}>
                  No QR codes added yet.<br/>Add one using the form on the left.
                </div>
              ) : qrCodes.map((qr, i) => (
                <div key={i} style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:'12px', alignItems:'flex-start', flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:'150px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                      <span style={{ fontSize:'14px', fontWeight:'700', color:'white' }}>{qr.name || qr.upiId}</span>
                      <span style={{ padding:'2px 6px', borderRadius:'4px', fontSize:'10px', fontWeight:'700', background:qr.active?'rgba(0,208,132,0.15)':'rgba(255,68,68,0.15)', color:qr.active?'#00d084':'#ff4444' }}>
                        {qr.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div style={{ fontSize:'12px', color:'#c9a227', marginBottom:'2px', wordBreak:'break-all' }}>{qr.upiId}</div>
                    {qr.description && <div style={{ fontSize:'11px', color:'#555' }}>{qr.description}</div>}
                    {/* Mini QR preview */}
                    <div style={{ marginTop:'10px' }}>
                      <QRPreview upiId={qr.upiId} name={qr.name} amount={previewAmount} />
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', flexShrink:0 }}>
                    <button onClick={()=>toggleQR(i)} style={{
                      padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:'700',
                      background:qr.active?'rgba(255,68,68,0.12)':'rgba(0,208,132,0.12)',
                      border:`1px solid ${qr.active?'rgba(255,68,68,0.3)':'rgba(0,208,132,0.3)'}`,
                      color:qr.active?'#ff4444':'#00d084', cursor:'pointer'
                    }}>{qr.active ? 'Disable' : 'Enable'}</button>
                    <button onClick={()=>deleteQR(i)} style={{
                      padding:'5px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:'700',
                      background:'rgba(255,68,68,0.08)', border:'1px solid rgba(255,68,68,0.2)',
                      color:'#ff4444', cursor:'pointer'
                    }}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Rate info */}
            <div style={{ marginTop:'12px', padding:'12px 16px', background:'rgba(201,162,39,0.06)', border:'1px solid rgba(201,162,39,0.15)', borderRadius:'10px', fontSize:'13px' }}>
              <div style={{ color:'#c9a227', fontWeight:'700', marginBottom:'4px' }}>💰 Payment Rate</div>
              <div style={{ color:'#888' }}>₹1 = 🪙 1 coin (1:1 fixed rate)</div>
              <div style={{ color:'#666', fontSize:'11px', marginTop:'2px' }}>Minimum deposit: ₹{minDeposit} | Min withdraw: ₹{minWithdraw}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── SITE TAB ── */}
      {tab === 'site' && (
        <div style={{ background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'14px', padding:'22px', maxWidth:'540px' }}>
          <h3 style={{ color:'white', fontSize:'15px', fontWeight:'700', marginBottom:'18px' }}>🌐 Site Configuration</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <label style={labelStyle}>Site Name</label>
              <input type="text" value={siteName} onChange={e=>setSiteName(e.target.value)} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
            </div>
            <div>
              <label style={labelStyle}>Welcome Bonus (coins)</label>
              <input type="number" value={welcomeBonus} onChange={e=>setWelcomeBonus(Math.max(0,Number(e.target.value)))} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              <p style={{ color:'#555', fontSize:'11px', marginTop:'3px' }}>New users get this on signup</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label style={labelStyle}>Min Deposit (₹)</label>
                <input type="number" value={minDeposit} onChange={e=>setMinDeposit(Math.max(10,Number(e.target.value)))} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              </div>
              <div>
                <label style={labelStyle}>Min Withdraw (₹)</label>
                <input type="number" value={minWithdraw} onChange={e=>setMinWithdraw(Math.max(10,Number(e.target.value)))} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#c9a227'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Support Number</label>
                <input type="text" value={waNumber} onChange={e=>setWaNumber(e.target.value)} placeholder="+971553858340" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#25D366'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
                <p style={{ color:'#555', fontSize:'11px', marginTop:'3px' }}>Format: 91 + 10-digit number (e.g. 919876543210)</p>
              </div>
            </div>
            <div style={{ padding:'14px', background:'#1e1e2a', borderRadius:'10px', border:'1px solid #2a2a3a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:'white', fontSize:'14px', fontWeight:'600' }}>Maintenance Mode</div>
                <div style={{ color:'#555', fontSize:'11px', marginTop:'2px' }}>Only admins can access when ON</div>
              </div>
              <button onClick={()=>setMaintenanceMode(!maintenanceMode)} style={{
                width:'48px', height:'26px', borderRadius:'13px', border:'none', cursor:'pointer',
                background:maintenanceMode?'#ff4444':'#2a2a3a', transition:'background 0.3s', position:'relative', flexShrink:0
              }}>
                <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'white', position:'absolute', top:'3px', left:maintenanceMode?'25px':'3px', transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
              </button>
            </div>
            <button onClick={saveSite} disabled={saving} style={{
              padding:'13px', background:saving?'rgba(201,162,39,0.3)':'linear-gradient(135deg,#c9a227,#f0c84a)',
              border:'none', borderRadius:'9px', color:saving?'rgba(0,0,0,0.4)':'#0a0a0f',
              fontSize:'14px', fontWeight:'800', cursor:saving?'not-allowed':'pointer', textTransform:'uppercase'
            }}>{saving ? 'Saving...' : '💾 Save Settings'}</button>
          </div>
        </div>
      )}

      {/* ── PASSWORD TAB ── */}
      {tab === 'pw' && (
        <div style={{ background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'14px', padding:'22px', maxWidth:'440px' }}>
          <h3 style={{ color:'white', fontSize:'15px', fontWeight:'700', marginBottom:'18px' }}>🔐 Change Password</h3>
          <form onSubmit={changePw} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { label:'Current Password', key:'current', placeholder:'Enter current password' },
              { label:'New Password', key:'newPw', placeholder:'Min 6 characters' },
              { label:'Confirm New Password', key:'confirm', placeholder:'Repeat new password' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type="password" value={pwForm[key]} onChange={e=>setPwForm(p=>({...p,[key]:e.target.value}))}
                  required placeholder={placeholder} style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#9944ff'} onBlur={e=>e.target.style.borderColor='#2a2a3a'} />
              </div>
            ))}
            {pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
              <div style={{ color:'#ff4444', fontSize:'12px' }}>⚠️ Passwords do not match</div>
            )}
            <button type="submit" disabled={saving} style={{
              padding:'13px', background:saving?'rgba(153,68,255,0.3)':'linear-gradient(135deg,#9944ff,#7722cc)',
              border:'none', borderRadius:'9px', color:saving?'rgba(255,255,255,0.3)':'white',
              fontSize:'14px', fontWeight:'800', cursor:saving?'not-allowed':'pointer', textTransform:'uppercase'
            }}>{saving ? 'Changing...' : '🔐 Change Password'}</button>
          </form>
        </div>
      )}
    </div>
  )
}
