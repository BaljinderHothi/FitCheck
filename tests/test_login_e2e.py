import pytest
from playwright.sync_api import sync_playwright

LOGIN_URL = "http://localhost:3000/login"
TEST_EMAIL = "cipahag174@buides.com"
TEST_PASSWORD = "securepassword123"

def test_login_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # set to True for CI
        page = browser.new_page()

        # Go to login page and fill credentials
        page.goto(LOGIN_URL)
        page.fill('input[type="email"]', TEST_EMAIL)
        page.fill('input[type="password"]', TEST_PASSWORD)
        page.get_by_role("button", name="Sign In").click()

        # Wait long enough for redirect to happen
        page.wait_for_timeout(4000)

        # ✅ Assert that we left the login page
        assert "/dashboard" in page.url

        browser.close()
