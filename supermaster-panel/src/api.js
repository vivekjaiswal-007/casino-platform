import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(c => {
  const token = localStorage.getItem('panel_token')
  if (token) c.headers.Authorization = `Bearer ${token}`
  return c
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('panel_token')
      localStorage.removeItem('panel_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('panel_user') || '{}') } catch { return {} }
}

export const getToken = () => localStorage.getItem('panel_token')

export const isLoggedIn = (expectedRole) => {
  const token = getToken()
  const user = getUser()
  if (!token || !user._id) return false
  if (expectedRole && !['admin', expectedRole].includes(user.role)) return false
  return true
}

export const logout = () => {
  localStorage.removeItem('panel_token')
  localStorage.removeItem('panel_user')
  window.location.href = '/login'
}

export const loginUser = (token, user) => {
  localStorage.setItem('panel_token', token)
  localStorage.setItem('panel_user', JSON.stringify(user))
}
