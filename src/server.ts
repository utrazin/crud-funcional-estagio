import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import productRoutes from './routes/products'

const app = express()
const PORT = process.env.PORT || 3001

// Configure CORS to restrict to specific origins
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/products', productRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Backend-initial rodando na porta ${PORT}`)
})
