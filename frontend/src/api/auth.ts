import { api } from './client'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: AuthUser }>('/auth/login', { email, password }),
  me: () => api.get<{ user: AuthUser }>('/auth/me'),
  logout: () => api.post<void>('/auth/logout', {}),
}
