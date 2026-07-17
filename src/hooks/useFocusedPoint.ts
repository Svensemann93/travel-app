import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseFocusPoint } from '../lib/focusPoint'
import type { FocusPoint } from '../lib/focusPoint'

export function useFocusedPoint(): FocusPoint | null {
  const [searchParams, setSearchParams] = useSearchParams()
  const point = parseFocusPoint(searchParams.get('lat'), searchParams.get('lng'))

  useEffect(() => {
    if (!point) return
    const timer = setTimeout(() => {
      setSearchParams({}, { replace: true })
    }, 1000)
    return () => clearTimeout(timer)
  }, [point, setSearchParams])

  return point
}
