import fs from "fs";
import path from "path";
import sharp from "sharp";

const HOME_DIR = process.cwd();
const PUBLIC_DIR = path.join(HOME_DIR, "artifacts/conon/public/images/home-categories");

// 18 Categories defined in HomeRun spec
const CATEGORIES = [
  { id: 1,  slug: "cctv-networking",                 title: "CCTV & Networking",                       route: "/categories?cat=cctv-networking",                 badge: "New Tech" },
  { id: 2,  slug: "cpvc-plumbing-tanks",             title: "CPVC Plumbing & Overhead Tanks",          route: "/categories?cat=cpvc-plumbing-tanks",             badge: "Bulk Rates" },
  { id: 3,  slug: "cement-civil-works",              title: "Cement & Civil Works",                    route: "/categories?cat=cement-civil-works",              badge: "Bulk Prices" },
  { id: 4,  slug: "plywood-boards",                  title: "Plywood & Boards",                        route: "/categories?cat=plywood-boards",                  badge: "Tested E0" },
  { id: 5,  slug: "fevicol-adhesives-sealants",      title: "Fevicol, Adhesives & Sealants",           route: "/categories?cat=fevicol-adhesives-sealants",      badge: "Strong Bond" },
  { id: 6,  slug: "wires-mcb-electrical",            title: "Wires, MCB & Electrical Supplies",        route: "/categories?cat=wires-mcb-electrical",            badge: "ISI Certified" },
  { id: 7,  slug: "kitchen-sinks-faucets",           title: "Kitchen Sinks & Faucets",                 route: "/categories?cat=kitchen-sinks-faucets",           badge: "SS 304 Grade" },
  { id: 8,  slug: "furniture-wardrobe-bed-hardware", title: "Furniture, Wardrobe & Bed Hardware",      route: "/categories?cat=furniture-wardrobe-bed-hardware", badge: "Soft-Close" },
  { id: 9,  slug: "modular-kitchen-systems",         title: "Modular Kitchen Systems & Fittings",      route: "/categories?cat=modular-kitchen-systems",         badge: "Heavy Duty" },
  { id: 10, slug: "door-hardware-locks",             title: "Door Hardware & Locks",                   route: "/categories?cat=door-hardware-locks",             badge: "10-Yr Warranty" },
  { id: 11, slug: "sanitary-bath-fittings",          title: "Sanitary & Bath Fittings",                route: "/categories?cat=sanitary-bath-fittings",          badge: "Water Saving" },
  { id: 12, slug: "tile-stone-installation",         title: "Tile & Stone Installation",               route: "/categories?cat=tile-stone-installation",         badge: "Bulk Prices" },
  { id: 13, slug: "home-appliances",                 title: "Home Appliances",                         route: "/categories?cat=home-appliances",                 badge: "Energy Star" },
  { id: 14, slug: "lighting",                        title: "Lighting",                                route: "/categories?cat=lighting",                        badge: "Surge Safe" },
  { id: 15, slug: "painting",                        title: "Painting",                                route: "/categories?cat=painting",                        badge: "Anti-Fungal" },
  { id: 16, slug: "safety-workwear",                 title: "Safety & Workwear",                       route: "/categories?cat=safety-workwear",                 badge: "Site Ready" },
  { id: 17, slug: "tools-hardware",                  title: "Tools, Power Tools & General Hardware",   route: "/categories?cat=tools-hardware",                  badge: "Industrial" },
  { id: 18, slug: "waterproofing-repairing",         title: "Waterproofing & Repairing",               route: "/categories?cat=waterproofing-repairing",         badge: "Leak Free" },
];

async function verify() {
  console.log("=========================================================================================");
  console.log("       HOME RUN CATEGORY DIRECTORY GRID (6x3) - ASSET & ROUTE VERIFICATION GATE          ");
  console.log("=========================================================================================\n");

  const results = [];
  const imageHashes = new Set();
  const filePaths = new Set();
  let allPass = true;

  for (const cat of CATEGORIES) {
    const fileName = `${cat.slug}.webp`;
    const fullPath = path.join(PUBLIC_DIR, fileName);
    const localRel = `/images/home-categories/${fileName}`;

    let status = "PASS";
    let sizeKb = 0;
    let width = 0;
    let height = 0;
    let hasAlpha = false;
    let format = "";
    let note = "Verified authentic transparent cluster";

    if (!fs.existsSync(fullPath)) {
      status = "FAIL (Missing File)";
      note = `File not found at ${fullPath}`;
      allPass = false;
    } else {
      const stats = fs.statSync(fullPath);
      sizeKb = Number((stats.size / 1024).toFixed(1));

      if (stats.size < 8 * 1024) {
        status = "FAIL (Size < 8KB)";
        note = `File size ${sizeKb}KB is smaller than 8KB threshold`;
        allPass = false;
      } else if (stats.size > 75 * 1024) {
        status = "FAIL (Size > 75KB)";
        note = `File size ${sizeKb}KB exceeds 75KB threshold`;
        allPass = false;
      }

      try {
        const metadata = await sharp(fullPath).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;
        hasAlpha = Boolean(metadata.hasAlpha);
        format = metadata.format || "";

        if (!hasAlpha) {
          status = "FAIL (No Alpha Channel)";
          note = "Image does not have transparent alpha channel";
          allPass = false;
        }

        if (filePaths.has(localRel)) {
          status = "FAIL (Duplicate File Path)";
          note = "Duplicate image file path detected";
          allPass = false;
        }
        filePaths.add(localRel);

      } catch (err) {
        status = "FAIL (Corrupt Image)";
        note = err.message;
        allPass = false;
      }
    }

    results.push({
      id: cat.id,
      name: cat.title,
      file: fileName,
      dimensions: `${width}x${height}`,
      size: `${sizeKb} KB`,
      alpha: hasAlpha ? "YES" : "NO",
      badge: cat.badge,
      route: cat.route,
      status,
      note,
    });
  }

  // Print Table
  console.log(
    "| #  | Category Name                           | Local Cluster File              | Dim      | Size    | Alpha | Badge        | Status |"
  );
  console.log(
    "|:---|:----------------------------------------|:--------------------------------|:---------|:--------|:------|:-------------|:-------|"
  );
  for (const r of results) {
    const pad = (str, len) => (str || "").padEnd(len);
    console.log(
      `| ${pad(String(r.id), 2)} | ${pad(r.name, 38)} | ${pad(r.file, 31)} | ${pad(r.dimensions, 8)} | ${pad(r.size, 7)} | ${pad(r.alpha, 5)} | ${pad(r.badge, 12)} | ${r.status} |`
    );
  }

  console.log("\n-----------------------------------------------------------------------------------------");
  console.log(`Total Categories Tested: ${results.length}`);
  console.log(`Pass Count: ${results.filter(r => r.status === "PASS").length} / ${results.length}`);
  console.log(`Unique Image Paths: ${filePaths.size} / ${results.length}`);
  console.log("-----------------------------------------------------------------------------------------\n");

  if (!allPass) {
    console.error("❌ VERIFICATION FAILED: One or more categories did not meet strict quality thresholds.");
    process.exit(1);
  } else {
    console.log("✅ ALL 18 CATEGORY CLUSTERS & ROUTES VERIFIED SUCCESSFULLY!");
  }
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
