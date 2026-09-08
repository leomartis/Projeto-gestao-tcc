import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config({ path: new URL('./.env', import.meta.url) })

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestao_jeans',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  decimalNumbers: true,
  typeCast: (field, next) => {
    if (field.type === 'TINY' && field.length === 1) return field.string() === '1'
    return next()
  },
})

export default pool
