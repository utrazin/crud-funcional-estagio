import { useState, useEffect } from 'react'
import type { Product } from '../../types'

interface ProductFormProps {
  editing: Product | null
  onSubmit: (data: { name: string; price: number; stockQuantity: number; description?: string }) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ editing, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setPrice(String(editing.price))
      setStockQuantity(String(editing.stockQuantity))
      setDescription(editing.description || '')
    } else {
      setName('')
      setPrice('')
      setStockQuantity('')
      setDescription('')
    }
  }, [editing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        name,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        description: description || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 id="product-form-title">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="product-name">Nome *</label>
            <input
              id="product-name"
              type="text"
              placeholder="Nome do produto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-price">Preço (R$) *</label>
            <input
              id="product-price"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-stock">Estoque *</label>
            <input
              id="product-stock"
              type="number"
              placeholder="0"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-description">Descrição</label>
            <input
              id="product-description"
              type="text"
              placeholder="Opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editing ? 'Salvar' : 'Cadastrar'}
              </button>
              {editing && (
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
