import { Request, Response } from 'express'
import Learner from '../models/Learner'

export async function createLearner(req: Request, res: Response) {
  try {
    const payload = req.body
    const learner = await Learner.create(payload)
    res.status(201).json(learner)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getLearners(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(200, Number(req.query.limit) || 20)
    const search = (req.query.search as string) || ''

    const filter: any = {}
    if (search) {
      const regex = new RegExp(search, 'i')
      filter.$or = [{ firstName: regex }, { lastName: regex }, { studentId: regex }, { email: regex }]
    }

    const total = await Learner.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    const learners = await Learner.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })

    res.json({ data: learners, page, totalPages, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getLearner(req: Request, res: Response) {
  try {
    const { id } = req.params
    const learner = await Learner.findById(id)
    if (!learner) return res.status(404).json({ message: 'Not found' })
    res.json(learner)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateLearner(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updated = await Learner.findByIdAndUpdate(id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteLearner(req: Request, res: Response) {
  try {
    const { id } = req.params
    const del = await Learner.findByIdAndDelete(id)
    if (!del) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
