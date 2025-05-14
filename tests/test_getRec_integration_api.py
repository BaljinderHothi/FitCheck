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

@pytest.mark.skip(reason="Requires valid Supabase token")
def test_valid_request():
    token = "VALID_SUPABASE_TOKEN"
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(BASE_URL, headers=headers)
    assert res.status_code == 200
    assert "recommendations" in res.json()
