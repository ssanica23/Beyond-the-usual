# Margins & memories — Product Requirements Document

## Original problem statement
> "build me a website with pages wherein i can post daily blogs about my university experience, a fun read with my regrets and my memories"

User clarification (Feb 10, 2026):
- Single admin authoring (just the user posts)
- Posts contain text + images
- Read-only for visitors (no comments, no likes)
- Cozy journal / handwritten visual feel

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui primitives. Bearer-token auth (localStorage).
- **Backend**: FastAPI + Motor (MongoDB). JWT (HS256) Bearer tokens. Bcrypt-hashed admin password. Admin auto-seeded on startup from `.env`.
- **DB**: Mongo collections — `users`, `posts`. Posts stored with UUID `id` and unique `slug`.

## Personas
- **The Author (admin)** — signs in, writes daily entries, attaches images, edits and deletes when needed.
- **The Reader** — anonymous visitor browsing the home page, journal index (filterable by tag), and individual entries.

## Core requirements (static)
1. Single-admin authentication via JWT Bearer token (no public signup).
2. Public CRUD-read on posts; admin-only create / update / delete.
3. Posts have: title, slug, excerpt, content (multi-paragraph plain text, separated by blank lines), tag (memories | regrets | fun), optional cover image (URL or uploaded file → base64 data URL).
4. Cozy journal UI: cream/sepia palette, terracotta accent, polaroid cards, washi tape, handwriting (Caveat) + serif (Cormorant Garamond) + body (Lora) + mono (Space Mono).
5. Pages: Home, Journal index (with tag filter), Single post, About, Admin login, Admin dashboard, Admin editor (new + edit).

## Implemented (Feb 10, 2026 — initial build)
- Backend endpoints: `/api/health`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `GET /api/posts` (with `?tag` filter), `GET /api/posts/{slug}`, `POST/PUT/DELETE /api/posts` (admin-only).
- Auto-seeded admin (`admin@journal.com` / `journal2026`) and 3 sample blog posts (memories / fun / regrets).
- Frontend pages: Home (hero + recent polaroids), Journal (filterable polaroid grid), Post (drop-cap article with washi-taped cover), About, Admin Login, Admin Dashboard, Admin Editor (with file upload OR pasted URL).
- Auth context with localStorage Bearer token, axios interceptor, ProtectedRoute guard.
- All tests pass (12/12 backend pytest, full frontend e2e).

## Prioritized backlog
- **P1**
  - Object-storage backed image upload (currently base64 data URLs — fine for personal blog with light usage, but won't scale to many high-res images).
  - Rich-text formatting (bold/italic/links/quotes inside the entry body).
  - Multiple images / inline gallery within a post.
- **P2**
  - RSS feed at `/api/feed.xml` — easy reader subscription.
  - Per-post share / copy-link button + open-graph metadata.
  - Search across posts.
  - Light vs. dark mode (paper vs. midnight library).
  - Brute-force lockout on `/api/auth/login` (currently single-admin so low priority).
  - Migrate FastAPI startup to lifespan handler (deprecation warning only).

## Test credentials
See `/app/memory/test_credentials.md`.
