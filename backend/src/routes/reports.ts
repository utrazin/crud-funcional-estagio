import { Router, Request, Response } from 'express'
import multer from 'multer'
import { ReportController, ReportFilters } from '../controllers/ReportController'

const router = Router()
const controller = new ReportController()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos CSV são aceitos'))
    }
  },
})

function parseIdList(value: unknown): string[] | undefined {
  if (!value || typeof value !== 'string') return undefined
  const ids = value.split(',').map((id) => id.trim()).filter(Boolean)
  return ids.length > 0 ? ids : undefined
}

function getFilters(req: Request): ReportFilters {
  return {
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    productIds: parseIdList(req.query.productIds),
    clientIds: parseIdList(req.query.clientIds),
  }
}

// Listar vendas filtradas
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const sales = await controller.listarVendas(getFilters(req))
    res.json(sales)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao listar vendas' })
  }
})

// Totais agregados (total de vendas + faturamento)
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const summary = await controller.agregados(getFilters(req))
    res.json(summary)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao calcular resumo' })
  }
})

// Exportar relatório em CSV
router.get('/sales/export', async (req: Request, res: Response) => {
  try {
    const { buffer, contentType, filename } = await controller.exportarVendas(getFilters(req))
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao exportar relatório' })
  }
})

// Baixar modelo de CSV para importação
router.get('/sales/import-template', (_req: Request, res: Response) => {
  const buffer = controller.gerarModeloImportacao()
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="modelo-importacao-vendas.csv"')
  res.send(buffer)
})

// Importar vendas de um CSV
router.post('/sales/import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }
    const result = await controller.importarVendas(req.file.buffer)
    res.json(result)
  } catch (err: any) {
    res.status(err.message?.includes('Apenas arquivos CSV') ? 400 : 500).json({ error: err.message || 'Erro ao importar vendas' })
  }
})

export default router
