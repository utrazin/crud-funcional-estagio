import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import productRoutes from './routes/products'
import saleRoutes from './routes/sales'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/products', productRoutes)
app.use('/sales', saleRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
