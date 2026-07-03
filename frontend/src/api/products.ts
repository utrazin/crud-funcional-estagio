import type { Product } from '../types'
import { api } from './client'

export const productsApi = {
  listar: () => api.get<Product[]>('/products'),

  buscarPorNome: (name: string) =>
    api.get<Product[]>(`/products/buscar?name=${encodeURIComponent(name)}`),

  criar: (data: { name: string; price: number; stockQuantity: number; description?: string }) =>
    api.post<Product>('/products', data),

  atualizar: (id: string, data: { name: string; price: number; stockQuantity: number; description: string }) =>
    api.put<Product>(`/products/${id}`, data),

  excluir: (id: string) => api.delete(`/products/${id}`),
}
