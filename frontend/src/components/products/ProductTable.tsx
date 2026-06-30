import type { Product } from '../../types'

interface ProductTableProps {
  products: Product[]
  loading: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="card">
      <h2>Lista de Produtos</h2>
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
          {loading ? (
            <tr>
              <td colSpan={6} className="loading">Carregando...</td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '12px', color: '#888' }}>Nenhum produto cadastrado.</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>R$ {p.price.toFixed(2)}</td>
                <td>{p.stockQuantity}</td>
                <td>{p.salesCount}</td>
                <td>{p.description || '-'}</td>
                <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button className="btn btn-warning" onClick={() => onEdit(p)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => onDelete(p)}>Excluir</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
