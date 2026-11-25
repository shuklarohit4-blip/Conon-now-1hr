import * as fs from "fs";
import * as path from "path";
import { ALL_26_DOOR_HARDWARE_PRODUCTS } from "../artifacts/conon/src/data/doorHardwareData";

const filesToUpdate = [
  path.join(process.cwd(), "artifacts/conon/src/data/catalogData.ts"),
  path.join(process.cwd(), "lib/db/src/catalogData.ts"),
];

const newProductsJson = ALL_26_DOOR_HARDWARE_PRODUCTS.map((prod) => {
  const json = JSON.stringify(prod, null, 2);
  // indent by 2 spaces
  return json.split("\n").map((line, i) => (i === 0 ? line : "  " + line)).join("\n");
}).join(",\n  ");

for (const filepath of filesToUpdate) {
  let content = fs.readFileSync(filepath, "utf-8");

  const startMarker = '"id": "prod-door-hardware-locks-godrej-tribolt"';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    console.error(`Start marker not found in ${filepath}`);
    continue;
  }

  const openBrace = content.lastIndexOf("{", startIdx);
  const endMarker = '"id": "prod-door-hardware-locks-dorset-closer"';
  const endIdx = content.indexOf(endMarker);
  if (endIdx === -1) {
    console.error(`End marker not found in ${filepath}`);
    continue;
  }

  const closeBrace = content.indexOf("\n  },", endIdx) + 4; // up to closing brace of that item

  const before = content.slice(0, openBrace);
  const after = content.slice(closeBrace);

  const updatedContent = before + newProductsJson + after;
  fs.writeFileSync(filepath, updatedContent, "utf-8");
  console.log(`Successfully injected 26 Door Hardware products into ${filepath}`);
}
