
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { hashPassword } from "../services/authService.js";
import { registerSchema } from "../validators/authValidators.js";

const adminAccounts = [
  {
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  {
    name: process.env.ADMIN2_NAME,
    email: process.env.ADMIN2_EMAIL,
    password: process.env.ADMIN2_PASSWORD,
  },
];

async function createAdmin({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error(`Missing details for admin: ${email || "Unknown"}`);
  }

  const parsed = registerSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    throw new Error(
      `Invalid details for ${email}: ${parsed.error.issues.map(
        issue => issue.message
      ).join(", ")}`
    );
  }

  const admin = parsed.data;
  const existing = await User.findOne({ email: admin.email });

  if (existing?.role === "admin") {
    console.log(`Admin already exists: ${admin.email}. No changes made.`);
    return;
  }

  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`Existing account promoted to admin: ${admin.email}`);
    return;
  }

  await User.create({
    name: admin.name,
    email: admin.email,
    passwordHash: await hashPassword(admin.password),
    role: "admin",
  });

  console.log(`Admin created: ${admin.email}`);
}

try {
  await connectDB();
  await User.init();

  for (const account of adminAccounts) {
    await createAdmin(account);
  }

  console.log("Admin seeding completed successfully.");
} catch (error) {
  console.error("Admin seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
