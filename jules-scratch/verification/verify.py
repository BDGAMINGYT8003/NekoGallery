from playwright.sync_api import sync_playwright, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console events
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    try:
        page.goto("http://localhost:5000")

        # Wait for the first image to be visible
        page.wait_for_selector('div.relative.w-full > img', timeout=60000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
    except TimeoutError:
        print("Timeout waiting for Image. Page content:")
        print(page.content())
        raise
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
