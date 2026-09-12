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
  if (raw.trim() === '') return 'Quantidade é obrigatória'
  const qty = Number(raw)
  if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) return 'Informe um número inteiro maior que zero'
  if (max !== undefined && qty > max) return `Informe de 1 a ${max}`
  return undefined
}

export function validatePrice(value: number): string | undefined {
  if (!value || value <= 0) return 'Informe um valor maior que zero'
  return undefined
}

export function validateRequired(value: string, message = 'Obrigatório'): string | undefined {
  return value.trim() ? undefined : message
}
