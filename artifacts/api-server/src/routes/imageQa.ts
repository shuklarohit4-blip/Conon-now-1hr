import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { REPO_ROOT, CONON_PUBLIC_DIR } from "../lib/paths";

const router = Router();
const rootDir = REPO_ROOT;
const publicDir = CONON_PUBLIC_DIR;
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

function getManifest(): Record<string, any> {
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch {
      return {};
    }
  }
  return {};
}

function saveManifest(manifest: Record<string, any>) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

// GET /admin/image-qa/manifest
router.get("/admin/image-qa/manifest", (_req: Request, res: Response) => {
  const manifest = getManifest();
  res.json({
    success: true,
    count: Object.keys(manifest).length,
    manifest,
  });
});

// POST /admin/image-qa/select
router.post("/admin/image-qa/select", async (req: Request, res: Response) => {
  try {
    const { productId, candidateIndex } = req.body;
    if (!productId || typeof candidateIndex !== "number") {
      res.status(400).json({ error: "Missing productId or candidateIndex" });
      return;
    }

    const manifest = getManifest();
    const entry = manifest[productId];
    if (!entry) {
      res.status(404).json({ error: "Product not found in manifest" });
      return;
    }

    const cand = entry.candidates[candidateIndex];
    if (!cand) {
      res.status(400).json({ error: "Candidate index out of bounds" });
      return;
    }

    let inputBuffer: Buffer | null = null;
    if (cand.url.startsWith("http")) {
      const resp = await fetch(cand.url);
      if (!resp.ok) {
        res.status(400).json({ error: `Failed to download candidate URL: HTTP ${resp.status}` });
        return;
      }
      const arr = await resp.arrayBuffer();
      inputBuffer = Buffer.from(arr);
    } else {
      // Local or OEM generated
      const clean = entry.localPath.startsWith("/") ? entry.localPath.slice(1) : entry.localPath;
      const existingPath = path.join(publicDir, clean);
      if (fs.existsSync(existingPath)) {
        inputBuffer = fs.readFileSync(existingPath);
      }
    }

    if (!inputBuffer) {
      res.status(400).json({ error: "Unable to load candidate image buffer" });
      return;
    }

    // Process via sharp
    const processed = await sharp(inputBuffer)
      .resize(720, 720, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 82 })
      .toBuffer();

    const sha256 = crypto.createHash("sha256").update(processed).digest("hex");

    const cleanPath = entry.localPath.startsWith("/") ? entry.localPath.slice(1) : entry.localPath;
    const fullPath = path.join(publicDir, cleanPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, processed);

    const distPath = path.join(rootDir, "artifacts/conon/dist/public", cleanPath);
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, processed);
    }

    entry.selectedCandidateIndex = candidateIndex;
    entry.sha256 = sha256;
    entry.fileSizeBytes = processed.length;
    entry.status = "APPROVED";
    entry.lastUpdated = new Date().toISOString();

    manifest[productId] = entry;
    saveManifest(manifest);

    res.json({
      success: true,
      message: "Candidate selected and processed successfully",
      entry,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to select candidate" });
  }
});

// POST /admin/image-qa/custom-url
router.post("/admin/image-qa/custom-url", async (req: Request, res: Response) => {
  try {
    const { productId, customUrl } = req.body;
    if (!productId || !customUrl) {
      res.status(400).json({ error: "Missing productId or customUrl" });
      return;
    }

    const manifest = getManifest();
    const entry = manifest[productId];
    if (!entry) {
      res.status(404).json({ error: "Product not found in manifest" });
      return;
    }

    const resp = await fetch(customUrl);
    if (!resp.ok) {
      res.status(400).json({ error: `Failed to download custom URL: HTTP ${resp.status}` });
      return;
    }
    const arr = await resp.arrayBuffer();
    const inputBuffer = Buffer.from(arr);

    const processed = await sharp(inputBuffer)
      .resize(720, 720, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 82 })
      .toBuffer();

    const sha256 = crypto.createHash("sha256").update(processed).digest("hex");

    const cleanPath = entry.localPath.startsWith("/") ? entry.localPath.slice(1) : entry.localPath;
    const fullPath = path.join(publicDir, cleanPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, processed);

    const distPath = path.join(rootDir, "artifacts/conon/dist/public", cleanPath);
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, processed);
    }

    entry.candidates.push({
      url: customUrl,
      source: "CUSTOM_URL_INPUT",
    });
    entry.selectedCandidateIndex = entry.candidates.length - 1;
    entry.sha256 = sha256;
    entry.fileSizeBytes = processed.length;
    entry.status = "APPROVED";
    entry.lastUpdated = new Date().toISOString();

    manifest[productId] = entry;
    saveManifest(manifest);

    res.json({
      success: true,
      message: "Custom URL processed and approved successfully",
      entry,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process custom URL" });
  }
});

// POST /admin/image-qa/approve
router.post("/admin/image-qa/approve", (req: Request, res: Response) => {
  const { productId } = req.body;
  const manifest = getManifest();
  if (manifest[productId]) {
    manifest[productId].status = "APPROVED";
    manifest[productId].lastUpdated = new Date().toISOString();
    saveManifest(manifest);
    res.json({ success: true, entry: manifest[productId] });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

export default router;
