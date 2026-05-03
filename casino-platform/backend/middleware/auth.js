import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return res.status(401).json({ message: 'Not authenticated. Please log in.' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'royalbet_secret')
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'User no longer exists.' })
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact support.' })

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

// Role-based middleware
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' })
  next()
}

export const supermasterOnly = (req, res, next) => {
  if (!['supermaster', 'admin'].includes(req.user?.role))
    return res.status(403).json({ message: 'Supermaster access required.' })
  next()
}

export const masterOnly = (req, res, next) => {
  if (!['master', 'supermaster', 'admin'].includes(req.user?.role))
    return res.status(403).json({ message: 'Master access required.' })
  next()
}

export const agentOnly = (req, res, next) => {
  if (!['agent', 'master', 'supermaster', 'admin'].includes(req.user?.role))
    return res.status(403).json({ message: 'Agent access required.' })
  next()
}

export const staffOnly = (req, res, next) => {
  if (!['agent', 'master', 'supermaster', 'admin'].includes(req.user?.role))
    return res.status(403).json({ message: 'Staff access required.' })
  next()
}

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'royalbet_secret')
      req.user = await User.findById(decoded.id)
    }
  } catch {}
  next()
}
