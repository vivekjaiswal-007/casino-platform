import express from 'express'
import {
  getBalance, getTransactions, updateBalance,
  getQRCode, getAllQRCodes, requestWithdraw, getWithdrawRequests, submitDepositRequest
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

router.get('/withdrawals', getWithdrawRequests)
router.post('/deposit-request', submitDepositRequest)

export default router
//v105
