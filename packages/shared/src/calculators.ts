export interface RoomLightingInput {
  roomType: "BEDROOM" | "LIVING" | "KITCHEN" | "STAIRCASE" | "OFFICE" | "LAWN";
  lengthFt: number;
  widthFt: number;
  ceilingType: "POP_FALSE_CEILING" | "NORMAL_RCC_SLAB";
  mood: "3000K" | "6500K" | "3IN1";
}

export interface RoomLightingLine {
  skuCode: string;
  title: string;
  roleLabel: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface RoomLightingOutput {
  areaSqft: number;
  perimeterFt: number;
  panelCount: number;
  cobCount: number;
  stripRolls5m: number;
  profilePieces2m: number;
  stripRawWatts: number;
  smpsDriverWith20PctBufferWatts: number;
  smpsUnits: number;
  lines: RoomLightingLine[];
  subtotal: number;
  kitDiscountPct: number;
  netTotal: number;
}

export function calculateRoomLighting(input: RoomLightingInput): RoomLightingOutput {
  const lengthFt = Math.max(4, Number(input.lengthFt) || 12);
  const widthFt = Math.max(4, Number(input.widthFt) || 10);
  const areaSqft = Math.max(40, Math.round(lengthFt * widthFt));
  const perimeterFt = Math.round(2 * (lengthFt + widthFt));
  const isPop = input.ceilingType === "POP_FALSE_CEILING";

  const lines: RoomLightingLine[] = [];
  let panelCount = 0;
  let cobCount = 0;
  let stripRolls5m = 0;
  let profilePieces2m = 0;
  let stripRawWatts = 0;
  let smpsDriverWith20PctBufferWatts = 0;
  let smpsUnits = 0;

  if (input.roomType === "STAIRCASE") {
    const steps = Math.max(8, Math.round(lengthFt));
    const footLights = Math.max(4, Math.ceil(steps / 3));
    lines.push({
      skuCode: "CON-LGT-STEP-2M",
      title: "LED Step Foot Light (2M Warm)",
      roleLabel: `${steps}-Step Duplex Staircase`,
      qty: footLights,
      unitPrice: 285,
      lineTotal: footLights * 285,
    });
    cobCount = 2;
    lines.push({
      skuCode: "CON-LGT-COB-3W",
      title: "Crompton 3W Mini COB Spot",
      roleLabel: "Landing Accent Spots",
      qty: cobCount,
      unitPrice: 340,
      lineTotal: cobCount * 340,
    });
  } else if (input.roomType === "LAWN") {
    const floods = areaSqft >= 600 ? 3 : 2;
    lines.push({
      skuCode: "CON-LGT-FL50",
      title: "Wipro Garnet 50W IP66 Floodlight",
      roleLabel: "Weatherproof Lawn Coverage",
      qty: floods,
      unitPrice: 1290,
      lineTotal: floods * 1290,
    });
    lines.push({
      skuCode: "CON-LGT-UPDN",
      title: "Jaquar IP65 Up-Down Wall Washer",
      roleLabel: "Boundary Pillar Elevation",
      qty: 4,
      unitPrice: 780,
      lineTotal: 4 * 780,
    });
  } else if (!isPop) {
    panelCount = Math.max(2, Math.ceil(areaSqft / 65));
    lines.push({
      skuCode: "CON-LGT-SURF12",
      title: "Wipro Garnet 12W Rimless Surface Panel",
      roleLabel: "No-POP RCC Surface Panels",
      qty: panelCount,
      unitPrice: 410,
      lineTotal: panelCount * 410,
    });
    cobCount = Math.max(2, Math.round(panelCount / 2));
    lines.push({
      skuCode: "CON-LGT-JUNC7",
      title: 'Sturlite 7W 3-in-1 3" Metal Dabbi Light',
      roleLabel: '3" RCC Concealed Junction Lights',
      qty: cobCount,
      unitPrice: 245,
      lineTotal: cobCount * 245,
    });
  } else {
    panelCount = Math.max(4, Math.ceil(areaSqft / 42));
    lines.push({
      skuCode: input.mood === "3IN1" ? "CON-LGT-PAN15-3N1" : "CON-LGT-PAN12",
      title:
        input.mood === "3IN1"
          ? 'Wipro Garnet 15W 3-in-1 CCT Panel (6" Cutout)'
          : 'Havells Trim 12W LED Panel (4" Cutout)',
      roleLabel: input.mood === "3IN1" ? "Primary Ambient 3-in-1 POP Panels" : "Primary Recessed POP Panels",
      qty: panelCount,
      unitPrice: input.mood === "3IN1" ? 485 : 365,
      lineTotal: panelCount * (input.mood === "3IN1" ? 485 : 365),
    });

    cobCount = input.roomType === "LIVING" || input.roomType === "OFFICE" ? 4 : 2;
    lines.push({
      skuCode: "CON-LGT-COB-7W",
      title: "Philips 7W Tiltable COB Spot (3000K)",
      roleLabel: "Architectural Accent COBs",
      qty: cobCount,
      unitPrice: 540,
      lineTotal: cobCount * 540,
    });

    const perimeterM = perimeterFt * 0.3048;
    stripRolls5m = Math.max(1, Math.ceil(perimeterM / 5));
    profilePieces2m = Math.max(2, Math.ceil(perimeterM / 2));
    stripRawWatts = Math.round(stripRolls5m * 5 * 10); // ~10W per meter Zero-Dot strip
    smpsDriverWith20PctBufferWatts = Math.ceil(stripRawWatts * 1.2); // Mandatory 20% headroom rule
    smpsUnits = Math.max(1, Math.ceil(smpsDriverWith20PctBufferWatts / 120));

    lines.push({
      skuCode: "CON-LGT-STR-ZD5",
      title: "Philips Zero-Dot COB Strip 5m Roll",
      roleLabel: `False Ceiling Cove (${perimeterFt} ft perimeter)`,
      qty: stripRolls5m,
      unitPrice: 790,
      lineTotal: stripRolls5m * 790,
    });
    lines.push({
      skuCode: "CON-LGT-ALU2M",
      title: "Anodized Aluminium Recessed Profile (2m)",
      roleLabel: "Flush Cove Heat-Sink Channels",
      qty: profilePieces2m,
      unitPrice: 220,
      lineTotal: profilePieces2m * 220,
    });
    lines.push({
      skuCode: "CON-LGT-SMPS-10A",
      title: `12V Constant-Voltage SMPS Driver (${smpsDriverWith20PctBufferWatts}W Rated)`,
      roleLabel: "20%-Buffered Anti-Flicker Power Supply",
      qty: smpsUnits,
      unitPrice: 680,
      lineTotal: smpsUnits * 680,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const kitDiscountPct = 8;
  const netTotal = Math.round(subtotal * (1 - kitDiscountPct / 100));

  return {
    areaSqft,
    perimeterFt,
    panelCount,
    cobCount,
    stripRolls5m,
    profilePieces2m,
    stripRawWatts,
    smpsDriverWith20PctBufferWatts,
    smpsUnits,
    lines,
    subtotal,
    kitDiscountPct,
    netTotal,
  };
}

export interface UpSolarRoiInput {
  monthlyBillInr: number;
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  systemType: "ON_GRID" | "HYBRID";
  structureType: "STANDARD" | "ELEVATED_8FT";
  sanctionedLoadKw?: number;
  addonsTotal?: number;
}

export interface UpSolarRoiOutput {
  recommendedKw: number;
  panelsNeeded550Wp: number;
  roofAreaSqft: number;
  grossCost: number;
  elevatedDeltaCost: number;
  centralSubsidy: number;
  upnedaSubsidy: number;
  totalSubsidy: number;
  commercialAdTaxBenefitEstimate: number;
  netCost: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  lifetimeSavings25Yr: number;
  needsMvvnlLoadUpgrade: boolean;
  needsThreePhaseConnection: boolean;
}

const SOLAR_PRACTICAL_KW = [1, 2, 3, 4, 5, 6, 8, 10] as const;

export function calculateUpSolarRoi(input: UpSolarRoiInput): UpSolarRoiOutput {
  const bill = Math.max(850, Number(input.monthlyBillInr) || 3500);
  const rawKw = Math.max(1, Math.min(10, Math.round(bill / 850)));
  const recommendedKw = SOLAR_PRACTICAL_KW.reduce((best, cand) =>
    Math.abs(cand - rawKw) < Math.abs(best - rawKw) ? cand : best
  );

  const panelsNeeded550Wp = Math.ceil((recommendedKw * 1000) / 550);
  const roofAreaSqft = recommendedKw * 95;
  const basePerKw = input.systemType === "HYBRID" ? 88000 : 62000;
  const elevatedDeltaCost = input.structureType === "ELEVATED_8FT" ? recommendedKw * 8500 : 0;
  const bulkDiscountRate = recommendedKw >= 10 ? 0.07 : recommendedKw >= 5 ? 0.04 : 0;
  const rawSystemCost = Math.round(recommendedKw * basePerKw * (1 - bulkDiscountRate)) + elevatedDeltaCost;
  const grossCost = rawSystemCost + (input.addonsTotal || 0);

  let centralSubsidy = 0;
  let upnedaSubsidy = 0;
  let commercialAdTaxBenefitEstimate = 0;

  if (input.propertyType === "RESIDENTIAL") {
    if (recommendedKw === 1) centralSubsidy = 30000;
    else if (recommendedKw === 2) centralSubsidy = 60000;
    else centralSubsidy = 78000;

    // UPNEDA state bonus capped at ₹30,000 -> combined ₹1,08,000 max at >=3kW
    upnedaSubsidy = Math.min(30000, recommendedKw * 15000);
  } else {
    // 40% Accelerated Depreciation tax shield illustration (~30% corporate/business slab on 40% Yr-1 depreciation)
    commercialAdTaxBenefitEstimate = Math.round(grossCost * 0.4 * 0.25);
  }

  const totalSubsidy = centralSubsidy + upnedaSubsidy;
  const netCost = Math.max(0, grossCost - totalSubsidy);
  const monthlySavings = Math.round(recommendedKw * 120 * 7.2);
  const annualSavings = monthlySavings * 12;
  const paybackYears = Number((netCost / Math.max(1, annualSavings)).toFixed(1));
  const lifetimeSavings25Yr = annualSavings * 25;

  const sanctioned = input.sanctionedLoadKw ?? 2;
  const needsMvvnlLoadUpgrade = sanctioned < recommendedKw;
  const needsThreePhaseConnection = recommendedKw >= 6;

  return {
    recommendedKw,
    panelsNeeded550Wp,
    roofAreaSqft,
    grossCost,
    elevatedDeltaCost,
    centralSubsidy,
    upnedaSubsidy,
    totalSubsidy,
    commercialAdTaxBenefitEstimate,
    netCost,
    monthlySavings,
    annualSavings,
    paybackYears,
    lifetimeSavings25Yr,
    needsMvvnlLoadUpgrade,
    needsThreePhaseConnection,
  };
}

export interface WiringBoqInput {
  presetType: "2BHK" | "3BHK" | "DUPLEX" | "SHOP" | "SINGLE_LOAD";
  insulation: "FR" | "HRFR" | "FRLS" | "ZHFR";
  acPointsCount?: number;
  geyserPointsCount?: number;
}

export interface WiringCoilBreakdown {
  gaugeSqMm: "1.0" | "1.5" | "2.5" | "4.0" | "6.0";
  useCase: string;
  coils90m: number;
  colorsSuggested: string[];
  estimatedCostPerCoil: number;
}

export interface WiringBoqOutput {
  coils: WiringCoilBreakdown[];
  totalCoils90m: number;
  mainMcbAmp: number;
  rccbRatingLabel: string;
  conduit25mmPipes: number;
  estimatedTotalCost: number;
}

export function calculateWiringBoq(input: WiringBoqInput): WiringBoqOutput {
  const insFactor =
    input.insulation === "ZHFR" ? 1.15 : input.insulation === "FRLS" ? 1.08 : input.insulation === "HRFR" ? 1.04 : 1;

  const presets = {
    SINGLE_LOAD: { g10: 1, g15: 1, g25: 1, g40: 1, g60: 0, conduits: 6, mcb: 32 },
    SHOP: { g10: 2, g15: 3, g25: 3, g40: 2, g60: 1, conduits: 25, mcb: 40 },
    "2BHK": { g10: 4, g15: 4, g25: 3, g40: 2, g60: 1, conduits: 45, mcb: 40 },
    "3BHK": { g10: 6, g15: 5, g25: 4, g40: 3, g60: 2, conduits: 68, mcb: 63 },
    DUPLEX: { g10: 9, g15: 8, g25: 6, g40: 4, g60: 2, conduits: 110, mcb: 63 },
  };
  const base = presets[input.presetType] || presets["2BHK"];
  const extraAcCoils = Math.max(0, (input.acPointsCount || 0) - 2);
  const extraGeyserCoils = Math.max(0, (input.geyserPointsCount || 0) - 1);

  const coils: WiringCoilBreakdown[] = [
    {
      gaugeSqMm: "1.0",
      useCase: "Lighting Points & Ceiling Fan Drops",
      coils90m: base.g10,
      colorsSuggested: ["Red", "Black", "Yellow", "Blue"],
      estimatedCostPerCoil: Math.round(1180 * insFactor),
    },
    {
      gaugeSqMm: "1.5",
      useCase: "6A Switchboards, Invertor & Loop Neutral",
      coils90m: base.g15,
      colorsSuggested: ["Red", "Black", "Green"],
      estimatedCostPerCoil: Math.round(1720 * insFactor),
    },
    {
      gaugeSqMm: "2.5",
      useCase: "16A Power Sockets & Sub-Mains",
      coils90m: base.g25,
      colorsSuggested: ["Red", "Black", "Green"],
      estimatedCostPerCoil: Math.round(2740 * insFactor),
    },
    {
      gaugeSqMm: "4.0",
      useCase: "1.5T–2T Split ACs, Geysers & Kitchen Induction",
      coils90m: base.g40 + extraAcCoils + extraGeyserCoils,
      colorsSuggested: ["Red", "Blue", "Black"],
      estimatedCostPerCoil: Math.round(4180 * insFactor),
    },
    ...(base.g60 > 0
      ? [
          {
            gaugeSqMm: "6.0" as const,
            useCase: "Main Rising Mains & Meter-to-DB Incomer",
            coils90m: base.g60,
            colorsSuggested: ["Red", "Black"],
            estimatedCostPerCoil: Math.round(6290 * insFactor),
          },
        ]
      : []),
  ];

  const totalCoils90m = coils.reduce((sum, c) => sum + c.coils90m, 0);
  const estimatedTotalCost =
    coils.reduce((sum, c) => sum + c.coils90m * c.estimatedCostPerCoil, 0) +
    base.conduits * 95 +
    2850;

  return {
    coils,
    totalCoils90m,
    mainMcbAmp: base.mcb,
    rccbRatingLabel: `${base.mcb}A 30mA DP RCCB + 12-Way Double Door DB`,
    conduit25mmPipes: base.conduits,
    estimatedTotalCost,
  };
}

export interface RmcSlabInput {
  lengthFt: number;
  widthFt: number;
  thicknessInches: number;
  gradeCode?: "M15" | "M20" | "M25" | "M30";
  floorLevel?: "GROUND" | "MID" | "HIGH";
}

export interface RmcSlabOutput {
  areaSqft: number;
  netVolumeM3: number;
  bufferedVolumeM3: number;
  transitMixers6M3: number;
  recommendedPump: "Direct Chute (Free)" | "Concrete Line Pump (up to 150 ft)" | "Boom Placer (High-Rise Pour)";
  ratePerM3: number;
  estimatedConcreteCost: number;
  estimatedPumpCost: number;
  estimatedTotalIncGst: number;
}

const RMC_GRADE_RATES: Record<"M15" | "M20" | "M25" | "M30", number> = {
  M15: 4250,
  M20: 4600,
  M25: 5065,
  M30: 5490,
};

export function calculateRmcSlabVolume(input: RmcSlabInput): RmcSlabOutput {
  const len = Math.max(1, Number(input.lengthFt) || 40);
  const wid = Math.max(1, Number(input.widthFt) || 25);
  const thickIn = Math.max(1, Number(input.thicknessInches) || 5);
  const areaSqft = Math.round(len * wid);
  const cuFt = len * wid * (thickIn / 12);
  const netVolumeM3 = Number((cuFt * 0.0283168).toFixed(2));
  const bufferedVolumeM3 = Math.max(1, Math.ceil(netVolumeM3 * 1.05 * 2) / 2);
  const transitMixers6M3 = Math.max(1, Math.ceil(bufferedVolumeM3 / 6));

  const recommendedPump: RmcSlabOutput["recommendedPump"] =
    input.floorLevel === "GROUND"
      ? "Direct Chute (Free)"
      : input.floorLevel === "HIGH" || bufferedVolumeM3 >= 30
        ? "Boom Placer (High-Rise Pour)"
        : "Concrete Line Pump (up to 150 ft)";

  const grade = input.gradeCode || "M25";
  const ratePerM3 = RMC_GRADE_RATES[grade] || 5065;
  const estimatedConcreteCost = Math.round(bufferedVolumeM3 * ratePerM3);
  const estimatedPumpCost =
    recommendedPump === "Direct Chute (Free)"
      ? 0
      : recommendedPump === "Boom Placer (High-Rise Pour)"
        ? 14500
        : Math.max(6500, Math.round(bufferedVolumeM3 * 350));
  const subtotal = estimatedConcreteCost + estimatedPumpCost;
  const estimatedTotalIncGst = Math.round(subtotal * 1.18);

  return {
    areaSqft,
    netVolumeM3,
    bufferedVolumeM3,
    transitMixers6M3,
    recommendedPump,
    ratePerM3,
    estimatedConcreteCost,
    estimatedPumpCost,
    estimatedTotalIncGst,
  };
}

export interface BulkOrderTierOutput {
  subtotal: number;
  freeExpressThreshold: 15000;
  megaDiscountThreshold: 50000;
  hasFreeExpressDelivery: boolean;
  hasMegaBulkDiscount: boolean;
  bulkDiscountInr: number;
  remainingForFreeDelivery: number;
  remainingForMegaDiscount: number;
  progressPctTo50k: number;
  tierLabel: string;
}

export function calculateBulkOrderTier(cartSubtotal: number): BulkOrderTierOutput {
  const subtotal = Math.max(0, Number(cartSubtotal) || 0);
  const freeExpressThreshold = 15000 as const;
  const megaDiscountThreshold = 50000 as const;
  const hasFreeExpressDelivery = subtotal >= freeExpressThreshold;
  const hasMegaBulkDiscount = subtotal >= megaDiscountThreshold;
  const bulkDiscountInr = hasMegaBulkDiscount ? 5000 : 0;
  const remainingForFreeDelivery = Math.max(0, freeExpressThreshold - subtotal);
  const remainingForMegaDiscount = Math.max(0, megaDiscountThreshold - subtotal);
  const progressPctTo50k = Math.min(100, Math.round((subtotal / megaDiscountThreshold) * 100));

  const tierLabel = hasMegaBulkDiscount
    ? "₹5,000 Flat OFF + Dedicated Tempo Unlocked"
    : hasFreeExpressDelivery
      ? `Free Express + Unloading Unlocked • Add ₹${remainingForMegaDiscount.toLocaleString("en-IN")} for ₹5,000 OFF`
      : `Add ₹${remainingForFreeDelivery.toLocaleString("en-IN")} for Free Express + Unloading`;

  return {
    subtotal,
    freeExpressThreshold,
    megaDiscountThreshold,
    hasFreeExpressDelivery,
    hasMegaBulkDiscount,
    bulkDiscountInr,
    remainingForFreeDelivery,
    remainingForMegaDiscount,
    progressPctTo50k,
    tierLabel,
  };
}
