/* ─────────────────────────────────────────────────────────────────────
   CONON-NOW Disk-Backed Product Image Resolution
   Zero hardcoded legacy / @assets URLs. Routes exclusively through
   REAL_MEDIA_MANIFEST and active Media Vault overrides.
   ─────────────────────────────────────────────────────────────────── */
import {
  getVaultOverrideForProduct,
  resolveVaultAssetUrl,
  isLegacyBrokenImageUrl,
} from "@/services/productMediaVault";

export const PROD = (_slug: string): string => "";

export function resolveProductImage(category: string, name: string): string {
  const vaultOverride = getVaultOverrideForProduct({ title: name, categorySlug: category, category });
  if (vaultOverride?.images && vaultOverride.images.length > 0) {
    const vaultUrl = resolveVaultAssetUrl(
      vaultOverride.images[0].url,
      vaultOverride.images[0].fallbackDataUrl
    );
    if (vaultUrl && !isLegacyBrokenImageUrl(vaultUrl)) {
      return vaultUrl;
    }
  }
  return "";
}
