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

  async atualizar(id: string, dados: { name?: string; price?: number; stockQuantity?: number; description?: string }) {
    const existing = await this.productRepository.findUnique({ where: { id } })

    if (!existing) {
      throw new Error('Produto não encontrado')
    }
    if (existing.deletedAt) {
      throw new Error('Produto não está disponível')
    }

    if (dados.name !== undefined && (!dados.name || !dados.name.trim())) {
      throw new Error('Nome é obrigatório')
    }
    if (dados.price !== undefined && (typeof dados.price !== 'number' || dados.price <= 0)) {
      throw new Error('Preço deve ser maior que zero')
    }
    if (dados.stockQuantity !== undefined && (typeof dados.stockQuantity !== 'number' || dados.stockQuantity < 0)) {
      throw new Error('Quantidade deve ser maior ou igual a zero')
    }

    return this.productRepository.update({
      where: { id },
      data: {
        ...(dados.name !== undefined && { name: dados.name.trim() }),
        ...(dados.price !== undefined && { price: dados.price }),
        ...(dados.stockQuantity !== undefined && { stockQuantity: dados.stockQuantity }),
        ...(dados.description !== undefined && { description: dados.description?.trim() || null }),
      },
    })
  }
}
