import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";

export type ApplicantType = "VENDOR" | "DRIVER";
export type KycOverallStatus =
  | "PENDING_VERIFICATION"
  | "REUPLOAD_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRING_SOON"
  | "COMPLIANCE_PAUSED";

export type KycDocStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REUPLOAD_REQUIRED" | "REJECTED";

export interface KycDocument {
  docId: string;
  docType:
    | "GSTIN_CERTIFICATE"
    | "PAN_CARD"
    | "SIGNBOARD_PHOTO"
    | "BRAND_DEALERSHIP"
    | "AADHAAR_FRONT_BACK"
    | "DRIVING_LICENCE"
    | "VEHICLE_RC"
    | "INSURANCE_PUC"
    | "SELFIE_LIVENESS"
    | "TIRPAL_WATERPROOF"
    | "CANCELLED_CHEQUE";
  docName: string;
  docUrl: string;
  extractedNumber?: string;
  extractedName?: string;
  extractedExpiry?: string;
  ocrAuthenticityScore: number;
  ocrReadQuality: "HIGH" | "MEDIUM" | "LOW";
  status: KycDocStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycAuditLog {
  logId: string;
  action: string;
  actor: string;
  note?: string;
  timestamp: string;
}

export interface PartnerKycApplication {
  id: string;
  applicantType: ApplicantType;
  applicantId: string;
  firmOrName: string;
  ownerOrDriverName: string;
  phone: string;
  zone: string;
  vehicleMode?: "BIKE_EXPRESS" | "CHHOTA_HATHI";
  vehiclePlate?: string;
  loadingBayAccess?: "NARROW_LANE" | "LOADER_FRIENDLY";
  categories: string[];
  shopLat?: number;
  shopLng?: number;
  bankAccount: string;
  bankIfsc: string;
  bankUpi: string;
  pennyDropStatus: "PENDING" | "VERIFIED" | "FAILED";
  pennyDropHolderName?: string;
  pennyDropRef?: string;
  aiAuthenticityScore: number;
  status: KycOverallStatus;
  slaSignedAt?: string;
  insuranceExpiry?: string;
  dlExpiry?: string;
  pucExpiry?: string;
  documents: KycDocument[];
  auditLogs: KycAuditLog[];
  createdAt: string;
  updatedAt: string;
}

class KycEngine {
  private applications: Map<string, PartnerKycApplication> = new Map();

  constructor() {
    this.seedDefaultApplications();
  }

  private seedDefaultApplications() {
    const now = new Date().toISOString();

    // 1. Initial Vendor Applicant: Awadh Building Solutions
    const vendorApp: PartnerKycApplication = {
      id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      applicantType: "VENDOR",
      applicantId: "VND-APP-7712",
      firmOrName: "Awadh Building Solutions & Pipe Depot",
      ownerOrDriverName: "Anurag Mishra",
      phone: "+91 94500 11289",
      zone: "Sushant Golf City",
      loadingBayAccess: "LOADER_FRIENDLY",
      categories: ["Cement", "TMT Steel", "CPVC Plumbing", "Paints & Putty"],
      shopLat: 26.7824,
      shopLng: 80.9892,
      bankAccount: "50100482190123",
      bankIfsc: "HDFC0001234",
      bankUpi: "awadhbuild@okaxis",
      pennyDropStatus: "VERIFIED",
      pennyDropHolderName: "ANURAG MISHRA",
      pennyDropRef: "PENNY-HDFC-991204",
      aiAuthenticityScore: 98,
      status: "PENDING_VERIFICATION",
      slaSignedAt: now,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: now,
      documents: [
        {
          docId: "doc-v1-gst",
          docType: "GSTIN_CERTIFICATE",
          docName: "GST Registration Certificate",
          docUrl: "/images/kyc/sample-gstin.webp",
          extractedNumber: "09AAECB1289R1Z4",
          extractedName: "AWADH BUILDING SOLUTIONS",
          ocrAuthenticityScore: 99,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-v1-pan",
          docType: "PAN_CARD",
          docName: "Proprietor PAN Card",
          docUrl: "/images/kyc/sample-pan.webp",
          extractedNumber: "AAECB1289R",
          extractedName: "ANURAG MISHRA",
          ocrAuthenticityScore: 97,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-v1-sign",
          docType: "SIGNBOARD_PHOTO",
          docName: "GPS Shop Front Signboard",
          docUrl: "/images/kyc/sample-shop-front.webp",
          extractedNumber: "GPS: 26.7824, 80.9892",
          extractedName: "AWADH BUILDING SOLUTIONS",
          ocrAuthenticityScore: 96,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-v1-brand",
          docType: "BRAND_DEALERSHIP",
          docName: "UltraTech Authorized Dealership Certificate",
          docUrl: "/images/kyc/sample-ultratech-dealership.webp",
          extractedNumber: "AUTH-UT-LKO-2026-88",
          extractedName: "AWADH BUILDING SOLUTIONS",
          ocrAuthenticityScore: 98,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
      ],
      auditLogs: [
        {
          logId: `log-${Date.now()}-1`,
          action: "APPLICATION_SUBMITTED",
          actor: "ANURAG MISHRA",
          note: "Registered via /vendor/register with 4 documents & verified bank account",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    };
    this.applications.set(vendorApp.applicantId, vendorApp);

    // 2. Initial Driver Applicant: Mohd. Rizwan Khan
    const future214 = new Date(Date.now() + 214 * 86400000).toISOString();
    const future1120 = new Date(Date.now() + 1120 * 86400000).toISOString();

    const driverApp: PartnerKycApplication = {
      id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      applicantType: "DRIVER",
      applicantId: "DRV-APP-4401",
      firmOrName: "Mohd. Rizwan Khan (Tata Ace)",
      ownerOrDriverName: "Mohd. Rizwan Khan",
      phone: "+91 98394 55102",
      zone: "Alambagh / Transport Nagar",
      vehicleMode: "CHHOTA_HATHI",
      vehiclePlate: "UP 32 EL 7710",
      categories: ["Chhota Hathi / 1,500 kg Loader"],
      bankAccount: "919839455102",
      bankIfsc: "PYTM0123456",
      bankUpi: "rizwankhan@paytm",
      pennyDropStatus: "VERIFIED",
      pennyDropHolderName: "MOHD RIZWAN KHAN",
      pennyDropRef: "PENNY-PYTM-881290",
      aiAuthenticityScore: 97,
      status: "PENDING_VERIFICATION",
      insuranceExpiry: future214,
      dlExpiry: future1120,
      slaSignedAt: now,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: now,
      documents: [
        {
          docId: "doc-d1-aadhaar",
          docType: "AADHAAR_FRONT_BACK",
          docName: "Aadhaar Card (Masked)",
          docUrl: "/images/kyc/sample-aadhaar.webp",
          extractedNumber: "XXXX-XXXX-4821",
          extractedName: "MOHD RIZWAN KHAN",
          ocrAuthenticityScore: 99,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-d1-dl",
          docType: "DRIVING_LICENCE",
          docName: "Commercial Driving Licence",
          docUrl: "/images/kyc/sample-dl.webp",
          extractedNumber: "UP32 20180049120",
          extractedName: "MOHD RIZWAN KHAN",
          extractedExpiry: future1120,
          ocrAuthenticityScore: 98,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-d1-rc",
          docType: "VEHICLE_RC",
          docName: "Tata Ace Commercial Yellow Plate RC",
          docUrl: "/images/kyc/sample-rc.webp",
          extractedNumber: "UP 32 EL 7710",
          extractedName: "MOHD RIZWAN KHAN",
          ocrAuthenticityScore: 96,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-d1-ins",
          docType: "INSURANCE_PUC",
          docName: "Commercial Vehicle Comprehensive Policy",
          docUrl: "/images/kyc/sample-insurance.webp",
          extractedNumber: "POL-HDFC-99120412",
          extractedName: "UP 32 EL 7710",
          extractedExpiry: future214,
          ocrAuthenticityScore: 97,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-d1-selfie",
          docType: "SELFIE_LIVENESS",
          docName: "Live Selfie Liveness Scan",
          docUrl: "/images/kyc/sample-selfie.webp",
          extractedNumber: "Face Match 98% with DL",
          extractedName: "MOHD RIZWAN KHAN",
          ocrAuthenticityScore: 98,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
        {
          docId: "doc-d1-tirpal",
          docType: "TIRPAL_WATERPROOF",
          docName: "Heavy Waterproof Tarpaulin on Loader",
          docUrl: "/images/kyc/sample-tirpal.webp",
          extractedNumber: "Heavy Duty PVC Tarpaulin 18x12",
          extractedName: "Verified Ready",
          ocrAuthenticityScore: 99,
          ocrReadQuality: "HIGH",
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        },
      ],
      auditLogs: [
        {
          logId: `log-${Date.now()}-2`,
          action: "APPLICATION_SUBMITTED",
          actor: "MOHD RIZWAN KHAN",
          note: "Registered via /driver/register with 6 RTO documents & Tarpaulin photo",
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ],
    };
    this.applications.set(driverApp.applicantId, driverApp);
  }

  public getAllApplications(): PartnerKycApplication[] {
    return Array.from(this.applications.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getApplication(idOrApplicantId: string): PartnerKycApplication | undefined {
    for (const app of this.applications.values()) {
      if (app.id === idOrApplicantId || app.applicantId === idOrApplicantId) {
        return app;
      }
    }
    return undefined;
  }

  public createApplication(appData: Partial<PartnerKycApplication>): PartnerKycApplication {
    const isVendor = appData.applicantType === "VENDOR";
    const rand = Math.floor(1000 + Math.random() * 9000);
    const applicantId = appData.applicantId || (isVendor ? `VND-APP-${rand}` : `DRV-APP-${rand}`);
    const id = `kyc-${Date.now()}-${rand}`;
    const now = new Date().toISOString();

    const application: PartnerKycApplication = {
      id,
      applicantType: isVendor ? "VENDOR" : "DRIVER",
      applicantId,
      firmOrName: appData.firmOrName || "Partner Firm",
      ownerOrDriverName: appData.ownerOrDriverName || "Owner",
      phone: appData.phone || "+91 98765 43210",
      zone: appData.zone || "Latouche Road",
      vehicleMode: appData.vehicleMode,
      vehiclePlate: appData.vehiclePlate,
      loadingBayAccess: appData.loadingBayAccess,
      categories: appData.categories || [],
      shopLat: appData.shopLat || 26.8452,
      shopLng: appData.shopLng || 80.9254,
      bankAccount: appData.bankAccount || "",
      bankIfsc: appData.bankIfsc || "",
      bankUpi: appData.bankUpi || "",
      pennyDropStatus: appData.pennyDropStatus || "VERIFIED",
      pennyDropHolderName: appData.pennyDropHolderName || appData.ownerOrDriverName,
      pennyDropRef: appData.pennyDropRef || `PENNY-${Date.now()}`,
      aiAuthenticityScore: appData.aiAuthenticityScore || 96,
      status: "PENDING_VERIFICATION",
      slaSignedAt: now,
      insuranceExpiry: appData.insuranceExpiry,
      dlExpiry: appData.dlExpiry,
      pucExpiry: appData.pucExpiry,
      documents: (appData.documents || []).map((d, idx) => ({
        ...d,
        docId: d.docId || `doc-${Date.now()}-${idx}-${d.docType?.toLowerCase() || "file"}`,
        status: (d.status || "SUBMITTED") as KycDocStatus,
        ocrAuthenticityScore: d.ocrAuthenticityScore || 97,
        ocrReadQuality: d.ocrReadQuality || "HIGH",
        createdAt: d.createdAt || now,
        updatedAt: d.updatedAt || now,
      })),
      auditLogs: [
        {
          logId: `log-${Date.now()}`,
          action: "APPLICATION_SUBMITTED",
          actor: appData.ownerOrDriverName || "APPLICANT",
          note: `Fresh onboarding application submitted via ${isVendor ? "/vendor/register" : "/driver/register"}`,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.applications.set(applicantId, application);
    logger.info({ applicantId, type: application.applicantType }, "New KYC Application created");
    return application;
  }

  public reviewDocument(
    docId: string,
    status: KycDocStatus,
    reason?: string,
    reviewer: string = "Admin Command OS"
  ): { application: PartnerKycApplication; document: KycDocument } | null {
    for (const app of this.applications.values()) {
      const doc = app.documents.find((d) => d.docId === docId);
      if (doc) {
        doc.status = status;
        doc.reviewedBy = reviewer;
        doc.reviewedAt = new Date().toISOString();
        doc.updatedAt = new Date().toISOString();
        if (status === "REUPLOAD_REQUIRED") {
          doc.rejectionReason = reason || "Document blurry or details unclear.";
          app.status = "REUPLOAD_REQUESTED";
        } else if (status === "VERIFIED") {
          doc.rejectionReason = undefined;
          // Check if all documents are now verified
          const allVerified = app.documents.every((d) => d.status === "VERIFIED");
          if (allVerified) {
            app.status = "APPROVED";
          }
        }
        app.updatedAt = new Date().toISOString();
        app.auditLogs.unshift({
          logId: `log-${Date.now()}`,
          action: status === "VERIFIED" ? "DOC_VERIFIED" : "DOC_REUPLOAD_REQUESTED",
          actor: reviewer,
          note: `${doc.docName}: ${status === "VERIFIED" ? "Verified Paper" : reason || "Flagged for re-upload"}`,
          timestamp: new Date().toISOString(),
        });
        return { application: app, document: doc };
      }
    }
    return null;
  }

  public reuploadDocument(
    docId: string,
    newUrl: string,
    extractedNumber?: string,
    extractedName?: string
  ): { application: PartnerKycApplication; document: KycDocument } | null {
    for (const app of this.applications.values()) {
      const doc = app.documents.find((d) => d.docId === docId);
      if (doc) {
        doc.docUrl = newUrl;
        doc.status = "SUBMITTED";
        doc.rejectionReason = undefined;
        doc.updatedAt = new Date().toISOString();
        if (extractedNumber) doc.extractedNumber = extractedNumber;
        if (extractedName) doc.extractedName = extractedName;

        // Check if there are any remaining documents requiring re-upload
        const hasReuploadLeft = app.documents.some((d) => d.status === "REUPLOAD_REQUIRED");
        if (!hasReuploadLeft && app.status === "REUPLOAD_REQUESTED") {
          app.status = "PENDING_VERIFICATION";
        }
        app.updatedAt = new Date().toISOString();
        app.auditLogs.unshift({
          logId: `log-${Date.now()}`,
          action: "DOC_REUPLOADED",
          actor: app.ownerOrDriverName,
          note: `${doc.docName}: Fixed paper re-uploaded by partner.`,
          timestamp: new Date().toISOString(),
        });
        return { application: app, document: doc };
      }
    }
    return null;
  }

  public decideApplication(
    idOrApplicantId: string,
    decision: "APPROVE" | "REUPLOAD" | "REJECT",
    reason?: string,
    reviewer: string = "Admin Command OS"
  ): PartnerKycApplication | null {
    const app = this.getApplication(idOrApplicantId);
    if (!app) return null;

    const now = new Date().toISOString();
    if (decision === "APPROVE") {
      app.status = "APPROVED";
      // Mark all pending docs as verified
      app.documents.forEach((d) => {
        if (d.status !== "REJECTED") d.status = "VERIFIED";
      });
      app.auditLogs.unshift({
        logId: `log-${Date.now()}`,
        action: "APPLICATION_APPROVED",
        actor: reviewer,
        note: "Partner compliance verified. Account approved for 60-min live operations.",
        timestamp: now,
      });
    } else if (decision === "REUPLOAD") {
      app.status = "REUPLOAD_REQUESTED";
      app.auditLogs.unshift({
        logId: `log-${Date.now()}`,
        action: "SENT_FOR_REUPLOAD",
        actor: reviewer,
        note: reason || "Flagged documents sent back to partner for re-upload.",
        timestamp: now,
      });
    } else if (decision === "REJECT") {
      app.status = "REJECTED";
      app.auditLogs.unshift({
        logId: `log-${Date.now()}`,
        action: "APPLICATION_REJECTED",
        actor: reviewer,
        note: reason || "Compliance application rejected by Risk & Trust team.",
        timestamp: now,
      });
    }

    app.updatedAt = now;
    return app;
  }

  public simulateComplianceExpiry(
    driverIdOrAppId: string,
    expiryType: "INSURANCE" | "PUC" | "DL" = "INSURANCE"
  ): PartnerKycApplication | null {
    const app = this.getApplication(driverIdOrAppId);
    if (!app) return null;

    const expiredDate = new Date(Date.now() - 86400000 * 2).toISOString();
    if (expiryType === "INSURANCE") app.insuranceExpiry = expiredDate;
    if (expiryType === "PUC") app.pucExpiry = expiredDate;
    if (expiryType === "DL") app.dlExpiry = expiredDate;

    app.status = "COMPLIANCE_PAUSED";
    app.auditLogs.unshift({
      logId: `log-${Date.now()}`,
      action: "AUTO_EXPIRY_KILL_SWITCH",
      actor: "COMPLIANCE_WATCHDOG",
      note: `Automatic Compliance Kill-Switch Triggered: ${expiryType} expired on ${expiredDate.slice(0, 10)}. Dispatch paused.`,
      timestamp: new Date().toISOString(),
    });
    return app;
  }
}

export const kycEngine = new KycEngine();
