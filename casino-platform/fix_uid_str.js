const fs = require('fs')
let c = fs.readFileSync('backend/controllers/liveCasinoController.js', 'utf8')
c = c.replace(
  /user_id:\s+.*,/,
  "user_id: '23213',"
)
fs.writeFileSync('backend/controllers/liveCasinoController.js', c)
console.log('Done!')
