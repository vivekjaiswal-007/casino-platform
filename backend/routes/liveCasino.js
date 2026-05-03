import express from 'express'
import {
  getLiveGames,
  launchGame,
  gameCallback,
  getLiveBalance,
} from '../controllers/liveCasinoController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// TEST
router.get('/test', (req, res) => {
  res.json({ message: "Live Casino API Working ✅" })
})

// GAMES
router.get('/games', getLiveGames)

// CALLBACK
router.post('/callback', gameCallback)

// LAUNCH
router.post('/launch', protect, launchGame)

// BALANCE
router.get('/balance', protect, getLiveBalance)

// 🔥 MOST IMPORTANT
export default router