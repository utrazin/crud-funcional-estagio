import type { Sale } from '../../types'
import { salesApi } from '../../api/sales'
import { useSessionResource } from '../../utils/useSessionResource'
export function useSales() {
  const { data, ...rest } = useSessionResource<Sale[]>('sales', salesApi.listar, [])
  return { sales: data, ...rest }
}
