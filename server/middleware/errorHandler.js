export function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error)

  console.error('Erro na API:', error.code || error.name)
  const databaseErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE']
  if (databaseErrors.includes(error.code)) {
    return res.status(503).json({ error: 'Banco de dados indisponível. Verifique o MySQL e a configuração do servidor.' })
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Dados da requisição inválidos.' })
  }
  res.status(500).json({ error: 'Não foi possível concluir a operação. Verifique o servidor.' })
}
