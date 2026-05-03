import User from '../models/User.js'
import Bet from '../models/Bet.js'
import WalletTransaction from '../models/WalletTransaction.js'
import Settings from '../models/Settings.js'

// ─── Users ───────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const skip = (page - 1) * limit
    const filter = search
      ? { $or: [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {}
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit)
    const total = await User.countDocuments(filter)
    res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    const bets = await Bet.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20)
    const transactions = await WalletTransaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20)
    // Calculate stats
    const totalWon = bets.filter(b => b.status === 'won').reduce((s, b) => s + (b.payout || 0), 0)
    const totalLost = bets.filter(b => b.status === 'lost').reduce((s, b) => s + b.betAmount, 0)
    const netPL = totalWon - bets.reduce((s, b) => s + b.betAmount, 0)
    res.json({ user, bets, transactions, stats: { totalWon, totalLost, netPL, totalBets: bets.length } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addCoins = async (req, res) => {
  try {
    const { amount, reason } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required.' })
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    const balanceBefore = user.balance
    user.balance += Number(amount)
    await user.save()
    await WalletTransaction.create({
      userId: user._id, type: 'admin_add', amount: Number(amount),
      balanceBefore, balanceAfter: user.balance,
      description: reason || `Admin added ${amount} coins`, adminId: req.user._id
    })
    res.json({ message: `Added ${amount} coins to ${user.username}`, newBalance: user.balance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const removeCoins = async (req, res) => {
  try {
    const { amount, reason } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required.' })
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    if (user.balance < amount) return res.status(400).json({ message: 'User has insufficient balance.' })
    const balanceBefore = user.balance
    user.balance -= Number(amount)
    await user.save()
    await WalletTransaction.create({
      userId: user._id, type: 'admin_remove', amount: Number(amount),
      balanceBefore, balanceAfter: user.balance,
      description: reason || `Admin removed ${amount} coins`, adminId: req.user._id
    })
    res.json({ message: `Removed ${amount} coins from ${user.username}`, newBalance: user.balance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const resetWallet = async (req, res) => {
  try {
    const { amount = 1000 } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    const balanceBefore = user.balance
    user.balance = Number(amount)
    await user.save()
    await WalletTransaction.create({
      userId: user._id, type: 'admin_reset', amount: Number(amount),
      balanceBefore, balanceAfter: user.balance,
      description: `Admin reset wallet to ${amount} coins`, adminId: req.user._id
    })
    res.json({ message: `Wallet reset to ${amount} for ${user.username}`, newBalance: user.balance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block admin.' })
    user.isBlocked = !user.isBlocked
    await user.save()
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`, isBlocked: user.isBlocked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Bets ─────────────────────────────────────────────────
export const getAllBets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 30
    const game = req.query.game
    const skip = (page - 1) * limit
    const filter = {}
    if (game) filter.game = game
    const bets = await Bet.find(filter).populate('userId', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit)
    const total = await Bet.countDocuments(filter)
    res.json({ bets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Dashboard Stats ──────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, blockedUsers, totalBets, revenueData, recentBets, newUsersToday] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ isBlocked: true }),
      Bet.countDocuments(),
      Bet.aggregate([{
        $group: {
          _id: null,
          totalWagered: { $sum: '$betAmount' },
          totalPayout: { $sum: '$payout' },
          wonBets: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          lostBets: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } }
        }
      }]),
      Bet.find().populate('userId', 'username').sort({ createdAt: -1 }).limit(10),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
    ])
    const rev = revenueData[0] || {}
    res.json({
      totalUsers, blockedUsers, totalBets,
      totalWagered: rev.totalWagered || 0,
      totalPayout: rev.totalPayout || 0,
      houseProfit: (rev.totalWagered || 0) - (rev.totalPayout || 0),
      wonBets: rev.wonBets || 0,
      lostBets: rev.lostBets || 0,
      recentBets, newUsersToday
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Create Admin ─────────────────────────────────────────
export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, adminSecret } = req.body
    if (adminSecret !== (process.env.ADMIN_SECRET || 'admin_panel_secret_key')) {
      return res.status(403).json({ message: 'Invalid admin secret key.' })
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) return res.status(409).json({ message: 'User with this email/username already exists.' })
    const admin = await User.create({ username, email, password, role: 'admin', balance: 999999 })
    res.status(201).json({ message: 'Admin created successfully.', user: admin.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Settings ─────────────────────────────────────────────
export const getSettings = async (req, res) => {
  try {
    const docs = await Settings.find({})
    const result = {}
    docs.forEach(d => { result[d.key] = d.value })
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const saveSettings = async (req, res) => {
  try {
    const entries = Object.entries(req.body)
    for (const [key, value] of entries) {
      await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
    }
    res.json({ message: 'Settings saved successfully.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' })
    }
    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' })
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Withdraw Management ─────────────────────────────────
export const getWithdrawRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const status = req.query.status // pending | approved | rejected
    const skip = (page - 1) * limit
    const filter = { type: { $in: ['withdraw_pending', 'withdraw_approved', 'withdraw_rejected'] } }
    if (status) filter.withdrawStatus = status
    const requests = await WalletTransaction.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
    const total = await WalletTransaction.countDocuments(filter)
    res.json({ requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const approveWithdraw = async (req, res) => {
  try {
    const tx = await WalletTransaction.findById(req.params.id).populate('userId')
    if (!tx) return res.status(404).json({ message: 'Request not found.' })
    if (tx.withdrawStatus !== 'pending') return res.status(400).json({ message: 'Already processed.' })
    tx.type = 'withdraw_approved'
    tx.withdrawStatus = 'approved'
    tx.adminId = req.user._id
    tx.description += ' — APPROVED'
    await tx.save()
    res.json({ message: `Withdrawal of ₹${tx.amount} approved for ${tx.userId?.username}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const rejectWithdraw = async (req, res) => {
  try {
    const { reason } = req.body
    const tx = await WalletTransaction.findById(req.params.id).populate('userId')
    if (!tx) return res.status(404).json({ message: 'Request not found.' })
    if (tx.withdrawStatus !== 'pending') return res.status(400).json({ message: 'Already processed.' })
    // Refund coins
    const user = await User.findById(tx.userId._id)
    user.balance += tx.amount
    await user.save()
    tx.type = 'withdraw_rejected'
    tx.withdrawStatus = 'rejected'
    tx.rejectionReason = reason || 'Rejected by admin'
    tx.adminId = req.user._id
    await tx.save()
    res.json({ message: `Withdrawal rejected and ₹${tx.amount} refunded to ${tx.userId?.username}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const changeUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    user.password = newPassword
    await user.save()
    res.json({ message: `Password changed for ${user.username}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Game Settings (Admin Control) ─────────────────────────
export const getGameSettings = async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'gameSettings' })
    const defaults = {
      aviator:    { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 50000, maxMultiplier: 100 },
      crashBall:  { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 50000, maxMultiplier: 100 },
      crashRocket:{ enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 50000, maxMultiplier: 100 },
      mines:      { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 10000 },
      plinko:     { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 10000 },
      dice:       { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 10000 },
      slots:      { enabled: true, houseEdge: 5,  minBet: 10,  maxBet: 10000 },
      roulette:   { enabled: true, houseEdge: 2.7,minBet: 10,  maxBet: 10000 },
      blackjack:  { enabled: true, houseEdge: 2,  minBet: 10,  maxBet: 10000 },
      baccarat:   { enabled: true, houseEdge: 1.5,minBet: 10,  maxBet: 10000 },
      teenPatti:  { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 10000 },
      colorPrediction:{ enabled: true, houseEdge: 5, minBet: 10, maxBet: 10000 },
      luckyWheel: { enabled: true, houseEdge: 5,  minBet: 10,  maxBet: 10000 },
      hiLo:       { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 10000 },
      keno:       { enabled: true, houseEdge: 4,  minBet: 10,  maxBet: 10000 },
      coinFlip:   { enabled: true, houseEdge: 3,  minBet: 10,  maxBet: 10000 },
    }
    res.json({ settings: doc?.value || defaults })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const saveGameSettings = async (req, res) => {
  try {
    const { settings } = req.body
    await Settings.findOneAndUpdate(
      { key: 'gameSettings' },
      { value: settings },
      { upsert: true, new: true }
    )
    res.json({ message: 'Game settings saved!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Public endpoint - frontend games fetch their own settings
export const getPublicGameSetting = async (req, res) => {
  try {
    const { game } = req.params
    const doc = await Settings.findOne({ key: 'gameSettings' })
    const all = doc?.value || {}
    // 'all' returns entire settings object for GameLobby
    if (game === 'all') return res.json(all)
    const setting = all[game]
    if (!setting) return res.json({ enabled: true, houseEdge: 3, minBet: 10, maxBet: 50000, maxMultiplier: 100 })
    res.json(setting)
  } catch (err) {
    res.status(500).json(req.params.game === 'all' ? {} : { enabled: true, houseEdge: 3, minBet: 10, maxBet: 50000, maxMultiplier: 100 })
  }
}
