import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './pages/LoginPage'
import { ProductsPage } from './pages/ProductsPage'
import { NewProductPage } from './pages/NewProductPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ClientsPage } from './pages/ClientsPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { ReportsPage } from './pages/ReportsPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'

function Protected({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/produtos" element={<Protected><ProductsPage /></Protected>} />
      <Route path="/produtos/novo" element={<Protected><NewProductPage /></Protected>} />
      <Route path="/produtos/:id" element={<Protected><ProductDetailPage /></Protected>} />
      <Route path="/clientes" element={<Protected><ClientsPage /></Protected>} />
      <Route path="/clientes/:id" element={<Protected><ClientDetailPage /></Protected>} />
      <Route path="/relatorios" element={<Protected><ReportsPage /></Protected>} />
      <Route path="/" element={<Navigate to="/produtos" replace />} />
      <Route path="*" element={<Navigate to="/produtos" replace />} />
    </Routes>
  )
}
