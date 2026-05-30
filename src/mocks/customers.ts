// Clientes Mockados
export interface MockCustomer {
  id: string
  name: string
}

export const MOCK_CUSTOMERS: MockCustomer[] = [
  { id: 'customer-001', name: 'João Silva' },
  { id: 'customer-002', name: 'Maria Oliveira' },
  { id: 'customer-003', name: 'Carlos Santos' },
  { id: 'customer-004', name: 'Ana Costa' },
  { id: 'customer-005', name: 'Pedro Almeida' },
]

export function findCustomerById(id: string): MockCustomer | undefined {
  return MOCK_CUSTOMERS.find(c => c.id === id)
}
