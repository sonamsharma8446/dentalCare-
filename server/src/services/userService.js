import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { hashPassword } from './authService.js';

// ---------- Logged-in user ----------

export async function updateProfile(user, { name, phone, address }) {
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;

  if (address) {
    // Only the address fields that were sent are changed
    for (const [field, value] of Object.entries(address)) {
      user.set(`address.${field}`, value);
    }
  }

  return user.save();
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash');

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(400, 'Current password is incorrect', {
      currentPassword: 'Current password is incorrect',
    });
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date(); // logs out every other device/session
  await user.save();
  return user;
}

// ---------- Admin ----------

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listUsers({ page, limit, search, role, isActive }) {
  const filter = {};
  if (role) filter.role = role;
  if (isActive) filter.isActive = isActive === 'true';
  if (search) {
    // Escaped so user input is treated as plain text, never as a regex pattern
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function updateUserByAdmin(adminId, targetId, { isActive, role }) {
  if (adminId.equals(targetId)) {
    throw new ApiError(400, 'You cannot change your own role or status');
  }

  const user = await User.findById(targetId);
  if (!user) throw new ApiError(404, 'User not found');

  if (isActive !== undefined) user.isActive = isActive;
  if (role !== undefined) user.role = role;
  return user.save();
}
