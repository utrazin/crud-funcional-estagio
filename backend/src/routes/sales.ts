import { Router, Request, Response } from 'express'
import { SaleController } from '../controllers/SaleController'
import { AppError } from '../utils/validation'

const router = Router()
const controller = new SaleController()

function handleError(err: any, res: Response, fallback: string) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  res.status(500).json({ error: err.message || fallback })
}

// Listar vendas (com busca opcional por nome de produto ou cliente)
router.get('/', async (req: Request, res: Response) => {
  try {
    const term = (req.query.term as string) || ''
    const sales = term ? await controller.buscar(term) : await controller.listar()
    res.json(sales)
  } catch (err: any) {
    handleError(err, res, 'Erro ao listar vendas')
  }
})

// Registrar venda
router.post('/', async (req: Request, res: Response) => {
  try {
    const { productId, clientId, clientName, quantity, salePrice, saleDate } = req.body
    const sale = await controller.registrar(productId, { clientId, clientName }, quantity, salePrice, saleDate)
    res.status(201).json(sale)
  } catch (err: any) {
    handleError(err, res, 'Erro ao registrar venda')
  }
})

// Atualizar venda
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { productId, clientId, quantity, salePrice, saleDate } = req.body
    const sale = await controller.atualizar(req.params.id, productId, clientId, quantity, salePrice, saleDate)
    res.json(sale)
  } catch (err: any) {
    handleError(err, res, 'Erro ao atualizar venda')
  }
})

// Cancelar venda (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await controller.cancelar(req.params.id)
    res.status(204).send()
  } catch (err: any) {
    handleError(err, res, 'Erro ao cancelar venda')
  }
})

export default router
