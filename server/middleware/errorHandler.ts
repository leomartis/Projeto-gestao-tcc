import type { Request, Response, NextFunction } from 'express'

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(error)

  const detail = error instanceof Error ? error : new Error('Erro desconhecido')
  const code = 'code' in detail && typeof detail.code === 'string' ? detail.code : ''
  console.error('Erro na API:', code || detail.name)
  const databaseErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE']
  if (databaseErrors.includes(code)) {
    return res.status(503).json({ error: 'Banco de dados indisponível. Verifique o MySQL e a configuração do servidor.' })
  }
  if ('type' in detail && detail.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Dados da requisição inválidos.' })
  }
  res.status(500).json({ error: 'Não foi possível concluir a operação. Verifique o servidor.' })
}
