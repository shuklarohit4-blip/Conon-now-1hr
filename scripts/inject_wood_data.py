import json
import re

with open("scratch/all_16_wood_hardware_products.json") as f:
    products_raw = json.load(f)

# Build IProduct items
catalog_products = []
seed_db_products = []

for p in products_raw:
    prod = {
        "id": p["id"],
        "slug": p["slug"],
        "name": p["name"],
        "title": p["title"],
        "brand": p["brand"],
        "categorySlug": "plywood-boards",
        "categoryName": "Plywood, Doors & Hardware",
        "subCategory": p["subCategory"],
        "image": p["image"],
        "images": p["images"],
        "shortTagline": p.get("shortTagline", p["spec"]),
        "specChips": p["specChips"],
        "description": p["spec"],
        "highlights": [
            p["spec"],
            f"HSN {p['hsnCode']} • 18% GST Compliance",
            f"Dispatch Vehicle: {p['deliveryVehicleType']}"
        ],
        "specifications": [
            {"label": "Brand", "value": p["brand"]},
            {"label": "Subcategory", "value": p["subCategory"]},
            {"label": "Thickness", "value": f"{p['thicknessMm']}mm" if p['thicknessMm'] else "Standard Fit"},
            {"label": "Dimensions / Fit", "value": p.get("dimensionsLabel", "")},
            {"label": "Grade / Standard", "value": p.get("gradeOrRating", "")},
            {"label": "HSN Code", "value": p["hsnCode"]},
            {"label": "GST Rate", "value": "18%"},
            {"label": "Dispatch Vehicle", "value": p["deliveryVehicleType"]}
        ],
        "variants": [
            {
                "id": f"var-{p['id']}-single",
                "label": "Standard Pack",
                "unit": p["unit"],
                "price": p["price"],
                "mrp": p["mrp"],
                "discountPercent": round(((p["mrp"] - p["price"]) / p["mrp"]) * 100),
                "stock": 50,
                "image": p["image"]
            }
        ],
        "price": p["price"],
        "mrp": p["mrp"],
        "discountPercent": round(((p["mrp"] - p["price"]) / p["mrp"]) * 100),
        "unit": p["unit"],
        "inStock": True,
        "rating": p["rating"],
        "reviewsCount": p["reviewsCount"],
        "deliveryEta": p["deliveryTime"],
        "vendor": f"{p['brand']} Lucknow Authorized Depot",
        "oemModelCode": p["oemModelCode"],
        "gstPercent": 18,
        "hsnCode": p["hsnCode"],
        "exGstPrice": p["exGstPrice"],
        "woodSubcategory": p["woodSubcategory"],
        "thicknessMm": p["thicknessMm"],
        "sheetOrDoorSizeFt": p.get("sheetOrDoorSizeFt"),
        "areaSqFt": p.get("areaSqFt"),
        "dimensionsLabel": p.get("dimensionsLabel"),
        "gradeOrRating": p.get("gradeOrRating"),
        "effectivePerSqFtPrice": p.get("effectivePerSqFtPrice"),
        "deliveryVehicleType": p["deliveryVehicleType"],
        "brandTier": p["brandTier"]
    }
    catalog_products.append(prod)

    seed_db_products.append({
        "externalId": p["id"],
        "name": p["name"],
        "category": "wood" if p["woodSubcategory"] in ["PLYWOOD", "FLUSH_DOOR", "LAMINATE"] else "hardware",
        "stage": "finishing",
        "price": p["price"],
        "unit": p["unit"],
        "description": f"{p['spec']} - HSN {p['hsnCode']} (18% GST)",
        "vendor": f"{p['brand']} Lucknow Depot"
    })

print(f"Prepared {len(catalog_products)} catalog products and {len(seed_db_products)} seed items.")

# 1. Update artifacts/conon/src/data/catalogData.ts & lib/db/src/catalogData.ts
for fpath in ["artifacts/conon/src/data/catalogData.ts", "lib/db/src/catalogData.ts"]:
    with open(fpath, "r") as f:
        content = f.read()

    start_marker = "export const CATALOG_PRODUCTS: IProduct[] = ["
    start_idx = content.find(start_marker)
    end_marker = "];\n\nexport const getProductsByCategory"
    end_idx = content.find(end_marker, start_idx)

    if start_idx == -1 or end_idx == -1:
        print(f"Error finding markers in {fpath}")
        continue

    json_str = content[start_idx + len(start_marker) - 1:end_idx + 1]
    existing_list = json.loads(json_str)

    # Filter out existing plywood-boards products
    kept_list = [p for p in existing_list if p.get("categorySlug") != "plywood-boards"]
    new_list = kept_list + catalog_products

    new_json_str = json.dumps(new_list, indent=2)
    new_content = content[:start_idx + len(start_marker) - 1] + new_json_str + content[end_idx + 1:]

    with open(fpath, "w") as f:
        f.write(new_content)
    print(f"Successfully updated {fpath} with {len(catalog_products)} wood products (Total: {len(new_list)})")

# 2. Update scripts/src/seed-local-db.ts
with open("scripts/src/seed-local-db.ts", "r") as f:
    seed_content = f.read()

# Filter out if any existing wood products with these externalIds exist
for sp in seed_db_products:
    if sp["externalId"] not in seed_content:
        line_to_add = f'  {json.dumps(sp)},\n'
        # Insert before the closing bracket of sampleProducts
        idx = seed_content.rfind("];")
        if idx != -1:
            seed_content = seed_content[:idx] + line_to_add + seed_content[idx:]

with open("scripts/src/seed-local-db.ts", "w") as f:
    f.write(seed_content)
print("Updated scripts/src/seed-local-db.ts successfully.")
