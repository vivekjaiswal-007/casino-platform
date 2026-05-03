#!/usr/bin/env node
// Run with: node scripts/createAdmin.js
// Creates the default admin account

import fetch from 'node:http'

const data = JSON.stringify({
  username: 'admin',
  email: 'admin@royalbet.com',
  password: 'admin123',
  adminSecret: 'admin_panel_secret_key'
})

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = http.request(options, (res) => {
  let body = ''
  res.on('data', chunk => body += chunk)
  res.on('end', () => {
    const result = JSON.parse(body)
    if (result.user) {
      console.log('✅ Admin account created!')
      console.log(`   Email:    admin@royalbet.com`)
      console.log(`   Password: admin123`)
      console.log(`   Panel:    http://localhost:3001`)
    } else {
      console.log('ℹ️ ', result.message)
    }
  })
})

req.on('error', () => {
  console.log('❌ Make sure the backend server is running first (npm run dev:backend)')
})

req.write(data)
req.end()
