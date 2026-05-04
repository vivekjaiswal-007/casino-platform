const fs = require('fs')
let c = fs.readFileSync('casino-platform/backend/controllers/liveCasinoController.js', 'utf8')
c = c.replace(
  "balance:       parseFloat(user.balance.toFixed(2)) || 0,",
  "balance:       Math.min(parseFloat(user.balance.toFixed(2)) || 0, 500),"
)
fs.writeFileSync('casino-platform/backend/controllers/liveCasinoController.js', c)
console.log('Done!')
