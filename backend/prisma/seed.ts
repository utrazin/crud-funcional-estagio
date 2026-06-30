import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const products = [
  { name: 'Essência Noir',  price: 249.90, stockQuantity: 35, description: 'Perfume amadeirado com notas de cedro, âmbar e baunilha.' },
  { name: 'Ocean Breeze',   price: 189.90, stockQuantity: 48, description: 'Fragrância fresca inspirada na brisa do mar, com notas cítricas.' },
  { name: 'Golden Rose',    price: 279.90, stockQuantity: 20, description: 'Perfume floral sofisticado com rosa, jasmim e almíscar.' },
  { name: 'Mystic Oud',     price: 399.90, stockQuantity: 12, description: 'Fragrância intensa com oud, especiarias orientais e patchouli.' },
  { name: 'Vanilla Dream',  price: 159.90, stockQuantity: 60, description: 'Perfume doce com notas de baunilha, caramelo e fava tonka.' },
  { name: 'Silver Night',   price: 299.90, stockQuantity: 18, description: 'Fragrância elegante com lavanda, bergamota e sândalo.' },
  { name: 'Citrus Fresh',   price: 149.90, stockQuantity: 42, description: 'Perfume leve com limão siciliano, laranja e hortelã.' },
  { name: 'Royal Elegance', price: 459.90, stockQuantity: 10, description: 'Fragrância premium com notas de couro, âmbar e madeiras nobres.' },
  { name: 'Bloom Essence',  price: 219.90, stockQuantity: 27, description: 'Perfume floral delicado com lírio, peônia e magnólia.' },
  { name: 'Black Intense',  price: 349.90, stockQuantity: 15, description: 'Perfume marcante com café, baunilha e vetiver.' },
]

// Clientes do mock (IDs fixos)
const CLIENTS = {
  joao:    'client-001', // João Silva
  maria:   'client-002', // Maria Oliveira
  carlos:  'client-003', // Carlos Santos
  ana:     'client-004', // Ana Costa
  pedro:   'client-005', // Pedro Almeida
}

// Mapeamento das 15 vendas:
// original → substituído por
// João Silva       → João Silva      (client-001)
// Maria Oliveira   → Maria Oliveira  (client-002)
// Carlos Souza     → Carlos Santos   (client-003)
// Fernanda Lima    → Ana Costa       (client-004)
// Lucas Pereira    → Pedro Almeida   (client-005)
// Ana Costa        → Ana Costa       (client-004)
// Pedro Martins    → Pedro Almeida   (client-005)
// Juliana Rocha    → Maria Oliveira  (client-002)
// Gabriel Almeida  → João Silva      (client-001)
// Beatriz Santos   → Carlos Santos   (client-003)
// Ricardo Gomes    → Pedro Almeida   (client-005)
// Patrícia Ferreira→ Maria Oliveira  (client-002)
// Eduardo Barbosa  → Carlos Santos   (client-003)
// Camila Mendes    → Ana Costa       (client-004)
// Felipe Carvalho  → João Silva      (client-001)

async function main() {
  console.log('Inserindo produtos...')

  const created = await Promise.all(
    products.map((p) => prisma.product.create({ data: p }))
  )

  // Mapeia nome do produto para o id gerado
  const productIdByName: Record<string, string> = {}
  created.forEach((p) => { productIdByName[p.name] = p.id })

  console.log(`${created.length} produtos inseridos.`)
  console.log('Inserindo vendas...')

  type SaleData = {
    productName: string
    clientId: string
    quantity: number
    salePrice: number
    saleDate: string
  }

  const sales: SaleData[] = [
    { productName: 'Essência Noir',  clientId: CLIENTS.joao,   quantity: 2, salePrice: 249.90, saleDate: '2026-06-01' },
    { productName: 'Ocean Breeze',   clientId: CLIENTS.maria,  quantity: 1, salePrice: 189.90, saleDate: '2026-06-02' },
    { productName: 'Golden Rose',    clientId: CLIENTS.carlos, quantity: 3, salePrice: 279.90, saleDate: '2026-06-03' },
    { productName: 'Mystic Oud',     clientId: CLIENTS.ana,    quantity: 1, salePrice: 399.90, saleDate: '2026-06-05' },
    { productName: 'Vanilla Dream',  clientId: CLIENTS.pedro,  quantity: 4, salePrice: 159.90, saleDate: '2026-06-06' },
    { productName: 'Silver Night',   clientId: CLIENTS.ana,    quantity: 2, salePrice: 299.90, saleDate: '2026-06-08' },
    { productName: 'Citrus Fresh',   clientId: CLIENTS.pedro,  quantity: 5, salePrice: 149.90, saleDate: '2026-06-10' },
    { productName: 'Royal Elegance', clientId: CLIENTS.maria,  quantity: 1, salePrice: 459.90, saleDate: '2026-06-12' },
    { productName: 'Bloom Essence',  clientId: CLIENTS.joao,   quantity: 2, salePrice: 219.90, saleDate: '2026-06-14' },
    { productName: 'Black Intense',  clientId: CLIENTS.carlos, quantity: 1, salePrice: 349.90, saleDate: '2026-06-15' },
    { productName: 'Essência Noir',  clientId: CLIENTS.pedro,  quantity: 1, salePrice: 249.90, saleDate: '2026-06-18' },
    { productName: 'Vanilla Dream',  clientId: CLIENTS.maria,  quantity: 2, salePrice: 159.90, saleDate: '2026-06-20' },
    { productName: 'Ocean Breeze',   clientId: CLIENTS.carlos, quantity: 3, salePrice: 189.90, saleDate: '2026-06-22' },
    { productName: 'Golden Rose',    clientId: CLIENTS.ana,    quantity: 1, salePrice: 279.90, saleDate: '2026-06-24' },
    { productName: 'Royal Elegance', clientId: CLIENTS.joao,   quantity: 2, salePrice: 459.90, saleDate: '2026-06-27' },
  ]

  for (const s of sales) {
    const productId = productIdByName[s.productName]
    const totalPrice = s.quantity * s.salePrice

    await prisma.sale.create({
      data: {
        productId,
        clientId: s.clientId,
        quantity: s.quantity,
        unitPrice: s.salePrice,
        totalPrice,
        saleDate: new Date(s.saleDate),
      },
    })

    // Atualiza estoque e salesCount do produto
    await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: { decrement: s.quantity },
        salesCount:    { increment: s.quantity },
      },
    })
  }

  console.log(`${sales.length} vendas inseridas.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
