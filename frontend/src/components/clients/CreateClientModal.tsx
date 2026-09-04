import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { clientsApi } from '../../api/clients'
import { maskPhone } from '../../utils/masks'
import { validateClientName, validatePhone } from '../../utils/validators'

interface CreateClientModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  onError: (message: string) => void
}

export function CreateClientModal({ open, onClose, onCreated, onError }: CreateClientModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const nameError = validateClientName(name)
  const phoneError = validatePhone(phone)
  const hasError = !!nameError || !!phoneError

  async function handleSubmit() {
    if (hasError) return
    setSubmitting(true)
    try {
      await clientsApi.criar({ name: name.trim(), cellphone: phone })
      setName('')
      setPhone('')
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
          <Button onClick={handleSubmit} disabled={hasError} loading={submitting}>Cadastrar</Button>
        </>
      }
    >
      <Input
        label="Nome do Cliente"
        placeholder="Ex: João Almeida"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={name ? nameError : undefined}
        autoFocus
      />
      <Input
        label="Telefone"
        placeholder="(11) 98765-4321"
        value={phone}
        onChange={(e) => setPhone(maskPhone(e.target.value))}
        error={phoneError}
      />
    </Modal>
  )
}
