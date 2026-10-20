import { useEffect, useMemo, useState } from 'react'
import type { Client } from '../../types'
import { clientsApi } from '../../api/clients'
import { Input } from '../shared/Input'
import { DeleteClientModal } from '../clients/DeleteClientModal'
import { PersonIcon, TrashIcon } from '../shared/icons'
import { IconButton } from '../shared/IconButton'
import { Skeleton } from '../shared/Skeleton'
import { useToast } from '../shared/useToast'
import './ClientAutocomplete.css'

interface Props { value: string; onChange: (value: string) => void; onSelect: (client: Client | null) => void; error?: string; layout?: 'side' | 'field' }
let pendingClients: Promise<Client[]> | null = null
function loadClientsOnce() {
  if (!pendingClients) pendingClients = clientsApi.paraVenda().finally(() => { pendingClients = null })
  return pendingClients
}
export function ClientAutocomplete({ value, onChange, onSelect, error, layout = 'field' }: Props) {
  const { showSuccess, showError } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deleting, setDeleting] = useState<Client | null>(null)
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    loadClientsOnce().then((result) => { if (active) setClients(result) }).catch(() => { if (active) { setMessage('Não foi possível carregar clientes'); showError('Não foi possível carregar clientes.') } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const matches = useMemo(() => layout === 'side' && !open ? clients : clients.filter((client) => client.name.toLocaleLowerCase('pt-BR').includes(value.toLocaleLowerCase('pt-BR'))), [clients, value, layout, open])
  function select(client: Client) { onChange(client.name); onSelect(client); setOpen(false); setMobileOpen(false) }
  const list = <div className="client-picker__list">{loading ? <Skeleton rows={4} metrics={0} /> : matches.length ? matches.map((client) => <div className="client-picker__option" key={client.id}><button type="button" onClick={() => select(client)}><strong>{client.name}</strong><small>{client.lastPurchaseAt ? `Última compra: ${new Date(client.lastPurchaseAt).toLocaleDateString('pt-BR')}` : 'Sem compras'}</small></button><IconButton icon={<TrashIcon />} variant="danger" ariaLabel={`Excluir ${client.name}`} onClick={() => setDeleting(client)} /></div>) : <p>Nenhum cliente encontrado</p>}</div>
  return <div className={`client-picker client-picker--${layout}`}>
    {layout === 'side' && <aside className="client-picker__panel"><h3>Selecionar cliente</h3>{list}</aside>}
    <div className="client-picker__field"><Input label="Nome do Comprador *" placeholder="Buscar ou cadastrar cliente" leadingIcon={<PersonIcon />} value={value} onChange={(e) => { onChange(e.target.value); onSelect(null); setOpen(true) }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} autoComplete="off" error={error} />
      {layout === 'side' && <button className="client-picker__mobile-toggle" type="button" onClick={() => setMobileOpen((current) => !current)} aria-expanded={mobileOpen}>Selecionar cliente {mobileOpen ? '−' : '+'}</button>}
      {layout === 'side' ? mobileOpen && <div className="client-picker__mobile-list">{list}</div> : open && value && <div className="client-picker__dropdown">{list}</div>}
      {message && <p role="alert" className="client-picker__error">{message}</p>}
    </div>
    <DeleteClientModal client={deleting} onClose={() => setDeleting(null)} onDeleted={() => { setClients((previous) => previous.filter((client) => client.id !== deleting?.id)); if (deleting?.name === value) { onChange(''); onSelect(null) }; showSuccess('Cliente excluído com sucesso!') }} onError={showError} />
  </div>
}
