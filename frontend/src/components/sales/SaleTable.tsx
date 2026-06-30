import type { Sale } from '../../types'
import { formatDate } from '../../utils/formatDate'
import { findClientById } from '../../mocks/clients'

interface SaleTableProps {
  sales: Sale[]
  loading: boolean
  onCancel: (sale: Sale) => void
}

export function SaleTable({ sales, loading, onCancel }: SaleTableProps) {
  return (
    <div className="card">
      <h2>Lista de Vendas</h2>
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
          {loading ? (
            <tr>
              <td colSpan={7} className="loading">Carregando...</td>
            </tr>
          ) : sales.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '12px', color: '#888' }}>Nenhuma venda registrada.</td>
            </tr>
          ) : (
            sales.map((s) => (
              <tr key={s.id}>
                <td>{formatDate(s.saleDate)}</td>
                <td>{s.product?.name ?? 'Produto removido'}</td>
                <td>{findClientById(s.clientId)?.name ?? s.clientId}</td>
                <td>{s.quantity}</td>
                <td>R$ {s.unitPrice.toFixed(2)}</td>
                <td>R$ {s.totalPrice.toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => onCancel(s)}>
                    Cancelar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
