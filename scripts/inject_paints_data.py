import json

scratch_path = "scratch/all_48_paints_products.json"
with open(scratch_path) as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from {scratch_path}")

# Format products for catalogData.ts
formatted_products_list = []
for p in products:
    p_str = json.dumps(p, indent=2)
    # indent each line by 2 spaces
    indented = "\n".join("  " + line for line in p_str.split("\n"))
    formatted_products_list.append(indented)

replacement_block = ",\n".join(formatted_products_list) + ",\n  "

for filepath in ["artifacts/conon/src/data/catalogData.ts", "lib/db/src/catalogData.ts"]:
    with open(filepath, "r") as f:
        content = f.read()

    p1 = content.find("prod-painting-ap-distemper")
    if p1 == -1:
        print(f"Could not find first paint product in {filepath}")
        continue
    brace_open = content.rfind("{", 0, p1)

    p2 = content.find("prod-safety-workwear-pitbull-shoes")
    if p2 == -1:
        print(f"Could not find next product in {filepath}")
        continue
    brace_next = content.rfind("{", 0, p2)

    new_content = content[:brace_open] + replacement_block + content[brace_next:]
    with open(filepath, "w") as f:
        f.write(new_content)
    print(f"Successfully updated {filepath} with 48 paint products!")

# Now update scripts/src/seed-local-db.ts
with open("scripts/src/seed-local-db.ts", "r") as f:
    seed_content = f.read()

if "birla-white-wallcare-putty-20kg" in seed_content:
    print("seed-local-db.ts already contains paint materials.")
else:
    seed_items = []
    for p in products:
        item = {
            "externalId": p["slug"],
            "name": p["name"],
            "category": "paint",
            "stage": "finishing",
            "price": p["price"],
            "unit": p["unit"],
            "description": f"{p['specChips'][0]} • HSN {p['hsnCode']} • {p['gstPercent']}% GST • {p['vendor']}",
            "vendor": p["vendor"]
        }
        seed_items.append("  " + json.dumps(item))

    seed_items_str = "\n".join(seed_items) + ",\n"
    idx_end = seed_content.find("];\n\nawait connectDatabase();")
    if idx_end != -1:
        new_seed_content = seed_content[:idx_end] + seed_items_str + seed_content[idx_end:]
        with open("scripts/src/seed-local-db.ts", "w") as f:
            f.write(new_seed_content)
        print("Successfully injected 48 paint materials into scripts/src/seed-local-db.ts!")
    else:
        print("Could not find insertion point in scripts/src/seed-local-db.ts")
