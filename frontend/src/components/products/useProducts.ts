import type { Product } from '../../types'
import { productsApi } from '../../api/products'
import { useSessionResource } from '../../utils/useSessionResource'
export function useProducts() {
  const { data, ...rest } = useSessionResource<Product[]>('products', productsApi.listar, [])
  return { products: data, ...rest }
}
