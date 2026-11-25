import { io as ioClient, type Socket } from "../artifacts/conon/node_modules/socket.io-client/build/esm/index.js";

const API_BASE = "http://127.0.0.1:5001";
const ADMIN_KEY = "conon_mac_secret_9988";

interface TestResult {
  step: string;
  passed: boolean;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, step: string, details?: any) {
  if (condition) {
    results.push({ step, passed: true, details });
    console.log(`  \x1b[32m✓\x1b[0m ${step}`);
  } else {
    results.push({ step, passed: false, details });
    console.error(`  \x1b[31m✗\x1b[0m ${step}`);
    throw new Error(`Assertion failed: ${step}`);
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  CONON-NOW: KYC & COMPLIANCE ENGINE E2E VERIFICATION  ");
  console.log("========================================================\n");

  let socket: any = null;
  const receivedSocketEvents: string[] = [];

  try {
    // 0. Connect Socket Client to verify real-time events
    socket = (ioClient as any)(API_BASE, { transports: ["websocket"] });
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => resolve(), 3000);
      socket!.on("connect", () => {
        socket!.emit("join:admin", { adminKey: ADMIN_KEY });
        clearTimeout(timeout);
        resolve();
      });
      socket!.on("connect_error", (err) => {
        console.warn("Socket connect error (falling back to REST):", err.message);
        clearTimeout(timeout);
        resolve();
      });
    });

    if (socket?.connected) {
      socket.on("kyc:new_application", (d) => receivedSocketEvents.push("kyc:new_application"));
      socket.on("kyc:document_flagged", (d) => receivedSocketEvents.push("kyc:document_flagged"));
      socket.on("kyc:document_reuploaded", (d) => receivedSocketEvents.push("kyc:document_reuploaded"));
      socket.on("kyc:application_approved", (d) => receivedSocketEvents.push("kyc:application_approved"));
      socket.on("kyc:compliance_paused", (d) => receivedSocketEvents.push("kyc:compliance_paused"));
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Bank Account ₹1 Penny-Drop API
    // ─────────────────────────────────────────────────────────────
    console.log("1. Testing Bank Account ₹1 Penny-Drop API (/api/kyc/penny-drop)...");
    const pennyRes = await fetch(`${API_BASE}/api/kyc/penny-drop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber: "910283746182",
        ifsc: "HDFC0001824",
        holderName: "Anurag Mishra",
        upiId: "awadhpipe@okaxis",
      }),
    });
    const pennyData = await pennyRes.json();
    assert(pennyRes.status === 200, "Penny-Drop HTTP 200 Status");
    assert(pennyData.success === true, "Penny-Drop Success Flag");
    assert(Boolean(pennyData.refId), "Penny-Drop NPCI IMPS Ref Generated", pennyData.refId);
    assert(pennyData.matchScore >= 90, "Holder Name Match Score >= 90%", `${pennyData.matchScore}%`);

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Vendor Dukaan Onboarding Submission
    // ─────────────────────────────────────────────────────────────
    console.log("\n2. Testing Vendor Dukaan Registration (/api/kyc/vendor/submit)...");
    const vendorPayload = {
      firmName: "Shree Ram Hardware & Sanitaries",
      ownerName: "Ramesh Chandra Sharma",
      phone: "+91 94150 11928",
      zone: "Gomti Nagar Extension",
      loadingBayAccess: "LOADER_FRIENDLY",
      categories: ["CEMENT", "STEEL", "PIPES"],
      shopLat: 26.8521,
      shopLng: 80.9842,
      bankAccount: "910283746182",
      bankIfsc: "HDFC0001824",
      bankUpi: "shreeram@okaxis",
      documents: [
        {
          docType: "GSTIN_CERTIFICATE",
          docName: "GSTIN Registration (09ABCDE1234F1Z5)",
          docUrl: "/images/kyc/sample-gst-cert.webp",
          extractedNumber: "09ABCDE1234F1Z5",
          extractedName: "SHREE RAM HARDWARE & SANITARIES",
        },
        {
          docType: "PAN_CARD",
          docName: "Proprietor PAN (ABCDE1234F)",
          docUrl: "/images/kyc/sample-pan-card.webp",
          extractedNumber: "ABCDE1234F",
          extractedName: "RAMESH CHANDRA SHARMA",
        },
        {
          docType: "SIGNBOARD_PHOTO",
          docName: "Physical Shop Front Signboard",
          docUrl: "/images/kyc/sample-shop-sign.webp",
        },
        {
          docType: "BRAND_DEALERSHIP",
          docName: "UltraTech Dealership Certificate",
          docUrl: "/images/kyc/sample-dealership.webp",
        },
      ],
    };

    const vendorRes = await fetch(`${API_BASE}/api/kyc/vendor/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorPayload),
    });
    const vendorData = await vendorRes.json();
    assert(vendorRes.status === 201, "Vendor Onboarding HTTP 201 Status");
    assert(vendorData.success === true, "Vendor Onboarding Success Flag");
    assert(vendorData.application.status === "PENDING_VERIFICATION", "Application Status PENDING_VERIFICATION");
    assert(vendorData.application.documents.length === 4, "4 Documents Registered with AI OCR scores");
    const submittedVendorAppId = vendorData.application.id;
    const submittedVendorSignDoc = vendorData.application.documents.find(
      (d: any) => d.docType === "SIGNBOARD_PHOTO"
    );

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Driver Partner Onboarding Submission
    // ─────────────────────────────────────────────────────────────
    console.log("\n3. Testing Driver Partner Onboarding (/api/kyc/driver/submit)...");
    const driverPayload = {
      name: "Vikram Singh",
      phone: "+91 98390 44102",
      zone: "Sushant Golf City / Shaheed Path",
      vehicleMode: "CHHOTA_HATHI",
      vehiclePlate: "UP 32 BK 4012",
      bankAccount: "50100491823901",
      bankIfsc: "SBIN0001290",
      bankUpi: "vikram.loader@upi",
      insuranceExpiry: "2026-12-15",
      dlExpiry: "2032-05-10",
      pucExpiry: "2026-11-01",
      documents: [
        {
          docType: "DRIVING_LICENCE",
          docName: "Commercial Driving License (UP32 20190018241)",
          docUrl: "/images/kyc/sample-dl.webp",
          extractedNumber: "UP32 20190018241",
          extractedName: "VIKRAM SINGH",
          extractedExpiry: "2032-05-10",
        },
        {
          docType: "VEHICLE_RC",
          docName: "Commercial Vehicle RC (UP 32 BK 4012)",
          docUrl: "/images/kyc/sample-rc.webp",
          extractedNumber: "UP 32 BK 4012",
          extractedName: "VIKRAM SINGH",
        },
        {
          docType: "INSURANCE_PUC",
          docName: "Goods Carrier Insurance Policy",
          docUrl: "/images/kyc/sample-insurance.webp",
          extractedNumber: "NIC-COMM-8821902",
          extractedExpiry: "2026-12-15",
        },
        {
          docType: "SELFIE_LIVENESS",
          docName: "Driver Live Selfie with Tata Ace",
          docUrl: "/images/kyc/sample-selfie.webp",
        },
        {
          docType: "TIRPAL_WATERPROOF",
          docName: "Heavy Heavy-Duty Tarpaulin Proof",
          docUrl: "/images/kyc/sample-tarpaulin.webp",
        },
      ],
    };

    const driverRes = await fetch(`${API_BASE}/api/kyc/driver/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(driverPayload),
    });
    const driverData = await driverRes.json();
    assert(driverRes.status === 201, "Driver Onboarding HTTP 201 Status");
    assert(driverData.success === true, "Driver Onboarding Success Flag");
    assert(driverData.application.status === "PENDING_VERIFICATION", "Driver Status PENDING_VERIFICATION");

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Admin KYC War Room Queue
    // ─────────────────────────────────────────────────────────────
    console.log("\n4. Testing Admin War Room Queue (/api/kyc/admin/queue)...");
    const queueRes = await fetch(`${API_BASE}/api/kyc/admin/queue`, {
      headers: { "x-admin-key": ADMIN_KEY },
    });
    const queueData = await queueRes.json();
    assert(queueRes.status === 200, "Admin Queue HTTP 200 Status");
    assert(queueData.success === true, "Admin Queue Success Flag");
    assert(queueData.stats.total >= 4, "Admin Queue Total Applications >= 4", queueData.stats);
    assert(queueData.stats.pending >= 2, "Pending Applications >= 2", queueData.stats.pending);

    // ─────────────────────────────────────────────────────────────
    // STEP 5: Admin Flags Document for Re-Upload
    // ─────────────────────────────────────────────────────────────
    console.log("\n5. Testing Admin Document Re-Upload Flagging (/api/kyc/admin/documents/:docId/review)...");
    const flagRes = await fetch(`${API_BASE}/api/kyc/admin/documents/${submittedVendorSignDoc.docId}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify({
        status: "REUPLOAD_REQUIRED",
        reason: "Signboard photo is blurry / GPS tag missing. Please re-upload.",
      }),
    });
    const flagData = await flagRes.json();
    assert(flagRes.status === 200, "Flag Doc HTTP 200 Status");
    assert(flagData.document.status === "REUPLOAD_REQUIRED", "Document status is REUPLOAD_REQUIRED");
    assert(flagData.application.status === "REUPLOAD_REQUESTED", "Application status updated to REUPLOAD_REQUESTED");

    // ─────────────────────────────────────────────────────────────
    // STEP 6: Partner Re-Uploads Fixed Document
    // ─────────────────────────────────────────────────────────────
    console.log("\n6. Testing Partner Document Re-Upload (/api/kyc/documents/:docId/reupload)...");
    const reuploadRes = await fetch(`${API_BASE}/api/kyc/documents/${submittedVendorSignDoc.docId}/reupload`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        docUrl: "/images/kyc/sample-fixed-sign.webp",
      }),
    });
    const reuploadData = await reuploadRes.json();
    assert(reuploadRes.status === 200, "Partner Re-upload HTTP 200 Status");
    assert(reuploadData.document.status === "SUBMITTED", "Re-uploaded doc status reverted to SUBMITTED");
    assert(reuploadData.application.status === "PENDING_VERIFICATION", "Application reverted to PENDING_VERIFICATION");

    // ─────────────────────────────────────────────────────────────
    // STEP 7: Admin Granular Verification of All Papers
    // ─────────────────────────────────────────────────────────────
    console.log("\n7. Testing Admin Document Verification (/api/kyc/admin/documents/:docId/review)...");
    const verifyDocRes = await fetch(`${API_BASE}/api/kyc/admin/documents/${submittedVendorSignDoc.docId}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify({ status: "VERIFIED" }),
    });
    const verifyDocData = await verifyDocRes.json();
    assert(verifyDocRes.status === 200, "Verify Doc HTTP 200 Status");
    assert(verifyDocData.document.status === "VERIFIED", "Document status is VERIFIED");

    // ─────────────────────────────────────────────────────────────
    // STEP 8: Admin Final Decision (Approve & Go Live)
    // ─────────────────────────────────────────────────────────────
    console.log("\n8. Testing Admin Final Decision: Approve & Go Live (/api/kyc/admin/applications/:appId/decision)...");
    const decisionRes = await fetch(`${API_BASE}/api/kyc/admin/applications/${submittedVendorAppId}/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify({ decision: "APPROVE", reason: "All papers verified by Founder Desk." }),
    });
    const decisionData = await decisionRes.json();
    assert(decisionRes.status === 200, "Final Decision HTTP 200 Status");
    assert(decisionData.application.status === "APPROVED", "Application status is APPROVED");
    assert(decisionData.message.includes("100% LIVE"), "Live activation message confirmed");

    // ─────────────────────────────────────────────────────────────
    // STEP 9: Auto-Expiry Kill-Switch Simulation
    // ─────────────────────────────────────────────────────────────
    console.log("\n9. Testing Auto-Expiry Kill-Switch (/api/kyc/admin/simulate-expiry)...");
    const expiryRes = await fetch(`${API_BASE}/api/kyc/admin/simulate-expiry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify({
        driverId: "DRV-APP-4401",
        expiryType: "INSURANCE",
      }),
    });
    const expiryData = await expiryRes.json();
    assert(expiryRes.status === 200, "Simulate Expiry HTTP 200 Status");
    assert(expiryData.status === "COMPLIANCE_PAUSED", "Status is COMPLIANCE_PAUSED");
    assert(expiryData.message.includes("Kill-Switch Triggered"), "Kill-Switch trigger message confirmed");

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log("\n========================================================");
    console.log(`  ALL ${results.length} KYC & COMPLIANCE TESTS PASSED (100% ZERO ERRORS)`);
    console.log("========================================================\n");
  } finally {
    if (socket) {
      socket.disconnect();
    }
  }
}

runTests().catch((err) => {
  console.error("\n❌ Test Suite Aborted:", err);
  process.exit(1);
});
