import type { ReactNode } from 'react'
import { Sidebar } from '../components/shared/Sidebar'
import './AppLayout.css'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout-ds">
      <Sidebar />
      <main className="app-layout-ds__content">{children}</main>
    </div>
  )
}
