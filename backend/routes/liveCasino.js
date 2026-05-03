import express from 'express'
import {
  getLiveGames,
  launchGame,
  gameCallback,
  getLiveBalance,
} from '../controllers/liveCasinoController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/test', (req, res) => {
  res.json({ message: "Live Casino API Working ✅" })
})

router.get('/games', getLiveGames)
router.post('/callback', gameCallback)
router.post('/launch', protect, launchGame)
router.get('/balance', protect, getLiveBalance)

export default router