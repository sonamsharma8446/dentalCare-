import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }, // Cloudinary's id, needed to delete the image later
});

// Every text field below is typed in by the admin from the product's own packaging or label.
// Nothing is generated or assumed by the application.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [120, 'Product name must be at most 120 characters'],
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, trim: true, maxlength: 80, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] }, // in rupees
    description: { type: String, trim: true, maxlength: 3000, default: '' },
    usageInstructions: { type: String, trim: true, maxlength: 3000, default: '' },
    precautions: { type: [String], default: [] },
  
    // Where the admin got the information (e.g. "Printed on the pack" or the manufacturer's page)
    sourceNote: { type: String, trim: true, maxlength: 500, default: '' },
    images: { type: [imageSchema], default: [] },
    // Dental concerns this product is linked to. Managed from the admin Concerns screen (not the product form).
    concerns: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concern' }], default: [], index: true },
    inStock: { type: Boolean, default: true },
    // Hidden products do not appear on the public site
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);