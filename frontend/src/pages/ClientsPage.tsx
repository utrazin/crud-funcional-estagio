import { useMemo, useState } from 'react'
import { useClients } from '../components/clients/useClients'
import { ClientTable } from '../components/clients/ClientTable'
import { CreateClientModal } from '../components/clients/CreateClientModal'
import { PageHeader } from '../components/shared/PageHeader'
import { KpiRow } from '../components/shared/KpiRow'
import { StatTile } from '../components/shared/StatTile'
import { Input } from '../components/shared/Input'
import { Button } from '../components/shared/Button'
import { Toast } from '../components/shared/Toast'
import { useToast } from '../components/shared/useToast'
import { PageLoader } from '../components/shared/PageLoader'
import { SearchIcon, PlusIcon } from '../components/shared/icons'

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ClientsPage() {
  const { clients, loading, reload } = useClients()
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const lower = search.toLowerCase()
    return clients.filter((c) => c.name.toLowerCase().includes(lower))
  }, [clients, search])

  const totalClientes = clients.length
  const totalCompras = clients.reduce((sum, c) => sum + c.totalProductsPurchased, 0)
  const valorTotalGasto = clients.reduce((sum, c) => sum + c.totalSpent, 0)

  function handleReload() {
    reload()
    showSuccess('Operação realizada com sucesso!')
  }

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <PageHeader
        title="Clientes"
        actions={
          <>
            <Input
              placeholder="Buscar cliente..."
              leadingIcon={<SearchIcon />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
            />
            <Button leadingIcon={<PlusIcon />} onClick={() => setCreateOpen(true)}>
              Adicionar
            </Button>
          </>
        }
      />

      <KpiRow>
        <StatTile label="Total de Clientes" value={totalClientes} />
        <StatTile label="Total de Compras" value={totalCompras} />
        <StatTile label="Valor Total Gasto" value={currency(valorTotalGasto)} featured tone="green" />
      </KpiRow>

      {loading ? <PageLoader label="Carregando clientes..." /> : <ClientTable clients={filtered} />}

      <CreateClientModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleReload}
        onError={showError}
      />
    </>
  )
}
