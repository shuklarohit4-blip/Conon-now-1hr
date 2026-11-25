import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_45_ADHESIVES_PRODUCTS } from "../artifacts/conon/src/data/adhesivesData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const catalogFiles = [
  path.join(rootDir, "artifacts/conon/src/data/catalogData.ts"),
  path.join(rootDir, "lib/db/src/catalogData.ts"),
];

const NEW_SUBCATEGORIES = [
  {
    name: "Wood & Laminate Adhesives",
    slug: "wood-laminate-adhesives",
    itemCount: 20,
  },
  {
    name: "Contact & Rubber Adhesives",
    slug: "contact-rubber-adhesives",
    itemCount: 3,
  },
  {
    name: "Epoxy, Putty & Instant Repair",
    slug: "epoxy-putty-instant-repair",
    itemCount: 10,
  },
  {
    name: "Silicone, PU Sealants & Foam",
    slug: "silicone-pu-sealants-foam",
    itemCount: 8,
  },
  {
    name: "Applicator Guns & Masking Tapes",
    slug: "applicator-guns-masking-tapes",
    itemCount: 4,
  },
];

function patchCatalogFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");

  // 1. Replace subcategories for fevicol-adhesives-sealants
  const subcatAnchorStart = '"slug": "fevicol-adhesives-sealants",';
  const subcatAnchorEnd = ',\n  {\n    "catId": 6,';

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

    const oldBlock = content.substring(startSubcatIdx, endSubcatIdx);
    content = content.substring(0, startSubcatIdx) + newCategoryBlock + content.substring(endSubcatIdx);
    console.log(`✓ Replaced category subcategories in ${filePath}`);
  } else {
    console.warn(`Could not find category block in ${filePath}`);
  }

  // 2. Replace legacy products with ALL_45_ADHESIVES_PRODUCTS
  const prodStartAnchor = '  {\n    "id": "prod-fevicol-adhesives-sealants-fev-sh",';
  const prodEndAnchor = '  {\n    "id": "prod-wires-mcb-electrical-poly-maxima",';

  const startProdIdx = content.indexOf(prodStartAnchor);
  const endProdIdx = content.indexOf(prodEndAnchor);

  if (startProdIdx !== -1 && endProdIdx !== -1) {
    const formattedProducts = ALL_45_ADHESIVES_PRODUCTS.map((prod) =>
      JSON.stringify(prod, null, 2)
        .split("\n")
        .map((l) => "  " + l)
        .join("\n")
    ).join(",\n") + ",\n";

    content = content.substring(0, startProdIdx) + formattedProducts + content.substring(endProdIdx);
    console.log(`✓ Replaced legacy adhesive products with all 45 verified SKUs in ${filePath}`);
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
  const homeSubcatRegex = /slug:\s*"fevicol-adhesives-sealants",[\s\S]*?subcategories:\s*\[([\s\S]*?)\]\s*,/;
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
