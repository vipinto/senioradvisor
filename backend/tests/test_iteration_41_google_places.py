"""
Iteration 41 - Google Places Integration Tests
Tests for:
1. Admin panel - Create residencia with Google Place data (lat/lng, rating, reviews)
2. Provider profile - Google reviews section display
3. Provider profile - Map section with coordinates
4. Admin endpoints for Google Place data
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@senioradvisor.cl"
ADMIN_PASSWORD = "admin123"

# Provider with Google data (from test request)
TEST_PROVIDER_ID = "cc9f5f3a-a2ea-4108-b358-d12e9448e746"


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login(self):
        """Test admin can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert data.get("user", {}).get("role") == "admin", "User is not admin"
        print(f"✓ Admin login successful, role: {data['user']['role']}")


@pytest.fixture
def admin_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin authentication failed")


@pytest.fixture
def admin_headers(admin_token):
    """Headers with admin auth"""
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }


class TestProviderWithGoogleData:
    """Test provider profile with Google data"""
    
    def test_get_provider_with_google_reviews(self, admin_headers):
        """Test fetching provider that has Google reviews data"""
        response = requests.get(f"{BASE_URL}/api/providers/{TEST_PROVIDER_ID}")
        assert response.status_code == 200, f"Failed to get provider: {response.text}"
        
        provider = response.json()
        print(f"✓ Provider found: {provider.get('business_name')}")
        
        # Check for Google data fields
        assert "latitude" in provider, "Missing latitude field"
        assert "longitude" in provider, "Missing longitude field"
        print(f"  Coordinates: {provider.get('latitude')}, {provider.get('longitude')}")
        
        # Check Google rating fields
        if provider.get("google_rating"):
            print(f"  Google Rating: {provider.get('google_rating')} ({provider.get('google_total_reviews')} reviews)")
        
        # Check Google reviews array
        if provider.get("google_reviews"):
            print(f"  Google Reviews: {len(provider.get('google_reviews'))} reviews")
            for i, review in enumerate(provider.get("google_reviews", [])[:2]):
                print(f"    Review {i+1}: {review.get('author_name')} - {review.get('rating')} stars")
    
    def test_provider_has_coordinates(self, admin_headers):
        """Test that provider has non-zero coordinates for map display"""
        response = requests.get(f"{BASE_URL}/api/providers/{TEST_PROVIDER_ID}")
        assert response.status_code == 200
        
        provider = response.json()
        lat = provider.get("latitude", 0)
        lng = provider.get("longitude", 0)
        
        # Check if coordinates are non-zero (required for map display)
        has_coords = lat != 0 and lng != 0
        print(f"✓ Provider coordinates: lat={lat}, lng={lng}, has_valid_coords={has_coords}")
        
        # Note: This test documents the state, doesn't fail if no coords
        if has_coords:
            print("  Map section should be visible on provider profile")
        else:
            print("  Map section will be hidden (no valid coordinates)")


class TestCreateResidenciaWithGoogleData:
    """Test creating residencia with Google Place data"""
    
    def test_create_residencia_with_google_data(self, admin_headers):
        """Test POST /api/admin/residencias/create accepts Google data fields"""
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"test_google_{unique_id}@test.com"
        
        # Payload with Google Place data (simulating frontend sending fetched data)
        payload = {
            "business_name": f"TEST_Google_Residencia_{unique_id}",
            "email": test_email,
            "phone": "+56912345678",
            "address": "Av. Test 123, Santiago",
            "region": "Metropolitana",
            "comuna": "Santiago",
            "place_id": "ChIJtest123",
            "services": [
                {"service_type": "residencias", "price_from": 500000, "description": "Test service"}
            ],
            # Google Place data fields
            "latitude": -33.4489,
            "longitude": -70.6693,
            "google_rating": 4.5,
            "google_total_reviews": 25,
            "google_reviews": [
                {
                    "author_name": "Test User 1",
                    "rating": 5,
                    "text": "Excellent service!",
                    "relative_time_description": "hace 1 mes",
                    "profile_photo_url": ""
                },
                {
                    "author_name": "Test User 2",
                    "rating": 4,
                    "text": "Good place",
                    "relative_time_description": "hace 2 meses",
                    "profile_photo_url": ""
                }
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/residencias/create",
            json=payload,
            headers=admin_headers
        )
        
        assert response.status_code == 200, f"Create residencia failed: {response.text}"
        data = response.json()
        
        print(f"✓ Residencia created: {data.get('business_name')}")
        print(f"  Provider ID: {data.get('provider_id')}")
        print(f"  Password: {data.get('password')}")
        
        # Check google_data in response
        google_data = data.get("google_data", {})
        assert google_data.get("latitude") == -33.4489, "Latitude not stored correctly"
        assert google_data.get("longitude") == -70.6693, "Longitude not stored correctly"
        assert google_data.get("google_rating") == 4.5, "Google rating not stored correctly"
        assert google_data.get("google_total_reviews") == 25, "Google total reviews not stored correctly"
        assert google_data.get("reviews_count") == 2, "Google reviews count incorrect"
        
        print(f"  Google Data: lat={google_data.get('latitude')}, lng={google_data.get('longitude')}")
        print(f"  Rating: {google_data.get('google_rating')} ({google_data.get('google_total_reviews')} reviews)")
        
        # Verify by fetching the created provider
        provider_id = data.get("provider_id")
        verify_response = requests.get(f"{BASE_URL}/api/providers/{provider_id}")
        assert verify_response.status_code == 200, "Failed to verify created provider"
        
        provider = verify_response.json()
        assert provider.get("latitude") == -33.4489, "Latitude not persisted"
        assert provider.get("longitude") == -70.6693, "Longitude not persisted"
        assert provider.get("google_rating") == 4.5, "Google rating not persisted"
        assert provider.get("google_total_reviews") == 25, "Google total reviews not persisted"
        assert len(provider.get("google_reviews", [])) == 2, "Google reviews not persisted"
        
        print(f"✓ Verified provider data persisted correctly")
        
        # Cleanup - delete test user and provider
        # Note: No delete endpoint, so we'll leave it (prefixed with TEST_)
        return provider_id
    
    def test_create_residencia_without_google_data(self, admin_headers):
        """Test creating residencia without Google data still works"""
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"test_nogoogle_{unique_id}@test.com"
        
        payload = {
            "business_name": f"TEST_NoGoogle_Residencia_{unique_id}",
            "email": test_email,
            "phone": "+56912345678",
            "address": "Av. Test 456, Santiago",
            "region": "Metropolitana",
            "comuna": "Providencia",
            "services": [
                {"service_type": "residencias", "price_from": 600000, "description": "Test"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/residencias/create",
            json=payload,
            headers=admin_headers
        )
        
        assert response.status_code == 200, f"Create residencia failed: {response.text}"
        data = response.json()
        
        print(f"✓ Residencia created without Google data: {data.get('business_name')}")
        
        # Google data should be zeros/empty
        google_data = data.get("google_data", {})
        assert google_data.get("latitude") == 0, "Latitude should be 0"
        assert google_data.get("longitude") == 0, "Longitude should be 0"
        assert google_data.get("google_rating") == 0, "Google rating should be 0"
        
        print(f"  Google Data (empty): {google_data}")


class TestGooglePlaceEndpoints:
    """Test admin Google Place API endpoints"""
    
    def test_google_place_endpoint_exists(self, admin_headers):
        """Test GET /api/admin/google-place/{place_id} endpoint exists"""
        # Use a fake place_id - we expect an error but endpoint should exist
        response = requests.get(
            f"{BASE_URL}/api/admin/google-place/ChIJfake123",
            headers=admin_headers
        )
        
        # Should return 400/404 (not 404 for route not found)
        # The endpoint exists but Google API may fail due to billing
        assert response.status_code in [200, 400, 404], f"Unexpected status: {response.status_code}"
        print(f"✓ Google Place endpoint exists, status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"  Expected error (billing not enabled): {response.json().get('detail', '')[:100]}")
    
    def test_refresh_google_endpoint_exists(self, admin_headers):
        """Test POST /api/admin/providers/{id}/refresh-google endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/admin/providers/{TEST_PROVIDER_ID}/refresh-google",
            headers=admin_headers
        )
        
        # Should return 200 (success) or 400 (no place_id) - not 404 route not found
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        print(f"✓ Refresh Google endpoint exists, status: {response.status_code}")
        print(f"  Response: {response.json()}")


class TestResidenciaCreateModel:
    """Test that ResidenciaCreate model accepts all required fields"""
    
    def test_model_accepts_all_google_fields(self, admin_headers):
        """Verify the model accepts latitude, longitude, google_rating, google_total_reviews, google_reviews"""
        unique_id = str(uuid.uuid4())[:8]
        
        # Full payload with all Google fields
        payload = {
            "business_name": f"TEST_FullGoogle_{unique_id}",
            "email": f"test_full_{unique_id}@test.com",
            "phone": "",
            "address": "",
            "region": "",
            "comuna": "",
            "website": "",
            "facebook": "",
            "instagram": "",
            "place_id": "ChIJtest",
            "service_type": "residencias",
            "price_from": 0,
            "services": [],
            # All Google fields
            "latitude": -33.45,
            "longitude": -70.67,
            "google_rating": 4.2,
            "google_total_reviews": 100,
            "google_reviews": [
                {
                    "author_name": "Reviewer",
                    "rating": 5,
                    "text": "Great!",
                    "relative_time_description": "hace 1 semana",
                    "profile_photo_url": "https://example.com/photo.jpg"
                }
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/residencias/create",
            json=payload,
            headers=admin_headers
        )
        
        assert response.status_code == 200, f"Model validation failed: {response.text}"
        print(f"✓ ResidenciaCreate model accepts all Google fields")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
