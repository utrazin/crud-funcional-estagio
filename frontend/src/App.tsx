import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './pages/LoginPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ClientsPage } from './pages/ClientsPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { ReportsPage } from './pages/ReportsPage'
import { VendasPage } from './pages/VendasPage'
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
      <Route path="/produtos/novo" element={<Protected><ProductsPage createOnMount /></Protected>} />
      <Route path="/produtos/:id" element={<Protected><ProductsPage /><ProductDetailPage /></Protected>} />
      <Route path="/clientes" element={<Protected><ClientsPage /></Protected>} />
      <Route path="/clientes/:id" element={<Protected><ClientsPage /><ClientDetailPage /></Protected>} />
      <Route path="/relatorios" element={<Protected><ReportsPage /></Protected>} />
      <Route path="/vendas" element={<Protected><VendasPage /></Protected>} />
      <Route path="/" element={<Navigate to="/produtos" replace />} />
      <Route path="*" element={<Navigate to="/produtos" replace />} />
    </Routes>
  )
}
