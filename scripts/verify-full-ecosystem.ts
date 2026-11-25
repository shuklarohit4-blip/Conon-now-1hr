import assert from "node:assert";

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:5001";

async function req(path: string, options: RequestInit = {}) {
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
  console.log("  CONON-NOW FULL-ECOSYSTEM E2E RELAY & STRESS TEST");
  console.log("  Customer ➔ Vendor ➔ Driver ➔ Admin in Lucknow Corridor");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}:`, err?.message || err);
    }
  }

  // 1. Roster and profile check
  await test("1. Delivery fleet roster is active with 4 Lucknow vehicle classes", async () => {
    const res = await req("/api/driver/roster");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(Array.isArray(res.data.drivers), true);
    assert.strictEqual(res.data.drivers.length, 4);

    const vehicleTypes = res.data.drivers.map((d: any) => d.vehicleType);
    assert.ok(vehicleTypes.includes("2W_BIKE"));
    assert.ok(vehicleTypes.includes("3W_ELECTRIC_LOADER"));
    assert.ok(vehicleTypes.includes("4W_PICKUP"));
    assert.ok(vehicleTypes.includes("TRACTOR_DUMPER"));
  });

  // 2. Customer places order
  let orderId = "";
  let customerDeliveryOtp = "";
  let vendorPickupOtp = "";

  await test("2. Customer places order: dual OTPs generated & pickupOtp masked from customer", async () => {
    const checkoutRes = await req("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber: "9876543210",
        deliveryAddress: "Plot 104, Gomti Nagar Extension, Lucknow — 226010",
        categoryFilter: "Cement & Civil Works",
      }),
    });

    assert.strictEqual(checkoutRes.status, 200);
    assert.ok(checkoutRes.data.id, "Expected valid orderId");
    orderId = checkoutRes.data.id;

    assert.ok(checkoutRes.data.deliveryOtp, "Expected customer deliveryOtp to be returned");
    assert.strictEqual(checkoutRes.data.deliveryOtp.length, 4, "OTP must be 4 digits");
    customerDeliveryOtp = checkoutRes.data.deliveryOtp;

    // Security check: Customer MUST NOT see the Dukandar Pickup OTP!
    assert.strictEqual(
      checkoutRes.data.pickupOtp,
      undefined,
      "Security violation: pickupOtp leaked to customer response",
    );
  });

  // 3. Customer order retrieval by current or ID
  await test("3. Customer retrieval endpoint (/api/orders/:id) masks pickupOtp & margins", async () => {
    const res = await req(`/api/orders/${orderId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.order.deliveryOtp, customerDeliveryOtp);
    assert.strictEqual(res.data.order.pickupOtp, undefined);
    assert.strictEqual(res.data.order.cononNetMargin, undefined);
  });

  // 4. Vendor console receives incoming order
  await test("4. Vendor console sees incoming order with Dukandar OTP & deliveryOtp masked", async () => {
    // Authenticate / resolve as Shree Balaji Cement
    const res = await req("/api/vendor/orders", {
      headers: { "x-vendor-store": "Shree Balaji Cement & Steel" },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data), "Expected orders array");

    const found = res.data.find((o: any) => o.id === orderId);
    assert.ok(found, `Expected order ${orderId} in vendor orders queue`);
    assert.ok(found.pickupOtp, "Vendor must see Dukandar pickupOtp");
    assert.strictEqual(found.pickupOtp.length, 4);
    vendorPickupOtp = found.pickupOtp;

    // Security check: Vendor MUST NOT see customer delivery OTP!
    assert.strictEqual(
      found.deliveryOtp,
      undefined,
      "Security violation: deliveryOtp leaked to vendor console",
    );
  });

  // 5. Vendor accepts & stages order as PACKING_READY
  await test("5. Vendor accepts order & marks PACKING_READY for fleet dispatch", async () => {
    const acceptRes = await req(`/api/vendor/orders/${orderId}/accept`, {
      method: "POST",
      headers: { "x-vendor-store": "Shree Balaji Cement & Steel" },
    });
    assert.strictEqual(acceptRes.status, 200);
    assert.strictEqual(acceptRes.data.success, true);
  });

  // 6. Driver checks available dispatches
  await test("6. Driver checks available dispatches: OTPs are strictly masked", async () => {
    const res = await req("/api/driver/trips/available?driverId=DRV-LKO-203");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    const trip = res.data.trips.find((t: any) => t.id === orderId);
    assert.ok(trip, `Order ${orderId} must be available for 4W pickup driver`);

    // Driver must not see the secret customer OTP before physical delivery
    assert.strictEqual(trip.customerOtp, undefined, "Security violation: customerOtp visible in open dispatch feed");
  });

  // 7. Atomic Claim Lock: Driver 1 accepts, Driver 2 is rejected with 409 Conflict
  await test("7. Atomic Claim Lock: First driver claims, second driver gets 409 Conflict", async () => {
    // Driver 1 (Vikram Singh) claims
    const claimRes1 = await req(`/api/driver/trips/${orderId}/accept`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-203" },
    });
    assert.strictEqual(claimRes1.status, 200);
    assert.strictEqual(claimRes1.data.success, true);

    // Driver 2 (Rajesh Kumar) attempts to claim same order
    const claimRes2 = await req(`/api/driver/trips/${orderId}/accept`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-201" },
    });
    assert.strictEqual(claimRes2.status, 409, "Must return 409 Conflict for double-booking");
  });

  // 8. Counter Handover: Wrong OTP rejected
  await test("8. Counter Handover rejects incorrect Dukandar Pickup OTP", async () => {
    const res = await req(`/api/driver/trips/${orderId}/pickup`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-203" },
      body: JSON.stringify({ otp: "0000" }), // Wrong OTP
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.includes("Invalid Pickup OTP"));
  });

  // 9. Counter Handover: Correct OTP advances to OUT_FOR_DELIVERY
  await test("9. Counter Handover with correct Dukandar OTP transitions to OUT_FOR_DELIVERY", async () => {
    const res = await req(`/api/driver/trips/${orderId}/pickup`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-203" },
      body: JSON.stringify({ otp: vendorPickupOtp }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.order.status, "OUT_FOR_DELIVERY");
  });

  // 10. Driver arrives at site gate
  await test("10. Driver marks arrival at site gate (ARRIVED_AT_SITE)", async () => {
    const res = await req(`/api/driver/trips/${orderId}/arrive-site`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-203" },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.order.status, "ARRIVED_AT_SITE");
  });

  // 11. Final Delivery: Wrong customer OTP rejected
  await test("11. Site Unloading rejects incorrect Customer Delivery OTP", async () => {
    const res = await req(`/api/driver/trips/${orderId}/deliver`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-203" },
      body: JSON.stringify({ deliveryOtp: "9999" }), // Wrong code
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.includes("Invalid Customer Delivery OTP"));
  });

  // 12. Final Delivery + Idempotent Financial Settlement
  await test("12. Site Unloading with correct Delivery OTP delivers & credits Kamai wallet", async () => {
    const res = await req(`/api/driver/trips/${orderId}/deliver`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-203" },
      body: JSON.stringify({
        deliveryOtp: customerDeliveryOtp,
        podPhotoUrl: "/images/pod/verified-site-drop.webp",
      }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.earned > 0, "Driver earned must be > 0");

    // Check driver wallet
    const walletRes = await req("/api/driver/wallet", {
      headers: { "x-driver-id": "DRV-LKO-203" },
    });
    assert.strictEqual(walletRes.status, 200);
    assert.ok(walletRes.data.walletBalance > 0);
  });

  // 13. Idempotency Guard: Replay attack prevention
  await test("13. Idempotency Guard: Repeated deliver call returns alreadyDelivered without duplicate credits", async () => {
    const walletBefore = (await req("/api/driver/wallet", { headers: { "x-driver-id": "DRV-LKO-203" } })).data.walletBalance;

    const replayRes = await req(`/api/driver/trips/${orderId}/deliver`, {
      method: "POST",
      headers: { "x-driver-id": "DRV-LKO-203" },
      body: JSON.stringify({
        deliveryOtp: customerDeliveryOtp,
        podPhotoUrl: "/images/pod/verified-site-drop.webp",
      }),
    });
    assert.strictEqual(replayRes.status, 200);
    assert.strictEqual(replayRes.data.alreadyDelivered, true);

    const walletAfter = (await req("/api/driver/wallet", { headers: { "x-driver-id": "DRV-LKO-203" } })).data.walletBalance;
    assert.strictEqual(walletBefore, walletAfter, "Wallet balance must remain unchanged on idempotent retry");
  });

  // 14. Admin Control Room Full Inspection
  await test("14. Admin Control Room inspects full order with dual OTPs and Net Margin", async () => {
    const adminRes = await req(`/api/admin/orders/${orderId}`, {
      headers: { "x-admin-key": "conon-internal-dev" },
    });
    assert.strictEqual(adminRes.status, 200);
    assert.strictEqual(adminRes.data.success, true);

    const o = adminRes.data.order;
    assert.strictEqual(o.pickupOtp, vendorPickupOtp);
    assert.strictEqual(o.deliveryOtp, customerDeliveryOtp);
    assert.ok(o.cononNetMargin >= 0);
    assert.ok(o.timeline.length >= 4, "Timeline must record each canonical transition");
    assert.strictEqual(o.status, "DELIVERED");
  });

  console.log("\n-------------------------------------------------------");
  console.log(`  RESULT: ${passed} / ${total} Ecosystem Tests Passed`);
  console.log("-------------------------------------------------------\n");

  if (passed !== total) {
    process.exit(1);
  }
}

void run();
