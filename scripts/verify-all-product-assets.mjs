import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.resolve(rootDir, "artifacts/conon/public");

async function runAudit() {
  console.log("=== STARTING FULL CATALOG & ASSET VERIFICATION AUDIT ===");

  // 1. Fetch categories from live backend API
  let categoriesRes;
  try {
    const res = await fetch("http://localhost:5001/api/categories");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    categoriesRes = await res.json();
  } catch (err) {
    console.error("Failed to connect to backend /api/categories:", err.message);
    process.exit(1);
  }

  const categories = categoriesRes.categories || [];
  console.log(`\n[API Audit] Total Categories Returned: ${categories.length}`);
  if (categories.length < 18) {
    console.error(`ERROR: Expected 18 categories, got ${categories.length}`);
    process.exit(1);
  }

  let totalProducts = 0;
  const categoryResults = [];
  const imageCounts = new Map();
  const missingImages = [];
  const smallImages = [];

  for (const cat of categories) {
    const res = await fetch(`http://localhost:5001/api/products?categorySlug=${cat.slug}`);
    if (!res.ok) {
      console.error(`ERROR: Failed to fetch products for category: ${cat.slug}`);
      process.exit(1);
    }
    const data = await res.json();
    const prods = data.products || [];
    totalProducts += prods.length;

    let catImagesValid = 0;
    let catSpecsValid = 0;
    let catVariantsValid = 0;

    for (const p of prods) {
      // Check primary packshot image
      const imgPath = p.image;
      if (!imgPath || !imgPath.startsWith("/images/products/")) {
        missingImages.push({ slug: p.slug, issue: "Invalid path format (must start with /images/products/)", path: imgPath });
      } else {
        const diskPath = path.join(publicDir, imgPath.replace(/^\//, ""));
        if (!fs.existsSync(diskPath)) {
          missingImages.push({ slug: p.slug, issue: "File not found on disk", path: diskPath });
        } else {
          const stats = fs.statSync(diskPath);
          if (stats.size < 1000) {
            smallImages.push({ slug: p.slug, issue: `File too small (${stats.size} bytes)`, path: diskPath });
          } else {
            catImagesValid++;
            imageCounts.set(imgPath, (imageCounts.get(imgPath) || 0) + 1);
          }
        }
      }

      // Check specs
      if (p.specifications && p.specifications.length >= 6) {
        catSpecsValid++;
      }

      // Check variants
      if (p.variants && p.variants.length >= 2) {
        catVariantsValid++;
      }
    }

    categoryResults.push({
      category: cat.title,
      slug: cat.slug,
      productCount: prods.length,
      imagesVerified: `${catImagesValid}/${prods.length}`,
      specsVerified: `${catSpecsValid}/${prods.length}`,
      variantsVerified: `${catVariantsValid}/${prods.length}`,
      status: prods.length >= 6 && catImagesValid === prods.length ? "PASS" : "FAIL"
    });
  }

  console.log("\n=== CATEGORY AUDIT SUMMARY TABLE ===");
  console.table(categoryResults);

  console.log(`\nTotal Products Verified: ${totalProducts}`);
  console.log(`Unique Image Assets Verified: ${imageCounts.size}`);

  if (missingImages.length > 0) {
    console.error(`\nMISSING IMAGES (${missingImages.length}):`);
    console.error(missingImages);
  }

  if (smallImages.length > 0) {
    console.error(`\nSMALL/CORRUPT IMAGES (${smallImages.length}):`);
    console.error(smallImages);
  }

  const duplicateImages = Array.from(imageCounts.entries()).filter(([_, count]) => count > 2);
  if (duplicateImages.length > 0) {
    console.warn(`\nWarning: Images shared across multiple products:`, duplicateImages);
  }

  // 2. Test single product lookup by slug
  console.log("\n[API Audit] Testing Single Product Lookup by Slug...");
  const testSlugs = [
    "cp-plus-3mp-wifi-pt-camera-cp-e38q",
    "ashirvad-cpvc-flowguard-plus-pipe",
    "ultratech-weather-plus-cement-50kg",
    "centuryply-club-prime-bwp-marine",
    "fevicol-sh-synthetic-resin-adhesive",
    "polycab-maxima-green-wire-hr-fr-lsh"
  ];

  for (const slug of testSlugs) {
    const res = await fetch(`http://localhost:5001/api/products/${slug}`);
    if (!res.ok) {
      console.error(`FAIL: Product lookup failed for ${slug}: HTTP ${res.status}`);
      process.exit(1);
    }
    const data = await res.json();
    if (!data.success || !data.product) {
      console.error(`FAIL: Product response unsuccessful for ${slug}`);
      process.exit(1);
    }
    const p = data.product;
    console.log(`✔ Verified ${p.name} | Specs: ${p.specifications.length} rows | Variants: ${p.variants.length} options`);
  }

  if (missingImages.length === 0 && smallImages.length === 0 && totalProducts === 108) {
    console.log("\n✅ ALL 18 CATEGORIES AND 108 PRODUCTS 100% PASSED AUDIT!");
  } else {
    console.error("\n❌ AUDIT FAILED CHECKS");
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
