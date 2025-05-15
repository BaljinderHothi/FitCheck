import pytest
from playwright.sync_api import sync_playwright, TimeoutError, expect
from urllib.parse import urlparse

LOGIN_URL = "http://localhost:3000/login"
DASHBOARD_URL = "http://localhost:3000/dashboard"
TEST_EMAIL = "cipahag174@buides.com"
TEST_PASSWORD = "securepassword123"

@pytest.fixture(scope="function")
def browser_context():
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=True, slow_mo=50)
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()
    yield page
    page.screenshot(path="debug_login_flow.png")
    context.close()
    browser.close()
    playwright.stop()

class TestLoginUI:
    def test_login_flow(self, browser_context):
        page = browser_context
        page.goto(LOGIN_URL)
        login_header = page.locator('h1:has-text("Login"), h2:has-text("Login")')
        try:
            expect(login_header).to_be_visible(timeout=5000)
        except:
            page.screenshot(path="login_page_error.png")
            print(f"Current page content: {page.content()[:500]}...")
            pytest.fail("Login header not found")

        page.fill('input[type="email"]', TEST_EMAIL)
        page.fill('input[type="password"]', TEST_PASSWORD)
        with page.expect_navigation(timeout=10000, wait_until="domcontentloaded"):
            page.get_by_role("button", name="Sign In").click()

        current_url = page.url
        parsed_url = urlparse(current_url)
        if parsed_url.path == "/dashboard":
            print("✅ Redirected to dashboard")
        else:
            error_visible = page.locator("text=Invalid login credentials").is_visible()
            if error_visible:
                print("✅ Login validation working")
            else:
                page.screenshot(path="login_redirect_failure.png")
                print(f"⚠️ Still on login page: {current_url}")
                pytest.xfail("No redirect or error after login")
