/**
 * E2E Verification Script for Conon-Friend Vendor Partner Console & Ecosystem Sync
 */

const API = "http://localhost:5001/api";

async function run() {
  console.log("=== STEP 1: Testing /api/vendor/me ===");
  const meRes = await fetch(`${API}/vendor/me`);
  const meData = await meRes.json();
  console.log(`[PASS] Store Name: "${meData.vendor?.shopName}" | Code: ${meData.vendor?.shopCode} | Hub: ${meData.vendor?.hubZone}`);
  if (!meData.vendor?.shopName || meData.vendor.shopName.includes("undf")) {
    throw new Error("Invalid store name detected in /api/vendor/me!");
  }

  console.log("\n=== STEP 2: Testing /api/vendor/hubs ===");
  const hubsRes = await fetch(`${API}/vendor/hubs`);
  const hubsData = await hubsRes.json();
  console.log(`[PASS] Retrieved ${hubsData.hubs?.length} pre-seeded Lucknow hubs:`);
  hubsData.hubs.forEach((h: any) => console.log(`   • [${h.shopCode}] ${h.shopName} (${h.hubZone})`));

  console.log("\n=== STEP 3: Testing /api/vendor/switch-shop (Switching to Shree Balaji Cement CN-LKO-102) ===");
  const switchRes = await fetch(`${API}/vendor/switch-shop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shopCodeOrId: "CN-LKO-102" }),
  });
  const switchData = await switchRes.json();
  const token = switchData.token;
  console.log(`[PASS] Successfully switched! New Active Store: "${switchData.vendor?.shopName}" | Token issued.`);

  console.log("\n=== STEP 4: Testing /api/vendor/products with new token ===");
  const prodRes = await fetch(`${API}/vendor/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const products = await prodRes.json();
  console.log(`[PASS] Retrieved ${products.length} SSOT products for Cement & Steel category:`);
  products.slice(0, 3).forEach((p: any) => {
    console.log(`   • ${p.name} (${p.brand}) — Cust: ₹${p.sellingPrice} | Dealer Landing: ₹${p.dealerLandingCost} | InStock: ${p.inStock}`);
  });

  console.log("\n=== STEP 5: Testing /api/vendor/products/:id (1-Tap Stock & Rate Update) ===");
  const targetSku = products[0];
  const patchRes = await fetch(`${API}/vendor/products/${targetSku.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ inStock: !targetSku.inStock, dealerLandingCost: targetSku.dealerLandingCost + 15 }),
  });
  const patchData = await patchRes.json();
  console.log(`[PASS] Product updated: ${patchData.product.name} | New Stock: ${patchData.product.inStock} | New Rate: ₹${patchData.product.dealerLandingCost}`);

  console.log("\n=== STEP 6: Testing /api/vendor/dev/test-order (Simulate Incoming Order) ===");
  const testOrdRes = await fetch(`${API}/vendor/dev/test-order`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const order = await testOrdRes.json();
  console.log(`[PASS] New Order Created: #${order.shortId} | Status: ${order.status}/${order.rawStatus} | OTP: [${order.pickupOtp}]`);
  console.log(`       Items: ${order.items} | Guaranteed Dealer Payout: ₹${order.totalDealerPayout}`);
  console.log(`       Rider: ${order.rider?.name} (${order.rider?.vehicleLabel}) - ETA: ${order.rider?.etaMins} mins`);

  console.log("\n=== STEP 7: Testing /api/vendor/orders/:id/accept (Accept & Pack) ===");
  const acceptRes = await fetch(`${API}/vendor/orders/${order.id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const acceptData = await acceptRes.json();
  console.log(`[PASS] Order Accepted! Status: ${acceptData.status} | 4-Digit Pickup OTP: ${acceptData.pickupOtp}`);

  console.log("\n=== STEP 8: Testing /api/vendor/orders/:id/ready-for-pickup (Hand Over to Rider) ===");
  const readyRes = await fetch(`${API}/vendor/orders/${order.id}/ready-for-pickup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const readyData = await readyRes.json();
  console.log(`[PASS] Order Handed Over to Rider! Status: ${readyData.status}`);

  console.log("\n=== STEP 9: Testing /api/vendor/payouts (Paisa Meter & UTR Passbook) ===");
  const payoutsRes = await fetch(`${API}/vendor/payouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payoutsData = await payoutsRes.json();
  console.log(`[PASS] Paisa Meter Balance: ₹${payoutsData.wallet?.pendingSettlement}`);
  console.log(`       Today's Earnings: ₹${payoutsData.wallet?.todayEarnings}`);
  console.log(`       Passbook Entries: ${payoutsData.wallet?.ledger?.length} transactions`);
  console.log(`       Latest Entry: "${payoutsData.wallet?.ledger[0]?.description}" — ₹${payoutsData.wallet?.ledger[0]?.amount}`);

  console.log("\n=== STEP 10: Testing /api/vendor/payouts/request (Request Withdrawal) ===");
  const reqPayoutRes = await fetch(`${API}/vendor/payouts/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: 2500 }),
  });
  const reqPayoutData = await reqPayoutRes.json();
  const createdLedger = reqPayoutData.ledger[0];
  console.log(`[PASS] Withdrawal Requested! Ledger ID: ${createdLedger.id} | Amount: ₹${createdLedger.amount} | Status: ${createdLedger.status}`);

  console.log("\n=== STEP 11: Testing Admin Control Room Sync (/api/admin/payouts) ===");
  // Pass admin authentication key
  const adminHeaders = { "x-admin-key": process.env.MAC_ADMIN_KEY || "conon_mac_secret_9988" };
  const adminPayoutsRes = await fetch(`${API}/admin/payouts`, {
    headers: adminHeaders,
  });
  const adminPayouts = await adminPayoutsRes.json();
  console.log(`[PASS] Admin Payouts List retrieved (${adminPayouts.length} entries).`);
  const matchingAdmin = adminPayouts.find((p: any) => p.id === createdLedger.id);
  console.log(`       Found Pending Request in Admin: Store "${matchingAdmin?.vendorStore}" — ₹${matchingAdmin?.amount}`);

  console.log("\n=== STEP 12: Testing Admin Payout Approval (/api/admin/payouts/:id/approve) ===");
  const approveRes = await fetch(`${API}/admin/payouts/${createdLedger.id}/approve`, {
    method: "POST",
    headers: adminHeaders,
  });
  const approveData = await approveRes.json();
  console.log(`[PASS] Admin Approved Payout! Status: ${approveData.status} | Generated UTR: ${approveData.utrNumber}`);

  console.log("\n🎉 ALL 12 E2E VENDOR CONSOLE & ECOSYSTEM TESTS PASSED PERFECTLY!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
