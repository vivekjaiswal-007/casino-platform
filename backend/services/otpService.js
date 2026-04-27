import nodemailer from 'nodemailer'

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// OTP expiry: 10 minutes
export const otpExpiryTime = () => new Date(Date.now() + 10 * 60 * 1000)

// Email transporter — uses Gmail SMTP (or ethereal for dev)
const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (emailUser && emailPass) {
    // Production: real Gmail SMTP
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    })
  } else {
    // Development: Ethereal (fake SMTP, check console for preview URL)
    return null
  }
}

export const sendEmailOTP = async (email, otp, purpose = 'signup') => {
  const subjects = {
    signup: 'RoyalBet — Verify Your Account',
    login: 'RoyalBet — Login OTP',
    forgot: 'RoyalBet — Password Reset OTP'
  }
  const actions = {
    signup: 'verify your account',
    login: 'login to your account',
    forgot: 'reset your password'
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0f;color:#fff;padding:32px;border-radius:12px;border:1px solid rgba(201,162,39,0.3)">
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:50px;height:50px;background:linear-gradient(135deg,#c9a227,#f0c84a);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:24px">♠</div>
        <h1 style="font-size:22px;margin-top:12px;color:#c9a227">RoyalBet Casino</h1>
      </div>
      <p style="color:#aaa;margin-bottom:8px">Use this OTP to ${actions[purpose]}:</p>
      <div style="background:rgba(201,162,39,0.1);border:2px solid #c9a227;border-radius:10px;padding:20px;text-align:center;margin:16px 0">
        <div style="font-size:38px;font-weight:900;letter-spacing:10px;color:#f0c84a">${otp}</div>
      </div>
      <p style="color:#888;font-size:13px">⏱ This OTP expires in <strong style="color:#fff">10 minutes</strong>.</p>
      <p style="color:#666;font-size:12px;margin-top:16px">If you didn't request this, please ignore this email.</p>
    </div>
  `

  try {
    let transporter = getTransporter()

    if (!transporter) {
      // Dev mode: create ethereal test account
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      })
      const info = await transporter.sendMail({
        from: '"RoyalBet Casino" <noreply@royalbet.com>',
        to: email, subject: subjects[purpose], html
      })
      console.log(`\n📧 EMAIL OTP for ${email}: ${otp}`)
      console.log(`📮 Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`)
      return { success: true, preview: nodemailer.getTestMessageUrl(info) }
    }

    await transporter.sendMail({
      from: `"RoyalBet Casino" <${process.env.EMAIL_USER}>`,
      to: email, subject: subjects[purpose], html
    })
    return { success: true }
  } catch (err) {
    console.error('Email send failed:', err.message)
    // Fallback: log to console so dev can still test
    console.log(`\n📧 EMAIL OTP FALLBACK for ${email}: ${otp}\n`)
    return { success: false, error: err.message }
  }
}

export const sendSMSOTP = async (phone, otp, purpose = 'signup') => {
  const actions = { signup: 'verify account', login: 'login', forgot: 'reset password' }

  // Always log to console (useful for development)
  console.log(`\n📱 SMS OTP for +91${phone}: ${otp} (Purpose: ${actions[purpose]})\n`)

  // ── 2Factor.in OTP SMS (FREE, no transaction needed, instant approval) ──
  // Sign up at 2factor.in → Get API Key → Add TWO_FACTOR_KEY=your_key in .env
  const twoFactorKey = process.env.TWO_FACTOR_KEY
  if (twoFactorKey) {
    try {
      const url = `https://2factor.in/API/V1/${twoFactorKey}/SMS/+91${phone}/${otp}/OTP1`
      const response = await fetch(url, { method: 'GET' })
      const result = await response.json()
      if (result.Status === 'Success') {
        console.log(`✅ SMS sent via 2Factor to +91${phone}`)
        return { success: true }
      }
      console.warn('2Factor error:', JSON.stringify(result))
    } catch (err) {
      console.error('2Factor failed:', err.message)
    }
  }

  // ── Fast2SMS (requires ₹100 transaction first) ──
  const fast2smsKey = process.env.FAST2SMS_KEY
  if (fast2smsKey) {
    try {
      const message = `Your RoyalBet OTP is ${otp}. Valid 10 mins.`
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=q&message=${encodeURIComponent(message)}&flash=0&numbers=${phone}`
      const response = await fetch(url, { method: 'GET', headers: { 'cache-control': 'no-cache' } })
      const result = await response.json()
      if (result.return === true) {
        console.log(`✅ SMS sent via Fast2SMS to +91${phone}`)
        return { success: true }
      }
      console.warn('Fast2SMS error:', JSON.stringify(result))
    } catch (err) {
      console.error('Fast2SMS failed:', err.message)
    }
  }

  // MSG91 (add MSG91_KEY in .env)
  const msg91Key = process.env.MSG91_KEY
  if (msg91Key) {
    try {
      const response = await fetch('https://api.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authkey': msg91Key },
        body: JSON.stringify({ mobile: `91${phone}`, otp, template_id: process.env.MSG91_TEMPLATE_ID || '' })
      })
      const result = await response.json()
      if (result.type === 'success') {
        console.log(`✅ SMS sent via MSG91 to +91${phone}`)
        return { success: true }
      }
    } catch (err) {
      console.error('MSG91 failed:', err.message)
    }
  }

  return { success: true, note: 'OTP in console. Add FAST2SMS_KEY or MSG91_KEY in .env for real SMS.' }
}
