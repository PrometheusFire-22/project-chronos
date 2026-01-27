
import csv
import re

input_file = "database/seeds/time-series_catalog_expanded.csv"
output_file = "database/seeds/time-series_catalog_expanded_fixed.csv"

# Regex to match ATNHPIUS{State} and capture State
pattern = re.compile(r"ATNHPIUS([A-Z]{2})")

fixed_count = 0
with open(input_file, 'r', newline='') as infile, open(output_file, 'w', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        original_id = row['series_id']
        match = pattern.match(original_id)
        if match:
            state_abbr = match.group(1)
            new_id = f"{state_abbr}STHPI"
            new_id = f"{state_abbr}STHPI"
            # row['source_series_id'] = new_id # Column doesn't exist
            row['series_id'] = new_id
            print(f"Fixed: {original_id} -> {new_id}")
            fixed_count += 1
        writer.writerow(row)

print(f"Fixed {fixed_count} HPI series IDs.")
