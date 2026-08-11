import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos' })

  const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [email])
  const user = rows[0]
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

  const ok = await bcrypt.compare(senha, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { email: user.email } })
})

router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT email FROM users WHERE id = ?', [req.userId])
  const user = rows[0]
  if (!user) return res.status(401).json({ error: 'Não autenticado' })
  res.json({ user: { email: user.email } })
})

export default router
