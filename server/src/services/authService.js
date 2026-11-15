import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const SALT_ROUNDS = 12;

// Compared against when the email is unknown, so a login attempt takes about the same time
// whether or not the account exists (stops attackers discovering which emails are registered)
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

export const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

export async function registerUser({ name, email, password, phone }) {
  if (await User.exists({ email })) {
    throw new ApiError(409, 'An account with this email already exists', {
      email: 'An account with this email already exists',
    });
  }

  const passwordHash = await hashPassword(password);
  // role is never taken from the request: new accounts are always regular users
  return User.create({ name, email, passwordHash, phone });
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  const passwordMatches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !passwordMatches) {
    // Same message for "no such email" and "wrong password"
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
  }

  return user;
}
