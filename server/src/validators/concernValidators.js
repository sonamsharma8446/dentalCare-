import { z } from 'zod';

// Same small helpers as catalogValidators.js: friendly messages for "missing" and "wrong type"
const str = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`),
  });

const optionalText = (label, max) =>
  str(label).trim().max(max, `${label} must be at most ${max} characters`).optional();

const precautions = z
  .array(str('Precaution').trim().min(1, 'Precautions cannot be empty').max(300, 'Each precaution must be at most 300 characters'), {
    error: 'Precautions must be a list',
  })
  .max(20, 'You can add up to 20 precautions');

// Fields not listed here (for example "slug") are dropped
export const createConcernSchema = z.object({
  name: str('Concern name')
    .trim()
    .min(1, 'Concern name is required')
    .min(2, 'Concern name must be at least 2 characters')
    .max(100, 'Concern name must be at most 100 characters'),
  summary: optionalText('Summary', 300),
  description: optionalText('Description', 5000),
  precautions: precautions.optional(),
  whenToSeeDentist: optionalText('When to see a dentist', 1500),
  sourceNote: optionalText('Source note', 500),
  isActive: z.boolean({ error: 'isActive must be true or false' }).optional(),
});

// For updates every field is optional, but at least one must be sent
export const updateConcernSchema = createConcernSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Send at least one field to update' });

// Body of POST /admin/concerns/:id/products
export const mapProductSchema = z.object({
  productId: str('Product')
    .min(1, 'Product is required')
    .regex(/^[a-f\d]{24}$/i, 'Product is not valid'),
});

// ---------- Query strings ----------

export const publicConcernQuerySchema = z.object({
  search: z.string().trim().max(60).optional(),
});

export const adminConcernQuerySchema = z.object({
  search: z.string().trim().max(60).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});