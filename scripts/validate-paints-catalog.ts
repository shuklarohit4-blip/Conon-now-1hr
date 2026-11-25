import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================================");
console.log("   CONON-NOW: PAINTS, PUTTY & PRIMER CATALOG VALIDATION SUITE    ");
console.log("==================================================================");

let totalErrors = 0;
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    totalErrors++;
  } else {
    console.log(`✓ PASS: ${msg}`);
  }
}

// 1. Load files
const catalogFrontendPath = path.join(rootDir, "artifacts/conon/src/data/catalogData.ts");
const catalogBackendPath = path.join(rootDir, "lib/db/src/catalogData.ts");
const jsonScratchPath = path.join(rootDir, "scratch/all_48_paints_products.json");
const publicImgDir = path.join(rootDir, "artifacts/conon/public/images/products/paints-putty-primer");

assert(fs.existsSync(catalogFrontendPath), "Frontend catalogData.ts exists");
assert(fs.existsSync(catalogBackendPath), "Backend catalogData.ts exists");
assert(fs.existsSync(jsonScratchPath), "Scratch all_48_paints_products.json exists");
assert(fs.existsSync(publicImgDir), "Public paints image directory exists");

const products: any[] = JSON.parse(fs.readFileSync(jsonScratchPath, "utf-8"));

// 2. Count verification
assert(products.length === 48, `Catalog has exactly 48 verified products (got ${products.length})`);

// 3. Subcategory verification
const subcatCounts: Record<string, number> = {};
products.forEach((p) => {
  subcatCounts[p.subCategory] = (subcatCounts[p.subCategory] || 0) + 1;
});

assert(subcatCounts["Wall Putty"] === 8, `Wall Putty has 8 SKUs (got ${subcatCounts["Wall Putty"]})`);
assert(subcatCounts["Wall & Metal Primers"] === 8, `Wall & Metal Primers has 8 SKUs (got ${subcatCounts["Wall & Metal Primers"]})`);
assert(subcatCounts["Interior Paints & Distempers"] === 14, `Interior Paints & Distempers has 14 SKUs (got ${subcatCounts["Interior Paints & Distempers"]})`);
assert(subcatCounts["Exterior Paints"] === 10, `Exterior Paints has 10 SKUs (got ${subcatCounts["Exterior Paints"]})`);
assert(subcatCounts["Enamels, Thinners & Painting Tools"] === 8, `Enamels, Thinners & Painting Tools has 8 SKUs (got ${subcatCounts["Enamels, Thinners & Painting Tools"]})`);

// 4. GST 2.0 Compliance (18% Flat Rate across all 48 SKUs)
const non18Gst = products.filter((p) => p.gstPercent !== 18);
assert(non18Gst.length === 0, `100% of SKUs are at 18% GST (found ${non18Gst.length} non-compliant)`);

const legacy28Gst = products.filter((p) => p.gstPercent === 28);
assert(legacy28Gst.length === 0, `Zero SKUs at legacy 28% GST (found ${legacy28Gst.length})`);

// 5. Exact HSN Code Validation
for (const p of products) {
  if (p.paintSubcategory === "WALL_PUTTY") {
    assert(p.hsnCode === "3214", `Putty ${p.name} has HSN 3214 (got ${p.hsnCode})`);
  } else if (p.paintSubcategory === "PRIMER") {
    if (p.slug.includes("red-oxide")) {
      assert(p.hsnCode === "3208", `Red Oxide Primer ${p.name} has HSN 3208 (got ${p.hsnCode})`);
    } else {
      assert(p.hsnCode === "3209", `Water Primer ${p.name} has HSN 3209 (got ${p.hsnCode})`);
    }
  } else if (p.paintSubcategory === "INTERIOR_PAINT") {
    if (p.slug.includes("distemper")) {
      assert(p.hsnCode === "3210", `Distemper ${p.name} has HSN 3210 (got ${p.hsnCode})`);
    } else {
      assert(p.hsnCode === "3209", `Interior Emulsion ${p.name} has HSN 3209 (got ${p.hsnCode})`);
    }
  } else if (p.paintSubcategory === "EXTERIOR_PAINT") {
    assert(p.hsnCode === "3209", `Exterior Paint ${p.name} has HSN 3209 (got ${p.hsnCode})`);
  } else if (p.paintSubcategory === "ENAMEL_AND_TOOLS") {
    if (p.slug.includes("enamel")) {
      assert(p.hsnCode === "3208", `Enamel ${p.name} has HSN 3208 (got ${p.hsnCode})`);
    } else if (p.slug.includes("roller") || p.slug.includes("brush")) {
      assert(p.hsnCode === "9603", `Tool ${p.name} has HSN 9603 (got ${p.hsnCode})`);
    } else if (p.slug.includes("thinner")) {
      assert(p.hsnCode === "3814", `Thinner ${p.name} has HSN 3814 (got ${p.hsnCode})`);
    } else if (p.slug.includes("sandpaper")) {
      assert(p.hsnCode === "6805", `Sandpaper ${p.name} has HSN 6805 (got ${p.hsnCode})`);
    }
  }
}

// 6. Volume Discount Sanity Check (20L rate/L < 4L rate/L and 40kg rate/kg < 20kg rate/kg)
const volumePairs = [
  // [20L slug, 4L slug, Line Name]
  ["asian-paints-tractor-emulsion-white-20l", "asian-paints-tractor-emulsion-white-4l", "Asian Paints Tractor Emulsion"],
  ["asian-paints-apcolite-premium-emulsion-white-20l", "asian-paints-apcolite-premium-emulsion-white-4l", "Asian Paints Apcolite Emulsion"],
  ["asian-paints-royale-luxury-emulsion-base-white-20l", "asian-paints-royale-luxury-emulsion-base-white-4l", "Asian Paints Royale Luxury"],
  ["asian-paints-trucare-interior-primer-20l", "asian-paints-trucare-interior-primer-4l", "Asian Paints TruCare Interior Primer"],
  ["asian-paints-trucare-exterior-primer-20l", "asian-paints-trucare-exterior-primer-4l", "Asian Paints TruCare Exterior Primer"],
  ["berger-bp-white-wall-primer-20l", "berger-bp-white-wall-primer-4l", "Berger BP White Primer"],
  ["berger-easy-clean-fresh-interior-20l", "berger-easy-clean-washable-interior-4l", "Berger Easy Clean"],
  ["asian-paints-ace-exterior-emulsion-white-20l", "asian-paints-ace-exterior-emulsion-white-4l", "Asian Paints Ace Exterior"],
  ["asian-paints-apex-weatherproof-exterior-20l", "asian-paints-apex-weatherproof-exterior-4l", "Asian Paints Apex Weatherproof"],
  ["asian-paints-apex-ultima-exterior-base-white-20l", "asian-paints-apex-ultima-exterior-base-white-4l", "Asian Paints Apex Ultima"],
  ["berger-weathercoat-anti-dustt-exterior-20l", "berger-weathercoat-anti-dustt-exterior-4l", "Berger WeatherCoat Anti Dustt"],
  ["asian-paints-apcolite-premium-gloss-enamel-4l", "asian-paints-apcolite-premium-gloss-enamel-1l", "Asian Paints Apcolite Enamel (4L vs 1L)"],
  ["berger-luxol-hi-gloss-enamel-4l", "berger-luxol-hi-gloss-enamel-1l", "Berger Luxol Enamel (4L vs 1L)"],
];

for (const [slug20, slug4, lineName] of volumePairs) {
  const p20 = products.find((p) => p.slug === slug20);
  const p4 = products.find((p) => p.slug === slug4);
  assert(!!p20 && !!p4, `Found pair items for ${lineName}`);
  if (p20 && p4) {
    const rate20 = p20.effectiveUnitRate;
    const rate4 = p4.effectiveUnitRate;
    assert(rate20 < rate4, `Volume economy verified for ${lineName}: bulk (₹${rate20}/L) < retail (₹${rate4}/L)`);
  }
}

// Putty weight volume sanity (40kg vs 20kg)
const puttyPairs = [
  ["birla-white-wallcare-putty-40kg", "birla-white-wallcare-putty-20kg", "Birla White WallCare"],
  ["jk-cement-wallmaxx-putty-40kg", "jk-cement-wallmaxx-putty-20kg", "JK Cement WallMaxX"],
];

for (const [slug40, slug20, lineName] of puttyPairs) {
  const p40 = products.find((p) => p.slug === slug40);
  const p20 = products.find((p) => p.slug === slug20);
  assert(!!p40 && !!p20, `Found putty pair items for ${lineName}`);
  if (p40 && p20) {
    assert(p40.effectiveUnitRate < p20.effectiveUnitRate, `Putty 40kg economy verified for ${lineName}: 40kg (₹${p40.effectiveUnitRate}/kg) < 20kg (₹${p20.effectiveUnitRate}/kg)`);
  }
}

// 7. Delivery Vehicle Routing
for (const p of products) {
  if (p.packSizeUnit === "L" && p.packSizeValue === 20) {
    assert(p.deliveryVehicleType === "E-Loader", `20L Paint Bucket ${p.name} routed to E-Loader`);
  } else if (p.packSizeUnit === "kg" && p.packSizeValue === 20) {
    assert(p.deliveryVehicleType === "E-Loader", `20kg Pack ${p.name} routed to E-Loader`);
  } else if (p.packSizeUnit === "kg" && p.packSizeValue === 40) {
    assert(p.deliveryVehicleType === "E-Loader / Pickup", `40kg Sack ${p.name} routed to E-Loader / Pickup`);
  } else if (p.packSizeUnit === "L" && (p.packSizeValue === 1 || p.packSizeValue === 4)) {
    assert(p.deliveryVehicleType === "2-Wheeler", `Small Tin/Can ${p.name} routed to 2-Wheeler`);
  } else if (p.packSizeUnit === "pc" || p.packSizeUnit === "pcs") {
    assert(p.deliveryVehicleType === "2-Wheeler", `Tool ${p.name} routed to 2-Wheeler`);
  }
}

// 8. Image Assets on Disk
for (const p of products) {
  assert(p.image.startsWith("/images/products/paints-putty-primer/"), `Image path format valid for ${p.slug}`);
  const diskPath = path.join(rootDir, "artifacts/conon/public", p.image);
  assert(fs.existsSync(diskPath), `Packshot exists on disk: ${p.image}`);
  if (fs.existsSync(diskPath)) {
    const stats = fs.statSync(diskPath);
    assert(stats.size > 1000, `Image file size is non-empty (${stats.size} bytes) for ${p.slug}`);
  }
}

// 9. Sync check with catalogData.ts
const catContent = fs.readFileSync(catalogFrontendPath, "utf-8");
const dbCatContent = fs.readFileSync(catalogBackendPath, "utf-8");

for (const p of products) {
  assert(catContent.includes(`"${p.id}"`), `Frontend catalogData contains product ID ${p.id}`);
  assert(dbCatContent.includes(`"${p.id}"`), `Backend catalogData contains product ID ${p.id}`);
}

console.log("==================================================================");
if (totalErrors === 0) {
  console.log("🎉 ALL VALIDATION CHECKS PASSED PERFECTLY WITH ZERO ERRORS!");
} else {
  console.error(`💥 VALIDATION FAILED WITH ${totalErrors} ERRORS!`);
  process.exit(1);
}
console.log("==================================================================");
