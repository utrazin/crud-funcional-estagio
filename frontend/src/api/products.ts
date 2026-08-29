import type { Product } from '../types'
import { api } from './client'

export interface ProductDetail extends Product {
  valorTotalVendido: number
  vendas: {
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    saleDate: string
    comprador: string
  }[]
}

export const productsApi = {
  listar: () => api.get<Product[]>('/products'),

  buscarPorNome: (name: string) =>
    api.get<Product[]>(`/products/buscar?name=${encodeURIComponent(name)}`),

  detalhes: (id: string) => api.get<ProductDetail>(`/products/${id}`),

  criar: (data: { name: string; price: number; stockQuantity: number; description?: string }) =>
    api.post<Product>('/products', data),

  atualizar: (id: string, data: { name: string; price: number; stockQuantity: number; description: string }) =>
    api.put<Product>(`/products/${id}`, data),

  excluir: (id: string) => api.delete(`/products/${id}`),
}
