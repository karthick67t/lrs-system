import os
import sys
from playwright.sync_api import sync_playwright

def generate_pdf():
    html_path = os.path.abspath("Project_Report_Loyalty_Rewards_System.html")
    pdf_path = os.path.abspath("Project_Report_Loyalty_Rewards_System.pdf")
    
    print(f"Reading HTML from: {html_path}")
    print(f"Generating PDF to: {pdf_path}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to local html file
        page.goto(f"file:///{html_path.replace('\\', '/')}", wait_until="networkidle")
        
        # Generate PDF with exact A4 dimensions and background colors enabled
        page.pdf(
            path=pdf_path,
            format="A4",
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"}
        )
        browser.close()
        
    if os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: PDF generated! File size: {size_kb:.2f} KB")
    else:
        print("ERROR: Failed to generate PDF file.")

if __name__ == "__main__":
    generate_pdf()
