import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Client } from '../types'
import type { ClientDetail } from '../api/clients'
import { clientsApi } from '../api/clients'
import { Badge } from '../components/shared/Badge'
import { IconButton } from '../components/shared/IconButton'
import { Input } from '../components/shared/Input'
import { CancelSaleModal } from '../components/shared/CancelSaleModal'
import { DeleteClientModal } from '../components/clients/DeleteClientModal'
import { Toast } from '../components/shared/Toast'
import { useToast } from '../components/shared/useToast'
import { PageLoader } from '../components/shared/PageLoader'
import { ChevronLeftIcon, PencilIcon, TrashIcon, CheckIcon, XIcon } from '../components/shared/icons'
import { maskPhone } from '../utils/masks'
import '../styles/table.css'
import './ClientDetailPage.css'

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast, showSuccess, showError, clearToast } = useToast()
  const [cancelingSale, setCancelingSale] = useState<{ id: string; fields: { label: string; value: string }[] } | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftPhone, setDraftPhone] = useState('')
  const [saving, setSaving] = useState(false)

  function reload() {
    if (!id) return
    clientsApi
      .detalhes(id)
      .then(setClient)
      .catch(() => setClient(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <PageLoader label="Carregando cliente..." />
  if (!client) return <p className="text-body-default">Cliente não encontrado.</p>

  const nameInvalid = !draftName.trim()

  function startEdit() {
    if (!client) return
    setDraftName(client.name)
    setDraftPhone(client.cellphone ?? '')
    setEditing(true)
  }

  async function handleConfirmEdit() {
    if (!client || nameInvalid) return
    setSaving(true)
    try {
      await clientsApi.atualizar(client.id, { name: draftName.trim(), cellphone: draftPhone })
      setEditing(false)
      showSuccess('Cliente atualizado com sucesso!')
      reload()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao atualizar cliente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClear={clearToast} />

      <button className="client-detail-page__back" onClick={() => navigate('/clientes')}>
        <ChevronLeftIcon />
        <span className="text-body-medium">Voltar para Clientes</span>
      </button>

      <div className="client-detail-page__header">
        {editing ? (
          <div className="client-detail-page__edit-fields">
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              error={nameInvalid ? 'Obrigatório' : undefined}
              placeholder="Nome do cliente"
              autoFocus
              style={{ minWidth: 220 }}
            />
            <Input
              value={draftPhone}
              onChange={(e) => setDraftPhone(maskPhone(e.target.value))}
              placeholder="(11) 98765-4321"
              style={{ minWidth: 200 }}
            />
          </div>
        ) : (
          <div>
            <h1 className="text-page-title">{client.name}</h1>
            {client.cellphone && (
              <p className="text-body-large" style={{ color: 'var(--color-text-secondary)' }}>{client.cellphone}</p>
            )}
          </div>
        )}

        <div className="client-detail-page__header-actions">
          {editing ? (
            <>
              <IconButton icon={<CheckIcon />} variant="success" ariaLabel="Confirmar" onClick={handleConfirmEdit} disabled={nameInvalid} loading={saving} />
              <IconButton icon={<XIcon />} variant="danger" ariaLabel="Cancelar" onClick={() => setEditing(false)} disabled={saving} />
            </>
          ) : (
            <>
              <IconButton icon={<PencilIcon />} ariaLabel="Editar" onClick={startEdit} />
              <IconButton icon={<TrashIcon />} variant="danger" ariaLabel="Excluir" onClick={() => setDeletingClient(client)} />
            </>
          )}
        </div>
      </div>

      <div className="client-detail-page__summary">
        <div className="client-detail-page__metric">
          <span className="text-label-small" style={{ color: 'var(--color-text-tertiary)' }}>Total de Compras</span>
          <span className="text-numeric-large">{client.totalPurchases}</span>
        </div>
        <div className="client-detail-page__metric">
          <span className="text-label-small" style={{ color: 'var(--color-text-tertiary)' }}>Produtos Comprados</span>
          <span className="text-numeric-large">{client.totalProductsPurchased}</span>
        </div>
        <div className="client-detail-page__metric">
          <span className="text-label-small" style={{ color: 'var(--color-text-success)' }}>Valor Total Gasto</span>
          <span className="text-numeric-large" style={{ color: 'var(--green-600)' }}>
            {currency(client.totalSpent)}
          </span>
        </div>
      </div>

      <div className="client-detail-page__section-header">
        <h2 className="text-section-heading">Histórico de Compras</h2>
        <Badge>{client.vendas.length} compras realizadas</Badge>
      </div>

      <div className="table-ds__container">
        <table className="table-ds">
          <thead>
            <tr>
              <th className="text-label-small">Data</th>
              <th className="text-label-small">Produto</th>
              <th className="text-label-small">Quantidade</th>
              <th className="text-label-small">Valor Total</th>
              <th className="text-label-small">Valor Unitário</th>
              <th className="text-label-small" />
            </tr>
          </thead>
          <tbody>
            {client.vendas.map((sale) => (
              <tr key={sale.id}>
                <td className="text-body-default">{formatDate(sale.saleDate)}</td>
                <td className="text-body-medium">{sale.produto}</td>
                <td className="text-body-default">{sale.quantity} unidades</td>
                <td className="text-body-medium">{currency(sale.totalPrice)}</td>
                <td className="text-body-default">{currency(sale.unitPrice)}</td>
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
                            { label: 'Produto', value: sale.produto },
                            { label: 'Quantidade', value: `${sale.quantity} unidades` },
                            { label: 'Valor Total', value: currency(sale.totalPrice) },
                            { label: 'Comprador', value: client.name },
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

      <CancelSaleModal
        sale={cancelingSale}
        onClose={() => setCancelingSale(null)}
        onCancelled={() => {
          showSuccess('Venda cancelada com sucesso!')
          reload()
        }}
        onError={showError}
      />

      <DeleteClientModal
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onDeleted={() => navigate('/clientes')}
        onError={showError}
      />
    </>
  )
}
