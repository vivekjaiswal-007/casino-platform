const fs = require('fs')
let c = fs.readFileSync('casino-platform/backend/controllers/liveCasinoController.js', 'utf8')
c = c.replace(
  "balance:       Number(user.balance.toFixed(2)),",
  "balance:       Math.floor(user.balance || 0),"
)
fs.writeFileSync('casino-platform/backend/controllers/liveCasinoController.js', c)
console.log('Done!')
