import * as userService from '../services/userService.js';
import { parse } from '../middleware/validate.js';
import { listUsersQuerySchema } from '../validators/adminValidators.js';

// GET /api/v1/admin/users?page=1&limit=10&search=ravi&role=user&isActive=true
export async function listUsers(req, res) {
  const query = parse(listUsersQuerySchema, req.query);
  const { users, pagination } = await userService.listUsers(query);
  res.json({ success: true, users, pagination });
}

// PUT /api/v1/admin/users/:id   body: { isActive?, role? }
export async function updateUser(req, res) {
  const user = await userService.updateUserByAdmin(req.user._id, req.params.id, req.body);
  res.json({ success: true, user });
}
