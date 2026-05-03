/**
 * useBet — Central bet tracking hook
 * 
 * Every game calls:
 *   const { startBet, settleBet } = useBet()
 * 
 *   const betId = await startBet(gameName, amount)   // deducts balance + logs to DB
 *   await settleBet(betId, payout, gameName)          // records win/loss + adds payout
 * 
 * Games that manage their own balance (setBalance) can just call
 *   logBet(gameName, amount, payout) — fire-and-forget, won't break game if API fails
 */
import { useStore, api } from '../store/useStore'
import { useCallback } from 'react'

export default function useBet() {
  const { user, setBalance } = useStore()

  /**
   * Fire-and-forget: log a completed bet to backend.
   * Games call this AFTER they've already handled balance locally.
   * Will never throw — if backend is down, game still works.
   */
  const logBet = useCallback(async (game, betAmount, payout) => {
    if (!user) return
    try {
      // Place bet record
      const placeRes = await api.post('/bets/place', {
        game,
        betAmount,
        betData: {}
      })
      const betId = placeRes.data?.betId
      if (!betId) return

      // Settle immediately (since game already determined outcome)
      await api.post('/bets/settle', {
        betId,
        result: {},
        payout: payout || 0
      })
    } catch (err) {
      // Silent fail — game logic already ran, just history logging failed
      console.warn('[useBet] logBet failed (non-critical):', err.message)
    }
  }, [user])

  return { logBet }
}
