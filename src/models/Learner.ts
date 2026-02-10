import mongoose from 'mongoose'

const { Schema, model } = mongoose

const learnerSchema = new Schema(
  {
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true },
    enrollmentDate: { type: Date, default: Date.now },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default model('Learner', learnerSchema)
