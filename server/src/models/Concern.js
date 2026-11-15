import mongoose from 'mongoose';

// A dental concern is an educational topic (for example a condition or a care question).
// Every text field is typed in by the admin from a reliable source.
// Nothing is generated or assumed by the application.
const concernSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Concern name is required'],
      trim: true,
      minlength: [2, 'Concern name must be at least 2 characters'],
      maxlength: [100, 'Concern name must be at most 100 characters'],
    },
    // Created from the name once and never changed, so shared links keep working
    slug: { type: String, required: true, unique: true, lowercase: true },
    // One or two sentences shown on the concern cards
    summary: { type: String, trim: true, maxlength: 300, default: '' },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    precautions: { type: [String], default: [] },
    whenToSeeDentist: { type: String, trim: true, maxlength: 1500, default: '' },
    // Where the admin got the information (e.g. a dental association page or a dentist's advice)
    sourceNote: { type: String, trim: true, maxlength: 500, default: '' },
    // Hidden concerns do not appear on the public site
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Concern', concernSchema);