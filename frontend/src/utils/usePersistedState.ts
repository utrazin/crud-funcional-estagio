import { useState } from 'react'

/**
 * Persiste o valor na sessão da aba, inclusive ao recarregar a página.
 * Falhas de storage (modo privado, quota) são ignoradas.
 */
export function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  function setPersistedState(value: T | ((prev: T) => T)) {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
      try {
        sessionStorage.setItem(key, JSON.stringify(next))
      } catch {
        // ignora falha de storage
      }
      return next
    })
  }

  return [state, setPersistedState] as const
}
