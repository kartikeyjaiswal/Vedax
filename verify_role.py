import urllib.request
import json
import urllib.error

BASE_URL = "http://localhost:8000"

def verify_user_role():
    # 1. Login
    url = f"{BASE_URL}/api-token-auth/"
    data = {
        "username": "teststudent",
        "password": "password123"
    }
    json_data = json.dumps(data).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    print(f"Logging in to get token...")
    token = None
    try:
        req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            resp_data = json.loads(response.read().decode('utf-8'))
            token = resp_data.get('token')
            print(f"Token obtained: {token[:10]}...")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    if not token:
        return

    # 2. Get User Details
    me_url = f"{BASE_URL}/api/users/me/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {token}"
    }

    print(f"Fetching user details from {me_url}...")
    try:
        req = urllib.request.Request(me_url, headers=headers, method='GET')
        with urllib.request.urlopen(req) as response:
            user_data = json.loads(response.read().decode('utf-8'))
            print(f"User Role: {user_data.get('role')}")
            print(f"Full Data: {user_data}")
    except urllib.error.HTTPError as e:
        print(f"Error: {e.code} {e.reason}")
        print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_user_role()
