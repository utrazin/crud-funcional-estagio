export interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  salesCount: number
  description: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Client {
  id: string
  name: string
  cellphone: string | null
  totalPurchases: number
  totalProductsPurchased: number
  totalSpent: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Sale {
  id: string
  productId: string
  clientId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  saleDate: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  product: {
    id: string
    name: string
    price: number
    stockQuantity: number
    deletedAt: string | null
  }
  client?: {
    id: string
    name: string
    cellphone: string | null
    deletedAt: string | null
  }
}

export interface ApiError {
  error: string
}
