import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const fieldSchema = new mongoose.Schema({
  id: String,
  type: String,
  label: String,
  placeholder: String,
  helpText: String,
  required: Boolean,
  options: [mongoose.Schema.Types.Mixed],
  validation: mongoose.Schema.Types.Mixed,
  conditionalLogic: mongoose.Schema.Types.Mixed,
  stripeConfig: mongoose.Schema.Types.Mixed,
  fileConfig: mongoose.Schema.Types.Mixed,
  ratingConfig: mongoose.Schema.Types.Mixed,
  sliderConfig: mongoose.Schema.Types.Mixed,
  matrixConfig: mongoose.Schema.Types.Mixed,
  calculatedConfig: mongoose.Schema.Types.Mixed,
  htmlConfig: mongoose.Schema.Types.Mixed,
}, { _id: false });

const stepSchema = new mongoose.Schema({
  id: String,
  title: String,
  fields: [fieldSchema],
}, { _id: false });

const formSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  uuid: { type: String, default: () => uuidv4(), unique: true },
  // NOTE: renamed from 'schema' to 'structure' to avoid collision with Mongoose internals
  structure: {
    steps: [stepSchema]
  },
  settings: {
    submitButtonText: { type: String, default: 'Submit' },
    successMessage: { type: String, default: 'Thank you! Your response has been recorded.' },
    redirectUrl: String,
    emailNotifications: mongoose.Schema.Types.Mixed,
    styling: mongoose.Schema.Types.Mixed,
    allowedDomains: [String],
    requireAuth: { type: Boolean, default: false },
    password: String,
    limitSubmissions: Number,
    startDate: Date,
    closeDate: Date,
    theme: { type: String, default: 'default' },
  },
  submissionCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Form = mongoose.models.Form || mongoose.model('Form', formSchema);

