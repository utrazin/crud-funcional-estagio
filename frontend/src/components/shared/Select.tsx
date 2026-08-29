import type { SelectHTMLAttributes, ReactNode } from 'react'
import './Input.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

export function Select({ label, id, name, children, className, style, ...rest }: SelectProps) {
  const selectId = id || name

  return (
    <div className="input-ds__field" style={style}>
      {label && (
        <label className="input-ds__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="input-ds__wrapper">
        <select
          id={selectId}
          name={name}
          className={['input-ds__control', className].filter(Boolean).join(' ')}
          style={{ width: '100%' }}
          {...rest}
        >
          {children}
        </select>
      </div>
    </div>
  )
}
