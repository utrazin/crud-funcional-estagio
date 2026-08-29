import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import './Input.css'
import './Textarea.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, id, style, ...rest }, ref) => {
    const areaId = id || rest.name

    return (
      <div className="input-ds__field" style={style}>
        {label && (
          <label className="input-ds__label" htmlFor={areaId}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={['textarea-ds', className].filter(Boolean).join(' ')}
          {...rest}
        />
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
