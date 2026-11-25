import json

with open("scratch/all_70_structural_products.json") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from scratch.")

catalog_items = []
for p in products:
    item = {
        "id": f"prod-cement-civil-works-{p['slug']}",
        "slug": p["slug"],
        "name": p["name"],
        "title": p["title"],
        "brand": p["brand"],
        "categorySlug": "cement-civil-works",
        "categoryName": "Cement, TMT Sariya & Chemicals",
        "subCategory": p["subcategory"],
        "image": p["image"],
        "images": p["images"],
        "shortTagline": p.get("shortTagline", p.get("spec", p["title"])),
        "specChips": p.get("specChips", []),
        "description": p.get("spec", p["title"]),
        "highlights": [
            p.get("spec", p["title"]),
            f"HSN {p['hsnCode']} • 18% GST Compliant",
            f"Express 60-Minute Delivery via {p['deliveryVehicleType']}"
        ],
        "specifications": [
            {"label": "HSN Code", "value": p["hsnCode"]},
            {"label": "GST Rate", "value": f"{p['gstPercent']}% Included"},
            {"label": "Base Pre-GST", "value": f"₹{p['exGstPrice']}"},
            {"label": "Delivery Vehicle", "value": p["deliveryVehicleType"]},
            {"label": "Price Volatility", "value": p["priceVolatility"]}
        ],
        "variants": [],
        "price": p["price"],
        "mrp": p["mrp"],
        "discountPercent": p["discountPct"],
        "unit": p["unit"],
        "inStock": True,
        "rating": p.get("rating", 4.8),
        "reviewsCount": p.get("reviewsCount", 120),
        "deliveryEta": "60 Mins",
        "vendor": f"{p['brand']} Lucknow Depot",
        "oemModelCode": p["oemModelCode"],
        "priceVolatility": p["priceVolatility"],
        "vehicleType": p["deliveryVehicleType"],
        "deliveryVehicleType": p["deliveryVehicleType"],
        "brandTier": p["brandTier"],
        "gstPercent": p["gstPercent"],
        "hsnCode": p["hsnCode"],
        "exGstPrice": p["exGstPrice"]
    }

    if p.get("tmtDiameterMm"):
        item["tmtDiameterMm"] = p["tmtDiameterMm"]
        item["barLengthMeters"] = 12
        item["theoreticalWeightKg"] = p["theoreticalWeightKg"]
        item["effectivePerKgPrice"] = p["effectivePerKgPrice"]
        item["tmtGrade"] = p["tmtGrade"]
        item["steelTier"] = p["steelTier"]
        item["specifications"].extend([
            {"label": "Diameter", "value": f"{p['tmtDiameterMm']}mm"},
            {"label": "Length", "value": "12m Standard"},
            {"label": "Theoretical Weight", "value": f"{p['theoreticalWeightKg']} kg (IS 1786)"},
            {"label": "Effective Price", "value": f"₹{p['effectivePerKgPrice']}/kg"}
        ])

    if p.get("cementGrade"):
        item["cementGrade"] = p["cementGrade"]
        item["cementType"] = p["cementType"]
        item["specifications"].extend([
            {"label": "Cement Grade", "value": p["cementGrade"]},
            {"label": "Type", "value": p["cementType"]}
        ])

    if p.get("chemicalType"):
        item["chemicalType"] = p["chemicalType"]
        item["dosagePerBagCement"] = p.get("dosagePerBagCement")
        item["specifications"].extend([
            {"label": "Chemical Type", "value": p["chemicalType"]},
            {"label": "Dosage", "value": p.get("dosagePerBagCement", "As per spec sheet")}
        ])

    if p.get("bulkPrice"):
        item["bulkPricingTiers"] = [
            {
                "minQty": 10 if "tmt" in p["slug"] or "adhesive" in p["slug"] else 50,
                "pricePerUnit": p["bulkPrice"],
                "label": p.get("bulkSlabText", f"Bulk ₹{p['bulkPrice']}")
            }
        ]

    item["requiresUnloadingLabour"] = p.get("requiresUnloadingLabour", False)
    catalog_items.append(item)

print(f"Constructed {len(catalog_items)} catalog items.")

# Format as JSON string for TS file
catalog_json_str = ",\n".join(json.dumps(it, indent=2) for it in catalog_items)

# Inject into artifacts/conon/src/data/catalogData.ts and lib/db/src/catalogData.ts
for path in ["artifacts/conon/src/data/catalogData.ts", "lib/db/src/catalogData.ts"]:
    with open(path) as f:
        text = f.read()

    start_marker = '  {\n    "id": "prod-cement-civil-works-ultra-wp",'
    end_marker = '  {\n    "id": "prod-adh-fevicol-sh-1kg",'

    start_idx = text.find(start_marker)
    end_idx = text.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print(f"Error finding markers in {path}: start={start_idx}, end={end_idx}")
        continue

    new_text = text[:start_idx] + catalog_json_str + ",\n" + text[end_idx:]
    with open(path, "w") as f:
        f.write(new_text)
    print(f"Injected 70 products into {path}!")

# Update scripts/src/seed-local-db.ts
with open("scripts/src/seed-local-db.ts") as f:
    seed_text = f.read()

seed_start_marker = '{ externalId: "ultratech-super-cement-50kg"'
seed_end_marker = '{ externalId: "taparia-claw-hammer-with-handle-340g"'

s_start = seed_text.find(seed_start_marker)
s_end = seed_text.find(seed_end_marker)

if s_start != -1 and s_end != -1:
    seed_records = []
    for p in products:
        stage = "foundation" if "cement" in p["subcategory"] or "tmt" in p["subcategory"] else "finishing"
        cat = "cement" if "cement" in p["subcategory"] else "steel" if "tmt" in p["subcategory"] else "chemicals"
        rec = {
            "externalId": p["slug"],
            "name": p["title"],
            "category": cat,
            "stage": stage,
            "price": p["price"],
            "unit": p["unit"],
            "description": f"{p['spec']} - HSN {p['hsnCode']} (18% GST)",
            "vendor": f"{p['brand']} Lucknow Depot"
        }
        seed_records.append(json.dumps(rec))

    seed_replacement = ",\n  ".join(seed_records) + ",\n  "
    new_seed_text = seed_text[:s_start] + seed_replacement + seed_text[s_end:]
    with open("scripts/src/seed-local-db.ts", "w") as f:
        f.write(new_seed_text)
    print("Injected 70 products into scripts/src/seed-local-db.ts!")
else:
    print(f"Could not find seed markers: start={s_start}, end={s_end}")
