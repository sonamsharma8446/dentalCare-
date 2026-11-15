// Creates the first admin account. Run with:  npm run seed:admin
// Reads ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from server/.env. Safe to run more than once.
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { hashPassword } from '../services/authService.js';
import { registerSchema } from '../validators/authValidators.js';

const { name, email, password } = env.admin;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env, then run this again.');
  process.exit(1);
}

// Reuse the same rules as public registration (valid email, strong enough password)
const parsed = registerSchema.safeParse({ name, email, password });
if (!parsed.success) {
  console.error('Admin details are not valid:');
  parsed.error.issues.forEach((issue) => console.error(` - ${issue.path.join('.')}: ${issue.message}`));
  process.exit(1);
}

await connectDB();
await User.init(); // make sure the unique email index exists

const admin = parsed.data;
const existing = await User.findOne({ email: admin.email });

if (existing?.role === 'admin') {
  console.log(`Admin already exists: ${admin.email} (nothing changed)`);
} else if (existing) {
  existing.role = 'admin';
  await existing.save();
  console.log(`Existing account ${admin.email} was promoted to admin (its password was not changed)`);
} else {
  await User.create({
    name: admin.name,
    email: admin.email,
    passwordHash: await hashPassword(admin.password),
    role: 'admin',
  });
  console.log(`Admin created: ${admin.email}`);
}

await mongoose.disconnect();
