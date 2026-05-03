/**
 * Live Casino Controller — SoftAPI Integration
 * Handles game launch (AES-256-ECB encrypted), callbacks, and balance sync
 */

import crypto from 'crypto'
import fetch from 'node-fetch'
import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import Bet from '../models/Bet.js'

const TOKEN  = process.env.SOFTAPI_TOKEN  || '4ca69f5fad0148b3bf8d0c456a264d41'
const SECRET = process.env.SOFTAPI_SECRET || '7cb0d561997f7a0821fa3fcabc673de2'
const SERVER = process.env.SOFTAPI_SERVER || 'https://igamingapis.live/api/v1'

// ─── AES-256-ECB Encryption ────────────────────────────────────────────────
function encryptPayload(data, key) {
  if (key.length !== 32) throw new Error('Secret key must be exactly 32 characters')
  const json    = JSON.stringify(data)
  const cipher  = crypto.createCipheriv('aes-256-ecb', Buffer.from(key), null)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  return encrypted.toString('base64')
}

// ─── Game catalogue (uid, name, image, category) ──────────────────────────
// These come from the SoftAPI/JILI game library.
// Update game_uid values with the actual codes from the Google Drive folder.
export const LIVE_GAMES = [
  // ── Slots ──
  { game_uid: '7916',  name: 'Fortune Gems',       category: 'slots',    image: 'https://i.imgur.com/Z5Yv8kA.png',   hot: true,  new: false },
  { game_uid: '7917',  name: 'Super Ace',           category: 'slots',    image: 'https://i.imgur.com/mQf3n9P.png',   hot: true,  new: false },
  { game_uid: '7918',  name: 'Crazy 777',           category: 'slots',    image: 'https://i.imgur.com/K4xJlLc.png',   hot: false, new: false },
  { game_uid: '7919',  name: 'Money Coming',        category: 'slots',    image: 'https://i.imgur.com/Tg6bQvR.png',   hot: false, new: true  },
  { game_uid: '7920',  name: 'Alibaba',             category: 'slots',    image: 'https://i.imgur.com/L2mPc8A.png',   hot: false, new: false },
  { game_uid: '7921',  name: 'Jungle King',         category: 'slots',    image: 'https://i.imgur.com/9hXkW4Z.png',   hot: false, new: false },
  { game_uid: '7922',  name: 'Lucky Coming',        category: 'slots',    image: 'https://i.imgur.com/RNqpLaE.png',   hot: false, new: true  },
  { game_uid: '7923',  name: 'Ocean King 3+',       category: 'slots',    image: 'https://i.imgur.com/BJLwKhQ.png',   hot: true,  new: false },

  // ── Table / Cards ──
  { game_uid: '7924',  name: 'Baccarat',            category: 'table',    image: 'https://i.imgur.com/UxCvAjN.png',   hot: true,  new: false },
  { game_uid: '7925',  name: 'Dragon Tiger',        category: 'table',    image: 'https://i.imgur.com/1KbPQyR.png',   hot: true,  new: false },
  { game_uid: '7926',  name: 'Teen Patti',          category: 'table',    image: 'https://i.imgur.com/XGf7Qp2.png',   hot: true,  new: false },
  { game_uid: '7927',  name: 'Andar Bahar',         category: 'table',    image: 'https://i.imgur.com/n7VWrJb.png',   hot: true,  new: false },
  { game_uid: '7928',  name: 'Rummy',               category: 'table',    image: 'https://i.imgur.com/Ac8kFgH.png',   hot: false, new: false },
  { game_uid: '7929',  name: 'Blackjack',           category: 'table',    image: 'https://i.imgur.com/5TpIaLQ.png',   hot: false, new: false },

  // ── Fishing ──
  { game_uid: '7930',  name: 'Dinosaur Tycoon',     category: 'fishing',  image: 'https://i.imgur.com/VaqnWuM.png',   hot: true,  new: false },
  { game_uid: '7931',  name: 'Royal Fishing',       category: 'fishing',  image: 'https://i.imgur.com/EQi3p6X.png',   hot: false, new: false },
  { game_uid: '7932',  name: 'Jackpot Fishing',     category: 'fishing',  image: 'https://i.imgur.com/7qfSvCk.png',   hot: false, new: true  },
  { game_uid: '7933',  name: 'Mega Fishing',        category: 'fishing',  image: 'https://i.imgur.com/PqBkRLw.png',   hot: true,  new: false },

  // ── Arcade ──
  { game_uid: '7934',  name: 'Mines Gold',          category: 'arcade',   image: 'https://i.imgur.com/CXrBqG4.png',   hot: false, new: true  },
  { game_uid: '7935',  name: 'Color Game',          category: 'arcade',   image: 'https://i.imgur.com/zJI3V0T.png',   hot: true,  new: false },
  { game_uid: '7936',  name: 'Plinko',              category: 'arcade',   image: 'https://i.imgur.com/Mc8WbLo.png',   hot: false, new: true  },
]

// ─── GET /api/live-casino/games ────────────────────────────────────────────
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

// ─── POST /api/live-casino/launch ─────────────────────────────────────────
export const launchGame = async (req, res) => {
  try {
    const { game_uid, language = 'en', currency_code = 'INR' } = req.body
    const userId = req.user._id

    // Load user from DB
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account is blocked' })

    // Unique session ID per launch
    const sessionId = `${user._id}_${game_uid}_${Date.now()}`

    const payload = {
      user_id:       String(user._id),
      balance:       Number(user.balance.toFixed(2)),
      game_uid:      String(game_uid),
      token:         TOKEN,
      timestamp:     Date.now(),
      return:        process.env.SOFTAPI_RETURN_URL || `${process.env.FRONTEND_URL || 'https://casino-platform-1.onrender.com'}/live-casino/return`,
      callback:      process.env.SOFTAPI_CALLBACK_URL || `${process.env.BACKEND_URL || 'https://casino-platform-8os6.onrender.com'}/api/live-casino/callback`,
      currency_code,
      language,
    }

    // Encrypt payload
    const encrypted = encryptPayload(payload, SECRET)
    const launchUrl = `${SERVER}?payload=${encodeURIComponent(encrypted)}&token=${encodeURIComponent(TOKEN)}`

    // Call SoftAPI
    const apiResp = await fetch(launchUrl, { method: 'GET', timeout: 15000 })
      .catch(err => { throw new Error(`SoftAPI unreachable: ${err.message}`) })

    const apiData = await apiResp.json()

    if (apiData.code !== 0) {
      return res.status(400).json({ success: false, message: apiData.msg || 'Launch failed', code: apiData.code })
    }

    // Log the launch
    console.log(`🎮 Live game launched — user: ${user.username}, game: ${game_uid}, session: ${sessionId}`)

    res.json({
      success:    true,
      gameUrl:    apiData.data?.url,
      sessionId,
      balance:    user.balance,
      game_uid,
    })
  } catch (err) {
    console.error('launchGame error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── POST /api/live-casino/callback ───────────────────────────────────────
// Called by SoftAPI after every bet/win round.
// NO auth middleware — this is a server-to-server call.
export const gameCallback = async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  try {
    const { game_uid, game_round, member_account, bet_amount, win_amount, timestamp } = req.body

    if (!member_account || bet_amount === undefined || win_amount === undefined) {
      return res.json({ credit_amount: -1, error: 'Missing required fields' })
    }

    const bet  = parseFloat(bet_amount)  || 0
    const win  = parseFloat(win_amount)  || 0
    const net  = win - bet               // positive = user won, negative = user lost

    // Find user
    const user = await User.findById(member_account)
    if (!user) {
      console.warn(`⚠️  Callback: user not found — ${member_account}`)
      return res.json({ credit_amount: -1, error: 'User not found' })
    }

    const balanceBefore = user.balance

    // Apply net change (deduct bet, add win)
    user.balance = Math.max(0, user.balance + net)
    await user.save()

    // Record as a Bet document
    await Bet.create({
      userId:    user._id,
      game:      `live_${game_uid}`,
      betAmount: bet,
      payout:    win,
      profit:    net,
      status:    win >= bet ? 'won' : 'lost',
      result:    { game_uid, game_round, timestamp },
      settledAt: new Date(),
    })

    // Wallet transaction
    if (net !== 0) {
      await WalletTransaction.create({
        userId:        user._id,
        type:          net > 0 ? 'game_win' : 'game_bet',
        amount:        Math.abs(net),
        balanceBefore,
        balanceAfter:  user.balance,
        description:   `Live Casino — Game ${game_uid} Round ${game_round}`,
      })
    }

    // credit_amount = deduction to charge player (bet - win, min 0)
    const credit_amount = parseFloat(Math.max(0, bet - win).toFixed(2))

    console.log(`💳 Callback processed — user: ${user.username}, bet: ${bet}, win: ${win}, net: ${net.toFixed(2)}, newBal: ${user.balance.toFixed(2)}`)

    res.json({
      credit_amount,
      timestamp: Date.now(),
    })
  } catch (err) {
    console.error('gameCallback error:', err.message)
    res.json({ credit_amount: -1, error: err.message })
  }
}

// ─── GET /api/live-casino/balance ──────────────────────────────────────────
export const getLiveBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance username')
    if (!user) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, balance: user.balance, username: user.username })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
