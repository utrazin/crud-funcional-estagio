import { useState } from 'react'
import type { Product } from '../../types'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { ReadOnlyFields } from '../shared/ReadOnlyFields'
import { productsApi } from '../../api/products'

interface Props { product: Product | null; onClose: () => void; onDeleted: () => void; onError: (message: string) => void }
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export function DeleteProductModal({ product, onClose, onDeleted, onError }: Props) {
  const [submitting, setSubmitting] = useState(false)
  if (!product) return null
  async function confirm() {
    if (!product || submitting) return
    setSubmitting(true)
    try { await productsApi.excluir(product.id); onDeleted(); onClose() }
    catch (err) { onError(err instanceof Error ? err.message : 'Erro ao excluir produto') }
    finally { setSubmitting(false) }
  }
  return <Modal open title="Excluir Produto" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={confirm} loading={submitting}>Sim, excluir</Button></>}>
    <ReadOnlyFields fields={[{ label: 'Produto', value: product.name }, { label: 'Custo unitário', value: currency(product.price) }, { label: 'Estoque', value: `${product.stockQuantity} unidades` }, { label: 'Valor total', value: currency(product.price * product.stockQuantity) }]} />
    <p>Deseja realmente excluir esse produto? Essa operação não poderá ser revertida.</p>
  </Modal>
}
