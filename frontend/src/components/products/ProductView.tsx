import { useState, useCallback } from 'react'
import type { Product } from '../../types'
import { productsApi } from '../../api/products'
import { ProductForm } from './ProductForm'
import { Toast } from '../shared/Toast'
import { useToast } from '../shared/useToast'
import { useProducts } from './useProducts'

export function ProductView() {
  const { products, loading, reload } = useProducts()
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)

  function cancelEdit() {
    setSelectedProduct(null)
  }

  async function criar(data: { name: string; price: number; stockQuantity: number; description?: string }) {
    try {
      await productsApi.criar(data)
      showSuccess('Produto cadastrado com sucesso!')
      reload()
    } catch (err: any) {
      showError(err.message)
      throw err
    }
  }

  async function editar(data: { name: string; price: number; stockQuantity: number; description?: string }) {
    if (!selectedProduct) return
    try {
      await productsApi.atualizar(selectedProduct.id, data)
      showSuccess('Produto atualizado com sucesso!')
      setSelectedProduct(null)
      reload()
    } catch (err: any) {
      showError(err.message)
      throw err
    }
  }

  async function handleSubmit(data: { name: string; price: number; stockQuantity: number; description?: string }) {
    if (selectedProduct) {
      await editar(data)
    } else {
      await criar(data)
    }
  }

  async function excluir(product: Product) {
    if (!confirm(`Excluir o produto "${product.name}"?`)) return
    try {
      await productsApi.excluir(product.id)
      showSuccess('Produto excluído com sucesso!')
      reload()
    } catch (err: any) {
      showError(err.message)
    }
  }

  const buscarPorNome = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    try {
      const results = await productsApi.buscarPorNome(searchTerm)
      setSearchResults(results)
    } catch (err: any) {
      showError(err.message)
    } finally {
      setSearching(false)
    }
  }, [searchTerm, showError])

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') buscarPorNome()
  }

  function clearSearch() {
    setSearchTerm('')
    setSearchResults(null)
  }

  const displayedProducts = searchResults !== null ? searchResults : products

  return (
    <div>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <ProductForm
        editing={selectedProduct}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
      />

      <div className="card">
        <h2>Lista de Produtos</h2>

        <div className="form-row" style={{ marginBottom: '12px' }}>
          <div className="form-group">
            <label htmlFor="product-search">Buscar por nome</label>
            <input
              id="product-search"
              type="text"
              placeholder="Digite o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{ minWidth: '220px' }}
            />
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={buscarPorNome} disabled={searching}>
                Buscar
              </button>
              {searchResults !== null && (
                <button className="btn btn-secondary" onClick={clearSearch}>
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Vendas</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="products-tbody">
            {loading || searching ? (
              <tr>
                <td colSpan={6} className="loading">Carregando...</td>
              </tr>
            ) : displayedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '12px', color: '#888' }}>Nenhum produto encontrado.</td>
              </tr>
            ) : (
              displayedProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>R$ {p.price.toFixed(2)}</td>
                  <td>{p.stockQuantity}</td>
                  <td>{p.salesCount}</td>
                  <td>{p.description || '-'}</td>
                  <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button className="btn btn-warning" onClick={() => setSelectedProduct(p)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => excluir(p)}>Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
