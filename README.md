RoomieAI (UCSC) – MVP

Tech Stack
- Frontend: React + Vite + TypeScript, TailwindCSS, React Router, Zustand, React Query
- Backend: Node.js + Express + TypeScript, Prisma (PostgreSQL)
- Auth: Firebase Authentication (UCSC emails only)
- Hosting: Vercel (web), Render/Railway (API + Postgres)

Monorepo
```
apps/
  api/  (Express API + Prisma)
  web/  (Vite React client)
```

Environment Variables
Create .env (root or per service) from .env.example:

```ini
# API
API_PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public

# Firebase
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_APP_ID=...
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App
ALLOWED_EMAIL_DOMAIN=ucsc.edu
JWT_SECRET=change_me
WEB_ORIGIN=http://localhost:5173
API_BASE_URL=http://localhost:4000

# Web (Vite prefixes)
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Setup
```bash
npm i -g pnpm
pnpm install
cd apps/api && pnpm prisma migrate dev && pnpm prisma db seed
```

Dev
```bash
pnpm --filter api dev
pnpm --filter web dev
```

Build
```bash
pnpm --filter api build
pnpm --filter web build
```

Testing
```bash
pnpm --filter api test
pnpm --filter web test
```

API Endpoints (base /api/v1)
- POST /auth/session – exchange Firebase ID token; enforces @ucsc.edu
- GET/PUT /me, GET/PUT /me/profile
- GET /users/:id
- GET /matches/recommendations?limit=10
- POST /matches/recompute (admin)
- GET/POST /threads, GET/POST /threads/:id/messages
- GET /admin/metrics/overview, GET /admin/reports/compatibility

Matching Algorithm
- Dealbreakers (smoking/pets)
- Lifestyle (40%), Personality (40%), Extras (20%: year proximity, major similarity)
- Returns score 0–100 + per-criterion breakdown

Seeding
- 500 UCSC users with varied profiles
- A few strong matches
- 20 message threads

Deployment
API (Render/Railway)
- Set env vars above
- Build command: pnpm --filter api build
- Start command: node apps/api/dist/index.js
- Health check: GET /health

DB
- Create managed Postgres, set DATABASE_URL

Web (Vercel)
- Framework: Vite
- Env: VITE_* vars + VITE_API_BASE_URL to API origin

Security
- Firebase token verified server-side; restrict domain
- No public emails
- Basic rate limiting on messaging
- CORS restricted to WEB_ORIGIN

Loom-style Demo Script
1) Sign up with you@ucsc.edu, finish onboarding (3 steps)
2) Dashboard: show Top Matches (scores)
3) Open a profile, show lifestyle/personality breakdown
4) Start a message, send a few messages; refresh to show persistence
5) Admin page: show metrics cards and distribution chart

Troubleshooting
- Firebase PRIVATE_KEY must have \n newlines escaped
- If Prisma complains, ensure DATABASE_URL and Postgres reachable
- CORS errors: set WEB_ORIGIN to frontend URL

