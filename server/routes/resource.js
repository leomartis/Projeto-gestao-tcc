import { Router } from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export function createResourceRouter(table, columns) {
  const router = Router()
  router.use(requireAuth)

  router.get('/', async (_req, res) => {
    const [rows] = await pool.query(`SELECT * FROM ${table}`)
    res.json(rows)
  })

  router.post('/', async (req, res) => {
    const values = columns.map(c => req.body[c])
    const placeholders = columns.map(() => '?').join(', ')
    const [result] = await pool.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    )
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId])
    res.status(201).json(rows[0])
  })

  router.put('/:id', async (req, res) => {
    const values = columns.map(c => req.body[c])
    const assignments = columns.map(c => `${c} = ?`).join(', ')
    await pool.query(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, req.params.id])
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Não encontrado' })
    res.json(rows[0])
  })

  router.delete('/:id', async (req, res) => {
    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id])
    res.status(204).end()
  })

  return router
}
