"""Backend API tests for University Journal app."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://college-confessions-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@journal.com"
ADMIN_PASSWORD = "journal2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and "user" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Health ----------
def test_health(s):
    r = s.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ---------- Public posts ----------
def test_list_posts_public(s):
    r = s.get(f"{API}/posts")
    assert r.status_code == 200
    posts = r.json()
    assert isinstance(posts, list)
    assert len(posts) >= 3
    for p in posts:
        assert "id" in p and "slug" in p and "title" in p
        assert "_id" not in p


def test_get_post_by_slug(s):
    r = s.get(f"{API}/posts")
    slug = r.json()[0]["slug"]
    r2 = s.get(f"{API}/posts/{slug}")
    assert r2.status_code == 200
    assert r2.json()["slug"] == slug


def test_get_post_unknown_slug_404(s):
    r = s.get(f"{API}/posts/nonexistent-slug-xyz-123")
    assert r.status_code == 404


def test_filter_posts_by_tag(s):
    r = s.get(f"{API}/posts", params={"tag": "memories"})
    assert r.status_code == 200
    items = r.json()
    assert all(p["tag"] == "memories" for p in items)
    assert len(items) >= 1


# ---------- Auth ----------
def test_login_wrong_password(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG"})
    assert r.status_code == 401


def test_me_without_token(s):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_token(s, auth_headers):
    r = s.get(f"{API}/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL
    assert r.json()["role"] == "admin"


# ---------- Protected: create / update / delete ----------
def test_create_post_unauth(s):
    r = requests.post(f"{API}/posts", json={"title": "Nope", "content": "x"})
    assert r.status_code == 401


def test_full_post_lifecycle(s, auth_headers):
    title = "TEST_ Lifecycle Post"
    payload = {"title": title, "content": "Hello world content.", "tag": "fun", "excerpt": "ex"}
    r = s.post(f"{API}/posts", json=payload, headers=auth_headers)
    assert r.status_code == 200, r.text
    p1 = r.json()
    assert p1["title"] == title
    assert p1["slug"].startswith("test-lifecycle-post")
    pid = p1["id"]

    # Slug uniqueness on duplicate title
    r2 = s.post(f"{API}/posts", json=payload, headers=auth_headers)
    assert r2.status_code == 200
    p2 = r2.json()
    assert p2["slug"] != p1["slug"]
    pid2 = p2["id"]

    # GET to verify persistence
    rg = s.get(f"{API}/posts/{p1['slug']}")
    assert rg.status_code == 200
    assert rg.json()["id"] == pid

    # Update title -> slug regenerates
    new_title = "TEST_ Updated Lifecycle"
    ru = s.put(f"{API}/posts/{pid}", json={"title": new_title}, headers=auth_headers)
    assert ru.status_code == 200, ru.text
    upd = ru.json()
    assert upd["title"] == new_title
    assert upd["slug"].startswith("test-updated-lifecycle")

    # Verify old slug 404, new slug 200
    assert s.get(f"{API}/posts/{p1['slug']}").status_code == 404
    assert s.get(f"{API}/posts/{upd['slug']}").status_code == 200

    # Delete both
    for x in (pid, pid2):
        rd = s.delete(f"{API}/posts/{x}", headers=auth_headers)
        assert rd.status_code == 200
    # Verify deletion
    assert s.get(f"{API}/posts/{upd['slug']}").status_code == 404


def test_update_unauth(s):
    r = requests.put(f"{API}/posts/some-id", json={"title": "X"})
    assert r.status_code == 401


def test_delete_unauth(s):
    r = requests.delete(f"{API}/posts/some-id")
    assert r.status_code == 401
