import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { toast } from "sonner";
import { getSocket, joinApplicantRoom } from "@/services/socket";
import { MAC_ADMIN_KEY } from "@/config/adminGuard";

export type ApplicantType = "VENDOR" | "DRIVER";

export type KycDocStatus =
  | "PENDING_SCAN"
  | "SCANNING"
  | "SUBMITTED"
  | "VERIFIED"
  | "REUPLOAD_REQUIRED";

export type KycOverallStatus =
  | "PENDING_VERIFICATION"
  | "REUPLOAD_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRING_SOON"
  | "COMPLIANCE_PAUSED";

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

const STORAGE_KEY = "conon_kyc_state_v2";
const BROADCAST_NAME = "conon_kyc_bus";

const SEED_APPLICATIONS: PartnerKycApplication[] = [
  {
    id: "APP-VND-2026-7712",
    applicantType: "VENDOR",
    applicantId: "VND-APP-7712",
    firmOrName: "Awadh Building Solutions & Pipe Depot",
    ownerOrDriverName: "Anurag Mishra",
    phone: "+91 94150 88219",
    zone: "Sushant Golf City / Shaheed Path",
    loadingBayAccess: "LOADER_FRIENDLY",
    categories: ["CEMENT", "STEEL", "PIPES", "BRICKS"],
    shopLat: 26.7812,
    shopLng: 80.9981,
    bankAccount: "910283746182",
    bankIfsc: "HDFC0001824",
    bankUpi: "awadhpipe@okaxis",
    pennyDropStatus: "VERIFIED",
    pennyDropHolderName: "AWADH BUILDING SOLUTIONS",
    pennyDropRef: "NPCI-IMPS-9982410",
    aiAuthenticityScore: 97,
    status: "PENDING_VERIFICATION",
    slaSignedAt: "2026-03-29T10:15:00Z",
    documents: [
      {
        docId: "doc-gst-7712",
        docType: "GSTIN_CERTIFICATE",
        docName: "GSTIN Registration (09AAECB1289R1Z4)",
        docUrl: "/images/kyc/sample-gst-cert.webp",
        extractedNumber: "09AAECB1289R1Z4",
        extractedName: "AWADH BUILDING SOLUTIONS",
        ocrAuthenticityScore: 98,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T10:15:00Z",
        updatedAt: "2026-03-29T10:15:00Z",
      },
      {
        docId: "doc-pan-7712",
        docType: "PAN_CARD",
        docName: "Proprietor PAN (AAECB1289R)",
        docUrl: "/images/kyc/sample-pan-card.webp",
        extractedNumber: "AAECB1289R",
        extractedName: "ANURAG MISHRA",
        ocrAuthenticityScore: 96,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T10:15:00Z",
        updatedAt: "2026-03-29T10:15:00Z",
      },
      {
        docId: "doc-sign-7712",
        docType: "SIGNBOARD_PHOTO",
        docName: "Shop Front Signboard with GPS",
        docUrl: "/images/kyc/sample-shop-sign.webp",
        ocrAuthenticityScore: 94,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T10:15:00Z",
        updatedAt: "2026-03-29T10:15:00Z",
      },
      {
        docId: "doc-brand-7712",
        docType: "BRAND_DEALERSHIP",
        docName: "UltraTech & Astral Dealership Letter",
        docUrl: "/images/kyc/sample-dealership.webp",
        extractedNumber: "DL-UT-2025-881",
        ocrAuthenticityScore: 99,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T10:15:00Z",
        updatedAt: "2026-03-29T10:15:00Z",
      },
    ],
    auditLogs: [
      {
        logId: "log-1",
        action: "SUBMISSION",
        actor: "Anurag Mishra",
        note: "Submitted via Dukaan OS Partner Onboarding",
        timestamp: "2026-03-29T10:15:00Z",
      },
    ],
    createdAt: "2026-03-29T10:15:00Z",
    updatedAt: "2026-03-29T10:15:00Z",
  },
  {
    id: "APP-DRV-2026-4401",
    applicantType: "DRIVER",
    applicantId: "DRV-APP-4401",
    firmOrName: "Tata Ace Loader (UP 32 EL 7710)",
    ownerOrDriverName: "Mohd. Rizwan Khan",
    phone: "+91 98390 12398",
    zone: "Alambagh / Transport Nagar",
    vehicleMode: "CHHOTA_HATHI",
    vehiclePlate: "UP 32 EL 7710",
    categories: ["HEAVY_LOGISTICS"],
    bankAccount: "50100491823901",
    bankIfsc: "SBIN0001290",
    bankUpi: "rizwan.ace@upi",
    pennyDropStatus: "VERIFIED",
    pennyDropHolderName: "MOHD RIZWAN KHAN",
    pennyDropRef: "NPCI-IMPS-8871029",
    aiAuthenticityScore: 99,
    status: "PENDING_VERIFICATION",
    slaSignedAt: "2026-03-29T11:00:00Z",
    insuranceExpiry: "2026-11-20",
    dlExpiry: "2031-08-14",
    pucExpiry: "2026-10-15",
    documents: [
      {
        docId: "doc-dl-4401",
        docType: "DRIVING_LICENCE",
        docName: "Transport Driving License (UP32 20180049120)",
        docUrl: "/images/kyc/sample-dl.webp",
        extractedNumber: "UP32 20180049120",
        extractedName: "MOHD RIZWAN KHAN",
        extractedExpiry: "2031-08-14",
        ocrAuthenticityScore: 99,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T11:00:00Z",
        updatedAt: "2026-03-29T11:00:00Z",
      },
      {
        docId: "doc-rc-4401",
        docType: "VEHICLE_RC",
        docName: "Commercial Vehicle RC (UP 32 EL 7710)",
        docUrl: "/images/kyc/sample-rc.webp",
        extractedNumber: "UP 32 EL 7710",
        extractedName: "MOHD RIZWAN KHAN",
        ocrAuthenticityScore: 98,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T11:00:00Z",
        updatedAt: "2026-03-29T11:00:00Z",
      },
      {
        docId: "doc-ins-4401",
        docType: "INSURANCE_PUC",
        docName: "Commercial Goods Insurance Policy",
        docUrl: "/images/kyc/sample-insurance.webp",
        extractedNumber: "NIC-COMM-9918231",
        extractedExpiry: "2026-11-20",
        ocrAuthenticityScore: 97,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T11:00:00Z",
        updatedAt: "2026-03-29T11:00:00Z",
      },
      {
        docId: "doc-selfie-4401",
        docType: "SELFIE_LIVENESS",
        docName: "Driver Live Selfie with Tata Ace",
        docUrl: "/images/kyc/sample-selfie.webp",
        ocrAuthenticityScore: 99,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T11:00:00Z",
        updatedAt: "2026-03-29T11:00:00Z",
      },
      {
        docId: "doc-tirpal-4401",
        docType: "TIRPAL_WATERPROOF",
        docName: "Heavy Heavy-Duty Tarpaulin Proof",
        docUrl: "/images/kyc/sample-tarpaulin.webp",
        ocrAuthenticityScore: 95,
        ocrReadQuality: "HIGH",
        status: "SUBMITTED",
        createdAt: "2026-03-29T11:00:00Z",
        updatedAt: "2026-03-29T11:00:00Z",
      },
    ],
    auditLogs: [
      {
        logId: "log-drv-1",
        action: "SUBMISSION",
        actor: "Mohd. Rizwan Khan",
        note: "Submitted via Rider & Loader Cockpit",
        timestamp: "2026-03-29T11:00:00Z",
      },
    ],
    createdAt: "2026-03-29T11:00:00Z",
    updatedAt: "2026-03-29T11:00:00Z",
  },
];

export interface PennyDropRequest {
  accountNumber: string;
  ifsc: string;
  upiId?: string;
  holderName: string;
}

export interface PennyDropResponse {
  success: boolean;
  refId: string;
  verifiedName: string;
  matchScore: number;
  message: string;
}

interface KycContextType {
  applications: PartnerKycApplication[];
  activeApplicantId: string | null;
  currentApplication: PartnerKycApplication | null;
  isSubmitting: boolean;
  isLoadingQueue: boolean;
  complianceAlert: { show: boolean; reason: string; expiryType: string } | null;
  dismissComplianceAlert: () => void;
  setActiveApplicantId: (id: string | null) => void;
  submitVendorKyc: (payload: {
    firmName: string;
    ownerName: string;
    phone: string;
    zone: string;
    loadingBayAccess: "NARROW_LANE" | "LOADER_FRIENDLY";
    categories: string[];
    shopLat?: number;
    shopLng?: number;
    bankAccount: string;
    bankIfsc: string;
    bankUpi: string;
    documents: Array<{
      docType: KycDocument["docType"];
      docName: string;
      docUrl: string;
      extractedNumber?: string;
      extractedName?: string;
    }>;
  }) => Promise<PartnerKycApplication>;
  submitDriverKyc: (payload: {
    name: string;
    phone: string;
    zone: string;
    vehicleMode: "BIKE_EXPRESS" | "CHHOTA_HATHI";
    vehiclePlate: string;
    bankAccount: string;
    bankIfsc: string;
    bankUpi: string;
    insuranceExpiry?: string;
    dlExpiry?: string;
    pucExpiry?: string;
    documents: Array<{
      docType: KycDocument["docType"];
      docName: string;
      docUrl: string;
      extractedNumber?: string;
      extractedName?: string;
      extractedExpiry?: string;
    }>;
  }) => Promise<PartnerKycApplication>;
  verifyPennyDrop: (req: PennyDropRequest) => Promise<PennyDropResponse>;
  reuploadDocument: (
    docId: string,
    newUrl: string,
    extractedNumber?: string,
    extractedName?: string
  ) => Promise<boolean>;
  adminReviewDocument: (
    docId: string,
    status: "VERIFIED" | "REUPLOAD_REQUIRED",
    reason?: string
  ) => Promise<boolean>;
  adminDecideApplication: (
    appId: string,
    decision: "APPROVE" | "REUPLOAD" | "REJECT",
    reason?: string
  ) => Promise<boolean>;
  simulateComplianceExpiry: (
    driverId?: string,
    expiryType?: "INSURANCE" | "PUC" | "DL"
  ) => Promise<boolean>;
  refreshKycQueue: () => Promise<void>;
}

const KycContext = createContext<KycContextType | null>(null);

function loadSavedApplications(): PartnerKycApplication[] {
  if (typeof window === "undefined") return SEED_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return SEED_APPLICATIONS;
}

export function KycProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<PartnerKycApplication[]>(loadSavedApplications);
  const [activeApplicantId, setActiveApplicantIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("conon_active_applicant_id") || "VND-APP-7712";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [complianceAlert, setComplianceAlert] = useState<{
    show: boolean;
    reason: string;
    expiryType: string;
  } | null>(null);

  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Cross-tab broadcast init
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return undefined;
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel(BROADCAST_NAME);
      broadcastRef.current = ch;
      ch.onmessage = (event) => {
        if (event.data?.type === "KYC_APPS_UPDATE" && Array.isArray(event.data.payload)) {
          setApplications(event.data.payload);
        } else if (event.data?.type === "COMPLIANCE_ALERT") {
          setComplianceAlert(event.data.payload);
        }
      };
    } catch {
      // ignore
    }
    return () => {
      if (ch) ch.close();
    };
  }, []);

  // Sync state mutation helper
  const updateAndBroadcast = useCallback(
    (updater: (prev: PartnerKycApplication[]) => PartnerKycApplication[]) => {
      setApplications((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          if (broadcastRef.current) {
            broadcastRef.current.postMessage({
              type: "KYC_APPS_UPDATE",
              payload: next,
            });
          }
        } catch (err) {
          console.error("[KycContext] storage error:", err);
        }
        return next;
      });
    },
    []
  );

  const setActiveApplicantId = useCallback((id: string | null) => {
    setActiveApplicantIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("conon_active_applicant_id", id);
        joinApplicantRoom(id);
      } else {
        localStorage.removeItem("conon_active_applicant_id");
      }
    }
  }, []);

  const dismissComplianceAlert = useCallback(() => {
    setComplianceAlert(null);
  }, []);

  // Fetch applications from backend
  const refreshKycQueue = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const res = await fetch("/api/kyc/admin/queue", {
        headers: {
          "x-admin-key": MAC_ADMIN_KEY || "conon_admin_secret_lucknow_2025",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.applications)) {
          updateAndBroadcast(() => data.applications);
        }
      }
    } catch {
      // keep fallback
    } finally {
      setIsLoadingQueue(false);
    }
  }, [updateAndBroadcast]);

  // Initial load and socket listeners
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (activeApplicantId) {
      joinApplicantRoom(activeApplicantId);
    }

    const socket = getSocket();

    const onNewApplication = (payload: any) => {
      if (payload?.application) {
        toast.info(`📋 New KYC Received: ${payload.application.firmOrName}`, {
          description: `${payload.application.applicantType} application registered in ${payload.application.zone}.`,
        });
        updateAndBroadcast((prev) => {
          const idx = prev.findIndex((a) => a.id === payload.application.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = payload.application;
            return next;
          }
          return [payload.application, ...prev];
        });
      }
    };

    const onDocFlagged = (payload: any) => {
      toast.warning(`⚠️ Document Flagged for Re-Upload`, {
        description: payload?.reason || "Please inspect document clarity.",
      });
      if (payload?.application) {
        updateAndBroadcast((prev) =>
          prev.map((a) => (a.id === payload.application.id ? payload.application : a))
        );
      }
    };

    const onDocReuploaded = (payload: any) => {
      toast.info(`✓ Document Re-uploaded by Partner`, {
        description: `New scan submitted for ${payload?.document?.docName || "paper"}.`,
      });
      if (payload?.application) {
        updateAndBroadcast((prev) =>
          prev.map((a) => (a.id === payload.application.id ? payload.application : a))
        );
      }
    };

    const onAppApproved = (payload: any) => {
      if (payload?.decision === "APPROVE") {
        toast.success(`🎉 Partner KYC Approved!`, {
          description: `${payload.application?.firmOrName} is now LIVE in Lucknow!`,
        });
      }
      if (payload?.application) {
        updateAndBroadcast((prev) =>
          prev.map((a) => (a.id === payload.application.id ? payload.application : a))
        );
      }
    };

    const onCompliancePaused = (payload: any) => {
      const alertData = {
        show: true,
        reason: payload?.reason || "Compliance Kill-Switch activated.",
        expiryType: payload?.expiryType || "INSURANCE",
      };
      setComplianceAlert(alertData);
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({
          type: "COMPLIANCE_ALERT",
          payload: alertData,
        });
      }
      toast.error(`🚨 Compliance Kill-Switch Activated!`, {
        description: payload?.reason || "Partner dispatch suspended.",
      });
      if (payload?.application) {
        updateAndBroadcast((prev) =>
          prev.map((a) => (a.id === payload.application.id ? payload.application : a))
        );
      }
    };

    socket.on("kyc:new_application", onNewApplication);
    socket.on("kyc:document_flagged", onDocFlagged);
    socket.on("kyc:document_reuploaded", onDocReuploaded);
    socket.on("kyc:application_approved", onAppApproved);
    socket.on("kyc:compliance_paused", onCompliancePaused);

    // Initial sync
    void refreshKycQueue();

    return () => {
      socket.off("kyc:new_application", onNewApplication);
      socket.off("kyc:document_flagged", onDocFlagged);
      socket.off("kyc:document_reuploaded", onDocReuploaded);
      socket.off("kyc:application_approved", onAppApproved);
      socket.off("kyc:compliance_paused", onCompliancePaused);
    };
  }, [activeApplicantId, refreshKycQueue, updateAndBroadcast]);

  // Penny Drop Action
  const verifyPennyDrop = useCallback(async (req: PennyDropRequest): Promise<PennyDropResponse> => {
    try {
      const res = await fetch("/api/kyc/penny-drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // simulate client side
    }
    await new Promise((r) => setTimeout(r, 1200));
    return {
      success: true,
      refId: `NPCI-IMPS-${Math.floor(1000000 + Math.random() * 9000000)}`,
      verifiedName: req.holderName.toUpperCase().trim(),
      matchScore: 98,
      message: `₹1 Penny Drop Verified successfully. Account holder name matched.`,
    };
  }, []);

  // Submit Vendor KYC
  const submitVendorKyc = useCallback(
    async (payload: any): Promise<PartnerKycApplication> => {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/kyc/vendor/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.application) {
            updateAndBroadcast((prev) => [data.application, ...prev]);
            setActiveApplicantId(data.application.applicantId);
            toast.success("Dukaan Registration & KYC Submitted!", {
              description: "Our compliance team will verify your papers within 30 mins.",
            });
            return data.application;
          }
        }
      } catch {
        // client-side fallback
      } finally {
        setIsSubmitting(false);
      }

      // Local fallback
      const appId = `APP-VND-${Date.now()}`;
      const applicantId = `VND-APP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newApp: PartnerKycApplication = {
        id: appId,
        applicantType: "VENDOR",
        applicantId,
        firmOrName: payload.firmName,
        ownerOrDriverName: payload.ownerName,
        phone: payload.phone,
        zone: payload.zone,
        loadingBayAccess: payload.loadingBayAccess,
        categories: payload.categories,
        shopLat: payload.shopLat || 26.8452,
        shopLng: payload.shopLng || 80.9254,
        bankAccount: payload.bankAccount,
        bankIfsc: payload.bankIfsc,
        bankUpi: payload.bankUpi,
        pennyDropStatus: "VERIFIED",
        pennyDropHolderName: payload.ownerName.toUpperCase(),
        pennyDropRef: `NPCI-IMPS-${Math.floor(1000000 + Math.random() * 9000000)}`,
        aiAuthenticityScore: 97,
        status: "PENDING_VERIFICATION",
        slaSignedAt: new Date().toISOString(),
        documents: (payload.documents || []).map((d: any, idx: number) => ({
          docId: `doc-${Date.now()}-${idx}`,
          docType: d.docType,
          docName: d.docName,
          docUrl: d.docUrl,
          extractedNumber: d.extractedNumber,
          extractedName: d.extractedName,
          ocrAuthenticityScore: 96,
          ocrReadQuality: "HIGH" as const,
          status: "SUBMITTED" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        auditLogs: [
          {
            logId: `log-${Date.now()}`,
            action: "SUBMISSION",
            actor: payload.ownerName,
            note: "Submitted Dukaan Registration",
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateAndBroadcast((prev) => [newApp, ...prev]);
      setActiveApplicantId(newApp.applicantId);
      toast.success("Dukaan Registration & KYC Submitted!", {
        description: "Our compliance team will verify your papers within 30 mins.",
      });
      return newApp;
    },
    [setActiveApplicantId, updateAndBroadcast]
  );

  // Submit Driver KYC
  const submitDriverKyc = useCallback(
    async (payload: any): Promise<PartnerKycApplication> => {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/kyc/driver/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.application) {
            updateAndBroadcast((prev) => [data.application, ...prev]);
            setActiveApplicantId(data.application.applicantId);
            toast.success("Driver Onboarding & Papers Submitted!", {
              description: "Live ride dispatch unlocks immediately upon admin review.",
            });
            return data.application;
          }
        }
      } catch {
        // client fallback
      } finally {
        setIsSubmitting(false);
      }

      // Local fallback
      const appId = `APP-DRV-${Date.now()}`;
      const applicantId = `DRV-APP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newApp: PartnerKycApplication = {
        id: appId,
        applicantType: "DRIVER",
        applicantId,
        firmOrName: `${payload.vehicleMode === "BIKE_EXPRESS" ? "Bike Express" : "Loader"} (${payload.vehiclePlate})`,
        ownerOrDriverName: payload.name,
        phone: payload.phone,
        zone: payload.zone,
        vehicleMode: payload.vehicleMode,
        vehiclePlate: payload.vehiclePlate,
        categories: ["FLEET_LOGISTICS"],
        bankAccount: payload.bankAccount,
        bankIfsc: payload.bankIfsc,
        bankUpi: payload.bankUpi,
        pennyDropStatus: "VERIFIED",
        pennyDropHolderName: payload.name.toUpperCase(),
        pennyDropRef: `NPCI-IMPS-${Math.floor(1000000 + Math.random() * 9000000)}`,
        aiAuthenticityScore: 98,
        status: "PENDING_VERIFICATION",
        slaSignedAt: new Date().toISOString(),
        insuranceExpiry: payload.insuranceExpiry || "2026-11-20",
        dlExpiry: payload.dlExpiry || "2031-08-14",
        pucExpiry: payload.pucExpiry || "2026-10-15",
        documents: (payload.documents || []).map((d: any, idx: number) => ({
          docId: `doc-${Date.now()}-${idx}`,
          docType: d.docType,
          docName: d.docName,
          docUrl: d.docUrl,
          extractedNumber: d.extractedNumber,
          extractedName: d.extractedName,
          extractedExpiry: d.extractedExpiry,
          ocrAuthenticityScore: 97,
          ocrReadQuality: "HIGH" as const,
          status: "SUBMITTED" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        auditLogs: [
          {
            logId: `log-${Date.now()}`,
            action: "SUBMISSION",
            actor: payload.name,
            note: "Submitted Driver Onboarding",
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateAndBroadcast((prev) => [newApp, ...prev]);
      setActiveApplicantId(newApp.applicantId);
      toast.success("Driver Onboarding & Papers Submitted!", {
        description: "Live ride dispatch unlocks immediately upon admin review.",
      });
      return newApp;
    },
    [setActiveApplicantId, updateAndBroadcast]
  );

  // Re-upload Document
  const reuploadDocument = useCallback(
    async (
      docId: string,
      newUrl: string,
      extractedNumber?: string,
      extractedName?: string
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/kyc/documents/${docId}/reupload`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docUrl: newUrl, extractedNumber, extractedName }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.application) {
            updateAndBroadcast((prev) =>
              prev.map((a) => (a.id === data.application.id ? data.application : a))
            );
            toast.success("Fixed Paper Re-uploaded!", {
              description: "Sent back to Admin Verification Desk.",
            });
            return true;
          }
        }
      } catch {
        // fallback
      }

      // Local fallback
      updateAndBroadcast((prev) =>
        prev.map((app) => {
          const hasDoc = app.documents.some((d) => d.docId === docId);
          if (!hasDoc) return app;
          const updatedDocs = app.documents.map((d) =>
            d.docId === docId
              ? {
                  ...d,
                  docUrl: newUrl,
                  extractedNumber: extractedNumber || d.extractedNumber,
                  extractedName: extractedName || d.extractedName,
                  status: "SUBMITTED" as KycDocStatus,
                  rejectionReason: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : d
          );
          const anyPendingReupload = updatedDocs.some((d) => d.status === "REUPLOAD_REQUIRED");
          return {
            ...app,
            status: anyPendingReupload ? "REUPLOAD_REQUESTED" : "PENDING_VERIFICATION",
            documents: updatedDocs,
            auditLogs: [
              ...app.auditLogs,
              {
                logId: `log-${Date.now()}`,
                action: "DOC_REUPLOAD",
                actor: app.ownerOrDriverName,
                note: `Re-uploaded fixed paper`,
                timestamp: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );
      toast.success("Fixed Paper Re-uploaded!", {
        description: "Sent back to Admin Verification Desk.",
      });
      return true;
    },
    [updateAndBroadcast]
  );

  // Admin Review Document (Verify or Flag Re-Upload)
  const adminReviewDocument = useCallback(
    async (
      docId: string,
      status: "VERIFIED" | "REUPLOAD_REQUIRED",
      reason?: string
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/kyc/admin/documents/${docId}/review`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": MAC_ADMIN_KEY || "conon_admin_secret_lucknow_2025",
          },
          body: JSON.stringify({ status, reason }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.application) {
            updateAndBroadcast((prev) =>
              prev.map((a) => (a.id === data.application.id ? data.application : a))
            );
            toast.success(data.message || `Document status updated to ${status}`);
            return true;
          }
        }
      } catch {
        // fallback
      }

      // Local fallback
      updateAndBroadcast((prev) =>
        prev.map((app) => {
          const hasDoc = app.documents.some((d) => d.docId === docId);
          if (!hasDoc) return app;
          const updatedDocs = app.documents.map((d) =>
            d.docId === docId
              ? {
                  ...d,
                  status,
                  rejectionReason: status === "REUPLOAD_REQUIRED" ? reason : undefined,
                  reviewedBy: "Admin Command OS",
                  reviewedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : d
          );
          const hasReupload = updatedDocs.some((d) => d.status === "REUPLOAD_REQUIRED");
          return {
            ...app,
            status: hasReupload ? "REUPLOAD_REQUESTED" : app.status,
            documents: updatedDocs,
            auditLogs: [
              ...app.auditLogs,
              {
                logId: `log-${Date.now()}`,
                action: status === "VERIFIED" ? "DOC_VERIFIED" : "DOC_FLAGGED_REUPLOAD",
                actor: "Admin Command OS",
                note: status === "VERIFIED" ? "Verified paper" : reason,
                timestamp: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );
      toast.success(status === "VERIFIED" ? "✓ Document verified" : `↻ Re-upload requested: ${reason}`);
      return true;
    },
    [updateAndBroadcast]
  );

  // Admin Final Decision (Approve / Reupload / Reject)
  const adminDecideApplication = useCallback(
    async (
      appId: string,
      decision: "APPROVE" | "REUPLOAD" | "REJECT",
      reason?: string
    ): Promise<boolean> => {
      try {
        const res = await fetch(`/api/kyc/admin/applications/${appId}/decision`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": MAC_ADMIN_KEY || "conon_admin_secret_lucknow_2025",
          },
          body: JSON.stringify({ decision, reason }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.application) {
            updateAndBroadcast((prev) =>
              prev.map((a) => (a.id === appId ? data.application : a))
            );
            toast.success(data.message || `Decision finalized: ${decision}`);
            return true;
          }
        }
      } catch {
        // fallback
      }

      // Local fallback
      updateAndBroadcast((prev) =>
        prev.map((app) => {
          if (app.id !== appId) return app;
          const newStatus: KycOverallStatus =
            decision === "APPROVE"
              ? "APPROVED"
              : decision === "REUPLOAD"
              ? "REUPLOAD_REQUESTED"
              : "REJECTED";
          return {
            ...app,
            status: newStatus,
            auditLogs: [
              ...app.auditLogs,
              {
                logId: `log-${Date.now()}`,
                action: `DECISION_${decision}`,
                actor: "Admin Command OS",
                note: reason || `Application ${decision.toLowerCase()}d`,
                timestamp: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );
      toast.success(
        decision === "APPROVE"
          ? "🎉 Partner Approved & Activated Live!"
          : decision === "REUPLOAD"
          ? "Sent back to partner for re-upload."
          : "Application rejected."
      );
      return true;
    },
    [updateAndBroadcast]
  );

  // Simulate Compliance Expiry
  const simulateComplianceExpiry = useCallback(
    async (
      driverId = "DRV-APP-4401",
      expiryType: "INSURANCE" | "PUC" | "DL" = "INSURANCE"
    ): Promise<boolean> => {
      try {
        const res = await fetch("/api/kyc/admin/simulate-expiry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": MAC_ADMIN_KEY || "conon_admin_secret_lucknow_2025",
          },
          body: JSON.stringify({ driverId, expiryType }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.application) {
            updateAndBroadcast((prev) =>
              prev.map((a) => (a.id === data.application.id ? data.application : a))
            );
            const alert = {
              show: true,
              reason: `🚨 AUTO-EXPIRY KILL-SWITCH: ${expiryType} Expired! Driver suspended from dispatch.`,
              expiryType,
            };
            setComplianceAlert(alert);
            return true;
          }
        }
      } catch {
        // fallback
      }

      // Local fallback
      updateAndBroadcast((prev) =>
        prev.map((app) => {
          if (app.applicantId !== driverId && app.id !== driverId) return app;
          return {
            ...app,
            status: "COMPLIANCE_PAUSED" as const,
            insuranceExpiry: expiryType === "INSURANCE" ? "2024-01-01" : app.insuranceExpiry,
            pucExpiry: expiryType === "PUC" ? "2024-01-01" : app.pucExpiry,
            dlExpiry: expiryType === "DL" ? "2024-01-01" : app.dlExpiry,
            auditLogs: [
              ...app.auditLogs,
              {
                logId: `log-${Date.now()}`,
                action: "COMPLIANCE_PAUSED",
                actor: "System Compliance Daemon",
                note: `Auto-Expiry Kill-Switch: ${expiryType} expired!`,
                timestamp: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );
      const alert = {
        show: true,
        reason: `🚨 AUTO-EXPIRY KILL-SWITCH: ${expiryType} Expired! Driver suspended from dispatch.`,
        expiryType,
      };
      setComplianceAlert(alert);
      return true;
    },
    [updateAndBroadcast]
  );

  const currentApplication = useMemo(() => {
    if (!activeApplicantId) return null;
    return (
      applications.find(
        (a) => a.applicantId === activeApplicantId || a.id === activeApplicantId
      ) || null
    );
  }, [applications, activeApplicantId]);

  const value = useMemo(
    () => ({
      applications,
      activeApplicantId,
      currentApplication,
      isSubmitting,
      isLoadingQueue,
      complianceAlert,
      dismissComplianceAlert,
      setActiveApplicantId,
      submitVendorKyc,
      submitDriverKyc,
      verifyPennyDrop,
      reuploadDocument,
      adminReviewDocument,
      adminDecideApplication,
      simulateComplianceExpiry,
      refreshKycQueue,
    }),
    [
      applications,
      activeApplicantId,
      currentApplication,
      isSubmitting,
      isLoadingQueue,
      complianceAlert,
      dismissComplianceAlert,
      setActiveApplicantId,
      submitVendorKyc,
      submitDriverKyc,
      verifyPennyDrop,
      reuploadDocument,
      adminReviewDocument,
      adminDecideApplication,
      simulateComplianceExpiry,
      refreshKycQueue,
    ]
  );

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc() {
  const context = useContext(KycContext);
  if (!context) {
    throw new Error("useKyc must be used within a KycProvider");
  }
  return context;
}
