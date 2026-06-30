import { Router, Request, Response } from 'express'
import { SaleController } from '../controllers/SaleController'

const router = Router()
const controller = new SaleController()

// Listar vendas (com busca opcional por nome de produto ou cliente)
router.get('/', async (req: Request, res: Response) => {
  try {
    const term = (req.query.term as string) || ''
    const sales = term ? await controller.buscar(term) : await controller.listar()
    res.json(sales)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao listar vendas' })
  }
})

// Registrar venda
router.post('/', async (req: Request, res: Response) => {
  try {
    const { productId, clientId, quantity, salePrice, saleDate } = req.body
    const sale = await controller.registrar(productId, clientId, quantity, salePrice, saleDate)
    res.status(201).json(sale)
  } catch (err: any) {
    const status = err.message.includes('não encontrado') ? 404
      : err.message.includes('insuficiente') ? 422
      : err.message.includes('obrigatório') || err.message.includes('deve ser') ? 400
      : 500
    res.status(status).json({ error: err.message || 'Erro ao registrar venda' })
  }
})

// Atualizar venda
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { productId, clientId, quantity, salePrice, saleDate } = req.body
    const sale = await controller.atualizar(req.params.id, productId, clientId, quantity, salePrice, saleDate)
    res.json(sale)
  } catch (err: any) {
    const status = err.message.includes('não encontrada') ? 404
      : err.message.includes('não pode ser editada') ? 409
      : err.message.includes('não encontrado') ? 404
      : err.message.includes('insuficiente') ? 422
      : 500
    res.status(status).json({ error: err.message || 'Erro ao atualizar venda' })
  }
})

// Cancelar venda (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await controller.cancelar(req.params.id)
    res.status(204).send()
  } catch (err: any) {
    const status = err.message.includes('não encontrada') ? 404
      : err.message.includes('já foi cancelada') ? 409
      : 500
    res.status(status).json({ error: err.message || 'Erro ao cancelar venda' })
  }
})

export default router
