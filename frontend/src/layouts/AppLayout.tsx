import type { ReactNode } from 'react'
import { Sidebar } from '../components/shared/Sidebar'
import { useRouteScroll } from '../utils/useRouteScroll'
import './AppLayout.css'

export function AppLayout({ children }: { children: ReactNode }) {
  useRouteScroll()
  return (
    <div className="app-layout-ds">
      <Sidebar />
      <main className="app-layout-ds__content">{children}</main>
    </div>
  )
}
