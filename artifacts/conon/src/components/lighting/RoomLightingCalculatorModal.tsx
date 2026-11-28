import React, { useMemo, useState } from "react";
import { X, Sparkles, ShoppingBag, ShieldCheck } from "lucide-react";
import { LIGHTING_PRODUCTS, type LightingProduct } from "@/data/lightingCatalog";

export type RoomType = "BEDROOM" | "LIVING" | "KITCHEN" | "STAIRCASE" | "OFFICE" | "LAWN";
export type CeilingType = "POP_FALSE_CEILING" | "NORMAL_RCC_SLAB";
export type LightingMood = "3000K" | "6500K" | "3IN1";

export interface CalculatedKitLine {
  product: LightingProduct;
  qty: number;
  roleLabel: string;
}

export function RoomLightingCalculatorModal({
  isOpen,
  onClose,
  onAddFullKit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddFullKit: (lines: CalculatedKitLine[], kitDiscountPct: number) => void;
}) {
  const [roomType, setRoomType] = useState<RoomType>("LIVING");
  const [lengthFt, setLengthFt] = useState<number>(14);
  const [widthFt, setWidthFt] = useState<number>(12);
  const [ceilingType, setCeilingType] = useState<CeilingType>("POP_FALSE_CEILING");
  const [mood, setMood] = useState<LightingMood>("3IN1");

  const calculation = useMemo(() => {
    const areaSqft = Math.max(40, lengthFt * widthFt);
    const perimeterFt = 2 * (lengthFt + widthFt);
    const isPop = ceilingType === "POP_FALSE_CEILING";
    const byId = (id: string) => LIGHTING_PRODUCTS.find((p) => p.id === id) || LIGHTING_PRODUCTS[0];

    const lines: CalculatedKitLine[] = [];
    let stripRawWatts = 0;
    let driverWith20BufferWatts = 0;

    if (roomType === "STAIRCASE") {
      const steps = Math.max(8, Math.round(lengthFt));
      const footLights = Math.max(4, Math.ceil(steps / 3));
      lines.push({
        product: byId("duplex-staircase-foot-light-2mod"),
        qty: footLights,
        roleLabel: `2M/3M Step Foot Lights (${steps}-step duplex)`,
      });
      lines.push({
        product: byId("crompton-3w-mini-spot-cob"),
        qty: 2,
        roleLabel: "3W Landing Accent Spots",
      });
      lines.push({
        product: byId("jaquar-ip65-updown-wall-light"),
        qty: 2,
        roleLabel: "Double-Height Wall Washers",
      });
    } else if (roomType === "LAWN") {
      const floodCount = areaSqft >= 600 ? 3 : 2;
      lines.push({
        product: byId("wipro-garnet-50w-ip66-flood"),
        qty: floodCount,
        roleLabel: "IP66 Weatherproof Floodlights",
      });
      lines.push({
        product: byId("jaquar-ip65-updown-wall-light"),
        qty: 4,
        roleLabel: "Up-Down Boundary Elevation Washers",
      });
      lines.push({
        product: byId("havells-ip65-gate-pillar-lamp"),
        qty: 2,
        roleLabel: "Main Gate Pillar Lamps",
      });
    } else if (!isPop) {
      const panelCount = Math.max(2, Math.ceil(areaSqft / 65));
      lines.push({
        product: byId("wipro-garnet-rimless-surface-12w"),
        qty: panelCount,
        roleLabel: "Surface Panels (No POP Cutout)",
      });
      lines.push({
        product: byId("sturlite-deep-junction-7w-3in1"),
        qty: Math.max(2, Math.round(panelCount / 2)),
        roleLabel: '3" RCC Metal Dabbi Lights',
      });
      if (roomType === "KITCHEN" || roomType === "OFFICE") {
        lines.push({
          product: byId("wipro-garnet-3in1-cct-batten-20w"),
          qty: 2,
          roleLabel: "20W High-Lumen LED Battens",
        });
      }
    } else {
      const panelId = mood === "3IN1" ? "wipro-garnet-3in1-cct-panel-15w" : "havells-trim-led-12w-recessed";
      const panelCount = Math.max(4, Math.ceil(areaSqft / 42));
      lines.push({
        product: byId(panelId),
        qty: panelCount,
        roleLabel: mood === "3IN1" ? "15W 3-in-1 POP Ceiling Panels" : "12W Recessed POP Panels",
      });

      const cobCount = roomType === "LIVING" || roomType === "BEDROOM" ? 4 : 2;
      lines.push({
        product: byId("crompton-star-miranda-6w-cob"),
        qty: cobCount,
        roleLabel: "6W Anti-Glare Accent COBs",
      });

      // Zero-Dot Cove Strip (5m reel ~14.4W/m = 72W/reel) + SMPS Driver sized with 20% safety buffer
      const stripReels = Math.max(2, Math.ceil(perimeterFt / 16.4));
      lines.push({
        product: byId("zero-dot-480led-cob-strip-5m"),
        qty: stripReels,
        roleLabel: `Zero-Dot 480-LED/m Strip (${stripReels * 5}m Total)`,
      });

      stripRawWatts = stripReels * 5 * 14.4;
      driverWith20BufferWatts = Math.ceil(stripRawWatts * 1.2);
      const driverQty = Math.max(1, Math.ceil(driverWith20BufferWatts / 120));
      lines.push({
        product: byId("wipro-12v-10a-smps-driver"),
        qty: driverQty,
        roleLabel: `12V 10A SMPS Choke (${driverWith20BufferWatts}W incl. 20% thermal buffer)`,
      });

      const profileQty = Math.max(2, Math.ceil((stripReels * 5) / 2));
      lines.push({
        product: byId("alu-profile-2m-recessed-corner"),
        qty: profileQty,
        roleLabel: "2m Recessed Aluminium Profiles",
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const discountPct = 5;
    const finalTotal = Math.round(subtotal * (1 - discountPct / 100));

    return {
      areaSqft,
      perimeterFt,
      stripRawWatts: Math.round(stripRawWatts),
      driverWith20BufferWatts,
      lines,
      subtotal,
      discountPct,
      finalTotal,
    };
  }, [roomType, lengthFt, widthFt, ceilingType, mood]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#12357A] dark:text-amber-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Lucknow POP &amp; Duplex Choke Wizard
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5">
              “Kitni Light + Kitna Choke?” Room &amp; POP Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Computes Panels + COBs + Zero-Dot Strip + 20% thermally-buffered SMPS Choke Driver + Profiles.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
              1. Space Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "BEDROOM", label: "Bedroom" },
                  { id: "LIVING", label: "Living / Drawing" },
                  { id: "KITCHEN", label: "Modular Kitchen" },
                  { id: "STAIRCASE", label: "Duplex Staircase" },
                  { id: "OFFICE", label: "Office / Shop" },
                  { id: "LAWN", label: "Lawn / Exterior" },
                ] as Array<{ id: RoomType; label: string }>
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoomType(r.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    roomType === r.id
                      ? "bg-[#12357A] text-white border-[#12357A]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
              2. Ceiling Architecture
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCeilingType("POP_FALSE_CEILING")}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  ceilingType === "POP_FALSE_CEILING"
                    ? "bg-[#12357A] text-white border-[#12357A]"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                }`}
              >
                POP False Ceiling
              </button>
              <button
                type="button"
                onClick={() => setCeilingType("NORMAL_RCC_SLAB")}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  ceilingType === "NORMAL_RCC_SLAB"
                    ? "bg-[#12357A] text-white border-[#12357A]"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                }`}
              >
                Normal RCC Slab
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
              3. Dimensions (ft): {lengthFt} × {widthFt} ft ({calculation.areaSqft} sq.ft)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {[
                { l: 10, w: 12 },
                { l: 12, w: 14 },
                { l: 14, w: 18 },
              ].map((preset) => (
                <button
                  key={`${preset.l}x${preset.w}`}
                  type="button"
                  onClick={() => {
                    setLengthFt(preset.l);
                    setWidthFt(preset.w);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                    lengthFt === preset.l && widthFt === preset.w
                      ? "bg-amber-400 text-slate-950 border-amber-500"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {preset.l}×{preset.w} ft
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={6}
                max={80}
                value={lengthFt}
                onChange={(e) => setLengthFt(Math.max(6, Number(e.target.value) || 10))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                aria-label="Length in feet"
              />
              <input
                type="number"
                min={6}
                max={80}
                value={widthFt}
                onChange={(e) => setWidthFt(Math.max(6, Number(e.target.value) || 10))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                aria-label="Width in feet"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
              4. Colour Mood
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "3000K", label: "Warm 3000K" },
                  { id: "6500K", label: "Cool 6500K" },
                  { id: "3IN1", label: "3-in-1 CCT" },
                ] as Array<{ id: LightingMood; label: string }>
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                    mood === m.id
                      ? "bg-[#12357A] text-white border-[#12357A]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thermal Safety Buffer Callout */}
        {calculation.driverWith20BufferWatts > 0 && (
          <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Choke / Driver Sizing: {calculation.stripRawWatts}W Strip Load + 20% Lucknow Summer Thermal Safety Buffer ={" "}
              <strong>{calculation.driverWith20BufferWatts}W rated capacity</strong> (prevents SMPS overheating inside closed POP).
            </span>
          </div>
        )}

        {/* Recommended BOM Output */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Matched 60-Min Lucknow Material BOM
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              5% Bundle Off Applied
            </span>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-700">
            {calculation.lines.map((line) => (
              <div key={line.product.id} className="py-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {line.qty}× {line.product.title}
                  </p>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    {line.roleLabel} · ₹{line.product.price.toLocaleString("en-IN")} / {line.product.unit}
                  </p>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                  ₹{(line.product.price * line.qty).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kit MRP Total: <span className="line-through">₹{calculation.subtotal.toLocaleString("en-IN")}</span>
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                ₹{calculation.finalTotal.toLocaleString("en-IN")}{" "}
                <span className="text-[11px] font-semibold text-emerald-600">(Incl. 18% GST)</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onAddFullKit(calculation.lines, calculation.discountPct);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md transition cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Full Room Kit (5% Bundle Off)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
