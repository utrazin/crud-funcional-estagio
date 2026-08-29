import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { salesApi } from '../../api/sales'

interface CancelSaleModalProps {
  sale: { id: string; fields: { label: string; value: string }[] } | null
  onClose: () => void
  onCancelled: () => void
  onError: (message: string) => void
}

export function CancelSaleModal({ sale, onClose, onCancelled, onError }: CancelSaleModalProps) {
  const [submitting, setSubmitting] = useState(false)

  if (!sale) return null

  async function handleConfirm() {
    if (!sale) return
    setSubmitting(true)
    try {
      await salesApi.cancelar(sale.id)
      onCancelled()
      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao cancelar venda')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!sale}
      title="Cancelar Venda"
      onClose={onClose}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Voltar</Button>
          <Button variant="danger" onClick={handleConfirm} loading={submitting}>Sim, Cancelar Venda</Button>
        </>
      }
    >
      <div className="modal-field-row" style={{ flexWrap: 'wrap' }}>
        {sale.fields.map((f) => (
          <Input key={f.label} label={f.label} value={f.value} disabled readOnly style={{ minWidth: 160 }} />
        ))}
      </div>
      <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
        Deseja realmente cancelar essa venda? O estoque do produto será restaurado e essa operação não poderá ser revertida!
      </p>
    </Modal>
  )
}
