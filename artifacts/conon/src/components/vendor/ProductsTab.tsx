import { useState } from "react";
import { motion } from "framer-motion";
import { PlusSquare, PackagePlus, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { apiErrorMessage } from "@/lib/api";
import { GREEN } from "./theme";

export function ProductsTab({ onAdded }: { onAdded?: () => void }) {
  const { t } = useVendorLanguage();
  const { createProduct, inventory } = useVendor();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [img, setImg] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const parsedPrice = parseInt(price, 10);
    if (!name.trim()) {
      toast.error(t("productName"));
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error(t("enterValidPrice"));
      return;
    }
    setSaving(true);
    try {
      await createProduct({
        name: name.trim(),
        price: parsedPrice,
        unit: unit.trim() || "unit",
        category: category.trim() || "General",
        img: img.trim() || undefined,
      });
      toast.success(t("productAdded"), { description: name.trim() });
      setName("");
      setPrice("");
      setUnit("");
      setCategory("");
      setImg("");
      onAdded?.();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm outline-none focus:ring-2 ring-emerald-500/20";

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#dcfce7" }}>
          <PackagePlus className="w-5 h-5" style={{ color: GREEN }} strokeWidth={2.6} />
        </div>
        <div>
          <h2 className="font-display font-black italic text-lg text-slate-900 leading-tight">{t("addProduct")}</h2>
          <p className="text-[10px] font-bold text-slate-400 leading-tight">{t("addProductDesc")}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("productName")}</label>
          <input className={`${inputCls} mt-1`} value={name} onChange={(e) => setName(e.target.value)} placeholder="UltraTech Cement" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("sellingPrice")}</label>
            <div className="flex items-center gap-2 mt-1 bg-slate-50 border border-slate-100 rounded-2xl px-3">
              <IndianRupee className="w-4 h-4 text-slate-300 shrink-0" />
              <input
                type="number"
                className="flex-1 bg-transparent py-4 font-bold text-sm outline-none min-w-0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("unitLabel")}</label>
            <input className={`${inputCls} mt-1`} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="bag" />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("categoryLabel")}</label>
          <input className={`${inputCls} mt-1`} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Cement" />
        </div>

        <div>
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{t("imageUrlOptional")}</label>
          <input className={`${inputCls} mt-1`} value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://…" />
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest text-white shadow-2xl leading-tight flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: GREEN, boxShadow: "0 8px 24px rgba(21,128,61,0.35)" }}
        >
          <PlusSquare className="w-4 h-4" /> {saving ? "…" : t("saveProduct")}
        </button>
      </div>

      {/* Existing products preview */}
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-8 mb-3 px-1">
        {t("inventory")} ({inventory.length})
      </h3>
      {inventory.length === 0 ? (
        <div className="rounded-[22px] border-2 border-dashed border-slate-100 py-8 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("noProducts")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inventory.slice(0, 6).map((item) => (
            <motion.div
              key={item.id}
              layout
              className="flex items-center gap-3 p-3 rounded-[20px] bg-white border border-slate-100 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 text-sm leading-tight truncate">{item.name}</p>
                <p className="text-[10px] font-semibold text-slate-400">
                  {item.category} · {item.unit}
                </p>
              </div>
              <p className="font-display font-black italic text-sm shrink-0" style={{ color: GREEN }}>
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
