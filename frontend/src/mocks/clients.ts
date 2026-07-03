export interface MockClient {
  id: string
  name: string
  cellphone?: string
}

export const MOCK_CLIENTS: MockClient[] = [
  { id: 'client-001', name: 'João Silva',      cellphone: '(11) 98765-4321' },
  { id: 'client-002', name: 'Maria Oliveira',  cellphone: '(21) 99234-5678' },
  { id: 'client-003', name: 'Carlos Santos',   cellphone: '(31) 97654-3210' },
  { id: 'client-004', name: 'Ana Costa',       cellphone: '(41) 98123-4567' },
  { id: 'client-005', name: 'Pedro Almeida',   cellphone: '(51) 99876-5432' },
]

export function findClientById(id: string): MockClient | undefined {
  return MOCK_CLIENTS.find((c) => c.id === id)
}

export function searchClients(term: string): MockClient[] {
  if (!term.trim()) return MOCK_CLIENTS
  const lower = term.toLowerCase()
  return MOCK_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      (c.cellphone && c.cellphone.includes(term)),
  )
}
