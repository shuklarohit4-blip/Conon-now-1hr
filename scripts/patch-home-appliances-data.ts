import fs from "fs";
import path from "path";
import { homeAppliancesProducts } from "../artifacts/conon/src/data/homeAppliancesData";

const rootDir = process.cwd().endsWith("scripts") ? path.resolve(process.cwd(), "..") : process.cwd();
const dataPath = path.join(rootDir, "artifacts/conon/src/data/homeAppliancesData.ts");

const patchedProducts = homeAppliancesProducts.map((p) => {
  const slug = p.slug;
  const id = `prod-home-appliances-${slug}`;
  const variants = [
    {
      id: `var-${slug}-default`,
      label: "Standard Unit",
      unit: p.unit || "Piece",
      price: p.price,
      mrp: p.mrp,
      discountPercent: p.discountPercent || 0,
      stock: 50,
      image: p.image,
    },
  ];

  return {
    id,
    ...p,
    variants,
  };
});

const fileHeader = `import type { IProduct } from "./catalogData";\n\nexport const homeAppliancesProducts: IProduct[] = `;
const fileContent = fileHeader + JSON.stringify(patchedProducts, null, 2) + ";\n";

fs.writeFileSync(dataPath, fileContent, "utf-8");
console.log(`Successfully patched ${patchedProducts.length} items with id and variants in ${dataPath}`);
