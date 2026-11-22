import React from "react";
import {
  Package, Layers, Blocks, Paintbrush, Grid3x3, Boxes,
  Hammer, Zap, Droplets, Shield, Building2, Wrench, Mountain,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard, type Product } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ALL_CATALOG_PRODUCTS } from "@/components/ProductFeed";
import { HOME_CATEGORIES } from "@/data/homeCategories";
import { CementCollectionStorefront } from "@/components/CementCollectionStorefront";
import { PlywoodCollectionStorefront } from "@/components/PlywoodCollectionStorefront";
import { FevicolCollectionStorefront } from "@/components/FevicolCollectionStorefront";
import { HingesCollectionStorefront } from "@/components/HingesCollectionStorefront";
import { LocksCollectionStorefront } from "@/components/LocksCollectionStorefront";
import { ElectricalCollectionStorefront } from "@/components/ElectricalCollectionStorefront";
import { KitchenCollectionStorefront } from "@/components/KitchenCollectionStorefront";
import { PaintingCollectionStorefront } from "@/components/PaintingCollectionStorefront";
import { HomeDepartmentNav } from "@/components/HomeDepartmentNav";
import { useAddToCart, useUpdateCartItem, useRemoveFromCart, useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BRAND_DARK = "#1848a0";
const BLINKIT_GREEN = "#1848a0";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Cement: Package,
  "TMT Steel": Layers,
  Bricks: Blocks,
  Paint: Paintbrush,
  Sand: Boxes,
  Tiles: Grid3x3,
  Hardware: Hammer,
  Electrical: Zap,
  Plumbing: Droplets,
  Adhesives: Package,
  Waterproofing: Shield,
  Finishing: Building2,
  Tools: Wrench,
  "Marble & Flooring": Mountain,
};

/* Distinct categories, in catalog order. */
const CATEGORIES: string[] = Array.from(new Set(ALL_CATALOG_PRODUCTS.map((p) => p.materialTag)));

export function Categories() {
  const [active, setActive] = React.useState<string>(CATEGORIES[0] ?? "Cement");
  const [detailProduct, setDetailProduct] = React.useState<Product | null>(null);

  React.useEffect(() => {
    if (window.location.pathname.includes("cement")) {
      setActive("Cement");
      return;
    }
    if (
      window.location.pathname.includes("wood-adhesives") ||
      window.location.pathname.includes("adhesive") ||
      window.location.pathname.includes("fevicol")
    ) {
      setActive("Adhesives");
      return;
    }
    if (
      window.location.pathname.includes("plywood") ||
      window.location.pathname.includes("blockboard") ||
      window.location.pathname.includes("wood-boards") ||
      window.location.pathname.endsWith("/wood")
    ) {
      setActive("Wood");
      return;
    }
    if (
      window.location.pathname.includes("hinges") ||
      window.location.pathname.includes("furniture-wardrobe-bed-hardware")
    ) {
      setActive("Hardware");
      return;
    }
    if (
      window.location.pathname.includes("mechanical-locks") ||
      window.location.pathname.includes("door-hardware-locks")
    ) {
      setActive("Locks");
      return;
    }
    if (
      window.location.pathname.includes("electrical") ||
      window.location.pathname.includes("wires") ||
      window.location.pathname.includes("mcb")
    ) {
      setActive("Electrical");
      return;
    }
    if (
      window.location.pathname.includes("sink") ||
      window.location.pathname.includes("kitchen-sinks-faucets")
    ) {
      setActive("Kitchen");
      return;
    }
    if (
      window.location.pathname.includes("interior-emulsions") ||
      window.location.pathname.includes("painting") ||
      window.location.pathname.includes("paint")
    ) {
      setActive("Paint");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat");
    if (catParam) {
      const lower = catParam.toLowerCase();
      if (lower.includes("cement")) {
        setActive("Cement");
        return;
      }
      if (lower.includes("adhesive") || lower.includes("fevicol")) {
        setActive("Adhesives");
        return;
      }
      if (
        lower.includes("plywood") ||
        lower.includes("blockboard") ||
        lower.includes("wood-boards")
      ) {
        setActive("Wood");
        return;
      }
      if (
        lower.includes("hinge") ||
        lower.includes("furniture-wardrobe-bed-hardware")
      ) {
        setActive("Hardware");
        return;
      }
      if (
        lower.includes("lock") ||
        lower.includes("door-hardware-locks")
      ) {
        setActive("Locks");
        return;
      }
      if (
        lower.includes("electrical") ||
        lower.includes("wires") ||
        lower.includes("mcb")
      ) {
        setActive("Electrical");
        return;
      }
      if (
        lower.includes("sink") ||
        lower.includes("kitchen-sinks-faucets")
      ) {
        setActive("Kitchen");
        return;
      }
      if (
        lower.includes("paint") ||
        lower.includes("interior-emulsions")
      ) {
        setActive("Paint");
        return;
      }
      const homeMatch = HOME_CATEGORIES.find(
        (c) =>
          c.slug.toLowerCase() === catParam.toLowerCase() ||
          c.dbCategory.toLowerCase() === catParam.toLowerCase(),
      );
      if (homeMatch) {
        const target = CATEGORIES.find(
          (c) =>
            c.toLowerCase() === homeMatch.dbCategory.toLowerCase() ||
            homeMatch.title.toLowerCase().includes(c.toLowerCase()) ||
            c.toLowerCase().includes(homeMatch.dbCategory.toLowerCase()),
        );
        if (target) {
          setActive(target);
          return;
        }
      }
      const direct = CATEGORIES.find((c) => c.toLowerCase() === catParam.toLowerCase());
      if (direct) setActive(direct);
    }
  }, []);

  const qc = useQueryClient();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  const cartItemByKey = React.useMemo(() => {
    const map: Record<string, { ids: string[]; quantity: number }> = {};
    for (const c of cart?.categories ?? []) {
      for (const it of c.items ?? []) {
        const key = `${(it.category || "").toLowerCase()}::${(it.name || "").toLowerCase()}`;
        const entry = map[key] ?? (map[key] = { ids: [], quantity: 0 });
        entry.ids.push(String(it.id));
        entry.quantity += Number(it.quantity) || 0;
      }
    }
    return map;
  }, [cart]);

  const keyOf = (p: Product) => `${p.materialTag.toLowerCase()}::${p.title.toLowerCase()}`;

  const getCartQty = React.useCallback(
    (p: Product) => cartItemByKey[keyOf(p)]?.quantity ?? 0,
    [cartItemByKey],
  );

  const cartMutationPending = addToCart.isPending || updateCartItem.isPending || removeFromCart.isPending;

  const addProduct = React.useCallback(
    (p: Product) => {
      addToCart.mutate(
        {
          data: {
            materialId: p.id,
            quantity: 1,
            name: p.title,
            price: p.price,
            unit: p.unit || "unit",
            vendor: p.vendor || "CONON-NOW Marketplace",
            category: p.materialTag,
          },
        },
        {
          onSuccess: () => toast.success(`${p.vendor || "Product"} added to cart!`),
          onError:   () => toast.error("Couldn't add to cart", { description: "Please try again." }),
        },
      );
    },
    [addToCart],
  );

  const setProductQty = React.useCallback(
    (p: Product, qty: number) => {
      const entry = cartItemByKey[keyOf(p)];
      if (!entry || entry.ids.length === 0) {
        if (qty > 0) addProduct(p);
        return;
      }
      // Collapse any duplicate lines for this key into a single line.
      entry.ids.slice(1).forEach((extraId) => removeFromCart.mutate({ itemId: extraId }));
      const primaryId = entry.ids[0];
      if (qty <= 0) {
        removeFromCart.mutate({ itemId: primaryId });
        return;
      }
      updateCartItem.mutate({ itemId: primaryId, data: { quantity: qty } });
    },
    [cartItemByKey, addProduct, removeFromCart, updateCartItem],
  );

  const products = ALL_CATALOG_PRODUCTS.filter((p) => p.materialTag === active);

  return (
    <Layout>
      {/* ── Top Department Navigation Bar (Civil & Interiors, Electrical, Tools, etc.) ── */}
      <HomeDepartmentNav
        activeDepartmentId={
          active === "Cement" || active === "Paint"
            ? "civil-interiors"
            : active === "Hardware" || active === "Locks" || active === "Adhesives"
            ? "furniture-hardware"
            : active === "Electrical"
            ? "electrical"
            : active === "Kitchen"
            ? "plumbing-sanitary"
            : undefined
        }
        onSelectDepartment={(dept) => {
          if (dept.id === "civil-interiors") setActive("Cement");
          if (dept.id === "furniture-hardware") setActive("Hardware");
          if (dept.id === "electrical") setActive("Electrical");
          if (dept.id === "plumbing-sanitary") setActive("Kitchen");
        }}
        onSelectCategory={(cat) => {
          if (cat.slug.includes("cement")) {
            setActive("Cement");
            return;
          }
          if (cat.slug.includes("adhesive") || cat.slug.includes("fevicol")) {
            setActive("Adhesives");
            return;
          }
          if (cat.slug.includes("plywood") || cat.slug.includes("wood-boards")) {
            setActive("Wood");
            return;
          }
          if (cat.slug.includes("hinge") || cat.slug.includes("furniture-wardrobe-bed-hardware")) {
            setActive("Hardware");
            return;
          }
          if (cat.slug.includes("lock") || cat.slug.includes("door-hardware-locks")) {
            setActive("Locks");
            return;
          }
          if (cat.slug.includes("electrical") || cat.slug.includes("wires") || cat.slug.includes("mcb")) {
            setActive("Electrical");
            return;
          }
          if (cat.slug.includes("sink") || cat.slug.includes("kitchen-sinks-faucets")) {
            setActive("Kitchen");
            return;
          }
          if (cat.slug.includes("paint") || cat.slug.includes("interior-emulsions")) {
            setActive("Paint");
            return;
          }
          const matched = CATEGORIES.find(
            (c) =>
              c.toLowerCase() === cat.dbCategory.toLowerCase() ||
              cat.title.toLowerCase().includes(c.toLowerCase()),
          );
          if (matched) setActive(matched);
        }}
      />

      {active === "Cement" ? (
        <CementCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Wood" || active.toLowerCase().includes("plywood") ? (
        <PlywoodCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Adhesives" || active.toLowerCase().includes("fevicol") ? (
        <FevicolCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Hardware" || active.toLowerCase().includes("hinge") ? (
        <HingesCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Locks" || active.toLowerCase().includes("lock") ? (
        <LocksCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Electrical" || active.toLowerCase().includes("wire") ? (
        <ElectricalCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Kitchen" || active.toLowerCase().includes("sink") ? (
        <KitchenCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Paint" || active.toLowerCase().includes("paint") ? (
        <PaintingCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : (
        <div className="flex min-h-full">
          {/* Left sidebar — 25% vertical category list */}
          <aside className="w-1/4 shrink-0 bg-slate-50 border-r border-slate-100 overflow-y-auto">
            <div className="py-2">
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] ?? Package;
                const isActive = cat === active;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActive(cat)}
                    className="relative w-full flex flex-col items-center gap-1.5 py-3.5 px-1"
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                        style={{ background: BLINKIT_GREEN }}
                      />
                    )}
                    <span
                      className="flex items-center justify-center w-12 h-12 rounded-2xl transition"
                      style={{
                        background: isActive ? "#eff6ff" : "#ffffff",
                        border: isActive ? `1.5px solid ${BLINKIT_GREEN}` : "1px solid #eef2f6",
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: isActive ? BLINKIT_GREEN : "#64748b" }}
                        strokeWidth={isActive ? 2.4 : 2}
                      />
                    </span>
                    <span
                      className="text-[10px] font-black leading-tight text-center"
                      style={{ color: isActive ? BRAND_DARK : "#94a3b8" }}
                    >
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right container — 75% product grid */}
          <main className="w-3/4 overflow-y-auto">
            <div className="px-4 pt-4 pb-28">
              <h1 className="text-[18px] font-black mb-3" style={{ color: BRAND_DARK }}>
                {active}
              </h1>
              <div className="grid grid-cols-1 gap-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={addProduct}
                    onSetQty={setProductQty}
                    onSeeOptions={setDetailProduct}
                    onVariants={setDetailProduct}
                    onOpenDetail={setDetailProduct}
                    cartQty={getCartQty(p)}
                    isAdding={cartMutationPending}
                  />
                ))}
                {products.length === 0 && (
                  <p className="text-sm text-slate-400 mt-8 text-center">
                    More {active} products coming soon.
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      <ProductDetailModal
        product={detailProduct}
        open={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        onAddToCart={addProduct}
        onSetQty={setProductQty}
        isAdding={cartMutationPending}
        cartQty={detailProduct ? getCartQty(detailProduct) : 0}
      />
    </Layout>
  );
}
