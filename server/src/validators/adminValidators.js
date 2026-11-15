import { z } from 'zod';

export const updateUserSchema = z
  .object({
    isActive: z.boolean({ error: 'isActive must be true or false' }).optional(),
    role: z.enum(['user', 'admin'], { error: 'Role must be user or admin' }).optional(),
  })
  .refine((data) => data.isActive !== undefined || data.role !== undefined, {
    message: 'Provide isActive or role',
  });

// Query strings are always text, so numbers are converted with z.coerce
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(60).optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});
