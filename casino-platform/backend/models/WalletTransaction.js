import mongoose from 'mongoose'

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'credit', 'debit', 'bet', 'win',
      'game_bet', 'game_win',
      'admin_add', 'admin_remove', 'admin_reset',
      'bonus', 'deposit', 'withdraw',
      'withdraw_pending', 'withdraw_approved', 'withdraw_rejected'
    ],
    required: true
  },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String, default: '' },
  reference: { type: String, default: '' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  betId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bet' },
  // For withdrawals
  withdrawStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  upiId: { type: String, default: '' },
  upiName: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true })

walletTransactionSchema.index({ userId: 1, createdAt: -1 })
walletTransactionSchema.index({ type: 1, withdrawStatus: 1 })

export default mongoose.model('WalletTransaction', walletTransactionSchema)
