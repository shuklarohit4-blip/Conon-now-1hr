import json

with open("scratch/all_70_structural_products.json") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from scratch.")

products_ts = json.dumps(products, indent=2)

code_head = """import React, { useState, useMemo } from "react";
import {
  Clock,
  ChevronRight,
  Minus,
  Plus,
  SlidersHorizontal,
  Truck,
  Bike,
  Zap,
  ShieldCheck,
  Check,
  Package,
  Wrench,
  Droplets,
  Layers,
  Sparkles,
  Info,
  Scale,
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

export interface StructuralProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  oemModelCode: string;
  categorySlug?: string;
  categoryName?: string;
  subcategory:
    | "cement-white-cement"
    | "tmt-sariya"
    | "binding-wire-accessories"
    | "waterproofing-chemicals"
    | "tile-adhesives-block-mortar";
  type: string;
  price: number;
  mrp: number;
  exGstPrice: number;
  discountPct: number;
  unit: string;
  hsnCode: string;
  gstPercent: number;
  brandTier: number;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "Pickup / Mini-Truck";
  vehicleType: "2-Wheeler" | "E-Loader" | "Pickup / Mini-Truck";
  priceVolatility: "DAILY" | "WEEKLY" | "MONTHLY";
  image: string;
  images: string[];
  spec?: string;
  shortTagline?: string;
  specChips: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  inStock: boolean;
  bulkPrice?: number;
  bulkSlabText?: string;
  packSize?: string;
  cementGrade?: "PPC" | "OPC 43" | "OPC 53" | "Weather-Shield" | "White Cement";
  cementType?: string;
  tmtGrade?: "Fe 500" | "Fe 500D" | "Fe 550" | "Fe 550D";
  tmtDiameterMm?: number;
  barLengthMeters?: number;
  theoreticalWeightKg?: number;
  effectivePerKgPrice?: number;
  steelTier?: "Tier 1 - Primary" | "Tier 2 - Regional/Value";
  chemicalType?: string;
  dosagePerBagCement?: string;
  requiresUnloadingLabour?: boolean;
}

export const STRUCTURAL_SUBCATEGORIES = [
  {
    id: "all",
    slug: "all",
    name: "All Structural",
    count: 70,
    icon: "/images/subcategories/cement-bag-icon.webp",
  },
  {
    id: "cement-white-cement",
    slug: "cement-white-cement",
    name: "Cement & White Cement",
    count: 16,
    icon: "/images/subcategories/cement-bag-icon.webp",
  },
  {
    id: "tmt-sariya",
    slug: "tmt-sariya",
    name: "TMT Sariya (Steel Bars)",
    count: 20,
    icon: "/images/subcategories/sand-plaster-icon.webp",
  },
  {
    id: "binding-wire-accessories",
    slug: "binding-wire-accessories",
    name: "Binding Wire & Accessories",
    count: 4,
    icon: "/images/subcategories/masonry-tools-icon.webp",
  },
  {
    id: "waterproofing-chemicals",
    slug: "waterproofing-chemicals",
    name: "Waterproofing & Chemicals",
    count: 22,
    icon: "/images/subcategories/chemicals-icon.webp",
  },
  {
    id: "tile-adhesives-block-mortar",
    slug: "tile-adhesives-block-mortar",
    name: "Tile Adhesives & Block Mortar",
    count: 8,
    icon: "/images/subcategories/sand-plaster-icon.webp",
  },
];

export const ALL_STRUCTURAL_PRODUCTS: StructuralProduct[] = """

code_tail = """;

interface CementCollectionStorefrontProps {
  onOpenDetail?: (product: Product) => void;
  defaultSubcat?: string;
  onBackToDirectory?: () => void;
}

export function CementCollectionStorefront({
  onOpenDetail,
  defaultSubcat,
  onBackToDirectory,
}: CementCollectionStorefrontProps) {
  const [selectedSubcat, setSelectedSubcat] = useState<string>(defaultSubcat || "all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedDiameter, setSelectedDiameter] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedChemicalType, setSelectedChemicalType] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showUnloadingHelper, setShowUnloadingHelper] = useState<boolean>(true);

  // Fallback modal for viewing product details if parent didn't provide onOpenDetail
  const [quickDetailProduct, setQuickDetailProduct] = useState<Product | null>(null);
  const [detailOptions, setDetailOptions] = useState<{ scrollToBulk?: boolean; variantId?: string }>({});

  const queryClient = useQueryClient();
  const { data: cartData } = useGetCart();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

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
    const map = new Map<string, (typeof cartItems)[0]>();
    for (const item of cartItems) {
      if (item.materialId) map.set(item.materialId, item);
      if (item.name) map.set(item.name.toLowerCase(), item);
    }
    return map;
  }, [cartItems]);

  // Site-Engineer Computations from Cart
  const engineerMetrics = useMemo(() => {
    let cementBags = 0;
    let tmtWeightKg = 0;
    let tmtBars = 0;
    let tileAdhesiveBags = 0;

    for (const item of cartItems) {
      const match = ALL_STRUCTURAL_PRODUCTS.find(
        (p) => p.id === item.materialId || p.title.toLowerCase() === (item.name || "").toLowerCase()
      );
      if (match) {
        if (match.subcategory === "cement-white-cement" && match.type !== "White Cement") {
          cementBags += item.quantity;
        }
        if (match.subcategory === "tmt-sariya") {
          tmtBars += item.quantity;
          tmtWeightKg += item.quantity * (match.theoreticalWeightKg || 0);
        }
        if (match.subcategory === "tile-adhesives-block-mortar") {
          tileAdhesiveBags += item.quantity;
        }
      }
    }

    const requiredLwMl = cementBags * 200;
    const requiredBindingWireKg = Math.max(1, Math.round((tmtWeightKg / 1000) * 10));

    return {
      cementBags,
      tmtWeightKg: Math.round(tmtWeightKg * 10) / 10,
      tmtBars,
      tileAdhesiveBags,
      requiredLwMl,
      requiredBindingWireKg,
      needsUnloadingLabour: cementBags >= 5 || tileAdhesiveBags >= 5 || tmtBars >= 10,
    };
  }, [cartItems]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_STRUCTURAL_PRODUCTS.filter((p) => {
      if (selectedSubcat !== "all" && p.subcategory !== selectedSubcat) return false;
      if (selectedBrand !== "all" && p.brand !== selectedBrand) return false;
      if (tierFilter !== "all" && p.brandTier !== tierFilter) return false;
      if (selectedDiameter !== "all" && p.tmtDiameterMm !== Number(selectedDiameter)) return false;
      if (selectedGrade !== "all" && p.cementGrade !== selectedGrade) return false;
      if (selectedChemicalType !== "all" && p.chemicalType !== selectedChemicalType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.oemModelCode.toLowerCase().includes(q) ||
          p.hsnCode.includes(q) ||
          (p.spec && p.spec.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [
    selectedSubcat,
    selectedBrand,
    tierFilter,
    selectedDiameter,
    selectedGrade,
    selectedChemicalType,
    searchQuery,
  ]);

  // Unique list of brands in current category
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    for (const p of ALL_STRUCTURAL_PRODUCTS) {
      if (selectedSubcat === "all" || p.subcategory === selectedSubcat) {
        set.add(p.brand);
      }
    }
    return Array.from(set);
  }, [selectedSubcat]);

  const handleSubcatChange = (id: string) => {
    setSelectedSubcat(id);
    setSelectedBrand("all");
    setSelectedDiameter("all");
    setSelectedGrade("all");
    setSelectedChemicalType("all");
  };

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setTierFilter("all");
    setSelectedDiameter("all");
    setSelectedGrade("all");
    setSelectedChemicalType("all");
    setSearchQuery("");
  };

  // Convert StructuralProduct to Product for detail modal
  const toProductCardType = (p: StructuralProduct): Product => {
    return {
      id: p.id,
      title: p.title,
      name: p.title,
      materialTag: "Cement, TMT Steel & Chemicals",
      price: p.price,
      mrp: p.mrp,
      image: p.image,
      unit: p.unit,
      rating: p.rating,
      reviews: p.reviewsCount,
      deliveryEta: p.deliveryTime,
      vendor: `${p.brand} Lucknow Depot`,
      specs: [
        { label: "HSN Code", value: p.hsnCode },
        { label: "GST Rate", value: `${p.gstPercent}% (Included)` },
        { label: "Base Pre-GST", value: `₹${p.exGstPrice}` },
        { label: "Delivery Vehicle", value: p.deliveryVehicleType },
        { label: "Price Volatility", value: p.priceVolatility },
        ...(p.tmtDiameterMm
          ? [
              { label: "Diameter", value: `${p.tmtDiameterMm}mm` },
              { label: "Bar Length", value: "12 Meters Standard" },
              { label: "Theoretical Weight", value: `${p.theoreticalWeightKg} kg (IS 1786)` },
              { label: "Effective Price", value: `₹${p.effectivePerKgPrice}/kg` },
              { label: "Grade", value: p.tmtGrade || "Fe 500D" },
            ]
          : []),
        ...(p.cementGrade
          ? [
              { label: "Cement Grade", value: p.cementGrade },
              { label: "Type", value: p.cementType || "Portland Cement" },
            ]
          : []),
        ...(p.chemicalType
          ? [
              { label: "Chemical Type", value: p.chemicalType },
              { label: "Dosage", value: p.dosagePerBagCement || "As per spec sheet" },
            ]
          : []),
      ],
    };
  };

  const handleOpenDetailModal = (
    p: StructuralProduct,
    options?: { scrollToBulk?: boolean; variantId?: string }
  ) => {
    const converted = toProductCardType(p);
    if (onOpenDetail) {
      onOpenDetail(converted);
    } else {
      setQuickDetailProduct(converted);
      setDetailOptions(options || {});
    }
  };

  const handleAddToCart = (p: StructuralProduct) => {
    const current = cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
    if (current) {
      updateCartItem.mutate(
        { itemId: current.id, data: { quantity: current.quantity + 1 } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Updated ${p.title} in cart`);
          },
        }
      );
    } else {
      addToCart.mutate(
        {
          data: {
            materialId: p.id,
            quantity: 1,
            name: p.title,
            price: p.price,
            unit: p.unit,
            vendor: `${p.brand} Lucknow Hub`,
            category: "Cement, TMT Sariya & Chemicals",
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            toast.success(`Added ${p.title} to cart`);
          },
        }
      );
    }
  };

  const handleUpdateQty = (p: StructuralProduct, newQty: number) => {
    const current = cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
    if (newQty <= 0) {
      if (current) {
        removeFromCart.mutate(
          { itemId: current.id },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
              toast.info(`Removed ${p.title} from cart`);
            },
          }
        );
      }
    } else if (current) {
      updateCartItem.mutate(
        { itemId: current.id, data: { quantity: newQty } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    } else {
      handleAddToCart(p);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Category Hero / Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 60-Min Express Site Delivery
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Lucknow Mandi Wholesale Rates
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  18% GST Compliant
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Cement, TMT Sariya &amp; Construction Chemicals
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
                Direct aggregator dispatch across Transport Nagar, Chinhat, Kanpur Road, Sitapur Road &amp; Shaheed Path. Heavy pickup truck routing for 12m TMT steel and automated site-engineer dosage calculators.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-xs backdrop-blur-sm self-start md:self-auto">
              <div className="text-center px-2 border-r border-slate-700">
                <div className="text-emerald-400 font-bold text-sm">70 SKUs</div>
                <div className="text-slate-400 text-[10px]">Active Catalog</div>
              </div>
              <div className="text-center px-2 border-r border-slate-700">
                <div className="text-blue-400 font-bold text-sm">IS 1786</div>
                <div className="text-slate-400 text-[10px]">TMT Standard</div>
              </div>
              <div className="text-center px-2">
                <div className="text-amber-400 font-bold text-sm">Daily Rates</div>
                <div className="text-slate-400 text-[10px]">Floor Guarded</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Navigation Pills */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {STRUCTURAL_SUBCATEGORIES.map((subcat) => {
              const active = selectedSubcat === subcat.id;
              return (
                <button
                  key={subcat.id}
                  onClick={() => handleSubcatChange(subcat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{subcat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {subcat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* SITE-ENGINEER SMART RECOMMENDATIONS BANNER (When relevant items are in cart) */}
        {(engineerMetrics.cementBags > 0 ||
          engineerMetrics.tmtBars > 0 ||
          engineerMetrics.tileAdhesiveBags > 0) && (
          <div className="mb-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white p-4 rounded-xl border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Scale className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  Site-Engineer Smart Co-Loading Assistant
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Zero Extra Delivery Cost • Same Truck Dispatch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
              {/* Cement -> Waterproofing Recommendation */}
              {engineerMetrics.cementBags > 0 && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Integral Waterproofing (LW+)</span>
                    <span className="text-emerald-400 font-bold">
                      {engineerMetrics.cementBags} Bags Carted
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Dosage: 200ml/bag = <strong className="text-white">{engineerMetrics.requiredLwMl} ml</strong> required.
                    {engineerMetrics.cementBags <= 4 ? (
                      <span> Add <strong>Dr. Fixit LW+ 200ml</strong> bottles or 1L can.</span>
                    ) : engineerMetrics.cementBags <= 25 ? (
                      <span> Add <strong>Dr. Fixit 101 LW+ 5L</strong> can for complete coverage.</span>
                    ) : (
                      <span> Add <strong>Dr. Fixit 101 LW+ 20L Drum</strong> for bulk slab casting.</span>
                    )}
                  </p>
                </div>
              )}

              {/* TMT -> Binding Wire Recommendation */}
              {engineerMetrics.tmtBars > 0 && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Annealed Binding Wire</span>
                    <span className="text-blue-400 font-bold">
                      {engineerMetrics.tmtWeightKg} kg Steel
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Benchmark: ~10 kg wire per ton = <strong className="text-white">~{engineerMetrics.requiredBindingWireKg} kg</strong> required.
                    {engineerMetrics.tmtWeightKg >= 1500 ? (
                      <span> Recommended: <strong>Local ISI 25kg Coil</strong> on same pickup truck.</span>
                    ) : (
                      <span> Recommended: <strong>Tata Wiron 18 SWG (1kg)</strong> soft annealed coils.</span>
                    )}
                  </p>
                </div>
              )}

              {/* Tile Adhesives -> White Cement & Waterproofing */}
              {engineerMetrics.tileAdhesiveBags > 0 && (
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Wet-Area Wet Pre-Tiling Kit</span>
                    <span className="text-amber-400 font-bold">
                      {engineerMetrics.tileAdhesiveBags} Bags Tile Mortar
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Recommended: <strong>Birla White 5kg Pack</strong> for substrate priming &amp; <strong>Dr. Fixit 112 Pidifin 2K (3kg/15kg)</strong> for wet bathroom floor waterproofing before tile installation.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UNLOADING LABOUR HELPER TOGGLE (Protects thin 2%-4% margins) */}
        {engineerMetrics.needsUnloadingLabour && (
          <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-200/60 text-amber-800 rounded-lg">
                <Truck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Site Unloading Labour Helper (Heavy Materials Protection)
                </h4>
                <p className="text-[11px] text-amber-700">
                  Your cart contains {engineerMetrics.cementBags > 0 ? `${engineerMetrics.cementBags} bags cement` : ""}
                  {engineerMetrics.tmtBars > 0 ? ` + ${engineerMetrics.tmtBars} TMT bars (${engineerMetrics.tmtWeightKg} kg)` : ""}
                  {engineerMetrics.tileAdhesiveBags > 0 ? ` + ${engineerMetrics.tileAdhesiveBags} bags adhesive` : ""}.
                  Ground-floor mechanical unloading included. Add floor-shift porter assistance?
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUnloadingHelper(!showUnloadingHelper)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showUnloadingHelper
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white border border-amber-300 text-amber-800 hover:bg-amber-100"
              }`}
            >
              {showUnloadingHelper ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{showUnloadingHelper ? "Unloading Labour Opted (+₹15/unit)" : "Self-Unload at Ground Floor"}</span>
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search brand, HSN 2523/7214, Fe 500D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
              {/* Brand Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) =>
                  setTierFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Brand Tiers</option>
                <option value="1">Priority 1 (Core Volume)</option>
                <option value="2">Priority 2 (Value / Regional)</option>
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Brands ({availableBrands.length})</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* TMT Diameter Filter (Shown when in all or tmt-sariya) */}
              {(selectedSubcat === "all" || selectedSubcat === "tmt-sariya") && (
                <select
                  value={selectedDiameter}
                  onChange={(e) => setSelectedDiameter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
                >
                  <option value="all">Diameter (All)</option>
                  <option value="8">8mm (4.74 kg)</option>
                  <option value="10">10mm (7.41 kg)</option>
                  <option value="12">12mm (10.67 kg)</option>
                  <option value="16">16mm (18.96 kg)</option>
                  <option value="20">20mm (29.63 kg)</option>
                </select>
              )}

              {/* Cement Grade Filter */}
              {(selectedSubcat === "all" || selectedSubcat === "cement-white-cement") && (
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer focus:outline-hidden"
                >
                  <option value="all">Cement Grade (All)</option>
                  <option value="PPC">PPC (Fly Ash)</option>
                  <option value="OPC 43">OPC 43 Grade</option>
                  <option value="OPC 53">OPC 53 Grade</option>
                  <option value="Weather-Shield">Weather-Shield / Water Repellent</option>
                  <option value="White Cement">White Cement</option>
                </select>
              )}

              {/* Reset Button */}
              {(selectedBrand !== "all" ||
                tierFilter !== "all" ||
                selectedDiameter !== "all" ||
                selectedGrade !== "all" ||
                searchQuery !== "") && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 whitespace-nowrap cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No matching materials found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try resetting your brand, diameter, or grade filters to browse available Lucknow stockyard inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((p) => {
              const cartItem =
                cartItemByKey.get(p.id) || cartItemByKey.get(p.title.toLowerCase());
              const cartQty = cartItem?.quantity ?? 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-400/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Badges Strip */}
                  <div className="p-3 pb-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {/* Vehicle Badge */}
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                          p.deliveryVehicleType === "Pickup / Mini-Truck"
                            ? "bg-slate-900 text-amber-300 border border-slate-700"
                            : p.deliveryVehicleType === "E-Loader"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {p.deliveryVehicleType === "Pickup / Mini-Truck" ? (
                          <Truck className="w-3 h-3 text-amber-300" />
                        ) : p.deliveryVehicleType === "E-Loader" ? (
                          <Zap className="w-3 h-3 text-amber-700" />
                        ) : (
                          <Bike className="w-3 h-3 text-emerald-700" />
                        )}
                        {p.deliveryVehicleType}
                      </span>

                      {/* Volatility Badge */}
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-sm ${
                          p.priceVolatility === "DAILY"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {p.priceVolatility === "DAILY" ? "Daily Mandi Rate" : "Weekly Rate"}
                      </span>
                    </div>

                    {/* Image Area */}
                    <div
                      onClick={() => handleOpenDetailModal(p)}
                      className="w-full aspect-square bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2 relative cursor-pointer group-hover:scale-[1.02] transition-transform"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (p.subcategory === "cement-white-cement") {
                            target.src = "/images/products/cement/ultratech-ppc.webp";
                          } else if (p.subcategory === "tmt-sariya") {
                            target.src = "/images/products/tmt-steel/tata-tiscon-12mm-tmt-fe500d.webp";
                          } else if (p.subcategory === "waterproofing-chemicals") {
                            target.src = "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp";
                          } else {
                            target.src = "/images/products/adhesives/roff-t01-nca-tile-adhesive-20kg.webp";
                          }
                        }}
                      />
                      {/* Discount Badge */}
                      {p.discountPct > 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-xs shadow-xs">
                          {p.discountPct}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 pt-2 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Brand & HSN Line */}
                      <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-semibold mb-1">
                        <span className="text-slate-800 font-bold uppercase tracking-wider">
                          {p.brand}
                        </span>
                        <span>HSN {p.hsnCode} • 18% GST</span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => handleOpenDetailModal(p)}
                        className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-emerald-700 transition-colors"
                        title={p.title}
                      >
                        {p.title}
                      </h3>

                      {/* TMT Effective Per Kg or Cement Spec */}
                      {p.effectivePerKgPrice ? (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10.5px] font-extrabold px-1.5 py-0.5 rounded-xs">
                            ₹{p.effectivePerKgPrice}/kg Effective
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            (12m Standard • {p.theoreticalWeightKg} kg)
                          </span>
                        </div>
                      ) : p.dosagePerBagCement ? (
                        <div className="mt-1.5 text-[10.5px] text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs w-fit">
                          {p.dosagePerBagCement}
                        </div>
                      ) : p.specChips && p.specChips.length > 0 ? (
                        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                          {p.specChips.slice(0, 2).map((chip, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-600 text-[9.5px] px-1.5 py-0.2 rounded-xs font-medium"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* Bulk Slab Tag */}
                      {p.bulkSlabText && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetailModal(p, { scrollToBulk: true });
                          }}
                          className="mt-1.5 text-[10px] font-bold text-blue-700 bg-blue-50/70 border border-blue-200 px-1.5 py-0.5 rounded-xs flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <span>{p.bulkSlabText}</span>
                          <ChevronRight className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Price and Add to Cart Section */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{p.mrp.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Ex-GST: ₹{p.exGstPrice}
                        </span>
                      </div>

                      {/* Action Button: Stepper or Add */}
                      {cartQty > 0 ? (
                        <div className="flex items-center justify-between border-2 border-emerald-600 bg-emerald-50 rounded-lg p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQty(p, cartQty - 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-emerald-800 font-bold hover:bg-emerald-200 rounded-sm transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-emerald-900">
                            {cartQty} in Cart
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQty(p, cartQty + 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center text-emerald-800 font-bold hover:bg-emerald-200 rounded-sm transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                          disabled={addToCart.isPending}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all text-center cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          Add to Site Delivery
                        </button>
                      )}

                      {/* 60 Mins Delivery Tag */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <Clock className="w-3 h-3 text-emerald-600" /> 60 Mins Express
                        </span>
                        <span>Transport Nagar Hub</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Detail Modal Fallback */}
      {quickDetailProduct && (
        <ProductDetailModal
          product={quickDetailProduct}
          isOpen={true}
          onClose={() => setQuickDetailProduct(null)}
          initialScrollToBulk={detailOptions.scrollToBulk}
          initialVariantId={detailOptions.variantId}
          cartQty={
            cartItemByKey.get(quickDetailProduct.id)?.quantity ??
            cartItemByKey.get(quickDetailProduct.name?.toLowerCase() || "")?.quantity ??
            0
          }
          onSetQty={(p, newQty) => {
            const match = cartItemByKey.get(p.id) || cartItemByKey.get(p.name.toLowerCase());
            if (newQty <= 0) {
              if (match) removeFromCart.mutate({ itemId: match.id });
            } else if (match) {
              updateCartItem.mutate({ itemId: match.id, data: { quantity: newQty } });
            } else {
              addToCart.mutate({
                data: {
                  materialId: p.id,
                  quantity: newQty,
                  name: p.name,
                  price: p.price,
                  unit: p.unit || "Unit",
                  vendor: `${p.vendor || "UltraTech"} Official`,
                  category: "Cement, TMT Sariya & Chemicals",
                },
              });
            }
          }}
          onAddToCart={(p, qty) => {
            const count = qty ?? 1;
            const match = cartItemByKey.get(p.id) || cartItemByKey.get(p.name.toLowerCase());
            if (match) {
              updateCartItem.mutate({
                itemId: match.id,
                data: { quantity: match.quantity + count },
              });
            } else {
              addToCart.mutate({
                data: {
                  materialId: p.id,
                  quantity: count,
                  name: p.name,
                  price: p.price,
                  unit: p.unit || "Unit",
                  vendor: `${p.vendor || "UltraTech"} Official`,
                  category: "Cement, TMT Sariya & Chemicals",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
"""

with open("artifacts/conon/src/components/CementCollectionStorefront.tsx", "w") as f:
    f.write(code_head + products_ts + code_tail)

print("Wrote artifacts/conon/src/components/CementCollectionStorefront.tsx cleanly!")
