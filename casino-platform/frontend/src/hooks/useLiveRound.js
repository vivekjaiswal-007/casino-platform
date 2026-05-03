import { useState, useEffect, useRef, useCallback } from 'react'

export default function useLiveRound({
  bettingTime = 10,
  dealingTime = 3,
  resultTime  = 5,
  onDeal,       // called once when dealing phase starts → run game logic here
  onNewRound,   // called when new betting round starts
}) {
  const [phase, setPhase]       = useState('betting')
  const [countdown, setCountdown] = useState(bettingTime)
  const [roundId, setRoundId]   = useState(1)

  const refs = useRef({ phase: 'betting', cd: bettingTime, round: 1, mounted: true })
  const timer = useRef(null)

  const tick = useCallback(() => {
    const r = refs.current
    if (!r.mounted) return
    r.cd--
    setCountdown(r.cd)

    if (r.cd > 0) { timer.current = setTimeout(tick, 1000); return }

    if (r.phase === 'betting') {
      r.phase = 'dealing'; r.cd = dealingTime
      setPhase('dealing'); setCountdown(dealingTime)
      if (onDeal) onDeal(r.round)
      timer.current = setTimeout(tick, 1000)

    } else if (r.phase === 'dealing') {
      r.phase = 'result'; r.cd = resultTime
      setPhase('result'); setCountdown(resultTime)
      timer.current = setTimeout(tick, 1000)

    } else {
      r.round++; r.phase = 'betting'; r.cd = bettingTime
      setRoundId(r.round); setPhase('betting'); setCountdown(bettingTime)
      if (onNewRound) onNewRound(r.round)
      timer.current = setTimeout(tick, 1000)
    }
  }, [bettingTime, dealingTime, resultTime, onDeal, onNewRound])

  useEffect(() => {
    refs.current.mounted = true
    if (onNewRound) onNewRound(1)
    timer.current = setTimeout(tick, 1000)
    return () => { refs.current.mounted = false; clearTimeout(timer.current) }
  }, [])

  return { phase, countdown, roundId, canBet: phase === 'betting' }
}
