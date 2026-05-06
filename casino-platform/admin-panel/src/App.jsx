import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import BetHistory from './pages/BetHistory'
import Settings from './pages/Settings'
import Withdrawals from './pages/Withdrawals'
import CreateAccount from './pages/CreateAccount'
import GameControl from './pages/GameControl'
import AdminLayout from './components/AdminLayout'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })
api.interceptors.request.use(c => { const t=localStorage.getItem('admin_token'); if(t) c.headers.Authorization=`Bearer ${t}`; return c })
api.interceptors.response.use(r=>r, err => {
  if (err.response?.status===401) { const m=err.response?.data?.message||''; if(m.includes('authenticated')||m.includes('expired')){localStorage.removeItem('admin_token');localStorage.removeItem('admin_user');window.location.href='/login'} }
  return Promise.reject(err)
})
export { api }

const isAdmin = () => { try { const u=JSON.parse(localStorage.getItem('admin_user')||'{}'); return !!localStorage.getItem('admin_token')&&u.role==='admin' } catch { return false } }

const ProtectedRoute = ({ children }) => { const loc=useLocation(); if(!isAdmin()) return <Navigate to="/login" state={{from:loc}} replace />; return children }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="bets" element={<BetHistory />} />
        <Route path="withdrawals" element={<Withdrawals />} />
        <Route path="settings" element={<Settings />} />
        <Route path="create" element={<CreateAccount />} />
        <Route path="game-control" element={<GameControl />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
