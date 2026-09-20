import requests
import json
import time

BASE_URL = "http://localhost:8081/api"

def test_10inr_conversion_rule():
    print("Waiting for backend startup...")
    time.sleep(4)

    # 1. Login as STAFF
    r_staff = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "staff@loyalty.com",
        "password": "staff123",
        "role": "STAFF"
    })
    staff_token = r_staff.json().get("token")
    headers_staff = {"Authorization": f"Bearer {staff_token}"}
    print("STAFF login successful.")

    # 2. Get customer ID 12
    r_cust = requests.get(f"{BASE_URL}/members/12", headers=headers_staff)
    cust_data = r_cust.json()
    cust_id = cust_data.get("memberId")
    start_pts = cust_data.get("points")
    print(f"Customer: {cust_data.get('fullName')} [ID: #{cust_id}], Starting Points: {start_pts}")

    # Test cases: (billAmount, expectedPointsEarned)
    test_cases = [
        (10.0, 1),
        (50.0, 5),
        (100.0, 10),
        (250.0, 25),
        (500.0, 50),
        (755.0, 75),
        (1000.0, 100),
        (2500.0, 250),
        (5000.0, 500)
    ]

    current_expected_total = start_pts

    for bill, expected_pts in test_cases:
        r_earn = requests.post(f"{BASE_URL}/members/{cust_id}/earn-points", json={
            "billAmount": bill,
            "description": f"Test Bill INR {bill}"
        }, headers=headers_staff)
        assert r_earn.status_code == 200, f"Failed on bill INR {bill}"
        res = r_earn.json()
        current_expected_total += expected_pts
        print(f"Bill: INR {bill:>6.2f} -> Earned: +{expected_pts:>3} pts | New Total: {res.get('points')} (Expected: {current_expected_total})")
        assert res.get("points") == current_expected_total

    # Test partial bill under 10 (INR 9.0 should return 400 Bad Request)
    r_under10 = requests.post(f"{BASE_URL}/members/{cust_id}/earn-points", json={
        "billAmount": 9.0
    }, headers=headers_staff)
    print(f"Bill INR 9.0 status (Expected 400): {r_under10.status_code}")
    assert r_under10.status_code == 400

    print("\n=== ALL INR 10 = 1 POINT CONVERSION TESTS PASSED PERFECTLY ===")

if __name__ == "__main__":
    test_10inr_conversion_rule()
