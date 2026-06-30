import { useState, useEffect, useCallback } from 'react'
import type { Sale } from '../../types'
import { salesApi } from '../../api/sales'

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await salesApi.listar()
      setSales(data)
    } catch {
      setSales([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { sales, loading, reload }
}
