import { Router, Request, Response } from 'express'
import { prisma } from '../prisma'

const router = Router()

// Listar produtos (ignora soft deleted)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar produtos' })
  }
})

// Buscar produto por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    })
    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto' })
  }
})

// Criar produto
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, stockQuantity, description } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' })
    }
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Preço deve ser maior que zero' })
    }
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior ou igual a zero' })
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        stockQuantity,
        description: description?.trim() || null,
        salesCount: 0,
      },
    })
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto' })
  }
})

// Atualizar produto
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }
    if (existing.deletedAt) {
      return res.status(409).json({ error: 'Produto não está disponível' })
    }

    const { name, price, stockQuantity, description } = req.body

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ error: 'Nome é obrigatório' })
    }
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({ error: 'Preço deve ser maior que zero' })
    }
    if (stockQuantity !== undefined && (typeof stockQuantity !== 'number' || stockQuantity < 0)) {
      return res.status(400).json({ error: 'Quantidade deve ser maior ou igual a zero' })
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(price !== undefined && { price }),
        ...(stockQuantity !== undefined && { stockQuantity }),
        ...(description !== undefined && { description: description?.trim() || null }),
        updatedAt: new Date(),
      },
    })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto' })
  }
})

// Excluir produto (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }
    if (existing.deletedAt) {
      return res.status(409).json({ error: 'Produto já foi excluído' })
    }

    await prisma.product.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir produto' })
  }
})

export default router
