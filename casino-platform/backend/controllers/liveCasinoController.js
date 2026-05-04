import crypto from 'crypto'
import fetch from 'node-fetch'
import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import Bet from '../models/Bet.js'

const TOKEN  = process.env.SOFTAPI_TOKEN  || '4ca69f5fad0148b3bf8d0c456a264d41'
const SECRET = process.env.SOFTAPI_SECRET || '7cb0d561997f7a0821fa3fcabc673de2'
const SERVER = process.env.SOFTAPI_SERVER || 'https://igamingapis.live/api/v1'

function encryptPayload(data, key) {
  if (key.length !== 32) throw new Error('Secret key must be exactly 32 characters')
  const json      = JSON.stringify(data)
  const cipher    = crypto.createCipheriv('aes-256-ecb', Buffer.from(key), null)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  return encrypted.toString('base64')
}

export const LIVE_GAMES = [
  // Table / Cards
  { game_uid: '11521', name: '1 Day Dragon Tiger',  category: 'table',   hot: true,  new: false },
  { game_uid: '11509', name: '10-10 Cricket',        category: 'table',   hot: true,  new: false },
  { game_uid: '11523', name: '20-20 Teen Patti',     category: 'table',   hot: true,  new: false },
  { game_uid: '11527', name: '29 Baccarat',          category: 'table',   hot: false, new: false },
  { game_uid: '11416', name: '3 Cards Judgement',    category: 'table',   hot: false, new: false },
  { game_uid: '11419', name: '32 Cards',             category: 'table',   hot: false, new: false },
  { game_uid: '11522', name: '5 Five Cricket',       category: 'table',   hot: true,  new: false },
  { game_uid: '11516', name: '6 Player Poker',       category: 'table',   hot: false, new: false },
  { game_uid: '11499', name: 'AK47 Teen Patti',      category: 'table',   hot: true,  new: false },
  { game_uid: '11460', name: 'AK47 VR',              category: 'table',   hot: true,  new: true  },
  { game_uid: '11417', name: 'Amar Akbar Anthony',   category: 'table',   hot: false, new: false },
  // Lottery
  { game_uid: '11471', name: '5D Lottery 1',         category: 'lottery', hot: false, new: false },
  { game_uid: '11468', name: '5D Lottery 10',        category: 'lottery', hot: false, new: false },
  { game_uid: '11470', name: '5D Lottery 3',         category: 'lottery', hot: false, new: false },
  { game_uid: '11469', name: '5D Lottery 5',         category: 'lottery', hot: false, new: false },
]

export const getLiveGames = async (req, res) => {
  try {
    const { category } = req.query
    const games = category && category !== 'all'
      ? LIVE_GAMES.filter(g => g.category === category)
      : LIVE_GAMES
    res.json({ success: true, games, total: games.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const launchGame = async (req, res) => {
  try {
    const { game_uid, language = 'hi', currency_code = 'INR' } = req.body
    const user = await User.findById(req.user._id)
    if (!user)          return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' })

    const FRONTEND = process.env.FRONTEND_URL || 'https://casino-platform-1.onrender.com'
    const BACKEND  = process.env.BACKEND_URL  || 'https://casino-platform-8os6.onrender.com'

    const payload = {
      user_id: String(parseInt(String(user._id).slice(-6), 16) % 900000 + 100000),
      balance:       parseFloat(user.balance.toFixed(2)) || 0,
      game_uid:      String(game_uid),
      token:         TOKEN,
      timestamp:     Date.now(),
      return:        `${FRONTEND}/live-casino/return`,
      callback:      `${BACKEND}/api/live-casino/callback`,
      currency_code,
      language,
    }

    const encrypted = encryptPayload(payload, SECRET)
    const launchUrl = `${SERVER}?payload=${encodeURIComponent(encrypted)}&token=${encodeURIComponent(TOKEN)}`

    const apiResp = await fetch(launchUrl, { method: 'GET' })
      .catch(err => { throw new Error(`API unreachable: ${err.message}`) })

    const apiData = await apiResp.json()

    if (apiData.code !== 0) {
      return res.status(400).json({ success: false, message: apiData.msg || 'Launch failed', code: apiData.code })
    }

    console.log(`Game launched: user=${user.username} game=${game_uid}`)
    res.json({ success: true, gameUrl: apiData.data?.url, game_uid, balance: user.balance })
  } catch (err) {
    console.error('launchGame error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

export const gameCallback = async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { game_uid, game_round, member_account, bet_amount, win_amount } = req.body
    if (!member_account || bet_amount === undefined || win_amount === undefined) {
      return res.json({ credit_amount: -1, error: 'Missing fields' })
    }
    const bet  = parseFloat(bet_amount) || 0
    const win  = parseFloat(win_amount) || 0
    const net  = win - bet
    // member_account is the user_id (MongoDB _id string) sent during launch
    // member_account = softapi numeric id we sent
    // Find user by matching the same formula
    const allUsers = await User.find({}).select('_id balance totalBets totalWon totalLost')
    let user = null
    for (const u of allUsers) {
      const uid = String(parseInt(String(u._id).slice(-6), 16) % 900000 + 100000)
      if (uid === String(member_account)) { user = u; break }
    }
    if (!user) return res.json({ credit_amount: -1, error: 'User not found: ' + member_account })
    const balanceBefore = user.balance
    user.balance = Math.max(0, user.balance + net)
    await user.save()
    await Bet.create({
      userId: user._id, game: `live_${game_uid}`,
      betAmount: bet, payout: win, profit: net,
      status: win >= bet ? 'won' : 'lost',
      result: { game_uid, game_round }, settledAt: new Date(),
    })
    if (net !== 0) {
      await WalletTransaction.create({
        userId: user._id, type: net > 0 ? 'game_win' : 'game_bet',
        amount: Math.abs(net), balanceBefore, balanceAfter: user.balance,
        description: `Mac88 Game ${game_uid}`,
      })
    }
    res.json({ credit_amount: parseFloat(Math.max(0, bet - win).toFixed(2)), timestamp: Date.now() })
  } catch (err) {
    res.json({ credit_amount: -1, error: err.message })
  }
}

export const getLiveBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance username')
    if (!user) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, balance: user.balance, username: user.username })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
