import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leadingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leadingIcon, className, id, disabled, style, ...rest }, ref) => {
    const inputId = id || rest.name

    return (
      // `style` controla a largura do componente inteiro (label + campo), não só o <input>
      // nativo — necessário porque `.input-ds__field` é `width: 100%` por padrão e, sem isso,
      // um `style={{ width: N }}` do chamador não tinha efeito nenhum no layout externo.
      <div className="input-ds__field" style={style}>
        {label && (
          <label className="input-ds__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div
          className={[
            'input-ds__wrapper',
            error ? 'input-ds__wrapper--error' : '',
            disabled ? 'input-ds__wrapper--disabled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {leadingIcon && <span className="input-ds__icon">{leadingIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={['input-ds__control', className].filter(Boolean).join(' ')}
            {...rest}
          />
        </div>
        {error && <span className="input-ds__error">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
