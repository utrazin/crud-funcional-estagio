import { useCallback, useEffect, useRef, useState } from 'react'

const prefix = 'stockfinance.resource.'
const inFlight = new Map<string, Promise<unknown>>()
export function invalidateResources(...keys: string[]) {
  keys.forEach((key) => sessionStorage.removeItem(prefix + key))
  window.dispatchEvent(new CustomEvent('stockfinance:invalidate', { detail: keys }))
}
export function useSessionResource<T>(key: string, fetcher: () => Promise<T>, empty: T) {
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const [data, setData] = useState<T>(() => {
    try { const cached = sessionStorage.getItem(prefix + key); return cached ? JSON.parse(cached) as T : empty } catch { return empty }
  })
  const [loading, setLoading] = useState(() => !sessionStorage.getItem(prefix + key))
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const sequence = useRef(0)
  const reload = useCallback(async () => {
    const current = ++sequence.current
    setRefreshing(true)
    try {
      let request = inFlight.get(key) as Promise<T> | undefined
      if (!request) {
        request = fetcherRef.current()
        inFlight.set(key, request)
        void request.finally(() => { if (inFlight.get(key) === request) inFlight.delete(key) }).catch(() => undefined)
      }
      const next = await request
      if (current !== sequence.current) return
      setData((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
      sessionStorage.setItem(prefix + key, JSON.stringify(next))
      setError('')
    } catch (err) {
      if (current === sequence.current) setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      if (current === sequence.current) { setLoading(false); setRefreshing(false) }
    }
  }, [key])
  useEffect(() => {
    void reload()
    const onInvalidate = (event: Event) => {
      if ((event as CustomEvent<string[]>).detail.includes(key)) void reload()
    }
    window.addEventListener('stockfinance:invalidate', onInvalidate)
    return () => { sequence.current++; window.removeEventListener('stockfinance:invalidate', onInvalidate) }
  }, [key, reload])
  return { data, loading, refreshing, error, reload }
}
