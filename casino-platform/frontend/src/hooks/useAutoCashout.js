import { useRef, useEffect } from 'react'

/**
 * useAutoCashout - reusable hook for games with rising multiplier
 * @param {object} opts
 *   phaseRef - ref to current game phase ('flying'|'waiting'|'crashed')
 *   multRef  - ref to current multiplier value
 *   onCashout - function to call when auto cashout triggers
 *   enabled  - boolean: is auto cashout active?
 *   target   - target multiplier to cashout at
 *   placed   - boolean: is a bet placed?
 */
export function useAutoCashout({ phaseRef, multRef, onCashout, enabled, target, placed }) {
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!enabled || !placed) return
    if (phaseRef.current !== 'flying') return

    intervalRef.current = setInterval(() => {
      if (phaseRef.current !== 'flying') { clearInterval(intervalRef.current); return }
      if (multRef.current >= target) {
        clearInterval(intervalRef.current)
        onCashout()
      }
    }, 80)

    return () => clearInterval(intervalRef.current)
  }, [enabled, placed, target, phaseRef.current])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])
}

export default useAutoCashout
