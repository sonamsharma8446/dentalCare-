import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true, maxlength: 120, default: '' },
    city: { type: String, trim: true, maxlength: 60, default: '' },
    state: { type: String, trim: true, maxlength: 60, default: '' },
    pincode: { type: String, trim: true, maxlength: 6, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false means the hash is never loaded unless a query asks for it with .select('+passwordHash')
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '' },
    address: { type: addressSchema, default: () => ({}) },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    // Tokens issued before this moment are rejected (set when the password changes)
    passwordChangedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Never send the password hash in an API response, even if it was loaded by mistake
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
