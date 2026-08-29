import type { Sale } from '../types'
import { api, API_BASE } from './client'

export interface ReportFilters {
  from?: string
  to?: string
  productIds?: string[]
  clientIds?: string[]
}

export interface ImportResult {
  imported: number
  skipped: { row: number; reason: string }[]
}

function buildQuery(filters: ReportFilters) {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.productIds && filters.productIds.length > 0) params.set('productIds', filters.productIds.join(','))
  if (filters.clientIds && filters.clientIds.length > 0) params.set('clientIds', filters.clientIds.join(','))
  return params.toString()
}

export const reportsApi = {
  listarVendas: (filters: ReportFilters) => api.get<Sale[]>(`/reports/sales?${buildQuery(filters)}`),

  resumo: (filters: ReportFilters) =>
    api.get<{
      totalVendas: number
      faturamentoTotal: number
      totalProdutosVendidos: number
      ticketMedio: number
      totalClientes: number
      geradoEm: string
    }>(`/reports/summary?${buildQuery(filters)}`),

  importar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<ImportResult>('/reports/sales/import', formData)
  },

  /** Dispara o download do relatório exportado — navegação direta, o cookie httpOnly é enviado normalmente. */
  exportarUrl: (filters: ReportFilters, format: 'xlsx' | 'csv') =>
    `${API_BASE}/reports/sales/export?${buildQuery(filters)}&format=${format}`,

  importTemplateUrl: () => `${API_BASE}/reports/sales/import-template`,
}
