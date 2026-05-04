const fs = require('fs')
let c = fs.readFileSync('admin-panel/src/pages/Users.jsx', 'utf8')
// Remove all markdown links
c = c.replace(/\[([^\]]+)\]\(http[^)]+\)/g, '$1')
// Add space at end to force git to detect change
c = c.trimEnd() + '\n'
fs.writeFileSync('admin-panel/src/pages/Users.jsx', c)
console.log('Fixed! Markdown links removed:', (c.match(/\]\(http/g)||[]).length)
