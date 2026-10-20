import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from './ThemeProvider'
import { useToast } from './useToast'
import { Modal } from './Modal'
import { Button } from './Button'
import { BoxIcon, ShoppingCartIcon, UsersIcon, BarChartIcon, DollarSignIcon, LogOutIcon } from './icons'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/produtos', label: 'Produtos', icon: ShoppingCartIcon },
  { to: '/relatorios', label: 'Relatórios Financeiros', icon: BarChartIcon },
  { to: '/clientes', label: 'Clientes', icon: UsersIcon },
  { to: '/vendas', label: 'Vendas', icon: DollarSignIcon },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { showSuccess, showError } = useToast()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      setConfirmLogout(false)
      showSuccess('Você saiu da conta.')
      navigate('/login')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Não foi possível sair da conta.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <><aside className="sidebar-ds">
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
        <button className="sidebar-ds__theme" type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} aria-pressed={theme === 'dark'}>
          {theme === 'dark' ? '☀' : '☾'}
          <span className="text-caption">Tema</span>
        </button>
        <button className="sidebar-ds__logout" type="button" onClick={() => setConfirmLogout(true)} aria-label="Sair" title="Sair">
          <LogOutIcon />
          <span className="text-caption sidebar-ds__logout-label">Sair</span>
        </button>
      </div>
    </aside>
      <Modal open={confirmLogout} title="Sair da conta" onClose={() => { if (!loggingOut) setConfirmLogout(false) }} footer={<><Button variant="secondary" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>Cancelar</Button><Button variant="danger" onClick={handleLogout} loading={loggingOut}>Sair</Button></>}>
        <p>Deseja sair da sua conta?</p>
      </Modal></>
  )
}
