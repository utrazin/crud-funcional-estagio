import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { productsApi } from '../../api/products'
import { IconButton } from '../shared/IconButton'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { CurrencyInput } from '../shared/CurrencyInput'
import { PencilIcon, EyeIcon, TrashIcon, CheckIcon, XIcon } from '../shared/icons'
import { useInlineRowEdit } from '../shared/useInlineRowEdit'
import { validateProductName, validateStockQuantity, validatePrice } from '../../utils/validators'
import '../../styles/table.css'

interface ProductsTableProps {
  products: Product[]
  onReload: () => void
  onRequestDelete: (product: Product) => void
  onRequestSell: (product: Product) => void
  onError: (message: string) => void
}

interface Draft {
  name: string
  price: number
  stockQuantity: string
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ProductsTable({ products, onReload, onRequestDelete, onRequestSell, onError }: ProductsTableProps) {
  const navigate = useNavigate()
  const { editingId, draft, startEdit, updateDraft, cancel } = useInlineRowEdit<Draft>()
  const [saving, setSaving] = useState(false)

  const nameError = draft ? validateProductName(draft.name) : 'Obrigatório'
  const quantityError = draft ? validateStockQuantity(draft.stockQuantity) : 'Obrigatório'
  const priceError = draft ? validatePrice(draft.price) : 'Obrigatório'
  const hasError = !!nameError || !!quantityError || !!priceError

  async function handleConfirm(product: Product) {
    if (!draft || hasError) return
    setSaving(true)
    try {
      await productsApi.atualizar(product.id, {
        name: draft.name.trim(),
        price: draft.price,
        stockQuantity: Number(draft.stockQuantity),
        description: product.description || '',
      })
      cancel()
      onReload()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao atualizar produto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="table-ds__container">
      <table className="table-ds">
        <thead>
          <tr>
            <th className="text-label-small">Nome do Produto</th>
            <th className="text-label-small">Quantidade</th>
            <th className="text-label-small">Preço</th>
            <th className="text-label-small" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isEditing = editingId === product.id
            return (
              <tr key={product.id} className={isEditing ? 'table-ds__row--editing' : ''}>
                <td>
                  {isEditing ? (
                    <Input
                      value={draft?.name ?? ''}
                      onChange={(e) => updateDraft({ name: e.target.value })}
                      error={nameError}
                      autoFocus
                    />
                  ) : (
                    <span className="text-body-medium">{product.name}</span>
                  )}
                </td>
                <td style={{ width: 140 }}>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={draft?.stockQuantity ?? ''}
                      onChange={(e) => updateDraft({ stockQuantity: e.target.value })}
                      error={quantityError}
                    />
                  ) : (
                    <span className="text-body-default">{product.stockQuantity} un.</span>
                  )}
                </td>
                <td style={{ width: 160 }}>
                  {isEditing ? (
                    <CurrencyInput
                      value={draft?.price ?? 0}
                      onChange={(value) => updateDraft({ price: value })}
                      error={priceError}
                    />
                  ) : (
                    <span className="text-body-medium">{currency(product.price)}</span>
                  )}
                </td>
                <td>
                  <div className="table-ds__actions">
                    {isEditing ? (
                      <>
                        <IconButton icon={<CheckIcon />} variant="success" ariaLabel="Confirmar" onClick={() => handleConfirm(product)} disabled={hasError} loading={saving} />
                        <IconButton icon={<XIcon />} variant="danger" ariaLabel="Cancelar" onClick={cancel} disabled={saving} />
                      </>
                    ) : (
                      <>
                        <IconButton
                          icon={<PencilIcon />}
                          ariaLabel="Editar"
                          onClick={() => startEdit(product.id, { name: product.name, price: product.price, stockQuantity: String(product.stockQuantity) })}
                        />
                        <IconButton icon={<EyeIcon />} ariaLabel="Ver detalhes" onClick={() => navigate(`/produtos/${product.id}`)} />
                        <IconButton icon={<TrashIcon />} variant="danger" ariaLabel="Excluir" onClick={() => onRequestDelete(product)} />
                        <Button variant="success" size="small" onClick={() => onRequestSell(product)}>Vender</Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
