import 'dotenv/config'
import { prisma } from '../src/prisma'
import { ProductController } from '../src/controllers/ProductController'
import { ClientController } from '../src/controllers/ClientController'
import { SaleController } from '../src/controllers/SaleController'

const productController = new ProductController()
const clientController = new ClientController()
const saleController = new SaleController()

const NEW_PRODUCTS = [
  { name: 'Amber Nights', price: 219.9, stockQuantity: 300, description: 'Fragrância âmbar quente com fundo de baunilha.' },
  { name: 'Velvet Rose', price: 259.9, stockQuantity: 250, description: 'Rosa aveludada com toques de framboesa.' },
  { name: 'Ocean Mist', price: 179.9, stockQuantity: 350, description: 'Notas aquáticas frescas com sal marinho.' },
  { name: 'Golden Sun', price: 199.9, stockQuantity: 280, description: 'Cítricos dourados com flor de laranjeira.' },
  { name: 'Midnight Oud', price: 449.9, stockQuantity: 150, description: 'Oud intenso com especiarias orientais.' },
  { name: 'Citrus Splash', price: 139.9, stockQuantity: 400, description: 'Explosão cítrica de limão e bergamota.' },
  { name: 'Sweet Vanilla', price: 169.9, stockQuantity: 320, description: 'Baunilha doce com caramelo macio.' },
  { name: 'Wild Orchid', price: 289.9, stockQuantity: 200, description: 'Orquídea selvagem com almíscar branco.' },
  { name: 'Deep Forest', price: 229.9, stockQuantity: 260, description: 'Notas amadeiradas de pinho e vetiver.' },
  { name: 'Crystal Rain', price: 189.9, stockQuantity: 300, description: 'Frescor cristalino com notas verdes.' },
  { name: 'Noble Musk', price: 309.9, stockQuantity: 180, description: 'Almíscar nobre com fundo amadeirado.' },
  { name: 'Peach Bloom', price: 159.9, stockQuantity: 330, description: 'Pêssego floral delicado.' },
  { name: 'Smoky Leather', price: 379.9, stockQuantity: 160, description: 'Couro defumado com especiarias.' },
  { name: 'Fresh Linen', price: 149.9, stockQuantity: 360, description: 'Aroma de roupa limpa recém-lavada.' },
  { name: 'White Lily', price: 209.9, stockQuantity: 270, description: 'Lírio branco puro e elegante.' },
  { name: 'Cedar Wood', price: 239.9, stockQuantity: 240, description: 'Cedro seco com toques terrosos.' },
  { name: 'Berry Kiss', price: 169.9, stockQuantity: 310, description: 'Frutas vermelhas com um toque doce.' },
  { name: 'Silver Frost', price: 269.9, stockQuantity: 220, description: 'Frescor metálico com notas de gelo.' },
  { name: 'Spice Route', price: 329.9, stockQuantity: 190, description: 'Especiarias orientais complexas.' },
  { name: 'Coconut Dream', price: 179.9, stockQuantity: 340, description: 'Coco tropical com baunilha suave.' },
  { name: 'Iris Whisper', price: 299.9, stockQuantity: 210, description: 'Íris pó com fundo amadeirado macio.' },
  { name: 'Tobacco Honey', price: 359.9, stockQuantity: 170, description: 'Tabaco adocicado com mel.' },
  { name: 'Jasmine Veil', price: 219.9, stockQuantity: 280, description: 'Véu de jasmim noturno.' },
  { name: 'Blue Lagoon', price: 189.9, stockQuantity: 320, description: 'Aquático azul com notas cítricas.' },
  { name: 'Rustic Amber', price: 249.9, stockQuantity: 230, description: 'Âmbar rústico com notas de couro.' },
]

const FIRST_NAMES = [
  'Lucas', 'Mariana', 'Rafael', 'Beatriz', 'Thiago', 'Camila', 'Bruno', 'Larissa', 'Diego', 'Fernanda',
  'Gustavo', 'Juliana', 'Rodrigo', 'Patrícia', 'Marcelo', 'Vanessa', 'André', 'Aline', 'Felipe', 'Renata',
  'Leonardo', 'Priscila', 'Vinícius', 'Tatiana', 'Daniel', 'Carolina', 'Eduardo', 'Bianca', 'Rogério', 'Débora',
  'Henrique', 'Natália', 'Igor', 'Sabrina', 'Renato', 'Amanda', 'Caio', 'Letícia', 'Otávio', 'Isabela',
]
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
]
const DDDS = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '47']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}
function randomPhone() {
  const ddd = randomChoice(DDDS)
  const n = randomInt(90000, 99999)
  const s = randomInt(1000, 9999)
  return `(${ddd}) 9${n}-${s}`
}
function randomDateInLastYear() {
  const now = new Date()
  const daysAgo = randomInt(0, 365)
  const d = new Date(now)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0)
  return d
}

const NEW_CLIENTS_COUNT = 40
const SALES_COUNT = 300

async function main() {
  console.log('Criando produtos novos...')
  const createdProducts = []
  for (const p of NEW_PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { name: p.name, deletedAt: null } })
    if (existing) {
      createdProducts.push(existing)
      continue
    }
    const created = await productController.criar(p.name, p.price, p.stockQuantity, p.description)
    createdProducts.push(created)
  }
  console.log(`  -> ${createdProducts.length} produtos novos disponíveis`)

  console.log('Criando clientes novos...')
  const createdClients = []
  const usedNames = new Set<string>()
  for (let i = 0; i < NEW_CLIENTS_COUNT; i++) {
    let name = `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`
    while (usedNames.has(name)) {
      name = `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`
    }
    usedNames.add(name)
    const created = await clientController.criar(name, randomPhone())
    createdClients.push(created)
  }
  console.log(`  -> ${createdClients.length} clientes novos criados`)

  console.log('Buscando todo o catálogo de produtos e clientes (novos + já existentes)...')
  const allProducts = await prisma.product.findMany({ where: { deletedAt: null } })
  const allClients = await prisma.client.findMany({ where: { deletedAt: null } })

  console.log(`Gerando ${SALES_COUNT} vendas distribuídas no último ano...`)
  let registradas = 0
  let ignoradas = 0
  for (let i = 0; i < SALES_COUNT; i++) {
    const product = randomChoice(allProducts)
    const client = randomChoice(allClients)
    const quantity = randomInt(1, 5)
    const markup = 1 + randomInt(0, 40) / 100
    const unitPrice = Math.round(product.price * markup * 100) / 100
    const saleDate = randomDateInLastYear()

    try {
      await saleController.registrar(product.id, { clientId: client.id }, quantity, unitPrice, saleDate)
      registradas++
    } catch {
      // produto ficou sem estoque suficiente nessa rodada aleatória — só pula
      ignoradas++
    }

    if ((i + 1) % 50 === 0) console.log(`  ... ${i + 1}/${SALES_COUNT}`)
  }

  console.log(`Concluído: ${registradas} vendas registradas, ${ignoradas} ignoradas (estoque insuficiente).`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
