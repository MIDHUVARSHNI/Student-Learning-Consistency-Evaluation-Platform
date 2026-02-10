import express from 'express'
import { getQuery, executeQuery } from '../db.ts'

const router = express.Router()

// Get all evaluations
router.get('/', (req, res) => {
  const evaluations = getQuery('SELECT * FROM evaluations')
  res.json(evaluations)
})

// Get evaluation by ID
router.get('/:id', (req, res) => {
  const evaluations = getQuery('SELECT * FROM evaluations WHERE id = ?', [req.params.id])
  const evaluation = evaluations[0]

  if (!evaluation) {
    return res.status(404).json({ error: 'Evaluation not found' })
  }

  res.json(evaluation)
})

// Create evaluation
router.post('/', (req, res) => {
  const { learnerId, attendance, performance, participation, assignments } = req.body

  if (!learnerId) {
    return res.status(400).json({ error: 'learnerId required' })
  }

  const overallScore = (attendance + performance + participation + assignments) / 4

  try {
    executeQuery(`
      INSERT INTO evaluations (learnerId, attendance, performance, participation, assignments, overallScore)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [learnerId, attendance || 0, performance || 0, participation || 0, assignments || 0, overallScore])

    res.status(201).json({
      learnerId,
      attendance,
      performance,
      participation,
      assignments,
      overallScore
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create evaluation' })
  }
})

// Update evaluation
router.put('/:id', (req, res) => {
  const { attendance, performance, participation, assignments } = req.body

  const overallScore = (attendance + performance + participation + assignments) / 4

  executeQuery(`
    UPDATE evaluations
    SET attendance = ?, performance = ?, participation = ?, assignments = ?, overallScore = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [attendance || 0, performance || 0, participation || 0, assignments || 0, overallScore, req.params.id])

  res.json({ id: req.params.id, attendance, performance, participation, assignments, overallScore })
})

// Delete evaluation
router.delete('/:id', (req, res) => {
  executeQuery('DELETE FROM evaluations WHERE id = ?', [req.params.id])

  res.json({ message: 'Evaluation deleted' })
})

export default router
