import requests

BASE_URL = "http://localhost:3000/api"

def test_login_endpoint():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "gafocoy789@dmener.com", "password": "password123"}
    )
    assert response.status_code == 200
    response_data = response.json()
    assert "message" in response_data and response_data["message"] == "Login Successful"
    assert "user" in response_data  

def test_missing_email():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"password": "password123"}  # Missing email
    )
    assert response.status_code == 400  # Bad Request
    response_data = response.json()
    assert "error" in response_data and response_data["error"] == "Email and password are required"

def test_missing_password():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "gafocoy789@dmener.com"}  # Missing password
    )
    assert response.status_code == 400  # Bad Request
    response_data = response.json()
    assert "error" in response_data and response_data["error"] == "Email and password are required"

def test_invalid_login():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "gafocoy789@dmener.com", "password": "wrongpassword"}
    )
    assert response.status_code == 400  # Invalid credentials, so we expect a 400 status code
    response_data = response.json()
    assert "error" in response_data and response_data["error"] == "Invalid login credentials"
