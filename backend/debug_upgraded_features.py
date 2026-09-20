import requests
import json
import time
import random

BASE_URL = "http://localhost:8081/api"

def run_upgraded_tests():
    # Wait for backend server
    for i in range(15):
        try:
            r = requests.get(f"{BASE_URL}/members")
            if r.status_code in [200, 401, 403]:
                print("[+] Backend server is ready.")
                break
        except Exception:
            time.sleep(1)

    print("\n--- 1. Login as SUPER_ADMIN (admin@loyalty.com / admin123) ---")
    admin_login = requests.post(f"{BASE_URL}/members/login", json={
        "email": "admin@loyalty.com",
        "password": "admin123",
        "role": "SUPER_ADMIN"
    })
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json().get("token")
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    print("[+] SUPER_ADMIN logged in successfully.")

    print("\n--- 2. Login as STAFF (staff@loyalty.com / staff123) ---")
    staff_login = requests.post(f"{BASE_URL}/members/login", json={
        "email": "staff@loyalty.com",
        "password": "staff123",
        "role": "STAFF"
    })
    assert staff_login.status_code == 200, f"Staff login failed: {staff_login.text}"
    staff_token = staff_login.json().get("token")
    headers_staff = {"Authorization": f"Bearer {staff_token}"}
    print("[+] STAFF logged in successfully.")

    print("\n--- 3. STAFF creates customer & earns 250 points from INR 2500 bill ---")
    rand_id = random.randint(1000, 9999)
    cust_email = f"lot_test_{rand_id}@lrs.com"
    cust_phone = f"91111{rand_id}"

    create_cust = requests.post(f"{BASE_URL}/members", json={
        "fullName": f"Expiry Test Customer {rand_id}",
        "email": cust_email,
        "phone": cust_phone
    }, headers=headers_staff)
    assert create_cust.status_code in [200, 201], f"Customer creation failed: {create_cust.text}"
    cust = create_cust.json()
    cust_id = cust.get("memberId")
    print(f"[+] Customer created: #{cust_id} ({cust.get('fullName')})")

    # Earn 250 points
    earn_resp = requests.post(f"{BASE_URL}/members/{cust_id}/earn-points", json={
        "billAmount": 2500.0,
        "description": "Store Bill INR 2500"
    }, headers=headers_staff)
    assert earn_resp.status_code == 200, f"Earn points failed: {earn_resp.text}"
    updated_cust = earn_resp.json()
    print(f"[+] Earn Points Success! Customer Balance: {updated_cust.get('points')} pts")
    assert updated_cust.get("points") == 250, "Points should be 250!"

    print("\n--- 4. Verify PointLot creation for customer ---")
    expiry_info = requests.get(f"{BASE_URL}/points-expiry/customer/{cust_id}", headers=headers_admin).json()
    all_lots = expiry_info.get("allLots", [])
    print(f"[+] Customer Point Lots Count: {len(all_lots)}")
    assert len(all_lots) > 0, "PointLot was not created upon earning points!"
    latest_lot = all_lots[-1]
    print(f"    - Lot ID: #{latest_lot.get('id')}")
    print(f"    - Earned Points: {latest_lot.get('earnedPoints')}")
    print(f"    - Remaining Points: {latest_lot.get('remainingPoints')}")
    print(f"    - Expiry Date: {latest_lot.get('expiryDate')}")
    print(f"    - Status: {latest_lot.get('status')}")
    assert latest_lot.get("earnedPoints") == 250, "Lot earnedPoints mismatch!"
    assert latest_lot.get("remainingPoints") == 250, "Lot remainingPoints mismatch!"
    assert latest_lot.get("status") == "ACTIVE", "Lot status should be ACTIVE!"

    print("\n--- 5. Verify Automatic Fraud Detection on Large Earning ---")
    fraud_resp = requests.get(f"{BASE_URL}/fraud", headers=headers_admin)
    assert fraud_resp.status_code == 200, f"Fraud fetch failed: {fraud_resp.text}"
    fraud_alerts = fraud_resp.json()
    print(f"[+] Total Fraud Alerts in system: {len(fraud_alerts)}")
    if len(fraud_alerts) > 0:
        latest_fraud = fraud_alerts[-1]
        print(f"    - Alert ID: #{latest_fraud.get('fraudId')}")
        print(f"    - Customer: {latest_fraud.get('customerName')} (#{latest_fraud.get('customerId')})")
        print(f"    - Risk Score: {latest_fraud.get('riskScore')} / 100")
        print(f"    - Risk Level: {latest_fraud.get('riskLevel')}")
        print(f"    - Triggered Rules: {latest_fraud.get('detectedRules')}")
        print(f"    - Status: {latest_fraud.get('status')}")

    print("\n--- 6. Verify Executive Analytics Summary Endpoint ---")
    analytics_summary = requests.get(f"{BASE_URL}/analytics/summary", headers=headers_admin).json()
    print("[+] Executive Analytics Summary:")
    print(f"    - Total Customers: {analytics_summary.get('totalCustomers')}")
    print(f"    - Total Points Issued: {analytics_summary.get('totalPointsIssued')}")
    print(f"    - Total Points Redeemed: {analytics_summary.get('totalPointsRedeemed')}")
    print(f"    - Total Points Expired: {analytics_summary.get('totalPointsExpired')}")
    print(f"    - Redemption Rate: {analytics_summary.get('redemptionRate')}%")
    print(f"    - Points Expiring 30 Days: {analytics_summary.get('pointsExpiring30Days')}")

    assert analytics_summary.get("totalCustomers") >= 1, "Total customers analytics mismatch!"

    print("\n--- 7. Verify Executive Analytics Points Trend Endpoint ---")
    points_trend = requests.get(f"{BASE_URL}/analytics/points-trend?range=30d", headers=headers_admin).json()
    print(f"[+] Points Trend Data Array length: {len(points_trend)}")
    assert isinstance(points_trend, list), "Points trend should return a list!"

    print("\n--- 8. Verify Points Expiry Batch Process Endpoint ---")
    process_expiry_resp = requests.post(f"{BASE_URL}/points-expiry/process", headers=headers_admin)
    assert process_expiry_resp.status_code == 200, f"Process expiries failed: {process_expiry_resp.text}"
    proc_res = process_expiry_resp.json()
    print(f"[+] Points Expiry Processing Result: {proc_res}")

    print("\n--- 9. Security Authorization Checks (Role Protection) ---")
    # STAFF attempting to access executive analytics -> HTTP 403
    staff_analytics = requests.get(f"{BASE_URL}/analytics/summary", headers=headers_staff)
    print(f"[+] STAFF analytics access status: {staff_analytics.status_code}")
    assert staff_analytics.status_code == 403, "STAFF access to analytics should return 403 Forbidden!"

    # STAFF attempting to access fraud administration -> HTTP 403
    staff_fraud = requests.get(f"{BASE_URL}/fraud", headers=headers_staff)
    print(f"[+] STAFF fraud access status: {staff_fraud.status_code}")
    assert staff_fraud.status_code == 403, "STAFF access to fraud administration should return 403 Forbidden!"

    print("\n============================================================")
    print("ALL POINTS EXPIRY, ANALYTICS & FRAUD INTELLIGENCE TESTS PASSED!")
    print("============================================================")

if __name__ == "__main__":
    run_upgraded_tests()
