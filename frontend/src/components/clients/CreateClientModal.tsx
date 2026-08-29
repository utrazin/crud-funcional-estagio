import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { clientsApi } from '../../api/clients'

interface CreateClientModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onError: (message: string) => void
}

export function CreateClientModal({ open, onClose, onCreated, onError }: CreateClientModalProps) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await clientsApi.criar({ name })
      setName('')
      onCreated()
      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao cadastrar cliente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Cadastrar Cliente"
      onClose={onClose}
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()} loading={submitting}>Cadastrar</Button>
        </>
      }
    >
      <Input
        label="Nome do Cliente"
        placeholder="Ex: João Almeida"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
    </Modal>
  )
}
