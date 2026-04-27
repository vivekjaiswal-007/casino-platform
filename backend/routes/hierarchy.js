import express from 'express'
import {
  createDownline, getDownline, getAllDownline,
  transferWallet, reclaimWallet,
  getDashboardStats, blockDownline,
  changeDownlinePassword, updateCommission,
  getDownlineUser, getMyProfile, hierarchyLogin
} from '../controllers/hierarchyController.js'
import { protect, staffOnly } from '../middleware/auth.js'

const router = express.Router()

// Public
router.post('/login', hierarchyLogin)

// Protected (agent, master, supermaster, admin)
router.use(protect, staffOnly)

router.get('/me', getMyProfile)
router.get('/dashboard', getDashboardStats)

// Downline management
router.post('/create', createDownline)
router.get('/downline', getDownline)
router.get('/downline/all', getAllDownline)
router.get('/downline/:id', getDownlineUser)
router.patch('/downline/:id/block', blockDownline)
router.post('/downline/:id/change-password', changeDownlinePassword)
router.post('/downline/:id/commission', updateCommission)

// Wallet operations
router.post('/wallet/transfer', transferWallet)
router.post('/wallet/reclaim', reclaimWallet)

export default router
