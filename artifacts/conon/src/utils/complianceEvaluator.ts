export type ComplianceTier = "COMPLIANT" | "EXPIRING_SOON" | "AUTO_PAUSED_EXPIRED";

export interface ComplianceDocCheck {
  key: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
}

export interface ComplianceEvaluation {
  status: ComplianceTier;
  expiredDocs: ComplianceDocCheck[];
  expiringDocs: ComplianceDocCheck[];
  earliestExpiryDays: number | null;
}

export interface PartnerComplianceOverlay {
  partnerId: string;
  status: "APPROVED" | "SUSPENDED" | "BLACKLISTED";
  suspensionReason?: string;
  physicallyInspected?: boolean;
  inspectionMeta?: {
    inspectorName: string;
    inspectedAt: string;
    notes?: string;
    checklist?: Record<string, boolean>;
    photoUrl?: string;
  };
  expiryDates?: Record<string, string>;
  updatedAt: string;
}

export interface BlacklistEntry {
  id: string;
  partnerId?: string;
  phone?: string;
  pan?: string;
  gstin?: string;
  vehicleNo?: string;
  reason: string;
  blacklistedAt: string;
}

export interface ComplianceAuditEntry {
  id: string;
  partnerId: string;
  partnerName?: string;
  partnerType: string;
  action:
    | "AUTO_PAUSED"
    | "SUSPENDED"
    | "BLACKLISTED"
    | "REINSTATED"
    | "RENEWAL_APPROVED"
    | "FIELD_INSPECTED";
  reason: string;
  actor: string;
  createdAt: string;
}

const EXPIRY_FIELD_LABELS: Record<string, string> = {
  dlExpiry: "Driving Licence",
  insuranceExpiry: "Motor / Machine Insurance",
  pucExpiry: "PUC Certificate",
  fitnessExpiry: "RTO / Machine Fitness",
  operatorLicenceExpiry: "Operator Licence",
  calibrationExpiry: "Weighbridge / Batcher Calibration",
  uppcbNocExpiry: "UPPCB Pollution NOC",
  labCertExpiry: "NABL Lab Certificate",
  tradeLicenceExpiry: "Trade / Shop Licence",
};

export function evaluatePartnerCompliance(
  input: {
    dlExpiry?: string;
    insuranceExpiry?: string;
    pucExpiry?: string;
    fitnessExpiry?: string;
    operatorLicenceExpiry?: string;
    calibrationExpiry?: string;
    uppcbNocExpiry?: string;
    labCertExpiry?: string;
    tradeLicenceExpiry?: string;
    expiryDates?: Record<string, string>;
    documents?: Array<{ docType?: string; docName?: string; extractedExpiry?: string }>;
  },
  nowMs: number = Date.now()
): ComplianceEvaluation {
  const checks: ComplianceDocCheck[] = [];
  const seenKeys = new Set<string>();

  const pushCheck = (key: string, label: string, rawDate?: string) => {
    if (!rawDate || seenKeys.has(key)) return;
    const ms = Date.parse(rawDate);
    if (Number.isNaN(ms)) return;
    seenKeys.add(key);
    const daysRemaining = Math.ceil((ms - nowMs) / 86400000);
    checks.push({ key, label, expiryDate: rawDate, daysRemaining });
  };

  for (const [field, label] of Object.entries(EXPIRY_FIELD_LABELS)) {
    pushCheck(field, label, (input as any)[field] || input.expiryDates?.[field]);
  }

  if (Array.isArray(input.documents)) {
    for (const d of input.documents) {
      if (d.extractedExpiry) {
        pushCheck(
          d.docType || d.docName || d.extractedExpiry,
          d.docName || d.docType || "KYC Document",
          d.extractedExpiry
        );
      }
    }
  }

  const expiredDocs = checks.filter((c) => c.daysRemaining < 0);
  const expiringDocs = checks.filter((c) => c.daysRemaining >= 0 && c.daysRemaining <= 30);
  const earliestExpiryDays =
    checks.length > 0 ? Math.min(...checks.map((c) => c.daysRemaining)) : null;

  const status: ComplianceTier =
    expiredDocs.length > 0
      ? "AUTO_PAUSED_EXPIRED"
      : expiringDocs.length > 0
      ? "EXPIRING_SOON"
      : "COMPLIANT";

  return {
    status,
    expiredDocs,
    expiringDocs,
    earliestExpiryDays,
  };
}

export function checkBlacklistMatch(
  blacklist: BlacklistEntry[],
  candidate: { phone?: string; pan?: string; gstin?: string; vehicleNo?: string }
): BlacklistEntry | null {
  const cleanPhone = (candidate.phone || "").replace(/\D/g, "").slice(-10);
  const cleanPan = (candidate.pan || "").trim().toUpperCase();
  const cleanGstin = (candidate.gstin || "").trim().toUpperCase();
  const cleanVeh = (candidate.vehicleNo || "").replace(/\s+/g, "").toUpperCase();

  for (const entry of blacklist) {
    if (cleanPhone && entry.phone && entry.phone.replace(/\D/g, "").slice(-10) === cleanPhone) {
      return entry;
    }
    if (cleanPan && entry.pan && entry.pan.trim().toUpperCase() === cleanPan) {
      return entry;
    }
    if (cleanGstin && entry.gstin && entry.gstin.trim().toUpperCase() === cleanGstin) {
      return entry;
    }
    if (cleanVeh && entry.vehicleNo && entry.vehicleNo.replace(/\s+/g, "").toUpperCase() === cleanVeh) {
      return entry;
    }
  }
  return null;
}
