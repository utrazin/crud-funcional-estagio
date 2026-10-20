import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Toast } from './Toast'
import { ToastContext } from './useToast'

type ToastState = { id: number; message: string; type: 'success' | 'error' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const showSuccess = useCallback((message: string) => {
    setToast((current) => ({ id: (current?.id ?? 0) + 1, message, type: 'success' }))
  }, [])
  const showError = useCallback((message: string) => {
    setToast((current) => ({ id: (current?.id ?? 0) + 1, message, type: 'error' }))
  }, [])
  const clearToast = useCallback(() => setToast(null), [])

  return <ToastContext.Provider value={{ showSuccess, showError }}>
    {children}
    {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClear={clearToast} />}
  </ToastContext.Provider>
}
