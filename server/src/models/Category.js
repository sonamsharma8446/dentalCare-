import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [60, 'Category name must be at most 60 characters'],
    },
    // Used in URLs, e.g. /products?category=toothpaste. Created from the name, never typed by hand.
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);