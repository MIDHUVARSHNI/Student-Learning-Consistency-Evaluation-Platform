import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeDatabase } from './db.ts'
import authRoutes from './routes/auth.ts'
import learnerRoutes from './routes/learners.ts'
import evaluationRoutes from './routes/evaluations.ts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/learners', learnerRoutes)
app.use('/api/evaluations', evaluationRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
async function start() {
  await initializeDatabase()
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

start().catch((err) => console.error(err))
