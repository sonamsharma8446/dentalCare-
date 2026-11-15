import { z } from 'zod';
import { extractYouTubeId } from '../utils/youtube.js';

// Same small helpers as catalogValidators.js: friendly messages for "missing" and "wrong type"
const str = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`),
  });

const optionalText = (label, max) =>
  str(label).trim().max(max, `${label} must be at most ${max} characters`).optional();

const objectId = (label) =>
  str(label)
    .min(1, `${label} is required`)
    .regex(/^[a-f\d]{24}$/i, `${label} is not valid`);

const atLeastOne = { message: 'Send at least one field to update' };

// ---------- Video categories ----------

export const videoCategorySchema = z.object({
  name: str('Category name')
    .trim()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(60, 'Category name must be at most 60 characters'),
  description: optionalText('Description', 500),
});

// ---------- Videos ----------

const youtubeUrl = str('YouTube link')
  .trim()
  .min(1, 'YouTube link is required')
  .refine((value) => extractYouTubeId(value) !== null, 'Enter a valid YouTube video link, for example https://www.youtube.com/watch?v=...');

// Fields not listed here (for example "slug" or "youtubeId") are dropped
export const createVideoSchema = z.object({
  title: str('Title')
    .trim()
    .min(1, 'Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title must be at most 150 characters'),
  youtubeUrl,
  category: objectId('Category'),
  description: optionalText('Description', 3000),
  credit: optionalText('Credit', 200),
  isActive: z.boolean({ error: 'isActive must be true or false' }).optional(),
});

export const updateVideoSchema = createVideoSchema.partial().refine((data) => Object.keys(data).length > 0, atLeastOne);

// ---------- Articles ----------

export const createArticleSchema = z.object({
  title: str('Title')
    .trim()
    .min(1, 'Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title must be at most 150 characters'),
  kind: z.enum(['article', 'instruction'], { error: 'Type must be "article" or "instruction"' }).optional(),
  summary: optionalText('Summary', 300),
  body: optionalText('Text', 20000),
  sourceNote: optionalText('Source note', 500),
  isActive: z.boolean({ error: 'isActive must be true or false' }).optional(),
});

export const updateArticleSchema = createArticleSchema.partial().refine((data) => Object.keys(data).length > 0, atLeastOne);

// ---------- Query strings (always arrive as text, so numbers use z.coerce) ----------

const page = z.coerce.number().int().min(1).default(1);
const search = z.string().trim().max(60).optional();

export const publicVideoQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search,
  category: z.string().trim().max(80).optional(), // video category slug
});

export const adminVideoQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search,
  category: z.string().regex(/^[a-f\d]{24}$/i, 'Category is not valid').optional(), // category id
  isActive: z.enum(['true', 'false']).optional(),
});

export const publicArticleQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search,
  kind: z.enum(['article', 'instruction']).optional(),
});

export const adminArticleQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search,
  kind: z.enum(['article', 'instruction']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});