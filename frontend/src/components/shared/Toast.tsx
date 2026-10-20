import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from './icons'
import './Toast.css'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClear: () => void
}

export function Toast({ message, type, onClear }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClear, 5000)
    return () => window.clearTimeout(timer)
  }, [onClear])

  return createPortal(
    <div className={`toast-ds toast-ds--${type} text-body-default`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      <button type="button" onClick={onClear} aria-label="Fechar notificação"><XIcon /></button>
    </div>,
    document.body,
  )
}
