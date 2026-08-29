/** Aplica máscara de telefone brasileiro conforme o usuário digita: (XX) XXXXX-XXXX */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/**
 * Máscara de valor monetário estilo "digitação de caixa": os dígitos entram
 * da direita pra esquerda, formatando como reais conforme digita.
 * Retorna a string formatada (ex: "1.234,56") e o valor numérico correspondente.
 */
export function maskCurrencyInput(rawDigits: string): { display: string; value: number } {
  const digits = rawDigits.replace(/\D/g, '')
  const cents = digits === '' ? 0 : parseInt(digits, 10)
  const value = cents / 100
  const display = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return { display, value }
}

/** Extrai só os dígitos de uma string já mascarada (usado ao processar onChange de um input de moeda). */
export function digitsFromMaskedCurrency(display: string): string {
  return display.replace(/\D/g, '')
}
