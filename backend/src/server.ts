import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import saleRoutes from './routes/sales'
import clientRoutes from './routes/clients'
import reportRoutes from './routes/reports'
import { requireAuth } from './middleware/requireAuth'

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/products', requireAuth, productRoutes)
app.use('/sales', requireAuth, saleRoutes)
app.use('/clients', requireAuth, clientRoutes)
app.use('/reports', requireAuth, reportRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
