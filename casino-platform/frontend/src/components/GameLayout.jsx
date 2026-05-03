import React, { useState, useEffect } from 'react'

/**
 * GameLayout — responsive two-column layout for all games.
 * On desktop: [game canvas | bet panel]
 * On mobile:  [bet panel on top] then [game canvas below]
 */
export default function GameLayout({ children, betPanel, sideWidth = '300px' }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Bet panel FIRST on mobile */}
        <div>{betPanel}</div>
        {/* Game content below */}
        <div>{children}</div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `1fr ${sideWidth}`,
      gap: '18px',
      alignItems: 'start'
    }}>
      <div>{children}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {betPanel}
      </div>
    </div>
  )
}
