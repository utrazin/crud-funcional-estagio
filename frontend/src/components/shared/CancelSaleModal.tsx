import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { ReadOnlyFields } from './ReadOnlyFields'
import { salesApi } from '../../api/sales'

interface Props { sale: { id: string; fields: { label: string; value: string }[] } | null; onClose: () => void; onCancelled: () => void; onError: (message: string) => void }
export function CancelSaleModal({ sale, onClose, onCancelled, onError }: Props) {
  const [submitting, setSubmitting] = useState(false)
  if (!sale) return null
  async function confirm() {
    if (!sale || submitting) return
    setSubmitting(true)
    try { await salesApi.cancelar(sale.id); onCancelled(); onClose() }
    catch (err) { onError(err instanceof Error ? err.message : 'Erro ao cancelar venda') }
    finally { setSubmitting(false) }
  }
  return <Modal open title="Cancelar Venda" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Voltar</Button><Button variant="danger" onClick={confirm} loading={submitting}>Sim, cancelar venda</Button></>}>
    <ReadOnlyFields fields={sale.fields} />
    <p>O estoque do produto será restaurado. Esta operação não poderá ser revertida.</p>
  </Modal>
}
