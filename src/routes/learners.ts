import express from 'express'
import { getQuery, executeQuery } from '../db.ts'

const router = express.Router()

// Get all learners
router.get('/', (req, res) => {
  const learners = getQuery(`
    SELECT l.id, l.userId, u.name, u.email, l.enrollment, l.createdAt
    FROM learners l
    JOIN users u ON l.userId = u.id
  `)

  res.json(learners)
})

// Get learner by ID
router.get('/:id', (req, res) => {
  const learners = getQuery(`
    SELECT l.id, l.userId, u.name, u.email, l.enrollment, l.createdAt
    FROM learners l
    JOIN users u ON l.userId = u.id
    WHERE l.id = ?
  `, [req.params.id])

  const learner = learners[0]
  if (!learner) {
    return res.status(404).json({ error: 'Learner not found' })
  }

  res.json(learner)
})

// Create learner
router.post('/', (req, res) => {
  const { userId, enrollment } = req.body

  if (!userId || !enrollment) {
    return res.status(400).json({ error: 'userId and enrollment required' })
  }

  try {
    executeQuery(
      'INSERT INTO learners (userId, enrollment) VALUES (?, ?)',
      [userId, enrollment]
    )

    res.status(201).json({ userId, enrollment })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create learner' })
  }
})

// Update learner
router.put('/:id', (req, res) => {
  const { enrollment } = req.body

  executeQuery('UPDATE learners SET enrollment = ? WHERE id = ?', [enrollment, req.params.id])

  res.json({ id: req.params.id, enrollment })
})

// Delete learner
router.delete('/:id', (req, res) => {
  executeQuery('DELETE FROM learners WHERE id = ?', [req.params.id])

  res.json({ message: 'Learner deleted' })
})

export default router
