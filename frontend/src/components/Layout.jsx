import React, { useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  const { sidebarOpen } = useStore()
  const location = useLocation()

  // Responsive breakpoint
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024)
  // Mobile sidebar open state (separate from desktop sidebarOpen)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w < 1024)
      if (w >= 768) setMobileSidebarOpen(false) // Close mobile sidebar on resize up
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  // Determine sidebar CSS classes
  const getSidebarClass = () => {
    if (isMobile) return `app-sidebar${mobileSidebarOpen ? ' open' : ''}`
    if (isTablet) return `app-sidebar${sidebarOpen ? ' open' : ''}`
    return `app-sidebar${!sidebarOpen ? ' collapsed' : ''}`
  }

  // Determine main content margin class
  const getMainClass = () => {
    if (isMobile) return 'app-main'
    if (isTablet) return `app-main${sidebarOpen ? ' sidebar-open' : ''}`
    return `app-main${!sidebarOpen ? ' sidebar-collapsed' : ''}`
  }

  return (
    <div className="app-shell">
      <Header
        onMobileMenuClick={() => setMobileSidebarOpen(prev => !prev)}
        isMobile={isMobile}
      />

      <div className="app-body">
        {/* Sidebar */}
        <Sidebar
          className={getSidebarClass()}
          sidebarOpen={isMobile ? mobileSidebarOpen : sidebarOpen}
          isMobile={isMobile}
        />

        {/* Overlay — only on mobile when sidebar is open */}
        <div
          className={`sidebar-overlay${isMobile && mobileSidebarOpen ? ' visible' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* Main content */}
        <main className={getMainClass()}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
