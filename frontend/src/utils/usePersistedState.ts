import { useState } from 'react'

/**
 * Mesma API do useState, mas persiste o valor no localStorage (sobrevive a troca
 * de tela e reload da página). Falhas de storage (modo privado, quota) são ignoradas.
 */
export function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  function setPersistedState(value: T | ((prev: T) => T)) {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // ignora falha de storage
      }
      return next
    })
  }

  return [state, setPersistedState] as const
}
