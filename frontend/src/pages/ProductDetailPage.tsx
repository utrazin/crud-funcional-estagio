import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ProductDetail } from '../api/products'
import { productsApi } from '../api/products'
import { Modal } from '../components/shared/Modal'
import { Skeleton } from '../components/shared/Skeleton'
import { Button } from '../components/shared/Button'
import { ReadOnlyFields } from '../components/shared/ReadOnlyFields'
import { IconButton } from '../components/shared/IconButton'
import { CancelSaleModal } from '../components/shared/CancelSaleModal'
import { ProductFormModal } from '../components/products/ProductFormModal'
import { DeleteProductModal } from '../components/products/DeleteProductModal'
import { XIcon } from '../components/shared/icons'
import { invalidateResources } from '../utils/useSessionResource'
import '../styles/table.css'

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
function readCachedProduct(id?: string): ProductDetail | null { try { return JSON.parse(sessionStorage.getItem(`stockfinance.resource.product-detail.${id}`) || 'null') as ProductDetail | null } catch { return null } }
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const close = () => navigate('/produtos')
  const [product, setProduct] = useState<ProductDetail | null>(() => readCachedProduct(id))
  const [loading, setLoading] = useState(() => !readCachedProduct(id))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [canceling, setCanceling] = useState<{ id: string; fields: { label: string; value: string }[] } | null>(null)
  const reload = useCallback(async () => { if (!id) return; try { const next = await productsApi.detalhes(id); setProduct(next); sessionStorage.setItem(`stockfinance.resource.product-detail.${id}`, JSON.stringify(next)); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Produto não encontrado') } finally { setLoading(false) } }, [id])
  useEffect(() => { const cached = readCachedProduct(id); setProduct(cached); setLoading(!cached); void reload() }, [id, reload])
  return <><Modal open title={product?.name ?? 'Detalhes do Produto'} onClose={close} width={900} footer={<><Button variant="secondary" onClick={close}>Fechar</Button>{product && <><Button variant="secondary" onClick={() => setEditing(true)}>Editar</Button><Button variant="danger" onClick={() => setDeleting(true)}>Excluir</Button></>}</>}>
    {loading ? <Skeleton rows={4} metrics={3} /> : error ? <p role="alert">{error}</p> : product && <><p>{product.description}</p><ReadOnlyFields fields={[{ label: 'Estoque atual', value: `${product.stockQuantity} unidades` }, { label: 'Custo unitário', value: currency(product.price) }, { label: 'Valor em estoque', value: currency(product.price * product.stockQuantity) }, { label: 'Total vendido', value: currency(product.valorTotalVendido) }]} /><h3>Histórico de vendas</h3><div className="table-ds__container"><table className="table-ds"><thead><tr><th>Data</th><th>Quantidade</th><th>Valor total</th><th>Valor unitário</th><th>Comprador</th><th>Ações</th></tr></thead><tbody>{product.vendas.map((sale) => <tr key={sale.id}><td data-label="Data">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</td><td data-label="Quantidade">{sale.quantity}</td><td data-label="Valor total">{currency(sale.totalPrice)}</td><td data-label="Valor unitário">{currency(sale.unitPrice)}</td><td data-label="Comprador">{sale.comprador}</td><td data-label="Ações"><IconButton icon={<XIcon />} variant="danger" ariaLabel="Cancelar venda" onClick={() => setCanceling({ id: sale.id, fields: [{ label: 'Produto', value: product.name }, { label: 'Comprador', value: sale.comprador }, { label: 'Quantidade', value: String(sale.quantity) }, { label: 'Valor', value: currency(sale.totalPrice) }] })} /></td></tr>)}</tbody></table></div></>}
  </Modal><ProductFormModal open={editing} product={product} onClose={() => setEditing(false)} onSaved={() => { invalidateResources('products'); void reload() }} onError={setError} /><DeleteProductModal product={deleting ? product : null} onClose={() => setDeleting(false)} onDeleted={() => { invalidateResources('products'); close() }} onError={setError} /><CancelSaleModal sale={canceling} onClose={() => setCanceling(null)} onCancelled={() => { invalidateResources('products', 'clients', 'sales'); void reload() }} onError={setError} /></>
}
