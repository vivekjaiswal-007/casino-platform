const fs = require('fs')
let c = fs.readFileSync('frontend/src/pages/LiveCasino.jsx', 'utf8')
const lines = c.split('\n')
for(let i=0;i<lines.length;i++){
  if(lines[i].includes('setGames') && lines[i].includes('r.data')){
    lines[i] = "      .then(r => { const g = r.data.games || r.data || []; setGames(Array.isArray(g)?g:[]); setLoading(false) })"
    console.log('Fixed line', i+1)
  }
}
fs.writeFileSync('frontend/src/pages/LiveCasino.jsx', lines.join('\n'))
console.log('Done!')
