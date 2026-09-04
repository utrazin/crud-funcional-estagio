import { Router, Request, Response } from 'express'
import { ProductController } from '../controllers/ProductController'
import { AppError } from '../utils/validation'

const router = Router()
const controller = new ProductController()

function handleError(err: any, res: Response, fallback: string) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  res.status(500).json({ error: err.message || fallback })
}

// Listar todos os produtos
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await controller.listar()
    res.json(products)
  } catch (err: any) {
    handleError(err, res, 'Erro ao listar produtos')
  }
})

// Buscar por nome
router.get('/buscar', async (req: Request, res: Response) => {
  try {
    const name = (req.query.name as string) || ''
    const products = await controller.buscarPorNome(name)
    res.json(products)
  } catch (err: any) {
    handleError(err, res, 'Erro ao buscar produtos')
  }
})

// Detalhes do produto (com histórico de vendas) — precisa vir depois de /buscar
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await controller.detalhes(req.params.id)
    res.json(product)
  } catch (err: any) {
    handleError(err, res, 'Erro ao buscar produto')
  }
})

// Criar produto
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, stockQuantity, description } = req.body
    const product = await controller.criar(name, price, stockQuantity, description)
    res.status(201).json(product)
  } catch (err: any) {
    handleError(err, res, 'Erro ao criar produto')
  }
})

// Atualizar produto
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, price, stockQuantity, description } = req.body
    const product = await controller.atualizar(req.params.id, name, price, stockQuantity, description)
    res.json(product)
  } catch (err: any) {
    handleError(err, res, 'Erro ao atualizar produto')
  }
})

// Excluir produto (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await controller.excluir(req.params.id)
    res.status(204).send()
  } catch (err: any) {
    handleError(err, res, 'Erro ao excluir produto')
  }
})

export default router
