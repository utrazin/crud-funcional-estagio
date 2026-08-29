import { prisma } from '../prisma'

export class ProductController {
  private productRepository = prisma.product

  async listar() {
    return this.productRepository.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  async criar(name: string, price: number, stockQuantity: number, description: string) {
    if (!name || !name.trim()) {
      throw new Error('Nome é obrigatório')
    }
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Preço deve ser maior que zero')
    }
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      throw new Error('Quantidade deve ser maior ou igual a zero')
    }

    return this.productRepository.create({
      data: {
        name: name.trim(),
        price,
        stockQuantity,
        description: description?.trim() || null,
        salesCount: 0,
      },
    })
  }

  async buscarPorNome(name: string) {
    if (!name || !name.trim()) {
      return this.listar()
    }

    return this.productRepository.findMany({
      where: {
        deletedAt: null,
        name: { contains: name.trim(), mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    })
  }

  async excluir(id: string) {
    const existing = await this.productRepository.findUnique({ where: { id } })

    if (!existing) {
      throw new Error('Produto não encontrado')
    }
    if (existing.deletedAt) {
      throw new Error('Produto já foi excluído')
    }

    await this.productRepository.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async atualizar(id: string, name: string, price: number, stockQuantity: number, description: string) {
    const existing = await this.productRepository.findUnique({ where: { id } })

    if (!existing) {
      throw new Error('Produto não encontrado')
    }
    if (existing.deletedAt) {
      throw new Error('Produto não está disponível')
    }

    if (!name || !name.trim()) {
      throw new Error('Nome é obrigatório')
    }
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Preço deve ser maior que zero')
    }
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      throw new Error('Quantidade deve ser maior ou igual a zero')
    }

    return this.productRepository.update({
      where: { id },
      data: {
        name: name.trim(),
        price,
        stockQuantity,
        description: description?.trim() || null,
      },
    })
  }

  async detalhes(id: string) {
    const product = await this.productRepository.findUnique({ where: { id } })
    if (!product || product.deletedAt) {
      throw new Error('Produto não encontrado')
    }

    const sales = await prisma.sale.findMany({
      where: { productId: id, deletedAt: null },
      orderBy: { saleDate: 'desc' },
      include: { client: { select: { id: true, name: true } } },
    })

    const valorTotalVendido = sales.reduce((sum, s) => sum + s.totalPrice, 0)

    return {
      ...product,
      valorTotalVendido,
      vendas: sales.map((s) => ({
        id: s.id,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        totalPrice: s.totalPrice,
        saleDate: s.saleDate,
        comprador: s.client?.name ?? 'Cliente removido',
      })),
    }
  }

  // Métodos internos usados pelo SaleController

  async buscarPorId(id: string) {
    return this.productRepository.findUnique({ where: { id } })
  }

  async decrementarEstoque(id: string, quantidade: number) {
    return this.productRepository.update({
      where: { id },
      data: {
        stockQuantity: { decrement: quantidade },
        salesCount: { increment: quantidade },
      },
    })
  }

  async incrementarEstoque(id: string, quantidade: number) {
    return this.productRepository.update({
      where: { id },
      data: {
        stockQuantity: { increment: quantidade },
        salesCount: { decrement: quantidade },
      },
    })
  }
}
