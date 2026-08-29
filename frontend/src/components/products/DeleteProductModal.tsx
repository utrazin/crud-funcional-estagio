import { useState } from 'react'
import type { Product } from '../../types'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { productsApi } from '../../api/products'

interface DeleteProductModalProps {
  product: Product | null
  onClose: () => void
  onDeleted: () => void
  onError: (message: string) => void
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function DeleteProductModal({ product, onClose, onDeleted, onError }: DeleteProductModalProps) {
  const [submitting, setSubmitting] = useState(false)

  if (!product) return null

  async function handleConfirm() {
    if (!product) return
    setSubmitting(true)
    try {
      await productsApi.excluir(product.id)
      onDeleted()
      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao excluir produto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!product}
      title="Excluir Produto"
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
        <Input label="Produto" value={product.name} disabled readOnly />
        <Input label="Custo do Produto (Unitário)" value={currency(product.price)} disabled readOnly />
      </div>
      <Input
        label="Quantidade de produtos no estoque"
        value={`${product.stockQuantity} unidades`}
        disabled
        readOnly
      />
      <Input
        label="Valor Total"
        value={currency(product.price * product.stockQuantity)}
        disabled
        readOnly
      />
      <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
        Deseja realmente excluir esse produto? Essa operação não poderá ser revertida!
      </p>
    </Modal>
  )
}
