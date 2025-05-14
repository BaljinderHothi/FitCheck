import pytest
from playwright.sync_api import sync_playwright, TimeoutError

LOGIN_URL = "http://localhost:3000/login"
DASHBOARD_URL = "http://localhost:3000/dashboard"
TEST_EMAIL = "cipahag174@buides.com"
TEST_PASSWORD = "securepassword123"

def test_login_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 🔐 Visit login page and fill credentials
        page.goto(LOGIN_URL)
        page.fill('input[type="email"]', TEST_EMAIL)
        page.fill('input[type="password"]', TEST_PASSWORD)
        page.get_by_role("button", name="Sign In").click()

        try:
            # ⏳ Wait for redirect with extended timeout
            page.wait_for_url(DASHBOARD_URL, timeout=20000)
            assert "/dashboard" in page.url
            print("✅ Redirected to dashboard")
        except TimeoutError:
            # 🐞 Output full HTML if login fails
            html_content = page.content()
            print(f"❌ Login failed. Page HTML:\n{html_content}")
            page.screenshot(path="login_flow_fail.png")
            assert False, "Login did not redirect to dashboard"

        browser.close()
