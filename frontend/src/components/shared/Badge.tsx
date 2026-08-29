import type { ReactNode } from 'react'
import './Badge.css'

type Variant = 'neutral' | 'success' | 'danger' | 'warning'

interface BadgeProps {
  variant?: Variant
  children: ReactNode
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return <span className={`badge-ds badge-ds--${variant} text-label-small`}>{children}</span>
}
