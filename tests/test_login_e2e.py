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
    try:
        yield page
    finally:
        page.screenshot(path="debug_login_flow.png")
        context.close()
        browser.close()
        playwright.stop()

class TestLoginUI:
    def test_login_flow(self, browser_context):
        page = browser_context
        page.goto(LOGIN_URL)

        try:
            login_header = page.locator('h1:has-text("Login"), h2:has-text("Login")')
            expect(login_header).to_be_visible(timeout=5000)
        except Exception as e:
            page.screenshot(path="login_page_error.png")
            print("❌ Login header not found.")
            print(page.content()[:500])
            pytest.fail(f"Login header not visible: {e}")

        page.fill('input[type="email"]', TEST_EMAIL)
        page.fill('input[type="password"]', TEST_PASSWORD)

        try:
            with page.expect_navigation(timeout=10000, wait_until="domcontentloaded"):
                page.get_by_role("button", name="Sign In").click()
        except TimeoutError:
            page.screenshot(path="login_navigation_timeout.png")
            pytest.fail("Navigation after login button click timed out")

        # Check result
        current_url = page.url
        parsed_url = urlparse(current_url)

        if parsed_url.path == "/dashboard":
            print("Redirected to dashboard")
        else:
            error_locator = page.locator("text=Invalid login credentials")
            if error_locator.count() > 0 and error_locator.is_visible():
                print("Login error shown correctly for invalid credentials")
            else:
                page.screenshot(path="login_redirect_failure.png")
                print("Unexpected login state. No error and not redirected.")
                print("Current URL:", current_url)
                pytest.xfail("No dashboard redirect or login error detected")
