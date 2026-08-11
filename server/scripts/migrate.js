import fs from 'node:fs'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config({ path: new URL('../.env', import.meta.url) })

const sql = fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8')

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
})

await connection.query(sql)
console.log('Schema aplicado com sucesso.')
await connection.end()
