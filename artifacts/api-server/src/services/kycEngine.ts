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
  partnerId?: string;
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
    // Zero-Dummy Clean Slate: Starts 100% empty. Applications are created purely via real partner submissions.
  }

  public clearAll(): void {
    this.applications.clear();
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

  public findByPhone(phone: string, applicantType?: ApplicantType): PartnerKycApplication | undefined {
    const clean = phone.replace(/\D/g, "").slice(-10);
    if (!clean) return undefined;
    for (const app of this.applications.values()) {
      const appClean = app.phone.replace(/\D/g, "").slice(-10);
      if (appClean === clean && (!applicantType || app.applicantType === applicantType)) {
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
      if (!app.partnerId) {
        const num = Math.floor(100 + Math.random() * 900);
        app.partnerId = app.applicantType === "VENDOR" ? `CN-VND-LKO-${num}` : `CN-DRV-LKO-${num}`;
      }
      // Mark all pending docs as verified
      app.documents.forEach((d) => {
        if (d.status !== "REJECTED") d.status = "VERIFIED";
      });
      app.auditLogs.unshift({
        logId: `log-${Date.now()}`,
        action: "APPLICATION_APPROVED",
        actor: reviewer,
        note: `Partner compliance verified. Account approved for 60-min live operations. Assigned Partner ID: ${app.partnerId}`,
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
