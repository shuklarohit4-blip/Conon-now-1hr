import assert from "node:assert";

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:5001";

interface ApiResponse<T = any> {
  status: number;
  ok: boolean;
  data: T;
}

async function req<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, data: json };
}

async function run() {
  console.log("\n=======================================================");
  console.log("  CONON-NOW MASTER 4-PANEL COORDINATION & STRESS TEST");
  console.log("  Customer ➔ Vendor ➔ Driver ➔ Admin Live Relay");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  function test(label: string, fn: () => Promise<void> | void) {
    total++;
    return (async () => {
      try {
        await fn();
        console.log(`  ✅ [PASS] ${total}. ${label}`);
        passed++;
      } catch (err: any) {
        console.error(`  ❌ [FAIL] ${total}. ${label}: ${err.message}`);
      }
    })();
  }

  // Tokens acquired during tests
  let customerToken = "";
  let vendorToken = "";
  let adminToken = "";
  let driverToken = "";

  // Order created during relay
  let relayOrderId = "";
  let pickupOtp = "";
  let deliveryOtp = "";
  let driverId = "DRV-LKO-201";

  // SECTION 1: CATALOG, GST & IMAGE CHECK
  await test("Catalog live endpoint serves all 16 categories with verified GST slabs", async () => {
    const res = await req("/api/catalog/live");
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert.ok(res.data.success, "Expected success: true");
    assert.ok(Array.isArray(res.data.categories), "Expected categories array");
    assert.ok(res.data.categories.length >= 16, `Expected at least 16 categories, got ${res.data.categories.length}`);
    const items: any[] = res.data.items || [];
    assert.ok(items.length >= 500, `Expected 500+ SKUs, got ${items.length}`);

    // Verify 2026 GST Slabs
    const sandSku = items.find((s) => s.name?.toLowerCase().includes("morang") || s.name?.toLowerCase().includes("sand"));
    if (sandSku) {
      assert.ok(sandSku.gstPercent === 5 || sandSku.gstRate === 5 || sandSku.gstSlab === "5%", "Sand must carry 5% GST slab");
    }
    const cementSku = items.find((s) => s.name?.toLowerCase().includes("cement"));
    if (cementSku) {
      assert.ok(cementSku.gstPercent === 18 || cementSku.gstRate === 18 || cementSku.gstSlab === "18%", "Cement must carry 18% GST slab");
    }
  });

  await test("Real product WebP images return HTTP 200 directly from static server", async () => {
    const res = await req("/images/products/cement/ultratech-ppc-cement-50kg.webp");
    assert.strictEqual(res.status, 200, "Cement packshot must serve HTTP 200 from backend static route");
  });

  // SECTION 2: AUTH & ROLE-SCOPED TOKENS
  await test("Auth Isolation: Issue isolated Customer, Vendor, and Admin JWT tokens", async () => {
    // Admin login
    const adminRes = await req("/api/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@conon.in", password: "admin123" }),
    });
    assert.ok(adminRes.ok && adminRes.data.token, "Admin login must issue admin JWT");
    adminToken = adminRes.data.token;

    // Vendor login
    const vendorRes = await req("/api/auth/vendor-login", {
      method: "POST",
      body: JSON.stringify({
        phone: "9839011223",
        storeName: "Katawala Hardware & Locks",
        name: "Manoj Katawala",
      }),
    });
    assert.ok(vendorRes.ok && vendorRes.data.token, "Vendor login must issue vendor JWT");
    vendorToken = vendorRes.data.token;

    // Customer login
    const customerRes = await req("/api/auth/customer-login", {
      method: "POST",
      body: JSON.stringify({
        phone: "9876543210",
        name: "Rohit Shukla",
      }),
    });
    assert.ok(customerRes.ok && customerRes.data.token, "Customer login must issue customer JWT");
    customerToken = customerRes.data.token;

    // Driver switch/login
    const driverRes = await req("/api/driver/switch", {
      method: "POST",
      body: JSON.stringify({ driverId }),
    });
    assert.ok(driverRes.ok && driverRes.data.token, "Driver switch must issue driver JWT");
    driverToken = driverRes.data.token;
  });

  // SECTION 3: RBAC & MASKING CONTROLS
  await test("RBAC Guard: Driver and Vendor tokens are strictly rejected from Admin API", async () => {
    const driverAttempt = await req("/api/admin/orders", {
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.ok(driverAttempt.status === 401 || driverAttempt.status === 403, `Driver must be blocked from /admin, got ${driverAttempt.status}`);

    const vendorAttempt = await req("/api/admin/orders", {
      headers: { Authorization: `Bearer ${vendorToken}` },
    });
    assert.ok(vendorAttempt.status === 401 || vendorAttempt.status === 403, `Vendor must be blocked from /admin, got ${vendorAttempt.status}`);
  });

  // SECTION 4: 4-PANEL LIVE RELAY SIMULATION
  await test("Relay Stage 1 (Customer): Place Order -> Dual OTPs generated & pickupOtp masked from customer", async () => {
    const orderRes = await req("/api/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        deliveryAddress: "Gomti Nagar Phase 2, Lucknow — 226010",
        phoneNumber: "9876543210",
        categoryFilter: "Door Hardware & Locks",
      }),
    });

    assert.ok(orderRes.ok, `Order creation failed: ${JSON.stringify(orderRes.data)}`);
    assert.ok(orderRes.data.id, "Expected created order id");
    relayOrderId = orderRes.data.id;

    // Customer receives deliveryOtp but NEVER pickupOtp
    assert.ok(orderRes.data.deliveryOtp, "Customer must receive deliveryOtp for site handover");
    assert.strictEqual(orderRes.data.pickupOtp, undefined, "Customer must NEVER receive pickupOtp");
    deliveryOtp = orderRes.data.deliveryOtp;
  });

  await test("Relay Stage 2 (Vendor): Vendor sees order with Pickup OTP & accepts order into PACKING_READY", async () => {
    // Vendor checks incoming orders
    const ordersRes = await req("/api/vendor/orders", {
      headers: { Authorization: `Bearer ${vendorToken}` },
    });
    assert.ok(ordersRes.ok, "Vendor must be able to list store orders");

    // Vendor accepts order
    const acceptRes = await req(`/api/vendor/orders/${relayOrderId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${vendorToken}` },
    });
    assert.ok(acceptRes.ok, `Vendor accept failed: ${JSON.stringify(acceptRes.data)}`);
    assert.ok(acceptRes.data.pickupOtp, "Vendor accept must reveal pickupOtp");
    pickupOtp = acceptRes.data.pickupOtp;

    // Vendor marks ready for pickup
    const readyRes = await req(`/api/vendor/orders/${relayOrderId}/ready-for-pickup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${vendorToken}` },
    });
    assert.ok(readyRes.ok, "Vendor markReady must succeed");
    assert.ok(readyRes.data.canonicalStatus === "PACKING_READY" || readyRes.data.status === "ready", "Status must be PACKING_READY or ready");
  });

  await test("Relay Stage 3 (Driver): Driver sees dispatch with OTPs strictly masked", async () => {
    const availRes = await req("/api/driver/trips/available", {
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.ok(availRes.ok, "Driver must be able to list available dispatches");
    const found = availRes.data.trips?.find((t: any) => t.id === relayOrderId);
    assert.ok(found, "Driver must see newly staged order in available dispatches");
    assert.strictEqual(found.pickupOtp, undefined, "Driver must NOT see pickupOtp in available trips");
    assert.strictEqual(found.deliveryOtp, undefined, "Driver must NOT see deliveryOtp in available trips");
  });

  await test("Relay Stage 4 (Driver): Atomic Claim Lock -> Second driver receives 409 Conflict", async () => {
    // Driver 1 claims trip
    const claimRes = await req(`/api/driver/trips/${relayOrderId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.ok(claimRes.ok, "Driver 1 claim must succeed");

    // Switch to Driver 2
    const driver2TokenRes = await req("/api/driver/switch", {
      method: "POST",
      body: JSON.stringify({ driverId: "DRV-LKO-202" }),
    });
    const driver2Token = driver2TokenRes.data.token;

    // Driver 2 attempts to claim same order
    const conflictRes = await req(`/api/driver/trips/${relayOrderId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driver2Token}` },
    });
    assert.strictEqual(conflictRes.status, 409, `Second driver claim must return 409 Conflict, got ${conflictRes.status}`);
  });

  await test("Relay Stage 5 (Driver Counter Handover): Rejects incorrect Pickup OTP", async () => {
    const rejectRes = await req(`/api/driver/trips/${relayOrderId}/pickup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({ pickupOtp: "0000" }),
    });
    assert.strictEqual(rejectRes.status, 400, "Wrong pickup OTP must be rejected with 400");
  });

  await test("Relay Stage 6 (Driver Counter Handover): Correct Pickup OTP transitions to OUT_FOR_DELIVERY", async () => {
    const pickupRes = await req(`/api/driver/trips/${relayOrderId}/pickup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({ pickupOtp }),
    });
    assert.ok(pickupRes.ok, `Pickup failed: ${JSON.stringify(pickupRes.data)}`);
    assert.strictEqual(pickupRes.data.order.status, "OUT_FOR_DELIVERY");
  });

  await test("Relay Stage 7 (Driver Arrival): Driver marks ARRIVED_AT_SITE gate", async () => {
    const arriveRes = await req(`/api/driver/trips/${relayOrderId}/arrive-site`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    assert.ok(arriveRes.ok, "Arrive site must succeed");
    assert.strictEqual(arriveRes.data.order.status, "ARRIVED_AT_SITE");
  });

  await test("Relay Stage 8 (Site Handover): Rejects incorrect Customer Delivery OTP", async () => {
    const wrongOtpRes = await req(`/api/driver/trips/${relayOrderId}/deliver`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({
        deliveryOtp: "9999",
        podPhotoUrl: "/images/pod/default-delivered.webp",
      }),
    });
    assert.strictEqual(wrongOtpRes.status, 400, "Wrong customer delivery OTP must be rejected with 400");
  });

  await test("Relay Stage 9 (POD & Complete Delivery): Verifies Customer Delivery OTP, marks DELIVERED & credits wallets", async () => {
    // 1. Upload POD photo
    const podRes = await req("/api/driver/upload-pod", {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({ base64Image: "pod-proof-verification" }),
    });
    assert.ok(podRes.ok, "POD photo upload must succeed");
    const photoUrl = podRes.data.photoUrl;

    // 2. Submit delivery completion with verified delivery OTP
    const deliverRes = await req(`/api/driver/trips/${relayOrderId}/deliver`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({
        deliveryOtp,
        podPhotoUrl: photoUrl,
      }),
    });
    assert.ok(deliverRes.ok, `Delivery completion failed: ${JSON.stringify(deliverRes.data)}`);
    assert.ok(deliverRes.data.order?.status === "DELIVERED" || deliverRes.data.success, "Order must be DELIVERED");
    if (deliverRes.data.order) {
      assert.strictEqual(deliverRes.data.order.financialsPosted, true, "financialsPosted must be true");
    }
  });

  await test("Relay Stage 10 (Financial Idempotency): Repeated delivery call returns alreadyDelivered without duplicate credits", async () => {
    const repeatRes = await req(`/api/driver/trips/${relayOrderId}/deliver`, {
      method: "POST",
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({
        deliveryOtp,
        podPhotoUrl: "/images/pod/default-delivered.webp",
      }),
    });
    assert.ok(repeatRes.ok, "Repeat delivery call must succeed gracefully");
    assert.strictEqual(repeatRes.data.alreadyDelivered, true, "Must flag alreadyDelivered: true to prevent duplicate credits");
  });

  await test("Relay Stage 11 (Admin Control Room): Admin inspects order with dual OTPs, margin breakdown & God-Eye telemetry", async () => {
    const adminOrdersRes = await req("/api/admin/orders", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.ok(adminOrdersRes.ok, "Admin must be able to retrieve all orders");
    const inspected = adminOrdersRes.data.find((o: any) => o.id === relayOrderId);
    assert.ok(inspected, "Admin must see the completed order in Orders module");
    assert.ok(inspected.pickupOtp && inspected.deliveryOtp, "Admin must be able to view both pickup and delivery OTPs for audit");
    assert.ok(inspected.cononNetMargin !== undefined, "Admin must see cononNetMargin calculation");

    // God-Eye KPI Telemetry
    const godEyeRes = await req("/api/admin/god-eye", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.ok(godEyeRes.ok, "Admin must be able to fetch God-Eye metrics");
    assert.ok(godEyeRes.data.kpis, "God-Eye must return sparkline KPIs");
  });

  console.log("\n-------------------------------------------------------");
  console.log(`  RESULT: ${passed} / ${total} Master Platform Tests Passed`);
  console.log("-------------------------------------------------------\n");

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("Master Test Runner Error:", e);
  process.exit(1);
});
