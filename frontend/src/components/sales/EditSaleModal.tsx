import { useEffect, useState } from 'react'
import type { Sale, Client } from '../../types'
import { salesApi } from '../../api/sales'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { CurrencyInput } from '../shared/CurrencyInput'
import { Badge } from '../shared/Badge'
import { ClientAutocomplete } from '../products/ClientAutocomplete'
import { validateSaleQuantity, validatePrice, validateClientName, validateRequired } from '../../utils/validators'

interface EditSaleModalProps {
  sale: Sale | null
  onClose: () => void
  onSaved: () => void
  onError: (message: string) => void
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Extrai "YYYY-MM-DD" no fuso local (não via slice do ISO em UTC, que pode
// mostrar o dia errado perto da meia-noite em fusos negativos como o do Brasil).
function toDateInputValue(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function EditSaleModal({ sale, onClose, onSaved, onError }: EditSaleModalProps) {
  const [quantity, setQuantity] = useState('1')
  const [salePrice, setSalePrice] = useState(0)
  const [buyerName, setBuyerName] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [saleDate, setSaleDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (sale) {
      setQuantity(String(sale.quantity))
      setSalePrice(sale.unitPrice)
      setBuyerName(sale.client?.name ?? '')
      // O comprador já é um cliente real cadastrado; só precisamos do id pra
      // reenviar no PUT — os demais campos de Client não são usados aqui.
      setSelectedClient(
        sale.client
          ? {
              id: sale.client.id,
              name: sale.client.name,
              cellphone: sale.client.cellphone,
              totalPurchases: 0,
              totalProductsPurchased: 0,
              totalSpent: 0,
              createdAt: '',
              updatedAt: '',
              deletedAt: sale.client.deletedAt,
            }
          : null,
      )
      setSaleDate(toDateInputValue(sale.saleDate))
    }
  }, [sale])

  if (!sale) return null

  // Estoque do produto já reflete a venda atual como "vendida"; somamos de
  // volta a quantidade desta venda pra saber quanto está realmente disponível
  // pra editar (o backend reverte e reaplica o estoque no PUT).
  const availableStock = sale.product.stockQuantity + sale.quantity
  const quantityNumber = Number(quantity)
  const quantityError = validateSaleQuantity(quantity, availableStock)
  const priceError = validatePrice(salePrice)
  const buyerError = selectedClient ? undefined : (validateClientName(buyerName) || 'Selecione um cliente existente da lista')
  const dateError = validateRequired(saleDate, 'Data da venda é obrigatória')
  const hasError = !!quantityError || !!priceError || !!buyerError || !!dateError

  const total = (isNaN(quantityNumber) ? 0 : quantityNumber) * salePrice

  async function handleSubmit() {
    if (!sale || hasError || !selectedClient) return

    setSubmitting(true)
    try {
      await salesApi.atualizar(sale.id, {
        productId: sale.productId,
        clientId: selectedClient.id,
        quantity: quantityNumber,
        salePrice,
        saleDate,
      })
      onSaved()
      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao salvar venda')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!sale}
      title="Editar Venda"
      onClose={onClose}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" onClick={handleSubmit} disabled={hasError} loading={submitting}>Salvar</Button>
        </>
      }
    >
      <div className="modal-field-row">
        <Input label="Produto" value={sale.product.name} disabled readOnly />
        <Input label="Custo do Produto (Unitário)" value={currency(sale.product.price)} disabled readOnly />
      </div>

      <div className="modal-field-row">
        <Input
          label="Quantidade *"
          type="number"
          min={1}
          max={availableStock}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={quantityError}
        />
        <CurrencyInput
          label="Valor da Venda (Unitário) *"
          value={salePrice}
          onChange={setSalePrice}
          error={priceError}
        />
      </div>

      <ClientAutocomplete
        value={buyerName}
        onChange={setBuyerName}
        onSelect={setSelectedClient}
        error={buyerName ? buyerError : undefined}
      />

      <Input
        label="Data da Venda *"
        type="date"
        value={saleDate}
        onChange={(e) => setSaleDate(e.target.value)}
        error={dateError}
      />

      <Badge variant="success">Estoque Disponível: {availableStock} unidades</Badge>

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
