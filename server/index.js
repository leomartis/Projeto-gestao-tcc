import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import { createResourceRouter } from './routes/resource.js'

dotenv.config({ path: new URL('./.env', import.meta.url) })

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api', authRouter)
app.use('/api/agenda', createResourceRouter('agenda', ['titulo', 'data', 'hora', 'local', 'responsavel', 'tipo', 'status']))
app.use('/api/financeiro', createResourceRouter('financeiro', ['descricao', 'tipo', 'categoria', 'vencimento', 'valor', 'status']))
app.use('/api/pessoas', createResourceRouter('pessoas', ['nome', 'tipo', 'email', 'telefone', 'cidade', 'ativo']))
app.use('/api/estoque', createResourceRouter('estoque', ['referencia', 'cor', 'quantidade']))
app.use('/api/producao', createResourceRouter('producao', ['data', 'firma', 'discriminacao', 'nCorte', 'qtdEnviada', 'qtdRecebida', 'precoPeca']))

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`))
