import { useEffect, useState } from 'react'
import type { Product } from '../../types'
import { productsApi } from '../../api/products'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { CurrencyInput } from '../shared/CurrencyInput'
import { Textarea } from '../shared/Textarea'
import { QuickAdjust } from '../shared/QuickAdjust'
import { validateProductName, validateStockQuantity, validatePrice } from '../../utils/validators'

interface Props { open: boolean; product?: Product | null; onClose: () => void; onSaved: () => void; onError: (message: string) => void }
export function ProductFormModal({ open, product, onClose, onSaved, onError }: Props) {
  const [name, setName] = useState('')
  const [stock, setStock] = useState('0')
  const [price, setPrice] = useState(0)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)
  useEffect(() => { if (open) { setName(product?.name ?? ''); setStock(String(product?.stockQuantity ?? 0)); setPrice(product?.price ?? 0); setDescription(product?.description ?? ''); setAttempted(false) } }, [open, product?.id])
  const nameError = validateProductName(name), stockError = validateStockQuantity(stock), priceError = validatePrice(price)
  async function submit() {
    setAttempted(true)
    if (nameError || stockError || priceError || submitting) return
    setSubmitting(true)
    try {
      const data = { name: name.trim(), stockQuantity: Number(stock), price, description: description.trim() }
      if (product) await productsApi.atualizar(product.id, data)
      else await productsApi.criar(data)
      onSaved(); onClose()
    } catch (err) { onError(err instanceof Error ? err.message : 'Erro ao salvar produto') }
    finally { setSubmitting(false) }
  }
  return <Modal open={open} title={product ? 'Editar Produto' : 'Cadastrar Produto'} onClose={onClose} width={620} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={submit} loading={submitting}>Salvar</Button></>}>
    <Input label="Nome do Produto *" value={name} onChange={(e) => setName(e.target.value)} error={attempted ? nameError : undefined} />
    <div className="modal-field-row"><div><Input label="Quantidade em Estoque *" type="number" min={0} step={1} value={stock} onChange={(e) => setStock(e.target.value)} error={attempted ? stockError : undefined} /><QuickAdjust unit="1" onMinus={() => setStock(String(Math.max(0, Number(stock) - 1)))} onPlus={() => setStock(String((Number(stock) || 0) + 1))} minusDisabled={Number(stock) <= 0} /></div><div><CurrencyInput label="Preço de Custo (Unitário) *" value={price} onChange={setPrice} error={attempted ? priceError : undefined} /><QuickAdjust unit="R$ 10" onMinus={() => setPrice((current) => Math.max(0.01, Math.round((current - 10) * 100) / 100))} onPlus={() => setPrice((current) => Math.round((current + 10) * 100) / 100)} minusDisabled={price <= 0.01} /></div></div>
    <Textarea label="Descrição (Opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
  </Modal>
}
