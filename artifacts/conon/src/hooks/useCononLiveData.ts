import { useMemo } from "react";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { useSafeProductMediaVault } from "@/context/ProductMediaVaultContext";
import { HOME_CATEGORIES, type HomeCategory } from "@/data/homeCategories";
import { CATALOG_PRODUCTS, type IProduct } from "@/data/catalogData";
import {
  FALLBACK_SERVICE_CATALOG,
  FALLBACK_RENTAL_CATALOG,
  type ServiceCatalogItem,
  type MachineRentalCatalogItem,
} from "@/services/servicesRentalsSync";
import { sanitizeFolderSlug } from "@/services/productMediaVault";

function buildCandidateKeys(item: {
  id?: string;
  slug?: string;
  brand?: string;
  title?: string;
  name?: string;
}): string[] {
  const rawTitle = item.title || item.name || "";
  const rawBrand = item.brand || "";
  return Array.from(
    new Set(
      [
        item.id,
        item.slug,
        rawBrand && rawTitle ? sanitizeFolderSlug(`${rawBrand}-${rawTitle}`) : "",
        rawTitle ? sanitizeFolderSlug(rawTitle) : "",
        item.id ? sanitizeFolderSlug(item.id) : "",
      ].filter((x): x is string => Boolean(x && x.trim()))
    )
  );
}

/**
 * Returns base 16 categories merged with Admin customCategories, overrides, and hiddenCategorySlugs.
 */
export function useLiveCategories(): HomeCategory[] {
  const sync = useSafeCononMasterSync();
  const catState = sync?.state.categories;

  return useMemo(() => {
    const hidden = new Set(catState?.hiddenCategorySlugs || []);
    const overrides = catState?.overrides || {};
    const custom = (catState?.customCategories || []) as HomeCategory[];

    const mergedBase = HOME_CATEGORIES.filter((c) => !hidden.has(c.slug)).map((c) => ({
      ...c,
      ...(overrides[c.slug] || {}),
    }));

    const existingSlugs = new Set(mergedBase.map((c) => c.slug));
    const extras = custom.filter((c) => c?.slug && !existingSlugs.has(c.slug) && !hidden.has(c.slug));

    return [...mergedBase, ...extras];
  }, [catState]);
}

/**
 * Returns base catalog products + Admin customProducts, filtered by hiddenProductIds,
 * merged with Admin overrides & live Mandi Rates.
 */
export function useLiveProducts(categorySlug?: string): IProduct[] {
  const sync = useSafeCononMasterSync();
  const vault = useSafeProductMediaVault();
  const prodState = sync?.state.products;
  const mandiRates = sync?.state.mandiRates;

  return useMemo(() => {
    const hidden = new Set(prodState?.hiddenProductIds || []);
    const overrides = prodState?.overrides || {};
    const custom = (prodState?.customProducts || []) as IProduct[];

    const source = [...CATALOG_PRODUCTS, ...custom].filter((p) => {
      if (!p || hidden.has(p.id)) return false;
      if (categorySlug && p.categorySlug !== categorySlug) return false;
      return true;
    });

    return source.map((p) => {
      const keys = buildCandidateKeys(p);
      let matchedOv = undefined;
      for (const k of keys) {
        if (overrides[k]) {
          matchedOv = overrides[k];
          break;
        }
      }

      // Apply Mandi Rate override if matching key/category/title exists
      const mandiHit =
        mandiRates?.[p.id] ||
        mandiRates?.[p.categorySlug] ||
        mandiRates?.[sanitizeFolderSlug(p.title || p.name || "")];

      const vaultResolved = vault ? vault.resolveProduct(p) : p;
      const mergedImages =
        matchedOv?.images && matchedOv.images.length > 0
          ? matchedOv.images
          : (vaultResolved as any).galleryImages || [];

      const primaryImage =
        mergedImages[0]?.url || (vaultResolved as any).primaryImage || p.image || "";

      return {
        ...vaultResolved,
        ...(matchedOv?.title ? { title: matchedOv.title, name: matchedOv.title } : {}),
        ...(matchedOv?.brand ? { brand: matchedOv.brand } : {}),
        ...(matchedOv?.description !== undefined ? { description: matchedOv.description } : {}),
        ...(matchedOv?.specBullets?.length ? { highlights: matchedOv.specBullets } : {}),
        ...(matchedOv?.price !== undefined ? { price: matchedOv.price } : mandiHit ? { price: mandiHit.price } : {}),
        ...(matchedOv?.mrp !== undefined ? { mrp: matchedOv.mrp } : {}),
        ...(matchedOv?.unit ? { unit: matchedOv.unit } : {}),
        ...(matchedOv?.inStock !== undefined ? { inStock: matchedOv.inStock } : {}),
        ...(matchedOv?.isInStock !== undefined ? { inStock: matchedOv.isInStock } : {}),
        image: primaryImage,
        primaryImage,
        galleryImages: mergedImages,
        images: mergedImages.map((m: any) => m.url).filter(Boolean),
        isAdminVerifiedMedia: mergedImages.length > 0,
      } as IProduct;
    });
  }, [prodState, mandiRates, vault, categorySlug]);
}

/**
 * Generic product-list merger hook that preserves the caller's exact item type (e.g. `Product` or `IProduct`)
 * while applying Admin hiddenProductIds, product overrides, Mandi rates, and Media Vault photos.
 */
export function useLiveProductMerger() {
  const sync = useSafeCononMasterSync();
  const vault = useSafeProductMediaVault();
  const prodState = sync?.state.products;
  const mandiRates = sync?.state.mandiRates;

  return useMemo(() => {
    const hidden = new Set(prodState?.hiddenProductIds || []);
    const overrides = prodState?.overrides || {};

    return <T extends { id: string; title?: string; name?: string; brand?: string; categorySlug?: string; image?: string }>(
      items: T[]
    ): (T & {
      primaryImage: string;
      galleryImages: any[];
      specBullets: string[];
      isAdminVerifiedMedia: boolean;
    })[] => {
      return items
        .filter((p) => p && !hidden.has(p.id))
        .map((p) => {
          const keys = buildCandidateKeys(p);
          let matchedOv = undefined;
          for (const k of keys) {
            if (overrides[k]) {
              matchedOv = overrides[k];
              break;
            }
          }
          const mandiHit =
            mandiRates?.[p.id] ||
            (p.categorySlug ? mandiRates?.[p.categorySlug] : undefined) ||
            mandiRates?.[sanitizeFolderSlug(p.title || p.name || "")];

          const vaultResolved: any = vault ? vault.resolveProduct(p as any) : p;
          const mergedImages =
            matchedOv?.images && matchedOv.images.length > 0
              ? matchedOv.images
              : vaultResolved.galleryImages || [];

          const primaryImage =
            mergedImages[0]?.url || vaultResolved.primaryImage || p.image || "";

          return {
            ...p,
            ...vaultResolved,
            ...(matchedOv?.title ? { title: matchedOv.title } : {}),
            ...(matchedOv?.brand ? { brand: matchedOv.brand } : {}),
            ...(matchedOv?.description !== undefined ? { description: matchedOv.description } : {}),
            ...(matchedOv?.specBullets?.length ? { specBullets: matchedOv.specBullets } : {}),
            ...(matchedOv?.price !== undefined ? { price: matchedOv.price } : mandiHit ? { price: mandiHit.price } : {}),
            ...(matchedOv?.mrp !== undefined ? { mrp: matchedOv.mrp } : {}),
            ...(matchedOv?.unit ? { unit: matchedOv.unit } : {}),
            ...(matchedOv?.inStock !== undefined ? { inStock: matchedOv.inStock } : {}),
            ...(matchedOv?.isInStock !== undefined ? { inStock: matchedOv.isInStock } : {}),
            image: primaryImage,
            primaryImage,
            galleryImages: mergedImages,
            isAdminVerifiedMedia: mergedImages.length > 0,
          };
        });
    };
  }, [prodState, mandiRates, vault]);
}

/**
 * Returns live Skilled Services merged with Admin overrides & custom items.
 */
export function useLiveServices(): ServiceCatalogItem[] {
  const sync = useSafeCononMasterSync();
  const srState = sync?.state.servicesAndRentals;
  const prodOverrides = sync?.state.products.overrides;

  return useMemo(() => {
    const overrides = srState?.serviceOverrides || {};
    const custom = (srState?.customServices || []) as ServiceCatalogItem[];
    return [...FALLBACK_SERVICE_CATALOG, ...custom].map((svc) => {
      const ov = overrides[svc.id] || overrides[svc.slug] || {};
      const mediaOv = prodOverrides?.[svc.id] || prodOverrides?.[svc.slug];
      return {
        ...svc,
        ...ov,
        ...(mediaOv?.images?.[0]?.url ? { imageUrl: mediaOv.images[0].url } : {}),
        ...(mediaOv?.price !== undefined ? { shiftRate: mediaOv.price } : {}),
        ...(mediaOv?.title ? { tradeName: mediaOv.title } : {}),
        ...(mediaOv?.description ? { description: mediaOv.description } : {}),
      };
    });
  }, [srState, prodOverrides]);
}

/**
 * Returns live Heavy Machine Rentals merged with Admin overrides & custom items.
 */
export function useLiveRentals(): MachineRentalCatalogItem[] {
  const sync = useSafeCononMasterSync();
  const srState = sync?.state.servicesAndRentals;
  const prodOverrides = sync?.state.products.overrides;

  return useMemo(() => {
    const overrides = srState?.rentalOverrides || {};
    const custom = (srState?.customRentals || []) as MachineRentalCatalogItem[];
    return [...FALLBACK_RENTAL_CATALOG, ...custom].map((eq) => {
      const ov = overrides[eq.id] || overrides[eq.slug] || {};
      const mediaOv = prodOverrides?.[eq.id] || prodOverrides?.[eq.slug];
      return {
        ...eq,
        ...ov,
        ...(mediaOv?.images?.[0]?.url ? { imageUrl: mediaOv.images[0].url } : {}),
        ...(mediaOv?.price !== undefined ? { shiftWetRate: mediaOv.price } : {}),
        ...(mediaOv?.title ? { modelName: mediaOv.title } : {}),
        ...(mediaOv?.description ? { description: mediaOv.description } : {}),
      };
    });
  }, [srState, prodOverrides]);
}

/**
 * Returns live Admin Global Controls (rainMode, storefrontBanner, deliverySlaMins, emergencyPause).
 */
export function useGlobalControls() {
  const sync = useSafeCononMasterSync();
  return (
    sync?.state.globalControls || {
      rainMode: false,
      storefrontBanner: { enabled: false, text: "", badge: "LIVE", tone: "emerald" as const },
      deliverySlaMins: 60,
      emergencyPause: false,
    }
  );
}

/**
 * Returns live operations state synced across panels.
 */
export function useLiveOperations() {
  const sync = useSafeCononMasterSync();
  return (
    sync?.state.operations || {
      orders: [],
      kycApplications: [],
      approvedVendors: [],
      approvedDrivers: [],
      escrowItems: [],
      disputes: [],
      feedback: [],
      siteDna: {},
    }
  );
}
