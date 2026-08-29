import type { Sale } from '../types'
import { api } from './client'

export const salesApi = {
  registrar: (data: {
    productId: string
    clientId?: string
    clientName?: string
    quantity: number
    salePrice: number
    saleDate: string
  }) => api.post<Sale>('/sales', data),

  cancelar: (id: string) => api.delete(`/sales/${id}`),
}
