import requests
import json

BASE_URL = "https://www150.statcan.gc.ca/t1/wds/rest"
endpoint = f"{BASE_URL}/getBulkVectorDataByRange"

# Test with a known vector (e.g., V1 from unemployment)
# According to my research, Newfoundland is V115904
vector_num = 115904 
start_date = "2020-01-01"
end_date = "2023-01-01"

payload = [
    {
        "vectorId": vector_num,
        "startDataPointReleaseDate": start_date,
        "endDataPointReleaseDate": end_date,
    }
]

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (ProjectChronos/1.0)"
}

print(f"Testing {endpoint} with payload: {json.dumps(payload)}")
try:
    response = requests.post(endpoint, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Try another endpoint if that fails
endpoint_latest = f"{BASE_URL}/getDataFromVectorsAndLatestNPeriods"
payload_latest = [
    {
        "vectorId": vector_num,
        "latestN": 10
    }
]
print(f"\nTesting {endpoint_latest} with payload: {json.dumps(payload_latest)}")
try:
    response = requests.post(endpoint_latest, json=payload_latest, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
