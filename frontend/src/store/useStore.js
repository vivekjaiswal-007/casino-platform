import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('casino_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      balance: 0,
      isLoading: false,
      sidebarOpen: true,

      setUser: (user) => set({ user }),
      setBalance: (balanceOrFn) => set(state => ({
        balance: typeof balanceOrFn === 'function' ? balanceOrFn(state.balance) : balanceOrFn
      })),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

      // Direct signup — no OTP
      signup: async (username, emailOrPhone, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/signup', { username, emailOrPhone, password })
          localStorage.setItem('casino_token', data.token)
          set({ user: data.user, token: data.token, balance: data.user.balance, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, error: err.response?.data?.message || 'Signup failed' }
        }
      },

      login: async (emailOrPhone, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { emailOrPhone, password })
          localStorage.setItem('casino_token', data.token)
          set({ user: data.user, token: data.token, balance: data.user.balance, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, error: err.response?.data?.message || 'Login failed', data: err.response?.data }
        }
      },

      logout: () => {
        localStorage.removeItem('casino_token')
        set({ user: null, token: null, balance: 0 })
      },

      fetchBalance: async () => {
        try {
          const { data } = await api.get('/wallet/balance')
          set({ balance: data.balance })
        } catch {}
      },

      placeBet: async (game, betAmount, betData) => {
        try {
          const { data } = await api.post('/bets/place', { game, betAmount, betData })
          set({ balance: data.newBalance })
          return { success: true, data }
        } catch (err) {
          return { success: false, error: err.response?.data?.message || 'Bet failed' }
        }
      },

      settleBet: async (betId, result, payout) => {
        try {
          const { data } = await api.post('/bets/settle', { betId, result, payout })
          set({ balance: data.newBalance })
          return { success: true, data }
        } catch (err) {
          return { success: false, error: err.response?.data?.message || 'Settle failed' }
        }
      }
    }),
    {
      name: 'casino-store',
      partialize: (state) => ({ user: state.user, token: state.token, sidebarOpen: state.sidebarOpen })
    }
  )
)

export { api }
