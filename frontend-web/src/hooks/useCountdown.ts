import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react'

export function useCountdown(
  expiresAt: number | null,
  onExpire?: () => void,
) {
  const [now, setNow] = useState(() => Date.now())
  const hasTriggeredRef = useRef(false)
  const handleExpire = useEffectEvent(() => {
    onExpire?.()
  })

  useEffect(() => {
    if (!expiresAt) {
      return
    }

    hasTriggeredRef.current = false

    const timerId = window.setInterval(() => {
      startTransition(() => {
        setNow(Date.now())
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [expiresAt])

  useEffect(() => {
    if (!expiresAt || hasTriggeredRef.current) {
      return
    }

    if (now >= expiresAt) {
      hasTriggeredRef.current = true
      handleExpire()
    }
  }, [expiresAt, now])

  if (!expiresAt) {
    return 0
  }

  return Math.max(0, Math.ceil((expiresAt - now) / 1000))
}
