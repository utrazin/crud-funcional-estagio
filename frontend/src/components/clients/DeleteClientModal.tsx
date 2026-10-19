import { useState } from 'react'
import type { Client } from '../../types'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { ReadOnlyFields } from '../shared/ReadOnlyFields'
import { clientsApi } from '../../api/clients'

interface Props { client: Client | null; onClose: () => void; onDeleted: () => void; onError: (message: string) => void }
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export function DeleteClientModal({ client, onClose, onDeleted, onError }: Props) {
  const [submitting, setSubmitting] = useState(false)
  if (!client) return null
  async function confirm() {
    if (!client || submitting) return
    setSubmitting(true)
    try { await clientsApi.excluir(client.id); onDeleted(); onClose() }
    catch (err) { onError(err instanceof Error ? err.message : 'Erro ao excluir cliente') }
    finally { setSubmitting(false) }
  }
  return <Modal open title="Excluir Cliente" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={confirm} loading={submitting}>Sim, excluir</Button></>}>
    <ReadOnlyFields fields={[{ label: 'Cliente', value: client.name }, { label: 'Total gasto', value: currency(client.totalSpent) }, { label: 'Produtos comprados', value: `${client.totalProductsPurchased}` }]} />
    <p>Deseja realmente excluir esse cliente? Essa operação não poderá ser revertida.</p>
  </Modal>
}
