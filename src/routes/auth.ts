import express from 'express'
import { getQuery, executeQuery } from '../db.ts'

const router = express.Router()

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  const users = getQuery('SELECT * FROM users WHERE email = ?', [email])
  const user = users[0]

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  })
})

// Register
router.post('/register', (req, res) => {
  const { email, name, password, role = 'student' } = req.body

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and password required' })
  }

  try {
    executeQuery(
      'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)',
      [email, name, password, role]
    )

    const users = getQuery('SELECT * FROM users WHERE email = ?', [email])
    const user = users[0]

    res.status(201).json({
      user: {
        id: user.id,
        email,
        name,
        role
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

export default router
