import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { asyncHandler } from '../middleware/asyncHandler.ts'
import { Router } from 'express'
import pool from '../db.ts'
import { requireAuth } from '../middleware/auth.ts'

export function createResourceRouter(table: string, columns: string[]) {
  const router = Router()
  router.use(requireAuth)

  router.get('/', asyncHandler(async (_req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${table}`)
    res.json(rows)
  }))

  router.post('/', asyncHandler(async (req, res) => {
    const values = columns.map(c => req.body[c])
    const placeholders = columns.map(() => '?').join(', ')
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    )
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId])
    res.status(201).json(rows[0])
  }))

  router.put('/:id', asyncHandler(async (req, res) => {
    const values = columns.map(c => req.body[c])
    const assignments = columns.map(c => `${c} = ?`).join(', ')
    await pool.query(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, req.params.id])
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Não encontrado' })
    res.json(rows[0])
  }))

  router.delete('/:id', asyncHandler(async (req, res) => {
    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id])
    res.status(204).end()
  }))

  return router
}
