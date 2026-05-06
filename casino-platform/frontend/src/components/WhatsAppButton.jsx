import React, { useState } from 'react'

// WhatsApp number — admin can change this
// Format: country code + number (no + or spaces)
const WA_NUMBER = '919594565034'  // India: 91 + 10-digit number
const WA_MESSAGE = 'Hello New Mahadev Gaming Support! I need help.'

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false)

  const openWhatsApp = () => {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`
    window.open(url, '_blank')
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexDirection: 'row-reverse',
      }}
    >
      {/* Tooltip */}
      {hovered && (
        <div style={{
          background: '#1a1a1a',
          color: 'white',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'fadeIn 0.2s ease'
        }}>
          💬 Chat on WhatsApp
        </div>
      )}

      {/* Button */}
      <button
        onClick={openWhatsApp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Chat on WhatsApp"
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hovered
            ? '0 6px 28px rgba(37,211,102,0.6)'
            : '0 4px 18px rgba(37,211,102,0.4)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.25s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* WhatsApp SVG icon */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.67 4.61 1.84 6.5L4 29l7.74-1.81A12.94 12.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3z" fill="white"/>
          <path d="M22.5 19.3c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.51H11.5c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" fill="#25D366"/>
        </svg>

        {/* Pulse ring */}
        <span style={{
          position: 'absolute',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'rgba(37,211,102,0.35)',
          animation: 'waPulse 2s infinite',
          pointerEvents: 'none',
        }} />
      </button>

      <style>{`
        @keyframes waPulse {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
