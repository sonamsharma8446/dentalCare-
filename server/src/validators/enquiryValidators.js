import { z } from 'zod';

const str = (label) =>
  z.string({
    error: (issue) => (issue.input === undefined ? `${label} is required` : `${label} must be text`),
  });

// Sent by the public Contact form
export const createEnquirySchema = z.object({
  name: str('Name').trim().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(60, 'Name must be at most 60 characters'),
  email: str('Email').trim().min(1, 'Email is required').toLowerCase().pipe(z.email('Enter a valid email address')),
  phone: str('Phone')
    .trim()
    .refine((v) => v === '' || /^\+?\(?[0-9][0-9\s\-()]{5,18}$/.test(v), 'Enter a valid phone number, for example 98765 43210')
    .optional(),
  message: str('Message')
    .trim()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be at most 2000 characters'),
  // Optional: the product the question is about. Empty text means "none".
  product: str('Product')
    .trim()
    .refine((v) => v === '' || /^[a-f\d]{24}$/i.test(v), 'Product is not valid')
    .optional(),
  // Hidden "honeypot" field (named so browsers never autofill it). People never see it, so only spam bots fill it in.
  leaveBlank: z.string().max(200).optional(),
});

// Admin: change status and/or the private note
export const updateEnquirySchema = z
  .object({
    status: z.enum(['new', 'read', 'resolved'], { error: 'Status must be new, read or resolved' }).optional(),
    adminNote: str('Note').trim().max(1000, 'Note must be at most 1000 characters').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Send at least one field to update' });

export const adminEnquiryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(60).optional(),
  status: z.enum(['new', 'read', 'resolved']).optional(),
});