import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { BoxIcon, ShoppingCartIcon, UsersIcon, BarChartIcon, LogOutIcon } from './icons'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/produtos', label: 'Produtos', icon: ShoppingCartIcon },
  { to: '/relatorios', label: 'Relatórios Financeiros', icon: BarChartIcon },
  { to: '/clientes', label: 'Clientes', icon: UsersIcon },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar-ds">
      <div className="sidebar-ds__logo">
        <BoxIcon className="sidebar-ds__logo-icon" />
        <span className="text-section-heading">StockFinance</span>
      </div>

      <nav className="sidebar-ds__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              ['sidebar-ds__nav-item', isActive ? 'sidebar-ds__nav-item--active' : ''].filter(Boolean).join(' ')
            }
          >
            <Icon className="sidebar-ds__nav-icon" />
            <span className="text-body-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-ds__spacer" />

      <div className="sidebar-ds__user">
        <div className="sidebar-ds__user-info">
          <span className="text-body-medium sidebar-ds__user-name">{user?.name}</span>
          <span className="text-caption sidebar-ds__user-role">{user?.role}</span>
        </div>
        <button className="sidebar-ds__logout" onClick={handleLogout} aria-label="Sair" title="Sair">
          <LogOutIcon />
          <span className="text-caption sidebar-ds__logout-label">Sair</span>
        </button>
      </div>
    </aside>
  )
}
