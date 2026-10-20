import { useEffect, useRef, useState } from 'react'
import { currency } from '../utils/format'
import type { Sale, Product, Client } from '../types'
import { reportsApi } from '../api/reports'
import { productsApi } from '../api/products'
import { clientsApi } from '../api/clients'
import { PageHeader } from '../components/shared/PageHeader'
import { KpiRow } from '../components/shared/KpiRow'
import { StatTile } from '../components/shared/StatTile'
import { Input } from '../components/shared/Input'
import { CheckboxMultiSelect } from '../components/shared/CheckboxMultiSelect'
import { Button } from '../components/shared/Button'
import { IconButton } from '../components/shared/IconButton'
import { CancelSaleModal } from '../components/shared/CancelSaleModal'
import { useToast } from '../components/shared/useToast'
import { Skeleton } from '../components/shared/Skeleton'
import { UploadIcon, DownloadIcon, XIcon } from '../components/shared/icons'
import { usePersistedState } from '../utils/usePersistedState'
import { validateSaleDate } from '../utils/validators'
import '../styles/table.css'
import './ReportsPage.css'


function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ReportsPage() {
  const { showSuccess, showError } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [from, setFrom] = usePersistedState('reportsPage.from', firstDayOfMonth())
  const [to, setTo] = usePersistedState('reportsPage.to', today())
  const [productIds, setProductIds] = usePersistedState<string[]>('reportsPage.productIds', [])
  const [clientIds, setClientIds] = usePersistedState<string[]>('reportsPage.clientIds', [])
  const reportCacheKey = `stockfinance.resource.reports.${JSON.stringify({ from, to, productIds, clientIds })}`
  const cached = (() => { try { return JSON.parse(sessionStorage.getItem(reportCacheKey) || 'null') as { sales: Sale[]; summary: { totalVendas: number; faturamentoTotal: number; totalProdutosVendidos: number; ticketMedio: number; totalClientes: number; geradoEm: string } } | null } catch { return null } })()
  const [sales, setSales] = useState<Sale[]>(cached?.sales ?? [])
  const [summary, setSummary] = useState(cached?.summary ?? {
    totalVendas: 0,
    faturamentoTotal: 0,
    totalProdutosVendidos: 0,
    ticketMedio: 0,
    totalClientes: 0,
    geradoEm: '',
  })
  const [cancelingSale, setCancelingSale] = useState<{ id: string; fields: { label: string; value: string }[] } | null>(null)
  const [initialLoading, setInitialLoading] = useState(!cached)
  const [refreshing, setRefreshing] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filters = { from, to, productIds, clientIds }
  const filterError = (from && validateSaleDate(from)) || (to && validateSaleDate(to)) || (from && to && from > to ? 'A data inicial deve ser anterior à final' : '')

  async function loadData(notify = false) {
    if (filterError) { showError(filterError); return }
    setRefreshing(true)
    try {
      const [salesData, summaryData] = await Promise.all([
        reportsApi.listarVendas(filters),
        reportsApi.resumo(filters),
      ])
      setSales(salesData)
      setSummary(summaryData)
      sessionStorage.setItem(reportCacheKey, JSON.stringify({ sales: salesData, summary: summaryData }))
      if (notify) showSuccess('Relatório atualizado com sucesso!')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao carregar relatório')
    } finally {
      setRefreshing(false)
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    productsApi.listar().then(setProducts).catch(() => { setProducts([]); showError('Não foi possível carregar produtos para o filtro.') })
    clientsApi.listar().then(setClients).catch(() => { setClients([]); showError('Não foi possível carregar clientes para o filtro.') })
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleExport() {
    if (filterError) { showError(filterError); return }
    const opened = window.open(reportsApi.exportarUrl(filters), '_blank')
    if (opened) showSuccess('Exportação iniciada.')
    else showError('O navegador bloqueou a exportação. Permita pop-ups e tente novamente.')
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const result = await reportsApi.importar(file)
      if (result.skipped.length === 0) {
        showSuccess(`${result.imported} venda(s) importada(s) com sucesso!`)
      } else {
        showError(`${result.imported} importada(s), ${result.skipped.length} ignorada(s): ${result.skipped.map((s) => `linha ${s.row} (${s.reason})`).join('; ')}`)
      }
      loadData()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao importar arquivo')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <PageHeader
        title="Relatórios Financeiros"
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
            <Button variant="secondary" leadingIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()} loading={importing}>
              Importar CSV
            </Button>
            <Button variant="secondary" leadingIcon={<DownloadIcon />} onClick={handleExport}>
              Exportar CSV
            </Button>
          </>
        }
      />

      <div className="reports-page__filters">
        <div className="reports-page__filters-left">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 160 }} />
          <span className="text-body-default" style={{ color: 'var(--color-text-tertiary)' }}>até</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 160 }} />
          <CheckboxMultiSelect
            placeholder="Todos os produtos"
            options={[...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((p) => ({ id: p.id, label: p.name }))}
            selected={productIds}
            onChange={setProductIds}
            style={{ width: 220 }}
          />
          <CheckboxMultiSelect
            placeholder="Todos os clientes"
            options={[...clients].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((c) => ({ id: c.id, label: c.name }))}
            selected={clientIds}
            onChange={setClientIds}
            style={{ width: 220 }}
          />
        </div>
        <Button onClick={() => void loadData(true)} loading={refreshing} disabled={!!filterError}>Atualizar</Button>
      </div>

      {filterError && <p role="alert" style={{ color: 'var(--color-text-danger)' }}>{filterError}</p>}

      {initialLoading ? (
        <Skeleton rows={5} metrics={5} />
      ) : (
        <>
          <KpiRow>
            <StatTile label="Total de Vendas" value={summary.totalVendas} />
            <StatTile label="Produtos Vendidos" value={summary.totalProdutosVendidos} />
            <StatTile label="Ticket Médio" value={currency(summary.ticketMedio)} />
            <StatTile label="Clientes Atendidos" value={summary.totalClientes} />
            <StatTile label="Faturamento Total" value={currency(summary.faturamentoTotal)} featured tone="green" />
          </KpiRow>

          <h2 className="text-section-heading">Histórico de Vendas</h2>

          <div className="table-ds__container">
            <table className="table-ds">
              <thead>
                <tr>
                  <th className="text-label-small">Produto</th>
                  <th className="text-label-small">Cliente</th>
                  <th className="text-label-small">Quantidade</th>
                  <th className="text-label-small">Valor</th>
                  <th className="text-label-small">Data</th>
                  <th className="text-label-small" />
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td data-label="Produto" className="text-body-medium">{sale.product.name}</td>
                    <td data-label="Cliente" className="text-body-default">{sale.client?.name ?? 'Cliente removido'}</td>
                    <td data-label="Quantidade" className="text-body-default">{sale.quantity}</td>
                    <td data-label="Valor" className="text-body-medium">{currency(sale.totalPrice)}</td>
                    <td data-label="Data" className="text-body-default">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</td>
                    <td data-label="Ações">
                      <div className="table-ds__actions">
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
        </>
      )}

      <CancelSaleModal
        sale={cancelingSale}
        onClose={() => setCancelingSale(null)}
        onCancelled={() => {
          showSuccess('Venda cancelada com sucesso!')
          loadData()
        }}
        onError={showError}
      />
    </>
  )
}
