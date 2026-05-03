const fs = require('fs')
let c = fs.readFileSync('admin-panel/src/pages/Users.jsx', 'utf8')
const lines = c.split('\n')
for(let i=0;i<lines.length;i++){
  if(lines[i].includes('[pagination.total]')){
    lines[i] = lines[i].replace('[pagination.total](http://pagination.total)', 'pagination.total')
    console.log('Fixed line', i+1, 'pagination.total')
  }
  if(lines[i].includes('[users.map]')){
    lines[i] = lines[i].replace('[users.map](http://users.map)', 'users.map')
    console.log('Fixed line', i+1, 'users.map')
  }
}
fs.writeFileSync('admin-panel/src/pages/Users.jsx', lines.join('\n'))
console.log('Done!')
