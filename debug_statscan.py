
import requests
import json

base_url = "https://www150.statcan.gc.ca/t1/wds/rest"
vector_id = 2063004 # Integer 
start_date = "2023-01-01"
end_date = "2023-12-31"

def test_endpoint(name, endpoint, payload):
    print(f"\n--- Testing {name} ---")
    url = f"{base_url}/{endpoint}"
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload)}") # Compact print
    
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    
    try:
        r = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code == 200:
            data = r.json()
            print("Response Body Snippet:")
            print(json.dumps(data, indent=2)[:600])
        else:
            print(f"❌ Error: {r.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

# Test 1: The One That Worked (Object with ReleaseDate)
payload_working = {
    "vectorIds": [vector_id],
    "startDataPointReleaseDate": start_date + "T00:00",
    "endDataPointReleaseDate": end_date + "T00:00"
}
test_endpoint("getBulkVectorDataByRange (Known Good)", "getBulkVectorDataByRange", payload_working)

# Test 2: Object with ReferencePeriod (Desired)
# Trying to see if we can use reference period keys with the bulk object structure
payload_hybrid = {
    "vectorIds": [vector_id],
    "startReferencePeriod": "2023-01-01",
    "endReferencePeriod": "2023-12-31" 
}
test_endpoint("getBulkVectorDataByRange (Hybrid RefPeriod)", "getBulkVectorDataByRange", payload_hybrid)
