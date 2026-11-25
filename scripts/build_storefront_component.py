import json

with open("/Users/rohiitshukla/.gemini/antigravity/brain/81a133d5-a7f4-424b-ae4c-59dfc4a7998a/scratch/all_42_tiles_stone_products.json") as f:
    products = json.load(f)

# Create simplified products array for storefront
ts_products = []
for p in products:
    item = {
        "id": p["id"],
        "slug": p["slug"],
        "name": p["name"],
        "title": p["title"],
        "brand": p["brand"],
        "oemModelCode": p["oemModelCode"],
        "subcategory": p["subCategory"],
        "stoneSubcategory": p["stoneSubcategory"],
        "sellingUnit": p["sellingUnit"],
        "tileSizeMm": p["tileSizeMm"],
        "piecesPerBox": p["piecesPerBox"],
        "coverageSqFtPerBox": p["coverageSqFtPerBox"],
        "effectivePricePerSqFt": p["effectivePricePerSqFt"],
        "surfaceFinish": p["surfaceFinish"],
        "thicknessMm": p.get("thicknessMm"),
        "minOrderSqFt": p.get("minOrderSqFt"),
        "batchLockRequired": p.get("batchLockRequired", False),
        "price": p["price"],
        "mrp": p["mrp"],
        "exGstPrice": p["exGstPrice"],
        "hsnCode": p["hsnCode"],
        "gstPercent": p["gstPercent"],
        "brandTier": p["brandTier"],
        "deliveryVehicleType": p["deliveryVehicleType"],
        "unit": p["unit"],
        "spec": p["specChips"][0] if p.get("specChips") else "",
        "shortTagline": p["shortTagline"],
        "specChips": p["specChips"],
        "image": p["image"],
        "images": p["images"],
        "description": p["description"],
        "highlights": p["highlights"],
        "rating": p["rating"],
        "reviewsCount": p["reviewsCount"],
        "deliveryTime": "60 Mins" if p["deliveryVehicleType"] == "2-Wheeler" else "Same Day Express",
        "inStock": True,
        "vendor": p["vendor"],
    }
    ts_products.append(item)

products_json = json.dumps(ts_products, indent=2)

template = """import React, { useState, useMemo } from "react";
import {
  Clock,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Truck,
  Bike,
  ShieldCheck,
  Check,
  Package,
  Layers,
  Sparkles,
  Info,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useGetCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import type { Product } from "@/components/ProductCard";

export interface TileStoneProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  oemModelCode: string;
  subcategory: string;
  stoneSubcategory: "VITRIFIED_TILE" | "WALL_PARKING_TILE" | "GRANITE_SLAB" | "MARBLE_NATURAL_STONE" | "GROUT_AND_TOOLS";
  sellingUnit: "BOX" | "SQ_FT" | "PACK_OR_PIECE";
  tileSizeMm?: string | null;
  piecesPerBox?: number | null;
  coverageSqFtPerBox?: number | null;
  effectivePricePerSqFt?: number | null;
  surfaceFinish?: string | null;
  thicknessMm?: number | null;
  minOrderSqFt?: number | null;
  batchLockRequired?: boolean;
  price: number;
  mrp: number;
  exGstPrice: number;
  hsnCode: string;
  gstPercent: number;
  brandTier: number;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "Pickup / Mini-Truck" | "E-Loader / Pickup";
  unit: string;
  spec: string;
  shortTagline: string;
  specChips: string[];
  image: string;
  images: string[];
  description: string;
  highlights: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  inStock: boolean;
  vendor: string;
}

export const TILES_STONE_PRODUCTS: TileStoneProduct[] = __PRODUCTS_JSON__;

export interface TilesStorefrontProps {
  onOpenDetail?: (product: Product) => void;
}

export const TilesCollectionStorefront: React.FC<TilesStorefrontProps> = ({ onOpenDetail }) => {
  const queryClient = useQueryClient();
  const { data: cartData } = useGetCart();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalProduct, setModalProduct] = useState<TileStoneProduct | null>(null);

  // Room Area Calculator state
  const [calcAreaSqFt, setCalcAreaSqFt] = useState<number>(150);
  const [calcSelectedTileId, setCalcSelectedTileId] = useState<string>("prod-tiles-01-kajaria-kajaria-eternity-zion-m");
  const [showCalculator, setShowCalculator] = useState<boolean>(true);
  const [unloadingHelperChecked, setUnloadingHelperChecked] = useState<boolean>(false);

  // Subcategories config
  const subcategories = [
    { id: "all", name: "All Products", count: TILES_STONE_PRODUCTS.length },
    {
      id: "vitrified-floor-tiles",
      name: "Vitrified Floor Tiles",
      stoneSubcategory: "VITRIFIED_TILE",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "VITRIFIED_TILE").length,
    },
    {
      id: "ceramic-wall-parking-tiles",
      name: "Ceramic Wall & Parking",
      stoneSubcategory: "WALL_PARKING_TILE",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "WALL_PARKING_TILE").length,
    },
    {
      id: "granite-slabs",
      name: "Granite Slabs",
      stoneSubcategory: "GRANITE_SLAB",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "GRANITE_SLAB").length,
    },
    {
      id: "marble-natural-stones",
      name: "Marble & Natural Stones",
      stoneSubcategory: "MARBLE_NATURAL_STONE",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "MARBLE_NATURAL_STONE").length,
    },
    {
      id: "grouts-tools",
      name: "Grouts, Epoxy & Tools",
      stoneSubcategory: "GROUT_AND_TOOLS",
      count: TILES_STONE_PRODUCTS.filter((p) => p.stoneSubcategory === "GROUT_AND_TOOLS").length,
    },
  ];

  // Unique Brands
  const brands = useMemo(() => {
    const b = Array.from(new Set(TILES_STONE_PRODUCTS.map((p) => p.brand)));
    return ["all", ...b];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return TILES_STONE_PRODUCTS.filter((p) => {
      // Subcategory filter
      if (activeSubcategory !== "all") {
        const matchedSub = subcategories.find((s) => s.id === activeSubcategory);
        if (matchedSub && matchedSub.stoneSubcategory && p.stoneSubcategory !== matchedSub.stoneSubcategory) {
          return false;
        }
      }
      // Brand filter
      if (selectedBrand !== "all" && p.brand !== selectedBrand) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchFinish = p.surfaceFinish?.toLowerCase().includes(q) ?? false;
        const matchOem = p.oemModelCode.toLowerCase().includes(q);
        return matchName || matchBrand || matchFinish || matchOem;
      }
      return true;
    });
  }, [activeSubcategory, selectedBrand, searchQuery]);

  // Cart items flattened
  const cartItems = useMemo(() => {
    const list: Array<{ id: string; materialId: string; quantity: number; name?: string }> = [];
    if (!cartData?.categories) return list;
    for (const c of cartData.categories) {
      for (const item of c.items ?? []) {
        list.push({
          id: item.id,
          materialId: item.materialId,
          quantity: item.quantity,
          name: item.name,
        });
      }
    }
    return list;
  }, [cartData]);

  const cartItemByKey = useMemo(() => {
    const map = new Map<string, { id: string; materialId: string; quantity: number }>();
    for (const item of cartItems) {
      map.set(item.materialId, item);
      if (item.name) map.set(item.name.toLowerCase(), item);
    }
    return map;
  }, [cartItems]);

  const getCartQuantity = (product: TileStoneProduct): number => {
    const item = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: TileStoneProduct, quantity: number = 1) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (current) {
      updateCartMutation.mutate(
        { itemId: current.id, data: { quantity: current.quantity + quantity } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Updated ${product.name} in cart`);
          },
          onError: () => {
            toast.error("Failed to update cart");
          },
        }
      );
    } else {
      addToCartMutation.mutate(
        {
          data: {
            materialId: product.id,
            quantity: quantity,
            name: product.name,
            price: product.price,
            unit: product.unit,
            vendor: product.vendor,
            category: "Tiles, Marble & Granite",
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Added ${quantity} ${product.unit}${quantity > 1 ? "s" : ""} of ${product.name} to cart`);
          },
          onError: () => {
            toast.error("Failed to add to cart");
          },
        }
      );
    }
  };

  const handleUpdateQty = (product: TileStoneProduct, newQty: number) => {
    const current = cartItemByKey.get(product.id) || cartItemByKey.get(product.name.toLowerCase());
    if (!current) {
      if (newQty > 0) handleAddToCart(product, newQty);
      return;
    }
    if (newQty <= 0) {
      removeFromCartMutation.mutate(
        { itemId: current.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.info(`Removed ${product.name} from cart`);
          },
          onError: () => {
            toast.error("Failed to remove from cart");
          },
        }
      );
    } else {
      updateCartMutation.mutate(
        { itemId: current.id, data: { quantity: newQty } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
          onError: () => {
            toast.error("Failed to update quantity");
          },
        }
      );
    }
  };

  // Selected tile for room calculator
  const selectedTile = useMemo(() => {
    return (
      TILES_STONE_PRODUCTS.find((p) => p.id === calcSelectedTileId) ||
      TILES_STONE_PRODUCTS[0]
    );
  }, [calcSelectedTileId]);

  // Calculation Math:
  // Math.ceil((calcAreaSqFt * 1.10) / coverageSqFtPerBox)
  const calcCoveragePerBox = selectedTile.coverageSqFtPerBox || 15.5;
  const calcGrossAreaSqFt = Math.round(calcAreaSqFt * 1.10 * 10) / 10;
  const calcBoxesNeeded = Math.ceil((calcAreaSqFt * 1.10) / calcCoveragePerBox);
  const calcTotalCost = calcBoxesNeeded * selectedTile.price;

  // Convert TileStoneProduct to ProductCard modal type
  const toProductCardType = (p: TileStoneProduct): Product => ({
    id: p.id,
    title: p.title,
    name: p.title,
    materialTag: p.surfaceFinish || p.subcategory,
    price: p.price,
    mrp: p.mrp,
    discountPct: Math.round(((p.mrp - p.price) / p.mrp) * 100),
    unit: p.unit,
    image: p.image,
    deliveryEta: p.deliveryTime,
    rating: p.rating,
    reviews: p.reviewsCount,
    brand: p.brand,
    vendor: p.vendor,
    description: p.description,
    specs: [
      { label: "HSN Code", value: p.hsnCode },
      { label: "GST Rate", value: `${p.gstPercent}% (Included)` },
      { label: "Base Pre-GST", value: `₹${p.exGstPrice}` },
      { label: "Delivery Vehicle", value: p.deliveryVehicleType },
      ...(p.effectivePricePerSqFt ? [{ label: "Effective Rate", value: `₹${p.effectivePricePerSqFt}/sq ft` }] : []),
      ...(p.coverageSqFtPerBox ? [{ label: "Box Coverage", value: `${p.coverageSqFtPerBox} sq ft` }] : []),
      ...(p.piecesPerBox ? [{ label: "Pieces / Box", value: `${p.piecesPerBox}` }] : []),
      ...(p.tileSizeMm ? [{ label: "Size", value: p.tileSizeMm }] : []),
      ...(p.thicknessMm ? [{ label: "Thickness", value: `${p.thicknessMm} mm` }] : []),
      ...(p.minOrderSqFt ? [{ label: "Min Order", value: `${p.minOrderSqFt} sq ft` }] : []),
    ],
  });

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white px-4 py-8 shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-600 mb-2">
                <Truck className="w-3.5 h-3.5 text-emerald-300" />
                Lucknow Local Stockyard Direct • Shaheed Path • Transport Nagar • Chinhat
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Tiles, Marble & Granite
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base mt-1 max-w-2xl">
                Vitrified floor slabs, ceramic wall tiles, mirror-polished granite & authentic natural marble with guaranteed single-batch shade locks and specialized A-Frame transport.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                {showCalculator ? "Hide Room Calculator" : "Room Area Calculator (+10% Wastage)"}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-800/60 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Single Batch / Shade Lock</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>A-Frame Vertical Heavy Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>60-Min Express on Grouts & Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>2026 GST Ready (5% Kota / 18% Tiles)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Room Area & Box Calculator */}
      {showCalculator && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-emerald-700/60">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  Interactive Room Area & Tile Box Calculator (+10% Cutting Margin)
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                Mason-Standard Formula
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Input 1: Room Area in sq ft */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Room Floor / Wall Area (Sq Ft)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    step="5"
                    value={calcAreaSqFt}
                    onChange={(e) => setCalcAreaSqFt(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full bg-slate-900/80 border border-emerald-600 rounded-xl px-4 py-2.5 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <span className="text-sm font-semibold text-emerald-300 shrink-0">sq ft</span>
                </div>
                <p className="text-[11px] text-emerald-300/80">
                  Example: 10×12 ft Bedroom = 120 sq ft • 15×20 ft Living Hall = 300 sq ft
                </p>
              </div>

              {/* Input 2: Select Tile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Select Tile Size & Brand
                </label>
                <select
                  value={calcSelectedTileId}
                  onChange={(e) => setCalcSelectedTileId(e.target.value)}
                  className="w-full bg-slate-900/80 border border-emerald-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  {TILES_STONE_PRODUCTS.filter((p) => p.sellingUnit === "BOX").map((tile) => (
                    <option key={tile.id} value={tile.id} className="bg-slate-900 text-white">
                      {tile.brand} - {tile.tileSizeMm} ({tile.coverageSqFtPerBox} sq ft/box) - ₹{tile.price}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-emerald-200 flex items-center justify-between">
                  <span>Box Coverage: <strong>{calcCoveragePerBox} sq ft</strong></span>
                  <span>Effective Rate: <strong>₹{selectedTile.effectivePricePerSqFt}/sq ft</strong></span>
                </div>
              </div>

              {/* Output: Calculated Boxes & 1-Click Order */}
              <div className="bg-emerald-950/70 border border-emerald-600/60 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-emerald-300 font-semibold mb-1">
                    Coverage Breakdown:
                  </div>
                  <div className="text-xs text-emerald-100 space-y-0.5">
                    <div>Net Area: <strong>{calcAreaSqFt} sq ft</strong></div>
                    <div>+10% Cutting / Corner Wastage: <strong>+{(calcAreaSqFt * 0.10).toFixed(1)} sq ft</strong></div>
                    <div>Total Ordering Target: <strong>{calcGrossAreaSqFt} sq ft</strong></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-800/80 flex items-baseline justify-between">
                    <span className="text-xs text-emerald-200">Required Boxes:</span>
                    <span className="text-2xl font-black text-amber-300">
                      {calcBoxesNeeded} <span className="text-sm font-semibold text-white">Boxes</span>
                    </span>
                  </div>
                  <div className="text-right text-xs text-emerald-300 font-bold">
                    Est. Total: ₹{calcTotalCost.toLocaleString("en-IN")} (incl. 18% GST)
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(selectedTile, calcBoxesNeeded)}
                  className="mt-3 w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg shadow-md transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add All {calcBoxesNeeded} Boxes to Cart (₹{calcTotalCost.toLocaleString("en-IN")})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mason-Safe Cross-Sell Recommendations Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Mason-Safe Fixing & Installation Bundles (Zero Extra Delivery Cost on Same Trip)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-950">
            <div className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-900 block mb-1">Large Format Tiles (600×1200 / 800×800):</span>
                <span>Leveling Kits (Fastobond / Flamingo) + Leqwell 3mm Spacers + Roff T13 / MYK SP-100 Epoxy Grout.</span>
              </div>
              <button
                onClick={() => setActiveSubcategory("grouts-tools")}
                className="mt-2 text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                View Leveling & Epoxy Kits <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-900 block mb-1">Ceramic Wall Tiles (300×450mm):</span>
                <span>Roff Rainbow Waterproof Grout (1kg) + Roff T16 Cera Clean (1L) + Bosch 4-Inch Diamond Blade.</span>
              </div>
              <button
                onClick={() => setActiveSubcategory("grouts-tools")}
                className="mt-2 text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                View Wall Tile Grout & Cleaners <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-amber-900 block mb-1">Granite & Marble Slabs:</span>
                <span>Bosch Continuous Rim 4" Diamond Blade (2607019471) + SP-100 Epoxy + A-Frame Transit.</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unloadingHelperChecked}
                    onChange={(e) => setUnloadingHelperChecked(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Unloading Helper (+₹500)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Subcategory Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 mb-4">
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubcategory(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeSubcategory === sub.id
                  ? "bg-emerald-800 text-white shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{sub.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeSubcategory === sub.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {sub.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Brand:</span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedBrand === b
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {b === "all" ? "All Brands" : b}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tiles, marble, granite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Products Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> verified products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your brand or search filter.</p>
            <button
              onClick={() => {
                setSelectedBrand("all");
                setActiveSubcategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const cartQty = getCartQuantity(p);
              const isTile = p.sellingUnit === "BOX";
              const isSlab = p.sellingUnit === "SQ_FT";

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Top: Badges & Image */}
                  <div>
                    <div className="relative bg-slate-100 aspect-square overflow-hidden cursor-pointer"
                      onClick={() => {
                        if (onOpenDetail) onOpenDetail(toProductCardType(p));
                        else setModalProduct(p);
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/home-categories/tile-stone-installation.webp";
                        }}
                      />

                      {/* Vehicle Badge */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1 ${
                            p.deliveryVehicleType === "2-Wheeler"
                              ? "bg-amber-400 text-amber-950"
                              : p.deliveryVehicleType === "E-Loader"
                              ? "bg-teal-500 text-white"
                              : "bg-emerald-700 text-white"
                          }`}
                        >
                          {p.deliveryVehicleType === "2-Wheeler" ? (
                            <Bike className="w-3 h-3" />
                          ) : (
                            <Truck className="w-3 h-3" />
                          )}
                          {p.deliveryVehicleType}
                        </span>

                        {p.batchLockRequired && (
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded shadow-sm">
                            Single Shade Lock
                          </span>
                        )}

                        {isSlab && (
                          <span className="px-1.5 py-0.5 bg-purple-700 text-white text-[9px] font-bold rounded shadow-sm">
                            A-Frame Slabs
                          </span>
                        )}
                      </div>

                      {/* GST Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            p.gstPercent === 5
                              ? "bg-green-600 text-white"
                              : "bg-slate-800 text-slate-200"
                          }`}
                        >
                          {p.gstPercent}% GST ({p.hsnCode})
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span className="text-emerald-700 font-bold uppercase">{p.brand}</span>
                        <span>{p.oemModelCode}</span>
                      </div>

                      <h3
                        onClick={() => {
                          if (onOpenDetail) onOpenDetail(toProductCardType(p));
                          else setModalProduct(p);
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer min-h-[38px]"
                      >
                        {p.name}
                      </h3>

                      {/* Finish & Spec chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.surfaceFinish && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">
                            {p.surfaceFinish}
                          </span>
                        )}
                        {p.tileSizeMm && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] rounded font-bold">
                            {p.tileSizeMm}
                          </span>
                        )}
                        {isSlab && p.thicknessMm && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 text-[10px] rounded font-bold">
                            {p.thicknessMm}mm Slab
                          </span>
                        )}
                        {isSlab && p.minOrderSqFt && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded font-semibold">
                            Min {p.minOrderSqFt} sq ft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Dual Price & Add Button */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                    <div className="pt-2 flex items-baseline justify-between mb-2">
                      <div>
                        {/* Dual Price Representation */}
                        {isTile ? (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">/ Box</span>
                              {p.mrp > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{p.mrp}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-700">
                              ₹{p.effectivePricePerSqFt}/sq ft{" "}
                              <span className="text-[10px] font-normal text-slate-500">
                                ({p.coverageSqFtPerBox} sq ft box)
                              </span>
                            </div>
                          </div>
                        ) : isSlab ? (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">/ sq ft</span>
                              {p.mrp > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{p.mrp}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Ex-GST: ₹{p.exGstPrice}/sq ft
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-slate-900">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">/ {p.unit}</span>
                              {p.mrp > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{p.mrp}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Ex-GST: ₹{p.exGstPrice}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Single Batch Badge */}
                      {p.batchLockRequired && (
                        <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Kiln Lock
                        </div>
                      )}
                    </div>

                    {/* Cart Action */}
                    {cartQty === 0 ? (
                      <button
                        onClick={() => handleAddToCart(p, isSlab ? (p.minOrderSqFt || 25) : 1)}
                        className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isSlab ? `Order Min ${p.minOrderSqFt || 25} Sq Ft` : `Add Box to Cart`}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQty(p, isSlab ? Math.max(0, cartQty - 25) : cartQty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-emerald-950 hover:bg-emerald-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-center">
                          <span className="text-xs font-black text-emerald-950 block">
                            {cartQty} {isSlab ? "Sq Ft" : isTile ? "Boxes" : p.unit}
                          </span>
                          {isTile && (
                            <span className="text-[9px] text-emerald-700 font-semibold block">
                              {(cartQty * (p.coverageSqFtPerBox || 15.5)).toFixed(1)} sq ft
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleUpdateQty(p, isSlab ? cartQty + 25 : cartQty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-emerald-950 hover:bg-emerald-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={toProductCardType(modalProduct)}
          isOpen={Boolean(modalProduct)}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
};

// Backward compatibility alias
export const TileAdhesivesCollectionStorefront = TilesCollectionStorefront;
export default TilesCollectionStorefront;
"""

final_code = template.replace("__PRODUCTS_JSON__", products_json)

with open("artifacts/conon/src/components/TilesCollectionStorefront.tsx", "w") as f:
    f.write(final_code)

print("Successfully written TilesCollectionStorefront.tsx!")
