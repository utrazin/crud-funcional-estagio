import { prisma } from '../prisma'
import { ProductController } from './ProductController'
import { ClientController } from './ClientController'
import { resolveSaleDateTime } from '../utils/saleDate'
import {
  assertRequiredId,
  assertPositiveInteger,
  assertPositiveNumber,
  assertSaleDate,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnprocessableError,
} from '../utils/validation'

export class SaleController {
  private saleRepository = prisma.sale
  private productService = new ProductController()
  private clientService = new ClientController()

  async listar() {
    return this.saleRepository.findMany({
      where: { deletedAt: null },
      orderBy: { saleDate: 'desc' },
      include: {
        product: { select: { id: true, name: true, price: true, deletedAt: true } },
        client: { select: { id: true, name: true, cellphone: true, deletedAt: true } },
      },
    })
  }

  async buscar(term: string) {
    if (!term || !term.trim()) {
      return this.listar()
    }

    return this.saleRepository.findMany({
      where: {
        deletedAt: null,
        OR: [
          { product: { name: { contains: term.trim(), mode: 'insensitive' } } },
          { client: { name: { contains: term.trim(), mode: 'insensitive' } } },
        ],
      },
      orderBy: { saleDate: 'desc' },
      include: {
        product: { select: { id: true, name: true, price: true, deletedAt: true } },
        client: { select: { id: true, name: true, cellphone: true, deletedAt: true } },
      },
    })
  }

  /**
   * Resolve o cliente da venda: usa `clientId` se informado (precisa existir),
   * senão busca/cria pelo `clientName` (decisão de produto: autocomplete sem
   * correspondência cadastra o cliente automaticamente ao registrar a venda).
   */
  private async resolverCliente(clientId?: string, clientName?: string) {
    if (clientId && clientId.trim() !== '') {
      const client = await this.clientService.buscarPorId(clientId)
      if (!client || client.deletedAt) throw new NotFoundError('Cliente não encontrado')
      return client
    }
    if (clientName && clientName.trim() !== '') {
      return this.clientService.buscarOuCriarPorNome(clientName)
    }
    throw new ValidationError('Cliente é obrigatório')
  }

  async registrar(
    productId: string,
    clientIdOrName: { clientId?: string; clientName?: string },
    quantity: number,
    salePrice: number,
    saleDate: string | Date,
  ) {
    assertRequiredId(productId, 'productId')
    assertPositiveInteger(quantity, 'Quantidade')
    assertPositiveNumber(salePrice, 'Valor unitário')
    assertSaleDate(saleDate)

    const client = await this.resolverCliente(clientIdOrName.clientId, clientIdOrName.clientName)

    const product = await this.productService.buscarPorId(productId)
    if (!product || product.deletedAt) throw new NotFoundError('Produto não encontrado')
    if (product.stockQuantity < quantity) throw new UnprocessableError('Estoque insuficiente')
    if (salePrice < product.price) {
      throw new ValidationError(`Valor unitário não pode ser menor que o preço do produto (R$ ${product.price.toFixed(2)})`)
    }

    const totalPrice = this.calcularValorTotal(quantity, salePrice)

    const sale = await this.saleRepository.create({
      data: { productId, clientId: client.id, quantity, unitPrice: salePrice, totalPrice, saleDate: resolveSaleDateTime(saleDate), updatedAt: new Date() },
    })

    await this.productService.decrementarEstoque(productId, quantity)
    await this.clientService.registrarCompra(client.id, quantity, totalPrice)

    return sale
  }

  async cancelar(id: string) {
    const sale = await this.saleRepository.findUnique({ where: { id } })
    if (!sale) throw new NotFoundError('Venda não encontrada')
    if (sale.deletedAt) throw new ConflictError('Venda já foi cancelada')

    await this.saleRepository.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await this.productService.incrementarEstoque(sale.productId, sale.quantity)
    await this.clientService.reverterCompra(sale.clientId, sale.quantity, sale.totalPrice)
  }

  async atualizar(
    id: string,
    productId: string,
    clientId: string,
    quantity: number,
    salePrice: number,
    saleDate: string | Date,
  ) {
    assertRequiredId(productId, 'productId')
    assertRequiredId(clientId, 'clientId')
    assertPositiveInteger(quantity, 'Quantidade')
    assertPositiveNumber(salePrice, 'Valor unitário')
    assertSaleDate(saleDate)

    const sale = await this.saleRepository.findUnique({ where: { id } })
    if (!sale) throw new NotFoundError('Venda não encontrada')
    if (sale.deletedAt) throw new ConflictError('Venda cancelada não pode ser editada')

    const newClient = await this.clientService.buscarPorId(clientId)
    if (!newClient || newClient.deletedAt) throw new NotFoundError('Cliente não encontrado')

    // Reverte estoque e totais do cliente da venda antiga
    await this.productService.incrementarEstoque(sale.productId, sale.quantity)
    await this.clientService.reverterCompra(sale.clientId, sale.quantity, sale.totalPrice)

    const newProduct = await this.productService.buscarPorId(productId)
    if (!newProduct || newProduct.deletedAt) throw new NotFoundError('Produto não encontrado')
    if (newProduct.stockQuantity < quantity) throw new UnprocessableError('Estoque insuficiente')
    if (salePrice < newProduct.price) {
      throw new ValidationError(`Valor unitário não pode ser menor que o preço do produto (R$ ${newProduct.price.toFixed(2)})`)
    }

    const totalPrice = this.calcularValorTotal(quantity, salePrice)

    const updatedSale = await this.saleRepository.update({
      where: { id },
      data: { productId, clientId, quantity, unitPrice: salePrice, totalPrice, saleDate: resolveSaleDateTime(saleDate), updatedAt: new Date() },
    })

    await this.productService.decrementarEstoque(productId, quantity)
    await this.clientService.registrarCompra(clientId, quantity, totalPrice)

    return updatedSale
  }

  calcularValorTotal(quantity: number, salePrice: number): number {
    return quantity * salePrice
  }
}
