"""Tests for Quick Menu (Menú Flotante) feature - iteration 48"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://chile-residences.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@senioradvisor.cl"
ADMIN_PASS = "EmiLuci2$$$"

DEFAULT_NAMES = ["SeniorClub", "SeniorPodcast", "Actualidad Senior", "Editorial"]


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=20)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token, f"No token in response: {data}"
    return token


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- PUBLIC ENDPOINT ----------
class TestPublicQuickMenu:
    def test_public_list_returns_default_items(self):
        r = requests.get(f"{API}/quick-menu", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        names = [i["name"] for i in items]
        for n in DEFAULT_NAMES:
            assert n in names, f"Default item '{n}' missing in {names}"
        # all active=true
        for it in items:
            assert it.get("active") is True
        # ordering ascending
        orders = [it.get("order", 0) for it in items]
        assert orders == sorted(orders)

    def test_public_list_no_mongo_id(self):
        r = requests.get(f"{API}/quick-menu", timeout=20)
        for it in r.json():
            assert "_id" not in it


# ---------- ADMIN AUTH ----------
class TestAdminAuth:
    def test_admin_without_token_unauthorized(self):
        r = requests.get(f"{API}/quick-menu/admin", timeout=20)
        assert r.status_code in (401, 403)

    def test_admin_with_token_returns_items(self, admin_headers):
        r = requests.get(f"{API}/quick-menu/admin", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 4
        names = [i["name"] for i in items]
        for n in DEFAULT_NAMES:
            assert n in names


# ---------- CRUD ----------
class TestQuickMenuCRUD:
    def test_create_update_delete_flow(self, admin_headers):
        # CREATE
        payload = {
            "name": "TEST_QM_Item",
            "icon": "Star",
            "url": "/test-qm",
            "order": 99,
            "active": True,
            "custom_icon_url": "",
        }
        r = requests.post(f"{API}/quick-menu/admin", headers=admin_headers, json=payload, timeout=20)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == "TEST_QM_Item"
        assert created["icon"] == "Star"
        assert created["url"] == "/test-qm"
        assert created["order"] == 99
        assert created["active"] is True
        item_id = created["item_id"]
        assert isinstance(item_id, str) and len(item_id) > 0
        assert "_id" not in created

        # GET admin and confirm presence
        r = requests.get(f"{API}/quick-menu/admin", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        ids = [i["item_id"] for i in r.json()]
        assert item_id in ids

        # UPDATE
        upd = {"name": "TEST_QM_Item_Updated", "active": False, "order": 50}
        r = requests.put(f"{API}/quick-menu/admin/{item_id}", headers=admin_headers, json=upd, timeout=20)
        assert r.status_code == 200, r.text
        updated = r.json()
        assert updated["name"] == "TEST_QM_Item_Updated"
        assert updated["active"] is False
        assert updated["order"] == 50

        # GET admin verifies persistence
        r = requests.get(f"{API}/quick-menu/admin", headers=admin_headers, timeout=20)
        match = [i for i in r.json() if i["item_id"] == item_id]
        assert match and match[0]["active"] is False and match[0]["name"] == "TEST_QM_Item_Updated"

        # PUBLIC list should NOT contain inactive item
        r = requests.get(f"{API}/quick-menu", timeout=20)
        public_ids = [i["item_id"] for i in r.json()]
        assert item_id not in public_ids

        # DELETE
        r = requests.delete(f"{API}/quick-menu/admin/{item_id}", headers=admin_headers, timeout=20)
        assert r.status_code == 200, r.text
        assert r.json().get("status") == "deleted"

        # Verify removal
        r = requests.get(f"{API}/quick-menu/admin", headers=admin_headers, timeout=20)
        ids = [i["item_id"] for i in r.json()]
        assert item_id not in ids

        # DELETE again -> 404
        r = requests.delete(f"{API}/quick-menu/admin/{item_id}", headers=admin_headers, timeout=20)
        assert r.status_code == 404

    def test_update_nonexistent_returns_404(self, admin_headers):
        r = requests.put(
            f"{API}/quick-menu/admin/nonexistent-id-xxx",
            headers=admin_headers,
            json={"name": "x"},
            timeout=20,
        )
        assert r.status_code == 404

    def test_update_empty_returns_400(self, admin_headers):
        # create
        r = requests.post(
            f"{API}/quick-menu/admin",
            headers=admin_headers,
            json={"name": "TEST_QM_empty", "url": "/t"},
            timeout=20,
        )
        item_id = r.json()["item_id"]
        # update with empty
        r = requests.put(f"{API}/quick-menu/admin/{item_id}", headers=admin_headers, json={}, timeout=20)
        assert r.status_code == 400
        # cleanup
        requests.delete(f"{API}/quick-menu/admin/{item_id}", headers=admin_headers, timeout=20)

    def test_create_without_auth_forbidden(self):
        r = requests.post(
            f"{API}/quick-menu/admin",
            json={"name": "x", "url": "/x"},
            timeout=20,
        )
        assert r.status_code in (401, 403)
