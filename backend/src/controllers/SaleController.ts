import { prisma } from '../prisma'
import { MOCK_CLIENTS, findClientById } from '../mocks/clients'

export class SaleController {
  private saleRepository = prisma.sale

  async listar() {
    return this.saleRepository.findMany({
      where: { deletedAt: null },
      orderBy: { saleDate: 'desc' },
      include: {
        product: { select: { id: true, name: true, price: true } },
      },
    })
  }

  async buscar(term: string) {
    if (!term || !term.trim()) {
      return this.listar()
    }

    const byProduct = await this.saleRepository.findMany({
      where: {
        deletedAt: null,
        product: { name: { contains: term.trim(), mode: 'insensitive' } },
      },
      orderBy: { saleDate: 'desc' },
      include: {
        product: { select: { id: true, name: true, price: true } },
      },
    })

    const lower = term.toLowerCase()
    const matchingClientIds = MOCK_CLIENTS
      .filter((c) => c.name.toLowerCase().includes(lower) || c.cellphone.includes(term))
      .map((c) => c.id)

    const byClient = matchingClientIds.length > 0
      ? await this.saleRepository.findMany({
          where: {
            deletedAt: null,
            clientId: { in: matchingClientIds },
          },
          orderBy: { saleDate: 'desc' },
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        })
      : []

    const seen = new Set(byProduct.map((s) => s.id))
    return [...byProduct, ...byClient.filter((s) => !seen.has(s.id))]
  }

  async registrar(
    productId: string,
    clientId: string,
    quantity: number,
    salePrice: number,
    saleDate: Date,
  ) {
    if (!productId || productId.trim() === '') throw new Error('productId é obrigatório')
    if (!clientId || clientId.trim() === '') throw new Error('clientId é obrigatório')
    if (typeof quantity !== 'number' || quantity <= 0) throw new Error('Quantidade deve ser maior que zero')
    if (typeof salePrice !== 'number' || salePrice <= 0) throw new Error('Valor unitário deve ser maior que zero')
    if (!saleDate) throw new Error('Data da venda é obrigatória')

    if (!findClientById(clientId)) throw new Error('Cliente não encontrado')

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || product.deletedAt) throw new Error('Produto não encontrado')
    if (product.stockQuantity < quantity) throw new Error('Estoque insuficiente')
    if (salePrice < product.price) {
      throw new Error(`Valor unitário não pode ser menor que o preço do produto (R$ ${product.price.toFixed(2)})`)
    }

    const totalPrice = this.calcularValorTotal(quantity, salePrice)

    const sale = await this.saleRepository.create({
      data: { productId, clientId, quantity, unitPrice: salePrice, totalPrice, saleDate: new Date(saleDate) },
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: product.stockQuantity - quantity,
        salesCount: product.salesCount + quantity,
      },
    })

    return sale
  }

  async cancelar(id: string) {
    const sale = await this.saleRepository.findUnique({ where: { id } })
    if (!sale) throw new Error('Venda não encontrada')
    if (sale.deletedAt) throw new Error('Venda já foi cancelada')

    await this.saleRepository.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    const product = await prisma.product.findUnique({ where: { id: sale.productId } })
    if (product) {
      await prisma.product.update({
        where: { id: sale.productId },
        data: {
          stockQuantity: product.stockQuantity + sale.quantity,
          salesCount: Math.max(0, product.salesCount - sale.quantity),
        },
      })
    }
  }

  async atualizar(
    id: string,
    productId: string,
    clientId: string,
    quantity: number,
    salePrice: number,
    saleDate: Date,
  ) {
    const sale = await this.saleRepository.findUnique({ where: { id } })
    if (!sale) throw new Error('Venda não encontrada')
    if (sale.deletedAt) throw new Error('Venda cancelada não pode ser editada')

    if (!findClientById(clientId)) throw new Error('Cliente não encontrado')

    const oldProduct = await prisma.product.findUnique({ where: { id: sale.productId } })
    if (oldProduct) {
      await prisma.product.update({
        where: { id: sale.productId },
        data: {
          stockQuantity: oldProduct.stockQuantity + sale.quantity,
          salesCount: Math.max(0, oldProduct.salesCount - sale.quantity),
        },
      })
    }

    const newProduct = await prisma.product.findUnique({ where: { id: productId } })
    if (!newProduct || newProduct.deletedAt) throw new Error('Produto não encontrado')
    if (newProduct.stockQuantity < quantity) throw new Error('Estoque insuficiente')
    if (salePrice < newProduct.price) {
      throw new Error(`Valor unitário não pode ser menor que o preço do produto (R$ ${newProduct.price.toFixed(2)})`)
    }

    const totalPrice = this.calcularValorTotal(quantity, salePrice)

    const updatedSale = await this.saleRepository.update({
      where: { id },
      data: { productId, clientId, quantity, unitPrice: salePrice, totalPrice, saleDate: new Date(saleDate) },
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newProduct.stockQuantity - quantity,
        salesCount: newProduct.salesCount + quantity,
      },
    })

    return updatedSale
  }

  calcularValorTotal(quantity: number, salePrice: number): number {
    return quantity * salePrice
  }
}
