import express from 'express'
import {
  getBalance, getTransactions, updateBalance,
  getQRCode, getAllQRCodes, requestWithdraw, getWithdrawRequests
} from '../controllers/walletController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

router.get('/balance', getBalance)
router.get('/transactions', getTransactions)
router.post('/update', updateBalance)
router.get('/qr', getQRCode)
router.get('/qr-all', getAllQRCodes)
router.post('/withdraw', requestWithdraw)
router.post('/deposit-request', require('../controllers/walletController').submitDepositRequest)
router.get('/withdrawals', getWithdrawRequests)

export default router
