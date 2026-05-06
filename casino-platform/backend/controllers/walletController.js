import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'
import Settings from '../models/Settings.js'

export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance')
    res.json({ balance: user.balance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const transactions = await WalletTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
    const total = await WalletTransaction.countDocuments({ userId: req.user._id })
    res.json({ transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateBalance = async (req, res) => {
  try {
    const { amount, type, description } = req.body
    if (!amount || !type) return res.status(400).json({ message: 'Amount and type required.' })
    const user = await User.findById(req.user._id)
    const balanceBefore = user.balance
    if (type === 'debit' && user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' })
    }
    user.balance = type === 'credit' ? user.balance + amount : user.balance - amount
    await user.save()
    await WalletTransaction.create({ userId: user._id, type, amount, balanceBefore, balanceAfter: user.balance, description })
    res.json({ balance: user.balance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Single QR for exact amount
export const getQRCode = async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 100
    if (amount < 100) return res.status(400).json({ message: 'Minimum deposit is ₹100' })

    const [upiIdDoc, upiNameDoc] = await Promise.all([
      Settings.findOne({ key: 'upiId' }),
      Settings.findOne({ key: 'upiName' })
    ])
    const upiId = upiIdDoc?.value || process.env.UPI_ID || 'royalbet@upi'
    const upiName = upiNameDoc?.value || 'RoyalBet Casino'
    const coins = Math.floor(amount)

    // Add unique timestamp so QR is always fresh (prevents caching)
    const txnRef = `RB${Date.now()}${req.user._id.toString().slice(-4).toUpperCase()}`
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`RoyalBet ${req.user.username} ${txnRef}`)}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=000000&margin=10&_t=${Date.now()}`

    res.json({ qrUrl, upiId, upiName, amount, coins, txnRef, note: `Ref: ${txnRef} | User: ${req.user.username}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Multiple QR codes — shuffle randomly on each request
export const getAllQRCodes = async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 500
    if (amount < 100) return res.status(400).json({ message: 'Minimum deposit is ₹100' })

    const qrListDoc = await Settings.findOne({ key: 'qrCodes' })
    const qrList = (qrListDoc?.value || []).filter(q => q.active !== false)

    // Use default if no QR codes configured
    if (qrList.length === 0) {
      const upiId = process.env.UPI_ID || 'royalbet@upi'
      qrList.push({ upiId, name: 'RoyalBet Casino', active: true })
    }

    // Shuffle the list — Fisher-Yates
    const shuffled = [...qrList]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Generate unique QR URL for each — add timestamp + random nonce to prevent browser caching
    const nonce = Date.now()
    const txnRef = `RB${nonce}${req.user._id.toString().slice(-4).toUpperCase()}`

    const result = shuffled.map((qr, idx) => {
      // Each QR gets a unique note so the QR image is different each time
      const uniqueNote = `RoyalBet ${req.user.username} ${txnRef}-${idx + 1}`
      const upiString = `upi://pay?pa=${qr.upiId}&pn=${encodeURIComponent(qr.name || 'RoyalBet')}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(uniqueNote)}`
      return {
        ...qr,
        amount,
        coins: Math.floor(amount),
        txnRef: `${txnRef}-${idx + 1}`,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=000000&margin=10&_nc=${nonce}${idx}`
      }
    })

    res.json({ qrCodes: result, amount, shuffled: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Request withdrawal
export const requestWithdraw = async (req, res) => {
  try {
    const { amount, upiId, upiName } = req.body
    if (!amount || amount < 100) return res.status(400).json({ message: 'Minimum withdrawal is ₹100 (100 coins).' })
    if (!upiId) return res.status(400).json({ message: 'UPI ID is required for withdrawal.' })

    const user = await User.findById(req.user._id)
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance.' })

    const balanceBefore = user.balance
    user.balance -= amount
    await user.save()

    const tx = await WalletTransaction.create({
      userId: user._id,
      type: 'withdraw_pending',
      amount,
      balanceBefore,
      balanceAfter: user.balance,
      description: `Withdrawal request: ₹${amount} to ${upiId}`,
      upiId,
      upiName: upiName || '',
      withdrawStatus: 'pending'
    })

    res.json({
      message: `Withdrawal request of ₹${amount} submitted. Admin will process within 24 hours.`,
      transactionId: tx._id,
      newBalance: user.balance
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get withdraw requests for user
export const getWithdrawRequests = async (req, res) => {
  try {
    const requests = await WalletTransaction.find({
      userId: req.user._id,
      type: { $in: ['withdraw_pending', 'withdraw_approved', 'withdraw_rejected'] }
    }).sort({ createdAt: -1 }).limit(20)
    res.json({ requests })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Submit deposit request with UTR + screenshot
export const submitDepositRequest = async (req, res) => {
  try {
    const { amount, utrId } = req.body
    const userId = req.user._id

    if (!amount || amount < 100) return res.status(400).json({ message: 'Minimum deposit ₹100' })
    if (!utrId || !utrId.trim()) return res.status(400).json({ message: 'UTR/Transaction ID required' })


    const user = await User.findById(userId)

    // Save deposit request
    await WalletTransaction.create({
      userId,
      type: 'deposit_pending',
      amount: parseFloat(amount),
      balanceBefore: user.balance,
      balanceAfter: user.balance,
      description: `Deposit request ₹${amount} | UTR: ${utrId.trim()}`,
      withdrawStatus: 'pending'
    })

    res.json({ message: 'Deposit request submitted! Coins will be credited within 30 minutes after verification.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
