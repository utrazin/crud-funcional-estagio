import { Router, Request, Response } from 'express'
import { ClientController } from '../controllers/ClientController'
import { AppError } from '../utils/validation'

const router = Router()
const controller = new ClientController()

function handleError(err: any, res: Response, fallback: string) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  res.status(500).json({ error: err.message || fallback })
}

// Listar todos os clientes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const clients = await controller.listar()
    res.json(clients)
  } catch (err: any) {
    handleError(err, res, 'Erro ao listar clientes')
  }
})

// Buscar por nome
router.get('/buscar', async (req: Request, res: Response) => {
  try {
    const name = (req.query.name as string) || ''
    const clients = await controller.buscarPorNome(name)
    res.json(clients)
  } catch (err: any) {
    handleError(err, res, 'Erro ao buscar clientes')
  }
})

// Detalhes do cliente (com histórico de compras) — precisa vir depois de /buscar
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const client = await controller.detalhes(req.params.id)
    res.json(client)
  } catch (err: any) {
    handleError(err, res, 'Erro ao buscar cliente')
  }
})

// Criar cliente
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, cellphone } = req.body
    const client = await controller.criar(name, cellphone)
    res.status(201).json(client)
  } catch (err: any) {
    handleError(err, res, 'Erro ao criar cliente')
  }
})

// Atualizar cliente (edição inline: nome e telefone)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, cellphone } = req.body
    const client = await controller.atualizar(req.params.id, name, cellphone)
    res.json(client)
  } catch (err: any) {
    handleError(err, res, 'Erro ao atualizar cliente')
  }
})

// Excluir cliente (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await controller.excluir(req.params.id)
    res.status(204).send()
  } catch (err: any) {
    handleError(err, res, 'Erro ao excluir cliente')
  }
})

export default router
