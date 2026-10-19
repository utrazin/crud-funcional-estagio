import { useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { IconButton } from '../shared/IconButton'
import { Button } from '../shared/Button'
import { PencilIcon, EyeIcon, TrashIcon } from '../shared/icons'
import '../../styles/table.css'

interface Props { products: Product[]; onRequestEdit: (product: Product) => void; onRequestDelete: (product: Product) => void; onRequestSell: (product: Product) => void }
const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export function ProductsTable({ products, onRequestEdit, onRequestDelete, onRequestSell }: Props) {
  const navigate = useNavigate()
  return <div className="table-ds__container"><table className="table-ds"><thead><tr><th>Nome do Produto</th><th>Quantidade</th><th>Preço</th><th>Ações</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}>
    <td data-label="Produto" className="text-body-medium">{product.name}</td><td data-label="Estoque">{product.stockQuantity} un.</td><td data-label="Custo">{currency(product.price)}</td><td data-label="Ações"><div className="table-ds__actions"><IconButton icon={<PencilIcon />} ariaLabel={`Editar ${product.name}`} onClick={() => onRequestEdit(product)} /><IconButton icon={<EyeIcon />} ariaLabel={`Ver ${product.name}`} onClick={() => navigate(`/produtos/${product.id}`)} /><IconButton icon={<TrashIcon />} variant="danger" ariaLabel={`Excluir ${product.name}`} onClick={() => onRequestDelete(product)} /><Button variant="success" size="small" onClick={() => onRequestSell(product)} disabled={product.stockQuantity === 0}>{product.stockQuantity === 0 ? 'Sem estoque' : 'Vender'}</Button></div></td>
  </tr>)}</tbody></table>{products.length === 0 && <p>Nenhum produto encontrado.</p>}</div>
}
