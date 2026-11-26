import http from "http";

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log("=== VERIFYING ZERO-DUMMY CLEAN SLATE PRODUCTION RESET ===");

  // 1. Health Check
  const health = await request({
    hostname: "127.0.0.1",
    port: 5001,
    path: "/api/health",
    method: "GET",
  });
  console.log("1. Health Check:", health.status, health.data);
  if (health.status !== 200) throw new Error("Health check failed");

  // 2. KYC Queue (Admin)
  const kyc = await request({
    hostname: "127.0.0.1",
    port: 5001,
    path: "/api/kyc/admin/queue",
    method: "GET",
    headers: { "x-admin-key": "conon-lucknow-2026-admin-bypass" },
  });
  const apps = Array.isArray(kyc.data?.applications) ? kyc.data.applications : (Array.isArray(kyc.data) ? kyc.data : null);
  console.log("2. KYC Applications Count:", kyc.status, apps ? apps.length : "invalid");
  if (!Array.isArray(apps) || apps.length !== 0) {
    throw new Error(`Expected 0 KYC applications, got ${apps?.length}`);
  }

  // 3. Orders Queue
  const orders = await request({
    hostname: "127.0.0.1",
    port: 5001,
    path: "/api/admin/orders",
    method: "GET",
    headers: { "x-admin-key": "conon-lucknow-2026-admin-bypass" },
  });
  const ordList = Array.isArray(orders.data?.orders) ? orders.data.orders : (Array.isArray(orders.data) ? orders.data : []);
  console.log("3. Ecosystem Orders Count:", orders.status, ordList.length);
  if (ordList.length !== 0) {
    throw new Error(`Expected 0 ecosystem orders, got ${ordList.length}`);
  }

  // 4. GST Report
  const gst = await request({
    hostname: "127.0.0.1",
    port: 5001,
    path: "/api/admin/accounts/gst-report",
    method: "GET",
    headers: { "x-admin-key": "conon-lucknow-2026-admin-bypass" },
  });
  console.log("4. GST Report (Invoices):", gst.status, {
    totalTaxable: gst.data?.kpis?.taxableValue,
    totalGst: gst.data?.kpis?.totalGst,
    invoiceCount: gst.data?.invoices?.length,
  });
  if (gst.data?.kpis?.taxableValue !== 0 || gst.data?.invoices?.length !== 0) {
    throw new Error("Expected ₹0 taxable sales and 0 invoices in Clean Slate");
  }

  // 5. Driver Cockpit (Active Mission)
  const cockpit = await request({
    hostname: "127.0.0.1",
    port: 5001,
    path: "/api/driver/cockpit",
    method: "GET",
  });
  console.log("5. Driver Cockpit (Active Mission):", cockpit.status, cockpit.data?.activeMission);
  if (cockpit.data?.activeMission !== null) {
    throw new Error("Expected activeMission to be null in clean slate");
  }

  // 6. Test Admin Clean Slate API
  const cleanSlate = await request({
    hostname: "127.0.0.1",
    port: 5001,
    path: "/api/admin/clean-slate",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": "conon-lucknow-2026-admin-bypass",
    },
  }, { pin: "2026" });
  console.log("6. Clean Slate Trigger (PIN 2026):", cleanSlate.status, cleanSlate.data);
  if (cleanSlate.status !== 200 || !cleanSlate.data?.success) {
    throw new Error("Clean slate endpoint trigger failed");
  }

  console.log("\n>>> ALL ZERO-DUMMY CLEAN SLATE VERIFICATIONS PASSED SUCCESSFULLY! <<<");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
