import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const products = JSON.parse(fs.readFileSync(path.join(rootDir, "scripts/plumbing-products-temp.json"), "utf8"));

console.log(`Loaded ${products.length} plumbing products from temp JSON.`);

// Subcategory title map
const subcatNames = {
  "cpvc-pipes": "CPVC Pipes (Hot & Cold)",
  "upvc-pipes-fittings": "UPVC Pipes & Fittings",
  "swr-drainage-pipes": "SWR Drainage Pipes",
  "cpvc-fittings-valves": "CPVC Fittings, Brass & Valves",
  "solvent-cements-adhesives": "Solvent Cements & Adhesives",
  "overhead-water-tanks": "Overhead Water Tanks & Accessories",
};

// Map each product to IProduct structure
const iProducts = products.map((p) => {
  const subCategoryName = subcatNames[p.subcategory] || "CPVC Plumbing & Overhead Tanks";
  const variants = [
    {
      id: `var-${p.id}-std`,
      label: p.nominalSize ? `${p.nominalSize} Standard` : (p.tankCapacityLiters ? `${p.tankCapacityLiters}L Capacity` : "Standard Pack"),
      unit: p.unit,
      price: p.price,
      mrp: p.mrp,
      discountPercent: p.discountPct,
      stock: 150,
      image: p.image,
    },
  ];

  const bulkPricingTiers = p.bulkPrice
    ? [
        {
          minQty: 10,
          pricePerUnit: p.bulkPrice,
          discountPercent: Math.round(((p.mrp - p.bulkPrice) / p.mrp) * 100),
          label: p.bulkSlabText || `Bulk Tier (10+ Units)`,
        },
      ]
    : [];

  const specChips = [
    p.pipeSystem,
    p.pressureClass !== "N/A" ? p.pressureClass : (p.tankLayers ? `${p.tankLayers}-Layer` : "Industrial"),
    p.deliveryVehicleType,
    "18% GST Compliant",
  ];

  if (p.isFoamInsulated) {
    specChips.push("Summer Heat-Shield Foam");
  }

  const specifications = [
    { label: "Brand", value: p.brand },
    { label: "OEM Model / Code", value: p.oemModelCode },
    { label: "Pipe / Tank System", value: p.pipeSystem },
    { label: "Pressure Class / Standard", value: p.pressureClass },
    { label: "Nominal Size", value: p.nominalSize || "Standard" },
    { label: "Delivery Dispatch", value: `60-Min Express via ${p.deliveryVehicleType}` },
    { label: "GST Rate", value: "18% Included" },
    { label: "Ex-GST Base Rate", value: `₹${p.exGstPrice}` },
  ];

  if (p.pipeLengthMeters) {
    specifications.push({
      label: "Standard Pipe Length",
      value: `${p.pipeLengthMeters}m (${p.pipeLengthMeters === 3 ? "10ft" : p.pipeLengthMeters === 5 ? "16.5ft" : "20ft"})`,
    });
  }
  if (p.tankCapacityLiters) {
    specifications.push({ label: "Water Storage Capacity", value: `${p.tankCapacityLiters} Liters` });
    specifications.push({ label: "Layer Construction", value: `${p.tankLayers} Layers Multi-Layer Virgin Polymer` });
    if (p.isFoamInsulated) {
      specifications.push({ label: "Thermal Insulation", value: "Summer Heat-Shield Middle Foam Layer (45°C+ terrace tested)" });
    }
  }

  const highlights = [
    `Genuine Lucknow distributor direct supply with 100% batch traceability`,
    `Engineered to IS / ASTM standards with certified pressure & burst tolerance`,
    `Dispatched in under 60 minutes via ${p.deliveryVehicleType} to your construction site`,
    `Transparent ex-GST base ₹${p.exGstPrice} with full tax invoice for input credit`,
  ];
  if (p.pipeSystem === "CPVC") {
    highlights.push("Certified for continuous hot and cold water service up to 93°C without softening");
  } else if (p.tankCapacityLiters) {
    highlights.push("100% FDA food-grade virgin polymer ensures hygienic, algae-resistant drinking water");
  }

  return {
    id: `prod-cpvc-plumbing-tanks-${p.id}`,
    slug: p.id,
    name: p.title,
    title: p.title,
    brand: p.brand,
    categorySlug: "cpvc-plumbing-tanks",
    categoryName: "CPVC Plumbing & Overhead Tanks",
    subCategory: subCategoryName,
    image: p.image,
    images: [p.image],
    shortTagline: `${p.brand} ${p.nominalSize || ""} ${p.pressureClass !== "N/A" ? p.pressureClass : ""} • 60-Min Dispatch`,
    specChips,
    description: `${p.title}. Genuine factory-tested plumbing material engineered for Lucknow commercial & residential construction. ${p.spec}.`,
    highlights,
    specifications,
    variants,
    bulkPricingTiers,
    price: p.price,
    mrp: p.mrp,
    discountPercent: p.discountPct,
    unit: p.unit,
    inStock: true,
    rating: 4.8,
    reviewsCount: 120 + (p.id.length % 50),
    deliveryEta: "60 Mins",
    vendor: `${p.brand} Authorized Depot`,
    oemModelCode: p.oemModelCode,
    pipeSystem: p.pipeSystem,
    pressureClass: p.pressureClass,
    nominalSize: p.nominalSize,
    pipeLengthMeters: p.pipeLengthMeters,
    tankCapacityLiters: p.tankCapacityLiters,
    tankLayers: p.tankLayers,
    isFoamInsulated: p.isFoamInsulated,
    deliveryVehicleType: p.deliveryVehicleType,
    vehicleType: p.deliveryVehicleType,
    brandTier: p.brandTier,
    gstPercent: 18,
  };
});

// Helper to update catalogData.ts
function updateCatalogFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const startIndex = content.indexOf('{\n    "id": "prod-cpvc-plumbing-tanks-');
  if (startIndex === -1) {
    console.warn(`Could not find start of plumbing in ${filePath}`);
    return;
  }
  // Find where UltraTech cement starts
  const endIndex = content.indexOf('{\n    "id": "prod-cement-civil-works-ultra-wp"');
  if (endIndex === -1) {
    console.warn(`Could not find end marker in ${filePath}`);
    return;
  }

  const replacementJson = iProducts
    .map((prod) => JSON.stringify(prod, null, 4))
    .join(",\n  ") + ",\n  ";

  const newContent = content.slice(0, startIndex) + replacementJson + content.slice(endIndex);
  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`Updated ${filePath} with ${iProducts.length} plumbing products.`);
}

updateCatalogFile(path.join(rootDir, "lib/db/src/catalogData.ts"));
updateCatalogFile(path.join(rootDir, "artifacts/conon/src/data/catalogData.ts"));

// Update FALLBACK_MATERIALS in artifacts/api-server/src/routes/materials.ts
const materialsPath = path.join(rootDir, "artifacts/api-server/src/routes/materials.ts");
let matContent = fs.readFileSync(materialsPath, "utf8");
if (!matContent.includes("astral-cpvc-pro-15mm-sdr11-3m")) {
  const fallbackPlumbing = products.map((p) => ({
    id: p.id,
    name: p.title,
    category: "plumbing",
    stage: "finishing",
    price: p.price,
    unit: p.unit,
    description: `${p.spec} - ${p.brand} ${p.oemModelCode}`,
    inStock: true,
    imageUrl: p.image,
    vendor: `${p.brand} Authorized Depot`,
    deliveryTime: 60,
  }));

  const marker = "const FALLBACK_MATERIALS = [";
  const idx = matContent.indexOf(marker);
  if (idx !== -1) {
    const insertPos = idx + marker.length;
    const jsonToInsert = "\n" + fallbackPlumbing.map((m) => `  ${JSON.stringify(m, null, 2)},`).join("\n");
    matContent = matContent.slice(0, insertPos) + jsonToInsert + matContent.slice(insertPos);
    fs.writeFileSync(materialsPath, matContent, "utf8");
    console.log(`Inserted ${fallbackPlumbing.length} plumbing fallback materials into materials.ts`);
  }
}

// Update auditedMaterials in scripts/src/seed-local-db.ts
const seedPath = path.join(rootDir, "scripts/src/seed-local-db.ts");
let seedContent = fs.readFileSync(seedPath, "utf8");
if (!seedContent.includes("astral-cpvc-pro-15mm-sdr11-3m")) {
  const seedItems = products.map((p) => ({
    externalId: p.id,
    name: p.title,
    category: "plumbing",
    stage: "finishing",
    price: p.price,
    unit: p.unit,
    description: `${p.spec} - ${p.brand} ${p.oemModelCode}`,
    vendor: `${p.brand} Authorized Depot`,
  }));

  const marker = "const auditedMaterials = [";
  const idx = seedContent.indexOf(marker);
  if (idx !== -1) {
    const insertPos = idx + marker.length;
    const jsonToInsert = "\n" + seedItems.map((m) => `  ${JSON.stringify(m)},`).join("\n");
    seedContent = seedContent.slice(0, insertPos) + jsonToInsert + seedContent.slice(insertPos);
    fs.writeFileSync(seedPath, seedContent, "utf8");
    console.log(`Inserted ${seedItems.length} demo materials into seed-local-db.ts`);
  }
}
