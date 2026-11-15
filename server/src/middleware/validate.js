import ApiError from '../utils/ApiError.js';

// Checks data against a zod schema. Returns the cleaned data (trimmed, unknown fields removed)
// or throws a 400 error that lists what was wrong, per field.
export function parse(schema, data) {
  const result = schema.safeParse(data ?? {});

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || 'form';
      if (!errors[field]) errors[field] = issue.message; // keep the first message per field
    }
    throw new ApiError(400, Object.values(errors)[0], errors);
  }

  return result.data;
}

// Route middleware: router.post('/register', validateBody(registerSchema), register)
export const validateBody = (schema) => (req, res, next) => {
  req.body = parse(schema, req.body);
  next();
};
