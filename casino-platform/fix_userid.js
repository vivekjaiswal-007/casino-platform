const fs = require('fs')
let c = fs.readFileSync('backend/controllers/liveCasinoController.js', 'utf8')
c = c.replace(
  "user_id:       String(user._id),",
  "user_id:       user.username || String(user._id),"
)
fs.writeFileSync('backend/controllers/liveCasinoController.js', c)
console.log('Done!')
