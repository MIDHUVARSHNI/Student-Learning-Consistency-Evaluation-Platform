import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'student-platform.db')
let db: any

export async function initDb() {
  const SQL = await initSqlJs()

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  return db
}

function saveDb() {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

export function getDb() {
  return db
}

export function executeQuery(sql: string, params: any[] = []) {
  try {
    db.run(sql, params)
    saveDb()
    return { success: true }
  } catch (err) {
    console.error('Query error:', err)
    return { success: false, error: err }
  }
}

export function getQuery(sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql)
    stmt.bind(params)
    const results = []
    while (stmt.step()) {
      results.push(stmt.getAsObject())
    }
    stmt.free()
    return results
  } catch (err) {
    console.error('Query error:', err)
    return []
  }
}

export async function initializeDatabase() {
  await initDb()

  // Users table
  executeQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Learners table
  executeQuery(`
    CREATE TABLE IF NOT EXISTS learners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER UNIQUE NOT NULL,
      enrollment TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `)

  // Evaluations table
  executeQuery(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learnerId INTEGER NOT NULL,
      attendance REAL,
      performance REAL,
      participation REAL,
      assignments REAL,
      overallScore REAL,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(learnerId) REFERENCES learners(id)
    )
  `)

  console.log('✓ Database initialized')
}
