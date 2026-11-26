import React from "react";
import {
  Package, Layers, Blocks, Paintbrush, Grid3x3, Boxes,
  Hammer, Zap, Droplets, Shield, Building2, Wrench, Mountain,
  type LucideIcon,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard, type Product } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { VariantSelectorSheet } from "@/components/VariantSelectorSheet";
import { ALL_CATALOG_PRODUCTS } from "@/components/ProductFeed";
import { useLiveProductMerger } from "@/hooks/useCononLiveData";
import { HOME_CATEGORIES } from "@/data/homeCategories";
import { CementCollectionStorefront } from "@/components/CementCollectionStorefront";
import { PlywoodCollectionStorefront } from "@/components/PlywoodCollectionStorefront";
import { FevicolCollectionStorefront } from "@/components/FevicolCollectionStorefront";
import { FurnitureHardwareStorefront } from "@/components/FurnitureHardwareStorefront";
import { DoorHardwareStorefront } from "@/components/DoorHardwareStorefront";
import { ElectricalCollectionStorefront } from "@/components/ElectricalCollectionStorefront";
import { KitchenCollectionStorefront } from "@/components/KitchenCollectionStorefront";
import { ModularKitchenStorefront } from "@/components/ModularKitchenStorefront";
import { PaintingCollectionStorefront } from "@/components/PaintingCollectionStorefront";
import { CCTVCollectionStorefront } from "@/components/CCTVCollectionStorefront";
import { TilesCollectionStorefront } from "@/components/TilesCollectionStorefront";
import { LightingCollectionStorefront } from "@/components/LightingCollectionStorefront";
import { SafetyCollectionStorefront } from "@/components/SafetyCollectionStorefront";
import { CPVCPlumbingStorefront } from "@/components/CPVCPlumbingStorefront";
import { SanitaryBathCollectionStorefront } from "@/components/SanitaryBathCollectionStorefront";
import { AppliancesCollectionStorefront } from "@/components/AppliancesCollectionStorefront";
import { BricksMasonryStorefront } from "@/components/BricksMasonryStorefront";
import { PowerToolsSafetyStorefront } from "@/components/PowerToolsSafetyStorefront";
import { KitchenSinksStorefront } from "@/components/KitchenSinksStorefront";
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
  Wood: Layers,
  Kitchen: Package,
  Appliances: Zap,
};

/* Distinct categories, in catalog order. */
const CATEGORIES: string[] = [
  ...Array.from(new Set(ALL_CATALOG_PRODUCTS.map((p) => p.materialTag))),
  "Bricks",
  "Wood",
  "Kitchen",
  "Appliances",
];

export function Categories() {
  const [active, setActive] = React.useState<string>(CATEGORIES[0] ?? "Cement");
  const [detailProduct, setDetailProduct] = React.useState<Product | null>(null);
  const [variantSheetProduct, setVariantSheetProduct] = React.useState<Product | null>(null);

  React.useEffect(() => {
    if (
      window.location.pathname.includes("bricks") ||
      window.location.pathname.includes("sand-morang") ||
      window.location.pathname.includes("morang") ||
      window.location.pathname.includes("gitti") ||
      window.location.pathname.includes("aac") ||
      window.location.pathname.includes("eeta") ||
      window.location.pathname.includes("aggregate") ||
      window.location.pathname.includes("paver")
    ) {
      setActive("Bricks");
      return;
    }
    if (
      window.location.pathname.includes("complete-sanitary-sets") ||
      window.location.pathname.includes("wc-concealed-cisterns") ||
      window.location.pathname.includes("concealed-systems") ||
      window.location.pathname.includes("wash-basins") ||
      window.location.pathname.includes("mixers-diverters-shower") ||
      window.location.pathname.includes("bathroom-fittings-accessories") ||
      window.location.pathname.includes("urinals") ||
      window.location.pathname.includes("sanitary-bath-fittings") ||
      window.location.pathname.includes("sanitary")
    ) {
      setActive("Sanitary");
      return;
    }
    if (
      window.location.pathname.includes("cpvc-pipes-hardware") ||
      window.location.pathname.includes("cpvc-plumbing-tanks") ||
      window.location.pathname.includes("cpvc") ||
      window.location.pathname.includes("upvc") ||
      window.location.pathname.includes("swr") ||
      window.location.pathname.includes("solvent-cements") ||
      window.location.pathname.includes("water-tanks") ||
      window.location.pathname.includes("overhead-water-tanks") ||
      window.location.pathname.includes("plumbing")
    ) {
      setActive("Plumbing");
      return;
    }
    if (
      window.location.pathname.includes("ceiling-panel-lights") ||
      window.location.pathname.includes("lighting")
    ) {
      setActive("Lighting");
      return;
    }
    if (
      window.location.pathname.includes("tile-adhesives") ||
      window.location.pathname.includes("tile-stone-installation") ||
      window.location.pathname.includes("tiles") ||
      window.location.pathname.includes("granite") ||
      window.location.pathname.includes("marble") ||
      window.location.pathname.includes("vitrified") ||
      window.location.pathname.includes("grouts")
    ) {
      setActive("Tiles");
      return;
    }
    if (
      window.location.pathname.includes("cement") ||
      window.location.pathname.includes("tmt") ||
      window.location.pathname.includes("sariya") ||
      window.location.pathname.includes("binding-wire") ||
      window.location.pathname.includes("waterproofing") ||
      window.location.pathname.includes("sand-plaster") ||
      window.location.pathname.includes("masonry-tools") ||
      window.location.pathname.includes("chemicals")
    ) {
      setActive("Cement");
      return;
    }
    if (
      window.location.pathname.includes("wood-adhesives") ||
      (window.location.pathname.includes("adhesive") && !window.location.pathname.includes("tile")) ||
      window.location.pathname.includes("fevicol")
    ) {
      setActive("Adhesives");
      return;
    }
    if (
      window.location.pathname.includes("plywood") ||
      window.location.pathname.includes("blockboard") ||
      window.location.pathname.includes("wood-boards") ||
      window.location.pathname.includes("flush-door") ||
      window.location.pathname.includes("laminates") ||
      window.location.pathname.includes("hardware-locks-hinges") ||
      window.location.pathname.includes("hdhmr") ||
      window.location.pathname.includes("mdf") ||
      window.location.pathname.includes("boilo") ||
      window.location.pathname.includes("laminate") ||
      window.location.pathname.includes("wpc-flush-doors") ||
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
      window.location.pathname.includes("kitchen-sinks") ||
      window.location.pathname.includes("kitchen-sinks-faucets") ||
      window.location.pathname.includes("ss-sinks") ||
      window.location.pathname.includes("sink")
    ) {
      setActive("Kitchen Sinks");
      return;
    }
    if (
      window.location.pathname.includes("modular-kitchen-systems") ||
      window.location.pathname.includes("waste-bins-other-accessories") ||
      window.location.pathname.includes("skirting-hardware") ||
      window.location.pathname.includes("pullouts-baskets-wickers") ||
      window.location.pathname.includes("magic-corner-pantry-units-pulldown") ||
      window.location.pathname.includes("tandems-inserts") ||
      window.location.pathname.includes("kitchen")
    ) {
      setActive("Kitchen");
      return;
    }
    if (
      window.location.pathname.includes("ceiling-fans") ||
      window.location.pathname.includes("chimney") ||
      window.location.pathname.includes("pedestal-fans") ||
      window.location.pathname.includes("exhaust") ||
      window.location.pathname.includes("water-heater-geyser") ||
      window.location.pathname.includes("ups-inverter-batteries") ||
      window.location.pathname.includes("pumps-motors") ||
      window.location.pathname.includes("home-appliances") ||
      window.location.pathname.includes("appliances")
    ) {
      setActive("Appliances");
      return;
    }
    if (
      window.location.pathname.includes("interior-emulsions") ||
      window.location.pathname.includes("painting") ||
      window.location.pathname.includes("paint") ||
      window.location.pathname.includes("putty") ||
      window.location.pathname.includes("primer") ||
      window.location.pathname.includes("enamel") ||
      window.location.pathname.includes("distemper")
    ) {
      setActive("Paint");
      return;
    }
    if (
      window.location.pathname.includes("cameras") ||
      window.location.pathname.includes("cctv") ||
      window.location.pathname.includes("dvr-nvr") ||
      window.location.pathname.includes("nvr-dvr-switches") ||
      window.location.pathname.includes("surveillance-storage") ||
      window.location.pathname.includes("cctv-lan-cables") ||
      window.location.pathname.includes("power-poe-switches") ||
      window.location.pathname.includes("routers-racks-accessories") ||
      window.location.pathname.includes("wifi-networking") ||
      window.location.pathname.includes("cctv-cat6-cable") ||
      window.location.pathname.includes("cctv-accessories") ||
      window.location.pathname.includes("rack-connectors-hardware")
    ) {
      setActive("CCTV");
      return;
    }
    if (
      window.location.pathname.includes("shoes-gloves") ||
      window.location.pathname.includes("safety-workwear") ||
      window.location.pathname.includes("safety")
    ) {
      setActive("Safety");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat");
    if (catParam) {
      const lower = catParam.toLowerCase();
      if (
        lower.includes("brick") ||
        lower.includes("morang") ||
        lower.includes("gitti") ||
        lower.includes("aac") ||
        lower.includes("eeta") ||
        lower.includes("aggregate") ||
        lower.includes("paver") ||
        lower === "sand"
      ) {
        setActive("Bricks");
        return;
      }
      if (
        lower.includes("complete-sanitary-sets") ||
        lower.includes("wc-concealed-cisterns") ||
        lower.includes("concealed-systems") ||
        lower.includes("wash-basins") ||
        lower.includes("mixers-diverters-shower") ||
        lower.includes("bathroom-fittings-accessories") ||
        lower.includes("urinals") ||
        lower.includes("sanitary-bath-fittings") ||
        lower.includes("sanitary")
      ) {
        setActive("Sanitary");
        return;
      }
      if (
        lower.includes("cpvc-pipes-hardware") ||
        lower.includes("cpvc-plumbing-tanks") ||
        lower.includes("cpvc") ||
        lower.includes("plumbing")
      ) {
        setActive("Plumbing");
        return;
      }
      if (
        lower.includes("ceiling-panel") ||
        lower.includes("lighting")
      ) {
        setActive("Lighting");
        return;
      }
      if (
        lower.includes("shoes-gloves") ||
        lower.includes("safety-workwear") ||
        lower.includes("safety") ||
        lower.includes("power-tools") ||
        lower.includes("tools")
      ) {
        setActive("Power Tools");
        return;
      }
      if (
        lower.includes("tile-adhesives") ||
        lower.includes("tile-stone") ||
        lower.includes("tiles") ||
        lower.includes("tile") ||
        lower.includes("granite") ||
        lower.includes("marble") ||
        lower.includes("vitrified") ||
        lower.includes("grouts")
      ) {
        setActive("Tiles");
        return;
      }
      if (
        lower.includes("cement") ||
        lower.includes("tmt") ||
        lower.includes("sariya") ||
        lower.includes("binding-wire") ||
        lower.includes("waterproofing") ||
        lower.includes("sand-plaster") ||
        lower.includes("masonry-tools") ||
        lower.includes("chemical")
      ) {
        setActive("Cement");
        return;
      }
      if (lower.includes("adhesive") || lower.includes("fevicol")) {
        setActive("Adhesives");
        return;
      }
      if (
        lower.includes("plywood") ||
        lower.includes("block-board") ||
        lower.includes("wood-boards") ||
        lower.includes("flush-door") ||
        lower.includes("laminate") ||
        lower.includes("hardware-locks-hinges") ||
        lower.includes("HDHMR") ||
        lower.includes("mdf") ||
        lower.includes("boilo") ||
        lower.includes("wpc-flush-doors")
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
        lower.includes("kitchen-sinks") ||
        lower.includes("kitchen-sinks-faucets") ||
        lower.includes("ss-sinks") ||
        lower.includes("sink")
      ) {
        setActive("Kitchen Sinks");
        return;
      }
      if (
        lower.includes("modular-kitchen-systems") ||
        lower.includes("waste-bins") ||
        lower.includes("skirting") ||
        lower.includes("pullouts") ||
        lower.includes("baskets") ||
        lower.includes("magic-corner") ||
        lower.includes("tandems") ||
        lower.includes("kitchen")
      ) {
        setActive("Kitchen");
        return;
      }
      if (
        lower.includes("ceiling-fan") ||
        lower.includes("chimney") ||
        lower.includes("pedestal-fan") ||
        lower.includes("exhaust") ||
        lower.includes("water-heater") ||
        lower.includes("geyser") ||
        lower.includes("inverter") ||
        lower.includes("ups") ||
        lower.includes("batteries") ||
        lower.includes("pumps") ||
        lower.includes("motors") ||
        lower.includes("home-appliances") ||
        lower.includes("appliances")
      ) {
        setActive("Appliances");
        return;
      }
      if (
        lower.includes("paint") ||
        lower.includes("interior-emulsions")
      ) {
        setActive("Paint");
        return;
      }
      if (
        lower.includes("cctv") ||
        lower.includes("camera") ||
        lower.includes("nvr") ||
        lower.includes("dvr") ||
        lower.includes("switch") ||
        lower.includes("wifi") ||
        lower.includes("cat6") ||
        lower.includes("networking")
      ) {
        setActive("CCTV");
        return;
      }
      if (
        lower.includes("brick") ||
        lower.includes("morang") ||
        lower.includes("gitti") ||
        lower.includes("aac") ||
        lower.includes("eeta") ||
        lower.includes("aggregate") ||
        lower.includes("paver") ||
        lower === "sand"
      ) {
        setActive("Bricks");
        return;
      }
      if (
        lower.includes("complete-sanitary-sets") ||
        lower.includes("wc-concealed-cisterns") ||
        lower.includes("concealed-systems") ||
        lower.includes("wash-basins") ||
        lower.includes("mixers-diverters-shower") ||
        lower.includes("bathroom-fittings-accessories") ||
        lower.includes("urinals") ||
        lower.includes("sanitary-bath-fittings") ||
        lower.includes("sanitary")
      ) {
        setActive("Sanitary");
        return;
      }
      if (
        lower.includes("cpvc-pipes-hardware") ||
        lower.includes("cpvc-plumbing-tanks") ||
        lower.includes("cpvc") ||
        lower.includes("plumbing")
      ) {
        setActive("Plumbing");
        return;
      }
      if (
        lower.includes("ceiling-panel") ||
        lower.includes("lighting")
      ) {
        setActive("Lighting");
        return;
      }
      if (
        lower.includes("shoes-gloves") ||
        lower.includes("safety-workwear") ||
        lower.includes("safety") ||
        lower.includes("power-tools") ||
        lower.includes("tools")
      ) {
        setActive("Power Tools");
        return;
      }
      if (
        lower.includes("tile-adhesives") ||
        lower.includes("tile-stone") ||
        lower.includes("tiles") ||
        lower.includes("tile") ||
        lower.includes("granite") ||
        lower.includes("marble") ||
        lower.includes("vitrified") ||
        lower.includes("grouts")
      ) {
        setActive("Tiles");
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

  const mergeLiveProducts = useLiveProductMerger();
  const products = mergeLiveProducts(ALL_CATALOG_PRODUCTS).filter((p) => p.materialTag === active);

  return (
    <Layout>
      {/* ── Top Department Navigation Bar (Civil & Interiors, Electrical, Tools, etc.) ── */}
      <HomeDepartmentNav
        activeDepartmentId={
          active === "Cement" || active === "Paint" || active === "Tiles"
            ? "civil-interiors"
            : active === "Hardware" || active === "Locks" || active === "Adhesives"
            ? "furniture-hardware"
            : active === "Electrical" || active === "Lighting"
            ? "electrical"
            : active === "Plumbing" || active === "Sanitary"
            ? "plumbing-sanitary"
            : active === "Kitchen"
            ? "plumbing-sanitary"
            : active === "Safety"
            ? "tools"
            : active === "CCTV"
            ? ""
            : undefined
        }
        onSelectDepartment={(dept) => {
          if (dept.id === "civil-interiors") setActive("Cement");
          if (dept.id === "furniture-hardware") setActive("Hardware");
          if (dept.id === "electrical") setActive("Electrical");
          if (dept.id === "plumbing-sanitary") setActive("Sanitary");
          if (dept.id === "tools") setActive("Power Tools");
        }}
        onSelectCategory={(cat) => {
          if (
            cat.slug.includes("tool") ||
            cat.slug.includes("safety") ||
            cat.slug.includes("power-tools")
          ) {
            setActive("Power Tools");
            return;
          }
          if (
            cat.slug.includes("brick") ||
            cat.slug.includes("sand") ||
            cat.slug.includes("morang") ||
            cat.slug.includes("gitti") ||
            cat.slug.includes("aac") ||
            cat.slug.includes("eeta")
          ) {
            setActive("Bricks");
            return;
          }
          if (
            cat.slug.includes("sanitary") ||
            cat.slug.includes("bath-fittings") ||
            cat.slug.includes("complete-sanitary") ||
            cat.slug.includes("cistern") ||
            cat.slug.includes("urinal")
          ) {
            setActive("Sanitary");
            return;
          }
          if (cat.slug.includes("cpvc") || cat.slug.includes("plumbing") || cat.slug.includes("pipes-hardware")) {
            setActive("Plumbing");
            return;
          }
          if (cat.slug.includes("safety") || cat.slug.includes("shoes-gloves")) {
            setActive("Safety");
            return;
          }
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
          if (cat.slug.includes("kitchen-sinks") || cat.slug.includes("kitchen-sinks-faucets") || cat.slug.includes("ss-sinks") || cat.slug.includes("sink")) {
            setActive("Kitchen Sinks");
            return;
          }
          if (cat.slug.includes("kitchen") || cat.slug.includes("modular-kitchen")) {
            setActive("Kitchen");
            return;
          }
          if (cat.slug.includes("paint") || cat.slug.includes("interior-emulsions")) {
            setActive("Paint");
            return;
          }
          if (cat.slug.includes("cctv") || cat.slug.includes("camera")) {
            setActive("CCTV");
            return;
          }
          if (cat.slug.includes("tile") || cat.slug.includes("granite") || cat.slug.includes("marble")) {
            setActive("Tiles");
            return;
          }
          if (cat.slug.includes("lighting") || cat.slug.includes("ceiling-panel")) {
            setActive("Lighting");
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

      {active === "Power Tools" || active === "Tools" || active === "Safety" || active.toLowerCase().includes("power tool") || active.toLowerCase().includes("hand tool") || active.toLowerCase().includes("safety") || active.toLowerCase().includes("tool") ? (
        <PowerToolsSafetyStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Bricks" || active === "Sand" || active === "Aggregates" || active.toLowerCase().includes("brick") || active.toLowerCase().includes("morang") || active.toLowerCase().includes("gitti") || active.toLowerCase().includes("aac") || active.toLowerCase().includes("paver") ? (
        <BricksMasonryStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Cement" || active === "Steel" || active.toLowerCase().includes("cement") || active.toLowerCase().includes("sariya") || active.toLowerCase().includes("steel") ? (
        <CementCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Wood" || active.toLowerCase().includes("plywood") || active.toLowerCase().includes("hdhmr") || active.toLowerCase().includes("mdf") || active.toLowerCase().includes("boilo") || active.toLowerCase().includes("laminate") ? (
        <PlywoodCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Adhesives" || active.toLowerCase().includes("fevicol") ? (
        <FevicolCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Hardware" || active.toLowerCase().includes("hinge") || active.toLowerCase().includes("furniture") ? (
        <FurnitureHardwareStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Door Hardware & Locks" || active === "Locks" || active.toLowerCase().includes("lock") || active.toLowerCase().includes("door-hardware") ? (
        <DoorHardwareStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Electrical" || active.toLowerCase().includes("wire") ? (
        <ElectricalCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Kitchen Sinks" || active.toLowerCase().includes("sink") ? (
        <KitchenSinksStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Modular Kitchen" || active === "Kitchen" || active.toLowerCase().includes("modular") || active.toLowerCase().includes("kitchen") || active.toLowerCase().includes("tandem") ? (
        <ModularKitchenStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Paint" || active.toLowerCase().includes("paint") || active.toLowerCase().includes("putty") || active.toLowerCase().includes("primer") || active.toLowerCase().includes("enamel") || active.toLowerCase().includes("distemper") ? (
        <PaintingCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "CCTV" || active.toLowerCase().includes("cctv") || active.toLowerCase().includes("camera") ? (
        <CCTVCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Tiles" || active.toLowerCase().includes("tile") || active.toLowerCase().includes("granite") || active.toLowerCase().includes("marble") ? (
        <TilesCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Lighting" || active.toLowerCase().includes("light") ? (
        <LightingCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Safety" || active.toLowerCase().includes("safety") || active.toLowerCase().includes("shoes") ? (
        <SafetyCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Plumbing" || active.toLowerCase().includes("plumb") || active.toLowerCase().includes("cpvc") ? (
        <CPVCPlumbingStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Sanitary" || active.toLowerCase().includes("sanitary") || active.toLowerCase().includes("bath") ? (
        <SanitaryBathCollectionStorefront onOpenDetail={setDetailProduct} />
      ) : active === "Appliances" || active === "Home Appliances" || active.toLowerCase().includes("appliance") || active.toLowerCase().includes("fan") || active.toLowerCase().includes("geyser") || active.toLowerCase().includes("chimney") || active.toLowerCase().includes("inverter") || active.toLowerCase().includes("pump") ? (
        <AppliancesCollectionStorefront onOpenDetail={setDetailProduct} />
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
                    onSeeOptions={setVariantSheetProduct}
                    onVariants={setVariantSheetProduct}
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

      <VariantSelectorSheet
        product={variantSheetProduct}
        isOpen={variantSheetProduct !== null}
        onClose={() => setVariantSheetProduct(null)}
      />

      <ProductDetailModal
        product={detailProduct}
        open={detailProduct !== null}
        isOpen={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        onAddToCart={addProduct}
        onSetQty={setProductQty}
        isAdding={cartMutationPending}
        cartQty={detailProduct ? getCartQty(detailProduct) : 0}
      />
    </Layout>
  );
}
