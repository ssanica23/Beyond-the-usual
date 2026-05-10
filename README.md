# Beyond the usual

A cozy, journal-style personal blog about university life. Single-admin posting,
public read-only browsing, polaroid-styled cards.

**Stack:** React (CRA + Tailwind) · FastAPI · MongoDB · JWT (Bearer) auth.

## Quick start (local)

```bash
# 1. backend
cd backend
cp .env.example .env             # edit MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# 2. frontend (new terminal)
cd frontend
cp .env.example .env             # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```

Then visit http://localhost:3000 and sign in at `/admin/login` with the
credentials you set in `backend/.env`.

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for a step-by-step guide to hosting on
Vercel + Railway + MongoDB Atlas (all free tiers) so you can run this site
without an Emergent subscription.

## Project layout

```
backend/
  server.py          # FastAPI app, all routes, auth, admin seeding
  requirements.txt
  .env.example
  Procfile           # for Railway/Render

frontend/
  src/
    pages/           # Home, Blog, Post, About, admin/(Login, Dashboard, Editor)
    components/      # Layout, PolaroidCard, ProtectedRoute, ui/ (shadcn)
    context/         # AuthContext
    lib/api.js       # axios + token helpers
  .env.example

DEPLOYMENT.md        # full self-hosting walkthrough
```

## Admin credentials

Set in `backend/.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). The admin user is
auto-seeded on first startup and updated whenever you change those env vars.
