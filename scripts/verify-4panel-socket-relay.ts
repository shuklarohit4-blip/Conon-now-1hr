import assert from "node:assert";
import { io as ioClient, type Socket } from "../artifacts/conon/node_modules/socket.io-client/build/esm/index.js";

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:5001";
const SOCKET_URL = BASE_URL;
const MAC_ADMIN_KEY = "conon_mac_secret_9988";

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

function waitForEvent<T = any>(socket: any, event: string, timeoutMs = 6000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timeout waiting for event "${event}" after ${timeoutMs}ms`));
    }, timeoutMs);

    function handler(data: T) {
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(data);
    }

    socket.on(event, handler);
  });
}

async function main() {
  console.log("\n=======================================================");
  console.log("  CONON-NOW REAL-TIME 4-PANEL RELAY SOCKET VERIFICATION");
  console.log("  Customer ➔ Vendor ➔ Driver ➔ Admin Command OS");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  async function step(label: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${total}. ${label}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${total}. ${label}: ${err.message}`);
      throw err;
    }
  }

  let adminSocket: any = null;
  let vendorSocket: any = null;
  let driverSocket: any = null;

  let testOrderId = "";
  const testDriverId = "DRV-LKO-CH-01";
  const testHubId = "hub-naka";

  try {
    // ── STEP 1: Connect all 3 client sockets ──
    await step("Establish WebSocket connections to Socket.io /api/socket.io", async () => {
      adminSocket = (ioClient as any)(SOCKET_URL, {
        path: "/api/socket.io",
        transports: ["websocket"],
        reconnection: false,
      });

      vendorSocket = (ioClient as any)(SOCKET_URL, {
        path: "/api/socket.io",
        transports: ["websocket"],
        reconnection: false,
      });

      driverSocket = (ioClient as any)(SOCKET_URL, {
        path: "/api/socket.io",
        transports: ["websocket"],
        reconnection: false,
      });

      await Promise.all([
        waitForEvent(adminSocket, "system:ready"),
        waitForEvent(vendorSocket, "system:ready"),
        waitForEvent(driverSocket, "system:ready"),
      ]);

      assert.ok(adminSocket.connected, "Admin socket must be connected");
      assert.ok(vendorSocket.connected, "Vendor socket must be connected");
      assert.ok(driverSocket.connected, "Driver socket must be connected");
    });

    // ── STEP 2: Join panel rooms ──
    await step("Authorize & Join panel rooms (admin:command_os, vendor:hub-naka, driver:DRV-LKO-CH-01)", async () => {
      const pAdmin = waitForEvent(adminSocket!, "admin:joined");
      adminSocket!.emit("join:admin", { adminKey: MAC_ADMIN_KEY });
      const adminJoined = await pAdmin;
      assert.ok(adminJoined.success, "Admin room authorization must succeed");

      const pVendor = waitForEvent(vendorSocket!, "vendor:joined");
      vendorSocket!.emit("join:vendor", { hubId: testHubId });
      const vendorJoined = await pVendor;
      assert.strictEqual(vendorJoined.hubId, testHubId, "Vendor room must match hub-naka");

      const pDriver = waitForEvent(driverSocket!, "driver:joined");
      driverSocket!.emit("join:driver", { driverId: testDriverId });
      const driverJoined = await pDriver;
      assert.strictEqual(driverJoined.driverId, testDriverId, "Driver room must match DRV-LKO-CH-01");
    });

    // ── STEP 3: Customer Order Creation triggers 180s Watchdog & Vendor Buzzer ──
    await step("Customer creates order -> triggers 180s Watchdog & emits vendor:new_order", async () => {
      const pVendorOrder = waitForEvent(vendorSocket!, "vendor:new_order");
      const pAdminOrder = waitForEvent(adminSocket!, "admin:new_order_dispatched");

      const orderRes = await req("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          deliveryAddress: "Villa 42, Sushant Golf City, Sultanpur Road, Lucknow",
          phoneNumber: "9415088219",
          categoryFilter: "Cement & Civil Works",
        }),
      });

      assert.strictEqual(orderRes.status, 200, `Order creation must return 200, got ${orderRes.status}`);
      assert.ok(orderRes.data.id || orderRes.data.shortId, "Order must return ID");
      testOrderId = orderRes.data.id;

      const vendorEvent = await pVendorOrder;
      assert.ok(vendorEvent.incomingSecondsLeft === 180 || vendorEvent.expiresAt, "Vendor buzzer must carry 180s incoming countdown");
      assert.strictEqual(vendorEvent.hubId, testHubId, "Vendor order must target hub-naka");

      const adminEvent = await pAdminOrder;
      assert.strictEqual(adminEvent.assignedHubId, testHubId, "Admin event must identify assigned hub");
    });

    // ── STEP 4: Vendor Accepts Order -> Cancels Watchdog & Dispatches Driver ──
    await step("Vendor accepts order -> stops 180s cascade & emits driver:new_mission with multi-stop plan", async () => {
      const pDriverMission = waitForEvent(driverSocket!, "driver:new_mission");
      const pAdminAccepted = waitForEvent(adminSocket!, "admin:order_accepted");

      const acceptRes = await req(`/api/vendor/orders/${testOrderId}/accept`, {
        method: "POST",
        headers: {
          "x-vendor-store": "hub-naka",
        },
      });

      assert.strictEqual(acceptRes.status, 200, `Vendor accept must return 200, got ${acceptRes.status}`);
      assert.ok(acceptRes.data.success, "Accept response must be successful");
      assert.ok(acceptRes.data.multiStopPlan, "Response must include multi-stop plan");

      const mission = await pDriverMission;
      assert.strictEqual(mission.orderId, testOrderId, "Mission order ID must match");
      assert.strictEqual(mission.vehicleType, "CHHOTA_HATHI", "Cement payload (>30kg) must require Chhota Hathi");
      assert.ok(Array.isArray(mission.stops) && mission.stops.length >= 1, "Mission must include pickup stops");

      const adminAccepted = await pAdminAccepted;
      assert.strictEqual(adminAccepted.orderId, testOrderId, "Admin must receive accepted notification");
    });

    // ── STEP 5: Driver GPS Arrival & 15-Minute Detention Auto-Meter ──
    await step("Driver reports GPS arrival at site -> starts 15-min free unloading window", async () => {
      const pAdminArrived = waitForEvent(adminSocket!, "admin:driver_arrived");

      const arriveRes = await req(`/api/driver/orders/${testOrderId}/arrived`, {
        method: "POST",
        headers: {
          "x-driver-id": testDriverId,
        },
        body: JSON.stringify({
          driverId: testDriverId,
          lat: 26.7824,
          lng: 80.9892,
        }),
      });

      assert.strictEqual(arriveRes.status, 200, `Arrival must return 200, got ${arriveRes.status}`);
      assert.strictEqual(arriveRes.data.status, "ARRIVED_AT_SITE", "Status must transition to ARRIVED_AT_SITE");
      assert.strictEqual(arriveRes.data.freeWindowMinutes, 15, "Free window must be 15 minutes");
      assert.strictEqual(arriveRes.data.detentionRatePerMinute, 2, "Detention rate must be ₹2/min");

      const adminArrived = await pAdminArrived;
      assert.strictEqual(adminArrived.orderId, testOrderId, "Admin must receive driver arrived event");
    });

    // ── STEP 6: Global Rain-Shield "Tarpaulin Lock" Mode ──
    await step("Admin activates Rain-Shield Tirpal Mode -> broadcasts system:rain_mode_changed", async () => {
      const pRainAdmin = waitForEvent(adminSocket!, "system:rain_mode_changed");
      const pRainDriver = waitForEvent(driverSocket!, "system:rain_mode_changed");

      const rainRes = await req("/api/admin/weather-rain-mode", {
        method: "POST",
        headers: {
          "x-admin-key": MAC_ADMIN_KEY,
        },
        body: JSON.stringify({ rainMode: true }),
      });

      assert.strictEqual(rainRes.status, 200, `Rain mode toggle must return 200, got ${rainRes.status}`);
      assert.strictEqual(rainRes.data.rainMode, true, "Rain mode must be active");

      const rainEvent = await pRainAdmin;
      assert.strictEqual(rainEvent.rainMode, true, "Admin socket must receive active rain mode");
      const driverRainEvent = await pRainDriver;
      assert.strictEqual(driverRainEvent.rainMode, true, "Driver socket must receive active rain mode");
    });

    // ── STEP 7: Rain Mode Tarpaulin Gate Enforcement & Verification ──
    await step("Rain Mode Tarpaulin Gate: Rejects delivery without tarpaulin, accepts with tarpaulin proof", async () => {
      // 7a: Attempt complete-escrow without tarpaulin -> Must fail with 400
      const rejectRes = await req(`/api/driver/orders/${testOrderId}/complete-escrow`, {
        method: "POST",
        headers: { "x-driver-id": testDriverId },
        body: JSON.stringify({
          driverId: testDriverId,
          otp: "2026",
          podPhotoUrl: "/images/pod/site-proof.webp",
          tarpaulinPhotoVerified: false,
        }),
      });

      assert.strictEqual(rejectRes.status, 400, "Must reject delivery without tarpaulin verification during Rain Mode");
      assert.ok(rejectRes.data.error.includes("Tarpaulin"), "Error message must cite Tarpaulin requirement");

      // 7b: Complete escrow with tarpaulin photo verified -> Must succeed with 200
      const pAdminProof = waitForEvent(adminSocket!, "admin:escrow_proof_ready");
      const pDriverBuyback = waitForEvent(driverSocket!, "driver:reverse_buyback_ping");

      const successRes = await req(`/api/driver/orders/${testOrderId}/complete-escrow`, {
        method: "POST",
        headers: { "x-driver-id": testDriverId },
        body: JSON.stringify({
          driverId: testDriverId,
          otp: "2026",
          podPhotoUrl: "/images/pod/site-proof.webp",
          tarpaulinPhotoUrl: "/images/pod/tarpaulin-verified.webp",
          tarpaulinPhotoVerified: true,
          gpsDistanceMeters: 8,
          gpsMatchPercent: 99,
        }),
      });

      assert.strictEqual(successRes.status, 200, "Must accept delivery when tarpaulin is verified");
      assert.strictEqual(successRes.data.escrowStatus, "AWAITING_ADMIN", "Escrow status must be AWAITING_ADMIN");
      assert.strictEqual(successRes.data.palledariBonus, 120, "Driver must receive +₹120 Palledari bonus");
      assert.ok(successRes.data.reverseBuybackEligible, "Must be eligible for nearby reverse buyback");

      const proofEvent = await pAdminProof;
      assert.strictEqual(proofEvent.orderId, testOrderId, "Admin must receive escrow proof for order");
      assert.strictEqual(proofEvent.tarpaulinPhotoVerified, true, "Admin proof must reflect tarpaulin verified");

      const buybackPing = await pDriverBuyback;
      assert.ok(buybackPing.bonusAmount >= 220, "Driver must receive +₹220 Reverse Buyback bonus offer");
    });

    // ── STEP 8: Admin 1-Click Escrow Release & Instant UPI Settlement ──
    await step("Admin releases escrow -> credits vendor settled ledger & emits vendor:payout_settled", async () => {
      const pVendorPayout = waitForEvent(vendorSocket!, "vendor:payout_settled");

      const releaseRes = await req(`/api/admin/orders/${testOrderId}/release-escrow`, {
        method: "POST",
        headers: {
          "x-admin-key": MAC_ADMIN_KEY,
        },
        body: JSON.stringify({
          amount: 8420,
        }),
      });

      assert.strictEqual(releaseRes.status, 200, `Escrow release must return 200, got ${releaseRes.status}`);
      assert.strictEqual(releaseRes.data.success, true, "Escrow release must succeed");
      const utr = releaseRes.data.utr || releaseRes.data.settledUtr;
      assert.ok(utr && utr.startsWith("HDFC"), "Settlement must generate mock HDFC bank UTR");

      const payoutEvent = await pVendorPayout;
      assert.strictEqual(payoutEvent.orderId, testOrderId, "Vendor payout event must match order ID");
      assert.strictEqual(payoutEvent.status, "SETTLED", "Vendor payout must be SETTLED");
      assert.ok(payoutEvent.utr, "Vendor payout must carry bank UTR reference");
    });

    // ── STEP 9: Driver SOS Alert Live Broadcast ──
    await step("Driver breakdown SOS -> triggers instant red alert banner on Admin Command OS", async () => {
      const pAdminSos = waitForEvent(adminSocket!, "admin:driver_sos");

      const sosRes = await req(`/api/driver/orders/${testOrderId}/sos`, {
        method: "POST",
        headers: { "x-driver-id": testDriverId },
        body: JSON.stringify({
          orderId: testOrderId,
          driverName: "Ramesh Yadav (UP 32 CH 8912)",
          reason: "Rear axle flat tyre near Shaheed Path Medanta flyover",
          lat: 26.8123,
          lng: 80.9987,
        }),
      });

      assert.strictEqual(sosRes.status, 200, `Driver SOS must return 200, got ${sosRes.status}`);
      assert.strictEqual(sosRes.data.success, true, "SOS must succeed");

      const sosAlert = await pAdminSos;
      assert.strictEqual(sosAlert.orderId, testOrderId, "Admin SOS alert must match order ID");
      assert.ok(sosAlert.reason.includes("flat tyre"), "SOS reason must match");
    });

    // ── STEP 10: Reset Rain Mode to Normal ──
    await step("Reset Rain Mode back to standard weather conditions", async () => {
      const resetRes = await req("/api/admin/weather-rain-mode", {
        method: "POST",
        headers: { "x-admin-key": MAC_ADMIN_KEY },
        body: JSON.stringify({ rainMode: false }),
      });
      assert.strictEqual(resetRes.status, 200);
      assert.strictEqual(resetRes.data.rainMode, false);
    });

    console.log("\n=======================================================");
    console.log(`  🎉 ALL ${passed}/${total} REAL-TIME 4-PANEL RELAY TESTS PASSED!`);
    console.log("  Live Socket.io Relay is 100% operational across Lucknow!");
    console.log("=======================================================\n");
  } finally {
    if (adminSocket) adminSocket.disconnect();
    if (vendorSocket) vendorSocket.disconnect();
    if (driverSocket) driverSocket.disconnect();
  }
}

main().catch((err) => {
  console.error("\nFATAL RELAY TEST ERROR:", err);
  process.exit(1);
});
