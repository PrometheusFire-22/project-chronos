
import os
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")
api_key = os.getenv("FRED_API_KEY")

series_id = "ATNHPIUSAL"
url = f"https://api.stlouisfed.org/fred/series?series_id={series_id}&api_key={api_key}&file_type=json"

print(f"Requesting: {url.replace(api_key, 'HIDDEN')}")
response = requests.get(url)
print(f"Status: {response.status_code}")
print(f"Body: {response.text}")

series_id_2 = "ALSTHPI" # Alternative
url2 = f"https://api.stlouisfed.org/fred/series?series_id={series_id_2}&api_key={api_key}&file_type=json"
print(f"Requesting Alt: {url2.replace(api_key, 'HIDDEN')}")
response2 = requests.get(url2)
print(f"Status Alt: {response2.status_code}")
print(f"Body Alt: {response2.text}")
