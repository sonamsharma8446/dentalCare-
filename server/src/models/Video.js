import mongoose from 'mongoose';

// The video itself stays on YouTube. We only keep its id and the text the admin writes about it.
const videoSchema = new mongoose.Schema(
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
    // The 11-character YouTube id, for example "dQw4w9WgXcQ"
    youtubeId: { type: String, required: true, match: [/^[A-Za-z0-9_-]{11}$/, 'Not a valid YouTube video id'] },
    description: { type: String, trim: true, maxlength: 3000, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoCategory', required: true, index: true },
    // Who made the video, for example the channel name. Shown to visitors.
    credit: { type: String, trim: true, maxlength: 200, default: '' },
    // Hidden videos do not appear on the public site
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Video', videoSchema);