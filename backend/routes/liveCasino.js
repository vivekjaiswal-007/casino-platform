/**
 * Live Casino Routes — SoftAPI (Fixed + Debug Ready)
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

// 🔍 Health check (important for debugging)
router.get('/test', (req, res) => {
  res.json({ message: "Live Casino API Working ✅" })
})

/**
 * 🎮 Public — Game list
 */
router.get('/games', async (req, res, next) => {
  try {
    console.log("👉 /games API hit")
    await getLiveGames(req, res)
  } catch (err) {
    console.error("❌ Games API Error:", err)
    res.status(500).json({ error: "Games fetch failed" })
  }
})

/**
 * 🔁 Callback — SoftAPI (no auth)
 */
router.post('/callback', async (req, res, next) => {
  try {
    console.log("👉 Callback received:", req.body)
    await gameCallback(req, res)
  } catch (err) {
    console.error("❌ Callback Error:", err)
    res.status(500).json({ error: "Callback failed" })
  }
})

/**
 * 🚀 Launch Game (Protected)
 */
router.post('/launch', protect, async (req, res, next) => {
  try {
    console.log("👉 Launch API hit by user:", req.user?._id)
    await launchGame(req, res)
  } catch (err) {
    console.error("❌ Launch Error:", err)
    res.status(500).json({ error: "Launch failed" })
  }
})

/**
 * 💰 Balance (Protected)
 */
router.get('/balance', protect, async (req, res, next) => {
  try {
    await getLiveBalance(req, res)
  } catch (err) {
    console.error("❌ Balance Error:", err)
    res.status(500).json({ error: "Balance fetch failed" })
  }
})

export default router