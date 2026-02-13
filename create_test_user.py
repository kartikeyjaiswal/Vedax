import urllib.request
import json
import urllib.error

BASE_URL = "http://localhost:8000"

def register_user():
    url = f"{BASE_URL}/api/register/"
    data = {
        "username": "teststudent",
        "email": "student@vedax.com",
        "password": "password123",
        "role": "student",
        "school_name": "Green High"
    }
    json_data = json.dumps(data).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
    
    print(f"Registering user at {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.status}")
            print(f"Response: {response.read().decode('utf-8')}")
            return response.status == 201
    except urllib.error.HTTPError as e:
        print(f"Error: {e.code} {e.reason}")
        print(f"Response: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def login_user():
    url = f"{BASE_URL}/api-token-auth/"
    data = {
        "username": "teststudent",
        "password": "password123"
    }
    json_data = json.dumps(data).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
    
    print(f"\nLogging in user at {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.status}")
            print(f"Response: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Error: {e.code} {e.reason}")
        print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if register_user():
        login_user()
    else:
        # Try login anyway, maybe user exists
        login_user()
