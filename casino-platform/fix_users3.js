const fs = require('fs')
let c = fs.readFileSync('admin-panel/src/pages/Users.jsx', 'utf8')
const lines = c.split('\n')
lines[38] = "        <p style={{ color:'#555', fontSize:'12px' }}>{pagination.total||0} registered users</p>"
lines[64] = "              ) : users.map(u => ("
fs.writeFileSync('admin-panel/src/pages/Users.jsx', lines.join('\n'))
console.log('Done! Lines 39 and 65 fixed')
