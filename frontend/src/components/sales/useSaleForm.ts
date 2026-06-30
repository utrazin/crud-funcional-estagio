import { useState, useEffect } from 'react'
import type { Product } from '../../types'
import type { MockClient } from '../../mocks/clients'
import { searchClients } from '../../mocks/clients'
import { productsApi } from '../../api/products'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function useSaleForm() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedClient, setSelectedClient] = useState<MockClient | null>(null)
  const [clientList, setClientList] = useState<MockClient[]>([])
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [saleDate, setSaleDate] = useState(todayISO())
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])

  const totalPrice = quantity * unitPrice

  useEffect(() => {
    productsApi.listar().then(setProducts).catch(() => setProducts([]))
  }, [])

  function resetForm() {
    setSelectedProduct(null)
    setSelectedClient(null)
    setClientList([])
    setQuantity(1)
    setUnitPrice(0)
    setSaleDate(todayISO())
    setClientSearch('')
    setProductSearch('')
  }

  function buscarClientes(term: string) {
    setClientSearch(term)
    setClientList(term.trim() ? searchClients(term) : [])
  }

  function selecionarProduto(product: Product | null) {
    setSelectedProduct(product)
    setProductSearch(product ? product.name : '')
    setUnitPrice(product ? product.price : 0)
  }

  function selecionarCliente(client: MockClient) {
    setSelectedClient(client)
    setClientSearch(client.name)
    setClientList([])
  }

  function alterarQuantidade(qty: number) {
    setQuantity(qty)
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
    setUnitPrice,
    setSaleDate,
    setProductSearch,
    buscarClientes,
    selecionarProduto,
    selecionarCliente,
    alterarQuantidade,
    resetForm,
  }
}
