const fs = require('fs')
let c = fs.readFileSync('frontend/src/pages/LiveCasino.jsx', 'utf8')

// Fix: games fetch response handling
c = c.replace(
  ".then(r => { setGames(r.data.games || r.data || [])",
  ".then(r => { const g = r.data.games || r.data || []; setGames(Array.isArray(g) ? g : [])"
)
c = c.replace(
  ".then(r => { setGames(r.data.games || [])",
  ".then(r => { const g = r.data.games || r.data || []; setGames(Array.isArray(g) ? g : [])"
)

fs.writeFileSync('frontend/src/pages/LiveCasino.jsx', c)
console.log('Done!')
