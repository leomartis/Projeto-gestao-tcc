import bcrypt from 'bcryptjs'
import pool from '../db.js'

const email = 'gestao@email.com'
const senha = '123456'

const hash = await bcrypt.hash(senha, 10)

await pool.query(
  'INSERT INTO users (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
  [email, hash]
)

console.log(`Usuário seed criado/atualizado: ${email} / ${senha}`)
process.exit(0)
