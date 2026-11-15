# DentalCare Kit

A dental care product catalogue with educational content, built with React, Express and MongoDB.

**Current status: Phase 2 (authentication) complete.** Registration, login, logout, profile management, role-based access and the admin seed are working. Features arrive phase by phase.

## Tech stack

| Part | Tools |
|------|-------|
| Frontend (`client/`) | React 19, Vite, Tailwind CSS 4, React Router, Axios |
| Backend (`server/`) | Node.js, Express 5, Mongoose, Helmet, CORS, cookie-parser, bcryptjs, jsonwebtoken, zod, express-rate-limit |
| Database | MongoDB (local or Atlas) |

More packages (Multer, Cloudinary) are added in the phase that first needs them.

## Prerequisites

- **Node.js 20 or newer.** Check with `node -v`.
- **MongoDB**, either:
  - **Local:** install MongoDB Community Server and make sure it is running on port 27017, or
  - **Cloud (free):** create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), create a database user, allow your IP address under Network Access, and copy the connection string.

## Setup and run

Open **two terminals** from the project root.

**Terminal 1: backend**

```bash
cd server
npm install
cp .env.example .env        # Windows (cmd): copy .env.example .env
```

Now edit `server/.env`:

1. **`JWT_SECRET`** (required): generate one and paste it in. It signs login tokens, so keep it private.
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. **`MONGODB_URI`**: the default works for local MongoDB. For Atlas, paste your connection string.
3. **`ADMIN_EMAIL` and `ADMIN_PASSWORD`**: the login for your first admin (password needs 8+ characters with a letter and a number).

Then create the admin account and start the server:

```bash
npm run seed:admin          # prints "Admin created: ..." (safe to run again)
npm run dev
```

**Terminal 2: frontend**

```bash
cd client
npm install
npm run dev
```

The app is at http://localhost:5173 and the API at http://localhost:5000/api/v1.

## How to test the setup

### Quick check (browser)

1. Server terminal shows `MongoDB connected: ...` and `Server running ... http://localhost:5000`.
2. http://localhost:5000/api/v1/health returns `"status": "ok"` and `"database": "connected"`.
3. http://localhost:5173 shows the homepage and a green *Backend and database connected* badge (development only).
4. **Register** a new account. You land on the homepage and the navbar shows *Hi, <name>*, *Profile*, *Logout*.
5. Refresh the page. You stay logged in.
6. Open **Profile**, change your name and address, save. Change your password.
7. **Logout**, then try opening http://localhost:5173/profile. You are sent to the login page.
8. Log in as a regular user and open http://localhost:5173/admin. You see *Access denied*.
9. Log in with the admin email and password from `.env`. The navbar now shows *Admin* and `/admin` opens.
10. Narrow the window below 768px. The links collapse into a hamburger menu.

### Test the API directly (curl)

`-c`/`-b cookies.txt` store and send the login cookie, like a browser does.

```bash
# Register (creates the cookie)
curl -i -c cookies.txt -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Secret123"}'

# Who am I?
curl -b cookies.txt http://localhost:5000/api/v1/auth/me

# Update profile
curl -b cookies.txt -X PUT http://localhost:5000/api/v1/users/profile \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","address":{"city":"Amritsar"}}'

# Logout, then /me should return 401
curl -b cookies.txt -c cookies.txt -X POST http://localhost:5000/api/v1/auth/logout
curl -b cookies.txt http://localhost:5000/api/v1/auth/me

# Admin routes need an admin cookie (log in with the seeded admin)
curl -c admin.txt -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_ADMIN_PASSWORD"}'
curl -b admin.txt "http://localhost:5000/api/v1/admin/users?search=test"
```

On Windows PowerShell use `curl.exe` instead of `curl`, and put the JSON in a file (`-d "@body.json"`) to avoid quoting problems.

## API reference (`/api/v1`)

| Method and path | Access | Purpose |
|-----------------|--------|---------|
| `GET /health` | public | API and database status |
| `POST /auth/register` | public, rate limited | Create account, start session |
| `POST /auth/login` | public, rate limited | Log in |
| `POST /auth/logout` | public | End session |
| `GET /auth/me` | logged in | Current user |
| `PUT /users/profile` | logged in | Update name, phone, address |
| `PUT /users/password` | logged in | Change password (logs out other devices) |
| `GET /admin/users` | admin | List users. Query: `page`, `limit`, `search`, `role`, `isActive` |
| `PUT /admin/users/:id` | admin | Change a user's `isActive` or `role` |

Errors always look like `{ "success": false, "message": "...", "errors": { "field": "..." } }`. Status codes: 400 invalid input, 401 not logged in, 403 not allowed, 404 not found, 409 duplicate email, 429 too many attempts.

## How authentication works

- Passwords are hashed with bcrypt (12 rounds). Plain passwords are never stored or returned.
- On login or register the server sets an **httpOnly cookie** holding a signed JWT (valid 7 days by default). JavaScript in the browser cannot read it, which protects it from XSS theft. The frontend never handles the token.
- Every protected request re-checks the user in the database, so deactivating a user or changing a role takes effect immediately.
- Changing a password logs out every other device.
- Roles are `user` and `admin`. Public registration can only create `user`. Admins come from `npm run seed:admin` or are promoted by another admin.
- Login and register are limited to 10 failed attempts per IP every 15 minutes (`AUTH_RATE_LIMIT`).
- Login gives the same error for "unknown email" and "wrong password", so emails cannot be discovered.
- Frontend route guards (`ProtectedRoute`, `AdminRoute`, `GuestRoute`) only improve the experience. The server enforces access on every request.

### Things to know

- The cookie uses `SameSite=Lax`, which suits the dev proxy and hosting the site and API on the same domain. If you later deploy them on **different domains**, tell me and we will adjust the cookie settings.
- Behind a reverse proxy (Render, Heroku, Nginx), rate limiting needs `app.set('trust proxy', 1)`. We will add this in Phase 8 when we cover deployment.

## Troubleshooting

| Message | Fix |
|---------|-----|
| `Missing required environment variables: ...` | You have not created `server/.env`, or `JWT_SECRET` is empty. Copy `.env.example` and fill it in. |
| `JWT_SECRET must be at least 32 characters` | Generate one with the `node -e ...` command in the setup steps. |
| `Set ADMIN_EMAIL and ADMIN_PASSWORD` | Fill both in `server/.env` before running `npm run seed:admin`. |
| Cannot log in as admin | Run `npm run seed:admin` first. The password is the one in `.env` at the time of seeding. |
| `Too many attempts` (429) | Wait 15 minutes, or restart the server in development. |
| `MongoDB connection failed: ECONNREFUSED` | MongoDB is not running (local), or the connection string is wrong. |
| `MongoDB connection failed: ... whitelist` / timeout | Atlas is blocking your IP. Add it under Network Access. |
| Badge says *Backend unreachable* | The server is not running on port 5000. Start it in Terminal 1. |
| `EADDRINUSE` | Port 5000 is in use. Change `PORT` in `server/.env` **and** the proxy `target` in `client/vite.config.js`. |

## Project structure

```
dentalcare-kit/
├── client/                      React + Vite frontend
│   ├── index.html
│   ├── vite.config.js           Tailwind plugin + /api proxy to the server
│   └── src/
│       ├── api/                 axios instance + one module per resource
│       ├── components/
│       │   ├── common/          shared UI (FormField, Alert, Loader, ...)
│       │   ├── layout/          Navbar, Footer, Layout
│       │   ├── product/         (later)
│       │   └── forms/           (later)
│       ├── context/             AuthContext (cart / wishlist later)
│       ├── hooks/               useAuth
│       ├── pages/
│       │   ├── public/          Home, Login, Register, NotFound, Forbidden
│       │   ├── user/            Profile
│       │   └── admin/           (later)
│       ├── routes/              ProtectedRoute, AdminRoute, GuestRoute
│       ├── utils/
│       ├── App.jsx              route table
│       └── main.jsx
└── server/                      Express API
    ├── .env.example
    └── src/
        ├── config/              env.js (validated settings), db.js (MongoDB)
        ├── controllers/         request handlers
        ├── middleware/          auth (protect, authorize), validate, rateLimit, errorHandler
        ├── models/              User (more in Phase 3+)
        ├── routes/              URL to controller mapping
        ├── services/            authService, userService
        ├── validators/          zod schemas for request bodies and queries
        ├── utils/               ApiError, token (JWT + cookie helpers)
        ├── seed/                createAdmin.js (npm run seed:admin)
        ├── app.js               Express setup (no listening)
        └── server.js            connects to MongoDB, then listens
```

### Conventions to follow

- **Request flow:** `route -> controller -> service -> model`. Routes only map URLs, controllers handle `req`/`res`, services hold business logic.
- **Validation:** define a zod schema in `validators/`, then use `validateBody(schema)` on the route. Unknown fields are dropped automatically.
- **Protecting routes:** `router.use(protect)` for logged-in users, `router.use(protect, authorize('admin'))` for admins.
- **Errors:** `throw new ApiError(404, 'Product not found')` anywhere. Express 5 catches errors from async handlers automatically, so no try/catch wrapper is needed. All errors return `{ success: false, message }`.
- **Config:** read settings from `env` in `server/src/config/env.js`, never from `process.env` directly.
- **API calls from React:** go through `client/src/api/`, never call axios directly in components.

## Roadmap

- [x] **Phase 1:** Foundation
- [x] **Phase 2:** Auth (register, login, logout, profile, roles, admin seed)
- [ ] Phase 3: Catalogue backend and admin CRUD (categories, concerns, products, images, videos)
- [ ] Phase 4: Public UI (homepage, catalogue, product detail, concern pages)
- [ ] Phase 5: Wishlist and cart
- [ ] Phase 6: Orders and enquiries
- [ ] Phase 7: Admin panel UI
- [ ] Phase 8: Hardening and content
