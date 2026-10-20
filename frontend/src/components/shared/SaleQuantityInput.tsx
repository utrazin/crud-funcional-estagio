import { Input } from './Input'
import { QuickAdjust } from './QuickAdjust'
import './SaleQuantityInput.css'

interface Props {
  value: string
  stock: number
  onChange: (value: string) => void
  error?: string
}

export function SaleQuantityInput({ value, stock, onChange, error }: Props) {
  const quantity = Number(value)
  return <div className="sale-quantity-input">
    <Input label="Quantidade *" type="number" min={1} max={Math.max(1, stock)} step={1} value={value} onChange={(event) => onChange(event.target.value)} error={error} disabled={stock === 0} />
    <div className="sale-quantity-input__below">
      <span>Estoque: {stock}</span>
      <QuickAdjust unit="1" onMinus={() => onChange(String(Math.max(1, quantity - 1)))} onPlus={() => onChange(String(Math.min(stock, (quantity || 0) + 1)))} minusDisabled={quantity <= 1 || stock === 0} plusDisabled={quantity >= stock || stock === 0} />
    </div>
  </div>
}
