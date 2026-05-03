const fs = require('fs')
let c = fs.readFileSync('frontend/src/pages/LiveCasino.jsx', 'utf8')
const lines = c.split('\n')
for(let i=0;i<lines.length;i++){
  if(lines[i].includes('r.data') && lines[i].includes('setGames')){
    console.log('Line', i+1, ':', lines[i].trim())
  }
}
