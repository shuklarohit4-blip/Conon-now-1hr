import mongoose, { Schema, type Document, type Model } from "mongoose";
import type {
  IProduct,
  IProductSpecification,
  IProductVariant,
} from "../catalogData";

export interface IProductDocument extends Document, IProduct {}

const ProductSpecificationSchema = new Schema<IProductSpecification>(
  {
    label: { type: String, required: true },
    name: { type: String },
    value: { type: String, required: true },
  },
  { _id: false },
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
    image: { type: String },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProductDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    subCategory: { type: String },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    shortTagline: { type: String },
    specChips: { type: [String], default: [] },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
    specifications: { type: [ProductSpecificationSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    unit: { type: String, default: "Piece" },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    deliveryEta: { type: String, default: "60 Mins" },
    vendor: { type: String },
    oemModelCode: { type: String },
    systemType: {
      type: String,
      enum: ["ANALOG_HD", "IP_POE", "WIFI_STANDALONE", "NETWORKING", "UNIVERSAL_ACCESSORY"],
    },
    resolutionMP: { type: Number },
    nightVisionType: { type: String },
    isStqcCertified: { type: Boolean, default: false },
    conductorMaterial: { type: String },
    inclusionsBadge: { type: String },
    hddIncluded: { type: Boolean },
    poePortCount: { type: Number },
    channelCount: { type: Number },
    priceVolatility: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY", "HIGH", "STANDARD"], default: "STANDARD" },
    vehicleType: { type: String, default: "2-Wheeler" },
    deliveryVehicleType: { type: String, default: "2-Wheeler" },
    woodSubcategory: { type: String, enum: ["PLYWOOD", "FLUSH_DOOR", "LAMINATE", "HARDWARE"] },
    thicknessMm: { type: Number },
    sheetOrDoorSizeFt: { type: String },
    areaSqFt: { type: Number },
    dimensionsLabel: { type: String },
    gradeOrRating: { type: String },
    effectivePerSqFtPrice: { type: Number },
    pipeSystem: { type: String, enum: ["CPVC", "UPVC", "SWR", "WATER_TANK", "ACCESSORY"] },
    pressureClass: { type: String, enum: ["SDR-11", "SDR-13.5", "SCH-40", "SCH-80", "TYPE-A", "TYPE-B", "N/A"] },
    nominalSize: { type: String },
    pipeLengthMeters: { type: Number },
    tankCapacityLiters: { type: Number },
    tankLayers: { type: Number },
    isFoamInsulated: { type: Boolean, default: false },
    brandTier: { type: Number, default: 2 },
    gstPercent: { type: Number, default: 18 },
    hsnCode: { type: String },
    exGstPrice: { type: Number },
    cementGrade: { type: String, enum: ["PPC", "OPC 43", "OPC 53", "Weather-Shield", "White Cement"] },
    cementType: { type: String },
    tmtGrade: { type: String, enum: ["Fe 500", "Fe 500D", "Fe 550", "Fe 550D"] },
    tmtDiameterMm: { type: Number },
    barLengthMeters: { type: Number, default: 12 },
    theoreticalWeightKg: { type: Number },
    steelTier: { type: String, enum: ["Tier 1 - Primary", "Tier 2 - Regional/Value"] },
    chemicalType: { type: String },
    dosagePerBagCement: { type: String },
    requiresUnloadingLabour: { type: Boolean, default: false },
    effectivePerKgPrice: { type: Number },
    stoneSubcategory: {
      type: String,
      enum: ["VITRIFIED_TILE", "WALL_PARKING_TILE", "GRANITE_SLAB", "MARBLE_NATURAL_STONE", "GROUT_AND_TOOLS"],
    },
    sellingUnit: { type: String },
    tileSizeMm: { type: String },
    piecesPerBox: { type: Number },
    coverageSqFtPerBox: { type: Number },
    effectivePricePerSqFt: { type: Number },
    surfaceFinish: { type: String },
    minOrderSqFt: { type: Number },
    batchLockRequired: { type: Boolean, default: false },
    paintSubcategory: {
      type: String,
      enum: ["WALL_PUTTY", "PRIMER", "INTERIOR_PAINT", "EXTERIOR_PAINT", "ENAMEL_AND_TOOLS"],
    },
    surfaceType: {
      type: String,
      enum: ["INTERIOR", "EXTERIOR", "INTERIOR_AND_EXTERIOR", "METAL_AND_WOOD", "UNIVERSAL"],
    },
    finishType: { type: String },
    packSizeValue: { type: Number },
    packSizeUnit: { type: String, enum: ["L", "kg", "pc", "pcs"] },
    effectiveUnitRate: { type: Number },
    isTintable: { type: Boolean, default: false },
    masonrySubcategory: {
      type: String,
      enum: ["BRICKS", "AAC_CONCRETE_BLOCKS", "SAND_MORANG", "GITTI_AGGREGATES", "PAVERS_COVER_BLOCKS"],
    },
    minOrderQty: { type: Number },
    piecesPerCbm: { type: Number },
    aggregateSizeMm: { type: Number },
    deliveryMode: {
      type: String,
      enum: ["EXPRESS_60_MIN", "SAME_DAY_SCHEDULED"],
      default: "SAME_DAY_SCHEDULED",
    },
    requiresMiningTransitPass: { type: Boolean, default: false },
    toolSubcategory: {
      type: String,
      enum: ["POWER_TOOL", "HAND_TOOL", "SITE_SAFETY"],
    },
    powerWatts: { type: Number },
    chuckOrDiscSpec: { type: String },
    safetyStandard: { type: String },
    keySpecBadge: { type: String },
    crossSellSkus: [{ type: String }],
    adhesiveSubcategory: {
      type: String,
      enum: ["WOOD_LAMINATE", "CONTACT_RUBBER", "EPOXY_INSTANT", "SEALANT_FOAM", "APPLICATOR_TAPE"],
    },
    cureType: {
      type: String,
      enum: ["NEUTRAL", "ACETOXY_GP", "PU_MOISTURE", "TWO_PART_EPOXY", "PVA_RESIN", "SOLVENT_CONTACT", "CYANOACRYLATE", "N/A"],
    },
    baseChemistry: { type: String },
    settingTimeLabel: { type: String },
    heatOrWaterRating: { type: String },
    kitchenSubcategory: {
      type: String,
      enum: ["SS_PRESSED_SINK", "HANDMADE_SS_SINK", "QUARTZ_SINK", "SINK_COCK", "SINK_MIXER_PULLOUT", "SINK_ACCESSORY"],
    },
    materialGrade: { type: String },
    sinkConstruction: { type: String },
    overallDimensionsInch: { type: String },
    minCabinetWidthMm: { type: Number },
    mountType: { type: String },
    waterSupplyType: { type: String },
    finishColor: { type: String },
    furnitureSubcategory: {
      type: String,
      enum: ["TELESCOPIC_CHANNEL", "HINGE_SLIDING", "BED_WARDROBE_LIFT", "PIPE_HANDLE"],
    },
    fitSpecBadge: { type: String },
    lengthOrPitchSpec: { type: String },
    loadCapacityLabel: { type: String },
    closingType: {
      type: String,
      enum: ["SOFT_CLOSE", "REGULAR_CLOSE", "N/A"],
    },
    overlayOrMountSpec: { type: String },
    modularSubcategory: {
      type: String,
      enum: ["TANDEM_BOX", "PULLOUT_CORNER_PANTRY", "BASKET_ORGANIZER", "SHUTTER_LIFT_GOLA"],
    },
    carcassFitBadge: { type: String },
    carcassWidthMm: { type: Number },
    depthMm: { type: Number },
    heightMm: { type: Number },
    loadCapacityKg: { type: Number },
    doorSubcategory: {
      type: String,
      enum: ["SMART_DIGITAL_LOCK", "MAIN_DOOR_MORTISE_PADLOCK", "BOLT_ALDROP_STOPPER", "HINGE_CLOSER_SPRING"],
    },
    doorThicknessRangeMm: { type: String },
    operationType: { type: String },
    boltOrLeverCount: { type: String },
    weightCapacityKg: { type: Number },
    sanitarySubcategory: {
      type: String,
      enum: [
        "WALL_HUNG_AND_ONE_PIECE_WC",
        "CONCEALED_CISTERN_FLUSH_PLATE",
        "COUNTERTOP_CERAMIC_BASIN",
        "DIVERTER_SHOWER_SPOUT",
        "FAUCET_VALVE_ACCESSORY",
      ],
    },
    mountingType: {
      type: String,
      enum: ["WALL_HUNG", "FLOOR_MOUNT_S_TRAP", "TABLETOP_COUNTER", "CONCEALED_IN_WALL", "WALL_SURFACE"],
    },
    trapOrWasteSpec: { type: String },
    flushCapacityLiters: { type: String },
    flowRateLpm: { type: String },
    applianceSubcategory: {
      type: String,
      enum: ["WATER_HEATER", "KITCHEN_CHIMNEY", "EXHAUST_FAN", "DESERT_COOLER", "INVERTER_BATTERY"],
    },
    capacityOrSizeLabel: { type: String },
    powerOrSuctionSpec: { type: String },
    pressureBarRating: { type: Number },
    cutoutOrStoveFitLabel: { type: String },
    fitOrCutoutBadge: { type: String },
    isBldcOr5Star: { type: Boolean },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const ProductModel: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);
