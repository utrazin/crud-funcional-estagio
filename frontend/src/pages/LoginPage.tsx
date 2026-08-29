import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { BoxIcon, PersonIcon, LockIcon } from '../components/shared/icons'
import './LoginPage.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/produtos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <BoxIcon className="login-page__logo" style={{ width: 40, height: 40, color: 'var(--blue-600)' }} />
        <h1 className="text-page-title">StockFinance</h1>
        <p className="text-body-default login-page__subtitle">
          Controle de Estoque e Gestão Financeira
        </p>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <Input
            label="E-mail ou Usuário"
            type="email"
            name="email"
            placeholder="usuario@exemplo.com"
            leadingIcon={<PersonIcon />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            name="password"
            placeholder="••••••••"
            leadingIcon={<LockIcon />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-page__error text-body-default">{error}</p>}
          <Button type="submit" loading={submitting} style={{ width: '100%' }}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-caption login-page__footer">
          © 2026 StockFinance. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
