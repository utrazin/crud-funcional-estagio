import { useMemo, useState } from 'react'
import type { Sale } from '../types'
import { useSales } from '../components/sales/useSales'
import { EditSaleModal } from '../components/sales/EditSaleModal'
import { PageHeader } from '../components/shared/PageHeader'
import { KpiRow } from '../components/shared/KpiRow'
import { StatTile } from '../components/shared/StatTile'
import { Input } from '../components/shared/Input'
import { IconButton } from '../components/shared/IconButton'
import { CancelSaleModal } from '../components/shared/CancelSaleModal'
import { Toast } from '../components/shared/Toast'
import { useToast } from '../components/shared/useToast'
import { PageLoader } from '../components/shared/PageLoader'
import { SearchIcon, PencilIcon, XIcon } from '../components/shared/icons'
import { usePersistedState } from '../utils/usePersistedState'
import '../styles/table.css'

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function VendasPage() {
  const { sales, loading, reload } = useSales()
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [search, setSearch] = usePersistedState('vendasPage.search', '')
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [cancelingSale, setCancelingSale] = useState<{ id: string; fields: { label: string; value: string }[] } | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return sales
    const lower = search.toLowerCase()
    return sales.filter(
      (s) => s.product.name.toLowerCase().includes(lower) || (s.client?.name ?? '').toLowerCase().includes(lower),
    )
  }, [sales, search])

  const totalVendas = sales.length
  const faturamentoTotal = sales.reduce((sum, s) => sum + s.totalPrice, 0)
  const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0


  return (
    <>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <PageHeader
        title="Vendas"
        actions={
          <Input
            placeholder="Buscar produto ou cliente..."
            leadingIcon={<SearchIcon />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
        }
      />

      <KpiRow>
        <StatTile label="Total de Vendas" value={totalVendas} />
        <StatTile label="Ticket Médio" value={currency(ticketMedio)} />
        <StatTile label="Faturamento Total" value={currency(faturamentoTotal)} featured tone="green" />
      </KpiRow>

      {loading ? (
        <PageLoader label="Carregando vendas..." />
      ) : (
        <div className="table-ds__container">
          <table className="table-ds">
            <thead>
              <tr>
                <th className="text-label-small">Produto</th>
                <th className="text-label-small">Cliente</th>
                <th className="text-label-small">Quantidade</th>
                <th className="text-label-small">Valor Total</th>
                <th className="text-label-small">Data</th>
                <th className="text-label-small" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale) => (
                <tr key={sale.id}>
                  <td className="text-body-medium">{sale.product.name}</td>
                  <td className="text-body-default">{sale.client?.name ?? 'Cliente removido'}</td>
                  <td className="text-body-default">{sale.quantity} unidades</td>
                  <td className="text-body-medium">{currency(sale.totalPrice)}</td>
                  <td className="text-body-default">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="table-ds__actions">
                      <IconButton
                        icon={<PencilIcon />}
                        ariaLabel="Editar Venda"
                        onClick={() => setEditingSale(sale)}
                      />
                      <IconButton
                        icon={<XIcon />}
                        variant="danger"
                        ariaLabel="Cancelar Venda"
                        onClick={() =>
                          setCancelingSale({
                            id: sale.id,
                            fields: [
                              { label: 'Produto', value: sale.product.name },
                              { label: 'Quantidade', value: `${sale.quantity} unidades` },
                              { label: 'Valor Total', value: currency(sale.totalPrice) },
                              { label: 'Comprador', value: sale.client?.name ?? 'Cliente removido' },
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
      )}

      <EditSaleModal
        sale={editingSale}
        onClose={() => setEditingSale(null)}
        onSaved={() => {
          showSuccess('Venda atualizada com sucesso!')
          reload()
        }}
        onError={showError}
      />

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
