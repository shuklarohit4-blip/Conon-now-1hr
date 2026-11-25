import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_9_TOOLS_SAFETY_PRODUCTS } from "../artifacts/conon/src/data/toolsSafetyData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const catalogFiles = [
  path.join(rootDir, "artifacts/conon/src/data/catalogData.ts"),
  path.join(rootDir, "lib/db/src/catalogData.ts"),
];

const CATEGORY_OBJECT = {
  catId: 20,
  slug: "power-tools-safety",
  title: "Power Tools, Hand Tools & Site Safety",
  department: "Tools",
  image: "/images/products/power-tools-safety/bosch-gws-600-angle-grinder-4-inch-670w.webp",
  dbCategory: "tools",
  route: "/collections/power-tools-safety",
  badge: "60-Min Express · 2-Wheeler",
  subcategories: [
    {
      name: "Power Tools",
      slug: "power-tools",
      itemCount: 3,
    },
    {
      name: "Hand & Measuring Tools",
      slug: "hand-measuring-tools",
      itemCount: 2,
    },
    {
      name: "Site Safety & PPE",
      slug: "site-safety-ppe",
      itemCount: 4,
    },
  ],
};

function patchCatalogFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");

  // 1. Check if category exists
  if (!content.includes('"slug": "power-tools-safety"')) {
    console.log(`Injecting category into ${filePath}...`);
    const catMarker = "export const CATALOG_PRODUCTS: IProduct[] = [";
    const catMarkerIdx = content.indexOf(catMarker);
    if (catMarkerIdx !== -1) {
      // Find the last "];\n\n" before catMarker
      const arrayCloseIdx = content.lastIndexOf("];", catMarkerIdx);
      if (arrayCloseIdx !== -1) {
        const categoryJson = ",\n  " + JSON.stringify(CATEGORY_OBJECT, null, 2)
          .split("\n")
          .map((l, i) => (i === 0 ? l : "  " + l))
          .join("\n") + "\n";
        content = content.slice(0, arrayCloseIdx) + categoryJson + content.slice(arrayCloseIdx);
        console.log(`✓ Successfully injected power-tools-safety category into ${filePath}`);
      }
    }
  } else {
    console.log(`Category power-tools-safety already present in ${filePath}`);
  }

  // 2. Check if products exist
  const missingProds = ALL_9_TOOLS_SAFETY_PRODUCTS.filter(p => !content.includes(`"id": "${p.id}"`));
  if (missingProds.length > 0) {
    const prodMarker = "];\n\nexport const getProductsByCategory";
    const prodMarkerIdx = content.indexOf(prodMarker);
    if (prodMarkerIdx !== -1) {
      const prodsJson = ",\n" + missingProds.map(prod => 
        JSON.stringify(prod, null, 2).split("\n").map(l => "  " + l).join("\n")
      ).join(",\n");
      content = content.slice(0, prodMarkerIdx) + prodsJson + "\n" + content.slice(prodMarkerIdx);
      console.log(`✓ Injected ${missingProds.length} tools & safety products into ${filePath}`);
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Saved ${filePath}`);
}

for (const f of catalogFiles) {
  patchCatalogFile(f);
}

// 3. Update homeCategories.ts
const homeCategoriesPath = path.join(rootDir, "artifacts/conon/src/data/homeCategories.ts");
if (fs.existsSync(homeCategoriesPath)) {
  let homeContent = fs.readFileSync(homeCategoriesPath, "utf-8");
  if (!homeContent.includes('"power-tools-safety"')) {
    // Add to HOME_DEPARTMENTS "tools"
    homeContent = homeContent.replace(
      'categorySlugs: [\n      "tools-hardware",\n      "safety-workwear",\n    ]',
      'categorySlugs: [\n      "power-tools-safety",\n      "tools-hardware",\n      "safety-workwear",\n    ]'
    );
    // Add to HOME_CATEGORIES
    const homeCatEndIdx = homeContent.lastIndexOf("];");
    if (homeCatEndIdx !== -1) {
      const homeCatEntry = ",\n" + JSON.stringify({
        id: 20,
        slug: "power-tools-safety",
        title: "Power Tools, Hand Tools & Site Safety",
        department: "Tools",
        image: "/images/products/power-tools-safety/bosch-gws-600-angle-grinder-4-inch-670w.webp",
        dbCategory: "tools",
        route: "/collections/power-tools-safety",
        badge: "60-Min Express · 2-Wheeler",
        subcategories: [
          { name: "Power Tools", slug: "power-tools", itemCount: 3 },
          { name: "Hand & Measuring Tools", slug: "hand-measuring-tools", itemCount: 2 },
          { name: "Site Safety & PPE", slug: "site-safety-ppe", itemCount: 4 },
        ],
      }, null, 2).split("\n").map(l => "  " + l).join("\n");
      homeContent = homeContent.slice(0, homeCatEndIdx) + homeCatEntry + "\n" + homeContent.slice(homeCatEndIdx);
    }
    fs.writeFileSync(homeCategoriesPath, homeContent, "utf-8");
    console.log(`Updated homeCategories.ts with power-tools-safety`);
  }
}

console.log("Catalog injection completed successfully!");
