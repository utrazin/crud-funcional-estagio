// Mantenha em sincronia com frontend/src/utils/validators.ts

export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class UnprocessableError extends AppError {
  constructor(message: string) {
    super(message, 422)
  }
}

// Letras (com acentos), espaço, apóstrofo e hífen. Começa e termina em letra/apóstrofo/hífen.
export const CLIENT_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'-]*(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+)*$/

// Letras, números, espaço e pontuação básica de nome comercial de produto.
export const PRODUCT_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9.,'()%/-]*(?: [A-Za-zÀ-ÖØ-öø-ÿ0-9.,'()%/-]+)*$/

function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

/** Telefone é opcional: vazio passa; se preenchido, precisa ter 10 (fixo) ou 11 (celular) dígitos. */
export function isPhoneComplete(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return true
  const digits = digitsOf(value)
  return digits.length === 10 || digits.length === 11
}

export function assertClientName(name: unknown): asserts name is string {
  if (typeof name !== 'string' || !name.trim()) {
    throw new ValidationError('Nome é obrigatório')
  }
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 100) {
    throw new ValidationError('Nome deve ter entre 2 e 100 caracteres')
  }
  if (!CLIENT_NAME_REGEX.test(trimmed)) {
    throw new ValidationError('Nome deve conter apenas letras, espaços, apóstrofo ou hífen')
  }
}

export function assertProductName(name: unknown): asserts name is string {
  if (typeof name !== 'string' || !name.trim()) {
    throw new ValidationError('Nome é obrigatório')
  }
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 150) {
    throw new ValidationError('Nome deve ter entre 2 e 150 caracteres')
  }
  if (!PRODUCT_NAME_REGEX.test(trimmed)) {
    throw new ValidationError("Nome contém caracteres inválidos (permitido: letras, números, . , ' - ( ) % /)")
  }
}

export function assertPhone(cellphone: unknown): asserts cellphone is string | undefined | null {
  if (cellphone === undefined || cellphone === null || cellphone === '') return
  if (typeof cellphone !== 'string') {
    throw new ValidationError('Telefone inválido')
  }
  if (!isPhoneComplete(cellphone)) {
    throw new ValidationError('Telefone deve ter 10 ou 11 dígitos (com DDD)')
  }
}

export function assertPositiveNumber(value: unknown, fieldLabel: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`${fieldLabel} deve ser maior que zero`)
  }
}

export function assertNonNegativeInteger(value: unknown, fieldLabel: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new ValidationError(`${fieldLabel} deve ser um número inteiro maior ou igual a zero`)
  }
}

export function assertPositiveInteger(value: unknown, fieldLabel: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${fieldLabel} deve ser um número inteiro maior que zero`)
  }
}

export function assertRequiredId(value: unknown, fieldLabel: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`${fieldLabel} é obrigatório`)
  }
}

export function assertSaleDate(value: unknown): asserts value is string | Date {
  if (!value) throw new ValidationError('Data da venda é obrigatória')
  const asDate = value instanceof Date ? value : new Date(value as string)
  if (isNaN(asDate.getTime())) throw new ValidationError('Data da venda é inválida')
}
