import type { Sale } from '../types'
import { api } from './client'

export const salesApi = {
  listar: () => api.get<Sale[]>('/sales'),

  registrar: (data: {
    productId: string
    clientId?: string
    clientName?: string
    quantity: number
    salePrice: number
    saleDate: string
  }) => api.post<Sale>('/sales', data),

  atualizar: (
    id: string,
    data: {
      productId: string
      clientId: string
      quantity: number
      salePrice: number
      saleDate: string
    },
  ) => api.put<Sale>(`/sales/${id}`, data),

  cancelar: (id: string) => api.delete(`/sales/${id}`),
}
