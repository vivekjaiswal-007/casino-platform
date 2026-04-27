/**
 * useGameSettings - fetches admin-controlled settings for a game
 * Returns: { enabled, houseEdge, minBet, maxBet, maxMultiplier, forcedCrashEnabled, forcedCrashAt, forcedWinRate, loading }
 */
import { useState, useEffect } from 'react'
import { api } from '../store/useStore'

const CACHE = {}

export default function useGameSettings(gameId) {
  const [settings, setSettings] = useState({
    enabled: true, houseEdge: 3, minBet: 10, maxBet: 50000,
    maxMultiplier: 100, forcedCrashEnabled: false, forcedCrashAt: 0,
    forcedWinRate: 0, maxPayout: 1000000, loading: true
  })

  useEffect(() => {
    if (!gameId) return

    // Use cache to avoid repeated calls
    if (CACHE[gameId]) {
      setSettings({ ...CACHE[gameId], loading: false })
      return
    }

    api.get(`/admin/game-settings/${gameId}`)
      .then(r => {
        const s = { ...r.data, loading: false }
        CACHE[gameId] = s
        setSettings(s)
        // Clear cache after 30 seconds
        setTimeout(() => { delete CACHE[gameId] }, 30000)
      })
      .catch(() => {
        setSettings(prev => ({ ...prev, loading: false }))
      })
  }, [gameId])

  return settings
}
