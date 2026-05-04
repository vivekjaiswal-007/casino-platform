const fs = require('fs')
let c = fs.readFileSync('casino-platform/backend/controllers/liveCasinoController.js', 'utf8')

// Only update balance when win > bet (user actually won)
// Never deduct balance via callback - SoftAPI handles display balance
const old = "    // Only update balance for actual transactions\n    if (net !== 0) {\n      user.balance = Math.max(0, user.balance + net)\n      await user.save()"

const new_code = "    // Only credit wins - never deduct via callback\n    if (win > bet) {\n      user.balance = Math.max(0, user.balance + (win - bet))\n      await user.save()"

c = c.replace(old, new_code)
fs.writeFileSync('casino-platform/backend/controllers/liveCasinoController.js', c)
console.log('Done!')
