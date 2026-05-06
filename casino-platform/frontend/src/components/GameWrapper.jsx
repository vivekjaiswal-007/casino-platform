import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function GameWrapper({ children, gameName }) {
  const navigate = useNavigate()

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Exit button - fixed top right */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '70px',
          right: '16px',
          zIndex: 9999,
          padding: '8px 16px',
          background: 'rgba(255,68,68,0.15)',
          border: '1px solid rgba(255,68,68,0.4)',
          borderRadius: '8px',
          color: '#ff6666',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.15)' }}
      >
        ✕ Exit Game
      </button>
      {children}
    </div>
  )
}
//v93
