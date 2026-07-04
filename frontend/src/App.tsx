import { useState } from 'react'
import { ProductView } from './components/products/ProductView'
import { SaleView } from './components/sales/SaleView'
import logo from './assets/logo.svg'
import produtosIcon from './assets/produtos.svg'
import vendasIcon from './assets/vendas.svg'

type Tab = 'products' | 'sales'

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('products')

  return (
    <>
      <header>
        <img src={logo} alt="Logo StockFinance" />
        <h1>StockFinance - Sistema de Controle de Estoque e Gestão Financeira</h1>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <img src={produtosIcon} alt="Logo Produtos" />
          Produtos
        </button>
        <button
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <img src={vendasIcon} alt="Logo Vendas" />
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
