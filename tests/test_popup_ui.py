from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError

def test_review_submission_ui():
    extension_path = str(Path(__file__).parent.parent / "amazon-order-csv")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir="/tmp/chrome-profile",
            headless=True,  # ✅ MUST be headless in CI
            args=[
                f"--disable-extensions-except={extension_path}",
                f"--load-extension={extension_path}",
            ]
        )

        # Step 1: Trigger extension service worker by visiting any page
        trigger_page = context.new_page()
        trigger_page.goto("https://www.amazon.com")
        trigger_page.wait_for_timeout(3000)

        # Step 2: Extract extension ID
        extension_id = None
        for bg in context.service_workers:
            if "chrome-extension://" in bg.url:
                extension_id = bg.url.split("/")[2]
                print("Detected Extension ID:", extension_id)
                break

        assert extension_id, "❌ Extension ID could not be detected"

        # Step 3: Navigate to the extension popup
        popup_url = f"chrome-extension://{extension_id}/check.html"
        popup_page = context.new_page()
        popup_page.goto(popup_url)
        popup_page.wait_for_timeout(3000)
        popup_page.screenshot(path="popup_ui_debug.png")

        current_url = popup_page.url
        print("🧭 Final page:", current_url)

        try:
            if "popup.html" in current_url:
                assert popup_page.locator("text=Fitcheck").is_visible()
                print("✅ Landed on popup.html successfully")
            elif "login.html" in current_url:
                assert popup_page.get_by_role("heading", name="Login").is_visible()
                print("✅ Landed on login.html as expected")
            else:
                raise AssertionError("❌ Unexpected final page: " + current_url)
        except TimeoutError:
            popup_page.screenshot(path="popup_ui_timeout.png")
            raise AssertionError("❌ Element not found on popup or login page")

        context.close()
