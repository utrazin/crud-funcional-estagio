import { useState, useEffect, useCallback } from 'react'
import type { Client } from '../../types'
import { clientsApi } from '../../api/clients'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await clientsApi.listar()
      setClients(data)
    } catch {
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { clients, loading, reload }
}
