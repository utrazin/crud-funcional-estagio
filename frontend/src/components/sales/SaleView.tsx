import { useState, useCallback } from 'react'
import type { Sale } from '../../types'
import { salesApi } from '../../api/sales'
import { SaleForm } from './SaleForm'
import { Toast } from '../shared/Toast'
import { useToast } from '../shared/useToast'
import { useSaleForm } from './useSaleForm'
import { useSales } from './useSales'
import { findClientById } from '../../mocks/clients'
import { formatDate } from '../../utils/formatDate'

export function SaleView() {
  const { sales, loading, reload } = useSales()
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Sale[] | null>(null)

  const form = useSaleForm()

  function editar(sale: Sale) {
    const clientName = findClientById(sale.clientId)?.name ?? sale.clientId
    const productName = sale.product?.name ?? ''
    form.preencherParaEdicao(
      { id: sale.id, productId: sale.productId, clientId: sale.clientId, quantity: sale.quantity, unitPrice: sale.unitPrice, saleDate: sale.saleDate },
      productName,
      clientName,
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.selectedProduct) { showError('Selecione um produto.'); return }
    if (!form.selectedClient) { showError('Selecione um cliente.'); return }
    if (!form.unitPrice || form.unitPrice <= 0) { showError('Valor unitário deve ser maior que zero.'); return }

    if (!form.editingId && form.selectedProduct && form.quantity > form.selectedProduct.stockQuantity) {
      showError(`Estoque insuficiente (disponível: ${form.selectedProduct.stockQuantity}).`)
      return
    }

    setSubmitting(true)
    try {
      if (form.editingId) {
        await salesApi.atualizar(form.editingId, {
          productId: form.selectedProduct.id,
          clientId: form.selectedClient.id,
          quantity: form.quantity,
          salePrice: form.unitPrice,
          saleDate: form.saleDate,
        })
        showSuccess('Venda atualizada com sucesso!')
      } else {
        await salesApi.registrar({
          productId: form.selectedProduct.id,
          clientId: form.selectedClient.id,
          quantity: form.quantity,
          salePrice: form.unitPrice,
          saleDate: form.saleDate,
        })
        showSuccess('Venda registrada com sucesso!')
      }
      form.resetForm()
      reload()
    } catch (err: any) {
      showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function cancelar(sale: Sale) {
    if (!confirm('Cancelar esta venda? O estoque será restaurado.')) return
    try {
      await salesApi.cancelar(sale.id)
      showSuccess('Venda cancelada com sucesso!')
      reload()
    } catch (err: any) {
      showError(err.message)
    }
  }

  const buscar = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    try {
      const results = await salesApi.buscar(searchTerm)
      setSearchResults(results)
    } catch (err: any) {
      showError(err.message)
    } finally {
      setSearching(false)
    }
  }, [searchTerm, showError])

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') buscar()
  }

  function clearSearch() {
    setSearchTerm('')
    setSearchResults(null)
  }

  const displayedSales = searchResults !== null ? searchResults : sales

  return (
    <div>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <SaleForm
        selectedProduct={form.selectedProduct}
        selectedClient={form.selectedClient}
        clientList={form.clientList}
        quantity={form.quantity}
        unitPrice={form.unitPrice}
        totalPrice={form.totalPrice}
        saleDate={form.saleDate}
        clientSearch={form.clientSearch}
        productSearch={form.productSearch}
        products={form.products}
        editing={!!form.editingId}
        onProductSearch={(value) => {
          form.setProductSearch(value)
          if (!value) form.selecionarProduto(null)
        }}
        onProductSelect={form.selecionarProduto}
        onClientSearch={form.buscarClientes}
        onClientSelect={form.selecionarCliente}
        onQuantityChange={form.alterarQuantidade}
        onUnitPriceChange={form.setUnitPrice}
        onSaleDateChange={form.setSaleDate}
        onSubmit={handleSubmit}
        onCancelEdit={form.resetForm}
        loading={submitting}
      />

      <div className="card">
        <h2>Lista de Vendas</h2>

        <div className="form-row" style={{ marginBottom: '12px' }}>
          <div className="form-group">
            <label htmlFor="sale-search">Buscar por produto ou cliente</label>
            <input
              id="sale-search"
              type="text"
              placeholder="Nome do produto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{ minWidth: '260px' }}
            />
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={buscar} disabled={searching}>
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
              <th>Data da Venda</th>
              <th>Produto</th>
              <th>Cliente</th>
              <th>Qtd</th>
              <th>Valor Unit.</th>
              <th>Valor Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="sales-tbody">
            {loading || searching ? (
              <tr><td colSpan={7} className="loading">Carregando...</td></tr>
            ) : displayedSales.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '12px', color: '#888' }}>Nenhuma venda registrada.</td></tr>
            ) : (
              displayedSales.map((s) => (
                <tr key={s.id}>
                  <td>{formatDate(s.saleDate)}</td>
                  <td>{s.product?.name ?? 'Produto removido'}</td>
                  <td>{findClientById(s.clientId)?.name ?? s.clientId}</td>
                  <td>{s.quantity}</td>
                  <td>R$ {s.unitPrice.toFixed(2)}</td>
                  <td>R$ {s.totalPrice.toFixed(2)}</td>
                  <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button className="btn btn-warning" onClick={() => editar(s)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => cancelar(s)}>
                      Cancelar
                    </button>
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
