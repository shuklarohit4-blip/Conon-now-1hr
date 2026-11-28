import { useEffect, useState } from "react";
import { apiUrl, getAdminHeaders } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";
import { getSocket } from "@/services/socket";
import type { LiveProductRecord } from "@/services/liveProductsStore";

export interface SearchStageShortcut {
  id: string;
  label: string;
  icon: string;
  description: string;
  keywords: string[];
  categorySlugs: string[];
  isActive: boolean;
  order: number;
}

export interface SearchSynonymRule {
  id: string;
  keywords: string[];
  mapsTo: string;
  categorySlug?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface SearchStudioConfig {
  placeholders: string[];
  trendingSearches: string[];
  stageShortcuts: SearchStageShortcut[];
  voiceSearchEnabled: boolean;
  siteParchiEnabled: boolean;
  updatedAt: string;
}

export interface SearchSuggestionResponse {
  query: string;
  matchedSynonymHint?: { keyword: string; mapsTo: string; categorySlug?: string } | null;
  categories: Array<{ slug: string; title: string; imageUrl: string; productCount: number }>;
  brands: Array<{ name: string; count: number }>;
  products: LiveProductRecord[];
}

export interface SearchResultsResponse {
  query: string;
  cleanQuery: string;
  total: number;
  items: LiveProductRecord[];
  matchedSynonymHint?: { keyword: string; mapsTo: string; categorySlug?: string } | null;
  inferredFilters?: { minPrice: number | null; maxPrice: number | null };
  didYouMean: string[];
  facets: {
    categories: Array<{ slug: string; title: string; imageUrl: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
  };
}

export interface ParchiLineMatch {
  lineId: string;
  rawLine: string;
  detectedQty: number;
  detectedUnit: string;
  query: string;
  matchedProduct: LiveProductRecord | null;
  alternatives: LiveProductRecord[];
  effectiveUnitPrice: number;
  bulkApplied: boolean;
  lineTotal: number;
  savings: number;
}

export interface ParchiParseResponse {
  lines: ParchiLineMatch[];
  matchedCount: number;
  totalLines: number;
  grandTotal: number;
  totalSavings: number;
}

export interface SearchSourcingRequest {
  id: string;
  itemName: string;
  quantityText: string;
  phone: string;
  pincode?: string;
  status: "NEW" | "CONTACTED" | "ADDED_TO_CATALOG";
  createdAt: string;
  updatedAt: string;
}

export interface AdminSearchStudioData {
  config: SearchStudioConfig;
  synonyms: SearchSynonymRule[];
  analytics: {
    days: number;
    totalSearches: number;
    topSearches: Array<{ query: string; count: number; lastSearchedAt: string; avgResults: number }>;
    zeroResultQueries: Array<{ query: string; count: number; lastSearchedAt: string }>;
  };
  requests: SearchSourcingRequest[];
}

const DEFAULT_SEARCH_CONFIG: SearchStudioConfig = {
  placeholders: [
    'Search "UltraTech Cement"',
    'Search "12mm TMT Sariya"',
    'Search "Morang 50 Kg"',
    'Search "Dr. Fixit Seelan"',
    'Search "CPVC Pipe"',
  ],
  trendingSearches: [
    "UltraTech PPC",
    "ACC Suraksha",
    "Dr. Fixit LW+",
    "12mm Sariya",
    "Birla Putty",
    "Astral CPVC",
  ],
  stageShortcuts: [],
  voiceSearchEnabled: true,
  siteParchiEnabled: true,
  updatedAt: "",
};

let cfgState: {
  config: SearchStudioConfig;
  synonyms: SearchSynonymRule[];
  loaded: boolean;
} = {
  config: DEFAULT_SEARCH_CONFIG,
  synonyms: [],
  loaded: false,
};

const listeners = new Set<(s: typeof cfgState) => void>();
let inFlight: Promise<SearchStudioConfig> | null = null;
let started = false;

function notify() {
  for (const fn of listeners) fn(cfgState);
}

export async function refreshSearchConfig(force = false): Promise<SearchStudioConfig> {
  if (inFlight && !force) return inFlight;
  const run = async () => {
    try {
      const res = await fetch(apiUrl("/api/search/config"), {
        method: "GET",
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.config) {
          cfgState = {
            config: json.config,
            synonyms: Array.isArray(json.synonyms) ? json.synonyms : [],
            loaded: true,
          };
          notify();
          return cfgState.config;
        }
      }
    } catch {}
    return cfgState.config;
  };
  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshSearchConfig(true);
  subscribeSseSync((msg) => {
    if (msg.type === "SEARCH_UPDATED" || msg.type === "CATALOG_UPDATED" || msg.type === "FORCE_SYNC") {
      void refreshSearchConfig(true);
    }
  });
  try {
    const s = getSocket() as any;
    s?.on?.("search:updated", () => void refreshSearchConfig(true));
  } catch {}
}

export function useLiveSearchConfig() {
  const [snap, setSnap] = useState(() => cfgState);
  useEffect(() => {
    ensureStarted();
    setSnap(cfgState);
    listeners.add(setSnap);
    return () => {
      listeners.delete(setSnap);
    };
  }, []);
  return {
    config: snap.config,
    synonyms: snap.synonyms,
    loaded: snap.loaded,
    refresh: () => refreshSearchConfig(true),
  };
}

export async function fetchSearchSuggestions(q: string): Promise<SearchSuggestionResponse> {
  const res = await fetch(apiUrl(`/api/search/suggest?q=${encodeURIComponent(q)}`), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Suggest request failed");
  return res.json();
}

export async function fetchSmartSearch(params: {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
  inStock?: boolean;
  bulkOnly?: boolean;
  stage?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}): Promise<SearchResultsResponse> {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.category) usp.set("category", params.category);
  if (params.brand) usp.set("brand", params.brand);
  if (params.sort) usp.set("sort", params.sort);
  if (params.inStock) usp.set("inStock", "1");
  if (params.bulkOnly) usp.set("bulkOnly", "1");
  if (params.stage) usp.set("stage", params.stage);
  if (typeof params.minPrice === "number") usp.set("minPrice", String(params.minPrice));
  if (typeof params.maxPrice === "number") usp.set("maxPrice", String(params.maxPrice));
  if (params.limit) usp.set("limit", String(params.limit));

  const res = await fetch(apiUrl(`/api/search?${usp.toString()}`), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function parseSiteParchiList(text: string): Promise<ParchiParseResponse> {
  const res = await fetch(apiUrl("/api/search/parse-list"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Failed parsing Site Parchi list");
  }
  return data;
}

export async function submitSourcingRequest(payload: {
  itemName: string;
  quantityText: string;
  phone: string;
  pincode?: string;
}): Promise<SearchSourcingRequest> {
  const res = await fetch(apiUrl("/api/search/requests"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.request) {
    throw new Error(data?.error || "Failed submitting sourcing request");
  }
  return data.request;
}

export async function fetchAdminSearchStudio(days: 7 | 30 = 30): Promise<AdminSearchStudioData> {
  const res = await fetch(apiUrl(`/api/admin/search/studio?days=${days}`), {
    cache: "no-store",
    credentials: "include",
    headers: getAdminHeaders(),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.config) {
    throw new Error(data?.error || "Failed loading Search Studio");
  }
  return data;
}

export async function saveAdminSearchConfig(patch: Partial<SearchStudioConfig>): Promise<SearchStudioConfig> {
  const res = await fetch(apiUrl("/api/admin/search/config"), {
    method: "PUT",
    credentials: "include",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.config) {
    throw new Error(data?.error || "Failed updating search settings");
  }
  await refreshSearchConfig(true);
  return data.config;
}

export async function saveAdminSynonym(payload: {
  id?: string;
  keywords: string[];
  mapsTo: string;
  categorySlug?: string;
  isActive?: boolean;
}): Promise<SearchSynonymRule> {
  const url = payload.id
    ? apiUrl(`/api/admin/search/synonyms/${encodeURIComponent(payload.id)}`)
    : apiUrl("/api/admin/search/synonyms");
  const res = await fetch(url, {
    method: payload.id ? "PUT" : "POST",
    credentials: "include",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.synonym) {
    throw new Error(data?.error || "Failed saving synonym");
  }
  return data.synonym;
}

export async function deleteAdminSynonym(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/search/synonyms/${encodeURIComponent(id)}`), {
    method: "DELETE",
    credentials: "include",
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error("Failed deleting synonym");
}

export async function updateSourcingRequestStatus(
  id: string,
  status: "NEW" | "CONTACTED" | "ADDED_TO_CATALOG"
): Promise<SearchSourcingRequest> {
  const res = await fetch(apiUrl(`/api/admin/search/requests/${encodeURIComponent(id)}`), {
    method: "PATCH",
    credentials: "include",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.request) {
    throw new Error(data?.error || "Failed updating request status");
  }
  return data.request;
}
