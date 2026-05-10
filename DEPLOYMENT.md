# Self-Hosting Guide — Beyond the usual

This guide moves your blog **off Emergent** onto free services so you don't
have to keep an Emergent subscription running.

> **Heads up:** you'll need an active Emergent subscription **once** to push to
> GitHub. After that, everything below runs on free tiers.

## What you'll set up

| Piece | Free service | What it does |
|---|---|---|
| **Frontend** (React) | **Vercel** | Hosts the website your readers visit |
| **Backend** (FastAPI) | **Fly.io** | Runs the API that powers the admin & posts |
| **Database** (MongoDB) | **MongoDB Atlas (M0 free tier)** | Stores your posts and admin user |

Total ongoing cost: **$0/month** for typical personal-blog usage.

> Prefer Render or Railway? Their commands are at the bottom under
> [Alternative hosts](#alternative-hosts).

---

## Step 1 · Push the code to GitHub (do this from inside Emergent)

Click the **GitHub icon button** at the bottom of the Emergent chat
(near where you type messages) → **"Save to GitHub"** → choose **Private**
repo when prompted. Done.

After the push, your code lives in your own GitHub. You can cancel Emergent
whenever you want.

---

## Step 2 · Free MongoDB cluster on Atlas

1. Sign up at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a free **M0 cluster** (any region near you).
3. **Database Access** → create a user (note username + password).
4. **Network Access** → add `0.0.0.0/0` (allow anywhere — required for Fly).
5. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>` with the real values. Save it for Step 3.

---

## Step 3 · Deploy the backend to Fly.io

### 3.1 Install the Fly CLI

- macOS / Linux:
  ```bash
  curl -L https://fly.io/install.sh | sh
  ```
- Windows (PowerShell):
  ```powershell
  iwr https://fly.io/install.ps1 -useb | iex
  ```

### 3.2 Sign up + log in
```bash
fly auth signup    # or: fly auth login if you already have an account
```
You'll need to add a credit card, but the free Hobby plan won't charge you for a small backend like this.

### 3.3 Launch the app
```bash
cd backend
fly launch --no-deploy
```
When prompted:
- **App name:** anything unique, e.g. `beyond-the-usual-api`
- **Region:** pick one near you (`lhr` London, `iad` US-East, `fra` Frankfurt, `syd` Sydney, …)
- **Postgres / Redis:** **No** to both
- **Deploy now:** **No** (we need to set secrets first)

Fly will detect the `Dockerfile` I added and write a fresh `fly.toml`.

### 3.4 Set your secrets
```bash
fly secrets set \
  MONGO_URL="mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority" \
  DB_NAME="university_blog" \
  JWT_SECRET="$(python -c 'import secrets;print(secrets.token_hex(32))')" \
  ADMIN_EMAIL="you@example.com" \
  ADMIN_PASSWORD="your-strong-password" \
  CORS_ORIGINS="*"
```
> On Windows PowerShell, generate the JWT secret separately and paste it in.

### 3.5 Deploy
```bash
fly deploy
```
The first deploy takes 2–4 minutes. When it finishes, Fly prints your URL,
e.g. `https://beyond-the-usual-api.fly.dev`.

### 3.6 Test it
Open `https://<your-app>.fly.dev/api/health` in a browser — you should see
`{"status":"ok"}`. If you do, the backend is live.

---

## Step 4 · Deploy the frontend to Vercel

1. Go to <https://vercel.com> → sign up with GitHub.
2. **Add New… → Project** → import your blog repo.
3. Configure:
   - **Framework preset:** *Create React App*
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn build` (default)
   - **Output Directory:** `build` (default)
4. Add an **Environment Variable**:

   | Key | Value |
   |---|---|
   | `REACT_APP_BACKEND_URL` | `https://<your-app>.fly.dev` (no trailing slash) |

5. Click **Deploy**. After ~2 minutes you get a URL like
   `https://beyond-the-usual.vercel.app`.
6. Visit it. Sign in at `/admin/login` with the email + password you set in Step 3.4.

---

## Step 5 · Lock down CORS (recommended)

Now that you have your real Vercel URL, tighten the backend:

```bash
cd backend
fly secrets set CORS_ORIGINS="https://beyond-the-usual.vercel.app"
```
(That auto-redeploys. Use your actual Vercel URL.)

This makes sure only your site can talk to your backend.

---

## Updating your blog later

Both Vercel and Fly auto-redeploy on `git push` (Vercel does it via the
GitHub integration; Fly needs a tiny step). For Fly, add a deploy command:

```bash
cd backend
fly deploy
```
…or set up the [Fly GitHub Action](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)
once for fully automatic deploys.

---

## Common gotchas

- **`fly deploy` says "App not found"** → run `fly launch --no-deploy` first to register the app.
- **Health check failing** → make sure the `MONGO_URL` secret is set and Atlas Network Access allows `0.0.0.0/0`.
- **Login works once but not after a while** → check that `JWT_SECRET` is set as a Fly secret (not just an env var) so it persists across restarts.
- **Free Atlas cluster pauses after 60 days idle** → click "Resume" in Atlas — your data is preserved.

---

## Alternative hosts

### Render
- New → Web Service → connect repo
- **Root Directory:** `backend`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Set the same secrets from Step 3.4 in **Environment**.

### Railway
- New Project → Deploy from GitHub repo
- **Settings → Source → Root Directory:** `backend`
- **Settings → Networking → Generate Domain**
- Set the same secrets in **Variables**. Railway auto-uses the `Procfile`.

---

That's it — you'll never need to pay Emergent again once Steps 1–4 are done.
