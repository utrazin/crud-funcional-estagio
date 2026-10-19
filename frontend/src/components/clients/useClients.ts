import type { Client } from '../../types'
import { clientsApi } from '../../api/clients'
import { useSessionResource } from '../../utils/useSessionResource'
export function useClients() {
  const { data, ...rest } = useSessionResource<Client[]>('clients', clientsApi.listar, [])
  return { clients: data, ...rest }
}
