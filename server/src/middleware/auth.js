import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';

// Use on any route that needs a logged-in user. Puts the user on req.user.
export async function protect(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Please log in to continue');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'Your session is no longer valid. Please log in again');
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated');

  // Reject tokens issued before the last password change
  if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw new ApiError(401, 'Your password was changed. Please log in again');
  }

  req.user = user;
  next();
}

// Use after protect: router.use(protect, authorize('admin'))
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to do this');
    }
    next();
  };
