#!/usr/bin/env python3
"""
CAMARTES Photography Ecosystem Backend API Tests
Tests all authentication and profile endpoints
"""

import requests
import json
import time
import sys
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://dual-platform-app-7.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.results.append(result)
        print(f"{status} {test_name}: {message}")
        if response_data:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()
        
    def test_health_check(self):
        """Test basic connectivity"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                self.log_result("Health Check", True, "Backend is accessible", response.json())
                return True
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_send_signup_otp(self):
        """Test POST /api/auth/send-signup-otp"""
        import time
        timestamp = str(int(time.time()))
        test_email = f"john.doe.{timestamp}@camartes.com"
        test_phone = f"+123456{timestamp[-4:]}"
        
        payload = {
            "email": test_email,
            "phone": test_phone
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/send-signup-otp",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "otp" in data:
                    self.test_data["signup_otp"] = data["otp"]
                    self.test_data["signup_email"] = test_email
                    self.test_data["signup_phone"] = test_phone
                    self.log_result("Send Signup OTP", True, "OTP sent successfully", data)
                    return True
                else:
                    self.log_result("Send Signup OTP", False, "No OTP in response", data)
                    return False
            else:
                self.log_result("Send Signup OTP", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Send Signup OTP", False, f"Request error: {str(e)}")
            return False
    
    def test_signup(self):
        """Test POST /api/auth/signup"""
        if "signup_otp" not in self.test_data:
            self.log_result("Signup", False, "No OTP available from previous test")
            return False
            
        payload = {
            "fullName": "John Doe",
            "phone": self.test_data["signup_phone"],
            "email": self.test_data["signup_email"],
            "password": "SecurePass123!",
            "confirmPassword": "SecurePass123!",
            "referenceId": "REF001",
            "otp": self.test_data["signup_otp"]
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/signup",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.test_data["user_email"] = self.test_data["signup_email"]
                self.test_data["user_phone"] = self.test_data["signup_phone"]
                self.test_data["user_password"] = "SecurePass123!"
                self.log_result("Signup", True, "User created successfully", data)
                return True
            else:
                self.log_result("Signup", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Signup", False, f"Request error: {str(e)}")
            return False
    
    def test_login_with_password_email(self):
        """Test POST /api/auth/login with email and password"""
        if "user_email" not in self.test_data:
            self.log_result("Login with Email+Password", False, "No user data available")
            return False
            
        payload = {
            "identifier": self.test_data["user_email"],
            "password": self.test_data["user_password"],
            "type": "email"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "token" in data["user"]:
                    self.test_data["user_id"] = data["user"]["id"]
                    self.test_data["user_token"] = data["user"]["token"]
                    self.log_result("Login with Email+Password", True, "Login successful", data)
                    return True
                else:
                    self.log_result("Login with Email+Password", False, "Missing user data or token", data)
                    return False
            else:
                self.log_result("Login with Email+Password", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Login with Email+Password", False, f"Request error: {str(e)}")
            return False
    
    def test_login_with_password_phone(self):
        """Test POST /api/auth/login with phone and password"""
        if "user_phone" not in self.test_data:
            self.log_result("Login with Phone+Password", False, "No user data available")
            return False
            
        payload = {
            "identifier": self.test_data["user_phone"],
            "password": self.test_data["user_password"],
            "type": "phone"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Login with Phone+Password", True, "Login successful", data)
                return True
            else:
                self.log_result("Login with Phone+Password", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Login with Phone+Password", False, f"Request error: {str(e)}")
            return False
    
    def test_send_login_otp_email(self):
        """Test POST /api/auth/send-otp for email"""
        if "user_email" not in self.test_data:
            self.log_result("Send Login OTP (Email)", False, "No user email available")
            return False
            
        payload = {
            "identifier": self.test_data["user_email"],
            "type": "email"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/send-otp",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "otp" in data:
                    self.test_data["login_otp_email"] = data["otp"]
                    self.log_result("Send Login OTP (Email)", True, "OTP sent successfully", data)
                    return True
                else:
                    self.log_result("Send Login OTP (Email)", False, "No OTP in response", data)
                    return False
            else:
                self.log_result("Send Login OTP (Email)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Send Login OTP (Email)", False, f"Request error: {str(e)}")
            return False
    
    def test_send_login_otp_phone(self):
        """Test POST /api/auth/send-otp for phone"""
        if "user_phone" not in self.test_data:
            self.log_result("Send Login OTP (Phone)", False, "No user phone available")
            return False
            
        payload = {
            "identifier": self.test_data["user_phone"],
            "type": "phone"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/send-otp",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "otp" in data:
                    self.test_data["login_otp_phone"] = data["otp"]
                    self.log_result("Send Login OTP (Phone)", True, "OTP sent successfully", data)
                    return True
                else:
                    self.log_result("Send Login OTP (Phone)", False, "No OTP in response", data)
                    return False
            else:
                self.log_result("Send Login OTP (Phone)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Send Login OTP (Phone)", False, f"Request error: {str(e)}")
            return False
    
    def test_login_with_otp_email(self):
        """Test POST /api/auth/login with email and OTP"""
        if "login_otp_email" not in self.test_data:
            self.log_result("Login with Email+OTP", False, "No OTP available")
            return False
            
        payload = {
            "identifier": self.test_data["user_email"],
            "otp": self.test_data["login_otp_email"],
            "type": "email"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Login with Email+OTP", True, "Login successful", data)
                return True
            else:
                self.log_result("Login with Email+OTP", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Login with Email+OTP", False, f"Request error: {str(e)}")
            return False
    
    def test_login_with_otp_phone(self):
        """Test POST /api/auth/login with phone and OTP"""
        if "login_otp_phone" not in self.test_data:
            self.log_result("Login with Phone+OTP", False, "No OTP available")
            return False
            
        payload = {
            "identifier": self.test_data["user_phone"],
            "otp": self.test_data["login_otp_phone"],
            "type": "phone"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Login with Phone+OTP", True, "Login successful", data)
                return True
            else:
                self.log_result("Login with Phone+OTP", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Login with Phone+OTP", False, f"Request error: {str(e)}")
            return False
    
    def test_save_freelancer_profile(self):
        """Test POST /api/profile/initial-selection with freelancer services"""
        if "user_id" not in self.test_data:
            self.log_result("Save Freelancer Profile", False, "No user ID available")
            return False
            
        payload = {
            "userId": self.test_data["user_id"],
            "profileType": ["freelancer"],
            "freelancerServices": ["Wedding Photography", "Portrait Photography", "Event Photography"],
            "businessServices": []
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/profile/initial-selection",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Save Freelancer Profile", True, "Profile saved successfully", data)
                return True
            else:
                self.log_result("Save Freelancer Profile", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Save Freelancer Profile", False, f"Request error: {str(e)}")
            return False
    
    def test_save_business_profile(self):
        """Test POST /api/profile/initial-selection with business services"""
        if "user_id" not in self.test_data:
            self.log_result("Save Business Profile", False, "No user ID available")
            return False
            
        payload = {
            "userId": self.test_data["user_id"],
            "profileType": ["business"],
            "freelancerServices": [],
            "businessServices": ["Photography Studio", "Equipment Rental", "Photo Editing Services"]
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/profile/initial-selection",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Save Business Profile", True, "Profile saved successfully", data)
                return True
            else:
                self.log_result("Save Business Profile", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Save Business Profile", False, f"Request error: {str(e)}")
            return False
    
    def test_save_mixed_profile(self):
        """Test POST /api/profile/initial-selection with both freelancer and business services"""
        if "user_id" not in self.test_data:
            self.log_result("Save Mixed Profile", False, "No user ID available")
            return False
            
        payload = {
            "userId": self.test_data["user_id"],
            "profileType": ["freelancer", "business"],
            "freelancerServices": ["Wedding Photography", "Portrait Photography"],
            "businessServices": ["Photography Studio", "Equipment Rental"]
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/profile/initial-selection",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Save Mixed Profile", True, "Profile saved successfully", data)
                return True
            else:
                self.log_result("Save Mixed Profile", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Save Mixed Profile", False, f"Request error: {str(e)}")
            return False
    
    def test_get_profile(self):
        """Test GET /api/profile/{user_id}"""
        if "user_id" not in self.test_data:
            self.log_result("Get Profile", False, "No user ID available")
            return False
            
        try:
            response = self.session.get(
                f"{BACKEND_URL}/profile/{self.test_data['user_id']}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Profile", True, "Profile retrieved successfully", data)
                return True
            else:
                self.log_result("Get Profile", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Profile", False, f"Request error: {str(e)}")
            return False
    
    def test_error_cases(self):
        """Test various error scenarios"""
        print("\n=== Testing Error Cases ===")
        
        # Test invalid OTP for signup
        payload = {
            "fullName": "Test User",
            "phone": "+9999999999",
            "email": "test@invalid.com",
            "password": "password123",
            "confirmPassword": "password123",
            "otp": "000000"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/signup", json=payload, timeout=10)
            if response.status_code == 400:
                self.log_result("Invalid OTP Error", True, "Correctly rejected invalid OTP")
            else:
                self.log_result("Invalid OTP Error", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_result("Invalid OTP Error", False, f"Request error: {str(e)}")
        
        # Test login with wrong password
        payload = {
            "identifier": self.test_data.get("user_email", "test@test.com"),
            "password": "wrongpassword",
            "type": "email"
        }
        
        try:
            response = self.session.post(f"{BACKEND_URL}/auth/login", json=payload, timeout=10)
            if response.status_code == 401:
                self.log_result("Wrong Password Error", True, "Correctly rejected wrong password")
            else:
                self.log_result("Wrong Password Error", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_result("Wrong Password Error", False, f"Request error: {str(e)}")
        
        # Test profile for non-existent user
        try:
            response = self.session.get(f"{BACKEND_URL}/profile/non-existent-user-id", timeout=10)
            if response.status_code == 404:
                self.log_result("Non-existent Profile Error", True, "Correctly returned 404 for non-existent profile")
            else:
                self.log_result("Non-existent Profile Error", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_result("Non-existent Profile Error", False, f"Request error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting CAMARTES Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Backend not accessible. Stopping tests.")
            return False
        
        print("\n=== Authentication Flow Tests ===")
        
        # Main authentication flow
        success_count = 0
        total_tests = 0
        
        tests = [
            self.test_send_signup_otp,
            self.test_signup,
            self.test_login_with_password_email,
            self.test_login_with_password_phone,
            self.test_send_login_otp_email,
            self.test_login_with_otp_email,
            self.test_send_login_otp_phone,
            self.test_login_with_otp_phone,
            self.test_save_freelancer_profile,
            self.test_save_business_profile,
            self.test_save_mixed_profile,
            self.test_get_profile
        ]
        
        for test in tests:
            total_tests += 1
            if test():
                success_count += 1
            time.sleep(1)  # Small delay between tests
        
        # Error case tests
        self.test_error_cases()
        
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {success_count}/{total_tests} core tests passed")
        
        # Print failed tests
        failed_tests = [r for r in self.results if "❌ FAIL" in r["status"]]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['message']}")
        
        return success_count == total_tests

def main():
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ All core backend tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()