const API_BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })

  if (res.status === 204) {
    if (options?.method && options.method !== 'GET') {
      const keys = path.startsWith('/sales') ? ['products', 'clients', 'sales', 'reports', 'product-detail', 'client-detail'] : path.startsWith('/products') ? ['products', 'reports', 'product-detail'] : path.startsWith('/clients') ? ['clients', 'reports', 'client-detail'] : []
      keys.forEach((key) => Object.keys(sessionStorage).filter((stored) => stored === `stockfinance.resource.${key}` || stored.startsWith(`stockfinance.resource.${key}.`)).forEach((stored) => sessionStorage.removeItem(stored)))
    }
    return undefined as T
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  if (options?.method && options.method !== 'GET') {
    const keys = path.startsWith('/sales') ? ['products', 'clients', 'sales', 'reports', 'product-detail', 'client-detail'] : path.startsWith('/products') ? ['products', 'reports', 'product-detail'] : path.startsWith('/clients') ? ['clients', 'reports', 'client-detail'] : []
    keys.forEach((key) => Object.keys(sessionStorage).filter((stored) => stored === `stockfinance.resource.${key}` || stored.startsWith(`stockfinance.resource.${key}.`)).forEach((stored) => sessionStorage.removeItem(stored)))
  }
  return data as T
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro no upload')
  if (path.startsWith('/reports/sales/import')) {
    ['products', 'clients', 'sales', 'reports', 'product-detail', 'client-detail'].forEach((key) => Object.keys(sessionStorage).filter((stored) => stored === `stockfinance.resource.${key}` || stored.startsWith(`stockfinance.resource.${key}.`)).forEach((stored) => sessionStorage.removeItem(stored)))
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
  upload,
}

export { API_BASE }
