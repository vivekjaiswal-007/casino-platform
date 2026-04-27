import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import WalletTransaction from '../models/WalletTransaction.js'

const signToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET || 'royalbet_secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
)

// ─── SIGNUP (direct, no OTP) ─────────────────────────────
export const signup = async (req, res) => {
  try {
    const { username, emailOrPhone, password } = req.body

    if (!username || !emailOrPhone || !password) {
      return res.status(400).json({ message: 'Username, email/phone, and password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone)
    const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone)

    if (!isPhone && !isEmail) {
      return res.status(400).json({ message: 'Enter a valid email or 10-digit mobile number.' })
    }

    // Check duplicates
    const orFilter = [{ username }]
    if (isPhone) orFilter.push({ phone: emailOrPhone })
    else orFilter.push({ email: emailOrPhone.toLowerCase() })

    const existing = await User.findOne({ $or: orFilter })
    if (existing) {
      if (existing.username === username) return res.status(409).json({ message: 'Username already taken.' })
      return res.status(409).json({ message: `${isPhone ? 'Phone number' : 'Email'} already registered.` })
    }

    const userData = { username, password, isVerified: true, balance: 1000 }
    if (isPhone) userData.phone = emailOrPhone
    else userData.email = emailOrPhone.toLowerCase()

    const user = await User.create(userData)

    await WalletTransaction.create({
      userId: user._id, type: 'bonus', amount: 1000,
      balanceBefore: 0, balanceAfter: 1000,
      description: 'Welcome bonus — 1000 free coins!'
    })

    const token = signToken(user._id)
    res.status(201).json({ token, user: user.toSafeObject() })
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]
      return res.status(409).json({ message: `${field} already exists.` })
    }
    res.status(500).json({ message: err.message || 'Signup failed.' })
  }
}

// ─── LOGIN ────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body
    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'Email/phone and password are required.' })
    }

    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone)
    const filter = isPhone
      ? { phone: emailOrPhone }
      : { email: emailOrPhone.toLowerCase() }

    const user = await User.findOne(filter).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials. Please check and try again.' })
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account blocked. Contact support.' })
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = signToken(user._id)
    res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed.' })
  }
}

// ─── FORGOT PASSWORD (simple — email/phone + new password) ─
export const forgotPassword = async (req, res) => {
  try {
    const { emailOrPhone, newPassword } = req.body
    if (!emailOrPhone || !newPassword) {
      return res.status(400).json({ message: 'Email/phone and new password are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone)
    const filter = isPhone
      ? { phone: emailOrPhone }
      : { email: emailOrPhone.toLowerCase() }

    const user = await User.findOne(filter)
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email/phone.' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: '✅ Password reset successfully. Please login.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── GET ME ───────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
