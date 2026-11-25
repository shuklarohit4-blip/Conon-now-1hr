import React, { useState } from "react";
import { X, PhoneCall, CheckCircle2, ShieldCheck, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";
import type { FullProjectEstimate } from "@/lib/builderKitEngine";

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: FullProjectEstimate;
  onLeadSuccess?: () => void;
}

export function RequestQuoteModal({
  isOpen,
  onClose,
  estimate,
  onLeadSuccess,
}: RequestQuoteModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("Within 15 Days");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: cleanPhone,
        lucknowZone: estimate.inputs.lucknowZone,
        builtUpSqFt: estimate.inputs.builtUpSqFt,
        qualityTier: estimate.inputs.qualityTier,
        wallType: estimate.inputs.wallType,
        floors: estimate.inputs.floors,
        grandTotal: estimate.grandTotal,
        notes: notes.trim(),
        startDate,
        boqSummary: {
          grandTotal: estimate.grandTotal,
          costPerSqFt: estimate.costPerSqFt,
          stages: estimate.stages.map((s) => ({
            stageId: s.stageId,
            stageName: s.stageName,
            subtotal: s.subtotal,
            itemCount: s.items.length,
          })),
        },
      };

      const res = await fetch(resolveApiUrl("/api/builder-kit/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit project request");
      }

      setIsSuccess(true);
      toast.success("Quote request submitted! Civil engineer assigned.");
      if (onLeadSuccess) onLeadSuccess();
    } catch {
      toast.error("Could not submit request. Please try WhatsApp support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Project Lead Registered!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Our Senior Civil Project Engineer has received your{" "}
              <strong>{estimate.inputs.builtUpSqFt} sq ft ({estimate.inputs.qualityTier})</strong> BOQ and will contact you within <strong>30 minutes</strong> for on-site verification & bulk wholesale discounts.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
              Assigned Hub: <strong>{estimate.inputs.lucknowZone}</strong> • Ref: <strong>CK-{Date.now().toString().slice(-6)}</strong>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Direct Civil Engineer Consultation</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Request Bulk Quote & Material Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Get wholesale contractor pricing, batch reservations & free site delivery planning.
              </p>
            </div>

            {/* Quick Estimate Recap Box */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-950 block">
                  {estimate.inputs.builtUpSqFt} sq ft • {estimate.inputs.qualityTier} Quality
                </span>
                <span className="text-[11px] text-amber-800">
                  Site: {estimate.inputs.lucknowZone}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-700 font-bold block uppercase">Estimate</span>
                <span className="text-base font-black text-amber-950">
                  ₹{Math.round(estimate.grandTotal).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Er. Ankit Verma / Builder"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  placeholder="9696727279"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Timeline
                  </label>
                  <select
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="Immediately">Immediate (In 24h)</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="Next Month">Next Month</option>
                    <option value="Planning Phase">Planning Phase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Site Zone
                  </label>
                  <input
                    type="text"
                    disabled
                    value={estimate.inputs.lucknowZone}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Specific Requirements or Brand Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need single batch delivery for floor tiles, require 43 Grade cement for plastering..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting Request..." : "Request Civil Engineer Call"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
