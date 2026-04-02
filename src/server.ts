import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import productRoutes from './routes/products'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/products', productRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Backend-initial rodando na porta ${PORT}`)
})
