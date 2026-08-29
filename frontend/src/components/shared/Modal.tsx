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
  if (!open) return null

  return createPortal(
    <div className="modal-ds__scrim" onClick={onClose}>
      <div
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
