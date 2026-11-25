import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Check,
  Edit3,
  PlusSquare,
  ShieldCheck,
  IndianRupee,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { type MasterCatalogSKU } from "@/lib/vendorApi";
import { GREEN, inr } from "./theme";
import { resolveVendorImg } from "@/context/VendorContext";
import { RealProductImage } from "../RealProductImage";

export function ProductsTab({ onAdded }: { onAdded?: () => void }) {
  const { t, lang } = useVendorLanguage();
  const {
    products,
    updateProductStock,
    updateProductPrice,
    createProduct,
    inStockCount,
    outOfStockCount,
    vendor,
  } = useVendor();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [editingSku, setEditingSku] = useState<MasterCatalogSKU | null>(null);
  const [editPriceValue, setEditPriceValue] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newCost, setNewCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return ["ALL", ...Array.from(set)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  const handleToggleStock = async (sku: MasterCatalogSKU) => {
    const next = !sku.inStock;
    try {
      await updateProductStock(sku.id, next);
      toast(next ? `${sku.name} is now IN STOCK` : `${sku.name} marked OUT OF STOCK`, {
        icon: next ? "🟢" : "📦",
      });
    } catch {
      toast.error("Could not update stock");
    }
  };

  const handleSavePrice = async () => {
    if (!editingSku) return;
    const num = parseInt(editPriceValue, 10);
    if (isNaN(num) || num <= 0) {
      toast.error(t("enterValidPrice"));
      return;
    }
    try {
      await updateProductPrice(editingSku.id, num);
      toast.success(`Updated landing cost for ${editingSku.name}: ₹${num}`);
      setEditingSku(null);
    } catch {
      toast.error("Failed to update dealer rate");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseInt(newCost, 10);
    if (!newName.trim() || isNaN(cost) || cost <= 0) {
      toast.error("Enter product name and valid landing cost");
      return;
    }
    setIsSubmitting(true);
    try {
      await createProduct({
        name: newName.trim(),
        price: cost,
        unit: newUnit.trim() || "Unit",
        category: newCategory.trim() || vendor?.categories[0] || "Hardware",
      });
      toast.success("Product listed in your store!");
      setShowAddModal(false);
      setNewName("");
      setNewCost("");
      setNewUnit("");
      onAdded?.();
    } catch {
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* ── TOP STATS & QUICK ADD ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-base text-slate-900 leading-tight">
            Meri Dukaan (SSOT Catalog)
          </h2>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {inStockCount} In Stock • {outOfStockCount} Out of Stock • Live Customer Sync
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition active:scale-95"
        >
          <PlusSquare className="w-3.5 h-3.5" /> Add Samaan
        </button>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "hi" ? "Samaan ya brand khojein (e.g. Godrej, UltraTech, Fevicol)..." : "Search products by name or brand..."}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:ring-2 ring-emerald-500/20"
        />
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── PRODUCTS CARDS ── */}
      <div className="space-y-3">
        {filteredProducts.map((p) => {
          const cost = p.dealerLandingCost || Math.round(p.sellingPrice * 0.88);
          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-3.5 border transition-all ${
                p.inStock ? "border-slate-100 shadow-sm" : "border-slate-200 bg-slate-50/70 opacity-75"
              }`}
            >
              <div className="flex items-start gap-3">
                <RealProductImage
                  product={p}
                  src={resolveVendorImg(p.name, p.imageUrl)}
                  title={p.name}
                  brand={p.brand}
                  category={p.category}
                  alt={p.name}
                  variant="thumb"
                  className="w-16 h-16 object-contain rounded-2xl bg-white p-1.5 border border-slate-200 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      {p.brand}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {p.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                    {p.name}
                  </h3>

                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Unit: {p.packSize || p.unit || "Piece"}
                  </p>

                  {p.fitGuardrailBadge && (
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-1 border border-emerald-100">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> {p.fitGuardrailBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Stock Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                    <span>Cust. Price: ₹{p.sellingPrice}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Dealer Rate:
                    </span>
                    <span className="text-sm font-display font-black text-emerald-800">
                      ₹{cost}
                    </span>
                    <button
                      onClick={() => {
                        setEditingSku(p);
                        setEditPriceValue(String(cost));
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition"
                      title="Edit Dealer Rate"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Instant In-Stock Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider ${
                      p.inStock ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </span>

                  <button
                    onClick={() => handleToggleStock(p)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      p.inStock ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                    aria-label="Toggle Stock"
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px]"
                      animate={{ x: p.inStock ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {p.inStock ? <Check className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-2.5 h-2.5 text-slate-400" />}
                    </motion.div>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUICK PRICE EDIT MODAL ── */}
      <AnimatePresence>
        {editingSku && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm text-slate-900 leading-tight">Edit Dealer Rate</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate max-w-[240px]">
                    {editingSku.name}
                  </p>
                </div>
                <button
                  onClick={() => setEditingSku(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-black text-xs"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">
                  Your Landing Payout (₹ per {editingSku.packSize || editingSku.unit || "unit"})
                </label>
                <div className="flex items-center gap-2 mt-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
                  <IndianRupee className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={editPriceValue}
                    onChange={(e) => setEditPriceValue(e.target.value)}
                    className="flex-1 bg-transparent text-base font-black text-slate-900 outline-none"
                    placeholder="0"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 ml-1">
                  Customer will see: ₹{editingSku.sellingPrice} (auto-markup)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSku(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrice}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow"
                >
                  Save Rate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD CUSTOM PRODUCT MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm text-slate-900">List New Samaan</h3>
                  <p className="text-[10px] text-slate-500">Add an item to your store catalog</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-black text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="E.g. Brass Mortise Handle Set"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Landing Cost (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      placeholder="1200"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Unit / Pack
                    </label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="Pair / Piece"
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow transition disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add to Meri Dukaan"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
