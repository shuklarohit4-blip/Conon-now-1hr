import React from "react";
import { X, Printer, CheckCircle, ShieldCheck } from "lucide-react";
import type { FullProjectEstimate } from "@/lib/builderKitEngine";

interface PrintableBOQViewProps {
  estimate: FullProjectEstimate;
  onClose: () => void;
}

export function PrintableBOQView({ estimate, onClose }: PrintableBOQViewProps) {
  const { inputs, stages, grandTotal, grandPreGst, grandGst, costPerSqFt } = estimate;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex items-start justify-center print:p-0 print:bg-white animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 text-slate-900 print:shadow-none print:p-4 print:max-w-none">
        {/* Print / Close Actions (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900">
              Printable Construction Material BOQ (A4 Specification)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Document Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">CONON-NOW</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                PRO ESTIMATOR
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Lucknow 60-Minute Construction Materials Delivery Platform
            </p>
            <p className="text-[11px] text-slate-400">
              GSTIN: 09AAECN1234F1Z5 • Support: +91 96967 27279 • support@conon-now.com
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs font-bold text-slate-500 block uppercase">
              Project BOQ Estimate
            </span>
            <span className="text-sm font-black text-slate-900 block">
              REF-{Date.now().toString().slice(-8)}
            </span>
            <span className="text-xs text-slate-400 block">
              Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* ── Project Parameters ── */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Built-Up Area</span>
            <span className="font-black text-slate-900 text-sm">
              {inputs.builtUpSqFt.toLocaleString("en-IN")} sq ft
            </span>
            <span className="text-[10px] text-slate-500 block">
              {inputs.plotAreaSqFt} sq ft • {inputs.floors === 1 ? "Ground" : `G+${inputs.floors - 1}`}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Specification Tier</span>
            <span className="font-black text-emerald-800 text-sm">
              {inputs.qualityTier} Quality
            </span>
            <span className="text-[10px] text-slate-500 block">
              {inputs.wallType === "RED_BRICK" ? "Kiln Red Bricks" : "AAC Blocks"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Site Location</span>
            <span className="font-bold text-slate-900 text-sm">{inputs.lucknowZone}</span>
            <span className="text-[10px] text-slate-500 block">Lucknow, Uttar Pradesh</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Estimated Material Rate</span>
            <span className="font-black text-amber-900 text-sm">
              ₹{costPerSqFt.toLocaleString("en-IN")} / sq ft
            </span>
            <span className="text-[10px] text-slate-500 block">Excl. labor contract</span>
          </div>
        </div>

        {/* ── 6 Stages Tables ── */}
        <div className="space-y-6">
          {stages.map((st) => (
            <div key={st.stageId} className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Stage {st.stageId}: {st.stageName}
                  </h4>
                  <p className="text-[10px] text-slate-500">{st.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block">
                    ₹{Math.round(st.subtotal).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">
                    {st.items.length} items
                  </span>
                </div>
              </div>

              <table className="w-full text-left text-[11px] divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="py-2 px-3">Item & Brand Specification</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Rate</th>
                    <th className="py-2 px-2 text-center">GST</th>
                    <th className="py-2 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {st.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{it.title}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {it.brand} • {it.civilNote}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-800">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-600">
                        ₹{it.sellingPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-500">
                        {it.gstPercent}%
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{it.lineTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* ── Financial Summary ── */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-800">Civil Engineering Standards & Compliance:</p>
            <p>• Banda River Sand & Kabrai Kali Gitti measured per CFT trolley volume.</p>
            <p>• Floor tiles include +10% standard cutting & breakage wastage.</p>
            <p>• Real-time delivery fleet split via 60-Min 2W, E-Loader, Pickup & Heavy Trolleys.</p>
          </div>

          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Pre-GST Material Base:</span>
              <span className="font-semibold text-slate-800">
                ₹{Math.round(grandPreGst).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Total (5%, 12%, 18%):</span>
              <span className="font-semibold text-slate-800">
                ₹{Math.round(grandGst).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
              <span>Grand Material Total:</span>
              <span>₹{Math.round(grandTotal).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
          Generated automatically by Conon-Now Live SSOT Engine • Prices valid for Lucknow deliveries within 7 days.
        </div>
      </div>
    </div>
  );
}
