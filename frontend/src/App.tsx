import { useState } from 'react'
import { ProductView } from './components/products/ProductView'
import { SaleView } from './components/sales/SaleView'

type Tab = 'products' | 'sales'

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('products')

  return (
    <>
      <header>
        <h1>StockFinance - Sistema de Controle de Estoque e Gestão Financeira</h1>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produtos
        </button>
        <button
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Vendas
        </button>
      </div>

      <div className="tab-content active">
        {activeTab === 'products' && <ProductView />}
        {activeTab === 'sales' && <SaleView />}
      </div>
    </>
  )
}
