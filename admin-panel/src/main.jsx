import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" toastOptions={{
      style: { background:'#1a1a2e', color:'#fff', border:'1px solid #c9a227', fontFamily:'Outfit,sans-serif' },
      success: { iconTheme: { primary:'#c9a227', secondary:'#0a0a0f' } }
    }} />
  </BrowserRouter>
)
