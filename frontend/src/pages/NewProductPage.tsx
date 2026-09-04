import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../api/products'
import { PageHeader } from '../components/shared/PageHeader'
import { Input } from '../components/shared/Input'
import { CurrencyInput } from '../components/shared/CurrencyInput'
import { Textarea } from '../components/shared/Textarea'
import { Button } from '../components/shared/Button'
import { validateProductName, validateStockQuantity, validatePrice } from '../utils/validators'
import './NewProductPage.css'

interface FieldErrors {
  name?: string
  stockQuantity?: string
  price?: string
}

export function NewProductPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [price, setPrice] = useState(0)
  const [description, setDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    const nameError = validateProductName(name)
    if (nameError) errors.name = nameError
    const qtyError = validateStockQuantity(stockQuantity)
    if (qtyError) errors.stockQuantity = qtyError
    const priceError = validatePrice(price)
    if (priceError) errors.price = priceError
    return errors
  }

  async function handleSubmit() {
    setSubmitError('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await productsApi.criar({
        name: name.trim(),
        price,
        stockQuantity: Number(stockQuantity),
        description: description.trim(),
      })
      navigate('/produtos')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao cadastrar produto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Cadastrar Produto" />

      <div className="new-product-page__form-card">
        <h2 className="text-section-heading">Informações do Produto</h2>

        <Input
          label="Nome do Produto *"
          placeholder="Ex: Perfume XYZ"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
          }}
          error={fieldErrors.name}
        />

        <div className="new-product-page__row">
          <Input
            label="Quantidade em Estoque *"
            type="number"
            min={0}
            step={1}
            placeholder="Ex: 10"
            value={stockQuantity}
            onChange={(e) => {
              setStockQuantity(e.target.value)
              if (fieldErrors.stockQuantity) setFieldErrors((prev) => ({ ...prev, stockQuantity: undefined }))
            }}
            error={fieldErrors.stockQuantity}
          />
          <CurrencyInput
            label="Preço de Custo (Unitário) *"
            value={price}
            onChange={(value) => {
              setPrice(value)
              if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: undefined }))
            }}
            placeholder="99,90"
            error={fieldErrors.price}
          />
        </div>

        <Textarea
          label="Descrição (Opcional)"
          placeholder="Ex: Perfume de exemplo, essência amadeirada."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {submitError && <p className="text-body-default" style={{ color: 'var(--color-text-danger)' }}>{submitError}</p>}
      </div>

      <div className="new-product-page__footer">
        <Button variant="secondary" onClick={() => navigate('/produtos')}>Cancelar</Button>
        <Button onClick={handleSubmit} loading={submitting}>Salvar</Button>
      </div>
    </>
  )
}
