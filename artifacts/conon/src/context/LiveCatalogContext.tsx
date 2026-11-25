import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { resolveApiUrl } from "@/lib/apiBase";
import { getSocket } from "@/services/socket";
import { getLocalVendorCatalog, subscribeToCatalogBus } from "@/services/vendorCatalogSync";
import type { MasterCatalogSKU } from "@/types/catalog";
export type { MasterCatalogSKU };

export interface LiveCatalogContextValue {
  items: MasterCatalogSKU[];
  itemMap: Map<string, MasterCatalogSKU>;
  categories: Array<{ slug: string; name: string; count: number }>;
  brands: string[];
  kpis: {
    totalSkus: number;
    inStockCount: number;
    outOfStockCount: number;
    lowMarginCount: number;
    missingPhotoCount: number;
  };
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  getSku: (id: string) => MasterCatalogSKU | undefined;
  getLiveProduct: <T extends { id?: string; price?: number; mrp?: number; inStock?: boolean }>(
    fallback: T
  ) => T;
}

const LiveCatalogContext = createContext<LiveCatalogContextValue | null>(null);

export function LiveCatalogProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["live-catalog"],
    queryFn: async () => {
      const res = await fetch(resolveApiUrl("/api/catalog/live"));
      if (!res.ok) throw new Error("Failed to load live catalog");
      return res.json();
    },
    staleTime: 1000 * 30, // 30s cache
    refetchOnWindowFocus: false,
  });

  // Real-time Server-Sent Events (SSE), Socket.io & Cross-Tab BroadcastChannel listener
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(resolveApiUrl("/api/events/catalog"));
      es.addEventListener("catalog_updated", (_e) => {
        queryClient.invalidateQueries({ queryKey: ["live-catalog"] });
        queryClient.invalidateQueries({ queryKey: ["mandi-prices"] });
      });
      es.onerror = () => {
        // Auto-reconnect managed by browser EventSource
      };
    } catch {
      // Graceful fallback if SSE unsupported
    }

    // Socket.io real-time catalog event listeners
    const socket = getSocket();
    const handleSocketUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["live-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["mandi-prices"] });
    };

    socket?.on("catalog:stock_updated", handleSocketUpdate);
    socket?.on("catalog:image_updated", handleSocketUpdate);
    socket?.on("catalog:product_created", handleSocketUpdate);
    socket?.on("catalog:price_updated", handleSocketUpdate);
    socket?.on("catalog:category_toggled", handleSocketUpdate);
    socket?.on("catalog:category_restocked", handleSocketUpdate);

    // Cross-Tab BroadcastChannel listener
    const unsubscribeBus = subscribeToCatalogBus(() => {
      queryClient.invalidateQueries({ queryKey: ["live-catalog"] });
    });

    return () => {
      es?.close();
      unsubscribeBus();
      socket?.off("catalog:stock_updated", handleSocketUpdate);
      socket?.off("catalog:image_updated", handleSocketUpdate);
      socket?.off("catalog:product_created", handleSocketUpdate);
      socket?.off("catalog:price_updated", handleSocketUpdate);
      socket?.off("catalog:category_toggled", handleSocketUpdate);
      socket?.off("catalog:category_restocked", handleSocketUpdate);
    };
  }, [queryClient]);

  const items: MasterCatalogSKU[] = data?.items || [];
  const categories = data?.categories || [];
  const brands = data?.brands || [];
  const kpis = data?.kpis || {
    totalSkus: items.length,
    inStockCount: items.filter((i) => i.inStock).length,
    outOfStockCount: items.filter((i) => !i.inStock).length,
    lowMarginCount: 0,
    missingPhotoCount: 0,
  };

  const itemMap = useMemo(() => {
    const map = new Map<string, MasterCatalogSKU>();
    for (const item of items) {
      map.set(item.id, item);
      map.set(item.skuId, item);
      if (item.name) map.set(item.name.toLowerCase().trim(), item);
    }
    return map;
  }, [items]);

  const getSku = (id: string) => {
    if (!id) return undefined;
    return itemMap.get(id) || itemMap.get(id.toLowerCase().trim());
  };

  const getLiveProduct = <T extends { id?: string; price?: number; mrp?: number; inStock?: boolean }>(
    fallback: T
  ): T => {
    if (!fallback?.id) return fallback;
    const live = itemMap.get(fallback.id) || itemMap.get(fallback.id.toLowerCase().trim());
    const vendorOverrides = getLocalVendorCatalog();
    const vendorOverride = vendorOverrides[fallback.id];

    // Priority: Local/Socket Vendor Override > Live Catalog API > Static Fallback
    const resolvedInStock =
      vendorOverride?.inStock !== undefined
        ? vendorOverride.inStock
        : live?.inStock !== undefined
        ? live.inStock
        : fallback.inStock;

    const resolvedImage =
      vendorOverride?.customImage ||
      vendorOverride?.imageUrl ||
      live?.imageUrl ||
      (fallback as any).image;

    const resolvedPrice =
      vendorOverride?.dealerPrice
        ? Math.round(vendorOverride.dealerPrice * 1.1)
        : live?.sellingPrice ?? fallback.price;

    const resolvedMrp =
      vendorOverride?.mrp ?? live?.mrp ?? fallback.mrp;

    return {
      ...fallback,
      price: resolvedPrice,
      mrp: resolvedMrp,
      inStock: resolvedInStock,
      gstPercent: live?.gstPercent ?? (fallback as any).gstPercent,
      hsnCode: live?.hsnCode ?? (fallback as any).hsnCode,
      deliveryVehicleType: live?.deliveryVehicleType ?? (fallback as any).deliveryVehicleType,
      image: resolvedImage,
      highlights: live?.highlights && live.highlights.length > 0 ? live.highlights : (fallback as any).highlights,
      specs: live?.specs && live.specs.length > 0 ? live.specs : (fallback as any).specs,
      shortDescription: live?.shortDescription || (fallback as any).shortDescription,
      fitGuardrailBadge: live?.fitGuardrailBadge || (fallback as any).fitGuardrailBadge,
      pairedProducts: live?.pairedProducts || (fallback as any).pairedProducts,
      isFeatured: live?.isFeatured ?? (fallback as any).isFeatured,
    };
  };

  const value = {
    items,
    itemMap,
    categories,
    brands,
    kpis,
    isLoading,
    isError,
    refetch,
    getSku,
    getLiveProduct,
  };

  return <LiveCatalogContext.Provider value={value}>{children}</LiveCatalogContext.Provider>;
}

export function useLiveCatalog() {
  const ctx = useContext(LiveCatalogContext);
  if (!ctx) {
    throw new Error("useLiveCatalog must be used within a LiveCatalogProvider");
  }
  return ctx;
}

export function useSafeLiveCatalog() {
  return useContext(LiveCatalogContext);
}
