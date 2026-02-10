import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  const token = auth.split(' ')[1]
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'Unauthorized' })
    // @ts-ignore
    req.user = { id: user._id, role: user.role, email: user.email }
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ message: 'Invalid token' })
  }
}
