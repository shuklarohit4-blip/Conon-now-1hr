import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Eye, EyeOff, CheckCircle, X, Mic } from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor, type InventoryItem } from "@/context/VendorContext";
import { apiErrorMessage } from "@/lib/api";
import { GREEN } from "./theme";

export function InventoryTab() {
  const { t, lang, priceUpdated, stockMessage } = useVendorLanguage();
  const { inventory, toggleStock, updatePrice, inStockCount, outOfStockCount } = useVendor();

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Module 4: AI Munshi voice control. */
  const [munshiTarget, setMunshiTarget] = useState<InventoryItem | null>(null);
  const munshiTimer = useRef<number | null>(null);
  /* Always-fresh inventory snapshot for the delayed voice action. */
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;

  useEffect(() => {
    if (!editingItem) return;
    setNewPrice(String(editingItem.price));
    const tm = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(tm);
  }, [editingItem]);

  useEffect(
    () => () => {
      if (munshiTimer.current) window.clearTimeout(munshiTimer.current);
    },
    [],
  );

  const munshiCommand = (name: string) =>
    lang === "hi" ? `"${name} ko out of stock karein"` : `"Set ${name} out of stock"`;

  /* Simulated voice flow: pick a real in-stock item, show the listening
     waveform, then actually toggle it out of stock on the server. */
  const startMunshi = () => {
    if (munshiTarget) return;
    const target = inventory.find((i) => i.inStock);
    if (!target) {
      toast(t("munshiNothingToClose"), { icon: "🎙️" });
      return;
    }
    setMunshiTarget(target);
    munshiTimer.current = window.setTimeout(async () => {
      try {
        /* Re-check against the freshest state so we never flip an item that
           was already taken out of stock during the listening animation. */
        const latest = inventoryRef.current.find((i) => i.id === target.id);
        if (!latest || !latest.inStock) {
          toast(stockMessage(target.name, false), { icon: "🎙️" });
          return;
        }
        const updated = await toggleStock(target.id);
        toast(stockMessage(updated.name, updated.inStock), { icon: "🎙️" });
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setMunshiTarget(null);
        munshiTimer.current = null;
      }
    }, 2400);
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleStock(id);
      if (updated.inStock) toast.success(stockMessage(updated.name, true));
      else toast(stockMessage(updated.name, false), { icon: "📦" });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const savePrice = async () => {
    if (!editingItem) return;
    const parsed = parseInt(newPrice, 10);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error(t("enterValidPrice"));
      return;
    }
    try {
      await updatePrice(editingItem.id, parsed);
      toast.success(priceUpdated(editingItem.name, parsed));
      setEditingItem(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="px-4 pt-5">
      {/* Summary pills */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-tight">{t("itemsInStock")}</p>
          <p className="text-xl font-display font-black italic text-emerald-700 leading-none mt-0.5">{inStockCount}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-slate-100 border border-slate-200 p-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t("outOfStockCount")}</p>
          <p className="text-xl font-display font-black italic text-slate-500 leading-none mt-0.5">{outOfStockCount}</p>
        </div>
      </div>

      <p className="text-[10px] font-bold text-slate-400 mb-4 px-1 leading-tight">{t("manageStock")}</p>

      {/* List */}
      <div className="space-y-2.5">
        {inventory.map((item) => (
          <motion.div
            key={item.id}
            layout
            className="flex items-center gap-3 p-3 rounded-[22px] border shadow-sm transition-colors"
            style={{
              background: item.inStock ? "#ffffff" : "#f8fafc",
              borderColor: item.inStock ? "#f1f5f9" : "#e2e8f0",
            }}
          >
            {/* Thumb */}
            <div className="relative shrink-0">
              <div
                className="w-14 h-14 rounded-2xl overflow-hidden border-2 relative"
                style={{
                  borderColor: item.inStock ? "#bbf7d0" : "#e2e8f0",
                  opacity: item.inStock ? 1 : 0.5,
                  filter: item.inStock ? "none" : "grayscale(1)",
                  background: item.inStock ? item.bg : "#f1f5f9",
                }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fb = target.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "flex";
                  }}
                />
                <span className="absolute inset-0 items-center justify-center text-2xl" style={{ display: "none" }}>
                  {item.emoji}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="font-black text-sm leading-tight truncate"
                style={{ color: item.inStock ? "#1e293b" : "#94a3b8" }}
              >
                {item.name}
              </p>
              <p className="text-[12px] font-black italic mt-0.5" style={{ color: item.inStock ? GREEN : "#94a3b8" }}>
                ₹{item.price.toLocaleString("en-IN")}
              </p>
              <span
                className="inline-flex items-center gap-1 mt-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full leading-tight"
                style={{
                  background: item.inStock ? "#dcfce7" : "#e2e8f0",
                  color: item.inStock ? "#15803d" : "#64748b",
                }}
              >
                {item.inStock ? <CheckCircle className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                {item.inStock ? t("inStock") : t("outOfStock")}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => setEditingItem(item)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[9px] font-black uppercase"
                title={t("updatePrice")}
              >
                <Edit3 className="w-3 h-3" /> {t("updatePrice").split(" (")[0]}
              </button>
              <button
                onClick={() => handleToggle(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase ${
                  item.inStock ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {item.inStock ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {item.inStock ? t("outOfStock").split(" (")[0] : t("inStock").split(" (")[0]}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Price editor drawer */}
      <AnimatePresence>
        {editingItem && (
            <motion.div
              key="price-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setEditingItem(null)}
            />
        )}
        {editingItem && (
            <motion.div
              key="price-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] p-8 pb-12 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-start gap-3 mb-6">
                <div className="min-w-0">
                  <h4 className="font-display font-black italic text-lg text-slate-900 uppercase leading-tight">
                    {t("updatePrice")}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-1">
                    {editingItem.name} · {t("current")}: ₹{editingItem.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-2 bg-slate-100 rounded-full shrink-0">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 px-6 py-5 rounded-[28px] border border-slate-100 mb-8">
                <span className="text-2xl font-black text-slate-300">₹</span>
                <input
                  ref={inputRef}
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && savePrice()}
                  className="flex-1 bg-transparent text-4xl font-display font-black italic outline-none min-w-0"
                  style={{ color: GREEN }}
                  placeholder="0"
                />
              </div>

              <button
                onClick={savePrice}
                className="w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest text-white shadow-2xl leading-tight"
                style={{ background: GREEN, boxShadow: "0 8px 24px rgba(21,128,61,0.35)" }}
              >
                {t("saveNewPrice")}
              </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Module 4: AI Munshi mic */}
      <motion.button
        onClick={startMunshi}
        whileTap={{ scale: 0.92 }}
        className="absolute left-4 bottom-24 z-30 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full text-white shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          boxShadow: "0 10px 30px rgba(124,58,237,0.45)",
        }}
        aria-label={t("aiMunshi")}
      >
        <span className="relative flex">
          <Mic className="w-4 h-4" strokeWidth={2.6} />
          <span className="absolute -inset-1 rounded-full bg-purple-300/50 animate-ping" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-wide leading-tight">{t("aiMunshi")}</span>
      </motion.button>

      {/* Munshi listening overlay */}
      <AnimatePresence>
        {munshiTarget && (
          <motion.div
            key="munshi-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-md px-8"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-24 h-24 rounded-full flex items-center justify-center mb-8"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <span className="absolute inset-0 rounded-full bg-purple-400/40 animate-ping" />
              <Mic className="w-10 h-10 text-white relative" strokeWidth={2.4} />
            </motion.div>

            {/* Waveform */}
            <div className="flex items-end gap-1.5 h-10 mb-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-full bg-purple-300"
                  animate={{ height: ["20%", "100%", "35%", "80%", "25%"] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeInOut",
                  }}
                  style={{ height: "30%" }}
                />
              ))}
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300 mb-2">
              {t("munshiListening")}
            </p>
            <p className="text-base font-black text-white text-center leading-snug">
              {munshiCommand(munshiTarget.name)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
