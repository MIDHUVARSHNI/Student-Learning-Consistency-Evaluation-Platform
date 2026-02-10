import mongoose from 'mongoose'

const { Schema, model } = mongoose

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['instructor', 'admin'], default: 'instructor' },
    firstName: { type: String },
    lastName: { type: String },
  },
  { timestamps: true }
)

export default model('User', userSchema)
