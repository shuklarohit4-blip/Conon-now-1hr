import * as fs from "fs";
import * as path from "path";
import { homeAppliancesProducts } from "../artifacts/conon/src/data/homeAppliancesData";

const rootDir = process.cwd().endsWith("scripts") ? path.resolve(process.cwd(), "..") : process.cwd();

const filesToUpdate = [
  path.join(rootDir, "artifacts/conon/src/data/catalogData.ts"),
  path.join(rootDir, "lib/db/src/catalogData.ts"),
];

const newProductsJson = homeAppliancesProducts
  .map((prod) => {
    const json = JSON.stringify(prod, null, 2);
    return json
      .split("\n")
      .map((line) => "  " + line)
      .join("\n");
  })
  .join(",\n");

for (const filepath of filesToUpdate) {
  let content = fs.readFileSync(filepath, "utf-8");

  // 1. Update CATALOG_CATEGORIES for home-appliances
  const catSlugMarker = '"slug": "home-appliances"';
  const catIdx = content.indexOf(catSlugMarker);
  if (catIdx !== -1) {
    const subcatsStart = content.indexOf('"subcategories": [', catIdx);
    if (subcatsStart !== -1) {
      const subcatsEnd = content.indexOf("]", subcatsStart) + 1;
      const updatedSubcategories = `"subcategories": [
      {
        "name": "Water Heaters & Geysers",
        "slug": "water-heaters-geysers",
        "itemCount": 7
      },
      {
        "name": "Modular Kitchen Chimneys",
        "slug": "modular-kitchen-chimneys",
        "itemCount": 4
      },
      {
        "name": "Exhaust & Ventilation Fans",
        "slug": "exhaust-ventilation-fans",
        "itemCount": 4
      },
      {
        "name": "Desert Air Coolers",
        "slug": "desert-air-coolers",
        "itemCount": 2
      },
      {
        "name": "Inverters & Tubular Batteries",
        "slug": "inverters-tubular-batteries",
        "itemCount": 2
      }
    ]`;
      content = content.slice(0, subcatsStart) + updatedSubcategories + content.slice(subcatsEnd);
      console.log(`Updated subcategories for home-appliances in ${filepath}`);
    }
  }

  // 2. Replace legacy or existing home appliances products
  let startMarker = '"slug": "crompton-instabliss-3l-3000w-instant-geyser"';
  let startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    startMarker = '"id": "prod-home-appliances-cromp-geyser"';
    startIdx = content.indexOf(startMarker);
  }
  if (startIdx === -1) {
    console.error(`Start marker not found in ${filepath}`);
    continue;
  }

  const openBrace = content.lastIndexOf("  {", startIdx);
  const endMarker = '"id": "prod-lighting-wipro-round"';
  const endIdx = content.indexOf(endMarker);
  if (endIdx === -1) {
    console.error(`End marker not found in ${filepath}`);
    continue;
  }

  const prevItemCloseBrace = content.lastIndexOf("  },\n", endIdx);
  const replaceEnd = prevItemCloseBrace + 5; // up to and including '  },\n'

  const before = content.slice(0, openBrace);
  const after = content.slice(replaceEnd);

  const updatedContent = before + newProductsJson + ",\n" + after;
  fs.writeFileSync(filepath, updatedContent, "utf-8");
  console.log(`Successfully injected 19 Home Appliances products into ${filepath}`);
}
