export type VehicleClassId =
  | "BIKE_EXPRESS"
  | "THREE_WHEELER_LOADER"
  | "LCV_CHHOTA_HATHI"
  | "HEAVY_TRUCK_TM";

export interface VehicleClassSpec {
  id: VehicleClassId;
  label: string;
  labelHi: string;
  maxPayloadKg: number;
  maxLengthM: number;
  shaheedPathMainAllowed: boolean;
  daytimeCityAllowed: boolean;
  safetyNoteEn: string;
  safetyNoteHi: string;
}

export const VEHICLE_CLASSES: Record<VehicleClassId, VehicleClassSpec> = {
  BIKE_EXPRESS: {
    id: "BIKE_EXPRESS",
    label: "2-Wheeler Express",
    labelHi: "बाइक एक्सप्रेस",
    maxPayloadKg: 30,
    maxLengthM: 1.2,
    shaheedPathMainAllowed: true,
    daytimeCityAllowed: true,
    safetyNoteEn: "24×7 allowed on all internal roads (Helmet mandatory).",
    safetyNoteHi: "सभी अंदरूनी सड़कों पर 24×7 अनुमति (हेलमेट अनिवार्य)।",
  },
  THREE_WHEELER_LOADER: {
    id: "THREE_WHEELER_LOADER",
    label: "3-Wheeler Loader (Ape / E-Loader)",
    labelHi: "3-व्हीलर लोडर (ई-लोडर / ऑटो)",
    maxPayloadKg: 700,
    maxLengthM: 2.4,
    shaheedPathMainAllowed: false,
    daytimeCityAllowed: true,
    safetyNoteEn:
      "Allowed daytime on internal roads & Shaheed Path SERVICE LANE ONLY. Never enter Shaheed Path main elevated carriageway (₹20,000 fine).",
    safetyNoteHi:
      "शहीद पथ के ऊपर मत चढ़ें! केवल सर्विस लेन या अंदरूनी सड़क का उपयोग करें (₹20,000 नो-एंट्री जुर्माना)।",
  },
  LCV_CHHOTA_HATHI: {
    id: "LCV_CHHOTA_HATHI",
    label: "Chhota Hathi / LCV (Tata Ace / Pickup)",
    labelHi: "छोटा हाथी / LCV (टाटा एस / पिकअप)",
    maxPayloadKg: 1500,
    maxLengthM: 3.0,
    shaheedPathMainAllowed: false,
    daytimeCityAllowed: true,
    safetyNoteEn:
      "Strictly OFF Shaheed Path Main Carriageway (06:00–23:00). Use Service Lane & crossings: Husadia Underpass, Hanemann, Gwari, DPS Cut, Pipraghat.",
    safetyNoteHi:
      "शहीद पथ मेन हाईवे (सुबह 6 – रात 11) पर सख्त मना है! सर्विस लेन व हुसड़िया/हनमान/ग्वारी/DPS कट से जाएं।",
  },
  HEAVY_TRUCK_TM: {
    id: "HEAVY_TRUCK_TM",
    label: "Heavy Truck / RMC Transit Mixer / Crane",
    labelHi: "हेवी ट्रक / RMC मिक्सर / क्रेन",
    maxPayloadKg: 18000,
    maxLengthM: 12.0,
    shaheedPathMainAllowed: false,
    daytimeCityAllowed: false,
    safetyNoteEn:
      "STRICT LUCKNOW NO-ENTRY 06:00 AM – 11:00 PM inside city, Shaheed Path, Kamta, Ayodhya Rd Flyover & Kabirpur-Ahimamau. Legal entry 11:00 PM – 06:00 AM or Kisan Path Outer Ring Road.",
    safetyNoteHi:
      "दिन 6 AM – 11 PM शहर में सख्त NO-ENTRY है! केवल रात 11 PM – 6 AM या किसान पथ (आउटर रिंग रोड) से चलें।",
  },
};

export interface ZoneTrafficIntel {
  pincode: string;
  zoneName: string;
  preferredDayVehicle: VehicleClassId;
  routeAdvisoryEn: string;
  routeAdvisoryHi: string;
  crossings: string[];
  anprHighRisk: boolean;
}

export const LUCKNOW_ZONE_TRAFFIC_MAP: Record<string, ZoneTrafficIntel> = {
  "226030": {
    pincode: "226030",
    zoneName: "Sushant Golf City & Sultanpur Rd",
    preferredDayVehicle: "LCV_CHHOTA_HATHI",
    routeAdvisoryEn:
      "Heavy trucks via Kisan Path outer belt only during day (11 PM–6 AM inside); Ansal API township security gate pass required; daytime via 3-Wheeler / Chhota Hathi service lanes.",
    routeAdvisoryHi:
      "अंसल API गेट पास रखें। दिन में भारी ट्रक केवल किसान पथ से; शहर के अंदर डिलीवरी 3-व्हीलर / छोटा हाथी सर्विस लेन से।",
    crossings: ["Kisan Path Outer Belt", "Ahimamau Service Lane", "Ansal API Gate"],
    anprHighRisk: true,
  },
  "226010": {
    pincode: "226010",
    zoneName: "Gomti Nagar & Gomti Nagar Ext",
    preferredDayVehicle: "LCV_CHHOTA_HATHI",
    routeAdvisoryEn:
      "High ANPR e-challan zone: ZERO heavy trucks 06:00–23:00; Chhota Hathi & 3-Wheeler must avoid Shaheed Path main highway — use Service Lane, Husadia, Hanemann, Gwari or DPS Cut.",
    routeAdvisoryHi:
      "हाई ANPR कैमरा ज़ोन: 06:00–23:00 भारी ट्रक बंद; शहीद पथ के ऊपर न चढ़ें — हुसड़िया, हनमान, ग्वारी या DPS कट से जाएं।",
    crossings: ["Husadia Underpass", "Hanemann Crossing", "Gwari Bridge", "DPS Cut", "Pipraghat"],
    anprHighRisk: true,
  },
  "226028": {
    pincode: "226028",
    zoneName: "Faizabad Rd (Chinhat / Kamta / BBD)",
    preferredDayVehicle: "LCV_CHHOTA_HATHI",
    routeAdvisoryEn:
      "Ayodhya Road Flyover & Kamta heavy ban 06:00–23:00; Indira Canal / Kisan Path diversion for trucks; 3-Wheeler & Chhota Hathi for daytime inside Chinhat/Kamta.",
    routeAdvisoryHi:
      "अयोध्या रोड फ्लाईओवर व कमता पर 06:00–23:00 भारी वाहन बंद; ट्रक के लिए इंदिरा नहर / किसान पथ डायवर्जन।",
    crossings: ["Indira Canal Road", "Kisan Path", "Kamta Service Lane"],
    anprHighRisk: true,
  },
  "226002": {
    pincode: "226002",
    zoneName: "Sultanpur Rd (Arjunganj / Shaheed Path)",
    preferredDayVehicle: "THREE_WHEELER_LOADER",
    routeAdvisoryEn:
      "Narrow high-congestion market road — 3-Wheeler Loader / Bike Express prioritized during daytime; heavy trucks strictly 11:00 PM – 06:00 AM only.",
    routeAdvisoryHi:
      "अर्जुनगंज संकरी मार्केट रोड — दिन में 3-व्हीलर लोडर / बाइक को प्राथमिकता; भारी ट्रक केवल रात 11 PM – 6 AM।",
    crossings: ["Arjunganj Service Lane", "Shaheed Path Underpass", "Cantt Outer"],
    anprHighRisk: true,
  },
};

export interface LucknowTrafficRulesConfig {
  noEntryStartHour: number; // default 6 (06:00 AM)
  noEntryEndHour: number; // default 23 (11:00 PM)
  peakMorningStart: string; // "08:00"
  peakMorningEnd: string; // "11:00"
  peakEveningStart: string; // "17:00"
  peakEveningEnd: string; // "20:30"
  vipDiversionActive: boolean;
  vipDiversionNote: string;
  zonePreferredVehicle: Record<string, VehicleClassId>;
}

export const DEFAULT_LUCKNOW_TRAFFIC_RULES: LucknowTrafficRulesConfig = {
  noEntryStartHour: 6,
  noEntryEndHour: 23,
  peakMorningStart: "08:00",
  peakMorningEnd: "11:00",
  peakEveningStart: "17:00",
  peakEveningEnd: "20:30",
  vipDiversionActive: false,
  vipDiversionNote: "",
  zonePreferredVehicle: {
    "226030": "LCV_CHHOTA_HATHI",
    "226010": "LCV_CHHOTA_HATHI",
    "226028": "LCV_CHHOTA_HATHI",
    "226002": "THREE_WHEELER_LOADER",
  },
};

export interface TrafficEvalItem {
  name?: string;
  category?: string;
  quantity?: number;
  weightKg?: number;
  lengthM?: number;
}

export interface DispatchComplianceResult {
  assignedVehicle: VehicleClassSpec;
  tripCount: number;
  totalWeightKg: number;
  maxItemLengthM: number;
  overloadBlocked: boolean;
  overloadReason?: string;
  isNoEntryWindow: boolean;
  isPeakHourCaution: boolean;
  requiresLongLoadFolding: boolean;
  requiresTarpaulinCover: boolean;
  vipDiversionActive: boolean;
  vipDiversionNote: string;
  zoneIntel: ZoneTrafficIntel;
  canSplitDaytime: boolean;
  daytimeSplitVehicle?: VehicleClassSpec;
  daytimeSplitTripCount?: number;
  nightWindowLabel: string;
  badgeText: string;
  routeWarningEn: string;
  routeWarningHi: string;
}

const TARPAULIN_RE = /\b(cement|sand|morang|balu|aggregate|gitti|putty|brick|aac|dust|plaster|lime|fly[\s_-]?ash)\b/i;
const LONG_LOAD_RE = /\b(tmt|sariya|rebar|bar|steel|cpvc|upvc|pipe|conduit|angle|channel|ladder|scaffolding)\b/i;

function getIstHourAndMinutes(dateOrIso?: Date | string): { hour: number; hhmm: string } {
  const d = dateOrIso ? new Date(dateOrIso) : new Date();
  const istStr = d.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [hStr] = istStr.split(":");
  return { hour: Number(hStr || 12), hhmm: istStr };
}

function isWithinNoEntry(hour: number, startH: number, endH: number): boolean {
  if (startH < endH) {
    return hour >= startH && hour < endH;
  }
  return hour >= startH || hour < endH;
}

export function evaluateDispatchCompliance(params: {
  items?: TrafficEvalItem[];
  totalWeightKg?: number;
  maxItemLengthM?: number;
  pincode?: string;
  domain?: "MATERIAL" | "RMC" | "SERVICE" | "RENTAL";
  requestedTime?: Date | string;
  vipDiversionActive?: boolean;
  rules?: Partial<LucknowTrafficRulesConfig> | null;
  assignedVehicleMaxKg?: number;
}): DispatchComplianceResult {
  const rules: LucknowTrafficRulesConfig = {
    ...DEFAULT_LUCKNOW_TRAFFIC_RULES,
    ...(params.rules || {}),
  };
  const vipActive = params.vipDiversionActive ?? rules.vipDiversionActive;
  const items = params.items || [];
  const pin = String(params.pincode || "226030").replace(/\D/g, "").slice(0, 6) || "226030";
  const zoneIntel: ZoneTrafficIntel =
    LUCKNOW_ZONE_TRAFFIC_MAP[pin] || LUCKNOW_ZONE_TRAFFIC_MAP["226030"];

  // Estimate weight if not explicitly supplied
  let totalWeightKg = Number(params.totalWeightKg || 0);
  if (totalWeightKg <= 0 && items.length > 0) {
    totalWeightKg = items.reduce((sum, it) => {
      const qty = Math.max(1, Number(it.quantity || 1));
      const perUnit = Number(it.weightKg || 25);
      return sum + qty * perUnit;
    }, 0);
  }
  if (params.domain === "RMC" && totalWeightKg <= 0) totalWeightKg = 14400; // ~6 m3 TM
  if (params.domain === "RENTAL" && totalWeightKg <= 0) totalWeightKg = 7500;
  if (totalWeightKg <= 0) totalWeightKg = 120;

  const haystack = items.map((i) => `${i.name || ""} ${i.category || ""}`).join(" ");
  const requiresTarpaulinCover =
    params.domain === "MATERIAL" && TARPAULIN_RE.test(haystack);
  const requiresLongLoadFolding =
    Number(params.maxItemLengthM || 0) > 2.4 || LONG_LOAD_RE.test(haystack);
  const maxItemLengthM = Math.max(
    Number(params.maxItemLengthM || 0),
    LONG_LOAD_RE.test(haystack) ? 6.0 : 1.5
  );

  // Explicit overload check if a specific driver vehicle cap is given
  const overloadBlocked =
    typeof params.assignedVehicleMaxKg === "number" &&
    params.assignedVehicleMaxKg > 0 &&
    totalWeightKg > params.assignedVehicleMaxKg;
  const overloadReason = overloadBlocked
    ? `OVERLOAD_BLOCKED: Load ${Math.round(totalWeightKg)} kg exceeds RC payload limit ${params.assignedVehicleMaxKg} kg (Saves ₹20,000 + ₹2,000/tonne fine).`
    : undefined;

  // Choose legal vehicle class
  let vehicleId: VehicleClassId;
  if (params.domain === "RMC" || params.domain === "RENTAL") {
    vehicleId = "HEAVY_TRUCK_TM";
  } else if (totalWeightKg <= 30 && maxItemLengthM <= 1.2) {
    vehicleId = "BIKE_EXPRESS";
  } else if (
    totalWeightKg <= 700 ||
    (zoneIntel.preferredDayVehicle === "THREE_WHEELER_LOADER" && totalWeightKg <= 700)
  ) {
    vehicleId = "THREE_WHEELER_LOADER";
  } else if (totalWeightKg <= 1700) {
    vehicleId = "LCV_CHHOTA_HATHI";
  } else {
    vehicleId = "HEAVY_TRUCK_TM";
  }

  const assignedVehicle = VEHICLE_CLASSES[vehicleId];
  const { hour, hhmm } = getIstHourAndMinutes(params.requestedTime);

  const isNoEntryWindow =
    vehicleId === "HEAVY_TRUCK_TM" &&
    isWithinNoEntry(hour, rules.noEntryStartHour, rules.noEntryEndHour);

  const isPeakHourCaution =
    (vehicleId === "LCV_CHHOTA_HATHI" || vehicleId === "THREE_WHEELER_LOADER") &&
    ((hhmm >= rules.peakMorningStart && hhmm <= rules.peakMorningEnd) ||
      (hhmm >= rules.peakEveningStart && hhmm <= rules.peakEveningEnd));

  // Daytime split option for splittable material orders > 1700 kg
  const canSplitDaytime = params.domain === "MATERIAL" && vehicleId === "HEAVY_TRUCK_TM";
  const splitPrefId: VehicleClassId =
    rules.zonePreferredVehicle?.[pin] === "THREE_WHEELER_LOADER"
      ? "THREE_WHEELER_LOADER"
      : "LCV_CHHOTA_HATHI";
  const daytimeSplitVehicle = canSplitDaytime ? VEHICLE_CLASSES[splitPrefId] : undefined;
  const daytimeSplitTripCount =
    canSplitDaytime && daytimeSplitVehicle
      ? Math.max(2, Math.ceil(totalWeightKg / daytimeSplitVehicle.maxPayloadKg))
      : undefined;

  const tripCount =
    vehicleId === "HEAVY_TRUCK_TM"
      ? Math.max(1, Math.ceil(totalWeightKg / assignedVehicle.maxPayloadKg))
      : 1;

  const nightWindowLabel = `${rules.noEntryEndHour > 12 ? rules.noEntryEndHour - 12 : rules.noEntryEndHour}:00 PM – ${String(rules.noEntryStartHour).padStart(2, "0")}:00 AM`;

  const badgeText =
    vehicleId === "THREE_WHEELER_LOADER"
      ? `Assigned Fleet: 3-Wheeler Loader (Safe for ${pin} Lanes • ${Math.round(totalWeightKg)} / ${assignedVehicle.maxPayloadKg} kg Cap)`
      : vehicleId === "LCV_CHHOTA_HATHI"
      ? `Assigned Fleet: Chhota Hathi (${Math.round(totalWeightKg)} / ${assignedVehicle.maxPayloadKg} kg • Service Lane Route)`
      : vehicleId === "BIKE_EXPRESS"
      ? `Assigned Fleet: 2-Wheeler Express (${Math.round(totalWeightKg)} / 30 kg • 24×7 Internal)`
      : isNoEntryWindow
      ? `Heavy Vehicle No-Entry Active (${rules.noEntryStartHour}:00–${rules.noEntryEndHour}:00) • Night Slot or Split Required`
      : `Assigned Fleet: Heavy Truck / TM (${Math.round(totalWeightKg)} kg • Legal Night Window)`;

  const routeWarningEn = vipActive
    ? `VIP / Shaheed Path Diversion Active: ${rules.vipDiversionNote || "Use Kisan Path / Service Lane crossings only."} ${zoneIntel.routeAdvisoryEn}`
    : `${assignedVehicle.safetyNoteEn} ${zoneIntel.routeAdvisoryEn}`;

  const routeWarningHi = vipActive
    ? `VIP / शहीद पथ डायवर्जन चालू: ${rules.vipDiversionNote || "केवल किसान पथ / सर्विस लेन का उपयोग करें।"} ${zoneIntel.routeAdvisoryHi}`
    : `${assignedVehicle.safetyNoteHi} ${zoneIntel.routeAdvisoryHi}`;

  return {
    assignedVehicle,
    tripCount,
    totalWeightKg: Math.round(totalWeightKg),
    maxItemLengthM,
    overloadBlocked,
    overloadReason,
    isNoEntryWindow,
    isPeakHourCaution,
    requiresLongLoadFolding,
    requiresTarpaulinCover,
    vipDiversionActive: vipActive,
    vipDiversionNote: rules.vipDiversionNote || "",
    zoneIntel,
    canSplitDaytime,
    daytimeSplitVehicle,
    daytimeSplitTripCount,
    nightWindowLabel,
    badgeText,
    routeWarningEn,
    routeWarningHi,
  };
}
