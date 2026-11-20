import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'token';

// The token lives in an httpOnly cookie, so JavaScript in the browser can never read it (protects against XSS).
// sameSite 'lax' stops other websites from making the browser send it on cross-site POST/PUT requests.
// Note: if you ever host the frontend and API on different domains, this needs sameSite 'none' + secure.
const baseCookieOptions = {
  httpOnly: true,
  secure:true,
  sameSite: 'none',
};

export function signToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: `${env.jwtExpiresDays}d`,
  });
}

export function verifyToken(token) {
  // Pinning the algorithm prevents "alg: none" and algorithm-swapping tricks
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
}

export function setAuthCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), {
    ...baseCookieOptions,
    maxAge: env.jwtExpiresDays * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, baseCookieOptions);
}
