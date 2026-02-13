import urllib.request
import json
import urllib.error

BASE_URL = "http://localhost:8000"

def login_user():
    url = f"{BASE_URL}/api-token-auth/"
    data = {
        "username": "teststudent",
        "password": "password123"
    }
    json_data = json.dumps(data).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    print(f"Logging in user at {url}...")
    try:
        req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.status}")
            print(f"Response: {response.read().decode('utf-8')}")
            return True
    except urllib.error.HTTPError as e:
        print(f"Error: {e.code} {e.reason}")
        print(f"Response: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    login_user()
