import jwt from 'jsonwebtoken'
import type { RequestHandler } from 'express'

declare global {
  namespace Express {
    interface Request { userId?: number }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não configurado')
  return secret
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const payload = jwt.verify(token, getJwtSecret())
    if (typeof payload === 'string' || typeof payload.userId !== 'number') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
