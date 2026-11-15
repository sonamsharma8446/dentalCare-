import mongoose from 'mongoose';

// A medical shop (pharmacy / dental supply shop). Every detail is entered by the admin.
const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      minlength: [2, 'Shop name must be at least 2 characters'],
      maxlength: [120, 'Shop name must be at most 120 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters'],
      maxlength: [250, 'Address must be at most 250 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [2, 'City must be at least 2 characters'],
      maxlength: [80, 'City must be at most 80 characters'],
      index: true,
    },
    state: { type: String, trim: true, maxlength: 80, default: '' },
    pincode: { type: String, trim: true, match: [/^\d{6}$/, 'PIN code must be 6 digits'], default: undefined },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: 20,
    },
    // Free text typed by the admin, for example "Mon-Sat 9am-9pm"
    openingHours: { type: String, trim: true, maxlength: 200, default: '' },
    // Map position. Both are set or both are empty.
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    // Hidden shops do not appear on the public site
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Shop', shopSchema);