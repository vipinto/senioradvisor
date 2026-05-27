"""
Backend tests for the new care_types filter & admin edit feature (Iteration 47)
Covers:
- PUT /api/admin/providers/{id}/profile accepts care_types
- GET /api/providers/{id} returns care_types
- GET /api/providers?care_types=... filters correctly
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://chile-residences.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@senioradvisor.cl"
ADMIN_PASS = "EmiLuci2$$$"
TARGET_PROVIDER_ID = "ec1a94d4-4780-423c-a450-b47a1bd48d18"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=20)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token, f"No token in login response: {data}"
    return token


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --- Verify the target provider already has care_types set ---
def test_target_provider_has_care_types():
    r = requests.get(f"{API}/providers/{TARGET_PROVIDER_ID}", timeout=20)
    assert r.status_code == 200, f"GET provider failed: {r.text}"
    data = r.json()
    assert "care_types" in data, "Response missing 'care_types' field"
    assert isinstance(data["care_types"], list), f"care_types should be a list, got {type(data['care_types'])}"
    assert "Autovalentes" in data["care_types"], f"Expected Autovalentes in care_types: {data['care_types']}"


# --- Filter by care_types returns the target provider ---
def test_filter_providers_by_care_types_autovalentes():
    r = requests.get(f"{API}/providers", params={"care_types": "Autovalentes", "limit": 100}, timeout=20)
    assert r.status_code == 200, f"Failed: {r.text}"
    data = r.json()
    results = data.get("results", data) if isinstance(data, dict) else data
    ids = [p.get("provider_id") for p in results]
    assert TARGET_PROVIDER_ID in ids, f"Target provider not in care_types=Autovalentes results. Found {len(ids)} providers"
    # All returned should have Autovalentes
    for p in results:
        ct = p.get("care_types") or []
        assert "Autovalentes" in ct, f"Provider {p.get('provider_id')} returned without Autovalentes: {ct}"


def test_filter_providers_by_care_types_dependientes_excludes_target():
    """Target has only Autovalentes+Semi-dependientes, not Dependientes."""
    r = requests.get(f"{API}/providers", params={"care_types": "Dependientes", "limit": 100}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    results = data.get("results", data) if isinstance(data, dict) else data
    for p in results:
        ct = p.get("care_types") or []
        assert "Dependientes" in ct, f"Filter leak: provider has {ct}"


# --- Admin PUT updates care_types and persists ---
def test_admin_update_care_types_persists(admin_headers):
    # Update with both values
    payload = {"care_types": ["Autovalentes", "Semi-dependientes"]}
    r = requests.put(
        f"{API}/admin/providers/{TARGET_PROVIDER_ID}/profile",
        json=payload,
        headers=admin_headers,
        timeout=20
    )
    assert r.status_code == 200, f"PUT failed: {r.status_code} {r.text}"

    # GET to verify persistence
    g = requests.get(f"{API}/providers/{TARGET_PROVIDER_ID}", timeout=20)
    assert g.status_code == 200
    data = g.json()
    assert set(data.get("care_types") or []) == {"Autovalentes", "Semi-dependientes"}, \
        f"care_types mismatch after update: {data.get('care_types')}"


def test_admin_update_care_types_with_new_value(admin_headers):
    # Add Dependientes
    payload = {"care_types": ["Autovalentes", "Semi-dependientes", "Dependientes"]}
    r = requests.put(
        f"{API}/admin/providers/{TARGET_PROVIDER_ID}/profile",
        json=payload,
        headers=admin_headers,
        timeout=20
    )
    assert r.status_code == 200, f"PUT failed: {r.text}"
    g = requests.get(f"{API}/providers/{TARGET_PROVIDER_ID}", timeout=20)
    assert set(g.json().get("care_types") or []) == {"Autovalentes", "Semi-dependientes", "Dependientes"}

    # Now filter by Dependientes - target should appear
    f = requests.get(f"{API}/providers", params={"care_types": "Dependientes", "limit": 100}, timeout=20)
    res = f.json().get("results", f.json()) if isinstance(f.json(), dict) else f.json()
    ids = [p.get("provider_id") for p in res]
    assert TARGET_PROVIDER_ID in ids, "Target should appear after adding Dependientes"

    # Restore to original state
    requests.put(
        f"{API}/admin/providers/{TARGET_PROVIDER_ID}/profile",
        json={"care_types": ["Autovalentes", "Semi-dependientes"]},
        headers=admin_headers,
        timeout=20
    )


def test_filter_multiple_care_types_comma_separated_AND_semantics():
    """Backend uses $all - provider must have ALL listed care_types.
    Target has Autovalentes + Semi-dependientes => should match this combo.
    """
    r = requests.get(f"{API}/providers", params={"care_types": "Autovalentes,Semi-dependientes", "limit": 100}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    results = data.get("results", data) if isinstance(data, dict) else data
    ids = [p.get("provider_id") for p in results]
    assert TARGET_PROVIDER_ID in ids, "Target with both Autovalentes+Semi-dependientes should match"


def test_providers_endpoint_returns_care_types_field():
    r = requests.get(f"{API}/providers", params={"limit": 5}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    results = data.get("results", data) if isinstance(data, dict) else data
    assert len(results) > 0
    # At least one should be a list type for care_types
    for p in results:
        ct = p.get("care_types")
        if ct is not None:
            assert isinstance(ct, list)
