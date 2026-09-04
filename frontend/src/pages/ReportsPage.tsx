import { useEffect, useRef, useState } from 'react'
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
import { Toast } from '../components/shared/Toast'
import { useToast } from '../components/shared/useToast'
import { PageLoader } from '../components/shared/PageLoader'
import { UploadIcon, DownloadIcon, ChevronDownIcon, XIcon } from '../components/shared/icons'
import { usePersistedState } from '../utils/usePersistedState'
import '../styles/table.css'
import './ReportsPage.css'

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function firstDayOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function today() {
  return new Date().toISOString().slice(0, 10)
}

export function ReportsPage() {
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [from, setFrom] = usePersistedState('reportsPage.from', firstDayOfMonth())
  const [to, setTo] = usePersistedState('reportsPage.to', today())
  const [productIds, setProductIds] = usePersistedState<string[]>('reportsPage.productIds', [])
  const [clientIds, setClientIds] = usePersistedState<string[]>('reportsPage.clientIds', [])
  const [sales, setSales] = useState<Sale[]>([])
  const [summary, setSummary] = useState({
    totalVendas: 0,
    faturamentoTotal: 0,
    totalProdutosVendidos: 0,
    ticketMedio: 0,
    totalClientes: 0,
    geradoEm: '',
  })
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [cancelingSale, setCancelingSale] = useState<{ id: string; fields: { label: string; value: string }[] } | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const filters = { from, to, productIds, clientIds }

  async function loadData() {
    setRefreshing(true)
    try {
      const [salesData, summaryData] = await Promise.all([
        reportsApi.listarVendas(filters),
        reportsApi.resumo(filters),
      ])
      setSales(salesData)
      setSummary(summaryData)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao carregar relatório')
    } finally {
      setRefreshing(false)
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    productsApi.listar().then(setProducts).catch(() => setProducts([]))
    clientsApi.listar().then(setClients).catch(() => setClients([]))
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleExport(format: 'xlsx' | 'csv') {
    setExportMenuOpen(false)
    window.open(reportsApi.exportarUrl(filters, format), '_blank')
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
      showError(err instanceof Error ? err.message : 'Erro ao importar planilha')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <PageHeader
        title="Relatórios Financeiros"
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
            <Button variant="secondary" leadingIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()} loading={importing}>
              Importar
            </Button>
            <div className="reports-page__export-wrapper" ref={exportMenuRef}>
              <Button
                variant="secondary"
                leadingIcon={<DownloadIcon />}
                onClick={() => setExportMenuOpen((v) => !v)}
              >
                Exportar Relatório
                <ChevronDownIcon style={{ width: 14, height: 14, marginLeft: 4 }} />
              </Button>
              {exportMenuOpen && (
                <div className="reports-page__export-menu">
                  <button className="reports-page__export-option text-body-default" onClick={() => handleExport('xlsx')}>
                    Excel (.xlsx)
                  </button>
                  <button className="reports-page__export-option text-body-default" onClick={() => handleExport('csv')}>
                    CSV
                  </button>
                </div>
              )}
            </div>
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
            options={products.map((p) => ({ id: p.id, label: p.name }))}
            selected={productIds}
            onChange={setProductIds}
            style={{ width: 220 }}
          />
          <CheckboxMultiSelect
            placeholder="Todos os clientes"
            options={clients.map((c) => ({ id: c.id, label: c.name }))}
            selected={clientIds}
            onChange={setClientIds}
            style={{ width: 220 }}
          />
        </div>
        <Button onClick={loadData} loading={refreshing}>Atualizar</Button>
      </div>

      {initialLoading ? (
        <PageLoader label="Carregando relatório..." />
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
                  <th className="text-label-small">Quantidade</th>
                  <th className="text-label-small">Valor</th>
                  <th className="text-label-small">Data</th>
                  <th className="text-label-small" />
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="text-body-medium">{sale.product.name}</td>
                    <td className="text-body-default">{sale.quantity}</td>
                    <td className="text-body-medium">{currency(sale.totalPrice)}</td>
                    <td className="text-body-default">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</td>
                    <td>
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
