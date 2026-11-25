import fs from "fs";
import path from "path";

const API_BASE = "http://localhost:5001";

async function main() {
  console.log("=================================================");
  console.log("   CONON-NOW: PRODUCT & MERCHANDISING STUDIO E2E ");
  console.log("=================================================");

  // 1. Test Image Studio: Mode 1 (Multipart Buffer Upload)
  console.log("\n[TEST 1] Testing Image Studio Buffer Upload (Mode 1)...");
  // Create a minimal 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const formData = new FormData();
  formData.append("file", new Blob([samplePngBuffer], { type: "image/png" }), "test-sku-packshot.png");
  formData.append("mode", "upload");
  formData.append("categorySlug", "electricals");
  formData.append("skuSlug", "test-havells-monoblock-pump");

  const uploadRes = await fetch(`${API_BASE}/api/admin/catalog/image`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error(`Image upload failed: HTTP ${uploadRes.status} ${await uploadRes.text()}`);
  }
  const uploadData = await uploadRes.json();
  console.log("✓ Image processed successfully by Sharp:", uploadData);
  const returnedUrl = uploadData.imageUrl || uploadData.url;
  if (!returnedUrl || !returnedUrl.endsWith(".webp")) {
    throw new Error(`Expected webp URL, got ${returnedUrl}`);
  }

  // Verify file actually exists in artifacts/conon/public
  const expectedDiskPath = path.resolve(process.cwd(), "artifacts/conon/public", returnedUrl.replace(/^\//, ""));
  if (!fs.existsSync(expectedDiskPath)) {
    throw new Error(`Processed image file does not exist at ${expectedDiskPath}`);
  }
  console.log(`✓ Image verified on disk: ${expectedDiskPath} (${fs.statSync(expectedDiskPath).size} bytes)`);

  // 2. Test Image Studio: Mode 3 (Auto-Fetch Fallback)
  console.log("\n[TEST 2] Testing Image Studio 1-Click Auto-Fetch (Mode 3)...");
  const autoFetchRes = await fetch(`${API_BASE}/api/admin/catalog/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "autofetch",
      productName: "Schneider Electric 32A MCB Double Pole",
      brand: "Schneider Electric",
      categorySlug: "electricals",
      skuSlug: "schneider-32a-mcb-dp",
    }),
  });
  if (!autoFetchRes.ok) {
    throw new Error(`Autofetch failed: HTTP ${autoFetchRes.status} ${await autoFetchRes.text()}`);
  }
  const autoFetchData = await autoFetchRes.json();
  console.log("✓ Auto-fetch candidates count:", autoFetchData.candidates?.length, "| Notice:", autoFetchData.notice);

  // 3. Test Create New Product (POST /api/admin/catalog/sku)
  console.log("\n[TEST 3] Testing Create New SKU via Merchandising Studio...");
  const newSkuPayload = {
    name: "Havells Hi-Flow 1.0 HP Monoblock Submersible Pump (Lucknow Special)",
    brand: "Havells",
    categoryId: "electricals",
    categorySlug: "electricals",
    subcategory: "Pumps & Motors",
    packSize: "1 Set (With Starter)",
    sellingPrice: 4250,
    mrp: 5499,
    landingCost: 3800,
    gstPercent: 18,
    hsnCode: "8413",
    deliveryVehicleType: "E_LOADER",
    inStock: true,
    isExpress60: true,
    isFeatured: true,
    preferredVendorId: "naza-authorized-hub",
    fitGuardrailBadge: "Requires 2.5mm² Copper Cable & 16A MCB",
    shortDescription: "High-torque 1.0 HP pump with double ball bearings and thermal overload protector.",
    highlights: [
      "100% Pure Copper Wound Motor",
      "Thermal Overload Protector (TOP)",
      "High Discharge up to 3500 LPH",
      "Class F Insulation Rating",
      "Rust-Resistant Cast Iron Impeller",
      "2-Year Havells On-Site Warranty",
    ],
    specs: [
      { key: "Power Rating", value: "1.0 HP / 0.75 kW" },
      { key: "Operating Voltage", value: "180V - 240V AC" },
      { key: "Max Head Range", value: "32 Meters" },
      { key: "Pipe Suction/Delivery", value: "25mm x 25mm (1 inch)" },
      { key: "Lubrication", value: "Factory Sealed Pre-Greased" },
    ],
    imageUrl: returnedUrl,
    pairedSkuIds: ["finolex-2-5sqmm-wire", "schneider-16a-mcb"],
  };

  const createRes = await fetch(`${API_BASE}/api/admin/catalog/sku`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSkuPayload),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create SKU: HTTP ${createRes.status} ${await createRes.text()}`);
  }
  const createJson = await createRes.json();
  const createdSku = createJson.sku || createJson;
  console.log("✓ SKU Created successfully with ID:", createdSku.id);
  console.log(`  Name: ${createdSku.name}`);
  console.log(`  Selling Price: ₹${createdSku.sellingPrice} | MRP: ₹${createdSku.mrp} (${createdSku.discountPercent}% OFF)`);
  console.log(`  Pre-GST Base: ₹${createdSku.basePricePreGst} | Conon Margin: ₹${createdSku.netMarginRupees} (${createdSku.netMarginPercent}%)`);
  console.log(`  Delivery Vehicle: ${createdSku.deliveryVehicleType}`);
  console.log(`  Guardrail: ${createdSku.fitGuardrailBadge}`);

  // 4. Test Live Storefront Query (GET /api/catalog/live)
  console.log("\n[TEST 4] Verifying SKU in Live Storefront API (GET /api/catalog/live)...");
  const liveRes = await fetch(`${API_BASE}/api/catalog/live`);
  if (!liveRes.ok) throw new Error(`Live catalog fetch failed: ${liveRes.status}`);
  const liveData = await liveRes.json();
  const foundLiveSku = liveData.items.find((item: any) => item.id === createdSku.id);
  if (!foundLiveSku) {
    throw new Error(`Created SKU ${createdSku.id} not found in live catalog items!`);
  }
  console.log(`✓ Found newly created SKU in live catalog (Total SKUs now: ${liveData.items.length})`);
  console.log(`  Live Image URL: ${foundLiveSku.imageUrl}`);
  console.log(`  Live Highlights count: ${foundLiveSku.highlights?.length}`);
  console.log(`  Live Specs count: ${foundLiveSku.specs?.length}`);
  console.log(`  Live Featured flag: ${foundLiveSku.isFeatured}`);

  // 5. Test 1-Click Duplicate SKU (POST /api/admin/catalog/sku/:id/duplicate)
  console.log("\n[TEST 5] Testing 1-Click Duplicate SKU...");
  const dupRes = await fetch(`${API_BASE}/api/admin/catalog/sku/${createdSku.id}/duplicate`, {
    method: "POST",
  });
  if (!dupRes.ok) throw new Error(`Failed to duplicate SKU: ${dupRes.status} ${await dupRes.text()}`);
  const dupJson = await dupRes.json();
  const duplicatedSku = dupJson.sku || dupJson;
  console.log(`✓ Duplicated SKU Created with ID: ${duplicatedSku.id}`);
  console.log(`  Cloned Name: ${duplicatedSku.name}`);
  if (!duplicatedSku.name.includes("(Copy)")) {
    throw new Error("Expected (Copy) in duplicated SKU name");
  }

  // 6. Test SKU Update (PATCH /api/admin/catalog/sku/:id)
  console.log("\n[TEST 6] Testing SKU Attribute Update (PATCH /api/admin/catalog/sku/:id)...");
  const updateRes = await fetch(`${API_BASE}/api/admin/catalog/sku/${createdSku.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sellingPrice: 4150,
      fitGuardrailBadge: "Updated: 100% Copper · Tested with Havells Submersible Cable",
      isFeatured: false,
    }),
  });
  if (!updateRes.ok) throw new Error(`Failed to update SKU: ${updateRes.status}`);
  const updateJson = await updateRes.json();
  const updatedSku = updateJson.sku || updateJson;
  console.log(`✓ Updated SKU selling price: ₹${updatedSku.sellingPrice}`);
  console.log(`✓ Updated SKU guardrail: ${updatedSku.fitGuardrailBadge}`);
  console.log(`✓ Updated SKU isFeatured: ${updatedSku.isFeatured}`);

  // 7. Cleanup Test SKUs via Archive
  console.log("\n[TEST 7] Cleaning up test SKUs via Archive...");
  await fetch(`${API_BASE}/api/admin/catalog/sku/${createdSku.id}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: true }),
  });
  await fetch(`${API_BASE}/api/admin/catalog/sku/${duplicatedSku.id}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: true }),
  });
  console.log("✓ Test SKUs safely archived!");

  console.log("\n=================================================");
  console.log("   ALL PRODUCT & MERCHANDISING STUDIO TESTS PASSED! ");
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
