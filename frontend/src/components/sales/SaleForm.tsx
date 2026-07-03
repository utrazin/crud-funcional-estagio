import type { Product } from '../../types'
import type { MockClient } from '../../mocks/clients'

interface SaleFormProps {
  selectedProduct: Product | null
  selectedClient: MockClient | null
  clientList: MockClient[]
  quantity: number
  unitPrice: number
  totalPrice: number
  saleDate: string
  clientSearch: string
  productSearch: string
  products: Product[]
  editing: boolean
  onProductSearch: (value: string) => void
  onProductSelect: (product: Product | null) => void
  onClientSearch: (term: string) => void
  onClientSelect: (client: MockClient) => void
  onQuantityChange: (qty: number) => void
  onUnitPriceChange: (price: number) => void
  onSaleDateChange: (date: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancelEdit: () => void
  loading: boolean
}

export function SaleForm({
  selectedProduct,
  selectedClient,
  clientList,
  quantity,
  unitPrice,
  totalPrice,
  saleDate,
  clientSearch,
  productSearch,
  products,
  editing,
  onProductSearch,
  onProductSelect,
  onClientSearch,
  onClientSelect,
  onQuantityChange,
  onUnitPriceChange,
  onSaleDateChange,
  onSubmit,
  onCancelEdit,
  loading,
}: SaleFormProps) {
  const filteredProducts = productSearch
    ? products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : products

  return (
    <div className="card">
      <h2>{editing ? 'Editar Venda' : 'Registrar Venda'}</h2>
      <form onSubmit={onSubmit}>
        <div className="form-row">

          {/* Produto */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="sale-product">Produto *</label>
            <input
              id="sale-product"
              type="text"
              placeholder="Buscar produto..."
              value={productSearch}
              onChange={(e) => {
                onProductSearch(e.target.value)
                if (!e.target.value) onProductSelect(null)
              }}
              autoComplete="off"
              required={!selectedProduct}
            />
            {productSearch && !selectedProduct && filteredProducts.length > 0 && (
              <ul className="autocomplete-list">
                {filteredProducts.map((p) => (
                  <li key={p.id} onClick={() => onProductSelect(p)}>
                    {p.name} — R$ {p.price.toFixed(2)} (estoque: {p.stockQuantity})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cliente */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="sale-client">Cliente *</label>
            <input
              id="sale-client"
              type="text"
              placeholder="Buscar cliente..."
              value={clientSearch}
              onChange={(e) => onClientSearch(e.target.value)}
              autoComplete="off"
              required={!selectedClient}
            />
            {clientList.length > 0 && !selectedClient && (
              <ul className="autocomplete-list">
                {clientList.map((c) => (
                  <li key={c.id} onClick={() => onClientSelect(c)}>
                    {c.name}{c.cellphone ? ` — ${c.cellphone}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quantidade */}
          <div className="form-group">
            <label htmlFor="sale-quantity">Quantidade *</label>
            <input
              id="sale-quantity"
              type="number"
              placeholder="1"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          {/* Valor unitário */}
          <div className="form-group">
            <label htmlFor="sale-unit-price">Valor Unitário (R$) *</label>
            <input
              id="sale-unit-price"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={unitPrice || ''}
              onChange={(e) => onUnitPriceChange(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {/* Data da venda */}
          <div className="form-group">
            <label htmlFor="sale-date">Data da Venda *</label>
            <input
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={(e) => onSaleDateChange(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="sale-form-footer">
          <div className="sale-total">
            <strong>Valor Total:</strong>
            <span className="sale-total__value">
              R$ {totalPrice.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {editing ? 'Salvar' : 'Registrar Venda'}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
