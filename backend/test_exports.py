import requests
import json
import sys

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8081"

def login(email, password, role):
    url = f"{BASE_URL}/api/members/login"
    resp = requests.post(url, json={"email": email, "password": password, "role": role})
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("token")
        member = data.get("member", {})
        print(f"[AUTH OK] Logged in as {email}")
        return token
    else:
        print(f"[AUTH FAIL] {email}: HTTP {resp.status_code} - {resp.text}")
        return None

def test_export():
    print("--- 1. Testing Authentications ---")
    admin_token = login("admin@loyalty.com", "admin123", "SUPER_ADMIN")
    manager_token = login("manager@loyalty.com", "manager123", "LOYALTY_MANAGER")
    staff_token = login("staff@loyalty.com", "staff123", "STAFF")
    customer_token = login("customer@loyalty.com", "customer123", "CUSTOMER")

    if not admin_token:
        print("ERROR: Admin login failed!")
        sys.exit(1)

    print("\n--- 2. SUPER_ADMIN CSV Export Test ---")
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    r_csv = requests.get(f"{BASE_URL}/api/transactions/export/csv", headers=headers_admin)
    print(f"Status: {r_csv.status_code}")
    print(f"Content-Type: {r_csv.headers.get('Content-Type')}")
    print(f"Content-Disposition: {r_csv.headers.get('Content-Disposition')}")
    csv_text = r_csv.text
    print(f"CSV Size: {len(csv_text)} chars")
    print("CSV Content Preview:")
    for line in csv_text.splitlines()[:5]:
        print("  ", line)

    assert r_csv.status_code == 200, "CSV Export failed for SUPER_ADMIN"
    assert "Transaction ID" in csv_text, "Missing CSV header"

    print("\n--- 3. SUPER_ADMIN PDF Export Test ---")
    r_pdf = requests.get(f"{BASE_URL}/api/transactions/export/pdf", headers=headers_admin)
    print(f"Status: {r_pdf.status_code}")
    print(f"Content-Type: {r_pdf.headers.get('Content-Type')}")
    print(f"Content-Disposition: {r_pdf.headers.get('Content-Disposition')}")
    print(f"PDF Payload Size: {len(r_pdf.content)} bytes")
    assert r_pdf.status_code == 200, "PDF Export failed for SUPER_ADMIN"
    assert r_pdf.content.startswith(b"%PDF"), "Invalid PDF payload"

    print("\n--- 4. SUPER_ADMIN Filtered Export Test (transactionType=EARN) ---")
    r_earn = requests.get(f"{BASE_URL}/api/transactions/export/csv?transactionType=EARN", headers=headers_admin)
    print(f"Status: {r_earn.status_code}")
    earn_text = r_earn.text
    print("EARN Filter CSV Rows:")
    for line in earn_text.splitlines():
        print("  ", line)
    assert r_earn.status_code == 200
    assert "EARN" in earn_text
    assert "REDEEM" not in earn_text, "Filtered CSV contains REDEEM transactions"

    print("\n--- 5. Security Access Denied Verification (HTTP 403) ---")
    for role_name, token in [("LOYALTY_MANAGER", manager_token), ("STAFF", staff_token), ("CUSTOMER", customer_token)]:
        if token:
            h = {"Authorization": f"Bearer {token}"}
            r_deny_csv = requests.get(f"{BASE_URL}/api/transactions/export/csv", headers=h)
            r_deny_pdf = requests.get(f"{BASE_URL}/api/transactions/export/pdf", headers=h)
            print(f"Role {role_name} CSV Export -> HTTP {r_deny_csv.status_code}")
            print(f"Role {role_name} PDF Export -> HTTP {r_deny_pdf.status_code}")
            assert r_deny_csv.status_code == 403, f"{role_name} CSV Export should return 403"
            assert r_deny_pdf.status_code == 403, f"{role_name} PDF Export should return 403"

    print("\n--- 6. Validation Error Checks ---")
    r_invalid_date = requests.get(f"{BASE_URL}/api/transactions/export/csv?startDate=2026-09-10&endDate=2026-09-01", headers=headers_admin)
    print(f"Invalid Date Range -> HTTP {r_invalid_date.status_code} ({r_invalid_date.text})")
    assert r_invalid_date.status_code == 400

    r_invalid_points = requests.get(f"{BASE_URL}/api/transactions/export/csv?minPoints=1000&maxPoints=100", headers=headers_admin)
    print(f"Invalid Points Range -> HTTP {r_invalid_points.status_code} ({r_invalid_points.text})")
    assert r_invalid_points.status_code == 400

    print("\n==========================================")
    print("ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    test_export()
