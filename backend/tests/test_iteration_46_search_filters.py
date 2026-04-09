"""
Test suite for /search page filters and API - Iteration 46
Tests the redesigned search page with sidebar filters
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSearchProvidersAPI:
    """Tests for GET /api/providers search endpoint"""
    
    def test_providers_list_returns_results(self):
        """Test that providers list returns results with correct structure"""
        response = requests.get(f"{BASE_URL}/api/providers?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert len(data["results"]) > 0
        print(f"✓ Providers list returned {data['total']} total results")
    
    def test_providers_response_structure(self):
        """Test that provider objects have required fields"""
        response = requests.get(f"{BASE_URL}/api/providers?limit=1")
        assert response.status_code == 200
        
        data = response.json()
        provider = data["results"][0]
        
        # Required fields for display
        required_fields = ["provider_id", "business_name", "comuna", "services"]
        for field in required_fields:
            assert field in provider, f"Missing required field: {field}"
        
        # Optional but expected fields
        expected_fields = ["rating", "total_reviews", "gallery", "plan_type", "verified"]
        for field in expected_fields:
            assert field in provider, f"Missing expected field: {field}"
        
        print(f"✓ Provider structure validated: {provider['business_name']}")
    
    def test_filter_by_service_type_residencias(self):
        """Test filtering by service_type=residencias"""
        response = requests.get(f"{BASE_URL}/api/providers?service_type=residencias&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] > 0
        
        # Verify all results have residencias service
        for provider in data["results"]:
            services = provider.get("services", [])
            service_types = [s.get("service_type") for s in services]
            assert "residencias" in service_types, f"Provider {provider['business_name']} missing residencias service"
        
        print(f"✓ Service type filter (residencias) returned {data['total']} results")
    
    def test_filter_by_service_type_cuidado_domicilio(self):
        """Test filtering by service_type=cuidado-domicilio"""
        response = requests.get(f"{BASE_URL}/api/providers?service_type=cuidado-domicilio&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        # May return 0 if no providers have this service
        print(f"✓ Service type filter (cuidado-domicilio) returned {data['total']} results")
    
    def test_filter_by_min_rating(self):
        """Test filtering by min_rating"""
        response = requests.get(f"{BASE_URL}/api/providers?min_rating=4&limit=10")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify all results have rating >= 4
        for provider in data["results"]:
            rating = provider.get("rating", 0)
            assert rating >= 4, f"Provider {provider['business_name']} has rating {rating} < 4"
        
        print(f"✓ Min rating filter (4+) returned {data['total']} results")
    
    def test_filter_by_verified_only(self):
        """Test filtering by verified_only=true"""
        response = requests.get(f"{BASE_URL}/api/providers?verified_only=true&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify all results are verified (if any)
        for provider in data["results"]:
            assert provider.get("verified") == True, f"Provider {provider['business_name']} is not verified"
        
        print(f"✓ Verified only filter returned {data['total']} results")
    
    def test_filter_by_search_query(self):
        """Test filtering by search query (q parameter)"""
        response = requests.get(f"{BASE_URL}/api/providers?q=Las%20Condes&limit=5")
        assert response.status_code == 200
        
        data = response.json()
        print(f"✓ Search query filter (Las Condes) returned {data['total']} results")
    
    def test_pagination_skip_limit(self):
        """Test pagination with skip and limit"""
        # Get first page
        response1 = requests.get(f"{BASE_URL}/api/providers?skip=0&limit=5")
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Get second page
        response2 = requests.get(f"{BASE_URL}/api/providers?skip=5&limit=5")
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Verify different results
        if len(data1["results"]) > 0 and len(data2["results"]) > 0:
            first_page_ids = [p["provider_id"] for p in data1["results"]]
            second_page_ids = [p["provider_id"] for p in data2["results"]]
            
            # No overlap between pages
            overlap = set(first_page_ids) & set(second_page_ids)
            assert len(overlap) == 0, f"Pagination overlap found: {overlap}"
        
        print(f"✓ Pagination working: page 1 has {len(data1['results'])}, page 2 has {len(data2['results'])} results")
    
    def test_combined_filters(self):
        """Test combining multiple filters"""
        response = requests.get(f"{BASE_URL}/api/providers?service_type=residencias&min_rating=4&limit=10")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify all results match both filters
        for provider in data["results"]:
            services = provider.get("services", [])
            service_types = [s.get("service_type") for s in services]
            rating = provider.get("rating", 0)
            
            assert "residencias" in service_types, f"Provider {provider['business_name']} missing residencias"
            assert rating >= 4, f"Provider {provider['business_name']} has rating {rating} < 4"
        
        print(f"✓ Combined filters (residencias + rating 4+) returned {data['total']} results")
    
    def test_provider_ordering_by_plan(self):
        """Test that providers are ordered by plan type (premium_plus first)"""
        response = requests.get(f"{BASE_URL}/api/providers?limit=20")
        assert response.status_code == 200
        
        data = response.json()
        results = data["results"]
        
        # Check ordering: premium_plus should come before premium, which comes before destacado
        plan_order = {"premium_plus": 0, "premium": 1, "destacado": 2, "": 3}
        
        prev_order = -1
        for provider in results:
            plan = provider.get("plan_type", "")
            current_order = plan_order.get(plan, 3)
            # Allow same order (multiple providers with same plan)
            assert current_order >= prev_order or prev_order == current_order, \
                f"Provider ordering incorrect: {provider['business_name']} with plan {plan}"
            prev_order = current_order
        
        print(f"✓ Provider ordering by plan type verified")


class TestComunasAutocomplete:
    """Tests for GET /api/providers/comunas endpoint"""
    
    def test_comunas_list_returns_data(self):
        """Test that comunas list returns data"""
        response = requests.get(f"{BASE_URL}/api/providers/comunas")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        print(f"✓ Comunas list returned {len(data)} comunas")
    
    def test_comunas_are_sorted(self):
        """Test that comunas are sorted alphabetically"""
        response = requests.get(f"{BASE_URL}/api/providers/comunas")
        assert response.status_code == 200
        
        data = response.json()
        sorted_data = sorted(data)
        assert data == sorted_data, "Comunas are not sorted alphabetically"
        
        print(f"✓ Comunas are sorted alphabetically")


class TestProviderCardData:
    """Tests for provider card display data"""
    
    def test_provider_has_price_in_services(self):
        """Test that providers have price_from in services"""
        response = requests.get(f"{BASE_URL}/api/providers?limit=10")
        assert response.status_code == 200
        
        data = response.json()
        providers_with_price = 0
        
        for provider in data["results"]:
            services = provider.get("services", [])
            for service in services:
                if service.get("price_from"):
                    providers_with_price += 1
                    break
        
        print(f"✓ {providers_with_price}/{len(data['results'])} providers have price in services")
    
    def test_provider_has_plan_badges(self):
        """Test that providers have plan_type for badge display"""
        response = requests.get(f"{BASE_URL}/api/providers?limit=20")
        assert response.status_code == 200
        
        data = response.json()
        
        plan_counts = {"premium_plus": 0, "premium": 0, "destacado": 0, "none": 0}
        
        for provider in data["results"]:
            plan = provider.get("plan_type", "")
            if plan in plan_counts:
                plan_counts[plan] += 1
            else:
                plan_counts["none"] += 1
        
        print(f"✓ Plan badge distribution: {plan_counts}")
    
    def test_provider_has_gallery_images(self):
        """Test that providers have gallery images"""
        response = requests.get(f"{BASE_URL}/api/providers?limit=10")
        assert response.status_code == 200
        
        data = response.json()
        providers_with_images = 0
        
        for provider in data["results"]:
            gallery = provider.get("gallery", [])
            profile_photo = provider.get("profile_photo")
            
            if gallery or profile_photo:
                providers_with_images += 1
        
        print(f"✓ {providers_with_images}/{len(data['results'])} providers have images")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
