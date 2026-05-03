import express from 'express'
import {
  getAllUsers, getUser, addCoins, removeCoins, resetWallet,
  blockUser, getAllBets, getDashboardStats, createAdmin,
  getSettings, saveSettings, changeAdminPassword,
  getWithdrawRequests, approveWithdraw, rejectWithdraw,
  changeUserPassword,
  getGameSettings, saveGameSettings, getPublicGameSetting
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()
router.post('/create', createAdmin)
// Public endpoint - no auth needed for frontend
router.get('/game-settings/:game', getPublicGameSetting)

router.use(protect, adminOnly)
router.get('/dashboard', getDashboardStats)
router.get('/users', getAllUsers)
router.get('/users/:id', getUser)
router.post('/users/:id/add-coins', addCoins)
router.post('/users/:id/remove-coins', removeCoins)
router.post('/users/:id/reset-wallet', resetWallet)
router.patch('/users/:id/block', blockUser)
router.get('/bets', getAllBets)
router.get('/settings', getSettings)
router.post('/settings', saveSettings)
router.post('/change-password', changeAdminPassword)
router.post('/users/:id/change-password', changeUserPassword)
router.get('/game-settings', getGameSettings)
router.post('/game-settings', saveGameSettings)
router.get('/withdrawals', getWithdrawRequests)
router.post('/withdrawals/:id/approve', approveWithdraw)
router.post('/withdrawals/:id/reject', rejectWithdraw)
export default router
