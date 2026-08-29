import ExcelJS from 'exceljs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { prisma } from '../prisma'
import { SaleController } from './SaleController'

export interface ReportFilters {
  from?: string
  to?: string
  productIds?: string[]
  clientIds?: string[]
}

const IMPORT_COLUMNS = ['Produto', 'Cliente', 'Quantidade', 'Valor Unitário', 'Data']

export class ReportController {
  private saleRepository = prisma.sale
  private saleService = new SaleController()

  private buildWhere(filters: ReportFilters) {
    const where: any = { deletedAt: null }
    if (filters.productIds && filters.productIds.length > 0) where.productId = { in: filters.productIds }
    if (filters.clientIds && filters.clientIds.length > 0) where.clientId = { in: filters.clientIds }
    if (filters.from || filters.to) {
      where.saleDate = {}
      if (filters.from) where.saleDate.gte = new Date(filters.from)
      if (filters.to) where.saleDate.lte = new Date(`${filters.to}T23:59:59.999Z`)
    }
    return where
  }

  async listarVendas(filters: ReportFilters) {
    return this.saleRepository.findMany({
      where: this.buildWhere(filters),
      orderBy: { saleDate: 'desc' },
      include: {
        product: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    })
  }

  async agregados(filters: ReportFilters) {
    const where = this.buildWhere(filters)

    const [result, clientesDistintos] = await Promise.all([
      this.saleRepository.aggregate({
        where,
        _count: { _all: true },
        _sum: { totalPrice: true, quantity: true },
      }),
      this.saleRepository.findMany({
        where,
        select: { clientId: true },
        distinct: ['clientId'],
      }),
    ])

    const totalVendas = result._count._all
    const faturamentoTotal = result._sum.totalPrice ?? 0

    return {
      totalVendas,
      faturamentoTotal,
      totalProdutosVendidos: result._sum.quantity ?? 0,
      ticketMedio: totalVendas > 0 ? faturamentoTotal / totalVendas : 0,
      totalClientes: clientesDistintos.length,
      geradoEm: new Date().toISOString(),
    }
  }

  async exportarVendas(filters: ReportFilters, format: 'xlsx' | 'csv') {
    const sales = await this.listarVendas(filters)
    const rows = sales.map((s) => ({
      Produto: s.product.name,
      Quantidade: s.quantity,
      'Valor Unitário': s.unitPrice,
      'Valor Total': s.totalPrice,
      Data: s.saleDate.toISOString().slice(0, 10),
      Comprador: s.client?.name ?? 'Cliente removido',
    }))

    if (format === 'csv') {
      const csv = stringify(rows, { header: true })
      return { buffer: Buffer.from(csv, 'utf-8'), contentType: 'text/csv; charset=utf-8', filename: 'relatorio-vendas.csv' }
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Vendas')
    sheet.columns = [
      { header: 'Produto', key: 'Produto', width: 30 },
      { header: 'Quantidade', key: 'Quantidade', width: 14 },
      { header: 'Valor Unitário', key: 'Valor Unitário', width: 16 },
      { header: 'Valor Total', key: 'Valor Total', width: 16 },
      { header: 'Data', key: 'Data', width: 14 },
      { header: 'Comprador', key: 'Comprador', width: 24 },
    ]
    sheet.addRows(rows)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      buffer: Buffer.from(buffer),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: 'relatorio-vendas.xlsx',
    }
  }

  gerarModeloImportacao() {
    const csv = stringify([IMPORT_COLUMNS], {})
    return Buffer.from(csv, 'utf-8')
  }

  async importarVendas(buffer: Buffer, mimetype: string, originalname: string) {
    const isExcel = mimetype.includes('spreadsheet') || originalname.toLowerCase().endsWith('.xlsx')
    const rows = isExcel ? await this.parseExcel(buffer) : this.parseCsv(buffer)

    const imported: string[] = []
    const skipped: { row: number; reason: string }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // +1 para índice base 1, +1 pelo cabeçalho

      try {
        const productName = String(row['Produto'] ?? '').trim()
        const clientName = String(row['Cliente'] ?? '').trim()
        const quantity = Number(row['Quantidade'])
        const unitPrice = Number(row['Valor Unitário'])
        const rawDate = row['Data']

        if (!productName) throw new Error('Produto em branco')
        if (!clientName) throw new Error('Cliente em branco')
        if (!quantity || quantity <= 0) throw new Error('Quantidade inválida')
        if (!unitPrice || unitPrice <= 0) throw new Error('Valor unitário inválido')

        const product = await prisma.product.findFirst({
          where: { deletedAt: null, name: { equals: productName, mode: 'insensitive' } },
        })
        if (!product) throw new Error(`Produto "${productName}" não encontrado`)

        const saleDate = rawDate instanceof Date ? rawDate : new Date(String(rawDate))
        if (isNaN(saleDate.getTime())) throw new Error('Data inválida')

        await this.saleService.registrar(product.id, { clientName }, quantity, unitPrice, saleDate)
        imported.push(`${productName} (${clientName})`)
      } catch (err: any) {
        skipped.push({ row: rowNumber, reason: err.message || 'Erro desconhecido' })
      }
    }

    return { imported: imported.length, skipped }
  }

  private parseCsv(buffer: Buffer): Record<string, any>[] {
    return parse(buffer, { columns: true, skip_empty_lines: true, trim: true })
  }

  private async parseExcel(buffer: Buffer): Promise<Record<string, any>[]> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer as any)
    const sheet = workbook.worksheets[0]
    if (!sheet) return []

    const headerRow = sheet.getRow(1).values as any[]
    const headers = headerRow.slice(1).map((h) => String(h).trim())

    const rows: Record<string, any>[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const values = row.values as any[]
      const record: Record<string, any> = {}
      headers.forEach((header, idx) => {
        record[header] = values[idx + 1]
      })
      rows.push(record)
    })
    return rows
  }
}
