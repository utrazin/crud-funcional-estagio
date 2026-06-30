import { useState, useCallback } from 'react'

interface ToastState {
  message: string
  type: 'success' | 'error' | ''
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', type: '' })

  const showSuccess = useCallback((message: string) => {
    setToast({ message, type: 'success' })
  }, [])

  const showError = useCallback((message: string) => {
    setToast({ message, type: 'error' })
  }, [])

  const clearToast = useCallback(() => {
    setToast({ message: '', type: '' })
  }, [])

  return { toast, showSuccess, showError, clearToast }
}
