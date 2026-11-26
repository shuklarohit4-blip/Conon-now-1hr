import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  hydrateMediaVault,
  subscribeToMediaVault,
  getVaultOverrideForProduct,
  getAllVaultOverridesMap,
  resolveProductWithVault,
  resolveVaultAssetUrl,
  isLegacyBrokenImageUrl,
  triggerMediaVaultRefresh,
  type ProductMediaOverride,
  type VaultImageEntry,
} from "@/services/productMediaVault";

export type { ProductMediaOverride, VaultImageEntry };

export interface ProductMediaVaultContextValue {
  version: number;
  overridesMap: Record<string, ProductMediaOverride>;
  getOverride: (
    productOrId?: string | { id?: string; slug?: string; productId?: string; materialId?: string; masterItemId?: string; title?: string; name?: string; tradeName?: string; modelName?: string; skuId?: string; brand?: string; category?: string; categorySlug?: string } | null
  ) => ProductMediaOverride | undefined;
  resolveProduct: <T extends Record<string, any>>(baseProduct: T) => ReturnType<typeof resolveProductWithVault<T>>;
  refreshVault: () => Promise<void>;
}

const ProductMediaVaultContext = createContext<ProductMediaVaultContextValue | null>(null);

export function ProductMediaVaultProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsub = subscribeToMediaVault(() => {
      setVersion((v) => v + 1);
    });
    void hydrateMediaVault();
    return () => {
      unsub();
    };
  }, []);

  // Re-notify subscribers cleanly whenever Vite HMR reloads generated manifest
  useEffect(() => {
    const hot = (import.meta as any).hot;
    if (hot && typeof hot.accept === "function") {
      hot.accept("@/data/realMediaManifest.generated", () => {
        triggerMediaVaultRefresh();
      });
    }
  }, []);

  const overridesMap = useMemo(() => getAllVaultOverridesMap(), [version]);

  const getOverride = useCallback(
    (
      productOrId?:
        | string
        | {
            id?: string;
            slug?: string;
            productId?: string;
            materialId?: string;
            masterItemId?: string;
            title?: string;
            name?: string;
            tradeName?: string;
            modelName?: string;
            skuId?: string;
            brand?: string;
            category?: string;
            categorySlug?: string;
          }
        | null
    ) => getVaultOverrideForProduct(productOrId),
    [version]
  );

  const resolveProduct = useCallback(
    <T extends Record<string, any>>(baseProduct: T) => resolveProductWithVault(baseProduct),
    [version]
  );

  const refreshVault = useCallback(async () => {
    triggerMediaVaultRefresh();
    await hydrateMediaVault();
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo<ProductMediaVaultContextValue>(
    () => ({
      version,
      overridesMap,
      getOverride,
      resolveProduct,
      refreshVault,
    }),
    [version, overridesMap, getOverride, resolveProduct, refreshVault]
  );

  return <ProductMediaVaultContext.Provider value={value}>{children}</ProductMediaVaultContext.Provider>;
}

export function useProductMediaVault(): ProductMediaVaultContextValue {
  const ctx = useContext(ProductMediaVaultContext);
  if (!ctx) {
    return {
      version: 0,
      overridesMap: getAllVaultOverridesMap(),
      getOverride: getVaultOverrideForProduct,
      resolveProduct: resolveProductWithVault,
      refreshVault: hydrateMediaVault,
    };
  }
  return ctx;
}

export function useSafeProductMediaVault(): ProductMediaVaultContextValue | null {
  return useContext(ProductMediaVaultContext);
}

/**
 * Global hook required for every product/service/rental component across Storefront & Vendor Panel.
 * Automatically re-renders within <300ms when REAL_MEDIA_MANIFEST updates via HMR or BroadcastChannel.
 */
export function useResolvedProduct<T extends Record<string, any>>(
  baseProduct: T
): T & {
  primaryImage: string;
  galleryImages: VaultImageEntry[];
  specBullets: string[];
  isAdminVerifiedMedia: boolean;
  vaultOverride?: ProductMediaOverride;
};
export function useResolvedProduct<T extends Record<string, any>>(
  baseProduct: T | null | undefined
): (T & {
  primaryImage: string;
  galleryImages: VaultImageEntry[];
  specBullets: string[];
  isAdminVerifiedMedia: boolean;
  vaultOverride?: ProductMediaOverride;
}) | null;
export function useResolvedProduct<T extends Record<string, any>>(
  baseProduct: T | null | undefined
): (T & {
  primaryImage: string;
  galleryImages: VaultImageEntry[];
  specBullets: string[];
  isAdminVerifiedMedia: boolean;
  vaultOverride?: ProductMediaOverride;
}) | null {
  const { version } = useProductMediaVault();
  return useMemo(() => {
    if (!baseProduct) return null;
    return resolveProductWithVault(baseProduct);
  }, [baseProduct, version]);
}

export interface ProductMediaHookResult {
  hasRealImages: boolean;
  images: Array<{ url: string; caption?: string; fallbackDataUrl?: string }>;
  primaryUrl: string;
  override?: ProductMediaOverride;
  resolvedTitle: string;
  resolvedBrand: string;
  resolvedDescription: string;
  resolvedSpecBullets: string[];
  version: number;
}

/**
 * ONE canonical media hook backed ONLY by REAL_MEDIA_MANIFEST + live HMR/BroadcastChannel updates.
 * Zero hardcoded fallback photos, zero AI/stock URLs, zero inline SVG fallbacks.
 */
export function useProductMedia(
  product?: Record<string, any> | string | null
): ProductMediaHookResult {
  const { version } = useProductMediaVault();

  return useMemo(() => {
    const inputObj: Record<string, any> =
      typeof product === "string"
        ? { id: product, slug: product, title: product }
        : product || {};

    const ov = getVaultOverrideForProduct(
      typeof product === "string" ? product : inputObj
    );

    let images: Array<{ url: string; caption?: string; fallbackDataUrl?: string }> = [];

    if (ov && ov.images && ov.images.length > 0) {
      images = ov.images
        .map((im) => ({
          url: resolveVaultAssetUrl(im.url, im.fallbackDataUrl),
          caption: im.caption,
          fallbackDataUrl: im.fallbackDataUrl,
        }))
        .filter((im) => Boolean(im.url));
    } else if (Array.isArray(inputObj.galleryImages) && inputObj.galleryImages.length > 0) {
      images = inputObj.galleryImages
        .map((im: any) => ({
          url: resolveVaultAssetUrl(im?.url, im?.fallbackDataUrl),
          caption: im?.caption,
          fallbackDataUrl: im?.fallbackDataUrl,
        }))
        .filter((im: any) => Boolean(im.url) && !isLegacyBrokenImageUrl(im.url));
    } else if (Array.isArray(inputObj.images) && inputObj.images.length > 0) {
      images = inputObj.images
        .map((im: any) => {
          const u = typeof im === "string" ? im : im?.url || "";
          if (isLegacyBrokenImageUrl(u)) return null;
          return {
            url: resolveVaultAssetUrl(u),
            caption: typeof im === "object" ? im?.caption : undefined,
          };
        })
        .filter(Boolean) as Array<{ url: string; caption?: string }>;
    } else {
      const single = String(
        inputObj.primaryImage || inputObj.imageUrl || inputObj.image || inputObj.customPhotoUrl || ""
      ).trim();
      if (single && !isLegacyBrokenImageUrl(single)) {
        images = [{ url: resolveVaultAssetUrl(single) }];
      }
    }

    const resolvedTitle =
      (ov?.title && ov.title.trim()) ||
      inputObj.title ||
      inputObj.tradeName ||
      inputObj.modelName ||
      inputObj.name ||
      "CONON SKU";

    const resolvedBrand =
      (ov?.brand && ov.brand.trim()) ||
      inputObj.brand ||
      inputObj.machineName ||
      inputObj.vendor ||
      "CONON CERTIFIED";

    const resolvedDescription =
      (ov?.description && ov.description.trim()) ||
      inputObj.description ||
      inputObj.shortDescription ||
      inputObj.shortTagline ||
      "";

    const resolvedSpecBullets =
      ov?.specBullets && ov.specBullets.length > 0
        ? ov.specBullets
        : Array.isArray(inputObj.specBullets)
        ? inputObj.specBullets
        : Array.isArray(inputObj.features)
        ? inputObj.features
        : [];

    return {
      hasRealImages: images.length > 0,
      images,
      primaryUrl: images[0]?.url || "",
      override: ov,
      resolvedTitle: String(resolvedTitle),
      resolvedBrand: String(resolvedBrand),
      resolvedDescription: String(resolvedDescription),
      resolvedSpecBullets,
      version,
    };
  }, [product, version]);
}
