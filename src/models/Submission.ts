import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  data: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['complete', 'spam'], default: 'complete' },
  userAgent: String,
  ip: String,
}, { timestamps: true });

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
