
import requests
import json

BASE_URL = "https://www150.statcan.gc.ca/t1/wds/rest"

def get_catalog():
    print("Fetching full StatsCan catalog (Cubes List)...")
    url = f"{BASE_URL}/getAllCubesList"
    
    try:
        # GET request for this specific endpoint
        response = requests.get(url, headers={"Accept": "application/json"})
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return

        data = response.json()
        
        # It usually returns an array of objects
        print(f"✅ Successfully retreived catalog with {len(data)} tables/cubes.")
        
        # Save to file for inspection
        with open("statscan_catalog_sample.json", "w") as f:
            json.dump(data[:50], f, indent=2) # Save first 50
            
        print("Sample of first 5 tables:")
        for table in data[:5]:
            print(f" - [{table.get('productId')}] {table.get('cubeTitleEn')} (Ref: {table.get('cansimId')})")
            
        keywords = ["CPI", "Price Index", "GDP", "Gross Domestic Product", "Labor Force", "Employment", "Unemployment", "Housing"]
        
        print(f"Searching for keywords: {keywords}")
        
        with open("statscan_master_list.md", "w") as md_file:
            md_file.write("# Statistics Canada Economic Data Master List\n\n")
            md_file.write("This list contains key economic data sets (Cubes) found in the StatsCan catalog.\n")
            md_file.write("To get specific data, you need the **Vector ID** from these tables.\n\n")
            
            for keyword in keywords:
                matches = [t for t in data if keyword.lower() in t.get('cubeTitleEn', '').lower()]
                md_file.write(f"## {keyword} ({len(matches)} tables)\n\n")
                md_file.write("| Product ID | Title | CANSIM Ref |\n")
                md_file.write("|---|---|---|\n")
                
                # Sort by Product ID for tidiness
                matches.sort(key=lambda x: x.get('productId'))
                
                for t in matches:
                    pid = t.get('productId')
                    title = t.get('cubeTitleEn').replace("|", "-") # Escape pipes for markdown table
                    ref = t.get('cansimId', 'N/A')
                    md_file.write(f"| {pid} | {title} | {ref} |\n")
                
                md_file.write("\n")
                
        print("✅ Generated 'statscan_master_list.md' with curated results.")

    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    get_catalog()
