import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from './icons'
import './Modal.css'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  width?: number
}

export function Modal({ open, title, onClose, children, footer, width = 480 }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cardRef.current?.focus()
    function handleKey(e: KeyboardEvent) {
      const dialogs = document.querySelectorAll('[role="dialog"]')
      if (dialogs[dialogs.length - 1] !== cardRef.current) return
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key !== 'Tab' || !cardRef.current) return
      const focusable = Array.from(cardRef.current.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]'))
      if (!focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKey); previous?.focus() }
  }, [open])
  if (!open) return null

  return createPortal(
    <div className="modal-ds__scrim" onClick={onClose}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="modal-ds__card"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-ds__header">
          <h2 className="text-section-heading">{title}</h2>
          <button className="modal-ds__close" onClick={onClose} aria-label="Fechar">
            <XIcon />
          </button>
        </div>
        <div className="modal-ds__body">{children}</div>
        <div className="modal-ds__footer">{footer}</div>
      </div>
    </div>,
    document.body,
  )
}
