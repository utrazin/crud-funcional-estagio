import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { useProducts } from '../components/products/useProducts'
import { ProductsTable } from '../components/products/ProductsTable'
import { SellModal } from '../components/products/SellModal'
import { ProductFormModal } from '../components/products/ProductFormModal'
import { DeleteProductModal } from '../components/products/DeleteProductModal'
import { PageHeader } from '../components/shared/PageHeader'
import { KpiRow } from '../components/shared/KpiRow'
import { StatTile } from '../components/shared/StatTile'
import { Input } from '../components/shared/Input'
import { Button } from '../components/shared/Button'
import { Toast } from '../components/shared/Toast'
import { useToast } from '../components/shared/useToast'
import { Skeleton } from '../components/shared/Skeleton'
import { SearchIcon, PlusIcon } from '../components/shared/icons'
import { usePersistedState } from '../utils/usePersistedState'

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ProductsPage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate()
  const { products, loading, reload, refreshing, error } = useProducts()
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [search, setSearch] = usePersistedState('productsPage.search', '')
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [creating, setCreating] = useState(createOnMount)

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const lower = search.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(lower))
  }, [products, search])

  const totalProdutos = products.length
  const quantidadeEmEstoque = products.reduce((sum, p) => sum + p.stockQuantity, 0)
  const valorTotalEmEstoque = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0)

  function handleReload() {
    reload()
    showSuccess('Operação realizada com sucesso!')
  }

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <PageHeader
        title="Produtos"
        actions={
          <>
            <Input
              placeholder="Buscar produto..."
              leadingIcon={<SearchIcon />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
            />
            <Button leadingIcon={<PlusIcon />} onClick={() => setCreating(true)}>
              Adicionar
            </Button>
          </>
        }
      />

      {!loading && <KpiRow>
        <StatTile label="Total de Produtos" value={totalProdutos} />
        <StatTile label="Quantidade em Estoque" value={quantidadeEmEstoque} />
        <StatTile label="Valor Total em Estoque" value={currency(valorTotalEmEstoque)} featured tone="blue" />
      </KpiRow>}

      {error && <p role="alert">{error}</p>}
      {refreshing && !loading && <span className="refresh-indicator">Atualizando produtos...</span>}
      {loading ? (
        <Skeleton />
      ) : (
        <ProductsTable
          products={filtered}
          onRequestEdit={setEditingProduct}
          onRequestDelete={setDeletingProduct}
          onRequestSell={setSellingProduct}
        />
      )}

      <SellModal
        product={sellingProduct}
        onClose={() => setSellingProduct(null)}
        onSold={handleReload}
        onError={showError}
      />
      <ProductFormModal open={creating || !!editingProduct} product={editingProduct} onClose={() => { setCreating(false); setEditingProduct(null); if (createOnMount) navigate('/produtos') }} onSaved={handleReload} onError={showError} />

      <DeleteProductModal
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onDeleted={handleReload}
        onError={showError}
      />
    </>
  )
}
