export interface ZoneDef {
  pincode: string;
  areaName: string;
  slaMins: number;
  active: boolean;
}

export interface ServiceableZoneConfig {
  strictPincodeLock: boolean;
  activePincodes: ZoneDef[];
}

export interface PincodeWaitlistEntry {
  id: string;
  pincode: string;
  phone: string;
  areaHint?: string;
  createdAt: string;
}

export const DEFAULT_SERVICEABLE_ZONES: ZoneDef[] = [
  {
    pincode: "226030",
    areaName: "Sushant Golf City & Sultanpur Road",
    slaMins: 60,
    active: true,
  },
  {
    pincode: "226010",
    areaName: "Gomti Nagar & Gomti Nagar Extension",
    slaMins: 60,
    active: true,
  },
  {
    pincode: "226028",
    areaName: "Faizabad Road (Chinhat / Kamta / BBD)",
    slaMins: 60,
    active: true,
  },
  {
    pincode: "226002",
    areaName: "Sultanpur Road (Arjunganj / Shaheed Path)",
    slaMins: 60,
    active: true,
  },
];

export const DEFAULT_SERVICEABILITY_CONFIG: ServiceableZoneConfig = {
  strictPincodeLock: true,
  activePincodes: DEFAULT_SERVICEABLE_ZONES,
};

export const ACTIVE_AREAS_SUMMARY =
  "Sushant Golf City, Gomti Nagar, Gomti Nagar Extension, Sultanpur Road & Faizabad Road";

export interface ServiceabilityCheckResult {
  pincode: string;
  validFormat: boolean;
  serviceable: boolean;
  matchedZone?: ZoneDef;
  activeZones: ZoneDef[];
  allowedPincodes: string[];
  activeAreasSummary: string;
  messageEn: string;
  messageHi: string;
}

export function sanitizePincode(raw?: string | null): string {
  return String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 6);
}

export function extractPincodeFromText(text?: string | null): string {
  const match = String(text || "").match(/\b(\d{6})\b/);
  return match ? match[1] : "";
}

export function checkPincodeServiceability(
  rawPincode: string,
  config?: Partial<ServiceableZoneConfig> | null,
): ServiceabilityCheckResult {
  const pincode = sanitizePincode(rawPincode);
  const validFormat = /^\d{6}$/.test(pincode);
  const strict = config?.strictPincodeLock ?? true;
  const activePincodes =
    Array.isArray(config?.activePincodes) && config.activePincodes.length > 0
      ? config.activePincodes
      : DEFAULT_SERVICEABLE_ZONES;

  const activeZones = activePincodes.filter((z) => z.active);
  const allowedPincodes = activeZones.map((z) => z.pincode);
  const matchedZone = activeZones.find((z) => z.pincode === pincode);

  if (!validFormat) {
    return {
      pincode,
      validFormat: false,
      serviceable: false,
      activeZones,
      allowedPincodes,
      activeAreasSummary: ACTIVE_AREAS_SUMMARY,
      messageEn: "Enter a valid 6-digit delivery pin code.",
      messageHi: "कृपया मान्य 6-अंकीय डिलीवरी पिन कोड दर्ज करें।",
    };
  }

  if (!strict) {
    return {
      pincode,
      validFormat: true,
      serviceable: true,
      matchedZone: matchedZone || {
        pincode,
        areaName: "Lucknow Open Zone",
        slaMins: 60,
        active: true,
      },
      activeZones,
      allowedPincodes,
      activeAreasSummary: ACTIVE_AREAS_SUMMARY,
      messageEn: `Delivery available in ${pincode}.`,
      messageHi: `${pincode} में डिलीवरी उपलब्ध है।`,
    };
  }

  if (matchedZone) {
    return {
      pincode,
      validFormat: true,
      serviceable: true,
      matchedZone,
      activeZones,
      allowedPincodes,
      activeAreasSummary: ACTIVE_AREAS_SUMMARY,
      messageEn: `Express ${matchedZone.slaMins}-min delivery live in ${matchedZone.areaName} (${matchedZone.pincode}).`,
      messageHi: `${matchedZone.areaName} (${matchedZone.pincode}) में ${matchedZone.slaMins}-मिनट एक्सप्रेस डिलीवरी चालू है।`,
    };
  }

  const pinList = allowedPincodes.join(", ");
  return {
    pincode,
    validFormat: true,
    serviceable: false,
    activeZones,
    allowedPincodes,
    activeAreasSummary: ACTIVE_AREAS_SUMMARY,
    messageEn: `Currently Live Only in ${ACTIVE_AREAS_SUMMARY} (${pinList}).`,
    messageHi: `अभी सेवा केवल ${ACTIVE_AREAS_SUMMARY} (${pinList}) में उपलब्ध है।`,
  };
}
