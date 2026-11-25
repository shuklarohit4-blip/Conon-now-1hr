import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { CONON_PRODUCTS_IMAGES_DIR } from "../lib/paths";

export interface ProcessedImageResult {
  imageUrl: string;
  width: number;
  height: number;
  sizeKb: number;
  sha256: string;
  mimeType: string;
}

export interface CandidatePhoto {
  url: string;
  title: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  source?: string;
}

export class ImageStudioService {
  private publicProductsDir: string;

  constructor() {
    this.publicProductsDir = CONON_PRODUCTS_IMAGES_DIR;
  }

  /**
   * Sanitizes slug strings for filesystem paths
   */
  private sanitizeSlug(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Core Sharp Processing Pipeline:
   * Takes any valid image buffer (PNG, JPG, WEBP, AVIF)
   * Resizes onto an 800x800 pure #FFFFFF square canvas (contain with 5% padding)
   * Encodes as WebP (quality: 84)
   * Writes directly to conon's Vite publicDir
   */
  public async processAndSaveImage(
    buffer: Buffer,
    categorySlug: string,
    skuSlug: string
  ): Promise<ProcessedImageResult> {
    const safeCategory = this.sanitizeSlug(categorySlug || "general");
    const safeSku = this.sanitizeSlug(skuSlug || "product");
    const targetDir = path.join(this.publicProductsDir, safeCategory);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 5% inner padding: image fits within 740x740 inside 800x800 canvas
    const processedBuffer = await sharp(buffer)
      .resize(740, 740, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .extend({
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 84 })
      .toBuffer();

    const shortTs = Date.now().toString(36).slice(-4);
    const fileName = `${safeSku}-${shortTs}.webp`;
    const fullPath = path.join(targetDir, fileName);

    fs.writeFileSync(fullPath, processedBuffer);

    const sha256 = crypto
      .createHash("sha256")
      .update(processedBuffer)
      .digest("hex");

    const imageUrl = `/images/products/${safeCategory}/${fileName}`;

    return {
      imageUrl,
      width: 800,
      height: 800,
      sizeKb: Math.round(processedBuffer.length / 1024),
      sha256,
      mimeType: "image/webp",
    };
  }

  /**
   * Mode 2: Download external HTTPS URL and process into 800x800 WebP
   */
  public async processFromUrl(
    imageUrl: string,
    categorySlug: string,
    skuSlug: string
  ): Promise<ProcessedImageResult> {
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      throw new Error("Invalid image URL. Must begin with http:// or https://");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/*,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch remote image (HTTP ${response.status}: ${response.statusText})`
        );
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("image") && !contentType.includes("octet-stream")) {
        throw new Error(`Target URL does not return an image (Content-Type: ${contentType})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return await this.processAndSaveImage(buffer, categorySlug, skuSlug);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Mode 3: 1-Click Magic Auto-Fetch candidate packshots
   * Queries Google CSE or SerpApi if configured; otherwise returns curated catalog matches
   */
  public async fetchCandidatePackshots(
    brand: string,
    productName: string,
    oemModelCode?: string,
    categorySlug?: string
  ): Promise<{ candidates: CandidatePhoto[]; provider: string; warning?: string }> {
    const query = [brand, productName, oemModelCode].filter(Boolean).join(" ").trim();
    const serpApiKey = process.env.SERPAPI_KEY;
    const googleApiKey = process.env.GOOGLE_CSE_API_KEY;
    const googleCx = process.env.GOOGLE_CSE_CX;

    // 1. Try SerpApi if key is set
    if (serpApiKey) {
      try {
        const serpUrl = new URL("https://serpapi.com/search.json");
        serpUrl.searchParams.set("engine", "google_images");
        serpUrl.searchParams.set("q", `${query} product white background packshot`);
        serpUrl.searchParams.set("api_key", serpApiKey);
        serpUrl.searchParams.set("num", "8");

        const res = await fetch(serpUrl.toString());
        if (res.ok) {
          const data = (await res.json()) as any;
          const images = (data.images_results || [])
            .filter((img: any) => img.original && !img.original.endsWith(".svg"))
            .slice(0, 4)
            .map((img: any) => ({
              url: img.original,
              title: img.title || query,
              thumbnailUrl: img.thumbnail || img.original,
              width: img.original_width,
              height: img.original_height,
              source: img.source || "SerpApi Google Images",
            }));

          if (images.length > 0) {
            return { candidates: images, provider: "SerpApi" };
          }
        }
      } catch (err: any) {
        console.warn("[ImageStudio] SerpApi fetch failed, falling back:", err?.message);
      }
    }

    // 2. Try Google Custom Search Engine if keys are set
    if (googleApiKey && googleCx) {
      try {
        const cseUrl = new URL("https://www.googleapis.com/customsearch/v1");
        cseUrl.searchParams.set("key", googleApiKey);
        cseUrl.searchParams.set("cx", googleCx);
        cseUrl.searchParams.set("q", `${query} official packshot`);
        cseUrl.searchParams.set("searchType", "image");
        cseUrl.searchParams.set("imgSize", "large");
        cseUrl.searchParams.set("num", "6");

        const res = await fetch(cseUrl.toString());
        if (res.ok) {
          const data = (await res.json()) as any;
          const items = (data.items || [])
            .filter((item: any) => item.link && !item.link.endsWith(".svg"))
            .slice(0, 4)
            .map((item: any) => ({
              url: item.link,
              title: item.title || query,
              thumbnailUrl: item.image?.thumbnailLink || item.link,
              width: item.image?.width,
              height: item.image?.height,
              source: item.displayLink || "Google CSE",
            }));

          if (items.length > 0) {
            return { candidates: items, provider: "Google CSE" };
          }
        }
      } catch (err: any) {
        console.warn("[ImageStudio] Google CSE fetch failed, falling back:", err?.message);
      }
    }

    // 3. Fallback: Search existing category packshots in conon public directory for instant selection
    const safeCat = this.sanitizeSlug(categorySlug || "general");
    const catDir = path.join(this.publicProductsDir, safeCat);
    const candidates: CandidatePhoto[] = [];

    if (fs.existsSync(catDir)) {
      try {
        const files = fs
          .readdirSync(catDir)
          .filter((f) => f.endsWith(".webp") || f.endsWith(".png") || f.endsWith(".jpg"));

        const brandLower = brand.toLowerCase();
        const matches = files.filter((f) => f.toLowerCase().includes(brandLower));
        const picks = matches.length >= 2 ? matches.slice(0, 4) : files.slice(0, 4);

        for (const file of picks) {
          candidates.push({
            url: `/images/products/${safeCat}/${file}`,
            title: file.replace(/[-_]/g, " ").replace(/\.webp$/i, ""),
            thumbnailUrl: `/images/products/${safeCat}/${file}`,
            source: "Conon Verified Catalog Library",
          });
        }
      } catch {
        // Ignored
      }
    }

    return {
      candidates,
      provider: "Conon Catalog Library",
      warning:
        !serpApiKey && !googleApiKey
          ? "SERPAPI_KEY or GOOGLE_CSE_API_KEY is not configured in .env. Showing verified local category library matches. You can also paste an image URL or drag & drop any photo."
          : undefined,
    };
  }
}

export const imageStudioService = new ImageStudioService();
