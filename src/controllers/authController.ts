import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function register(req: Request, res: Response) {
  const { username, email, password, firstName, lastName } = req.body
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) return res.status(400).json({ message: 'User already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashed, firstName, lastName })
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: { id: user._id, email: user.email, username: user.username }, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, username: user.username } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function me(req: Request, res: Response) {
  // user added by auth middleware
  // @ts-ignore
  const user = req.user
  if (!user) return res.status(401).json({ message: 'Unauthorized' })
  res.json({ user })
}
