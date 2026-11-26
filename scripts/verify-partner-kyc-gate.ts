import assert from "node:assert";

const BASE_URL = "http://localhost:5001";
const ADMIN_KEY = process.env.MAC_ADMIN_KEY || "conon_admin_secret_lucknow_2025";

async function runTests() {
  console.log("=========================================================");
  console.log("   CONON PARTNER KYC & AUTHENTICATION GATE E2E TEST      ");
  console.log("=========================================================\n");

  // TEST 1: Send OTP for Partner Login
  console.log("Test 1: POST /api/auth/partner-login (action: send_otp)");
  const sendOtpRes = await fetch(`${BASE_URL}/api/auth/partner-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "9876543210",
      role: "vendor",
      action: "send_otp",
    }),
  });
  assert.strictEqual(sendOtpRes.status, 200, "Send OTP status should be 200");
  const sendOtpData = await sendOtpRes.json();
  assert.strictEqual(sendOtpData.success, true);
  assert.strictEqual(sendOtpData.otpSent, true);
  console.log("✓ OTP sent successfully to +91 9876543210\n");

  // TEST 2: Demo Partner 1-Click Bypass
  console.log("Test 2: Demo Partner 1-Click Founder Bypass (Vendor & Driver)");
  const demoVendorRes = await fetch(`${BASE_URL}/api/auth/partner-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "9415012345",
      otp: "1234",
      role: "vendor",
      isDemo: true,
      action: "verify_otp",
    }),
  });
  const demoVendorData = await demoVendorRes.json();
  assert.strictEqual(demoVendorData.status, "APPROVED");
  assert.strictEqual(demoVendorData.partnerId, "CN-VND-LKO-101");
  assert.strictEqual(demoVendorData.firmOrName, "Latouche Road Hardware Hub");
  console.log("✓ Pre-Approved Demo Vendor bypass granted: CN-VND-LKO-101 (Latouche Road Hardware Hub)");

  const demoDriverRes = await fetch(`${BASE_URL}/api/auth/partner-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "9839012345",
      otp: "1234",
      role: "driver",
      isDemo: true,
      action: "verify_otp",
    }),
  });
  const demoDriverData = await demoDriverRes.json();
  assert.strictEqual(demoDriverData.status, "APPROVED");
  assert.strictEqual(demoDriverData.partnerId, "CN-DRV-LKO-201");
  assert.strictEqual(demoDriverData.firmOrName, "Ravi Kumar (Chhota Hathi)");
  console.log("✓ Pre-Approved Demo Driver bypass granted: CN-DRV-LKO-201 (Ravi Kumar)\n");

  // TEST 3: Unregistered Number Status
  console.log("Test 3: POST /api/auth/partner-login with unregistered phone");
  const testPhone = `9800${Math.floor(100000 + Math.random() * 900000)}`;
  const notFoundRes = await fetch(`${BASE_URL}/api/auth/partner-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: testPhone,
      otp: "1234",
      role: "vendor",
      action: "verify_otp",
    }),
  });
  const notFoundData = await notFoundRes.json();
  assert.strictEqual(notFoundData.status, "NOT_FOUND");
  console.log(`✓ Unregistered phone correctly returned status: NOT_FOUND for ${testPhone}\n`);

  // TEST 4: Submit New Vendor KYC Application
  console.log("Test 4: POST /api/kyc/vendor/submit (New Application)");
  const submitRes = await fetch(`${BASE_URL}/api/kyc/vendor/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firmName: "Gomti Nagar Cement & Saria Mandi",
      ownerName: "Virendra Singh",
      phone: testPhone,
      zone: "Gomti Nagar Extension",
      loadingBayAccess: "LOADER_FRIENDLY",
      categories: ["CEMENT", "STEEL"],
      bankAccount: "987654321098",
      bankIfsc: "SBIN0001234",
      bankUpi: "virendra@upi",
      documents: [
        {
          docType: "GSTIN_CERTIFICATE",
          docName: "GSTIN Registration Certificate",
          docUrl: "/images/kyc/sample-gst.webp",
          extractedNumber: "09AABCU9603R1ZM",
        },
        {
          docType: "PAN_CARD",
          docName: "Proprietor PAN Card",
          docUrl: "/images/kyc/sample-pan.webp",
          extractedNumber: "AABCU9603R",
        },
      ],
    }),
  });
  assert.ok(submitRes.status === 200 || submitRes.status === 201, "Submit KYC status should be 200 or 201");
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.success, true);
  const createdApp = submitData.application;
  assert.ok(createdApp.id, "Application should have an ID");
  assert.strictEqual(createdApp.status, "PENDING_VERIFICATION");
  console.log(`✓ Application created with ID: ${createdApp.id}, status: ${createdApp.status}`);

  // TEST 5: Verify Login routes to State B (PENDING_APPROVAL)
  console.log("\nTest 5: Verify login with pending applicant phone -> State B (Waiting Room)");
  const pendingLoginRes = await fetch(`${BASE_URL}/api/auth/partner-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: testPhone,
      otp: "1234",
      role: "vendor",
      action: "verify_otp",
    }),
  });
  const pendingLoginData = await pendingLoginRes.json();
  assert.strictEqual(pendingLoginData.status, "PENDING_APPROVAL");
  assert.strictEqual(pendingLoginData.application.id, createdApp.id);
  console.log(`✓ Partner login correctly transitioned into State B: PENDING_APPROVAL`);

  // TEST 6: Admin Flag Document for Re-upload
  console.log("\nTest 6: PATCH /api/kyc/admin/documents/:docId/review (Flag Document)");
  const flagRes = await fetch(`${BASE_URL}/api/kyc/admin/documents/${createdApp.documents[0].docId}/review`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_KEY,
    },
    body: JSON.stringify({
      status: "REUPLOAD_REQUIRED",
      reason: "GSTIN certificate scan is blurry. Please upload clear copy.",
    }),
  });
  assert.strictEqual(flagRes.status, 200);
  console.log(`✓ Admin flagged document with reason: "GSTIN certificate scan is blurry"`);

  // Check status via GET /api/kyc/status/:phoneOrId
  const statusCheckRes = await fetch(`${BASE_URL}/api/kyc/status/${testPhone}`);
  const statusCheckData = await statusCheckRes.json();
  assert.strictEqual(statusCheckData.status, "REUPLOAD_REQUESTED");
  console.log(`✓ Status endpoint correctly reports: ${statusCheckData.status}`);

  // TEST 7: Partner Re-uploads Document
  console.log("\nTest 7: PATCH /api/kyc/documents/:docId/reupload (Single Document Re-upload)");
  const reuploadRes = await fetch(`${BASE_URL}/api/kyc/documents/${createdApp.documents[0].docId}/reupload`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      docUrl: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAkA4JaQAA3AA/vuUAAA=",
    }),
  });
  assert.strictEqual(reuploadRes.status, 200);
  console.log("✓ Partner successfully re-uploaded clear document scan");

  // TEST 8: Admin Approves Application & Assigns Partner ID
  console.log("\nTest 8: POST /api/kyc/admin/applications/:appId/decision (Admin APPROVE & GO LIVE)");
  const approveRes = await fetch(`${BASE_URL}/api/kyc/admin/applications/${createdApp.id}/decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_KEY,
    },
    body: JSON.stringify({
      decision: "APPROVE",
      reason: "All verified in Lucknow Mandi Registry",
    }),
  });
  assert.strictEqual(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.strictEqual(approveData.success, true);
  assert.strictEqual(approveData.application.status, "APPROVED");
  assert.ok(approveData.partnerId.startsWith("CN-VND-LKO-"), `Assigned Partner ID should start with CN-VND-LKO-, got ${approveData.partnerId}`);
  console.log(`✓ Admin approved! Assigned Partner ID: ${approveData.partnerId}`);

  // TEST 9: Verify Login routes straight to State C (Live Dashboard)
  console.log("\nTest 9: Verify login with approved partner phone -> State C (Live Dashboard)");
  const approvedLoginRes = await fetch(`${BASE_URL}/api/auth/partner-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: testPhone,
      otp: "1234",
      role: "vendor",
      action: "verify_otp",
    }),
  });
  const approvedLoginData = await approvedLoginRes.json();
  assert.strictEqual(approvedLoginData.status, "APPROVED");
  assert.strictEqual(approvedLoginData.partnerId, approveData.partnerId);
  console.log(`✓ Approved partner immediately granted live dashboard access with Partner ID: ${approvedLoginData.partnerId}`);

  console.log("\n=========================================================");
  console.log("   🎉 ALL 9 E2E TESTS PASSED WITH 100% SUCCESS!          ");
  console.log("=========================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
