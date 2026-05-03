import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { api } from '../App'

const S = { card: { background:'#16161f', border:'1px solid #2a2a3a', borderRadius:'12px' } }

function StatCard({ label, val, icon, color, sub }) {
  return (
    <div style={{ ...S.card, padding:'16px', borderLeft:`3px solid ${color}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
        <span style={{ color:'#666', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
        <span style={{ fontSize:'16px' }}>{icon}</span>
      </div>
      <div style={{ fontSize:'clamp(18px,3vw,24px)', fontWeight:'900', color:'white' }}>{val}</div>
      {sub && <div style={{ fontSize:'11px', color:'#555', marginTop:'2px' }}>{sub}</div>}
    </div>
  )
}

const WEEK = [
  { d:'Mon', bets:420, profit:38000 }, { d:'Tue', bets:580, profit:52000 },
  { d:'Wed', bets:390, profit:28000 }, { d:'Thu', bets:720, profit:65000 },
  { d:'Fri', bets:890, profit:82000 }, { d:'Sat', bets:1100, profit:98000 },
  { d:'Sun', bets:950, profit:74000 },
]

const tipStyle = { background:'#1e1e2a', border:'1px solid #c9a227', borderRadius:'8px', color:'white', fontSize:'12px' }

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(e => { setErr(e.response?.data?.message || 'Backend not running'); setLoading(false); setStats({ totalUsers:0, blockedUsers:0, totalBets:0, totalWagered:0, houseProfit:0, wonBets:0, lostBets:0, recentBets:[], newUsersToday:0 }) })
  }, [])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}><div style={{ width:'36px', height:'36px', border:'3px solid #2a2a3a', borderTopColor:'#c9a227', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /></div>

  const wr = stats.totalBets > 0 ? ((stats.wonBets / stats.totalBets) * 100).toFixed(1) : '0.0'

  return (
    <div>
      {err && <div style={{ padding:'12px 16px', background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.25)', borderRadius:'8px', marginBottom:'18px', color:'#ff6666', fontSize:'13px' }}>⚠️ {err}</div>}

      <div style={{ marginBottom:'20px' }}>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(18px,4vw,22px)', color:'#c9a227', marginBottom:'3px' }}>Dashboard</h1>
        <p style={{ color:'#555', fontSize:'12px' }}>Platform overview & live stats</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'12px', marginBottom:'18px' }}>
        <StatCard label="Users" val={stats.totalUsers?.toLocaleString()} icon="👥" color="#4488ff" sub={`+${stats.newUsersToday} today`} />
        <StatCard label="Total Bets" val={stats.totalBets?.toLocaleString()} icon="🎲" color="#c9a227" />
        <StatCard label="House Profit" val={`🪙${(stats.houseProfit||0).toLocaleString()}`} icon="💰" color="#00d084" />
        <StatCard label="Wagered" val={`🪙${(stats.totalWagered||0).toLocaleString()}`} icon="📈" color="#9944ff" />
        <StatCard label="Won Bets" val={stats.wonBets?.toLocaleString()} icon="✅" color="#00d084" />
        <StatCard label="Lost Bets" val={stats.lostBets?.toLocaleString()} icon="❌" color="#ff4444" />
        <StatCard label="Win Rate" val={`${wr}%`} icon="📊" color="#c9a227" />
        <StatCard label="Blocked" val={stats.blockedUsers||0} icon="🚫" color="#ff4444" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'14px', marginBottom:'18px' }}>
        <div style={{ ...S.card, padding:'16px' }}>
          <div style={{ color:'#c9a227', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>📊 Weekly Bets</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEK}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="d" tick={{ fill:'#555', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} />
              <Bar dataKey="bets" fill="#c9a227" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...S.card, padding:'16px' }}>
          <div style={{ color:'#00d084', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'14px' }}>📈 Profit Trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={WEEK}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="d" tick={{ fill:'#555', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ ...tipStyle, border:'1px solid #00d084' }} />
              <Line type="monotone" dataKey="profit" stroke="#00d084" strokeWidth={2} dot={{ r:3, fill:'#00d084' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bets */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #2a2a3a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'white', fontSize:'14px', fontWeight:'700' }}>Recent Bets</span>
          <Link to="/bets" style={{ color:'#c9a227', fontSize:'12px' }}>View All →</Link>
        </div>
        <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          <table style={{ minWidth:'480px' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #1e1e2a', background:'rgba(255,255,255,0.02)' }}>
                {['User','Game','Bet','Payout','Status','Time'].map(h => (
                  <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:'10px', color:'#444', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!stats.recentBets?.length
                ? <tr><td colSpan={6} style={{ padding:'30px', textAlign:'center', color:'#444', fontSize:'13px' }}>No bets yet</td></tr>
                : stats.recentBets.map((bet,i) => (
                  <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.025)' }}>
                    <td style={{ padding:'10px 14px', fontSize:'13px', color:'#aaa' }}>{bet.userId?.username||'—'}</td>
                    <td style={{ padding:'10px 14px', fontSize:'12px', color:'white', textTransform:'capitalize' }}>{bet.game?.replace(/-/g,' ')}</td>
                    <td style={{ padding:'10px 14px', fontSize:'13px', color:'#c9a227', fontWeight:'700' }}>🪙{bet.betAmount}</td>
                    <td style={{ padding:'10px 14px', fontSize:'13px', color:bet.payout>0?'#00d084':'#ff4444', fontWeight:'700' }}>
                      {bet.payout>0?`+${bet.payout}`:`−${bet.betAmount}`}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ padding:'2px 7px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', background:bet.status==='won'?'rgba(0,208,132,0.15)':bet.status==='pending'?'rgba(201,162,39,0.15)':'rgba(255,68,68,0.15)', color:bet.status==='won'?'#00d084':bet.status==='pending'?'#c9a227':'#ff4444' }}>
                        {bet.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:'10px', color:'#444', whiteSpace:'nowrap' }}>
                      {bet.createdAt?new Date(bet.createdAt).toLocaleString():'—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
