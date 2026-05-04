import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  softagiId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  username: {
    type: String, required: true, unique: true, trim: true,
    minlength: 3, maxlength: 20,
    match: [/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only']
  },
  email: {
    type: String, unique: true, sparse: true,
    lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  phone: {
    type: String, unique: true, sparse: true, trim: true,
    match: [/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile required']
  },
  password: {
    type: String, required: true, minlength: 6, select: false
  },

  // ── Role hierarchy ──
  role: {
    type: String,
    enum: ['user', 'agent', 'master', 'supermaster', 'admin'],
    default: 'user'
  },

  // ── Upline references (who created this account) ──
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  agentId: {   // direct agent (for users)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  masterId: {  // master above the agent
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  supermasterId: { // supermaster above the master
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // ── Wallet ──
  balance: { type: Number, default: 0, min: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },

  // ── Commission rates (set by upline) ──
  commissionRate: { type: Number, default: 0, min: 0, max: 100 }, // % of user losses

  // ── Stats ──
  totalBets: { type: Number, default: 0 },
  totalWon: { type: Number, default: 0 },
  totalLost: { type: Number, default: 0 },

  // ── Downline counts (cached) ──
  totalAgents: { type: Number, default: 0 },   // for master/supermaster
  totalMasters: { type: Number, default: 0 },  // for supermaster
  totalUsers: { type: Number, default: 0 },    // for agent/master/supermaster

  // ── Status ──
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  avatar: { type: String, default: '' },

}, { timestamps: true })

// ── Password hash ──
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    phone: this.phone,
    role: this.role,
    balance: this.balance,
    commissionRate: this.commissionRate,
    isBlocked: this.isBlocked,
    isVerified: this.isVerified,
    createdBy: this.createdBy,
    agentId: this.agentId,
    masterId: this.masterId,
    supermasterId: this.supermasterId,
    totalBets: this.totalBets,
    totalWon: this.totalWon,
    totalLost: this.totalLost,
    totalAgents: this.totalAgents,
    totalMasters: this.totalMasters,
    totalUsers: this.totalUsers,
    totalDeposited: this.totalDeposited,
    totalWithdrawn: this.totalWithdrawn,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  }
}

// Indexes
userSchema.index({ role: 1 })
userSchema.index({ agentId: 1 })
userSchema.index({ masterId: 1 })
userSchema.index({ supermasterId: 1 })
userSchema.index({ createdBy: 1 })

export default mongoose.model('User', userSchema)
