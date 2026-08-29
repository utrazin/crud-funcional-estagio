/**
 * Resolve o timestamp real de uma venda a partir da data escolhida no formulário
 * (um `<input type="date">`, sem horário) ou de uma planilha importada:
 * - Se a data escolhida é hoje, usa o momento exato do clique (`new Date()`).
 * - Se é um dia anterior, fixa 12:00:00 (meio-dia) nesse dia, já que não há
 *   horário real pra gravar.
 */
export function resolveSaleDateTime(input: string | Date): Date {
  const dateStr = typeof input === 'string' ? input.slice(0, 10) : formatUTCDate(input)

  const now = new Date()
  const todayStr = formatLocalDate(now)

  if (dateStr === todayStr) {
    return now
  }

  return new Date(`${dateStr}T12:00:00`)
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Datas vindas de `new Date("YYYY-MM-DD")` (form/import) ou do ExcelJS ficam
// ancoradas em UTC-meia-noite — usar getters UTC recupera o dia certo
// independente do fuso horário do servidor.
function formatUTCDate(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
