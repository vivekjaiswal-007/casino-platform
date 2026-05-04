import mongoose from 'mongoose'

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  game: {
    type: String,
    required: true,
    // enum removed to support dynamic game names
    _enum_disabled: [
      'aviator','crash-rocket','crash-ball','color-prediction','roulette',
      'blackjack','blackjack-switch','baccarat','mini-baccarat','teen-patti',
      'andar-bahar','poker','video-poker','three-card-poker','slots','lucky-7s',
      'dragon-tiger','sic-bo','dice','dice-battle','lucky-wheel','mines',
      'plinko','chicken-road','tower','hi-lo','hilo-card','spin-win',
      'keno','coin-flip','number-guess','wheel-fortune','scratch-card',
      'rps','limbo','ball-drop','hot-cold','war','penalty','roulette-american',
      'live-casino','live-game',
      'Live Game 11521','Live Game 11509','Live Game 11523','Live Game 11527',
      'Live Game 11416','Live Game 11419','Live Game 11522','Live Game 11516',
      'Live Game 11499','Live Game 11460','Live Game 11417',
      'Live Game 11471','Live Game 11468','Live Game 11470','Live Game 11469'
    ]
  },
  betAmount: {
    type: Number,
    required: true,
    min: [1, 'Minimum bet is 1']
  },
  payout: {
    type: Number,
    default: 0
  },
  multiplier: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending'
  },
  betData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resultData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number }
}, {
  timestamps: true
})

// Index for efficient queries
betSchema.index({ userId: 1, createdAt: -1 })
betSchema.index({ game: 1, createdAt: -1 })
betSchema.index({ status: 1 })

export default mongoose.model('Bet', betSchema)
