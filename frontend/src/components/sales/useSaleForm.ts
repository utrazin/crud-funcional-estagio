import { useState, useEffect } from 'react'
import type { Product } from '../../types'
import type { MockClient } from '../../mocks/clients'
import { searchClients, MOCK_CLIENTS } from '../../mocks/clients'
import { productsApi } from '../../api/products'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function useSaleForm() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedClient, setSelectedClient] = useState<MockClient | null>(null)
  const [clientList, setClientList] = useState<MockClient[]>(MOCK_CLIENTS)
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [saleDate, setSaleDate] = useState(todayISO())
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const totalPrice = quantity * unitPrice

  useEffect(() => {
    productsApi.listar().then(setProducts).catch(() => setProducts([]))
  }, [])

  function resetForm() {
    setSelectedProduct(null)
    setSelectedClient(null)
    setClientList(MOCK_CLIENTS)
    setQuantity(1)
    setUnitPrice(0)
    setSaleDate(todayISO())
    setClientSearch('')
    setProductSearch('')
    setEditingId(null)
  }

  function buscarClientes(term: string) {
    setClientSearch(term)
    setClientList(searchClients(term))
  }

  function selecionarProduto(product: Product | null) {
    setSelectedProduct(product)
    setProductSearch(product ? product.name : '')
    setUnitPrice(product ? product.price : 0)
  }

  function selecionarCliente(client: MockClient) {
    setSelectedClient(client)
    setClientSearch(client.name)
    setClientList(MOCK_CLIENTS)
  }

  function deselecionarCliente() {
    setSelectedClient(null)
  }

  function alterarQuantidade(qty: number) {
    setQuantity(qty)
  }

  function preencherParaEdicao(sale: { id: string; productId: string; clientId: string; quantity: number; unitPrice: number; saleDate: string }, productName: string, clientName: string) {
    const product = products.find((p) => p.id === sale.productId) ?? null
    setSelectedProduct(product)
    setProductSearch(productName)
    setUnitPrice(sale.unitPrice)
    setQuantity(sale.quantity)
    setSaleDate(sale.saleDate.substring(0, 10))
    setClientSearch(clientName)
    // Mock client — monta objeto mínimo para exibição
    setSelectedClient({ id: sale.clientId, name: clientName })
    setClientList([])
    setEditingId(sale.id)
  }

  return {
    selectedProduct,
    selectedClient,
    clientList,
    quantity,
    unitPrice,
    totalPrice,
    saleDate,
    clientSearch,
    productSearch,
    products,
    editingId,
    setUnitPrice,
    setSaleDate,
    setProductSearch,
    buscarClientes,
    selecionarProduto,
    selecionarCliente,
    deselecionarCliente,
    alterarQuantidade,
    preencherParaEdicao,
    resetForm,
  }
}
