const fs = require('fs')
let c = fs.readFileSync('backend/controllers/liveCasinoController.js', 'utf8')
c = c.replace(
  "user_id:       String(Math.abs(parseInt(String(user._id).slice(-8), 16))),",
  "user_id:       String(user._id).slice(-8),"
)
fs.writeFileSync('backend/controllers/liveCasinoController.js', c)
console.log('Done!')
