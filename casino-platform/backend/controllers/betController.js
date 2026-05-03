import User from '../models/User.js'
import Bet from '../models/Bet.js'
import WalletTransaction from '../models/WalletTransaction.js'

export const placeBet = async (req, res) => {
  try {
    const { game, betAmount, betData } = req.body

    if (!game || !betAmount) {
      return res.status(400).json({ message: 'Game and bet amount are required.' })
    }
    if (betAmount <= 0) {
      return res.status(400).json({ message: 'Bet amount must be positive.' })
    }

    const user = await User.findById(req.user._id)
    if (user.balance < betAmount) {
      return res.status(400).json({ message: 'Insufficient balance.' })
    }

    const balanceBefore = user.balance
    user.balance -= betAmount
    user.totalBets += betAmount
    await user.save()

    const bet = await Bet.create({
      userId: user._id,
      game,
      betAmount,
      betData: betData || {},
      status: 'pending',
      balanceBefore,
      balanceAfter: user.balance
    })

    await WalletTransaction.create({
      userId: user._id,
      type: 'bet',
      amount: betAmount,
      balanceBefore,
      balanceAfter: user.balance,
      description: `Bet placed on ${game}`,
      betId: bet._id
    })

    res.json({
      betId: bet._id,
      newBalance: user.balance,
      message: 'Bet placed successfully.'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const settleBet = async (req, res) => {
  try {
    const { betId, result, payout } = req.body

    const bet = await Bet.findById(betId)
    if (!bet) return res.status(404).json({ message: 'Bet not found.' })
    if (bet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your bet.' })
    }
    if (bet.status !== 'pending') {
      return res.status(400).json({ message: 'Bet already settled.' })
    }

    const user = await User.findById(req.user._id)
    const balanceBefore = user.balance

    bet.status = payout > 0 ? 'won' : 'lost'
    bet.payout = payout || 0
    bet.multiplier = payout > 0 ? payout / bet.betAmount : 0
    bet.resultData = result || {}
    bet.balanceAfter = user.balance + payout

    if (payout > 0) {
      user.balance += payout
      user.totalWon += payout
      await WalletTransaction.create({
        userId: user._id,
        type: 'win',
        amount: payout,
        balanceBefore,
        balanceAfter: user.balance,
        description: `Win on ${bet.game}`,
        betId: bet._id
      })
    } else {
      user.totalLost += bet.betAmount
    }

    await bet.save()
    await user.save()

    res.json({ newBalance: user.balance, bet })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getBetHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const game = req.query.game
    const skip = (page - 1) * limit

    const filter = { userId: req.user._id }
    if (game) filter.game = game

    const bets = await Bet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Bet.countDocuments(filter)

    res.json({
      bets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getStats = async (req, res) => {
  try {
    const userId = req.user._id

    const [totalBets, totalWon, totalLost, recentBets] = await Promise.all([
      Bet.countDocuments({ userId }),
      Bet.countDocuments({ userId, status: 'won' }),
      Bet.countDocuments({ userId, status: 'lost' }),
      Bet.find({ userId }).sort({ createdAt: -1 }).limit(5)
    ])

    const totalWagered = await Bet.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$betAmount' }, totalPayout: { $sum: '$payout' } } }
    ])

    res.json({
      totalBets,
      totalWon,
      totalLost,
      winRate: totalBets > 0 ? ((totalWon / totalBets) * 100).toFixed(1) : 0,
      totalWagered: totalWagered[0]?.total || 0,
      totalPayout: totalWagered[0]?.totalPayout || 0,
      recentBets
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
