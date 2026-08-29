import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
type Size = 'default' | 'small'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leadingIcon?: ReactNode
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'default',
  leadingIcon,
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = ['btn-ds', `btn-ds--${variant}`, `btn-ds--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={rest.type || 'button'} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="btn-ds__icon"><Spinner size={14} /></span>
      ) : (
        leadingIcon && <span className="btn-ds__icon">{leadingIcon}</span>
      )}
      {children}
    </button>
  )
}
