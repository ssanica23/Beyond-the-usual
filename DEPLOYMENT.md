# Self-Hosting Guide — Beyond the usual

This guide walks you through moving your blog **off Emergent** and onto free
services so you don't have to keep an Emergent subscription.

> **Heads up:** you'll need an active Emergent subscription **once** to push to
> GitHub. After that, everything below runs on free tiers.

---

## What you'll set up

| Piece | Free service | What it does |
|---|---|---|
| **Frontend** (React) | **Vercel** | Hosts the website your readers visit |
| **Backend** (FastAPI) | **Railway** *(or Render)* | Runs the API that powers the admin & posts |
| **Database** (MongoDB) | **MongoDB Atlas (M0 free tier)** | Stores your posts and admin user |

Total ongoing cost: **$0/month** as long as you stay within free-tier usage
(plenty for a personal blog).

---

## Step 1 · Push the code to GitHub (do this from inside Emergent)

1. In the Emergent UI, click **"Push to GitHub"** (top of the chat panel).
2. Pick or create a private repo (e.g. `beyond-the-usual`).
3. Confirm. Emergent uploads everything in `/app` to GitHub.
4. After the push, you can cancel Emergent any time — your code is now safe in your GitHub.

---

## Step 2 · Create a free MongoDB Atlas cluster

1. Go to <https://www.mongodb.com/cloud/atlas/register> and sign up.
2. Create a **free M0 cluster** (any region near you).
3. Under **Database Access**, create a user (note the username + password).
4. Under **Network Access**, click **"Allow access from anywhere"** (`0.0.0.0/0`).
5. Click **"Connect" → "Drivers"**, copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<user>` and `<password>` with your real values. Save it for Step 3.

---

## Step 3 · Deploy the backend to Railway

1. Go to <https://railway.com> and sign up with GitHub.
2. Click **"New Project" → "Deploy from GitHub repo"**, pick your blog repo.
3. After the first build attempt, set the **Root Directory** to `backend`
   (Settings → Source → Root Directory).
4. Add these environment variables (Settings → Variables):

   | Key | Value |
   |---|---|
   | `MONGO_URL` | the Atlas connection string from Step 2 |
   | `DB_NAME` | `university_blog` (or any name) |
   | `JWT_SECRET` | a long random string — generate with `python -c "import secrets;print(secrets.token_hex(32))"` |
   | `ADMIN_EMAIL` | your login email (e.g. `you@example.com`) |
   | `ADMIN_PASSWORD` | your **new** secure password |
   | `CORS_ORIGINS` | your future Vercel URL — **temporarily put `*`** then update after Step 4 |
   | `PORT` | leave blank, Railway provides this automatically |

5. Under **Settings → Networking**, click **"Generate Domain"** to get a
   public URL like `https://beyond-the-usual-production.up.railway.app`.
6. Test it: open `<your-railway-url>/api/health` — you should see `{"status":"ok"}`.

> **Render alternative:** the same env vars work on Render. Just create a Web
> Service → connect repo → Root Directory `backend` → Build `pip install -r
> requirements.txt` → Start `uvicorn server:app --host 0.0.0.0 --port $PORT`.

---

## Step 4 · Deploy the frontend to Vercel

1. Go to <https://vercel.com> and sign up with GitHub.
2. Click **"Add New… → Project"**, import your blog repo.
3. Configure:
   - **Framework preset:** *Create React App*
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn build` (default)
   - **Output Directory:** `build` (default)
4. Add an **Environment Variable**:

   | Key | Value |
   |---|---|
   | `REACT_APP_BACKEND_URL` | your Railway URL from Step 3 (e.g. `https://beyond-the-usual-production.up.railway.app`) |

5. Click **Deploy**. After ~2 minutes you'll get a URL like
   `https://beyond-the-usual.vercel.app`.
6. **Visit it.** It should load. Visit `/admin/login` to confirm you can sign in.

---

## Step 5 · Lock down CORS (recommended)

Once Vercel gives you the final URL, go back to Railway → Variables → update:

| Key | Value |
|---|---|
| `CORS_ORIGINS` | `https://beyond-the-usual.vercel.app` (your real Vercel URL) |

Click "Deploy" on Railway to apply. This makes sure only your blog can talk
to your backend.

---

## Step 6 · (Optional) Custom domain

Both Vercel and Railway let you attach a custom domain (e.g.
`beyondtheusual.com`) for free. Buy a domain on Namecheap/Cloudflare, then:

- **Vercel:** Project → Settings → Domains → add domain, follow DNS instructions.
- After the domain works on Vercel, update `CORS_ORIGINS` on Railway to include it.

---

## How to update your blog after self-hosting

Local development:
```bash
git clone https://github.com/<you>/beyond-the-usual.git
cd beyond-the-usual

# backend
cd backend
cp .env.example .env   # edit with your local Mongo URL
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# frontend (in another terminal)
cd ../frontend
cp .env.example .env   # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```

Push changes:
```bash
git add .
git commit -m "new entry"
git push
```

Both Vercel and Railway watch your GitHub repo and **auto-redeploy on every push** —
no extra work.

---

## Common gotchas

- **CORS errors after changing the Vercel URL?** Update `CORS_ORIGINS` on Railway and redeploy.
- **Login works locally but not in production?** Make sure `JWT_SECRET` is set on Railway and is the same across deploys (otherwise old tokens become invalid — but this only matters if you change it).
- **Images don't show?** They're stored as base64 inside MongoDB. If a single image is huge (>4MB), the editor blocks it; if you bypass that, you'll hit Mongo's 16MB doc limit. For a high-volume photo blog, ask me to wire up object storage later.
- **Free MongoDB Atlas pauses after 60 days of inactivity.** Just hit Resume — your data is preserved.

---

## Costs at a glance

| Service | Free tier covers | When you'd pay |
|---|---|---|
| Vercel Hobby | 100 GB bandwidth/mo, unlimited deploys | Only if your blog goes viral |
| Railway | $5 free credit/mo, sleeps after idle | Heavy 24/7 traffic (~$5–10/mo) |
| MongoDB Atlas M0 | 512 MB storage | When you cross 512 MB of posts/images |

For a personal blog, the free tiers are essentially permanent.

That's it — you'll never need to pay Emergent again once Steps 1–4 are done.
