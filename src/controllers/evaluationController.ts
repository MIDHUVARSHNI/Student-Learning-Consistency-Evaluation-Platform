import { Request, Response } from 'express'
import Evaluation from '../models/Evaluation'

export async function createEvaluation(req: Request, res: Response) {
  try {
    const evalDoc = await Evaluation.create(req.body)
    res.status(201).json(evalDoc)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getEvaluations(req: Request, res: Response) {
  try {
    const items = await Evaluation.find().limit(200)
    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function getEvaluation(req: Request, res: Response) {
  try {
    const { id } = req.params
    const item = await Evaluation.findById(id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json(item)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function updateEvaluation(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updated = await Evaluation.findByIdAndUpdate(id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: 'Not found' })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteEvaluation(req: Request, res: Response) {
  try {
    const { id } = req.params
    const del = await Evaluation.findByIdAndDelete(id)
    if (!del) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
