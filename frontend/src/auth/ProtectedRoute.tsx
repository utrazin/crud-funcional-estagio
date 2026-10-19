import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Skeleton } from '../components/shared/Skeleton'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 32 }}><Skeleton /></div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
