import * as userService from '../services/userService.js';
import { setAuthCookie } from '../utils/token.js';

// PUT /api/v1/users/profile
export async function updateProfile(req, res) {
  const user = await userService.updateProfile(req.user, req.body);
  res.json({ success: true, user });
}

// PUT /api/v1/users/password
export async function changePassword(req, res) {
  const user = await userService.changePassword(req.user._id, req.body);
  // The old cookie stops working after a password change, so give this browser a fresh one
  setAuthCookie(res, user._id);
  res.json({ success: true, message: 'Password updated' });
}
