import { Router, Request, Response } from 'express'
import { AuthController } from '../controllers/AuthController'
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth'

const router = Router()
const controller = new AuthController()

// maxAge fica fora das opções base: se presente também no clearCookie, o
// Max-Age (que tem prioridade sobre Expires) mantém o cookie vivo em vez de
// apagá-lo no logout.
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
}
const COOKIE_OPTIONS = { ...BASE_COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 dias

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const { token, user } = await controller.login(email, password)
    res.cookie('token', token, COOKIE_OPTIONS)
    res.json({ user })
  } catch (err: any) {
    const status = err.message === 'Credenciais inválidas' ? 401
      : err.message.includes('obrigatório') ? 400
      : 500
    res.status(status).json({ error: err.message || 'Erro ao autenticar' })
  }
})

// Usuário autenticado atual
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await controller.me(req.userId!)
    res.json({ user })
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Usuário não encontrado' })
  }
})

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', BASE_COOKIE_OPTIONS)
  res.status(204).send()
})

export default router
