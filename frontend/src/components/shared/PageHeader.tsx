import type { ReactNode } from 'react'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="page-header-ds">
      <h1 className="text-page-title">{title}</h1>
      {actions && <div className="page-header-ds__actions">{actions}</div>}
    </div>
  )
}
