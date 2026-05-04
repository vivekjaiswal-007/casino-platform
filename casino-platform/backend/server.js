import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import authRoutes from './routes/auth.js'
import walletRoutes from './routes/wallet.js'
import betRoutes from './routes/bets.js'
import adminRoutes from './routes/admin.js'
import hierarchyRoutes from './routes/hierarchy.js'
import liveCasinoRoutes from './routes/liveCasino.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

// Middleware
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/bets', betRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/hierarchy', hierarchyRoutes)
app.use('/api/live-casino', liveCasinoRoutes)

// Check outbound IP
app.get('/api/myip', async (req, res) => {
  try {
    const r = await fetch('https://api.ipify.org?format=json')
    const data = await r.json()
    res.json({ outbound_ip: data.ip })
  } catch(e) {
    res.json({ error: e.message })
  }
})

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Socket.io - real-time game events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('join_game', (game) => {
    socket.join(game)
    socket.to(game).emit('player_joined', { id: socket.id })
  })

  socket.on('leave_game', (game) => {
    socket.leave(game)
  })

  socket.on('game_bet', (data) => {
    io.to(data.game).emit('bet_placed', {
      userId: data.userId,
      amount: data.amount,
      timestamp: Date.now()
    })
  })

  socket.on('game_result', (data) => {
    io.to(data.game).emit('result_announced', data)
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Export io for use in routes
app.set('io', io)

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/casino_platform')
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 5000
    httpServer.listen(PORT, () => {
      console.log(`🎰 Casino server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    console.log('⚠️  Starting server without DB (demo mode)...')
    const PORT = process.env.PORT || 5000
    httpServer.listen(PORT, () => {
      console.log(`🎰 Casino server running on http://localhost:${PORT} (no DB)`)
    })
  })

export { io }
