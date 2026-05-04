const fs = require('fs')
let c = fs.readFileSync('backend/controllers/liveCasinoController.js', 'utf8')
c = c.replace(
  /user_id:\s+.*String\(user\._id\).*/,
  "user_id:       String(user._id).replace(/[^0-9]/g, '').slice(0, 10) || '1001',"
)
fs.writeFileSync('backend/controllers/liveCasinoController.js', c)
console.log('Done!')
