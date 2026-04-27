const fs = require('fs');
const files = [
  'supermaster-panel/src/App.jsx',
  'master-panel/src/App.jsx',
  'agent-panel/src/App.jsx',
  'frontend/src/store/useStore.js'
];
files.forEach(f => {
  try {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace("baseURL: '/api'", "baseURL: import.meta.env.VITE_API_URL || '/api'");
    fs.writeFileSync(f, c);
    console.log('Fixed: ' + f);
  } catch(e) {
    console.log('Skip: ' + f);
  }
});
