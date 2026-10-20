import { useEffect, useState } from 'react'
import type { Product, Client } from '../../types'
import { salesApi } from '../../api/sales'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { CurrencyInput } from '../shared/CurrencyInput'
import { QuickAdjust } from '../shared/QuickAdjust'
import { ClientAutocomplete } from './ClientAutocomplete'
import { validateSaleQuantity, validatePrice, validateClientName, validateSaleDate } from '../../utils/validators'
import './SellModal.css'

interface Props { product: Product | null; onClose: () => void; onSold: () => void; onError: (message: string) => void }
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
export function SellModal({ product, onClose, onSold, onError }: Props) {
  const [quantity, setQuantity] = useState('1')
  const [salePrice, setSalePrice] = useState(0)
  const [buyerName, setBuyerName] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [saleDate, setSaleDate] = useState(today())
  const [available, setAvailable] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (product) { setQuantity('1'); setSalePrice(product.price); setBuyerName(''); setSelectedClient(null); setSaleDate(today()); setAvailable(product.stockQuantity) } }, [product])
  if (!product) return null
  const quantityNumber = Number(quantity)
  const quantityError = available === 0 ? 'Produto sem estoque' : validateSaleQuantity(quantity, available)
  const priceError = validatePrice(salePrice)
  const buyerError = selectedClient ? undefined : validateClientName(buyerName)
  const dateError = validateSaleDate(saleDate)
  const commonError = !!priceError || !!buyerError || !!dateError || available === 0
  async function submit(units: number, keepOpen: boolean) {
    if (!product || submitting || commonError || units < 1 || units > available) return
    setSubmitting(true)
    try {
      await salesApi.registrar({ productId: product.id, clientId: selectedClient?.id, clientName: selectedClient ? undefined : buyerName.trim(), quantity: units, salePrice, saleDate })
      setAvailable((current) => current - units)
      onSold()
      if (keepOpen) setQuantity('1')
      else onClose()
    } catch (err) { onError(err instanceof Error ? err.message : 'Erro ao registrar venda') }
    finally { setSubmitting(false) }
  }
  return <Modal open title="Registrar Venda" onClose={onClose} width={860} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="success" onClick={() => submit(1, true)} disabled={commonError} loading={submitting}>Vender +1</Button><Button variant="success" onClick={() => submit(quantityNumber, false)} disabled={commonError || !!quantityError} loading={submitting}>Registrar</Button></>}>
    <div className="sale-modal-grid">
      <ClientAutocomplete value={buyerName} onChange={setBuyerName} onSelect={setSelectedClient} error={buyerName ? buyerError : undefined} layout="side" />
      <div className="modal-field-row"><Input label="Produto" value={product.name} disabled readOnly /><Input label="Custo unitário" value={currency(product.price)} disabled readOnly /></div>
      <div className="modal-field-row"><div className="sale-modal-quantity"><Input label={`Quantidade * · Estoque disponível: ${available}`} type="number" min={1} max={Math.max(1, available)} step={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} error={quantityError} disabled={available === 0} /><QuickAdjust unit="1" onMinus={() => setQuantity(String(Math.max(1, quantityNumber - 1)))} onPlus={() => setQuantity(String(Math.min(available, (quantityNumber || 0) + 1)))} minusDisabled={quantityNumber <= 1 || available === 0} plusDisabled={quantityNumber >= available || available === 0} /></div><div><CurrencyInput label="Valor da Venda (Unitário) *" value={salePrice} onChange={setSalePrice} error={priceError} /><QuickAdjust unit="R$ 10" onMinus={() => setSalePrice((current) => Math.max(0.01, Math.round((current - 10) * 100) / 100))} onPlus={() => setSalePrice((current) => Math.round((current + 10) * 100) / 100)} minusDisabled={salePrice <= 0.01} /></div></div>
      <Input label="Data da Venda *" type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} error={dateError} />
      <div className="sale-modal-total"><span>Valor Total</span><strong>{currency((Number.isFinite(quantityNumber) ? quantityNumber : 0) * salePrice)}</strong></div>
    </div>
  </Modal>
}
