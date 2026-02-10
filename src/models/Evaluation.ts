import mongoose from 'mongoose'

const { Schema, model } = mongoose

const evaluationSchema = new Schema(
  {
    learnerId: { type: Schema.Types.ObjectId, ref: 'Learner', required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evaluationDate: { type: Date, default: Date.now },
    subject: { type: String },
    evaluationType: { type: String },
    performanceScore: { type: Number, required: true },
    attendanceStatus: { type: String },
    participationLevel: { type: String },
    qualitativeComments: { type: String },
  },
  { timestamps: true }
)

export default model('Evaluation', evaluationSchema)
