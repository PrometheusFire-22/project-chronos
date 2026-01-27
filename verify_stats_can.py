
import sys
from stats_can import sc

print("--- Help for vectors_to_df ---")
try:
    help(sc.vectors_to_df)
except Exception:
    print("No help available")

vector_ids_to_try = ["v2063004", "2063004", 2063004]

for vid in vector_ids_to_try:
    print(f"\nTrying vector_id: {vid} (type: {type(vid)})")
    try:
        df = sc.vectors_to_df([vid])
        print("✅ Success!")
        print(df.head())
        break
    except Exception as e:
        print(f"❌ Failed: {repr(e)}")
