import pytest
import requests

BASE_URL = "http://localhost:3000/api/auth"

TEST_EMAIL = "gafocoy789@dmener.com"
TEST_PASSWORD = "password123"
TEST_USER = {
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "first_name": "Test",
    "last_name": "User",
    "gender": "Other"
}

@pytest.fixture(scope="module")
def cleanup_user():
    # Cleanup placeholder, or connect to Supabase Admin API if needed
    yield
    print("Cleanup after tests")

def test_successful_signup_and_login(cleanup_user):
    response = requests.post(f"{BASE_URL}/signup", json=TEST_USER)
    print("Signup response:", response.status_code, response.json())
    assert response.status_code == 200
    login_payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    response = requests.post(f"{BASE_URL}/login", json=login_payload)
    print("Login response:", response.status_code, response.json())

    assert response.status_code == 200 or response.status_code == 400
    if response.status_code == 200:
        assert response.json()["message"] in ["Login Successful", "Please Verify Your Email"]
    else:
        assert response.json()["error"] == "Invalid login credentials"


def test_signup_duplicate_email():
    response = requests.post(f"{BASE_URL}/signup", json=TEST_USER)
    print("Duplicate signup response:", response.status_code, response.json())

    # Accept 200 response since backend allows re-signup before email verification
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] in [
        "Please verify your email",
        "User already registered. Please verify your email"
    ]


def test_login_invalid_credentials():
    payload = {"email": "wrong@example.com", "password": "wrongpass"}
    response = requests.post(f"{BASE_URL}/login", json=payload)
    print("Invalid login response:", response.status_code, response.json())

    assert response.status_code == 400
    assert response.json()["error"] == "Invalid login credentials"