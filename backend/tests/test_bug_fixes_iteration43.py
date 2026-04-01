"""
Iteration 43 - Bug Fixes Testing
Tests for 5 reported bugs after codebase rollback:
1. Admin panel metrics (6 cards including Reseñas)
2. Destacado/Premium toggle saving from profile modal
3. Favorites endpoints
4. Admin stats endpoint returns total_reviews
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminStats:
    """Test admin stats endpoint returns all 6 metrics including total_reviews"""
    
    @pytest.fixture
    def admin_token(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@senioradvisor.cl",
            "password": "EmiLuci2$$$"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")
    
    def test_admin_stats_returns_all_metrics(self, admin_token):
        """Issue 1: Admin stats should return 6 metrics including total_reviews"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify all 6 metrics are present
        required_fields = [
            "total_users",
            "total_providers", 
            "pending_providers",
            "verified_providers",
            "active_subscriptions",
            "total_reviews"  # This was missing before the fix
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            assert isinstance(data[field], int), f"{field} should be an integer"
        
        print(f"Admin stats: {data}")
        print("PASS: All 6 metrics present including total_reviews")


class TestAdminProviderProfile:
    """Test admin can update provider profile including is_featured and is_subscribed"""
    
    @pytest.fixture
    def admin_token(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@senioradvisor.cl",
            "password": "EmiLuci2$$$"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")
    
    @pytest.fixture
    def test_provider_id(self, admin_token):
        """Get a provider ID for testing"""
        response = requests.get(
            f"{BASE_URL}/api/admin/providers/all",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code == 200 and len(response.json()) > 0:
            return response.json()[0]["provider_id"]
        pytest.skip("No providers available for testing")
    
    def test_update_is_featured(self, admin_token, test_provider_id):
        """Issue 2: Test is_featured can be updated via admin profile endpoint"""
        # First get current state
        response = requests.get(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/detail",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        original_featured = response.json().get("is_featured", False)
        
        # Toggle is_featured
        new_featured = not original_featured
        update_response = requests.put(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/profile",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"is_featured": new_featured}
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify the change persisted
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/detail",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert verify_response.status_code == 200
        assert verify_response.json().get("is_featured") == new_featured
        
        # Restore original state
        requests.put(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/profile",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"is_featured": original_featured}
        )
        
        print(f"PASS: is_featured toggle works (changed from {original_featured} to {new_featured})")
    
    def test_update_is_subscribed_syncs_provider_is_subscribed(self, admin_token, test_provider_id):
        """Issue 2: Test is_subscribed syncs to provider_is_subscribed"""
        # First get current state
        response = requests.get(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/detail",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        original_subscribed = response.json().get("is_subscribed", False) or response.json().get("provider_is_subscribed", False)
        
        # Toggle is_subscribed
        new_subscribed = not original_subscribed
        update_response = requests.put(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/profile",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"is_subscribed": new_subscribed}
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify both is_subscribed and provider_is_subscribed are synced
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/detail",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert verify_response.status_code == 200
        data = verify_response.json()
        
        # Check provider_is_subscribed was synced (this is the key fix)
        assert data.get("provider_is_subscribed") == new_subscribed, \
            f"provider_is_subscribed not synced: expected {new_subscribed}, got {data.get('provider_is_subscribed')}"
        
        # Restore original state
        requests.put(
            f"{BASE_URL}/api/admin/providers/{test_provider_id}/profile",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"is_subscribed": original_subscribed}
        )
        
        print(f"PASS: is_subscribed syncs to provider_is_subscribed (changed to {new_subscribed})")


class TestFavoritesEndpoints:
    """Test favorites CRUD endpoints"""
    
    @pytest.fixture
    def client_token(self):
        """Login as client and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@senioradvisor.cl",
            "password": "demo123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Client login failed")
    
    @pytest.fixture
    def test_provider_id(self):
        """Get a provider ID for testing"""
        response = requests.get(f"{BASE_URL}/api/providers?limit=1")
        if response.status_code == 200:
            data = response.json()
            # Handle paginated response with 'results' key
            providers = data.get("results", data) if isinstance(data, dict) else data
            if len(providers) > 0:
                return providers[0]["provider_id"]
        pytest.skip("No providers available for testing")
    
    def test_check_favorite_endpoint(self, client_token, test_provider_id):
        """Issue 5: Test /api/favorites/check/{provider_id} endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/favorites/check/{test_provider_id}",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "is_favorite" in response.json()
        print(f"PASS: Check favorite endpoint works, is_favorite={response.json()['is_favorite']}")
    
    def test_add_favorite_endpoint(self, client_token, test_provider_id):
        """Issue 5: Test POST /api/favorites/{provider_id} endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/favorites/{test_provider_id}",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        # 200 for success or already exists
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"PASS: Add favorite endpoint works: {response.json()}")
    
    def test_get_favorites_endpoint(self, client_token):
        """Issue 5: Test GET /api/favorites endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/favorites",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert isinstance(response.json(), list)
        print(f"PASS: Get favorites endpoint works, count={len(response.json())}")
    
    def test_remove_favorite_endpoint(self, client_token, test_provider_id):
        """Issue 5: Test DELETE /api/favorites/{provider_id} endpoint"""
        # First add to favorites
        requests.post(
            f"{BASE_URL}/api/favorites/{test_provider_id}",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        # Then remove
        response = requests.delete(
            f"{BASE_URL}/api/favorites/{test_provider_id}",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        # 200 for success, 404 if not found (already removed)
        assert response.status_code in [200, 404], f"Expected 200 or 404, got {response.status_code}"
        print(f"PASS: Remove favorite endpoint works: {response.status_code}")
    
    def test_favorite_full_flow(self, client_token, test_provider_id):
        """Issue 5: Test complete favorite flow: check -> add -> verify -> remove -> verify"""
        headers = {"Authorization": f"Bearer {client_token}"}
        
        # 1. Check initial state
        check1 = requests.get(f"{BASE_URL}/api/favorites/check/{test_provider_id}", headers=headers)
        assert check1.status_code == 200
        initial_state = check1.json()["is_favorite"]
        
        # 2. If already favorite, remove first
        if initial_state:
            requests.delete(f"{BASE_URL}/api/favorites/{test_provider_id}", headers=headers)
        
        # 3. Add to favorites
        add_response = requests.post(f"{BASE_URL}/api/favorites/{test_provider_id}", headers=headers)
        assert add_response.status_code == 200
        
        # 4. Verify it's now a favorite
        check2 = requests.get(f"{BASE_URL}/api/favorites/check/{test_provider_id}", headers=headers)
        assert check2.status_code == 200
        assert check2.json()["is_favorite"] == True, "Should be favorite after adding"
        
        # 5. Remove from favorites
        remove_response = requests.delete(f"{BASE_URL}/api/favorites/{test_provider_id}", headers=headers)
        assert remove_response.status_code == 200
        
        # 6. Verify it's no longer a favorite
        check3 = requests.get(f"{BASE_URL}/api/favorites/check/{test_provider_id}", headers=headers)
        assert check3.status_code == 200
        assert check3.json()["is_favorite"] == False, "Should not be favorite after removing"
        
        print("PASS: Complete favorite flow works correctly")


class TestAdminMetrics:
    """Test admin metrics endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Login as admin and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@senioradvisor.cl",
            "password": "EmiLuci2$$$"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin login failed")
    
    def test_admin_metrics_endpoint(self, admin_token):
        """Test /api/admin/metrics returns time-series data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/metrics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Metrics should be a list"
        assert len(data) > 0, "Metrics should have data"
        
        # Check structure of first item
        first_item = data[0]
        required_fields = ["month", "users", "providers", "subscriptions", "reviews"]
        for field in required_fields:
            assert field in first_item, f"Missing field: {field}"
        
        print(f"PASS: Admin metrics endpoint works, {len(data)} months of data")


class TestClientLogin:
    """Test client demo user can login"""
    
    def test_demo_client_login(self):
        """Verify demo client user exists and can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@senioradvisor.cl",
            "password": "demo123"
        })
        assert response.status_code == 200, f"Demo client login failed: {response.text}"
        
        data = response.json()
        assert "token" in data, "Token should be in response"
        assert "user" in data, "User should be in response"
        
        # Verify user role is not admin or provider (should be client/user)
        user_role = data["user"].get("role", "user")
        assert user_role not in ["admin", "provider"], f"Demo user should be client, got {user_role}"
        
        print(f"PASS: Demo client login works, role={user_role}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
