import mongoose from 'mongoose';

// A message sent through the Contact page. Visitors (logged in or not) can send one.
const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    // Set when the visitor came from a product page ("Ask about this product")
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    // The product's name at the time, so the enquiry still makes sense if the product is later deleted
    productName: { type: String, trim: true, maxlength: 120, default: '' },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new', index: true },
    // Private note for the admin team. Never shown to the visitor.
    adminNote: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Enquiry', enquirySchema);