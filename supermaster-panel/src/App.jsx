import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from './api'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateAccount from './pages/CreateAccount'
import MyDownline from './pages/MyDownline'
import UserDetail from './pages/UserDetail'
import WalletTransfer from './pages/WalletTransfer'
import PanelLayout from './components/PanelLayout'

const ROLE = 'supermaster'
const PANEL_CONFIG = {
  role: ROLE,
  title: 'Supermaster Panel',
  color: '#9944ff',
  icon: '👑',
  canCreate: ['master', 'agent', 'user'],
}

const Protected = ({ children }) => {
  const loc = useLocation()
  if (!isLoggedIn(ROLE)) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login config={PANEL_CONFIG} />} />
      <Route path="/" element={<Protected><PanelLayout config={PANEL_CONFIG} /></Protected>}>
        <Route index element={<Dashboard config={PANEL_CONFIG} />} />
        <Route path="create" element={<CreateAccount config={PANEL_CONFIG} />} />
        <Route path="downline" element={<MyDownline config={PANEL_CONFIG} />} />
        <Route path="downline/:id" element={<UserDetail config={PANEL_CONFIG} />} />
        <Route path="wallet" element={<WalletTransfer config={PANEL_CONFIG} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
