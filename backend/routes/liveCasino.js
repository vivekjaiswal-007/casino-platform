/**
 * Live Casino Routes — SoftAPI
 */
import express from 'express'
import {
  getLiveGames,
  launchGame,
  gameCallback,
  getLiveBalance,
} from '../controllers/liveCasinoController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public — game list (no auth needed to browse)
router.get('/games', getLiveGames)

// Public — SoftAPI server-to-server callback (no JWT)
router.post('/callback', gameCallback)

// Protected — launch a game session
router.post('/launch', protect, launchGame)

// Protected — get current balance for live casino header
router.get('/balance', protect, getLiveBalance)

export default router
