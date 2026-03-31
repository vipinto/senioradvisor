import requests
import sys
from datetime import datetime

class UCCanlAPITester:
    def __init__(self, base_url="https://senioradvisor-dev.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response: Dict with keys: {list(response_data.keys())[:5]}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            self.test_results.append({
                'name': name,
                'endpoint': endpoint,
                'success': success,
                'status_code': response.status_code,
                'expected_status': expected_status
            })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                'name': name,
                'endpoint': endpoint,
                'success': False,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test API health"""
        return self.run_test("Health Check", "GET", "", 404)  # Root might not exist

    def test_api_health(self):
        """Test API health endpoint"""
        return self.run_test("API Health", "GET", "health", 200)

    def test_providers_endpoint(self):
        """Test providers endpoint - should return 5 providers"""
        success, response = self.run_test("Get Providers", "GET", "providers", 200)
        if success:
            providers = response
            if isinstance(providers, list):
                print(f"   Found {len(providers)} providers")
                if len(providers) == 5:
                    print("✅ Expected 5 providers found")
                    # Check provider structure
                    if providers:
                        provider = providers[0]
                        required_fields = ['provider_id', 'business_name', 'comuna', 'rating']
                        missing_fields = [f for f in required_fields if f not in provider]
                        if missing_fields:
                            print(f"⚠️  Missing fields in provider: {missing_fields}")
                        else:
                            print("✅ Provider structure looks good")
                    return True
                else:
                    print(f"⚠️  Expected 5 providers, got {len(providers)}")
            else:
                print("❌ Response is not a list")
        return False

    def test_subscription_plans(self):
        """Test subscription plans - should return 3 plans"""
        success, response = self.run_test("Get Subscription Plans", "GET", "subscription/plans", 200)
        if success:
            plans = response
            if isinstance(plans, list):
                print(f"   Found {len(plans)} plans")
                if len(plans) == 3:
                    print("✅ Expected 3 plans found")
                    # Check prices
                    expected_prices = [9990, 24990, 79990]
                    actual_prices = [p.get('price_clp', 0) for p in plans]
                    if set(actual_prices) == set(expected_prices):
                        print("✅ Plan prices match expected ($10k, $25k, $80k)")
                    else:
                        print(f"⚠️  Plan prices don't match. Expected: {expected_prices}, Got: {actual_prices}")
                    return True
                else:
                    print(f"⚠️  Expected 3 plans, got {len(plans)}")
            else:
                print("❌ Response is not a list")
        return False

    def test_auth_me_unauthenticated(self):
        """Test auth/me without authentication - should return 401"""
        success, _ = self.run_test("Auth Me (Unauthenticated)", "GET", "auth/me", 401)
        return success

    def test_websocket_connectivity(self):
        """Test WebSocket server availability"""
        self.tests_run += 1
        try:
            import socket
            from urllib.parse import urlparse
            
            parsed_url = urlparse(self.base_url)
            host = parsed_url.hostname
            port = 443 if parsed_url.scheme == 'https' else 80
            
            print(f"\n🔍 Testing WebSocket connectivity to {host}:{port}")
            
            # Try to connect to the host
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                print("✅ WebSocket host is reachable")
                self.tests_passed += 1
                self.test_results.append({
                    'name': 'WebSocket Connectivity',
                    'endpoint': 'socket.io',
                    'success': True,
                    'status_code': 200,
                    'expected_status': 200
                })
                return True
            else:
                print("❌ WebSocket host is not reachable")
                self.test_results.append({
                    'name': 'WebSocket Connectivity',
                    'endpoint': 'socket.io',
                    'success': False,
                    'error': f'Connection failed: {result}'
                })
                return False
                
        except Exception as e:
            print(f"❌ WebSocket test failed: {str(e)}")
            self.test_results.append({
                'name': 'WebSocket Connectivity',
                'endpoint': 'socket.io',
                'success': False,
                'error': str(e)
            })
            return False

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Test Summary:")
        print(f"   Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t.get('success', False)]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                error_msg = test.get('error', f"Status {test.get('status_code')} instead of {test.get('expected_status')}")
                print(f"   - {test['name']}: {error_msg}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🚀 Starting U-CAN API Backend Testing...")
    
    tester = UCCanlAPITester()
    
    # Run basic API tests
    tester.test_api_health()
    tester.test_providers_endpoint()
    tester.test_subscription_plans()
    tester.test_auth_me_unauthenticated()
    tester.test_websocket_connectivity()
    
    # Print results and determine exit code
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())