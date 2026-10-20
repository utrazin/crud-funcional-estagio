import { useCallback, useEffect, useState } from 'react'
import { currency } from '../utils/format'
import { useNavigate, useParams } from 'react-router-dom'
import type { ClientDetail } from '../api/clients'
import { clientsApi } from '../api/clients'
import { Modal } from '../components/shared/Modal'
import { Skeleton } from '../components/shared/Skeleton'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { ReadOnlyFields } from '../components/shared/ReadOnlyFields'
import { IconButton } from '../components/shared/IconButton'
import { CancelSaleModal } from '../components/shared/CancelSaleModal'
import { DeleteClientModal } from '../components/clients/DeleteClientModal'
import { XIcon } from '../components/shared/icons'
import { validateClientName, validatePhone } from '../utils/validators'
import { maskPhone } from '../utils/masks'
import { invalidateResources } from '../utils/useSessionResource'
import { useToast } from '../components/shared/useToast'
import '../styles/table.css'

function readCachedClient(id?: string): ClientDetail | null { try { return JSON.parse(sessionStorage.getItem(`stockfinance.resource.client-detail.${id}`) || 'null') as ClientDetail | null } catch { return null } }
export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const close = () => navigate('/clientes')
  const [client, setClient] = useState<ClientDetail | null>(() => readCachedClient(id))
  const [loading, setLoading] = useState(() => !readCachedClient(id))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [canceling, setCanceling] = useState<{ id: string; fields: { label: string; value: string }[] } | null>(null)
  const reload = useCallback(async () => { if (!id) return; try { const next = await clientsApi.detalhes(id); setClient(next); sessionStorage.setItem(`stockfinance.resource.client-detail.${id}`, JSON.stringify(next)); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Cliente não encontrado') } finally { setLoading(false) } }, [id])
  useEffect(() => { const cached = readCachedClient(id); setClient(cached); setLoading(!cached); void reload() }, [id, reload])
  function openEdit() { if (!client) return; setName(client.name); setPhone(client.cellphone ?? ''); setEditing(true) }
  async function save() { if (!client || validateClientName(name) || validatePhone(phone) || saving) return; setSaving(true); try { await clientsApi.atualizar(client.id, { name: name.trim(), cellphone: phone }); setEditing(false); invalidateResources('clients'); showSuccess('Cliente atualizado com sucesso!'); await reload() } catch (err) { showError(err instanceof Error ? err.message : 'Erro ao atualizar cliente') } finally { setSaving(false) } }
  return <><Modal open title={client?.name ?? 'Detalhes do Cliente'} onClose={close} width={900} footer={<><Button variant="secondary" onClick={close}>Fechar</Button>{client && <><Button variant="secondary" onClick={openEdit}>Editar</Button><Button variant="danger" onClick={() => setDeleting(true)}>Excluir</Button></>}</>}>
    {loading ? <Skeleton rows={4} metrics={3} /> : error ? <p role="alert">{error}</p> : client && <><ReadOnlyFields fields={[{ label: 'Telefone', value: client.cellphone ?? 'Não informado' }, { label: 'Compras', value: String(client.totalPurchases) }, { label: 'Produtos comprados', value: String(client.totalProductsPurchased) }, { label: 'Total gasto', value: currency(client.totalSpent) }]} /><h3>Histórico de compras</h3><div className="table-ds__container"><table className="table-ds"><thead><tr><th>Data</th><th>Produto</th><th>Quantidade</th><th>Valor total</th><th>Valor unitário</th><th>Ações</th></tr></thead><tbody>{client.vendas.map((sale) => <tr key={sale.id}><td data-label="Data">{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</td><td data-label="Produto">{sale.produto}</td><td data-label="Quantidade">{sale.quantity}</td><td data-label="Valor total">{currency(sale.totalPrice)}</td><td data-label="Valor unitário">{currency(sale.unitPrice)}</td><td data-label="Ações"><IconButton icon={<XIcon />} variant="danger" ariaLabel="Cancelar venda" onClick={() => setCanceling({ id: sale.id, fields: [{ label: 'Produto', value: sale.produto }, { label: 'Comprador', value: client.name }, { label: 'Quantidade', value: String(sale.quantity) }, { label: 'Valor', value: currency(sale.totalPrice) }] })} /></td></tr>)}</tbody></table></div></>}
  </Modal><Modal open={editing} title="Editar Cliente" onClose={() => setEditing(false)} footer={<><Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button><Button onClick={save} loading={saving}>Salvar</Button></>}><Input label="Nome *" value={name} onChange={(e) => setName(e.target.value)} error={validateClientName(name)} /><Input label="Telefone" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} error={validatePhone(phone)} /></Modal><DeleteClientModal client={deleting ? client : null} onClose={() => setDeleting(false)} onDeleted={() => { invalidateResources('clients'); showSuccess('Cliente excluído com sucesso!'); close() }} onError={showError} /><CancelSaleModal sale={canceling} onClose={() => setCanceling(null)} onCancelled={() => { invalidateResources('products', 'clients', 'sales'); void reload(); showSuccess('Venda cancelada com sucesso!') }} onError={showError} /></>
}
