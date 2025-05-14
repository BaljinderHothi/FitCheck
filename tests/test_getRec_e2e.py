from playwright.sync_api import sync_playwright, TimeoutError

def test_rec_endpoint_via_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.goto("http://localhost:3000/login")
        page.fill('input[type="email"]', "cipahag174@buides.com")
        page.fill('input[type="password"]', "securepassword123")
        page.get_by_role("button", name="Sign In").click()
        page.wait_for_timeout(3000)
        page.goto("http://localhost:3000/dashboard")
        page.wait_for_timeout(11000) 
        try:
            page.wait_for_selector("h2:has-text('Recommended for You')", timeout=10000)
            assert page.locator("h2:has-text('Recommended for You')").is_visible()
            print("✅ Recommendation section is visible")
        except TimeoutError:
            print("❌ Recommendation header not found")
            page.screenshot(path="rec_ui_fail.png")
            assert False, "Recommended for You section not visible"

        browser.close()
