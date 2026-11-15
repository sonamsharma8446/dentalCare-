import { z } from 'zod';

const str = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`),
  });

const optionalText = (label, max) =>
  str(label).trim().max(max, `${label} must be at most ${max} characters`).optional();

// A number that may arrive as text from a form. Empty text means "not set".
const coordinate = (label, min, max) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null) return null;
      if (typeof value === 'string') return value.trim() === '' ? null : Number(value);
      return value;
    },
    z
      .number({ error: `${label} must be a number` })
      .min(min, `${label} must be between ${min} and ${max}`)
      .max(max, `${label} must be between ${min} and ${max}`)
      .nullable()
      .optional()
  );

const atLeastOne = { message: 'Send at least one field to update' };

// Latitude and longitude go together. (When updating, the service re-checks against the saved shop.)
const bothOrNeither = (data) => {
  if (data.latitude === undefined && data.longitude === undefined) return true;
  return (data.latitude == null) === (data.longitude == null);
};
const bothOrNeitherMessage = { message: 'Enter both latitude and longitude, or leave both empty', path: ['latitude'] };

const shopFields = {
  name: str('Shop name')
    .trim()
    .min(1, 'Shop name is required')
    .min(2, 'Shop name must be at least 2 characters')
    .max(120, 'Shop name must be at most 120 characters'),
  address: str('Address')
    .trim()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(250, 'Address must be at most 250 characters'),
  city: str('City')
    .trim()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(80, 'City must be at most 80 characters'),
  state: optionalText('State', 80),
  pincode: str('PIN code')
    .trim()
    .refine((v) => v === '' || /^\d{6}$/.test(v), 'PIN code must be 6 digits')
    .optional(),
  phone: str('Phone number')
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+?\(?[0-9][0-9\s\-()]{5,18}$/, 'Enter a valid phone number, for example 0120 4567890 or +91 98765 43210'),
  openingHours: optionalText('Opening hours', 200),
  latitude: coordinate('Latitude', -90, 90),
  longitude: coordinate('Longitude', -180, 180),
  isActive: z.boolean({ error: 'isActive must be true or false' }).optional(),
};

export const createShopSchema = z.object(shopFields).refine(bothOrNeither, bothOrNeitherMessage);

export const updateShopSchema = z
  .object(shopFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, atLeastOne)
  .refine(bothOrNeither, bothOrNeitherMessage);

// ---------- Query strings (always text) ----------

const page = z.coerce.number().int().min(1).default(1);
const search = z.string().trim().max(60).optional();
const city = z.string().trim().max(80).optional();

// Empty text means "not given" (z.coerce alone would turn "" into 0)
const queryNumber = (min, max) =>
  z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().min(min).max(max).optional());

export const publicShopQuerySchema = z
  .object({
    page,
    limit: z.coerce.number().int().min(1).max(48).default(12),
    search,
    city,
    lat: queryNumber(-90, 90),
    lng: queryNumber(-180, 180),
    radiusKm: queryNumber(0.1, 500),
  })
  .refine((q) => (q.lat === undefined) === (q.lng === undefined), {
    message: 'Send both lat and lng, or neither',
    path: ['lat'],
  });

export const adminShopQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search,
  city,
  isActive: z.enum(['true', 'false']).optional(),
});