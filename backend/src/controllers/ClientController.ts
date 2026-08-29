import { prisma } from '../prisma'

export class ClientController {
  private clientRepository = prisma.client

  async listar() {
    return this.clientRepository.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  async buscarPorNome(name: string) {
    if (!name || !name.trim()) {
      return this.listar()
    }

    return this.clientRepository.findMany({
      where: {
        deletedAt: null,
        name: { contains: name.trim(), mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    })
  }

  async criar(name: string, cellphone?: string) {
    if (!name || !name.trim()) {
      throw new Error('Nome é obrigatório')
    }

    return this.clientRepository.create({
      data: {
        name: name.trim(),
        cellphone: cellphone?.trim() || null,
      },
    })
  }

  async atualizar(id: string, name: string, cellphone?: string) {
    const existing = await this.clientRepository.findUnique({ where: { id } })

    if (!existing) {
      throw new Error('Cliente não encontrado')
    }
    if (existing.deletedAt) {
      throw new Error('Cliente não está disponível')
    }
    if (!name || !name.trim()) {
      throw new Error('Nome é obrigatório')
    }

    return this.clientRepository.update({
      where: { id },
      data: { name: name.trim(), cellphone: cellphone?.trim() || null },
    })
  }

  async excluir(id: string) {
    const existing = await this.clientRepository.findUnique({ where: { id } })

    if (!existing) {
      throw new Error('Cliente não encontrado')
    }
    if (existing.deletedAt) {
      throw new Error('Cliente já foi excluído')
    }

    await this.clientRepository.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async detalhes(id: string) {
    const client = await this.clientRepository.findUnique({ where: { id } })
    if (!client || client.deletedAt) {
      throw new Error('Cliente não encontrado')
    }

    const sales = await prisma.sale.findMany({
      where: { clientId: id, deletedAt: null },
      orderBy: { saleDate: 'desc' },
      include: { product: { select: { id: true, name: true } } },
    })

    return {
      ...client,
      vendas: sales.map((s) => ({
        id: s.id,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        totalPrice: s.totalPrice,
        saleDate: s.saleDate,
        produto: s.product?.name ?? 'Produto removido',
      })),
    }
  }

  // Métodos internos usados pelo SaleController

  async buscarPorId(id: string) {
    return this.clientRepository.findUnique({ where: { id } })
  }

  async buscarOuCriarPorNome(name: string) {
    const trimmed = name.trim()
    const existing = await this.clientRepository.findFirst({
      where: { deletedAt: null, name: { equals: trimmed, mode: 'insensitive' } },
    })
    if (existing) return existing

    return this.clientRepository.create({ data: { name: trimmed } })
  }

  async registrarCompra(clientId: string, quantity: number, totalPrice: number) {
    return this.clientRepository.update({
      where: { id: clientId },
      data: {
        totalPurchases: { increment: 1 },
        totalProductsPurchased: { increment: quantity },
        totalSpent: { increment: totalPrice },
      },
    })
  }

  async reverterCompra(clientId: string, quantity: number, totalPrice: number) {
    return this.clientRepository.update({
      where: { id: clientId },
      data: {
        totalPurchases: { decrement: 1 },
        totalProductsPurchased: { decrement: quantity },
        totalSpent: { decrement: totalPrice },
      },
    })
  }
}
