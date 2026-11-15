import mongoose from 'mongoose';

// Articles and step-by-step care instructions. The admin writes (or copies from a reliable source) all the text.
const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [150, 'Title must be at most 150 characters'],
    },
    // Created from the title once and never changed, so shared links keep working
    slug: { type: String, required: true, unique: true, lowercase: true },
    // "article" for general reading, "instruction" for how-to / care instructions
    kind: { type: String, enum: ['article', 'instruction'], default: 'article', index: true },
    summary: { type: String, trim: true, maxlength: 300, default: '' },
    // Plain text. A blank line starts a new paragraph. No HTML is stored or shown as HTML.
    body: { type: String, trim: true, maxlength: 20000, default: '' },
    // Where the admin got the information (e.g. a dental association page or a dentist's advice)
    sourceNote: { type: String, trim: true, maxlength: 500, default: '' },
    // Hidden articles do not appear on the public site
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Article', articleSchema);