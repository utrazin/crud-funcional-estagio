import { Router, Request, Response } from 'express'
import { prisma } from '../prisma'
import { findCustomerById } from '../mocks/customers'

const router = Router()

// Listar vendas
router.get('/', async (req: Request, res: Response) => {
  try {
    const where: any = { deletedAt: null }

    if (req.query.productId) {
      where.productId = req.query.productId as string
    }
    if (req.query.startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(req.query.startDate as string) }
    }
    if (req.query.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(req.query.endDate as string) }
    }

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    res.json(sales)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar vendas' })
  }
})

// Registrar venda
router.post('/', async (req: Request, res: Response) => {
  try {
    const { productId, customerId, quantity } = req.body

    // Validações Básicas
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      return res.status(400).json({ error: 'productId é obrigatório' })
    }
    if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
      return res.status(400).json({ error: 'customerId é obrigatório' })
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' })
    }

    // Valida Cliente
    const customer = findCustomerById(customerId)
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }

    // Valida Produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })
    if (!product || product.deletedAt) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    // Valida Estoque
    if (product.stockQuantity < quantity) {
      return res.status(422).json({ error: 'Estoque insuficiente' })
    }

    const { unitPrice: bodyUnitPrice, saleDate } = req.body
    const unitPrice = (typeof bodyUnitPrice === 'number' && bodyUnitPrice > 0)
      ? bodyUnitPrice
      : product.price
    const totalPrice = unitPrice * quantity

    const createdAt = saleDate ? new Date(saleDate) : new Date()

    const sale = await prisma.sale.create({
      data: {
        productId,
        customerId,
        quantity,
        unitPrice,
        totalPrice,
        createdAt,
      },
    })

    // Atualiza informações do Produto
    await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: product.stockQuantity - quantity,
        salesCount: product.salesCount + quantity,
        updatedAt: new Date(),
      },
    })

    res.status(201).json(sale)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar venda' })
  }
})

// Cancelar Venda
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
    })

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' })
    }
    if (sale.deletedAt) {
      return res.status(409).json({ error: 'Venda já foi cancelada' })
    }

    await prisma.sale.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    })

    // Ajusta informações do Produto
    const product = await prisma.product.findUnique({
      where: { id: sale.productId },
    })
    if (product) {
      await prisma.product.update({
        where: { id: sale.productId },
        data: {
          stockQuantity: product.stockQuantity + sale.quantity,
          salesCount: Math.max(0, product.salesCount - sale.quantity),
          updatedAt: new Date(),
        },
      })
    }

    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar venda' })
  }
})

export default router
