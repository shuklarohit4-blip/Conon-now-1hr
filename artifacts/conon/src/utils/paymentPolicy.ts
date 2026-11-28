export type PaymentDomain = "MATERIAL" | "RMC" | "SERVICE" | "RENTAL" | "MIXED";

export type PaymentReasonCode =
  | "RMC_PREPAID_ONLY"
  | "SERVICE_PREPAID_ONLY"
  | "RENTAL_PREPAID_ONLY"
  | "HIGH_VALUE_ORDER_PREPAID"
  | "MIXED_CART_PREPAID"
  | "POD_ELIGIBLE";

export interface PaymentPolicyRules {
  /** Strictly < podMaxMaterialAmount is eligible for POD; >= forces Prepaid */
  podMaxMaterialAmount: number;
  forcePrepaidRmc: boolean;
  forcePrepaidServices: boolean;
  forcePrepaidRentals: boolean;
}

export const DEFAULT_PAYMENT_POLICY_RULES: PaymentPolicyRules = {
  podMaxMaterialAmount: 10000,
  forcePrepaidRmc: true,
  forcePrepaidServices: true,
  forcePrepaidRentals: true,
};

export interface PolicyEvalItem {
  category?: string;
  domain?: string;
  type?: string;
  materialId?: string;
  name?: string;
}

export interface PaymentPolicyEvaluation {
  allowPod: boolean;
  requirePrepaid: boolean;
  reasonCode: PaymentReasonCode;
  badgeText: string;
  explanationEn: string;
  explanationHi: string;
  podMaxMaterialAmount: number;
}

const RMC_MATCH = /\b(rmc|ready[\s_-]?mix|concrete|boom[\s_-]?placer|line[\s_-]?pump|transit[\s_-]?mixer)\b/i;
const SERVICE_MATCH = /\b(service|services|karigar|plumber|electrician|mason|mistri|carpenter|painter|welder|audit|squad)\b/i;
const RENTAL_MATCH = /\b(rental|rentals|machine|jcb|excavator|crane|roller|shuttering|dg[\s_-]?set|vibrator|hmr)\b/i;

function classifyItemDomain(item: PolicyEvalItem): "MATERIAL" | "RMC" | "SERVICE" | "RENTAL" {
  const explicit = (item.domain || item.type || "").toUpperCase();
  if (explicit === "RMC") return "RMC";
  if (explicit === "SERVICE" || explicit === "SERVICES") return "SERVICE";
  if (explicit === "RENTAL" || explicit === "RENTALS") return "RENTAL";

  const haystack = `${item.category || ""} ${item.materialId || ""} ${item.name || ""}`;
  if (RMC_MATCH.test(haystack)) return "RMC";
  if (SERVICE_MATCH.test(haystack)) return "SERVICE";
  if (RENTAL_MATCH.test(haystack)) return "RENTAL";
  return "MATERIAL";
}

export function evaluatePaymentPolicy(params: {
  domain: PaymentDomain;
  items?: PolicyEvalItem[];
  grandTotal: number;
  rules?: Partial<PaymentPolicyRules>;
}): PaymentPolicyEvaluation {
  const rules: PaymentPolicyRules = {
    ...DEFAULT_PAYMENT_POLICY_RULES,
    ...(params.rules || {}),
  };
  const limit = Math.max(0, Number(rules.podMaxMaterialAmount || 10000));
  const total = Math.max(0, Number(params.grandTotal || 0));
  const items = params.items || [];

  const itemDomains = new Set(items.map(classifyItemDomain));
  const hasRmc = params.domain === "RMC" || itemDomains.has("RMC");
  const hasService = params.domain === "SERVICE" || itemDomains.has("SERVICE");
  const hasRental = params.domain === "RENTAL" || itemDomains.has("RENTAL");
  const hasMaterial = params.domain === "MATERIAL" || itemDomains.has("MATERIAL");

  const isMixed =
    params.domain === "MIXED" ||
    (hasMaterial && (hasRmc || hasService || hasRental)) ||
    [hasRmc, hasService, hasRental].filter(Boolean).length > 1;

  if (isMixed && (hasRmc || hasService || hasRental)) {
    return {
      allowPod: false,
      requirePrepaid: true,
      reasonCode: "MIXED_CART_PREPAID",
      badgeText: "100% Prepaid Only • Mixed Cart",
      explanationEn:
        "Mixed carts containing RMC, Skilled Services, or Machine Rentals require 100% upfront Escrow payment before dispatch.",
      explanationHi:
        "RMC, कारीगर सेवा या मशीन रेंटल वाले मिक्स कार्ट के लिए बुकिंग से पहले 100% प्रीपेड एस्क्रो भुगतान अनिवार्य है।",
      podMaxMaterialAmount: limit,
    };
  }

  if (hasRmc && rules.forcePrepaidRmc) {
    return {
      allowPod: false,
      requirePrepaid: true,
      reasonCode: "RMC_PREPAID_ONLY",
      badgeText: "100% Prepaid Escrow Required • RMC Plant Direct",
      explanationEn:
        "Pay First to Confirm Plant Slot & Convoy — Ready Mix Concrete orders are batched fresh and require 100% upfront Escrow.",
      explanationHi:
        "RMC प्लांट स्लॉट और कन्वॉय लॉक करने के लिए पहले 100% प्रीपेड एस्क्रो भुगतान अनिवार्य है।",
      podMaxMaterialAmount: limit,
    };
  }

  if (hasService && rules.forcePrepaidServices) {
    return {
      allowPod: false,
      requirePrepaid: true,
      reasonCode: "SERVICE_PREPAID_ONLY",
      badgeText: "100% Prepaid Escrow Required • Skilled Crew",
      explanationEn:
        "Pay First to Dispatch Verified Karigar Squad — Escrow stays locked until Start/End OTP & Haziri completion.",
      explanationHi:
        "वेरिफाइड कारीगर स्क्वाड भेजने के लिए पहले 100% प्रीपेड एस्क्रो भुगतान अनिवार्य है।",
      podMaxMaterialAmount: limit,
    };
  }

  if (hasRental && rules.forcePrepaidRentals) {
    return {
      allowPod: false,
      requirePrepaid: true,
      reasonCode: "RENTAL_PREPAID_ONLY",
      badgeText: "100% Prepaid Escrow Required • Machine & Operator",
      explanationEn:
        "Pay First to Confirm Machine & Operator — Digital HMR lock protects your billing until verified shift completion.",
      explanationHi:
        "मशीन और ऑपरेटर कन्फर्म करने के लिए पहले 100% प्रीपेड एस्क्रो भुगतान अनिवार्य है।",
      podMaxMaterialAmount: limit,
    };
  }

  if (total >= limit) {
    const formattedLimit = `₹${limit.toLocaleString("en-IN")}`;
    return {
      allowPod: false,
      requirePrepaid: true,
      reasonCode: "HIGH_VALUE_ORDER_PREPAID",
      badgeText: `Prepaid Mandatory (${formattedLimit}+ Orders)`,
      explanationEn: `Prepaid Mandatory (${formattedLimit}+ Orders) — Complete secure Escrow payment first to confirm & dispatch your order.`,
      explanationHi: `${formattedLimit} या उससे अधिक के ऑर्डर के लिए पहले सुरक्षित एस्क्रो प्रीपेड भुगतान अनिवार्य है।`,
      podMaxMaterialAmount: limit,
    };
  }

  const formattedLimit = `₹${limit.toLocaleString("en-IN")}`;
  return {
    allowPod: true,
    requirePrepaid: false,
    reasonCode: "POD_ELIGIBLE",
    badgeText: `Pay on Delivery Available (< ${formattedLimit})`,
    explanationEn: `Available on material orders under ${formattedLimit} — choose Instant Escrow or Pay on Delivery (Cash / Site UPI).`,
    explanationHi: `${formattedLimit} से कम के मटेरियल ऑर्डर पर Pay on Delivery (नकद / साइट UPI) उपलब्ध है।`,
    podMaxMaterialAmount: limit,
  };
}
