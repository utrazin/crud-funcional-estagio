import { Router, Request, Response } from 'express'
import { ProductController } from '../controllers/ProductController'

const router = Router()
const controller = new ProductController()

// Listar todos os produtos
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await controller.listar()
    res.json(products)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao listar produtos' })
  }
})

// Buscar por nome
router.get('/buscar', async (req: Request, res: Response) => {
  try {
    const name = (req.query.name as string) || ''
    const products = await controller.buscarPorNome(name)
    res.json(products)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao buscar produtos' })
  }
})

// Criar produto
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, stockQuantity, description } = req.body
    const product = await controller.criar(name, price, stockQuantity, description)
    res.status(201).json(product)
  } catch (err: any) {
    const status = ['Nome é obrigatório', 'Preço deve ser maior que zero', 'Quantidade deve ser maior ou igual a zero']
      .includes(err.message) ? 400 : 500
    res.status(status).json({ error: err.message || 'Erro ao criar produto' })
  }
})

// Atualizar produto
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, price, stockQuantity, description } = req.body
    const product = await controller.atualizar(req.params.id, name, price, stockQuantity, description)
    res.json(product)
  } catch (err: any) {
    const status = err.message.includes('não encontrado') ? 404
      : err.message.includes('não está disponível') ? 409
      : err.message.includes('obrigatório') || err.message.includes('deve ser') ? 400
      : 500
    res.status(status).json({ error: err.message || 'Erro ao atualizar produto' })
  }
})

// Excluir produto (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await controller.excluir(req.params.id)
    res.status(204).send()
  } catch (err: any) {
    const status = err.message.includes('não encontrado') ? 404
      : err.message.includes('já foi excluído') ? 409
      : 500
    res.status(status).json({ error: err.message || 'Erro ao excluir produto' })
  }
})

export default router
