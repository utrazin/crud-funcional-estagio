import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'
import './IconButton.css'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  variant?: 'default' | 'danger' | 'success'
  ariaLabel: string
  loading?: boolean
}

export function IconButton({ icon, variant = 'default', ariaLabel, loading = false, disabled, className, ...rest }: IconButtonProps) {
  return (
    <button
      className={['icon-btn-ds', `icon-btn-ds--${variant}`, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner size={14} /> : icon}
    </button>
  )
}
