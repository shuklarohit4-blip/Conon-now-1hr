import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const jsonPath = path.join(rootDir, "scratch/all_37_masonry_products.json");
const masonryProducts: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

console.log(`Loaded ${masonryProducts.length} masonry products from ${jsonPath}`);

// 1. Definition for Category
const newCategory = {
  catId: 19,
  slug: "bricks-sand-gitti-aac",
  title: "Bricks, Sand (Morang), Gitti & AAC Blocks",
  department: "Civil & Structural",
  image: "/images/home-categories/eeta.webp",
  dbCategory: "bricks",
  route: "/collections/bricks-sand-gitti-aac",
  badge: "Lucknow Bhatta & Crusher Direct",
  subcategories: [
    { name: "Red Clay & Fly Ash Bricks", slug: "red-clay-fly-ash-bricks", itemCount: 6 },
    { name: "AAC & Concrete Blocks", slug: "aac-concrete-blocks", itemCount: 15 },
    { name: "Sand, Morang & Stone Dust", slug: "sand-morang-stone-dust", itemCount: 7 },
    { name: "Stone Aggregates (Gitti)", slug: "stone-aggregates-gitti", itemCount: 6 },
    { name: "Paver Blocks & Concrete Cover Blocks", slug: "paver-blocks-cover-blocks", itemCount: 3 }
  ]
};

// 2. Patch catalogData.ts (both in lib/db and in artifacts/conon)
const catalogFiles = [
  path.join(rootDir, "lib/db/src/catalogData.ts"),
  path.join(rootDir, "artifacts/conon/src/data/catalogData.ts")
];

for (const catFile of catalogFiles) {
  if (!fs.existsSync(catFile)) continue;
  let content = fs.readFileSync(catFile, "utf-8");

  // Check if category already present
  if (!content.includes('"slug": "bricks-sand-gitti-aac"')) {
    // Insert before closing bracket of CATALOG_CATEGORIES
    const catMarker = "export const CATALOG_PRODUCTS: IProduct[] = [";
    const catEndIdx = content.indexOf(catMarker);
    if (catEndIdx !== -1) {
      // Find the last "]" before catMarker
      const lastBracketIdx = content.lastIndexOf("];", catEndIdx);
      if (lastBracketIdx !== -1) {
        const catJson = JSON.stringify(newCategory, null, 4);
        content =
          content.slice(0, lastBracketIdx) +
          ",\n  " +
          catJson.replace(/\n/g, "\n  ") +
          "\n" +
          content.slice(lastBracketIdx);
        console.log(`✓ Inserted category into ${path.basename(path.dirname(catFile))}/catalogData.ts`);
      }
    }
  }

  // Check if products already present
  if (!content.includes(masonryProducts[0].slug)) {
    // Find the end of CATALOG_PRODUCTS: "export const getProductsByCategory"
    const fnMarker = "export const getProductsByCategory =";
    const fnIdx = content.indexOf(fnMarker);
    if (fnIdx !== -1) {
      const lastArrayBracket = content.lastIndexOf("];", fnIdx);
      if (lastArrayBracket !== -1) {
        const prodsJson = masonryProducts
          .map((p) => "  " + JSON.stringify(p, null, 2).replace(/\n/g, "\n  "))
          .join(",\n");
        content =
          content.slice(0, lastArrayBracket) +
          ",\n" +
          prodsJson +
          "\n" +
          content.slice(lastArrayBracket);
        console.log(`✓ Appended ${masonryProducts.length} products into ${path.basename(path.dirname(catFile))}/catalogData.ts`);
      }
    }
  }

  fs.writeFileSync(catFile, content, "utf-8");
}

// 3. Patch seed-local-db.ts
const seedFile = path.join(rootDir, "scripts/src/seed-local-db.ts");
if (fs.existsSync(seedFile)) {
  let seedContent = fs.readFileSync(seedFile, "utf-8");
  if (!seedContent.includes(masonryProducts[0].slug)) {
    // Convert to auditedMaterials format
    const newSeedRows = masonryProducts.map((p) => {
      let stage = "foundation";
      let cat = "bricks";
      if (p.masonrySubcategory === "SAND_MORANG") {
        cat = "sand";
        stage = "foundation";
      } else if (p.masonrySubcategory === "GITTI_AGGREGATES") {
        cat = "aggregate";
        stage = "foundation";
      } else if (p.masonrySubcategory === "AAC_CONCRETE_BLOCKS") {
        cat = "blocks";
        stage = "structure";
      } else if (p.masonrySubcategory === "PAVERS_COVER_BLOCKS") {
        cat = "precast";
        stage = "finishing";
      }
      return `  {"externalId": "${p.slug}", "name": "${p.name.replace(/"/g, '\\"')}", "category": "${cat}", "stage": "${stage}", "price": ${p.price}, "unit": "${p.unit}", "description": "${p.dimensionsLabel || p.unit} • HSN ${p.hsnCode} • ${p.gstPercent}% GST • ${p.deliveryVehicleType}", "vendor": "${p.vendor}"}`;
    });

    const marker = "];\n\nawait connectDatabase();";
    const idx = seedContent.indexOf(marker);
    if (idx !== -1) {
      seedContent =
        seedContent.slice(0, idx) +
        ",\n" +
        newSeedRows.join(",\n") +
        "\n" +
        seedContent.slice(idx);
      fs.writeFileSync(seedFile, seedContent, "utf-8");
      console.log(`✓ Added ${newSeedRows.length} items to scripts/src/seed-local-db.ts`);
    }
  }
}

// 4. Patch homeCategories.ts
const homeCatFile = path.join(rootDir, "artifacts/conon/src/data/homeCategories.ts");
if (fs.existsSync(homeCatFile)) {
  let homeCatContent = fs.readFileSync(homeCatFile, "utf-8");

  // Ensure department has bricks-sand-gitti-aac
  if (!homeCatContent.includes('"bricks-sand-gitti-aac"')) {
    // Add to civil-interiors categorySlugs
    homeCatContent = homeCatContent.replace(
      '"waterproofing-repairing",',
      '"waterproofing-repairing",\n      "bricks-sand-gitti-aac",'
    );

    // Add category object before closing bracket of HOME_CATEGORIES
    const lastBracketIdx = homeCatContent.lastIndexOf("];");
    if (lastBracketIdx !== -1) {
      const homeCatEntry = `  {
    id: 19,
    slug: "bricks-sand-gitti-aac",
    title: "Bricks, Sand (Morang), Gitti & AAC Blocks",
    department: "Civil & Structural",
    image: "/images/home-categories/eeta.webp",
    dbCategory: "bricks",
    route: "/collections/bricks-sand-gitti-aac",
    badge: "Bhatta & Crusher Direct",
    subcategories: [
      { name: "Red Clay & Fly Ash Bricks", slug: "red-clay-fly-ash-bricks", itemCount: 6 },
      { name: "AAC & Concrete Blocks", slug: "aac-concrete-blocks", itemCount: 15 },
      { name: "Sand, Morang & Stone Dust", slug: "sand-morang-stone-dust", itemCount: 7 },
      { name: "Stone Aggregates (Gitti)", slug: "stone-aggregates-gitti", itemCount: 6 },
      { name: "Paver Blocks & Concrete Cover Blocks", slug: "paver-blocks-cover-blocks", itemCount: 3 },
    ],
  },\n`;
      homeCatContent =
        homeCatContent.slice(0, lastBracketIdx) +
        homeCatEntry +
        homeCatContent.slice(lastBracketIdx);
      fs.writeFileSync(homeCatFile, homeCatContent, "utf-8");
      console.log(`✓ Added category to artifacts/conon/src/data/homeCategories.ts`);
    }
  }
}

console.log("🎉 All catalog files and seed sources patched successfully!");
