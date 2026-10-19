import { useNavigate } from 'react-router-dom'
import type { Client } from '../../types'
import { IconButton } from '../shared/IconButton'
import { EyeIcon } from '../shared/icons'
import '../../styles/table.css'

interface ClientTableProps {
  clients: Client[]
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ClientTable({ clients }: ClientTableProps) {
  const navigate = useNavigate()

  return (
    <div className="table-ds__container">
      <table className="table-ds">
        <thead>
          <tr>
            <th className="text-label-small">Nome do Cliente</th>
            <th className="text-label-small">Produtos Comprados</th>
            <th className="text-label-small">Valor Total Gasto</th>
            <th className="text-label-small" />
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td data-label="Cliente">
                <span className="text-body-medium">{client.name}</span>
              </td>
              <td data-label="Produtos comprados" className="text-body-default">{client.totalProductsPurchased}</td>
              <td data-label="Total gasto" className="text-body-medium">{currency(client.totalSpent)}</td>
              <td data-label="Ações">
                <div className="table-ds__actions">
                  <IconButton
                    icon={<EyeIcon />}
                    ariaLabel="Ver detalhes"
                    onClick={() => navigate(`/clientes/${client.id}`)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
