/**
 * E2E Verification Suite for CONON PARTNER DUKAAN OS 16-Category Visual Catalog & Image Uploader
 * Run with: pnpm tsx scripts/verify-vendor-catalog-sync.ts
 */

import { io as ioClient } from "../artifacts/conon/node_modules/socket.io-client/build/esm/index.js";

const API_BASE = "http://127.0.0.1:5001";
const HUB_ID = "hub-naka";

interface TestResult {
  step: string;
  success: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, step: string, details?: string) {
  results.push({ step, success: condition, details });
  if (condition) {
    console.log(`  ✅ [PASS] ${step}`);
  } else {
    console.error(`  ❌ [FAIL] ${step} - ${details || ""}`);
  }
}

async function runVerification() {
  console.log("\n================================================================================");
  console.log("  CONON PARTNER DUKAAN OS: 16-CATEGORY CATALOG & IMAGE UPLOADER E2E VERIFICATION");
  console.log("================================================================================\n");

  // 1. Connect Socket.io client
  console.log("📡 Phase 1: Real-time Socket.io 4-Panel Relay Connection...");
  const socket: any = (ioClient as any)(API_BASE, {
    path: "/api/socket.io",
    transports: ["websocket"],
    reconnection: false,
  });

  const socketEventsReceived: Record<string, any[]> = {
    "catalog:stock_updated": [],
    "catalog:image_updated": [],
    "catalog:product_created": [],
    "catalog:price_updated": [],
    "catalog:category_toggled": [],
    "catalog:category_restocked": [],
  };

  for (const eventName of Object.keys(socketEventsReceived)) {
    socket.on(eventName, (data) => {
      socketEventsReceived[eventName].push(data);
    });
  }

  await new Promise<void>((resolve, reject) => {
    socket.on("connect", () => {
      assert(socket.connected, "Socket.io connected to port 5001");
      resolve();
    });
    socket.on("connect_error", (err) => {
      reject(err);
    });
    setTimeout(() => {
      if (!socket.connected) reject(new Error("Socket connection timed out"));
    }, 4000);
  });

  // 2. Test GET /api/vendor/hub/:hubId/catalog
  console.log("\n📦 Phase 2: Fetch 16-Category Vendor Catalog...");
  const catRes = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/catalog`, {
    headers: { "x-vendor-store": "Katawala Hardware & Locks" },
  });
  const catData = await catRes.json();

  assert(catRes.status === 200, "GET /api/vendor/hub/:hubId/catalog status 200");
  assert(catData.success === true, "Catalog response returns success: true");
  assert(Array.isArray(catData.categories), "Catalog categories is an array");
  assert(catData.categories.length >= 16, `Contains 16 categories (found ${catData.categories.length})`);
  assert(Array.isArray(catData.items), "Catalog items is an array");
  assert(catData.items.length >= 30, `Contains 30+ items across Lucknow hubs (found ${catData.items.length})`);

  // Verify key categories exist
  const slugs = catData.categories.map((c: any) => c.slug);
  const requiredCategories = [
    "cctv-networking",
    "cpvc-plumbing-tanks",
    "cement-civil-works",
    "plywood-boards",
    "fevicol-adhesives-sealants",
    "wires-mcb-electrical",
    "kitchen-sinks-faucets",
    "furniture-wardrobe-bed-hardware",
    "modular-kitchen-systems",
    "door-hardware-locks",
    "sanitary-bath-fittings",
    "tile-stone-installation",
    "home-appliances",
    "lighting",
    "painting",
    "power-tools-safety",
  ];

  for (const reqCat of requiredCategories) {
    assert(slugs.includes(reqCat), `Required category '${reqCat}' present with matching slug`);
  }

  // 3. Test 1-Tap Stock Toggle
  console.log("\n⚡ Phase 3: 1-Tap In-Stock / Out-of-Stock Toggle & Socket Broadcast...");
  const targetProduct = catData.items[0];
  const prodId = targetProduct.id;

  // Toggle to OUT OF STOCK
  const stockRes1 = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/products/${prodId}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-vendor-store": "Katawala Hardware & Locks" },
    body: JSON.stringify({ inStock: false, stockQty: 0 }),
  });
  const stockData1 = await stockRes1.json();

  assert(stockRes1.status === 200, "PATCH stock to false status 200");
  assert(stockData1.product.inStock === false, "Product successfully marked OUT OF STOCK");

  // Allow socket event to arrive
  await new Promise((r) => setTimeout(r, 200));
  const stockEvents = socketEventsReceived["catalog:stock_updated"];
  assert(
    stockEvents.some((e) => e.productId === prodId && e.inStock === false),
    "Socket emitted 'catalog:stock_updated' with inStock: false"
  );

  // Toggle back to IN STOCK
  const stockRes2 = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/products/${prodId}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-vendor-store": "Katawala Hardware & Locks" },
    body: JSON.stringify({ inStock: true, stockQty: 100 }),
  });
  const stockData2 = await stockRes2.json();

  assert(stockRes2.status === 200, "PATCH stock to true status 200");
  assert(stockData2.product.inStock === true, "Product successfully restored to IN STOCK");

  // 4. Test Custom Product Image Upload & Reset
  console.log("\n📸 Phase 4: Custom Product Photo Upload, Live Preview & Reset...");
  const sampleCustomWebp = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";

  const imgRes = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/products/${prodId}/image`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-vendor-store": "Katawala Hardware & Locks" },
    body: JSON.stringify({ imageUrl: sampleCustomWebp }),
  });
  const imgData = await imgRes.json();

  assert(imgRes.status === 200, "PATCH product image status 200");
  assert(imgData.product.imageUrl === sampleCustomWebp, "Product custom image successfully updated");
  assert(Boolean(imgData.product.customImage), "customImage field set on product");

  await new Promise((r) => setTimeout(r, 200));
  const imgEvents = socketEventsReceived["catalog:image_updated"];
  assert(
    imgEvents.some((e) => e.productId === prodId && e.imageUrl === sampleCustomWebp),
    "Socket emitted 'catalog:image_updated' with custom image data"
  );

  // Test Reset Image back to master photo
  const resetRes = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/products/${prodId}/reset-image`, {
    method: "POST",
    headers: { "x-vendor-store": "Katawala Hardware & Locks" },
  });
  const resetData = await resetRes.json();

  assert(resetRes.status === 200, "POST reset-image status 200");
  assert(resetData.product.customImage === null, "Product customImage reset to null");
  assert(resetData.product.imageUrl !== sampleCustomWebp, "Product imageUrl reverted to default master photo");

  // 5. Test Inline Price & Stock Qty Editor
  console.log("\n💰 Phase 5: Inline Price & Quantity Update...");
  const priceRes = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/products/${prodId}/price`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-vendor-store": "Katawala Hardware & Locks" },
    body: JSON.stringify({ dealerPrice: 425, mrp: 510, stockQty: 75 }),
  });
  const priceData = await priceRes.json();

  assert(priceRes.status === 200, "PATCH price & qty status 200");
  assert(priceData.product.dealerPrice === 425, "Dealer price updated to ₹425");
  assert(priceData.product.stockQty === 75, "Stock quantity updated to 75");

  await new Promise((r) => setTimeout(r, 200));
  const priceEvents = socketEventsReceived["catalog:price_updated"];
  assert(
    priceEvents.some((e) => e.productId === prodId && e.dealerPrice === 425),
    "Socket emitted 'catalog:price_updated' with new pricing"
  );

  // 6. Test + Add New Product Across Any of the 16 Categories
  console.log("\n✨ Phase 6: Add Brand New Product to Hub Catalog...");
  const newProductPayload = {
    categorySlug: "cctv-networking",
    name: "CP Plus 4K UHD 8MP Bullet IP Camera (Night Color)",
    brand: "CP Plus",
    unit: "Piece",
    dealerPrice: 3200,
    mrp: 4600,
    imageUrl: "/images/products/cctv/cp-plus-8mp-bullet.webp",
    stockQty: 30,
  };

  const addRes = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vendor-store": "Katawala Hardware & Locks" },
    body: JSON.stringify(newProductPayload),
  });
  const addData = await addRes.json();

  assert(addRes.status === 201, "POST add product status 201");
  assert(addData.success === true, "Add product response success: true");
  assert(addData.product.name === newProductPayload.name, "Product name matches payload");
  assert(addData.product.categorySlug === "cctv-networking", "Product category slug is 'cctv-networking'");
  assert(addData.product.dealerPrice === 3200, "Dealer price matches ₹3200");

  await new Promise((r) => setTimeout(r, 200));
  const addEvents = socketEventsReceived["catalog:product_created"];
  assert(
    addEvents.some((e) => e.product.name === newProductPayload.name),
    "Socket emitted 'catalog:product_created' across all panels"
  );

  // 7. Test Category Power Toggle
  console.log("\n🔘 Phase 7: Category Master Power Switch...");
  const toggleRes = await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/categories/lighting/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vendor-store": "Katawala Hardware & Locks" },
    body: JSON.stringify({ enabled: false }),
  });
  const toggleData = await toggleRes.json();

  assert(toggleRes.status === 200, "POST category toggle status 200");
  assert(toggleData.enabled === false, "Category 'lighting' successfully paused");

  await new Promise((r) => setTimeout(r, 200));
  const toggleEvents = socketEventsReceived["catalog:category_toggled"];
  assert(
    toggleEvents.some((e) => e.categorySlug === "lighting" && e.enabled === false),
    "Socket emitted 'catalog:category_toggled' with enabled: false"
  );

  // Re-enable
  await fetch(`${API_BASE}/api/vendor/hub/${HUB_ID}/categories/lighting/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vendor-store": "Katawala Hardware & Locks" },
    body: JSON.stringify({ enabled: true }),
  });

  // 8. Test Morning 1-Click Restock All
  console.log("\n🌅 Phase 8: Morning 1-Click Restock All Category...");
  const restockRes = await fetch(
    `${API_BASE}/api/vendor/hub/${HUB_ID}/categories/cement-civil-works/restock-all`,
    {
      method: "POST",
      headers: { "x-vendor-store": "Katawala Hardware & Locks" },
    }
  );
  const restockData = await restockRes.json();

  assert(restockRes.status === 200, "POST restock-all status 200");
  assert(restockData.restockedCount > 0, `Restocked ${restockData.restockedCount} items in category`);

  await new Promise((r) => setTimeout(r, 200));
  const restockEvents = socketEventsReceived["catalog:category_restocked"];
  assert(
    restockEvents.some((e) => e.categorySlug === "cement-civil-works"),
    "Socket emitted 'catalog:category_restocked' event"
  );

  // Cleanup socket
  socket.disconnect();

  // Summary
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log("\n================================================================================");
  console.log(`  VERIFICATION RESULTS: ${passed}/${results.length} CHECKS PASSED (${failed} FAILED)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("FATAL E2E ERROR:", err);
  process.exit(1);
});
