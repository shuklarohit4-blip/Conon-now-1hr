import React from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Package, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { CononProductMedia } from "@/components/CononProductMedia";
import { RmcPlantDirect } from "@/pages/RmcPlantDirect";
import { SafetyCollectionStorefront } from "@/components/SafetyCollectionStorefront";
import { PowerToolsSafetyStorefront } from "@/components/PowerToolsSafetyStorefront";
import { LightingCollectionStorefront } from "@/components/LightingCollectionStorefront";
import { SolarCollectionStorefront } from "@/components/SolarCollectionStorefront";
import { InstantSiteKits } from "@/components/home/InstantSiteKits";
import { useLiveCategories, useLiveProducts } from "@/hooks/useCononLiveData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isRmcSlug } from "@workspace/shared";

export function DynamicCategoryPage() {
  const [, params] = useRoute("/category/:categorySlug");
  const slug = params?.categorySlug || "";
  const categories = useLiveCategories();
  const products = useLiveProducts(slug);
  const category = (Array.isArray(categories) ? categories : []).find((c) => c.slug === slug);
  const qc = useQueryClient();
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    },
  });

  if (isRmcSlug(slug)) {
    return (
      <ErrorBoundary fallbackTitle="RMC Plant Direct View">
        <RmcPlantDirect />
      </ErrorBoundary>
    );
  }
  if (slug === "site-kits") {
    return (
      <Layout>
        <div className="min-h-screen bg-[#f4f7fb] pb-24 pt-3">
          <InstantSiteKits />
        </div>
      </Layout>
    );
  }
  if (slug === "lighting" || slug.includes("lighting")) {
    return (
      <Layout>
        <ErrorBoundary fallbackTitle="Lighting Collection">
          <LightingCollectionStorefront />
        </ErrorBoundary>
      </Layout>
    );
  }
  if (slug === "solar-rooftop-power" || slug.includes("solar")) {
    return (
      <Layout>
        <ErrorBoundary fallbackTitle="Solar & Rooftop Power">
          <SolarCollectionStorefront />
        </ErrorBoundary>
      </Layout>
    );
  }
  if (slug === "safety-ppe-workwear" || slug === "safety-workwear" || slug === "site-safety-ppe") {
    return (
      <Layout>
        <ErrorBoundary fallbackTitle="Safety & PPE Workwear">
          <SafetyCollectionStorefront />
        </ErrorBoundary>
      </Layout>
    );
  }
  if (slug === "tools-hardware" || slug === "power-tools-safety") {
    return (
      <Layout>
        <ErrorBoundary fallbackTitle="Tools & Hardware">
          <PowerToolsSafetyStorefront />
        </ErrorBoundary>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f4f7fb] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/home"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {category?.title || slug.replace(/-/g, " ").toUpperCase()}
                  </h1>
                  {category?.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                      {category.badge}
                    </span>
                  )}
                </div>
                {category?.titleHi && (
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{category.titleHi}</p>
                )}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500">
              HSN/SAC {category?.defaultHsn || "38245010"} • {category?.defaultGst ?? 18}% GST •{" "}
              {products.length} Live Item{products.length === 1 ? "" : "s"}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-2">
              <Package className="w-9 h-9 text-amber-500 mx-auto" />
              <h2 className="text-base font-black text-slate-900">
                Category Live &amp; Ready for Products
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Admin can add products and real multi-angle photos into &ldquo;{category?.title || slug}&rdquo; via Catalog &amp; Media Vault and they will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-slate-100">
                      <CononProductMedia
                        mediaType="product"
                        itemId={p.id}
                        slug={p.slug}
                        src={p.primaryImage || p.image}
                        title={p.title || p.name}
                        brand={p.brand || "CONON"}
                        categorySlug={slug}
                        unit={p.unit || "Unit"}
                        variant="cover"
                      />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <span className="text-[10px] font-black uppercase text-blue-700">
                        {p.brand || "CONON"}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-2">
                        {p.title || p.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                  <div className="px-3.5 pb-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                    <div>
                      <span className="text-base font-black font-mono text-slate-900">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold ml-1">
                        /{p.unit || "unit"}
                      </span>
                    </div>
                    {p.inStock === false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-[10px] font-black">
                        Out of Stock
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          addToCart.mutate(
                            {
                              data: {
                                materialId: p.id,
                                name: p.title || p.name,
                                price: Number(p.price || 0),
                                unit: p.unit || "Unit",
                                vendor: p.brand || "CONON Hub",
                                category: slug,
                                quantity: 1,
                              },
                            },
                            {
                              onSuccess: () => toast.success(`${p.title || p.name} added to cart`),
                            }
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] text-white text-[10px] font-black cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DynamicCategoryPage;
