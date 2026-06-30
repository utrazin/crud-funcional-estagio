import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | ''
  onClear: () => void
}

export function Toast({ message, type, onClear }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      setVisible(false)
      return
    }

    setVisible(true)

    if (type === 'success') {
      const timer = setTimeout(() => {
        setVisible(false)
        onClear()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message, type, onClear])

  if (!visible || !message) return null

  return (
    <div className={`msg ${type}`} style={{ display: 'block' }}>
      {message}
    </div>
  )
}
