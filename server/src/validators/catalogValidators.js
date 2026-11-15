import { z } from 'zod';

// A string field with friendly messages for "missing" and "wrong type"
const str = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`),
  });

const optionalText = (label, max) =>
  str(label).trim().max(max, `${label} must be at most ${max} characters`).optional();

// An empty value says "required"; a non-empty but malformed one says "not valid"
const objectId = (label) =>
  str(label)
    .min(1, `${label} is required`)
    .regex(/^[a-f\d]{24}$/i, `${label} is not valid`);

// ---------- Categories ----------

export const categorySchema = z.object({
  name: str('Category name')
    .trim()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(60, 'Category name must be at most 60 characters'),
  description: optionalText('Description', 500),
});

// ---------- Products ----------

const price = z
  .number({
    error: (issue) => (issue.input === undefined ? 'Price is required' : 'Price must be a number'),
  })
  .min(0, 'Price cannot be negative')
  .max(10000000, 'Price is too large')
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, 'Price can have at most 2 decimal places');

const precautions = z
  .array(str('Precaution').trim().min(1, 'Precautions cannot be empty').max(300, 'Each precaution must be at most 300 characters'), {
    error: 'Precautions must be a list',
  })
  .max(20, 'You can add up to 20 precautions');

// Fields not listed here (for example "images" or "slug") are dropped
export const createProductSchema = z.object({
  name: str('Product name')
    .trim()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(120, 'Product name must be at most 120 characters'),
  category: objectId('Category'),
  price,
  brand: optionalText('Brand', 80),
  description: optionalText('Description', 3000),
  usageInstructions: optionalText('Usage instructions', 3000),
  precautions: precautions.optional(),
  ingredients: optionalText('Ingredients', 2000),
  sourceNote: optionalText('Source note', 500),
  inStock: z.boolean({ error: 'inStock must be true or false' }).optional(),
  isActive: z.boolean({ error: 'isActive must be true or false' }).optional(),
});

// For updates every field is optional, but at least one must be sent
export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Send at least one field to update' });

// ---------- Query strings (always arrive as text, so numbers use z.coerce) ----------

const page = z.coerce.number().int().min(1).default(1);

export const publicProductQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search: z.string().trim().max(60).optional(),
  category: z.string().trim().max(80).optional(), // category slug
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(['true']).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
});

export const adminProductQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(60).optional(),
  category: z.string().regex(/^[a-f\d]{24}$/i, 'Category is not valid').optional(), // category id
  isActive: z.enum(['true', 'false']).optional(),
});