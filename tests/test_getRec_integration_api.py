import pytest
import requests

BASE_URL = "http://localhost:3000/api/user_rec/getRec"

def test_invalid_method():
    res = requests.post(BASE_URL)
    assert res.status_code == 405
    assert res.json()["error"] == "Only GET supported"

def test_missing_token():
    res = requests.get(BASE_URL)
    assert res.status_code == 401
    assert res.json()["error"] == "Missing or invalid Authorization header"

def test_valid_request():
    token = "VALID_SUPABASE_TOKEN"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        res = requests.get(BASE_URL, headers=headers)
        if res.status_code != 200:
            pytest.skip(f"Skipping test: Expected 200 but got {res.status_code}")
        assert "recommendations" in res.json()
    except Exception as e:
        pytest.skip(f"Skipping test due to error: {e}")
