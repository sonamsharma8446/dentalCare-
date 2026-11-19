// Creates two admin accounts. Run with: npm run seed:admin
// Reads ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
// and ADMIN2_NAME, ADMIN2_EMAIL, ADMIN2_PASSWORD from server/.env.

import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import { hashPassword } from '../services/authService.js';
import { registerSchema } from '../validators/authValidators.js';

const adminAccounts = [
  {
    name: env.admin.name,
    email: env.admin.email,
    password: env.admin.password,
  },
  {
    name: env.admin2.name,
    email: env.admin2.email,
    password: env.admin2.password,
  },
];

async function createAdmin({ name, email, password }) {
  if (!email || !password) {
    console.error(`Missing credentials for admin: ${name || 'Unknown'}`);
    return;
  }

  const parsed = registerSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    console.error(`Invalid details for admin ${email}:`);
    parsed.error.issues.forEach((issue) =>
      console.error(` - ${issue.path.join('.')}: ${issue.message}`)
    );
    return;
  }

  const admin = parsed.data;
  const existing = await User.findOne({ email: admin.email });

  if (existing?.role === 'admin') {
    console.log(`Admin already exists: ${admin.email} (nothing changed)`);
    return;
  }

  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Existing account ${admin.email} was promoted to admin.`);
    return;
  }

  await User.create({
    name: admin.name,
    email: admin.email,
    passwordHash: await hashPassword(admin.password),
    role: 'admin',
  });

  console.log(`Admin created: ${admin.email}`);
}

try {
  await connectDB();
  await User.init();

  for (const account of adminAccounts) {
    await createAdmin(account);
  }

  console.log('Admin seeding process completed.');
} catch (error) {
  console.error('Admin seeding failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
