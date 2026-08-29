import { useEffect, useState } from 'react'
import type { Product } from '../../types'
import type { Client } from '../../types'
import { salesApi } from '../../api/sales'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { CurrencyInput } from '../shared/CurrencyInput'
import { Badge } from '../shared/Badge'
import { ClientAutocomplete } from './ClientAutocomplete'

interface SellModalProps {
  product: Product | null
  onClose: () => void
  onSold: () => void
  onError: (message: string) => void
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const today = () => new Date().toISOString().slice(0, 10)

export function SellModal({ product, onClose, onSold, onError }: SellModalProps) {
  const [quantity, setQuantity] = useState('1')
  const [salePrice, setSalePrice] = useState(0)
  const [buyerName, setBuyerName] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [saleDate, setSaleDate] = useState(today())
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (product) {
      setQuantity('1')
      setSalePrice(product.price)
      setBuyerName('')
      setSelectedClient(null)
      setSaleDate(today())
      setAttempted(false)
    }
  }, [product])

  if (!product) return null

  const quantityNumber = Number(quantity)
  const quantityInvalid = quantity.trim() === '' || isNaN(quantityNumber) || quantityNumber <= 0 || !Number.isInteger(quantityNumber) || quantityNumber > product.stockQuantity
  const priceInvalid = !salePrice || salePrice < product.price
  const buyerInvalid = !buyerName.trim()
  const dateInvalid = !saleDate

  const total = (isNaN(quantityNumber) ? 0 : quantityNumber) * salePrice

  async function handleSubmit() {
    if (!product) return
    setAttempted(true)
    if (quantityInvalid || priceInvalid || buyerInvalid || dateInvalid) return

    setSubmitting(true)
    try {
      await salesApi.registrar({
        productId: product.id,
        clientId: selectedClient?.id,
        clientName: selectedClient ? undefined : buyerName,
        quantity: quantityNumber,
        salePrice,
        saleDate,
      })
      onSold()
      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao registrar venda')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!product}
      title="Registrar Venda"
      onClose={onClose}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" onClick={handleSubmit} loading={submitting}>Registrar</Button>
        </>
      }
    >
      <div className="modal-field-row">
        <Input label="Produto" value={product.name} disabled readOnly />
        <Input label="Custo do Produto (Unitário)" value={currency(product.price)} disabled readOnly />
      </div>

      <div className="modal-field-row">
        <Input
          label="Quantidade *"
          type="number"
          min={1}
          max={product.stockQuantity}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={attempted && quantityInvalid ? `Informe de 1 a ${product.stockQuantity}` : undefined}
        />
        <CurrencyInput
          label="Valor da Venda (Unitário) *"
          value={salePrice}
          onChange={setSalePrice}
          error={attempted && priceInvalid ? `Mínimo ${currency(product.price)}` : undefined}
        />
      </div>

      <ClientAutocomplete value={buyerName} onChange={setBuyerName} onSelect={setSelectedClient} />
      {attempted && buyerInvalid && (
        <span className="text-caption" style={{ color: 'var(--color-text-danger)' }}>Nome do comprador é obrigatório</span>
      )}

      <Input
        label="Data da Venda *"
        type="date"
        value={saleDate}
        onChange={(e) => setSaleDate(e.target.value)}
        error={attempted && dateInvalid ? 'Obrigatório' : undefined}
      />

      <Badge variant="success">Estoque Disponível: {product.stockQuantity} unidades</Badge>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          borderRadius: 8,
          backgroundColor: 'var(--color-bg-success-subtle)',
        }}
      >
        <span className="text-body-medium" style={{ color: 'var(--color-text-success)' }}>Valor Total</span>
        <span className="text-numeric-large" style={{ color: 'var(--green-600)' }}>{currency(total)}</span>
      </div>
    </Modal>
  )
}
