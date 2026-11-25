import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_38_KITCHEN_PRODUCTS } from "../artifacts/conon/src/data/kitchenSinksData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const catalogFiles = [
  path.join(rootDir, "artifacts/conon/src/data/catalogData.ts"),
  path.join(rootDir, "lib/db/src/catalogData.ts"),
];

const NEW_SUBCATEGORIES = [
  {
    name: "SS Pressed Sinks",
    slug: "ss-pressed-sinks",
    itemCount: 9,
  },
  {
    name: "Handmade SS Sinks",
    slug: "handmade-ss-sinks",
    itemCount: 6,
  },
  {
    name: "Quartz Sinks",
    slug: "quartz-sinks",
    itemCount: 4,
  },
  {
    name: "Kitchen Sink Cocks",
    slug: "kitchen-sink-cocks",
    itemCount: 11,
  },
  {
    name: "Sink Mixers & Pull-Out Faucets",
    slug: "sink-mixers-pullout",
    itemCount: 4,
  },
  {
    name: "Sink Accessories & RO Add-Ons",
    slug: "sink-accessories-ro",
    itemCount: 4,
  },
];

function patchCatalogFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");

  // 1. Replace subcategories for kitchen-sinks-faucets
  const subcatAnchorStart = '"slug": "kitchen-sinks-faucets",';
  const subcatAnchorEnd = ',\n  {\n    "catId": 8,';

  const startSubcatIdx = content.indexOf(subcatAnchorStart);
  const endSubcatIdx = content.indexOf(subcatAnchorEnd, startSubcatIdx);

  if (startSubcatIdx !== -1 && endSubcatIdx !== -1) {
    const formattedSubcats =
      JSON.stringify(NEW_SUBCATEGORIES, null, 6)
        .split("\n")
        .map((l, i) => (i === 0 ? l : "    " + l))
        .join("\n");

    const categoryPrefix = content.substring(startSubcatIdx, content.indexOf('"subcategories": [', startSubcatIdx));
    const newCategoryBlock =
      categoryPrefix +
      `"subcategories": ${formattedSubcats}\n  }`;

    content = content.substring(0, startSubcatIdx) + newCategoryBlock + content.substring(endSubcatIdx);
    console.log(`✓ Replaced category subcategories in ${filePath}`);
  } else {
    console.warn(`Could not find category block in ${filePath}`);
  }

  // 2. Replace legacy products with ALL_38_KITCHEN_PRODUCTS
  const prodStartAnchor = '  {\n    "id": "prod-kitchen-sinks-faucets-futura-dura",';
  const prodEndAnchor = '  {\n    "id": "prod-furniture-wardrobe-bed-hardware-ebco-drawer-slide",';

  const startProdIdx = content.indexOf(prodStartAnchor);
  const endProdIdx = content.indexOf(prodEndAnchor);

  if (startProdIdx !== -1 && endProdIdx !== -1) {
    const formattedProducts = ALL_38_KITCHEN_PRODUCTS.map((prod) =>
      JSON.stringify(prod, null, 2)
        .split("\n")
        .map((l) => "  " + l)
        .join("\n")
    ).join(",\n") + ",\n";

    content = content.substring(0, startProdIdx) + formattedProducts + content.substring(endProdIdx);
    console.log(`✓ Replaced legacy kitchen sink products with all 38 verified SKUs in ${filePath}`);
  } else {
    console.warn(`Could not find products anchor in ${filePath} (start: ${startProdIdx}, end: ${endProdIdx})`);
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✓ Saved ${filePath}`);
}

for (const f of catalogFiles) {
  patchCatalogFile(f);
}

// 3. Update homeCategories.ts
const homeCategoriesPath = path.join(rootDir, "artifacts/conon/src/data/homeCategories.ts");
if (fs.existsSync(homeCategoriesPath)) {
  let homeContent = fs.readFileSync(homeCategoriesPath, "utf-8");
  const homeSubcatRegex = /slug:\s*"kitchen-sinks-faucets",[\s\S]*?subcategories:\s*\[([\s\S]*?)\]\s*,/;
  const homeMatch = homeContent.match(homeSubcatRegex);
  if (homeMatch) {
    const formattedSubcats =
      `subcategories: [\n` +
      NEW_SUBCATEGORIES.map(
        (sc) => `      { name: "${sc.name}", slug: "${sc.slug}", itemCount: ${sc.itemCount} },`
      ).join("\n") +
      `\n    ],`;
    const replacement = homeMatch[0].replace(/subcategories:\s*\[[\s\S]*?\]\s*,/, formattedSubcats);
    homeContent = homeContent.replace(homeMatch[0], replacement);
    fs.writeFileSync(homeCategoriesPath, homeContent, "utf-8");
    console.log(`✓ Updated homeCategories.ts with new subcategories!`);
  }
}
