import { registerUser, loginUser } from '../services/authService.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';

// POST /api/v1/auth/register
export async function register(req, res) {
  const user = await registerUser(req.body);
  setAuthCookie(res, user._id);
  res.status(201).json({ success: true, user });
}

// POST /api/v1/auth/login
export async function login(req, res) {
  const user = await loginUser(req.body);
  setAuthCookie(res, user._id);
  res.json({ success: true, user });
}

// POST /api/v1/auth/logout
export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
}

// GET /api/v1/auth/me: who is logged in right now?
export function me(req, res) {
  res.json({ success: true, user: req.user });
}
