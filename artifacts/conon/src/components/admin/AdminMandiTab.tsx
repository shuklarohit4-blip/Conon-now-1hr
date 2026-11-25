import React, { useState, useEffect } from "react";
import { Edit3, Check, X, TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle, Link2 } from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";

interface MandiItem {
  id: string;
  material: string;
  shortName: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  gstPercent: number;
  hsnCode: string;
  matchKeyword: string;
  categorySlug: string;
  lastUpdated: string;
}

export function AdminMandiTab() {
  const [rates, setRates] = useState<MandiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [cascade, setCascade] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await fetch(resolveApiUrl("/api/admin/mandi"));
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      } else {
        toast.error("Failed to load Mandi rates");
      }
    } catch {
      toast.error("Network error loading Mandi rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleStartEdit = (m: MandiItem) => {
    setEditingId(m.id);
    setEditPrice(String(m.currentPrice));
    setCascade(true);
  };

  const handleSave = async (m: MandiItem) => {
    const priceNum = Number(editPrice);
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid positive price");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(resolveApiUrl(`/api/admin/mandi/${encodeURIComponent(m.id)}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: priceNum,
          cascadeToCatalog: cascade,
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      const json = await res.json();

      setRates((prev) =>
        prev.map((r) => (r.id === m.id ? json.item : r))
      );
      setEditingId(null);
      toast.success(
        json.cascadeCount > 0
          ? `${m.material} updated to ₹${priceNum} • Cascaded to ${json.cascadeCount} catalog SKUs!`
          : `${m.material} updated to ₹${priceNum}`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update Mandi rate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">Lucknow Mandi Bhav Controller</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live SSOT Linked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Controls daily benchmark prices across Lucknow wholesale distribution hubs (Latouche Road, Naka Hindola, Transport Nagar, Aminabad).
            Enforces Lucknow standard units: <strong className="text-slate-800">CFT / 100 CFT</strong> for Banda Morang & Kabrai Gitti, <strong className="text-slate-800">50kg Bag</strong> for Cement, and <strong className="text-slate-800">Per 1,000 pcs</strong> for Red Bricks.
          </p>
        </div>

        <button
          onClick={fetchRates}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition active:scale-95 shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Rates</span>
        </button>
      </div>

      {/* Mandi Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Commodity / Material</th>
                <th className="py-3 px-4">Unit & Specs</th>
                <th className="py-3 px-4">GST & HSN</th>
                <th className="py-3 px-4 text-right">Current Rate (₹)</th>
                <th className="py-3 px-4 text-right">Previous (₹)</th>
                <th className="py-3 px-4 text-center">Change (Δ)</th>
                <th className="py-3 px-4 text-center">Trend</th>
                <th className="py-3 px-4 text-center">Catalog Sync</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rates.map((m) => {
                const isEditing = editingId === m.id;
                const isUp = m.trend === "up";
                const isDown = m.trend === "down";

                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Commodity Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{m.material}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.categorySlug}</div>
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {m.unit}
                      </span>
                    </td>

                    {/* GST & HSN */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-800 font-semibold">{m.gstPercent}% GST</div>
                      <div className="text-[10px] text-slate-400">HSN: {m.hsnCode}</div>
                    </td>

                    {/* Current Rate */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm tabular-nums">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 font-normal">₹</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            autoFocus
                            className="w-24 px-2 py-1 text-right border-2 border-amber-400 rounded-lg font-bold text-slate-900 text-sm focus:outline-none"
                          />
                        </div>
                      ) : (
                        `₹${m.currentPrice.toLocaleString("en-IN")}`
                      )}
                    </td>

                    {/* Previous Rate */}
                    <td className="py-3.5 px-4 text-right text-slate-400 font-medium tabular-nums">
                      ₹{m.previousPrice.toLocaleString("en-IN")}
                    </td>

                    {/* Change */}
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums ${
                          isUp
                            ? "bg-rose-50 text-rose-700"
                            : isDown
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.change > 0 ? `+₹${m.change}` : m.change < 0 ? `-₹${Math.abs(m.change)}` : "₹0"}
                        {m.changePercent !== 0 && ` (${Math.abs(m.changePercent)}%)`}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="py-3.5 px-4 text-center">
                      {isUp && <TrendingUp className="w-4 h-4 text-rose-600 mx-auto" />}
                      {isDown && <TrendingDown className="w-4 h-4 text-emerald-600 mx-auto" />}
                      {!isUp && !isDown && <Minus className="w-4 h-4 text-slate-400 mx-auto" />}
                    </td>

                    {/* Catalog Sync Option */}
                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cascade}
                            onChange={(e) => setCascade(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span>Cascade Δ</span>
                        </label>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          <Link2 className="w-3 h-3 text-emerald-500" />
                          <span>Linked</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSave(m)}
                            disabled={saving}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
                          >
                            {saving ? "…" : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={saving}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 transition active:scale-95"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Update</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
