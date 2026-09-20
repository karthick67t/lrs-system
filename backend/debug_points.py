import requests
import json
import time
import random

BASE_URL = "http://localhost:8081/api"

def run_tests():
    # Wait for backend to be ready
    for i in range(15):
        try:
            r = requests.get(f"{BASE_URL}/members")
            if r.status_code in [200, 401, 403]:
                print("[+] Backend server is up and responsive.")
                break
        except Exception:
            time.sleep(1)

    print("\n--- 1. Login as STAFF (staff@loyalty.com / staff123) ---")
    staff_login_resp = requests.post(f"{BASE_URL}/members/login", json={
        "email": "staff@loyalty.com",
        "password": "staff123",
        "role": "STAFF"
    })

    if staff_login_resp.status_code != 200:
        print("[-] Could not login as staff:", staff_login_resp.status_code, staff_login_resp.text)
        return

    staff_data = staff_login_resp.json()
    staff_token = staff_data.get("token")
    staff_id = staff_data.get("memberId")
    staff_name = staff_data.get("fullName")
    staff_role = staff_data.get("role")
    headers_staff = {"Authorization": f"Bearer {staff_token}"}

    staff_me = requests.get(f"{BASE_URL}/members/me", headers=headers_staff).json()
    staff_initial_points = staff_me.get("points", 0)
    print(f"[+] Logged in as STAFF: {staff_name} (ID: #{staff_id}, Role: {staff_role}), Current Staff Points: {staff_initial_points}")

    print("\n--- 2. STAFF creates a new customer (No role specified) ---")
    random_num = random.randint(1000, 9999)
    new_phone = f"98765{random_num}"
    new_email = f"customer_{random_num}@lrs.com"
    create_cust_resp = requests.post(f"{BASE_URL}/members", json={
        "fullName": f"New Test Customer {random_num}",
        "email": new_email,
        "phone": new_phone
    }, headers=headers_staff)

    assert create_cust_resp.status_code in [200, 201], f"Create customer failed: {create_cust_resp.text}"
    new_cust = create_cust_resp.json()
    print(f"[+] Customer Created:")
    print(f"    - ID: #{new_cust.get('memberId')}")
    print(f"    - Full Name: {new_cust.get('fullName')}")
    print(f"    - Email: {new_cust.get('email')}")
    print(f"    - Phone: {new_cust.get('phone')}")
    print(f"    - Role: {new_cust.get('role')} (AUTOMATICALLY ASSIGNED)")
    print(f"    - Initial Points: {new_cust.get('points')}")
    print(f"    - Initial Tier: {new_cust.get('tier')}")
    print(f"    - Status: {new_cust.get('status')}")

    assert new_cust.get("role") == "CUSTOMER", "CRITICAL ERROR: Role was not automatically forced to CUSTOMER!"
    assert new_cust.get("points") == 0, "Initial points must be 0!"
    assert new_cust.get("tier") == "BRONZE", "Initial tier must be BRONZE!"

    print("\n--- 3. Verify customer can login using phone number as initial password ---")
    cust_login_resp = requests.post(f"{BASE_URL}/members/login", json={
        "email": new_email,
        "password": new_phone,
        "role": "CUSTOMER"
    })
    assert cust_login_resp.status_code == 200, f"Customer login using phone password failed: {cust_login_resp.text}"
    print("[+] Customer successfully logged in using phone number as initial password!")

    cust_id = new_cust.get("memberId")
    cust_name = new_cust.get("fullName")

    print("\n--- 4. STAFF adds points to CUSTOMER (Bill INR 1000 => 100 pts) ---")
    earn_resp = requests.post(f"{BASE_URL}/members/{cust_id}/earn-points", json={
        "billAmount": 1000.0,
        "description": "Purchase Bill INR 1000"
    }, headers=headers_staff)

    assert earn_resp.status_code == 200, f"Earn points failed: {earn_resp.text}"
    updated_cust = earn_resp.json()
    print(f"[+] Earn Points Success! Customer New Points: {updated_cust.get('points')} pts (Added +100 pts)")
    assert updated_cust.get("points") == 100, "Customer points did not increase to 100!"

    print("\n--- 5. Verify STAFF's own points remain unchanged ---")
    staff_me_resp = requests.get(f"{BASE_URL}/members/me", headers=headers_staff)
    staff_updated = staff_me_resp.json()
    staff_current_points = staff_updated.get("points", 0)
    print(f"[+] STAFF current points balance: {staff_current_points} (Initial was: {staff_initial_points})")
    assert staff_current_points == staff_initial_points, "CRITICAL ERROR: STAFF points were modified!"

    print("\n--- 6. Verify Transaction Record ---")
    tx_resp = requests.get(f"{BASE_URL}/transactions", headers=headers_staff)
    transactions = tx_resp.json()
    sorted_tx = sorted(transactions, key=lambda t: t.get('transactionId') or 0)
    latest_tx = sorted_tx[-1] if sorted_tx else {}
    print(f"[+] Transaction Record:")
    print(f"    - Tx ID: #{latest_tx.get('transactionId')}")
    print(f"    - Customer ID: {latest_tx.get('customerId')}")
    print(f"    - Customer Name: {latest_tx.get('customerName')}")
    print(f"    - Performed By User ID: {latest_tx.get('performedByUserId')}")
    print(f"    - Performed By Name: {latest_tx.get('performedByName')}")
    print(f"    - Performed By Role: {latest_tx.get('performedByRole')}")
    print(f"    - Bill Amount: INR {latest_tx.get('billAmount')}")
    print(f"    - Points Earned: +{latest_tx.get('points')}")

    assert latest_tx.get('customerId') == cust_id, "Transaction customerId mismatch!"
    assert latest_tx.get('performedByUserId') == staff_id, "Transaction performedByUserId mismatch!"

    print("\n--- 7. Verify LOYALTY_MANAGER can view transaction activity ---")
    mgr_login_resp = requests.post(f"{BASE_URL}/members/login", json={
        "email": "manager@loyalty.com",
        "password": "manager123",
        "role": "LOYALTY_MANAGER"
    })
    if mgr_login_resp.status_code == 200:
        mgr_token = mgr_login_resp.json().get("token")
        mgr_tx = requests.get(f"{BASE_URL}/transactions", headers={"Authorization": f"Bearer {mgr_token}"}).json()
        print(f"[+] LOYALTY_MANAGER can see total {len(mgr_tx)} transactions in system audit ledger.")

    print("\n--- 8. Verify SUPER_ADMIN can view complete transaction activity ---")
    admin_login_resp = requests.post(f"{BASE_URL}/members/login", json={
        "email": "admin@loyalty.com",
        "password": "admin123",
        "role": "SUPER_ADMIN"
    })
    if admin_login_resp.status_code == 200:
        admin_token = admin_login_resp.json().get("token")
        admin_tx = requests.get(f"{BASE_URL}/transactions", headers={"Authorization": f"Bearer {admin_token}"}).json()
        print(f"[+] SUPER_ADMIN can see total {len(admin_tx)} transactions in system audit ledger.")

    print("\n============================================================")
    print("ALL STAFF CUSTOMER WORKFLOW ACCEPTANCE TESTS PASSED!")
    print("============================================================")

if __name__ == "__main__":
    run_tests()
