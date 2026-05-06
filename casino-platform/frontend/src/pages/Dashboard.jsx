import React, { useState, useEffect } from 'react'
import { useStore, api } from '../store/useStore'
import toast from 'react-hot-toast'

const GAME_ICONS = {
  'aviator':'✈️','crash-rocket':'🚀','color-prediction':'🎨','roulette':'🎡',
  'blackjack':'🃏','baccarat':'🎴','teen-patti':'♠️','andar-bahar':'🎯',
  'poker':'♣️','slots':'🎰','dragon-tiger':'🐉','sic-bo':'🎲','dice':'⚀',
  'lucky-wheel':'🎡','mines':'💎','plinko':'⚡','chicken-road':'🐔',
  'tower':'🗼','hi-lo':'📈','spin-win':'🎪'
}

function Stat({ label, value, color, icon, sub }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${color}22`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '10px',
      padding: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '15px' }}>{icon}</span>
      </div>
      <div style={{ fontSize: 'clamp(16px,3vw,20px)', fontWeight: '900', color }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user, balance } = useStore()
  const [bets, setBets] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState(500)
  const [utrId, setUtrId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotName, setScreenshotName] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [qrCodes, setQrCodes] = useState([])
  const [qrLoading, setQrLoading] = useState(false)
  const [selectedQR, setSelectedQR] = useState(null)
  const [withdrawAmount, setWithdrawAmount] = useState(500)
  const [withdrawUPI, setWithdrawUPI] = useState('')
  const [withdrawName, setWithdrawName] = useState('')
  const [withdrawHistory, setWithdrawHistory] = useState([])
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/bets/history?limit=100').catch(() => ({ data: { bets: [] } })),
      api.get('/wallet/withdrawals').catch(() => ({ data: { requests: [] } }))
    ]).then(([betsRes, wdRes]) => {
      setBets(betsRes.data?.bets || [])
      setWithdrawHistory(wdRes.data?.requests || [])
    }).finally(() => setLoading(false))
  }, [])

  // ── Computed Stats ──
  const totalBets = bets.length
  const wonBets = bets.filter(b => b.status === 'won')
  const lostBets = bets.filter(b => b.status === 'lost')
  const totalWagered = bets.reduce((s, b) => s + (b.betAmount || 0), 0)
  const totalPayout = bets.reduce((s, b) => s + (b.payout || 0), 0)
  const totalWonAmount = wonBets.reduce((s, b) => s + ((b.payout || 0) - (b.betAmount || 0)), 0)
  const totalLostAmount = lostBets.reduce((s, b) => s + (b.betAmount || 0), 0)
  const netPL = totalPayout - totalWagered
  const winRate = totalBets > 0 ? ((wonBets.length / totalBets) * 100).toFixed(1) : '0.0'
  const biggestWin = wonBets.length > 0 ? Math.max(...wonBets.map(b => (b.payout || 0) - (b.betAmount || 0))) : 0

  // ── Per game stats ──
  const gameStats = {}
  bets.forEach(b => {
    if (!b.game) return
    if (!gameStats[b.game]) gameStats[b.game] = { game: b.game, bets: 0, won: 0, lost: 0, wagered: 0, payout: 0 }
    const g = gameStats[b.game]; g.bets++; g.wagered += b.betAmount || 0; g.payout += b.payout || 0
    if (b.status === 'won') g.won++; else if (b.status === 'lost') g.lost++
  })
  const gameStatsArr = Object.values(gameStats).sort((a, b) => b.bets - a.bets)

  // ── QR ──
  const generateQRCodes = async () => {
    if (depositAmount < 100) return toast.error('Minimum deposit is ₹100')
    setQrLoading(true); setSelectedQR(null); setQrCodes([])
    try {
      const { data } = await api.get(`/wallet/qr-all?amount=${depositAmount}&_t=${Date.now()}`)
      setQrCodes(data.qrCodes || [])
      if (data.qrCodes?.length > 0) setSelectedQR(0)
      toast.success('🔄 QR generated!')
    } catch {
      const nonce = Date.now()
      const upiString = `upi://pay?pa=newmahadevgaming@upi&pn=New Mahadev Gaming&am=${depositAmount}&cu=INR&tn=RB${nonce}`
      setQrCodes([{ upiId: 'newmahadevgaming@upi', name: 'New Mahadev Gaming Casino', amount: depositAmount, coins: depositAmount, txnRef: `RB${nonce}`, qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&margin=10&_nc=${nonce}` }])
      setSelectedQR(0)
    }
    setQrLoading(false)
  }

  // ── Withdraw ──
  const submitWithdraw = async () => {
    if (withdrawAmount < 100) return toast.error('Minimum withdrawal ₹100')
    if (!withdrawUPI.trim()) return toast.error('Enter your UPI ID')
    if (withdrawAmount > balance) return toast.error('Insufficient balance')
    setWithdrawing(true)
    try {
      const { data } = await api.post('/wallet/withdraw', { amount: withdrawAmount, upiId: withdrawUPI, upiName: withdrawName })
      toast.success(data.message)
      setWithdrawHistory(prev => [{ type: 'withdraw_pending', amount: withdrawAmount, withdrawStatus: 'pending', upiId: withdrawUPI, createdAt: new Date() }, ...prev])
      setWithdrawAmount(500); setWithdrawUPI(''); setWithdrawName('')
    } catch (err) { toast.error(err.response?.data?.message || 'Withdraw failed') }
    setWithdrawing(false)
  }

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'history', label: '🎲 Bet History' },
    { id: 'games', label: '🎮 Game Stats' },
    { id: 'deposit', label: '💳 Deposit' },
    { id: 'withdraw', label: '💸 Withdraw' },
  ]

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-hover)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'white', fontSize: '16px', outline: 'none'
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(18px,4vw,26px)', marginBottom: '16px' }}>
        👤 <span className="gold-text">Dashboard</span>
      </h1>

      {/* Profile bar */}
      <div style={{ background: 'linear-gradient(135deg,rgba(201,162,39,0.08),rgba(153,68,255,0.06))', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#9944ff,#4488ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', flexShrink: 0 }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>{user?.username}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{user?.phone ? `📱 +91${user.phone}` : user?.email}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', color: 'var(--gold)', fontWeight: '700', fontSize: '14px' }}>🪙 {balance.toLocaleString()}</div>
          <div style={{ padding: '6px 14px', borderRadius: '20px', background: netPL >= 0 ? 'rgba(0,208,132,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${netPL >= 0 ? 'rgba(0,208,132,0.3)' : 'rgba(255,68,68,0.3)'}`, color: netPL >= 0 ? '#00d084' : '#ff4444', fontWeight: '700', fontSize: '13px' }}>
            {netPL >= 0 ? '📈 +' : '📉 '}{Math.abs(netPL).toLocaleString()} P&L
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid var(--border)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 14px', background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`,
            color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontWeight: tab === t.id ? '700' : '400', fontSize: '13px',
            cursor: 'pointer', marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {tab === 'overview' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          {/* 8 stat cards — ALL always visible */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '10px', marginBottom: '18px' }}>
            <Stat label="Balance" value={`🪙 ${balance.toLocaleString()}`} color="#c9a227" icon="💰" />
            <Stat label="Total Bets" value={totalBets.toLocaleString()} color="#4488ff" icon="🎲" sub={`${wonBets.length}W / ${lostBets.length}L`} />
            <Stat label="Win Rate" value={`${winRate}%`} color="#00d084" icon="📊" sub={`${wonBets.length} wins`} />
            <Stat label="Net P&L" value={`${netPL >= 0 ? '+' : ''}${netPL.toLocaleString()} 🪙`} color={netPL >= 0 ? '#00d084' : '#ff4444'} icon={netPL >= 0 ? '📈' : '📉'} />
            <Stat label="Won Amount" value={`+${totalWonAmount.toLocaleString()} 🪙`} color="#00d084" icon="✅" sub={`${wonBets.length} bets won`} />
            <Stat label="Lost Amount" value={`-${totalLostAmount.toLocaleString()} 🪙`} color="#ff4444" icon="❌" sub={`${lostBets.length} bets lost`} />
            <Stat label="Total Wagered" value={`🪙 ${totalWagered.toLocaleString()}`} color="#9944ff" icon="📤" />
            <Stat label="Best Win" value={`+${biggestWin.toLocaleString()} 🪙`} color="#c9a227" icon="🏆" />
          </div>

          {/* Recent bets */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '13px' }}>
              Recent Activity {loading && <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '12px' }}>loading...</span>}
            </div>
            {!loading && bets.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No bets yet. Start playing! 🎮</div>
            ) : bets.slice(0, 6).map((bet, i) => {
              const pnl = bet.status === 'won' ? ((bet.payout || 0) - (bet.betAmount || 0)) : -(bet.betAmount || 0)
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{GAME_ICONS[bet.game] || '🎮'}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{bet.game?.replace(/-/g,' ')}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bet.createdAt ? new Date(bet.createdAt).toLocaleString() : ''}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: pnl >= 0 ? '#00d084' : '#ff4444' }}>
                      {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} 🪙
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bet: 🪙{bet.betAmount?.toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
            {bets.length > 0 && (
              <button onClick={() => setTab('history')} style={{ width: '100%', padding: '11px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', borderTop: '1px solid var(--border)' }}>
                View All Bet History →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══ BET HISTORY ══ */}
      {tab === 'history' && (
        <div>
          {/* Summary bar */}
          <div style={{ display: 'flex', gap: '14px', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[
              { l: 'Total', v: totalBets, c: 'white' },
              { l: 'Won', v: wonBets.length, c: '#00d084' },
              { l: 'Lost', v: lostBets.length, c: '#ff4444' },
              { l: 'Wagered', v: `🪙${totalWagered.toLocaleString()}`, c: '#c9a227' },
              { l: 'Net P&L', v: `${netPL >= 0 ? '+' : ''}${netPL.toLocaleString()}`, c: netPL >= 0 ? '#00d084' : '#ff4444' },
            ].map(s => (
              <div key={s.l} style={{ fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.l}: </span>
                <span style={{ color: s.c, fontWeight: '700' }}>{s.v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ minWidth: '500px', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Game','Bet','Payout','P&L','Result','Date'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                  ) : bets.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No bets yet. Start playing! 🎮</td></tr>
                  ) : bets.map((bet, i) => {
                    const pnl = bet.status === 'won' ? ((bet.payout || 0) - (bet.betAmount || 0)) : -(bet.betAmount || 0)
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '15px' }}>{GAME_ICONS[bet.game] || '🎮'}</span>
                            <span style={{ fontSize: '12px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{bet.game?.replace(/-/g,' ')}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#c9a227', fontWeight: '700', whiteSpace: 'nowrap' }}>🪙 {bet.betAmount?.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: bet.payout > 0 ? '#00d084' : '#555', whiteSpace: 'nowrap' }}>
                          {bet.payout > 0 ? `🪙 ${bet.payout?.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '800', color: pnl >= 0 ? '#00d084' : '#ff4444', whiteSpace: 'nowrap' }}>
                          {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} 🪙
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: bet.status === 'won' ? 'rgba(0,208,132,0.18)' : 'rgba(255,68,68,0.18)', color: bet.status === 'won' ? '#00d084' : '#ff4444' }}>
                            {bet.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {bet.createdAt ? new Date(bet.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ GAME STATS ══ */}
      {tab === 'games' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : gameStatsArr.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎮</div>
              No game history yet. Start playing!
            </div>
          ) : gameStatsArr.map(g => {
            const wr = g.bets > 0 ? ((g.won / g.bets) * 100).toFixed(0) : 0
            const pnl = g.payout - g.wagered
            return (
              <div key={g.game} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{GAME_ICONS[g.game] || '🎮'}</span>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', textTransform: 'capitalize', marginBottom: '3px' }}>{g.game?.replace(/-/g,' ')}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{g.bets} bets</span>
                    <span style={{ fontSize: '11px', color: '#00d084' }}>✅ {g.won} won</span>
                    <span style={{ fontSize: '11px', color: '#ff4444' }}>❌ {g.lost} lost</span>
                  </div>
                </div>
                <div style={{ minWidth: '85px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Win Rate</span>
                    <span style={{ color: '#00d084', fontWeight: '700' }}>{wr}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${wr}%`, background: 'linear-gradient(90deg,#00d084,#00a866)', borderRadius: '3px', transition: 'width 0.5s' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '85px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: pnl >= 0 ? '#00d084' : '#ff4444' }}>
                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} 🪙
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Net P&L</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══ DEPOSIT ══ */}
      {tab === 'deposit' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold)', fontSize: '15px', marginBottom: '14px' }}>💳 Deposit via UPI</h3>
            <div style={{ padding: '9px 12px', background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.18)', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>
              <span style={{ color: '#c9a227', fontWeight: '700' }}>₹1 = 🪙 1 coin</span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '10px' }}>Min: ₹100</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '7px', marginBottom: '12px' }}>
              {[100,200,500,1000,2000,5000].map(amt => (
                <button key={amt} onClick={() => { setDepositAmount(amt); setQrCodes([]); setSelectedQR(null) }} style={{
                  padding: '9px 6px', borderRadius: '7px', fontWeight: '700', fontSize: '12px',
                  background: depositAmount === amt ? 'rgba(201,162,39,0.2)' : 'var(--bg-hover)',
                  border: `1px solid ${depositAmount === amt ? 'var(--gold)' : 'var(--border)'}`,
                  color: depositAmount === amt ? 'var(--gold)' : 'var(--text-secondary)', cursor: 'pointer'
                }}>₹{amt >= 1000 ? `${amt/1000}K` : amt}</button>
              ))}
            </div>
            <input type="number" value={depositAmount} min={100}
              onChange={e => { setDepositAmount(Math.max(100, Number(e.target.value))); setQrCodes([]); setSelectedQR(null) }}
              style={{ ...inputStyle, textAlign: 'center', marginBottom: '12px' }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: 'rgba(0,208,132,0.07)', border: '1px solid rgba(0,208,132,0.18)', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>You pay: <strong style={{ color: 'var(--gold)' }}>₹{depositAmount}</strong></span>
              <span style={{ color: 'var(--text-secondary)' }}>You get: <strong style={{ color: '#00d084' }}>🪙{depositAmount}</strong></span>
            </div>
            <button onClick={generateQRCodes} disabled={qrLoading || depositAmount < 100} style={{
              width: '100%', padding: '12px',
              background: qrLoading ? 'rgba(201,162,39,0.25)' : 'linear-gradient(135deg,#c9a227,#f0c84a)',
              border: 'none', borderRadius: '9px', color: qrLoading ? 'rgba(0,0,0,0.35)' : '#0a0a0f',
              fontSize: '14px', fontWeight: '800', cursor: qrLoading ? 'wait' : 'pointer', textTransform: 'uppercase'
            }}>
              {qrLoading ? '⏳ Generating...' : qrCodes.length > 0 ? `💰 PAY NOW ₹${depositAmount}` : `📱 Generate QR for ₹${depositAmount}`}
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
            {qrCodes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontSize: '52px', marginBottom: '12px' }}>📱</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>Click "Generate QR" to get payment code</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Each generation gives a fresh, unique QR</p>
              </div>
            ) : (
              <>
                
                {selectedQR !== null && qrCodes[selectedQR] && (()=>{const qr=qrCodes[selectedQR];return(
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-block', padding: '12px', background: 'white', borderRadius: '10px', border: '3px solid var(--gold)', boxShadow: '0 0 20px rgba(201,162,39,0.25)', marginBottom: '10px' }}>
                        <img key={qr.qrUrl} src={qr.qrUrl} alt="QR" width={185} height={185} style={{ display: 'block' }} />
                      </div>
                      {qr.txnRef && (
                        <div style={{ background: 'rgba(153,68,255,0.08)', border: '1px solid rgba(153,68,255,0.2)', borderRadius: '7px', padding: '7px 12px', marginBottom: '9px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ref: <span style={{ color: '#9944ff', fontFamily: 'monospace', fontWeight: '700' }}>{qr.txnRef}</span></span>
                          <button onClick={() => { navigator.clipboard.writeText(qr.txnRef); toast.success('Copied!') }} style={{ padding: '2px 7px', background: 'rgba(153,68,255,0.15)', border: '1px solid rgba(153,68,255,0.3)', borderRadius: '4px', color: '#9944ff', fontSize: '10px', cursor: 'pointer' }}>📋</button>
                        </div>
                      )}

                      <div style={{ background: 'rgba(0,208,132,0.07)', border: '1px solid rgba(0,208,132,0.18)', borderRadius: '7px', padding: '9px', fontSize: '13px', fontWeight: '700', color: '#00d084', marginBottom: '8px' }}>₹{qr.amount} → 🪙 {qr.coins} coins</div>
                      <div style={{ marginTop: '14px' }}>
                        {/* UTR input */}
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>UTR / Transaction ID *</div>
                          <input
                            type="text"
                            placeholder="Enter 12-digit UTR or Transaction ID"
                            value={utrId}
                            onChange={e => setUtrId(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        {/* Screenshot upload */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Payment Screenshot *</div>
                          <label style={{ display: 'block', padding: '12px', background: 'var(--bg-hover)', border: '2px dashed var(--border)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={e => {
                                const f = e.target.files[0]
                                if (f) { setScreenshot(f); setScreenshotName(f.name) }
                              }}
                            />
                            {screenshotName ? (
                              <div style={{ color: '#00d084', fontSize: '12px' }}>✅ {screenshotName}</div>
                            ) : (
                              <div style={{ color: '#555', fontSize: '12px' }}>📷 Click to upload screenshot</div>
                            )}
                          </label>
                        </div>
                        {/* Submit button */}
                        <button onClick={submitDeposit} disabled={submitLoading}
                          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#b88a1a,#e8c840)', border: 'none', borderRadius: '8px', color: '#050200', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
                          {submitLoading ? '⏳ Submitting...' : '✅ Submit Deposit Request'}
                        </button>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.5, marginTop: '8px', textAlign: 'center' }}>Coins credited within 30 minutes after verification.</div>
                      </div>
                    </div>
                )})()}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ WITHDRAW ══ */}
      {tab === 'withdraw' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'Cinzel,serif', color: 'var(--gold)', fontSize: '15px', marginBottom: '10px' }}>💸 Withdraw Coins</h3>
            <div style={{ padding: '9px 12px', background: 'rgba(255,68,68,0.07)', border: '1px solid rgba(255,68,68,0.18)', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>
              <span style={{ color: '#ff6666', fontWeight: '700' }}>🪙 1 coin = ₹1</span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '10px' }}>Min: 🪙100 • Balance: 🪙{balance.toLocaleString()}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
              {[100,500,1000,5000].map(a => (
                <button key={a} onClick={() => setWithdrawAmount(a)} style={{ padding: '8px 4px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: withdrawAmount === a ? 'rgba(255,68,68,0.2)' : 'var(--bg-hover)', border: `1px solid ${withdrawAmount === a ? '#ff4444' : 'var(--border)'}`, color: withdrawAmount === a ? '#ff4444' : 'var(--text-secondary)', cursor: 'pointer' }}>🪙{a >= 1000 ? `${a/1000}K` : a}</button>
              ))}
            </div>
            <input type="number" value={withdrawAmount} min={100} onChange={e => setWithdrawAmount(Math.max(100, Number(e.target.value)))}
              style={{ ...inputStyle, textAlign: 'center', marginBottom: '10px' }}
              onFocus={e => e.target.style.borderColor = '#ff4444'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {[{ label: 'Your UPI ID *', val: withdrawUPI, set: setWithdrawUPI, ph: '9876543210@upi' }, { label: 'Name (optional)', val: withdrawName, set: setWithdrawName, ph: 'Name on UPI' }].map(({ label, val, set, ph }) => (
              <div key={label} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                <input type="text" value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#ff4444'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Give: <strong style={{ color: '#ff4444' }}>🪙{withdrawAmount}</strong></span>
              <span style={{ color: 'var(--text-secondary)' }}>Get: <strong style={{ color: '#00d084' }}>₹{withdrawAmount}</strong></span>
            </div>
            <button onClick={submitWithdraw} disabled={withdrawing || withdrawAmount > balance || !withdrawUPI} style={{
              width: '100%', padding: '12px', border: 'none', borderRadius: '9px',
              background: withdrawing ? 'rgba(255,68,68,0.25)' : withdrawAmount > balance || !withdrawUPI ? 'rgba(255,68,68,0.12)' : 'linear-gradient(135deg,#ff4444,#cc2222)',
              color: withdrawing || withdrawAmount > balance || !withdrawUPI ? 'rgba(255,255,255,0.35)' : 'white',
              fontSize: '14px', fontWeight: '800', cursor: withdrawing ? 'wait' : withdrawAmount > balance || !withdrawUPI ? 'not-allowed' : 'pointer', textTransform: 'uppercase'
            }}>
              {withdrawing ? '⏳ Submitting...' : withdrawAmount > balance ? '❌ Insufficient' : !withdrawUPI ? 'Enter UPI ID' : `💸 Withdraw ₹${withdrawAmount}`}
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '13px' }}>Withdrawal History</div>
            {withdrawHistory.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No withdrawals yet 💸</div>
            ) : withdrawHistory.map((wd, i) => {
              const sc = wd.withdrawStatus === 'approved' ? '#00d084' : wd.withdrawStatus === 'rejected' ? '#ff4444' : '#c9a227'
              return (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#ff6666' }}>₹{wd.amount?.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{wd.upiId} • {wd.createdAt ? new Date(wd.createdAt).toLocaleDateString('en-IN') : ''}</div>
                    </div>
                    <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: `${sc}15`, color: sc, border: `1px solid ${sc}30`, flexShrink: 0 }}>
                      {(wd.withdrawStatus || 'PENDING').toUpperCase()}
                    </span>
                  </div>
                  {wd.rejectionReason && <div style={{ marginTop: '5px', fontSize: '11px', color: '#ff6666', background: 'rgba(255,68,68,0.07)', padding: '5px 9px', borderRadius: '5px' }}>Reason: {wd.rejectionReason}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
//v102
