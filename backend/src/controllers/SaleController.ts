import { prisma } from '../prisma'
import { resolveSaleDateTime } from '../utils/saleDate'
import { assertClientName, assertRequiredId, assertPositiveInteger, assertPositiveNumber, assertSaleDate, ValidationError, NotFoundError, ConflictError, UnprocessableError } from '../utils/validation'

const saleInclude = {
  product: { select: { id: true, name: true, price: true, stockQuantity: true, deletedAt: true } },
  client: { select: { id: true, name: true, cellphone: true, deletedAt: true } },
} as const

export class SaleController {
  async listar() {
    return prisma.sale.findMany({ where: { deletedAt: null }, orderBy: { saleDate: 'desc' }, include: saleInclude })
  }
  async buscar(term: string) {
    if (!term.trim()) return this.listar()
    return prisma.sale.findMany({ where: { deletedAt: null, OR: [{ product: { name: { contains: term.trim(), mode: 'insensitive' } } }, { client: { name: { contains: term.trim(), mode: 'insensitive' } } }] }, orderBy: { saleDate: 'desc' }, include: saleInclude })
  }
  async registrar(productId: string, buyer: { clientId?: string; clientName?: string }, quantity: number, salePrice: number, saleDate: string | Date) {
    assertRequiredId(productId, 'productId')
    assertPositiveInteger(quantity, 'Quantidade')
    assertPositiveNumber(salePrice, 'Valor unitário')
    assertSaleDate(saleDate)
    if (!buyer.clientId) assertClientName(buyer.clientName)
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product || product.deletedAt) throw new NotFoundError('Produto não encontrado')
      const reduced = await tx.product.updateMany({ where: { id: productId, deletedAt: null, stockQuantity: { gte: quantity } }, data: { stockQuantity: { decrement: quantity }, salesCount: { increment: quantity } } })
      if (!reduced.count) throw new UnprocessableError('Estoque insuficiente')
      let client
      if (buyer.clientId) {
        client = await tx.client.findUnique({ where: { id: buyer.clientId } })
        if (!client || client.deletedAt) throw new NotFoundError('Cliente não encontrado')
      } else {
        const name = buyer.clientName!.trim()
        client = await tx.client.findFirst({ where: { deletedAt: null, name: { equals: name, mode: 'insensitive' } } })
        if (!client) client = await tx.client.create({ data: { name } })
      }
      const totalPrice = quantity * salePrice
      const sale = await tx.sale.create({ data: { productId, clientId: client.id, quantity, unitPrice: salePrice, totalPrice, saleDate: resolveSaleDateTime(saleDate), updatedAt: new Date() } })
      await tx.client.update({ where: { id: client.id }, data: { totalPurchases: { increment: 1 }, totalProductsPurchased: { increment: quantity }, totalSpent: { increment: totalPrice } } })
      return sale
    })
  }
  async cancelar(id: string) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id } })
      if (!sale) throw new NotFoundError('Venda não encontrada')
      if (sale.deletedAt) throw new ConflictError('Venda já foi cancelada')
      const cancelled = await tx.sale.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date() } })
      if (!cancelled.count) throw new ConflictError('Venda já foi cancelada')
      await tx.product.update({ where: { id: sale.productId }, data: { stockQuantity: { increment: sale.quantity }, salesCount: { decrement: sale.quantity } } })
      await tx.client.update({ where: { id: sale.clientId }, data: { totalPurchases: { decrement: 1 }, totalProductsPurchased: { decrement: sale.quantity }, totalSpent: { decrement: sale.totalPrice } } })
    })
  }
  async atualizar(id: string, productId: string, clientId: string, quantity: number, salePrice: number, saleDate: string | Date) {
    assertRequiredId(productId, 'productId')
    assertRequiredId(clientId, 'clientId')
    assertPositiveInteger(quantity, 'Quantidade')
    assertPositiveNumber(salePrice, 'Valor unitário')
    assertSaleDate(saleDate)
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id } })
      if (!sale) throw new NotFoundError('Venda não encontrada')
      if (sale.deletedAt) throw new ConflictError('Venda cancelada não pode ser editada')
      const client = await tx.client.findUnique({ where: { id: clientId } })
      if (!client || client.deletedAt) throw new NotFoundError('Cliente não encontrado')
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product || product.deletedAt) throw new NotFoundError('Produto não encontrado')
      await tx.product.update({ where: { id: sale.productId }, data: { stockQuantity: { increment: sale.quantity }, salesCount: { decrement: sale.quantity } } })
      const reduced = await tx.product.updateMany({ where: { id: productId, deletedAt: null, stockQuantity: { gte: quantity } }, data: { stockQuantity: { decrement: quantity }, salesCount: { increment: quantity } } })
      if (!reduced.count) throw new UnprocessableError('Estoque insuficiente')
      await tx.client.update({ where: { id: sale.clientId }, data: { totalPurchases: { decrement: 1 }, totalProductsPurchased: { decrement: sale.quantity }, totalSpent: { decrement: sale.totalPrice } } })
      const totalPrice = quantity * salePrice
      await tx.client.update({ where: { id: clientId }, data: { totalPurchases: { increment: 1 }, totalProductsPurchased: { increment: quantity }, totalSpent: { increment: totalPrice } } })
      return tx.sale.update({ where: { id }, data: { productId, clientId, quantity, unitPrice: salePrice, totalPrice, saleDate: resolveSaleDateTime(saleDate), updatedAt: new Date() } })
    })
  }
}
