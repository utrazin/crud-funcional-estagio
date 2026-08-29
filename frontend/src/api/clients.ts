import type { Client } from '../types'
import { api } from './client'

export interface ClientDetail extends Client {
  vendas: {
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    saleDate: string
    produto: string
  }[]
}

export const clientsApi = {
  listar: () => api.get<Client[]>('/clients'),

  buscarPorNome: (name: string) =>
    api.get<Client[]>(`/clients/buscar?name=${encodeURIComponent(name)}`),

  detalhes: (id: string) => api.get<ClientDetail>(`/clients/${id}`),

  criar: (data: { name: string; cellphone?: string }) =>
    api.post<Client>('/clients', data),

  atualizar: (id: string, data: { name: string; cellphone?: string }) =>
    api.put<Client>(`/clients/${id}`, data),

  excluir: (id: string) => api.delete(`/clients/${id}`),
}
