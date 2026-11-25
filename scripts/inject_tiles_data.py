import json

with open("/Users/rohiitshukla/.gemini/antigravity/brain/81a133d5-a7f4-424b-ae4c-59dfc4a7998a/scratch/all_42_tiles_stone_products.json") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from scratch file.")

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

    p1 = content.find("prod-tile-stone-installation-laticrete-303")
    if p1 == -1:
        print(f"Could not find first tile product in {filepath}")
        continue
    # find the opening brace before p1
    brace_open = content.rfind("{\n    \"id\": \"prod-tile-stone-installation-laticrete-303\"", 0, p1 + 50)
    if brace_open == -1:
        brace_open = content.rfind("{", 0, p1)

    p2 = content.find("prod-painting-ap-distemper")
    if p2 == -1:
        print(f"Could not find next product in {filepath}")
        continue
    brace_next = content.rfind("{\n    \"id\": \"prod-painting-ap-distemper\"", 0, p2 + 50)
    if brace_next == -1:
        brace_next = content.rfind("{", 0, p2)

    new_content = content[:brace_open] + replacement_block + content[brace_next:]
    with open(filepath, "w") as f:
        f.write(new_content)
    print(f"Successfully updated {filepath}!")

# Now update seed-local-db.ts
with open("scripts/src/seed-local-db.ts", "r") as f:
    seed_content = f.read()

# Check if already added
if "kajaria-eternity-zion-marfil-gvt" in seed_content:
    print("Seed-local-db already has tiles data.")
else:
    # Build seed materials
    seed_items = []
    for p in products:
        item = {
            "externalId": p["slug"],
            "name": p["name"],
            "category": "tiles",
            "stage": "finishing",
            "price": p["price"],
            "unit": p["unit"],
            "description": f"{p['specChips'][0]} • HSN {p['hsnCode']} • {p['gstPercent']}% GST • {p['vendor']}",
            "vendor": p["vendor"]
        }
        seed_items.append("  " + json.dumps(item))

    seed_items_str = ",\n" + ",\n".join(seed_items)
    
    # insert before the closing of auditedMaterials
    idx_end = seed_content.find("];\n\nconst ")
    if idx_end == -1:
        idx_end = seed_content.find("];\nconst ")
    if idx_end != -1:
        new_seed_content = seed_content[:idx_end] + seed_items_str + seed_content[idx_end:]
        with open("scripts/src/seed-local-db.ts", "w") as f:
            f.write(new_seed_content)
        print("Successfully injected 42 tile materials into seed-local-db.ts!")
    else:
        print("Could not find insertion point in seed-local-db.ts")

