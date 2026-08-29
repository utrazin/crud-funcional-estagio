import { Router, Request, Response } from 'express'
import { ClientController } from '../controllers/ClientController'

const router = Router()
const controller = new ClientController()

// Listar todos os clientes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const clients = await controller.listar()
    res.json(clients)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao listar clientes' })
  }
})

// Buscar por nome
router.get('/buscar', async (req: Request, res: Response) => {
  try {
    const name = (req.query.name as string) || ''
    const clients = await controller.buscarPorNome(name)
    res.json(clients)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao buscar clientes' })
  }
})

// Detalhes do cliente (com histórico de compras) — precisa vir depois de /buscar
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const client = await controller.detalhes(req.params.id)
    res.json(client)
  } catch (err: any) {
    const status = err.message.includes('não encontrado') ? 404 : 500
    res.status(status).json({ error: err.message || 'Erro ao buscar cliente' })
  }
})

// Criar cliente
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, cellphone } = req.body
    const client = await controller.criar(name, cellphone)
    res.status(201).json(client)
  } catch (err: any) {
    const status = err.message === 'Nome é obrigatório' ? 400 : 500
    res.status(status).json({ error: err.message || 'Erro ao criar cliente' })
  }
})

// Atualizar cliente (edição inline: nome e telefone)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, cellphone } = req.body
    const client = await controller.atualizar(req.params.id, name, cellphone)
    res.json(client)
  } catch (err: any) {
    const status = err.message.includes('não encontrado') ? 404
      : err.message.includes('não está disponível') ? 409
      : err.message.includes('obrigatório') ? 400
      : 500
    res.status(status).json({ error: err.message || 'Erro ao atualizar cliente' })
  }
})

// Excluir cliente (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await controller.excluir(req.params.id)
    res.status(204).send()
  } catch (err: any) {
    const status = err.message.includes('não encontrado') ? 404
      : err.message.includes('já foi excluído') ? 409
      : 500
    res.status(status).json({ error: err.message || 'Erro ao excluir cliente' })
  }
})

export default router
