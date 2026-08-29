import { useState } from 'react'
import type { Client } from '../../types'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { clientsApi } from '../../api/clients'

interface DeleteClientModalProps {
  client: Client | null
  onClose: () => void
  onDeleted: () => void
  onError: (message: string) => void
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function DeleteClientModal({ client, onClose, onDeleted, onError }: DeleteClientModalProps) {
  const [submitting, setSubmitting] = useState(false)

  if (!client) return null

  async function handleConfirm() {
    if (!client) return
    setSubmitting(true)
    try {
      await clientsApi.excluir(client.id)
      onDeleted()
      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao excluir cliente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!client}
      title="Excluir Cliente"
      onClose={onClose}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirm} loading={submitting}>Sim, Excluir</Button>
        </>
      }
    >
      <div className="modal-field-row">
        <Input label="Nome do Cliente" value={client.name} disabled readOnly />
        <Input label="Valor Total Gasto" value={currency(client.totalSpent)} disabled readOnly />
      </div>
      <Input
        label="Quantidade de Produtos Comprados"
        value={`${client.totalProductsPurchased} produtos`}
        disabled
        readOnly
      />
      <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
        Deseja realmente excluir esse cliente? Essa operação não poderá ser revertida!
      </p>
    </Modal>
  )
}
