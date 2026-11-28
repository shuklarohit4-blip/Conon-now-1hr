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
  },
  THREE_WHEELER_LOADER: {
    id: "THREE_WHEELER_LOADER",
    label: "3-Wheeler Loader (Ape / E-Loader)",
    labelHi: "3-व्हीलर लोडर",
    maxPayloadKg: 700,
    maxLengthM: 2.4,
    shaheedPathMainAllowed: false,
    daytimeCityAllowed: true,
  },
  LCV_CHHOTA_HATHI: {
    id: "LCV_CHHOTA_HATHI",
    label: "Chhota Hathi / LCV (Tata Ace / Pickup)",
    labelHi: "छोटा हाथी / LCV",
    maxPayloadKg: 1500,
    maxLengthM: 3.0,
    shaheedPathMainAllowed: false,
    daytimeCityAllowed: true,
  },
  HEAVY_TRUCK_TM: {
    id: "HEAVY_TRUCK_TM",
    label: "Heavy Truck / RMC Transit Mixer / Crane",
    labelHi: "हेवी ट्रक / RMC मिक्सर",
    maxPayloadKg: 18000,
    maxLengthM: 12.0,
    shaheedPathMainAllowed: false,
    daytimeCityAllowed: false,
  },
};

export interface LucknowTrafficRulesConfig {
  noEntryStartHour: number;
  noEntryEndHour: number;
  peakMorningStart: string;
  peakMorningEnd: string;
  peakEveningStart: string;
  peakEveningEnd: string;
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
}

function getIstHour(dateOrIso?: Date | string): number {
  const d = dateOrIso ? new Date(dateOrIso) : new Date();
  const istStr = d.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
  });
  return Number(istStr || 12);
}

function isWithinNoEntry(hour: number, startH: number, endH: number): boolean {
  if (startH < endH) return hour >= startH && hour < endH;
  return hour >= startH || hour < endH;
}

export function evaluateDispatchCompliance(params: {
  items?: TrafficEvalItem[];
  totalWeightKg?: number;
  maxItemLengthM?: number;
  pincode?: string;
  domain?: "MATERIAL" | "RMC" | "SERVICE" | "RENTAL";
  requestedTime?: Date | string;
  dispatchMode?: "STANDARD" | "NIGHT_WINDOW" | "DAYTIME_SPLIT";
  rules?: Partial<LucknowTrafficRulesConfig> | null;
  assignedVehicleMaxKg?: number;
}) {
  const rules: LucknowTrafficRulesConfig = {
    ...DEFAULT_LUCKNOW_TRAFFIC_RULES,
    ...(params.rules || {}),
  };
  const items = params.items || [];
  let totalWeightKg = Number(params.totalWeightKg || 0);
  if (totalWeightKg <= 0 && items.length > 0) {
    totalWeightKg = items.reduce(
      (sum, it) => sum + Math.max(1, Number(it.quantity || 1)) * Number(it.weightKg || 25),
      0
    );
  }
  if (params.domain === "RMC" && totalWeightKg <= 0) totalWeightKg = 14400;
  if (params.domain === "RENTAL" && totalWeightKg <= 0) totalWeightKg = 7500;
  if (totalWeightKg <= 0) totalWeightKg = 120;

  const overloadBlocked =
    typeof params.assignedVehicleMaxKg === "number" &&
    params.assignedVehicleMaxKg > 0 &&
    totalWeightKg > params.assignedVehicleMaxKg;

  let vehicleId: VehicleClassId = "LCV_CHHOTA_HATHI";
  if (params.domain === "RMC" || params.domain === "RENTAL") {
    vehicleId = "HEAVY_TRUCK_TM";
  } else if (totalWeightKg <= 30 && Number(params.maxItemLengthM || 1) <= 1.2) {
    vehicleId = "BIKE_EXPRESS";
  } else if (totalWeightKg <= 700) {
    vehicleId = "THREE_WHEELER_LOADER";
  } else if (totalWeightKg <= 1700) {
    vehicleId = "LCV_CHHOTA_HATHI";
  } else {
    vehicleId = "HEAVY_TRUCK_TM";
  }

  const assignedVehicle = VEHICLE_CLASSES[vehicleId];
  const hour = getIstHour(params.requestedTime);
  const isNoEntryWindow =
    vehicleId === "HEAVY_TRUCK_TM" &&
    isWithinNoEntry(hour, rules.noEntryStartHour, rules.noEntryEndHour);

  const illegalDaytimeHeavy =
    isNoEntryWindow &&
    params.dispatchMode !== "NIGHT_WINDOW" &&
    params.dispatchMode !== "DAYTIME_SPLIT";

  return {
    assignedVehicle,
    totalWeightKg: Math.round(totalWeightKg),
    overloadBlocked,
    overloadReason: overloadBlocked
      ? `Load ${Math.round(totalWeightKg)} kg exceeds vehicle RC payload limit ${params.assignedVehicleMaxKg} kg.`
      : undefined,
    isNoEntryWindow,
    illegalDaytimeHeavy,
    daytimeSplitTrips:
      vehicleId === "HEAVY_TRUCK_TM"
        ? Math.max(2, Math.ceil(totalWeightKg / VEHICLE_CLASSES.LCV_CHHOTA_HATHI.maxPayloadKg))
        : 1,
  };
}
