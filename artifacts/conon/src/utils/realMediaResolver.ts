/**
 * CONON-NOW SINGLE-TRUTH MEDIA RESOLVER
 * Resolves ONLY verified real photographs from `REAL_MEDIA_MANIFEST` & active Media Vault.
 * Returns empty string `""` when no verified real photo exists yet so `<CononProductMedia />`
 * renders the executive Clean Brand Spec Card (zero broken images, zero SVGs, zero AI/stock fallbacks).
 */
import {
  getVaultOverrideForProduct,
  resolveVaultAssetUrl,
  isLegacyBrokenImageUrl,
} from "@/services/productMediaVault";

export interface MediaResolvableProduct {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  materialTag?: string;
  imageUrl?: string;
  image?: string;
  images?: string[];
  [key: string]: any;
}

export function resolveRealProductImage(
  productOrCategory?: MediaResolvableProduct | string | null,
  optTitle?: string,
  optBrand?: string,
  optCategorySlug?: string
): string {
  let product: MediaResolvableProduct = {};
  let rawTitle = optTitle || "";
  let rawSlug = "";
  let existingUrl = "";

  if (typeof productOrCategory === "string") {
    if (
      productOrCategory.startsWith("/real-products/") ||
      productOrCategory.startsWith("/uploads/") ||
      productOrCategory.startsWith("data:image/") ||
      productOrCategory.startsWith("blob:")
    ) {
      existingUrl = productOrCategory;
    } else {
      rawSlug = productOrCategory;
    }
  } else if (productOrCategory && typeof productOrCategory === "object") {
    product = productOrCategory;
    rawTitle = product.title || product.name || optTitle || "";
    rawSlug = product.slug || product.id || "";
    existingUrl =
      product.primaryImage ||
      product.imageUrl ||
      product.image ||
      (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "") ||
      "";
    if (!product.brand && optBrand) product = { ...product, brand: optBrand };
    if (!product.categorySlug && optCategorySlug) product = { ...product, categorySlug: optCategorySlug };
  }

  const vaultOverride =
    (product && (product.id || product.slug || product.title || product.name || product.skuId)
      ? getVaultOverrideForProduct(product)
      : undefined) ||
    getVaultOverrideForProduct(rawSlug || undefined) ||
    getVaultOverrideForProduct(rawTitle || undefined);

  if (vaultOverride?.images && vaultOverride.images.length > 0) {
    const primaryVaultImg = vaultOverride.images[0];
    const vaultUrl = resolveVaultAssetUrl(primaryVaultImg.url, primaryVaultImg.fallbackDataUrl);
    if (vaultUrl && !isLegacyBrokenImageUrl(vaultUrl)) return vaultUrl;
  }

  if (existingUrl && !isLegacyBrokenImageUrl(existingUrl)) {
    return resolveVaultAssetUrl(existingUrl);
  }

  return "";
}
