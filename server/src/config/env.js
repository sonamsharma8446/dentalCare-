import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Variables the server cannot run without
const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.');
  console.error('Generate one with:');
  console.error(`  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`);
  process.exit(1);
}

// One place to read configuration from, so the rest of the code never touches process.env
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresDays: Number(process.env.JWT_EXPIRES_DAYS) || 7,

  // Failed login/register attempts allowed per IP address every 15 minutes
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 10,

  // Contact-form messages allowed per IP address every hour (stops spam floods)
  enquiryRateLimit: Number(process.env.ENQUIRY_RATE_LIMIT) || 10,

  // Product images are stored on Cloudinary. The app runs without these,
  // but uploading images is disabled until all three are set.
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Only used by the seed script (npm run seed:admin)
  admin: {
    name: process.env.ADMIN_NAME || 'Administrator',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
};

env.cloudinary.isConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);