import os
from playwright.sync_api import sync_playwright

def inspect():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("file:///" + os.path.abspath("Project_Report_Loyalty_Rewards_System.html").replace("\\", "/"))
        pages = page.query_selector_all(".page")
        print(f"Total HTML .page elements found: {len(pages)}")
        
        # Take a screenshot of page 1, page 2, page 3 to verify visually
        os.makedirs("pdf_preview", exist_ok=True)
        for idx in range(min(5, len(pages))):
            pages[idx].screenshot(path=f"pdf_preview/page_{idx+1}.png")
        print("Saved preview screenshots of first 5 pages.")
        browser.close()

if __name__ == "__main__":
    inspect()
