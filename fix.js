const fs = require('fs');
let c = fs.readFileSync('admin-panel/src/App.jsx', 'utf8');
c = c.replace("baseURL: '/api'", "baseURL: import.meta.env.VITE_API_URL || '/api'");
fs.writeFileSync('admin-panel/src/App.jsx', c);
console.log('Done!');
