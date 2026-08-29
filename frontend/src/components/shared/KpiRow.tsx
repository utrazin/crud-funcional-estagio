import type { ReactNode } from 'react'
import './KpiRow.css'

export function KpiRow({ children }: { children: ReactNode }) {
  return <div className="kpi-row-ds">{children}</div>
}
