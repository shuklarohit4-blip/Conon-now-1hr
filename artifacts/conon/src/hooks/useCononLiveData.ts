import { useMemo } from "react";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { useSafeProductMediaVault } from "@/context/ProductMediaVaultContext";
import { getAllVaultOverridesList, sanitizeFolderSlug } from "@/services/productMediaVault";
import { type HomeCategory } from "@/data/homeCategories";
import { useLiveCategoriesStore } from "@/services/liveCategoriesStore";
import { useLiveProductsStore } from "@/services/liveProductsStore";
import { CATALOG_PRODUCTS, type IProduct } from "@/data/catalogData";
import {
  FALLBACK_SERVICE_CATALOG,
  FALLBACK_RENTAL_CATALOG,
  type ServiceCatalogItem,
  type MachineRentalCatalogItem,
} from "@/services/servicesRentalsSync";
import { LUCKNOW_RMC_GRADES, type RmcGradeItem } from "@/data/lucknowRmcCatalog";

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
 * Returns authoritative backend categories from `GET /api/categories`,
 * automatically synced in real time with Admin Panel edits & uploads.
 */
export function useLiveCategories(options?: { includeInactive?: boolean }): HomeCategory[] {
  const { categories } = useLiveCategoriesStore(options);
  return categories;
}

/**
 * Returns base catalog products + Admin customProducts, filtered by hiddenProductIds,
 * merged with Admin overrides & live Mandi Rates.
 */
export function useLiveProducts(categorySlug?: string): IProduct[] {
  const sync = useSafeCononMasterSync();
  const vault = useSafeProductMediaVault();
  const liveBackendProducts = useLiveProductsStore();
  const prodState = sync?.state.products;
  const mandiRates = sync?.state.mandiRates;

  return useMemo(() => {
    const hidden = new Set(prodState?.hiddenProductIds || []);
    const overrides = prodState?.overrides || {};
    const custom = (prodState?.customProducts || []) as IProduct[];

    const baseList =
      liveBackendProducts.loadedFromBackend && liveBackendProducts.products.length > 0
        ? (liveBackendProducts.products as unknown as IProduct[])
        : CATALOG_PRODUCTS;

    const existingIds = new Set(baseList.map((p) => p.id));
    const vaultCustomProducts: IProduct[] = vault
      ? getAllVaultOverridesList()
          .filter((ov) => ov.isCustomItem && !existingIds.has(ov.productId))
          .map((ov) => ({
            id: ov.productId,
            slug: ov.slug || ov.productId,
            title: ov.title || ov.productId,
            name: ov.title || ov.productId,
            brand: ov.brand || "CONON",
            categorySlug: ov.categorySlug || "cement-civil-works",
            subCategory: ov.subcategory,
            price: ov.price ?? 0,
            mrp: ov.mrp ?? ov.price ?? 0,
            unit: ov.unit || "Unit",
            inStock: ov.isInStock !== false,
            image: ov.images?.[0]?.url || "",
            description: ov.description || "",
            gstRate: ov.gstRate ?? 18,
            hsnCode: ov.hsnCode || "38245010",
            rentPricePerDay: ov.rentPricePerDay,
            dcrEligible: ov.dcrSubsidyEligible,
          } as unknown as IProduct))
      : [];

    const allWithVault = [...baseList, ...vaultCustomProducts];
    const seenIds = new Set(allWithVault.map((p) => p.id));
    const mergedSource = [
      ...allWithVault,
      ...custom.filter((c) => c?.id && !seenIds.has(c.id)),
    ].filter((p) => {
      if (!p || hidden.has(p.id)) return false;
      if (categorySlug && p.categorySlug !== categorySlug) return false;
      return true;
    });

    return mergedSource.map((p) => {
      const be = liveBackendProducts.byId.get(p.id) || (p.slug ? liveBackendProducts.byId.get(p.slug) : undefined);
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
        be?.galleryImages && be.galleryImages.length > 0
          ? be.galleryImages
          : matchedOv?.images && matchedOv.images.length > 0
          ? matchedOv.images
          : (vaultResolved as any).galleryImages || [];

      const primaryImage =
        mergedImages[0]?.url || be?.imageUrl || (vaultResolved as any).primaryImage || p.image || "";

      return {
        ...vaultResolved,
        ...(be || {}),
        ...(matchedOv?.title ? { title: matchedOv.title, name: matchedOv.title } : {}),
        ...(matchedOv?.brand ? { brand: matchedOv.brand } : {}),
        ...(matchedOv?.description !== undefined ? { description: matchedOv.description } : {}),
        ...(matchedOv?.specBullets?.length ? { highlights: matchedOv.specBullets } : {}),
        ...(matchedOv?.price !== undefined ? { price: matchedOv.price } : be?.sellingPrice !== undefined ? { price: be.sellingPrice } : mandiHit ? { price: mandiHit.price } : {}),
        ...(matchedOv?.mrp !== undefined ? { mrp: matchedOv.mrp } : be?.mrp !== undefined ? { mrp: be.mrp } : {}),
        ...(matchedOv?.unit ? { unit: matchedOv.unit } : {}),
        ...(matchedOv?.inStock !== undefined ? { inStock: matchedOv.inStock } : be?.isInStock !== undefined ? { inStock: be.isInStock } : {}),
        ...(matchedOv?.isInStock !== undefined ? { inStock: matchedOv.isInStock } : {}),
        image: primaryImage,
        primaryImage,
        galleryImages: mergedImages,
        images: mergedImages.map((m: any) => m.url).filter(Boolean),
        isAdminVerifiedMedia: mergedImages.length > 0,
      } as unknown as IProduct;
    });
  }, [prodState, mandiRates, vault, categorySlug, liveBackendProducts.products, liveBackendProducts.loadedFromBackend]);
}

/**
 * Generic product-list merger hook that preserves the caller's exact item type (e.g. `Product` or `IProduct`)
 * while applying Admin hiddenProductIds, product overrides, DB backend edits, Mandi rates, and Media Vault photos.
 */
export function useLiveProductMerger() {
  const sync = useSafeCononMasterSync();
  const vault = useSafeProductMediaVault();
  const liveBackendProducts = useLiveProductsStore();
  const prodState = sync?.state.products;
  const mandiRates = sync?.state.mandiRates;

  return useMemo(() => {
    const hidden = new Set(prodState?.hiddenProductIds || []);
    const overrides = prodState?.overrides || {};

    return <T extends { id: string; slug?: string; title?: string; name?: string; brand?: string; categorySlug?: string; image?: string }>(
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
          const be = liveBackendProducts.byId.get(p.id) || (p.slug ? liveBackendProducts.byId.get(p.slug) : undefined);
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
            be?.galleryImages && be.galleryImages.length > 0
              ? be.galleryImages
              : matchedOv?.images && matchedOv.images.length > 0
              ? matchedOv.images
              : vaultResolved.galleryImages || [];

          const primaryImage =
            mergedImages[0]?.url || be?.imageUrl || vaultResolved.primaryImage || p.image || "";

          return {
            ...p,
            ...vaultResolved,
            ...(be ? {
              title: be.title,
              name: be.title,
              brand: be.brand,
              price: be.sellingPrice,
              mrp: be.mrp,
              unit: be.unit,
              description: be.description,
              inStock: be.isInStock,
              highlightTiles: be.highlightTiles,
              keyInfo: be.keyInfo,
              usageTips: be.usageTips,
              variants: be.variants,
              bulkPricingTiers: be.bulkPricingTiers,
            } : {}),
            ...(matchedOv?.title ? { title: matchedOv.title } : {}),
            ...(matchedOv?.brand ? { brand: matchedOv.brand } : {}),
            ...(matchedOv?.description !== undefined ? { description: matchedOv.description } : {}),
            ...(matchedOv?.specBullets?.length ? { specBullets: matchedOv.specBullets } : {}),
            ...(matchedOv?.price !== undefined ? { price: matchedOv.price } : be?.sellingPrice !== undefined ? { price: be.sellingPrice } : mandiHit ? { price: mandiHit.price } : {}),
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
  }, [prodState, mandiRates, vault, liveBackendProducts.byId, liveBackendProducts.products]);
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
 * Returns live RMC Plant Direct grades merged with Admin Media Vault & price overrides.
 */
export function useLiveRmcGrades(): (RmcGradeItem & { imageUrl: string })[] {
  const sync = useSafeCononMasterSync();
  const prodOverrides = sync?.state.products.overrides;

  return useMemo(() => {
    return LUCKNOW_RMC_GRADES.map((g) => {
      const ov = prodOverrides?.[g.id] || prodOverrides?.[g.slug];
      return {
        ...g,
        ...(ov?.price !== undefined ? { ratePerM3: ov.price } : {}),
        ...(ov?.title ? { nameEn: ov.title } : {}),
        ...(ov?.description ? { description: ov.description } : {}),
        imageUrl: ov?.images?.[0]?.url || "",
      };
    });
  }, [prodOverrides]);
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
