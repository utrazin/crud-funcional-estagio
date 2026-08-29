import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ProductDetail } from '../api/products'
import { productsApi } from '../api/products'
import { Badge } from '../components/shared/Badge'
import { IconButton } from '../components/shared/IconButton'
import { CancelSaleModal } from '../components/shared/CancelSaleModal'
import { Toast } from '../components/shared/Toast'
import { useToast } from '../components/shared/useToast'
import { PageLoader } from '../components/shared/PageLoader'
import { ChevronLeftIcon, XIcon } from '../components/shared/icons'
import '../styles/table.css'
import './ProductDetailPage.css'

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR')} - ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [cancelingSale, setCancelingSale] = useState<{ id: string; fields: { label: string; value: string }[] } | null>(null)

  function reload() {
    if (!id) return
    productsApi
      .detalhes(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <PageLoader label="Carregando produto..." />
  if (!product) return <p className="text-body-default">Produto não encontrado.</p>

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <button className="product-detail-page__back" onClick={() => navigate('/produtos')}>
        <ChevronLeftIcon />
        <span className="text-body-medium">Voltar para Produtos</span>
      </button>

      <h1 className="text-page-title">{product.name}</h1>
      {product.description && (
        <p className="text-body-large" style={{ color: 'var(--color-text-secondary)' }}>{product.description}</p>
      )}

      <div className="product-detail-page__summary">
        <div className="product-detail-page__metric">
          <span className="text-label-small" style={{ color: 'var(--color-text-tertiary)' }}>Estoque Atual</span>
          <span className="text-numeric-large">{product.stockQuantity} unidades</span>
        </div>
        <div className="product-detail-page__metric">
          <span className="text-label-small" style={{ color: 'var(--color-text-tertiary)' }}>Preço Unitário</span>
          <span className="text-numeric-large">{currency(product.price)}</span>
        </div>
        <div className="product-detail-page__metric">
          <span className="text-label-small" style={{ color: 'var(--color-text-link)' }}>Valor Total em Estoque</span>
          <span className="text-numeric-large" style={{ color: 'var(--blue-700)' }}>
            {currency(product.price * product.stockQuantity)}
          </span>
        </div>
        <div className="product-detail-page__metric">
          <span className="text-label-small" style={{ color: 'var(--color-text-success)' }}>Valor Total Vendido</span>
          <span className="text-numeric-large" style={{ color: 'var(--green-600)' }}>
            {currency(product.valorTotalVendido)}
          </span>
        </div>
      </div>

      <div className="product-detail-page__section-header">
        <h2 className="text-section-heading">Histórico de Vendas</h2>
        <Badge>{product.vendas.length} vendas realizadas</Badge>
      </div>

      <div className="table-ds__container">
        <table className="table-ds">
          <thead>
            <tr>
              <th className="text-label-small">Data</th>
              <th className="text-label-small">Quantidade</th>
              <th className="text-label-small">Valor Total</th>
              <th className="text-label-small">Valor Unitário</th>
              <th className="text-label-small">Comprador</th>
              <th className="text-label-small" />
            </tr>
          </thead>
          <tbody>
            {product.vendas.map((sale) => (
              <tr key={sale.id}>
                <td className="text-body-default">{formatDateTime(sale.saleDate)}</td>
                <td className="text-body-default">{sale.quantity} unidades</td>
                <td className="text-body-medium">{currency(sale.totalPrice)}</td>
                <td className="text-body-default">{currency(sale.unitPrice)}</td>
                <td className="text-body-default">{sale.comprador}</td>
                <td>
                  <div className="table-ds__actions">
                    <IconButton
                      icon={<XIcon />}
                      variant="danger"
                      ariaLabel="Cancelar Venda"
                      onClick={() =>
                        setCancelingSale({
                          id: sale.id,
                          fields: [
                            { label: 'Produto', value: product.name },
                            { label: 'Quantidade', value: `${sale.quantity} unidades` },
                            { label: 'Valor Total', value: currency(sale.totalPrice) },
                            { label: 'Comprador', value: sale.comprador },
                          ],
                        })
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CancelSaleModal
        sale={cancelingSale}
        onClose={() => setCancelingSale(null)}
        onCancelled={() => {
          showSuccess('Venda cancelada com sucesso!')
          reload()
        }}
        onError={showError}
      />
    </>
  )
}
