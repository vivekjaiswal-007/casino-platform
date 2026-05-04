const fs = require('fs')
let c = fs.readFileSync('casino-platform/backend/controllers/liveCasinoController.js', 'utf8')
c = c.replace(
  /user_id:\s+.+,/,
  "user_id: String(user.phone || user.email.split('@')[0].replace(/[^0-9]/g,'') || Math.floor(Math.random()*99999)+10000),"
)
fs.writeFileSync('casino-platform/backend/controllers/liveCasinoController.js', c)
console.log('Done! user_id:', c.match(/user_id.*/)[0])
