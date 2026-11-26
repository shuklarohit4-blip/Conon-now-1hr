import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// One-Time Clean Slate Migration v1:
// Purges stale dummy partner sessions and mock orders from localStorage while preserving user preferences
if (typeof window !== "undefined") {
  try {
    const CLEAN_SLATE_KEY = "conon_clean_slate_v1";
    if (localStorage.getItem(CLEAN_SLATE_KEY) !== "true") {
      const keysToClear = [
        "conon_relay_state_v3",
        "conon_relay_state_v2",
        "conon_kyc_state_v2",
        "conon_kyc_state",
        "conon_active_applicant_id",
        "conon_vendor_store",
        "conon_active_driver_v1",
        "conon_demo_orders",
        "conon_demo_session",
        "conon_vendor_session",
        "conon_driver_session",
      ];
      for (const k of keysToClear) {
        localStorage.removeItem(k);
      }
      localStorage.setItem(CLEAN_SLATE_KEY, "true");
    }
  } catch {}

  // One-Time Clean Media Wipe Migration v2:
  // Clears stale Base64 blobs and deleted legacy product image URLs from browser storage
  // while strictly preserving user auth, theme, language, KYC, and wallet state.
  try {
    const MEDIA_WIPE_KEY = "conon_media_clean_wipe_v2";
    if (localStorage.getItem(MEDIA_WIPE_KEY) !== "true") {
      localStorage.removeItem("conon_custom_media_v1");

      // Scrub legacy product/AI image URLs from cached vendor catalog if present
      const vendorCatalogRaw = localStorage.getItem("conon_vendor_catalog_v1");
      if (vendorCatalogRaw) {
        try {
          const parsed = JSON.parse(vendorCatalogRaw);
          if (parsed && Array.isArray(parsed.items)) {
            parsed.items = parsed.items.map((it: Record<string, any>) => ({
              ...it,
              imageUrl: "",
              customImage: null,
            }));
            localStorage.setItem("conon_vendor_catalog_v1", JSON.stringify(parsed));
          }
        } catch {
          localStorage.removeItem("conon_vendor_catalog_v1");
        }
      }

      // Scrub legacy product image URLs from master catalog products cache if present
      for (const key of ["conon_master_products_v1", "conon_master_catalog_v1"]) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.map((p: Record<string, any>) => ({
                ...p,
                imageUrl:
                  typeof p.imageUrl === "string" && p.imageUrl.startsWith("/real-products/")
                    ? p.imageUrl
                    : "",
              }));
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }

      // Mark IndexedDB store to be cleaned before first read in productMediaVault
      localStorage.setItem("conon_idb_wipe_pending_v2", "true");
      localStorage.setItem(MEDIA_WIPE_KEY, "true");
    }
  } catch {}
}

createRoot(document.getElementById("root")!).render(<App />);
