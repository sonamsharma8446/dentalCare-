import { z } from 'zod';

// A string field with friendly messages for "missing" and "wrong type"
const str = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`),
  });

const name = str('Name')
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(60, 'Name must be at most 60 characters');

const email = str('Email')
  .trim()
  .min(1, 'Email is required')
  .toLowerCase()
  .pipe(z.email('Enter a valid email address'));

// bcrypt only uses the first 72 bytes, so longer passwords are rejected rather than silently cut
const password = str('Password')
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Empty string is allowed so a user can clear the field
const phone = str('Phone')
  .trim()
  .refine((v) => v === '' || /^\+?[0-9]{10,15}$/.test(v), 'Enter a valid phone number (10 to 15 digits)');

const addressSchema = z
  .object({
    line1: str('Address').trim().max(120, 'Address must be at most 120 characters'),
    city: str('City').trim().max(60, 'City must be at most 60 characters'),
    state: str('State').trim().max(60, 'State must be at most 60 characters'),
    pincode: str('Pincode')
      .trim()
      .refine((v) => v === '' || /^[0-9]{6}$/.test(v), 'Pincode must be 6 digits'),
  })
  .partial();

// Fields not listed here (for example "role") are dropped, so users cannot make themselves admin
export const registerSchema = z.object({
  name,
  email,
  password,
  phone: phone.optional(),
});

export const loginSchema = z.object({
  email,
  password: str('Password').min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: name.optional(),
  phone: phone.optional(),
  address: addressSchema.optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: str('Current password').min(1, 'Current password is required'),
    newPassword: password,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });
