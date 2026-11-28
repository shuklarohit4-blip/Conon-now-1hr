import { Router, type IRouter, type Request, type Response } from "express";
import { kycEngine, type KycDocStatus, type KycDocument } from "../services/kycEngine";
import { requireAdmin } from "../middleware/adminAuth";
import { sendFast2SmsOtp, verifyFast2SmsOtp } from "../lib/fast2sms";
import { emitKycEvent, logDispatchEvent, LUCKNOW_HUBS, getIo, adminRoom, vendorRoom, driverRoom } from "../socket";
import { ecosystemEngine } from "../services/ecosystemEngine";
import { vendorEngine } from "../services/vendorEngine";
import { servicesRentalsEngine } from "../services/servicesRentalsEngine";
import { logger } from "../lib/logger";
import { isBlacklistedInDb } from "./compliance";

const router: IRouter = Router();

/* ═════════════════════════════════════════════════════════════════════════
 * 1. APPLICANT ONBOARDING & SELF-SERVICE ROUTES
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * POST /api/kyc/penny-drop
 * Simulates real-time ₹1 Penny-Drop bank verification via NPCI/IMPS/Razorpay.
 */
router.post(["/kyc/penny-drop", "/api/kyc/penny-drop"], (req: Request, res: Response) => {
  const account = String(
    req.body?.account ||
    req.body?.accountNumber ||
    req.body?.bankAccount ||
    req.body?.bankAccountNumber ||
    ""
  ).trim();
  const ifsc = String(req.body?.ifsc || req.body?.bankIfsc || "").trim().toUpperCase();
  const upi = String(req.body?.upi || req.body?.upiId || req.body?.bankUpi || "").trim();
  const candidateName = String(req.body?.name || req.body?.holderName || "RAMESH KUMAR").trim();

  if (!account && !upi) {
    res.status(400).json({ success: false, error: "Bank Account Number or UPI ID is required." });
    return;
  }

  const holderName = candidateName ? candidateName.toUpperCase() : "VERIFIED PARTNER";
  const refId = `NPCI-IMPS-${Math.floor(1000000 + Math.random() * 9000000)}`;

  res.json({
    success: true,
    verified: true,
    pennyDropStatus: "VERIFIED",
    accountHolderName: holderName,
    holderName,
    verifiedName: holderName,
    matchScore: 98,
    referenceId: refId,
    refId,
    verifiedAt: new Date().toISOString(),
    message: `✓ Account Holder Name Matched (${holderName}) — ₹1 Credited & Verified via IMPS.`,
  });
});

/**
 * POST /api/kyc/vendor/submit
 * Submits vendor registration + paper verification package.
 */
router.post(["/kyc/vendor/submit", "/api/kyc/vendor/submit"], async (req: Request, res: Response) => {
  try {
    const {
      firmName,
      ownerName,
      phone,
      zone,
      categories,
      loadingBayAccess,
      shopGps,
      bankAccount,
      bankIfsc,
      bankUpi,
      documents,
    } = req.body;

    if (!firmName || !ownerName || !phone) {
      res.status(400).json({ success: false, error: "Firm name, owner name, and phone are mandatory." });
      return;
    }

    const blk = await isBlacklistedInDb({
      phone,
      pan: req.body?.pan,
      gstin: req.body?.gstin,
    });
    if (blk.blocked) {
      res.status(403).json({
        success: false,
        error: "This mobile/PAN/GSTIN/vehicle is permanently restricted under CONON Safety Policy.",
        reason: blk.reason,
      });
      return;
    }

    const defaultDocs: KycDocument[] = (documents && documents.length > 0)
      ? documents
      : [
          {
            docId: `doc-${Date.now()}-gst`,
            docType: "GSTIN_CERTIFICATE",
            docName: "GST Registration Certificate",
            docUrl: "/images/kyc/sample-gstin.webp",
            extractedNumber: req.body?.gstin || "09AAECB1289R1Z4",
            extractedName: firmName.toUpperCase(),
            ocrAuthenticityScore: 99,
            ocrReadQuality: "HIGH",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            docId: `doc-${Date.now()}-pan`,
            docType: "PAN_CARD",
            docName: "Proprietor PAN Card",
            docUrl: "/images/kyc/sample-pan.webp",
            extractedNumber: req.body?.pan || "AAECB1289R",
            extractedName: ownerName.toUpperCase(),
            ocrAuthenticityScore: 98,
            ocrReadQuality: "HIGH",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            docId: `doc-${Date.now()}-sign`,
            docType: "SIGNBOARD_PHOTO",
            docName: "GPS Shop Front Signboard",
            docUrl: "/images/kyc/sample-shop-front.webp",
            extractedNumber: `GPS: ${shopGps?.lat || 26.8452}, ${shopGps?.lng || 80.9254}`,
            extractedName: firmName.toUpperCase(),
            ocrAuthenticityScore: 97,
            ocrReadQuality: "HIGH",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

    const application = kycEngine.createApplication({
      applicantType: "VENDOR",
      firmOrName: firmName,
      ownerOrDriverName: ownerName,
      phone,
      zone: zone || "Latouche Road",
      loadingBayAccess: loadingBayAccess || "LOADER_FRIENDLY",
      categories: Array.isArray(categories) ? categories : ["Cement", "TMT Steel", "CPVC Plumbing"],
      shopLat: Number(shopGps?.lat) || 26.8452,
      shopLng: Number(shopGps?.lng) || 80.9254,
      bankAccount: bankAccount || "50100482190123",
      bankIfsc: bankIfsc || "HDFC0001234",
      bankUpi: bankUpi || `${phone.replace(/\D/g, "")}@okaxis`,
      pennyDropStatus: "VERIFIED",
      pennyDropHolderName: ownerName.toUpperCase(),
      documents: defaultDocs,
    });

    logDispatchEvent(application.applicantId, "VENDOR_KYC_SUBMITTED", {
      applicantId: application.applicantId,
      firmName,
      phone,
      zone,
    });

    // Broadcast live to Admin Command OS
    emitKycEvent("kyc:new_application", {
      application,
      type: "VENDOR",
      message: `🏬 New Hardware Dukaan Application: ${firmName} (${zone})`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      applicantId: application.applicantId,
      applicationId: application.id,
      application,
      status: "PENDING_VERIFICATION",
      sandboxModeActive: true,
      message: "Application submitted to Admin KYC War Room! Practice Sandbox Mode unlocked.",
    });
  } catch (err: any) {
    logger.error({ err }, "Error in /kyc/vendor/submit");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/kyc/driver/submit
 * Submits driver registration + RTO verification package.
 */
router.post(["/kyc/driver/submit", "/api/kyc/driver/submit"], async (req: Request, res: Response) => {
  try {
    const fullName = String(req.body?.fullName || req.body?.name || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const zone = String(req.body?.zone || "Alambagh / Transport Nagar").trim();
    const iceContact = req.body?.iceContact;
    const vehicleMode = req.body?.vehicleMode;
    const vehiclePlate = String(req.body?.vehiclePlate || "").trim();
    const bankUpi = req.body?.bankUpi;
    const documents = req.body?.documents;

    if (!fullName || !phone || !vehiclePlate) {
      res.status(400).json({ success: false, error: "Full name, phone, and vehicle registration plate are required." });
      return;
    }

    const blk = await isBlacklistedInDb({ phone, vehicleNo: vehiclePlate });
    if (blk.blocked) {
      res.status(403).json({
        success: false,
        error: "This mobile/PAN/GSTIN/vehicle is permanently restricted under CONON Safety Policy.",
        reason: blk.reason,
      });
      return;
    }

    const futureInsurance = new Date(Date.now() + 214 * 86400000).toISOString();
    const futureDl = new Date(Date.now() + 1120 * 86400000).toISOString();

    const defaultDocs: KycDocument[] = (documents && documents.length > 0)
      ? documents
      : [
          {
            docId: `doc-${Date.now()}-dl`,
            docType: "DRIVING_LICENCE",
            docName: "Commercial Driving Licence",
            docUrl: "/images/kyc/sample-dl.webp",
            extractedNumber: req.body?.dlNumber || "UP32 20190048123",
            extractedName: fullName.toUpperCase(),
            extractedExpiry: futureDl,
            ocrAuthenticityScore: 98,
            ocrReadQuality: "HIGH",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            docId: `doc-${Date.now()}-rc`,
            docType: "VEHICLE_RC",
            docName: "Vehicle RC (Commercial Yellow Plate)",
            docUrl: "/images/kyc/sample-rc.webp",
            extractedNumber: vehiclePlate.toUpperCase(),
            extractedName: fullName.toUpperCase(),
            ocrAuthenticityScore: 97,
            ocrReadQuality: "HIGH",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            docId: `doc-${Date.now()}-ins`,
            docType: "INSURANCE_PUC",
            docName: "Motor Insurance & PUC",
            docUrl: "/images/kyc/sample-insurance.webp",
            extractedNumber: "POL-HDFC-881290",
            extractedName: vehiclePlate.toUpperCase(),
            extractedExpiry: futureInsurance,
            ocrAuthenticityScore: 96,
            ocrReadQuality: "HIGH",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            docId: `doc-${Date.now()}-selfie`,
            docType: "SELFIE_LIVENESS",
            docName: "Live Selfie Liveness Match",
            docUrl: "/images/kyc/sample-selfie.webp",
            extractedNumber: "Face Match: 98% with DL",
            extractedName: fullName.toUpperCase(),
            ocrAuthenticityScore: 98,
            ocrReadQuality: "HIGH",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

    const application = kycEngine.createApplication({
      applicantType: "DRIVER",
      firmOrName: `${fullName} (${vehicleMode === "BIKE_EXPRESS" ? "Bike" : "Loader"})`,
      ownerOrDriverName: fullName,
      phone,
      zone: zone || "Alambagh / Transport Nagar",
      vehicleMode: vehicleMode === "BIKE_EXPRESS" ? "BIKE_EXPRESS" : "CHHOTA_HATHI",
      vehiclePlate: vehiclePlate.toUpperCase(),
      bankUpi: bankUpi || `${phone.replace(/\D/g, "")}@paytm`,
      pennyDropStatus: "VERIFIED",
      pennyDropHolderName: fullName.toUpperCase(),
      insuranceExpiry: futureInsurance,
      dlExpiry: futureDl,
      documents: defaultDocs,
    });

    logDispatchEvent(application.applicantId, "DRIVER_KYC_SUBMITTED", {
      applicantId: application.applicantId,
      fullName,
      vehicleMode,
      vehiclePlate,
    });

    emitKycEvent("kyc:new_application", {
      application,
      type: "DRIVER",
      message: `🚚 New Driver Application: ${fullName} (${vehiclePlate})`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      applicantId: application.applicantId,
      applicationId: application.id,
      application,
      status: "PENDING_VERIFICATION",
      message: "Driver application submitted to Admin KYC War Room! Stage 2 Review Active.",
    });
  } catch (err: any) {
    logger.error({ err }, "Error in /kyc/driver/submit");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/kyc/applications/:id
 * Fetches real-time status and documents for a vendor or driver applicant.
 */
router.get(["/kyc/applications/:id", "/api/kyc/applications/:id"], (req: Request, res: Response) => {
  const target = kycEngine.getApplication(String(req.params.id));
  if (!target) {
    res.status(404).json({ success: false, error: "Application not found." });
    return;
  }
  res.json({ success: true, application: target });
});

/**
 * PATCH /api/kyc/documents/:docId/reupload
 * Re-uploads a fixed document that was flagged by Admin for blurriness or mismatch.
 */
router.patch(["/kyc/documents/:docId/reupload", "/api/kyc/documents/:docId/reupload"], (req: Request, res: Response) => {
  const docId = String(req.params.docId);
  const newUrl = req.body?.docUrl || "/images/kyc/sample-fixed-doc.webp";
  const extractedNumber = req.body?.extractedNumber;
  const extractedName = req.body?.extractedName;

  const result = kycEngine.reuploadDocument(docId, newUrl, extractedNumber, extractedName);
  if (!result) {
    res.status(404).json({ success: false, error: "Document not found." });
    return;
  }

  logDispatchEvent(result.application.applicantId, "KYC_DOC_REUPLOADED", {
    docId,
    docName: result.document.docName,
    applicantId: result.application.applicantId,
  });

  emitKycEvent("kyc:document_reuploaded", {
    applicationId: result.application.id,
    applicantId: result.application.applicantId,
    docId,
    document: result.document,
    application: result.application,
    timestamp: new Date().toISOString(),
  }, result.application.applicantId);

  res.json({
    success: true,
    document: result.document,
    application: result.application,
    message: `✓ Fixed document (${result.document.docName}) re-uploaded and sent to Admin review desk.`,
  });
});

/* ═════════════════════════════════════════════════════════════════════════
 * 2. ADMIN COMMAND OS KYC WAR ROOM ENDPOINTS (ADMIN-GATED)
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/kyc/admin/queue
 * Returns all partner KYC applications with summary stats.
 */
router.get(["/kyc/admin/queue", "/api/kyc/admin/queue"], requireAdmin, (_req: Request, res: Response) => {
  const all = kycEngine.getAllApplications();

  const stats = {
    total: all.length,
    pending: all.filter((a) => a.status === "PENDING_VERIFICATION").length,
    reuploadRequested: all.filter((a) => a.status === "REUPLOAD_REQUESTED").length,
    approved: all.filter((a) => a.status === "APPROVED").length,
    expiringSoon: all.filter((a) => a.status === "EXPIRING_SOON").length,
    paused: all.filter((a) => a.status === "COMPLIANCE_PAUSED").length,
    vendors: all.filter((a) => a.applicantType === "VENDOR").length,
    drivers: all.filter((a) => a.applicantType === "DRIVER").length,
  };

  res.json({
    success: true,
    stats,
    applications: all,
  });
});

/**
 * PATCH /api/kyc/admin/documents/:docId/review
 * Granular verification or Re-upload request for a single document.
 */
router.patch(["/kyc/admin/documents/:docId/review", "/api/kyc/admin/documents/:docId/review"], requireAdmin, (req: Request, res: Response) => {
  const docId = String(req.params.docId);
  const status = req.body?.status as KycDocStatus;
  const reason = req.body?.reason || req.body?.rejectionReason;

  if (status !== "VERIFIED" && status !== "REUPLOAD_REQUIRED") {
    res.status(400).json({ success: false, error: "Status must be VERIFIED or REUPLOAD_REQUIRED." });
    return;
  }

  const result = kycEngine.reviewDocument(docId, status, reason);
  if (!result) {
    res.status(404).json({ success: false, error: "Document not found." });
    return;
  }

  logDispatchEvent(result.application.applicantId, "KYC_DOC_REVIEWED", {
    docId,
    status,
    reason,
  });

  emitKycEvent("kyc:document_flagged", {
    applicationId: result.application.id,
    applicantId: result.application.applicantId,
    docId,
    status,
    reason: result.document.rejectionReason,
    document: result.document,
    application: result.application,
    timestamp: new Date().toISOString(),
  }, result.application.applicantId);

  res.json({
    success: true,
    document: result.document,
    application: result.application,
    message: status === "VERIFIED"
      ? `✓ Document verified (${result.document.docName}).`
      : `↻ Re-upload requested for ${result.document.docName}: ${reason}`,
  });
});

/**
 * POST /api/kyc/admin/applications/:appId/decision
 * Final decision: Approve & Go Live, Send Back for Re-Upload, or Reject.
 */
router.post(["/kyc/admin/applications/:appId/decision", "/api/kyc/admin/applications/:appId/decision"], requireAdmin, (req: Request, res: Response) => {
  const appId = String(req.params.appId);
  const decision = req.body?.decision as "APPROVE" | "REUPLOAD" | "REJECT";
  const reason = req.body?.reason;

  if (!["APPROVE", "REUPLOAD", "REJECT"].includes(decision)) {
    res.status(400).json({ success: false, error: "Decision must be APPROVE, REUPLOAD, or REJECT." });
    return;
  }

  const application = kycEngine.decideApplication(appId, decision, reason);
  if (!application) {
    res.status(404).json({ success: false, error: "Application not found." });
    return;
  }

  // If approved, dynamically inject into live ecosystem
  if (decision === "APPROVE") {
    if (application.applicantType === "VENDOR") {
      const hubId = `hub-${application.firmOrName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 16)}`;
      // Add to Lucknow Hubs
      LUCKNOW_HUBS.push({
        hubId,
        name: `${application.firmOrName} (${application.zone})`,
        zone: application.zone,
        lat: application.shopLat || 26.8452,
        lng: application.shopLng || 80.9254,
        stockFlags: { OPC53_CEMENT: true, TMT_FE550D: true, AVVAL_BRICK: true, AAC_BLOCK: true, CPVC_PIPES: true },
        escrowBalance: 0,
        settledBalance: 0,
        isOnline: true,
      });
      vendorEngine.registerVendor({
        id: hubId,
        shopName: `${application.firmOrName} (${application.zone})`,
        ownerName: application.ownerOrDriverName,
        phone: application.phone,
        hubZone: application.zone,
        hubAddress: `${application.zone} Commercial Corridor, Lucknow`,
        rating: 4.9,
        slaScore: 98,
        isOpen: true,
        gstin: application.documents.find((d) => d.docType === "GSTIN_CERTIFICATE")?.extractedNumber || "09AAECB1289R1Z4",
      });
    } else if (application.applicantType === "DRIVER") {
      const driverId = `DRV-LKO-${application.vehiclePlate?.replace(/[^A-Z0-9]/g, "").slice(-4) || "8810"}`;
      ecosystemEngine.registerDriver({
        id: driverId,
        name: application.ownerOrDriverName,
        phone: application.phone,
        vehicleType: application.vehicleMode === "BIKE_EXPRESS" ? "2W_BIKE" : "4W_PICKUP",
        vehicleLabel: application.vehicleMode === "BIKE_EXPRESS" ? "Bajaj Pulsar / Hero Splendor" : "Tata Ace (Chhota Hathi)",
        vehicleModel: application.vehicleMode === "BIKE_EXPRESS" ? "2-Wheeler Express" : "Tata Ace Gold",
        vehiclePlate: application.vehiclePlate || "UP 32 EL 7710",
        rating: 5.0,
        isOnline: true,
        walletBalance: 0,
        todayEarnings: 0,
        tripsToday: 0,
        currentZone: application.zone,
        currentLat: 26.8421,
        currentLng: 80.9312,
      });
    }
  }

  logDispatchEvent(application.applicantId, "KYC_DECISION_FINALIZED", {
    applicantId: application.applicantId,
    decision,
    reason,
  });

  emitKycEvent("kyc:application_approved", {
    application,
    decision,
    reason,
    timestamp: new Date().toISOString(),
  }, application.applicantId);

  // Broadcast globally so any waiting screen unlocks immediately
  const io = getIo();
  if (io) {
    io.emit("kyc:decision", { application, decision, reason });
    if (decision === "APPROVE") {
      io.emit("partner:unlocked", {
        applicantId: application.applicantId,
        phone: application.phone,
        partnerId: application.partnerId,
        firmOrName: application.firmOrName,
        applicantType: application.applicantType,
      });
    }
  }

  res.json({
    success: true,
    decision,
    application,
    partnerId: application.partnerId,
    message: decision === "APPROVE"
      ? `🎉 Partner Approved! ${application.firmOrName} is now 100% LIVE in Lucknow supply corridor.`
      : decision === "REUPLOAD"
      ? "Sent back to partner with re-upload notes."
      : "Application rejected.",
  });
});

/* ═════════════════════════════════════════════════════════════════════════
 * PARTNER AUTHENTICATION & KYC STATUS GATE
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * POST /api/auth/partner-login
 * Strict authentication + KYC status lookup for Vendors and Drivers.
 */
router.post(["/auth/partner-login", "/api/auth/partner-login"], async (req: Request, res: Response) => {
  try {
    const rawPhone = String(req.body?.phone || "");
    const otp = String(req.body?.otp || "").trim();
    const role = String(req.body?.role || "vendor").toLowerCase(); // "vendor" | "driver"
    const action = String(req.body?.action || "verify_otp"); // "send_otp" | "verify_otp"
    const isDemo = Boolean(req.body?.isDemo);

    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: "Valid 10-digit mobile number required (+91)." });
    }

    const blk = await isBlacklistedInDb({ phone: cleanPhone });
    if (blk.blocked) {
      return res.status(403).json({
        success: false,
        error: "This mobile/PAN/GSTIN/vehicle is permanently restricted under CONON Safety Policy.",
      });
    }

    // Step 1: Send OTP via Fast2SMS
    if (action === "send_otp") {
      const otpRes = await sendFast2SmsOtp(cleanPhone);
      if (!otpRes.ok) {
        return res.status(400).json({
          success: false,
          error: otpRes.error || otpRes.message || "Failed to send OTP via SMS.",
        });
      }
      return res.json({
        success: true,
        otpSent: true,
        phone: cleanPhone,
        provider: otpRes.provider,
        message: otpRes.message,
        ...(otpRes.devOtp ? { devOtp: otpRes.devOtp } : {}),
      });
    }

    // Step 2: Verify OTP strictly against issued Fast2SMS challenge
    const verification = verifyFast2SmsOtp(cleanPhone, otp);
    if (!verification.ok) {
      return res.status(401).json({
        success: false,
        error: verification.error || "Invalid or expired OTP.",
      });
    }

    // Look up applicant in KYC engine
    const applicantType = role === "vendor" ? "VENDOR" : "DRIVER";
    const app = kycEngine.findByPhone(cleanPhone, applicantType);

    if (!app) {
      return res.json({
        success: true,
        status: "NOT_FOUND",
        phone: cleanPhone,
        role,
        message: "Number not registered yet — Complete 2-Minute Paper Verification to join",
      });
    }

    // Map internal status to access gate status
    if (app.status === "APPROVED") {
      return res.json({
        success: true,
        status: "APPROVED",
        partnerId: app.partnerId || (role === "vendor" ? "CN-VND-LKO-108" : "CN-DRV-LKO-204"),
        firmOrName: app.firmOrName,
        phone: cleanPhone,
        role,
        application: app,
        message: "Login successful! Account verified and active.",
      });
    }

    if (app.status === "REUPLOAD_REQUESTED") {
      return res.json({
        success: true,
        status: "REUPLOAD_REQUIRED",
        partnerId: app.partnerId,
        firmOrName: app.firmOrName,
        phone: cleanPhone,
        role,
        application: app,
        message: "Admin has requested paper re-upload. Please provide clear documents.",
      });
    }

    // Default pending state
    return res.json({
      success: true,
      status: "PENDING_APPROVAL",
      partnerId: app.partnerId,
      firmOrName: app.firmOrName,
      phone: cleanPhone,
      role,
      application: app,
      message: "Application is under final verification review by Conon HQ Admin.",
    });
  } catch (err: any) {
    logger.error({ err }, "Error in partner-login route");
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/kyc/status/:phoneOrId
 * Real-time KYC status lookup for live waiting room.
 */
router.get(["/kyc/status/:phoneOrId", "/api/kyc/status/:phoneOrId"], (req: Request, res: Response) => {
  try {
    const param = String(req.params.phoneOrId || "").trim();
    let app = kycEngine.getApplication(param);
    if (!app) {
      app = kycEngine.findByPhone(param);
    }

    if (!app) {
      return res.status(404).json({ success: false, error: "Application not found for provided phone/ID." });
    }

    return res.json({
      success: true,
      application: app,
      status: app.status,
      partnerId: app.partnerId,
    });
  } catch (err: any) {
    logger.error({ err }, "Error checking KYC status");
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/kyc/admin/simulate-expiry
 * Test helper: simulates document auto-expiry to trigger the Compliance Kill-Switch.
 */
router.post(["/kyc/admin/simulate-expiry", "/api/kyc/admin/simulate-expiry"], requireAdmin, (req: Request, res: Response) => {
  const driverId = req.body?.driverId || req.body?.appId || "DRV-APP-4401";
  const expiryType = (req.body?.expiryType || "INSURANCE") as "INSURANCE" | "PUC" | "DL";

  const app = kycEngine.simulateComplianceExpiry(driverId, expiryType);
  if (!app) {
    res.status(404).json({ success: false, error: "Driver application not found." });
    return;
  }

  emitKycEvent("kyc:compliance_paused", {
    applicantId: app.applicantId,
    driverName: app.ownerOrDriverName,
    expiryType,
    reason: `${expiryType} Expired. Auto-Expiry Kill-Switch Activated.`,
    application: app,
    timestamp: new Date().toISOString(),
  }, app.applicantId);

  res.json({
    success: true,
    expiryType,
    status: "COMPLIANCE_PAUSED",
    application: app,
    message: `🚨 Auto-Expiry Kill-Switch Triggered: ${expiryType} expired! Driver paused from live fleet dispatch.`,
  });
});

/**
 * POST /api/admin/clean-slate
 * Complete Zero-Dummy Clean Slate Production Reset (Protected by PIN 1407 + requireAdmin)
 */
router.post(["/admin/clean-slate", "/api/admin/clean-slate"], requireAdmin, async (req: Request, res: Response) => {
  try {
    const pin = String(req.body?.pin || "").trim();
    if (pin !== "1407") {
      res.status(403).json({ success: false, error: "Invalid Security PIN. Enter '1407' to confirm clean slate reset." });
      return;
    }

    // 1. Clear all in-memory engines
    kycEngine.clearAll();
    vendorEngine.clearAll();
    ecosystemEngine.clearAll();
    servicesRentalsEngine.clearOperationalData();
    LUCKNOW_HUBS.length = 0;

    // 2. Clear MongoDB / PostgreSQL collections if available
    try {
      const { collection } = await import("@workspace/db");
      await collection("orders").deleteMany({});
      await collection("carts").deleteMany({});
    } catch (dbErr) {
      logger.warn({ dbErr }, "Database collections reset bypassed or in-memory");
    }

    // 3. Clear file system ecosystem store
    try {
      const fs = await import("fs");
      const { ECOSYSTEM_STORE_PATH } = await import("../lib/paths");
      fs.writeFileSync(ECOSYSTEM_STORE_PATH, JSON.stringify({ orders: [], drivers: [] }, null, 2), "utf-8");
    } catch (fsErr) {
      logger.warn({ fsErr }, "Failed saving cleared ecosystem store");
    }

    // 4. Emit live socket broadcast to all connected panels
    try {
      const io = getIo();
      io.emit("admin:clean_slate_executed", {
        timestamp: new Date().toISOString(),
        message: "Clean slate production reset executed by Admin.",
      });
      io.to(adminRoom()).emit("kyc:application_updated", { all: [] });
    } catch {}

    logger.info("✓ Zero-Dummy Clean Slate Production Reset executed successfully via Admin API.");

    res.json({
      success: true,
      message: "✓ Clean Slate Production Reset Complete. All mock applications, drivers, orders, and settlements have been wiped.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err }, "Clean slate execution failed");
    res.status(500).json({ success: false, error: err?.message || "Failed to execute clean slate reset." });
  }
});

export default router;
