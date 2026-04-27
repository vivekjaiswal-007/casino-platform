import express from 'express'
import { placeBet, settleBet, getBetHistory, getStats } from '../controllers/betController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.post('/place', placeBet)
router.post('/settle', settleBet)
router.get('/history', getBetHistory)
router.get('/stats', getStats)

export default router
