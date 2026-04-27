import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import Bet from '../models/Bet.js'

const signToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET || 'royalbet_secret',
  { expiresIn: '7d' }
)

// ── Who can create whom ──
const CREATION_RULES = {
  admin:       ['supermaster', 'master', 'agent', 'user'],
  supermaster: ['master', 'agent', 'user'],
  master:      ['agent', 'user'],
  agent:       ['user'],
}

// ─── Create Downline Account ─────────────────────────────
export const createDownline = async (req, res) => {
  try {
    const creator = req.user
    const { username, emailOrPhone, password, role, commissionRate = 0, initialBalance = 0 } = req.body

    // Permission check
    const allowed = CREATION_RULES[creator.role] || []
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: `${creator.role} cannot create ${role} accounts.` })
    }

    if (!username || !emailOrPhone || !password || !role) {
      return res.status(400).json({ message: 'username, emailOrPhone, password, role required.' })
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password min 6 characters.' })

    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone)
    const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone)
    if (!isPhone && !isEmail) return res.status(400).json({ message: 'Valid email or 10-digit mobile required.' })

    // Check duplicates
    const orFilter = [{ username }]
    if (isPhone) orFilter.push({ phone: emailOrPhone })
    else orFilter.push({ email: emailOrPhone.toLowerCase() })
    const existing = await User.findOne({ $or: orFilter })
    if (existing) {
      if (existing.username === username) return res.status(409).json({ message: 'Username already taken.' })
      return res.status(409).json({ message: `${isPhone ? 'Phone' : 'Email'} already registered.` })
    }

    // If initial balance, deduct from creator
    if (initialBalance > 0) {
      if (creator.balance < initialBalance) {
        return res.status(400).json({ message: 'Insufficient balance to allocate.' })
      }
      creator.balance -= initialBalance
      await creator.save()
    }

    // Build upline chain
    const userData = {
      username, password, role,
      isVerified: true,
      balance: initialBalance,
      commissionRate: Math.min(commissionRate, 100),
      createdBy: creator._id,
    }
    if (isPhone) userData.phone = emailOrPhone
    else userData.email = emailOrPhone.toLowerCase()

    // Set upline references based on creator role
    if (creator.role === 'supermaster' || creator.role === 'admin') {
      if (role === 'master') userData.supermasterId = creator._id
      if (role === 'agent') { userData.masterId = null; userData.supermasterId = creator._id }
      if (role === 'user') { userData.supermasterId = creator._id }
    }
    if (creator.role === 'master') {
      if (role === 'agent') { userData.masterId = creator._id; userData.supermasterId = creator.supermasterId }
      if (role === 'user') { userData.masterId = creator._id; userData.supermasterId = creator.supermasterId }
    }
    if (creator.role === 'agent') {
      if (role === 'user') {
        userData.agentId = creator._id
        userData.masterId = creator.masterId
        userData.supermasterId = creator.supermasterId
      }
    }

    const newUser = await User.create(userData)

    // Update creator downline count
    if (role === 'master') await User.findByIdAndUpdate(creator._id, { $inc: { totalMasters: 1 } })
    if (role === 'agent') await User.findByIdAndUpdate(creator._id, { $inc: { totalAgents: 1 } })
    if (role === 'user') await User.findByIdAndUpdate(creator._id, { $inc: { totalUsers: 1 } })

    if (initialBalance > 0) {
      await WalletTransaction.create({
        userId: creator._id, type: 'debit', amount: initialBalance,
        balanceBefore: creator.balance + initialBalance, balanceAfter: creator.balance,
        description: `Allocated ${initialBalance} to new ${role}: ${username}`
      })
      await WalletTransaction.create({
        userId: newUser._id, type: 'credit', amount: initialBalance,
        balanceBefore: 0, balanceAfter: initialBalance,
        description: `Initial balance from ${creator.username}`
      })
    }

    res.status(201).json({
      message: `${role} account created successfully.`,
      user: newUser.toSafeObject()
    })
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]
      return res.status(409).json({ message: `${field} already exists.` })
    }
    res.status(500).json({ message: err.message })
  }
}

// ─── Get My Downline ─────────────────────────────────────
export const getDownline = async (req, res) => {
  try {
    const { role: filterRole, page = 1, limit = 20, search = '' } = req.query
    const skip = (page - 1) * limit
    const me = req.user

    // Build query — who reports to me
    let filter = { createdBy: me._id }
    if (filterRole) filter.role = filterRole
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ])

    res.json({ users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Get All Downline (recursive) ────────────────────────
export const getAllDownline = async (req, res) => {
  try {
    const me = req.user
    let filter = {}

    if (me.role === 'supermaster') filter.supermasterId = me._id
    else if (me.role === 'master') filter.masterId = me._id
    else if (me.role === 'agent') filter.agentId = me._id
    else filter.createdBy = me._id

    if (req.query.role) filter.role = req.query.role

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })
    res.json({ users, total: users.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Wallet Transfer (upline → downline) ─────────────────
export const transferWallet = async (req, res) => {
  try {
    const { userId, amount, note } = req.body
    const sender = req.user

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'userId and positive amount required.' })
    }
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' })
    }

    const receiver = await User.findById(userId)
    if (!receiver) return res.status(404).json({ message: 'User not found.' })

    // Security: can only transfer to direct downline
    if (String(receiver.createdBy) !== String(sender._id) && sender.role !== 'admin') {
      // Also allow if receiver is in sender's chain
      const isDownline = String(receiver.agentId) === String(sender._id) ||
        String(receiver.masterId) === String(sender._id) ||
        String(receiver.supermasterId) === String(sender._id)
      if (!isDownline) return res.status(403).json({ message: 'Can only transfer to your downline.' })
    }

    const senderBefore = sender.balance
    const receiverBefore = receiver.balance

    sender.balance -= amount
    receiver.balance += amount
    await sender.save()
    await receiver.save()

    await WalletTransaction.create({
      userId: sender._id, type: 'debit', amount,
      balanceBefore: senderBefore, balanceAfter: sender.balance,
      description: note || `Transfer to ${receiver.username}`
    })
    await WalletTransaction.create({
      userId: receiver._id, type: 'credit', amount,
      balanceBefore: receiverBefore, balanceAfter: receiver.balance,
      description: note || `Received from ${sender.username}`
    })

    res.json({
      message: `Transferred ${amount} coins to ${receiver.username}`,
      newBalance: sender.balance
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Reclaim Wallet (downline → upline) ──────────────────
export const reclaimWallet = async (req, res) => {
  try {
    const { userId, amount, note } = req.body
    const reclaimer = req.user

    const target = await User.findById(userId)
    if (!target) return res.status(404).json({ message: 'User not found.' })

    // Check downline
    const isDownline = String(target.createdBy) === String(reclaimer._id) ||
      String(target.agentId) === String(reclaimer._id) ||
      String(target.masterId) === String(reclaimer._id) ||
      String(target.supermasterId) === String(reclaimer._id)
    if (!isDownline && reclaimer.role !== 'admin') {
      return res.status(403).json({ message: 'Can only reclaim from your downline.' })
    }

    const reclaim = amount || target.balance
    if (target.balance < reclaim) return res.status(400).json({ message: 'Insufficient balance in target account.' })

    const targetBefore = target.balance
    const reclaimerBefore = reclaimer.balance

    target.balance -= reclaim
    reclaimer.balance += reclaim
    await target.save()
    await reclaimer.save()

    await WalletTransaction.create({
      userId: target._id, type: 'debit', amount: reclaim,
      balanceBefore: targetBefore, balanceAfter: target.balance,
      description: note || `Reclaimed by ${reclaimer.username}`
    })
    await WalletTransaction.create({
      userId: reclaimer._id, type: 'credit', amount: reclaim,
      balanceBefore: reclaimerBefore, balanceAfter: reclaimer.balance,
      description: note || `Reclaimed from ${target.username}`
    })

    res.json({ message: `Reclaimed ${reclaim} from ${target.username}`, newBalance: reclaimer.balance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Dashboard Stats ─────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const me = req.user
    let userFilter = {}
    let betFilter = {}

    if (me.role === 'supermaster') {
      userFilter.supermasterId = me._id
      betFilter['$lookup'] = { supermasterId: me._id }
    } else if (me.role === 'master') {
      userFilter.masterId = me._id
    } else if (me.role === 'agent') {
      userFilter.agentId = me._id
    }

    const [totalDownline, directDownline, recentBets] = await Promise.all([
      User.countDocuments({ ...userFilter, role: 'user' }),
      User.countDocuments({ createdBy: me._id }),
      Bet.find().populate('userId', 'username agentId masterId supermasterId')
        .sort({ createdAt: -1 }).limit(50)
    ])

    // Filter bets for my downline
    const myUserIds = (await User.find(userFilter).select('_id')).map(u => u._id.toString())
    const myBets = recentBets.filter(b => myUserIds.includes(b.userId?._id?.toString()))

    const totalWagered = myBets.reduce((s, b) => s + (b.betAmount || 0), 0)
    const totalPayout = myBets.reduce((s, b) => s + (b.payout || 0), 0)
    const houseProfit = totalWagered - totalPayout

    // Commission earned
    const commissionEarned = Math.floor(houseProfit * (me.commissionRate || 0) / 100)

    res.json({
      balance: me.balance,
      commissionRate: me.commissionRate,
      commissionEarned,
      totalUsers: totalDownline,
      totalDirectDownline: directDownline,
      totalWagered,
      totalPayout,
      houseProfit,
      totalMasters: me.totalMasters || 0,
      totalAgents: me.totalAgents || 0,
      recentBets: myBets.slice(0, 10)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Block/Unblock Downline ───────────────────────────────
export const blockDownline = async (req, res) => {
  try {
    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ message: 'User not found.' })

    // Check permission
    const isDownline = String(target.createdBy) === String(req.user._id) ||
      String(target.agentId) === String(req.user._id) ||
      String(target.masterId) === String(req.user._id) ||
      String(target.supermasterId) === String(req.user._id)
    if (!isDownline && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot modify users outside your hierarchy.' })
    }

    target.isBlocked = !target.isBlocked
    await target.save()
    res.json({ message: `User ${target.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: target.isBlocked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Change Downline Password ─────────────────────────────
export const changeDownlinePassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }
    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ message: 'User not found.' })

    const isDownline = String(target.createdBy) === String(req.user._id) ||
      String(target.agentId) === String(req.user._id) ||
      String(target.masterId) === String(req.user._id) ||
      String(target.supermasterId) === String(req.user._id)
    if (!isDownline && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot modify users outside your hierarchy.' })
    }

    target.password = newPassword
    await target.save()
    res.json({ message: `Password changed for ${target.username}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Update Commission Rate ───────────────────────────────
export const updateCommission = async (req, res) => {
  try {
    const { commissionRate } = req.body
    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ message: 'Commission rate must be 0-100.' })
    }

    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ message: 'User not found.' })

    const isDownline = String(target.createdBy) === String(req.user._id) ||
      String(target.agentId) === String(req.user._id) ||
      String(target.masterId) === String(req.user._id) ||
      String(target.supermasterId) === String(req.user._id)
    if (!isDownline && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot modify users outside your hierarchy.' })
    }

    // Cannot give more commission than own rate
    if (commissionRate > req.user.commissionRate && req.user.role !== 'admin') {
      return res.status(400).json({ message: `Cannot set commission higher than your own rate (${req.user.commissionRate}%)` })
    }

    target.commissionRate = commissionRate
    await target.save()
    res.json({ message: `Commission rate updated to ${commissionRate}%`, user: target.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Get Single Downline User ─────────────────────────────
export const getDownlineUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const bets = await Bet.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20)
    const txns = await WalletTransaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20)

    const wagered = bets.reduce((s, b) => s + (b.betAmount || 0), 0)
    const payout = bets.reduce((s, b) => s + (b.payout || 0), 0)

    res.json({
      user,
      bets,
      transactions: txns,
      stats: {
        totalBets: bets.length,
        totalWagered: wagered,
        totalPayout: payout,
        netPL: payout - wagered
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── My Profile ───────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('createdBy', 'username role')
      .populate('agentId', 'username')
      .populate('masterId', 'username')
      .populate('supermasterId', 'username')
    res.json({ user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Hierarchy Login ──────────────────────────────────────
export const hierarchyLogin = async (req, res) => {
  try {
    const { emailOrPhone, password, expectedRole } = req.body
    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'Email/phone and password required.' })
    }

    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone)
    const filter = isPhone ? { phone: emailOrPhone } : { email: emailOrPhone.toLowerCase() }

    const user = await User.findOne(filter).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact support.' })

    // Role check for specific panels
    if (expectedRole && !['admin', expectedRole].includes(user.role)) {
      return res.status(403).json({ message: `This account is not a ${expectedRole}.` })
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = signToken(user._id)
    res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed.' })
  }
}
