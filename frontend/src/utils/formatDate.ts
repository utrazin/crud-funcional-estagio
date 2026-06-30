export function formatDate(dateStr: string): string {
  const parts = dateStr.substring(0, 10).split('-')
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
