// URL BACKEND
const API_BASE = 'http://localhost:3001'

// Produtos
async function getProducts() {
  const res = await fetch(`${API_BASE}/products`)
  if (!res.ok) throw new Error('Erro ao buscar produtos')
  return res.json()
}

async function createProduct(data) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erro ao criar produto')
  return json
}

async function updateProduct(id, data) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erro ao atualizar produto')
  return json
}

async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error || 'Erro ao excluir produto')
  }
}

// Vendas
async function getSales() {
  const res = await fetch(`${API_BASE}/sales`)
  if (!res.ok) throw new Error('Erro ao buscar vendas')
  return res.json()
}

async function getAllProducts() {
  const res = await fetch(`${API_BASE}/products/all`)
  if (!res.ok) throw new Error('Erro ao buscar produtos')
  return res.json()
}

async function createSale(data) {
  const res = await fetch(`${API_BASE}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erro ao registrar venda')
  return json
}

async function cancelSale(id) {
  const res = await fetch(`${API_BASE}/sales/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error || 'Erro ao cancelar venda')
  }
}
