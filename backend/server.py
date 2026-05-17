from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# ---------------- Config ----------------
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60 * 24  # 24h for personal blog admin convenience

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="University Journal API")
api_router = APIRouter(prefix="/api")


# ---------------- Auth helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MIN),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Models ----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class LoginResponse(BaseModel):
    user: UserOut
    access_token: str
    token_type: str = "bearer"


class PostBase(BaseModel):
    title: str
    excerpt: str = ""
    content: str
    tag: str = "memories"  # memories | regrets | fun | academic  
    cover_image: Optional[str] = None  # base64 data URL or external URL
    status: str = "published"  # "published" | "draft"


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    tag: Optional[str] = None
    cover_image: Optional[str] = None
    status: Optional[str] = None


class PostOut(PostBase):
    id: str
    slug: str
    created_at: str
    updated_at: str


# ---------------- Utils ----------------
def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s-]+", "-", s)
    return s[:80] or "post"


async def unique_slug(base: str, exclude_id: Optional[str] = None) -> str:
    slug = base
    i = 1
    while True:
        q = {"slug": slug}
        if exclude_id:
            q["id"] = {"$ne": exclude_id}
        existing = await db.posts.find_one(q)
        if not existing:
            return slug
        i += 1
        slug = f"{base}-{i}"


# ---------------- Auth routes ----------------
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"], user["email"])
    return LoginResponse(
        user=UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]),
        access_token=token,
    )


@api_router.post("/auth/logout")
async def logout():
    return {"ok": True}


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_admin)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"])


# ---------------- Posts routes ----------------
@api_router.get("/posts", response_model=List[PostOut])
async def list_posts(tag: Optional[str] = None):
    query = {"status": {"$ne": "draft"}}
    if tag and tag != "all":
        query["tag"] = tag
    cursor = db.posts.find(query, {"_id": 0}).sort("created_at", -1)
    items = await cursor.to_list(500)
    return items


@api_router.get("/posts/{slug}", response_model=PostOut)
async def get_post(slug: str):
    post = await db.posts.find_one(
        {"slug": slug, "status": {"$ne": "draft"}}, {"_id": 0}
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@api_router.get("/admin/posts", response_model=List[PostOut])
async def admin_list_posts(user: dict = Depends(get_current_admin)):
    cursor = db.posts.find({}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(500)


@api_router.get("/admin/posts/{post_id}", response_model=PostOut)
async def admin_get_post(post_id: str, user: dict = Depends(get_current_admin)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@api_router.post("/posts", response_model=PostOut)
async def create_post(payload: PostCreate, user: dict = Depends(get_current_admin)):
    now = datetime.now(timezone.utc).isoformat()
    base_slug = slugify(payload.title)
    slug = await unique_slug(base_slug)
    doc = {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "title": payload.title,
        "excerpt": payload.excerpt or payload.content[:160],
        "content": payload.content,
        "tag": payload.tag,
        "cover_image": payload.cover_image,
        "status": payload.status if payload.status in ("draft", "published") else "published",
        "created_at": now,
        "updated_at": now,
    }
    await db.posts.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/posts/{post_id}", response_model=PostOut)
async def update_post(post_id: str, payload: PostUpdate, user: dict = Depends(get_current_admin)):
    existing = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "title" in updates and updates["title"] != existing["title"]:
        updates["slug"] = await unique_slug(slugify(updates["title"]), exclude_id=post_id)
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.posts.update_one({"id": post_id}, {"$set": updates})
    fresh = await db.posts.find_one({"id": post_id}, {"_id": 0})
    return fresh


@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: dict = Depends(get_current_admin)):
    res = await db.posts.delete_one({"id": post_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


# ---------------- Startup ----------------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.posts.create_index("slug", unique=True)
    await db.posts.create_index("created_at")

    # One-time migration: tag legacy posts (no status field) as published
    await db.posts.update_many(
        {"status": {"$exists": False}}, {"$set": {"status": "published"}}
    )

    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )

    # Seed sample posts only if collection is empty
    count = await db.posts.count_documents({})
    if count == 0:
        sample = [
            {
                "title": "Day One: I Forgot My Student ID Already",
                "excerpt": "Move-in day was a blur of cardboard boxes, sweaty hugs, and one very locked dorm door.",
                "content": "I always thought college began with a triumphant montage. Mine began with me standing outside Hartwell Hall, no key card, no signal, and a roommate I had not yet met.\n\nThe RA found me twenty minutes later. He was kind. He did not laugh. (He did laugh later, when I told the story at orientation.)\n\nIf I could tell first-day me one thing, it would be: the embarrassment is the souvenir. Hold onto it. You will miss feeling this small.",
                "tag": "memories",
                "cover_image": "https://images.unsplash.com/photo-1729693862649-c457544c9c69?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
            },
            {
                "title": "The 3 AM Library Crew",
                "excerpt": "We weren't studying. We were surviving. There is a difference.",
                "content": "There is a particular tribe that forms on the fourth floor of the library at 3 AM. They share vending-machine snacks, half-finished theses, and the universal sigh of someone whose laptop is at 4% battery.\n\nI joined them every Tuesday. I never finished my work, but I left with three new friends and one terrifying caffeine tolerance.",
                "tag": "fun",
                "cover_image": "https://images.unsplash.com/photo-1699155759495-855eaf21cfde?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
            },
            {
                "title": "I Should Have Joined the Drama Club",
                "excerpt": "A quiet regret about the auditions I walked past every single Thursday.",
                "content": "There was a flyer on the bulletin board near the art building. Slightly crooked. Slightly sun-bleached. It asked: 'Can you cry on cue?' and I always thought, well, I cry every Sunday at 10 PM, so technically yes.\n\nI never went in. I told myself I was too busy. I wasn't.\n\nIf you are reading this and you are still in school: go. Audition for the thing. Sing the karaoke song. The flyer will not be there forever.",
                "tag": "regrets",
                "cover_image": "https://images.unsplash.com/photo-1688158306666-ad466c06eb07?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
            },
        ]
        now = datetime.now(timezone.utc)
        for i, p in enumerate(sample):
            ts = (now - timedelta(days=i)).isoformat()
            slug = await unique_slug(slugify(p["title"]))
            doc = {
                "id": str(uuid.uuid4()),
                "slug": slug,
                "title": p["title"],
                "excerpt": p["excerpt"],
                "content": p["content"],
                "tag": p["tag"],
                "cover_image": p["cover_image"],
                "created_at": ts,
                "updated_at": ts,
            }
            await db.posts.insert_one(doc)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Include routes
app.include_router(api_router)

_cors_env = os.environ.get('CORS_ORIGINS', '*')
_cors_kwargs = {
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
if _cors_env.strip() == "*":
    _cors_kwargs["allow_origin_regex"] = ".*"
else:
    _cors_kwargs["allow_origins"] = [o.strip() for o in _cors_env.split(',') if o.strip()]
app.add_middleware(CORSMiddleware, **_cors_kwargs)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
