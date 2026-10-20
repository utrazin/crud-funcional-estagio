import { useMemo, useState } from 'react'
import { currency } from '../utils/format'
import type { Sale } from '../types'
import { useSales } from '../components/sales/useSales'
import { EditSaleModal } from '../components/sales/EditSaleModal'
import { PageHeader } from '../components/shared/PageHeader'
import { KpiRow } from '../components/shared/KpiRow'
import { StatTile } from '../components/shared/StatTile'
import { Input } from '../components/shared/Input'
import { IconButton } from '../components/shared/IconButton'
import { CancelSaleModal } from '../components/shared/CancelSaleModal'
import { useToast } from '../components/shared/useToast'
import { Skeleton } from '../components/shared/Skeleton'
import { SearchIcon, PencilIcon, XIcon } from '../components/shared/icons'
import { usePersistedState } from '../utils/usePersistedState'
import '../styles/table.css'


export function VendasPage() {
  const { sales, loading, reload, refreshing, error } = useSales()
  const { showSuccess, showError } = useToast()
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

      {!loading && <KpiRow>
        <StatTile label="Total de Vendas" value={totalVendas} />
        <StatTile label="Ticket Médio" value={currency(ticketMedio)} />
        <StatTile label="Faturamento Total" value={currency(faturamentoTotal)} featured tone="green" />
      </KpiRow>}

      {error && <p role="alert">{error}</p>}
      {refreshing && !loading && <span className="refresh-indicator">Atualizando vendas...</span>}
      {loading ? (
        <Skeleton />
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
                  <td data-label="Produto" className="text-body-medium">{sale.product.name}</td>
                  <td data-label="Cliente" className="text-body-default">{sale.client?.name ?? 'Cliente removido'}</td>
                  <td data-label="Quantidade" className="text-body-default">{sale.quantity} unidades</td>
                  <td data-label="Valor total" className="text-body-medium">{currency(sale.totalPrice)}</td>
                  <td data-label="Data" className="text-body-default">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</td>
                  <td data-label="Ações">
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
