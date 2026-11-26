#!/usr/bin/env node
/**
 * CONON-NOW AUTO-MANIFEST ENGINE
 * Recursively scans artifacts/conon/public/real-products/<category-slug>/<item-slug>/
 * and generates artifacts/conon/src/data/realMediaManifest.generated.ts
 * as the Single Source of Truth for all verified real product/service/rental photography.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_IMAGE_RE = /\.(webp|jpe?g|png)$/i;
const NATURAL_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function readMetaJson(folderPath) {
  const metaPath = path.join(folderPath, "meta.json");
  if (!fs.existsSync(metaPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function listSortedImages(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((d) => d.isFile() && VALID_IMAGE_RE.test(d.name) && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort((a, b) => NATURAL_COLLATOR.compare(a, b));
}

function buildOverrides(meta) {
  const out = {};
  if (typeof meta.title === "string" && meta.title.trim()) out.title = meta.title.trim();
  if (typeof meta.brand === "string" && meta.brand.trim()) out.brand = meta.brand.trim();
  if (typeof meta.subcategory === "string" && meta.subcategory.trim()) out.subcategory = meta.subcategory.trim();
  if (typeof meta.description === "string" && meta.description.trim()) out.description = meta.description.trim();
  if (Array.isArray(meta.specBullets) && meta.specBullets.length > 0) {
    out.specBullets = meta.specBullets.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof meta.price === "number" && Number.isFinite(meta.price)) out.price = meta.price;
  if (typeof meta.mrp === "number" && Number.isFinite(meta.mrp)) out.mrp = meta.mrp;
  if (typeof meta.bulkPrice === "number" && Number.isFinite(meta.bulkPrice)) out.bulkPrice = meta.bulkPrice;
  if (typeof meta.bulkMinQty === "number" && Number.isFinite(meta.bulkMinQty)) out.bulkMinQty = meta.bulkMinQty;
  if (typeof meta.hsnCode === "string" && meta.hsnCode.trim()) out.hsnCode = meta.hsnCode.trim();
  if (typeof meta.gstRate === "number" && Number.isFinite(meta.gstRate)) out.gstRate = meta.gstRate;
  if (typeof meta.unit === "string" && meta.unit.trim()) out.unit = meta.unit.trim();
  if (typeof meta.isInStock === "boolean") out.isInStock = meta.isInStock;
  if (typeof meta.isCustomItem === "boolean" && meta.isCustomItem) out.isCustomItem = true;
  if (typeof meta.categorySlug === "string" && meta.categorySlug.trim()) out.categorySlug = meta.categorySlug.trim();
  if (typeof meta.updatedAt === "string" && meta.updatedAt.trim()) out.updatedAt = meta.updatedAt.trim();
  return Object.keys(out).length > 0 ? out : undefined;
}

export function syncRealMediaManifest(options = {}) {
  const rootDir = options.rootDir || path.resolve(__dirname, "..");
  const cononDir = path.join(rootDir, "artifacts/conon");
  const realProductsDir = path.join(cononDir, "public/real-products");
  const outFile = path.join(cononDir, "src/data/realMediaManifest.generated.ts");

  fs.mkdirSync(realProductsDir, { recursive: true });
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const canonicalEntries = [];
  const manifestMap = {};
  const brandGroupFallback = {};

  if (fs.existsSync(realProductsDir)) {
    const categoryDirs = fs
      .readdirSync(realProductsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => d.name)
      .sort((a, b) => NATURAL_COLLATOR.compare(a, b));

    for (const catSlug of categoryDirs) {
      if (catSlug === "_brand-groups") {
        // Optional shared brand-group fallback directory:
        // public/real-products/_brand-groups/<category-slug>/<brand-group-slug>/*
        const bgRoot = path.join(realProductsDir, "_brand-groups");
        const bgCats = fs
          .readdirSync(bgRoot, { withFileTypes: true })
          .filter((d) => d.isDirectory() && !d.name.startsWith("."))
          .map((d) => d.name)
          .sort((a, b) => NATURAL_COLLATOR.compare(a, b));

        for (const bgCat of bgCats) {
          const bgCatDir = path.join(bgRoot, bgCat);
          const groups = fs
            .readdirSync(bgCatDir, { withFileTypes: true })
            .filter((d) => d.isDirectory() && !d.name.startsWith("."))
            .map((d) => d.name)
            .sort((a, b) => NATURAL_COLLATOR.compare(a, b));
          for (const groupSlug of groups) {
            const gDir = path.join(bgCatDir, groupSlug);
            const gMeta = readMetaJson(gDir);
            const gCaptions = gMeta.captions && typeof gMeta.captions === "object" ? gMeta.captions : {};
            const gFiles = listSortedImages(gDir);
            if (gFiles.length > 0) {
              brandGroupFallback[`${bgCat}/${groupSlug}`] = gFiles.map((file) => ({
                url: `/real-products/_brand-groups/${bgCat}/${groupSlug}/${file}`,
                ...(gCaptions[file] ? { caption: String(gCaptions[file]) } : {}),
              }));
            }
          }
        }
        continue;
      }

      const catPath = path.join(realProductsDir, catSlug);
      const itemDirs = fs
        .readdirSync(catPath, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .map((d) => d.name)
        .sort((a, b) => NATURAL_COLLATOR.compare(a, b));

      for (const itemSlug of itemDirs) {
        const itemPath = path.join(catPath, itemSlug);
        const files = listSortedImages(itemPath);
        const meta = readMetaJson(itemPath);
        const captions = meta.captions && typeof meta.captions === "object" ? meta.captions : {};
        const overrides = buildOverrides(meta);

        if (files.length === 0 && !overrides) {
          continue;
        }

        const images = files.map((file) => {
          const cap = captions[file];
          return {
            url: `/real-products/${catSlug}/${itemSlug}/${file}`,
            ...(cap ? { caption: String(cap) } : {}),
          };
        });

        const entry = {
          itemKey: String(meta.productId || itemSlug),
          ...(meta.productId ? { productId: String(meta.productId) } : {}),
          ...(meta.slug ? { slug: String(meta.slug) } : {}),
          categorySlug: catSlug,
          images,
          ...(overrides ? { overrides } : {}),
        };

        canonicalEntries.push(entry);

        const candidateKeys = new Set([itemSlug]);
        if (typeof meta.productId === "string" && meta.productId.trim()) {
          candidateKeys.add(meta.productId.trim());
        }
        if (typeof meta.slug === "string" && meta.slug.trim()) {
          candidateKeys.add(meta.slug.trim());
        }

        for (const k of candidateKeys) {
          manifestMap[k] = entry;
        }

        if (typeof meta.brandGroupSlug === "string" && meta.brandGroupSlug.trim() && images.length > 0) {
          const bgKey = `${catSlug}/${meta.brandGroupSlug.trim()}`;
          if (!brandGroupFallback[bgKey]) {
            brandGroupFallback[bgKey] = images;
          }
        }
      }
    }
  }

  const lines = [
    "/* eslint-disable */",
    "/* AUTO-GENERATED BY scripts/sync-real-media-manifest.mjs — DO NOT EDIT MANUALLY */",
    "",
    "export interface RealMediaImageItem {",
    "  url: string;",
    "  caption?: string;",
    "}",
    "",
    "export interface RealMediaOverrides {",
    "  title?: string;",
    "  brand?: string;",
    "  subcategory?: string;",
    "  description?: string;",
    "  specBullets?: string[];",
    "  price?: number;",
    "  mrp?: number;",
    "  bulkPrice?: number;",
    "  bulkMinQty?: number;",
    "  hsnCode?: string;",
    "  gstRate?: number;",
    "  unit?: string;",
    "  isInStock?: boolean;",
    "  isCustomItem?: boolean;",
    "  categorySlug?: string;",
    "  updatedAt?: string;",
    "}",
    "",
    "export interface RealMediaManifestEntry {",
    "  itemKey: string;",
    "  productId?: string;",
    "  slug?: string;",
    "  categorySlug: string;",
    "  images: RealMediaImageItem[];",
    "  overrides?: RealMediaOverrides;",
    "}",
    "",
    `export const REAL_MEDIA_ENTRIES: RealMediaManifestEntry[] = ${JSON.stringify(canonicalEntries, null, 2)};`,
    "",
    `export const REAL_MEDIA_MANIFEST: Record<string, RealMediaManifestEntry> = ${JSON.stringify(manifestMap, null, 2)};`,
    "",
    `export const BRAND_GROUP_MEDIA_FALLBACK: Record<string, RealMediaImageItem[]> = ${JSON.stringify(brandGroupFallback, null, 2)};`,
    "",
  ];

  const nextContent = lines.join("\n");
  const prevContent = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8") : "";
  if (prevContent !== nextContent) {
    fs.writeFileSync(outFile, nextContent, "utf8");
  }

  const jsonManifestPath = path.join(realProductsDir, "manifest.json");
  const jsonPayload = JSON.stringify(
    {
      version: Date.now(),
      itemCount: canonicalEntries.length,
      keyCount: Object.keys(manifestMap).length,
      brandGroupCount: Object.keys(brandGroupFallback).length,
      entries: canonicalEntries,
      items: manifestMap,
      brandGroups: brandGroupFallback,
    },
    null,
    2
  );
  fs.writeFileSync(jsonManifestPath, jsonPayload, "utf8");

  return {
    outFile,
    jsonManifestPath,
    itemCount: canonicalEntries.length,
    keyCount: Object.keys(manifestMap).length,
    brandGroupCount: Object.keys(brandGroupFallback).length,
  };
}

// Run when executed directly from CLI
const isDirectRun =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  const res = syncRealMediaManifest();
  console.log(
    `[media:sync] Generated realMediaManifest.generated.ts: ${res.itemCount} items (${res.keyCount} lookup keys), ${res.brandGroupCount} brand groups.`
  );
}
