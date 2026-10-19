// Mantenha em sincronia com backend/src/utils/validation.ts

const CLIENT_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'-]*(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+)*$/
const PRODUCT_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9.,'()%/-]*(?: [A-Za-zÀ-ÖØ-öø-ÿ0-9.,'()%/-]+)*$/

/** undefined = válido; string = mensagem de erro a exibir no campo. */
export function validateClientName(name: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return 'Nome é obrigatório'
  if (trimmed.length < 2 || trimmed.length > 100) return 'Nome deve ter entre 2 e 100 caracteres'
  if (!CLIENT_NAME_REGEX.test(trimmed)) return 'Use apenas letras, espaços, apóstrofo ou hífen'
  return undefined
}

export function validateProductName(name: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return 'Nome é obrigatório'
  if (trimmed.length < 2 || trimmed.length > 150) return 'Nome deve ter entre 2 e 150 caracteres'
  if (!PRODUCT_NAME_REGEX.test(trimmed)) return "Caracteres inválidos (permitido: letras, números, . , ' - ( ) % /)"
  return undefined
}

/** Telefone é opcional: campo vazio é válido. Se preenchido, exige 10 ou 11 dígitos. */
export function validatePhone(masked: string): string | undefined {
  if (!masked.trim()) return undefined
  const digits = masked.replace(/\D/g, '')
  if (digits.length !== 10 && digits.length !== 11) return 'Telefone incompleto: informe DDD + número completo'
  return undefined
}

export function validateStockQuantity(raw: string): string | undefined {
  if (raw.trim() === '') return 'Quantidade é obrigatória'
  const qty = Number(raw)
  if (isNaN(qty) || !Number.isInteger(qty) || qty < 0) return 'Informe um número inteiro maior ou igual a zero'
  return undefined
}

export function validateSaleQuantity(raw: string, max?: number): string | undefined {
  if (max === 0) return 'Produto sem estoque'
  if (raw.trim() === '') return 'Quantidade é obrigatória'
  const qty = Number(raw)
  if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) return 'Informe um número inteiro maior que zero'
  if (max !== undefined && qty > max) return `Informe de 1 a ${max}`
  return undefined
}

export function validatePrice(value: number): string | undefined {
  if (!Number.isFinite(value) || value <= 0) return 'Informe um valor maior que zero'
  return undefined
}

export function validateSaleDate(value: string): string | undefined {
  if (!value) return 'Data da venda é obrigatória'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Data da venda inválida'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime()) || `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` !== value) return 'Data da venda inválida'
  return undefined
}

export function validateRequired(value: string, message = 'Obrigatório'): string | undefined {
  return value.trim() ? undefined : message
}
