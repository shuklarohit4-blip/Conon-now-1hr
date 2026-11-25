import React, { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useLiveCatalog } from "@/context/LiveCatalogContext";
import {
  generateProjectBOQ,
  DEFAULT_PROJECT_INPUTS,
  type ProjectInputs,
  type FullProjectEstimate,
  type BOQLineItem,
} from "@/lib/builderKitEngine";
import { ProjectConfiguratorBar } from "@/components/builder-kit/ProjectConfiguratorBar";
import { StageTimelineStepper } from "@/components/builder-kit/StageTimelineStepper";
import { StageBOQTable } from "@/components/builder-kit/StageBOQTable";
import { StageStickyActionBar } from "@/components/builder-kit/StageStickyActionBar";
import { PrintableBOQView } from "@/components/builder-kit/PrintableBOQView";
import { RequestQuoteModal } from "@/components/builder-kit/RequestQuoteModal";
import { ArrowLeft, Sparkles, ShoppingBag, ShieldCheck, Truck, PhoneCall } from "lucide-react";

export function BuilderKitPage() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { items: liveCatalog, isLoading: isCatalogLoading } = useLiveCatalog();

  // Project configuration state
  const [inputs, setInputs] = useState<ProjectInputs>(DEFAULT_PROJECT_INPUTS);
  const [activeStageId, setActiveStageId] = useState<number>(1);

  // Custom user quantity and selection overrides map
  const [itemOverrides, setItemOverrides] = useState<
    Record<string, { quantity?: number; selected?: boolean }>
  >({});

  // Modals state
  const [isPrintModalOpen, setPrintModalOpen] = useState(false);
  const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Add to cart mutation
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
    },
  });

  // Generate baseline BOQ from civil engineering math + live catalog
  const rawEstimate = useMemo(() => {
    return generateProjectBOQ(inputs, liveCatalog);
  }, [inputs, liveCatalog]);

  // Apply user-modified quantities and selections
  const finalEstimate: FullProjectEstimate = useMemo(() => {
    const updatedStages = rawEstimate.stages.map((st) => {
      const updatedItems = st.items.map((it) => {
        const override = itemOverrides[it.id];
        const qty = override?.quantity !== undefined ? override.quantity : it.quantity;
        const selected = override?.selected !== undefined ? override.selected : it.selected;
        const lineTotal = Math.round(it.sellingPrice * qty);
        const preGstBase = Math.round(lineTotal / (1 + it.gstPercent / 100));
        return {
          ...it,
          quantity: qty,
          selected,
          lineTotal,
          preGstBase,
        };
      });

      const subtotal = updatedItems.reduce((s, it) => s + (it.selected ? it.lineTotal : 0), 0);
      const preGstTotal = updatedItems.reduce((s, it) => s + (it.selected ? it.preGstBase : 0), 0);
      const gstTotal = subtotal - preGstTotal;

      const vehicleCounts: Record<string, number> = {
        "2W_BIKE": 0,
        "3W_ELECTRIC_LOADER": 0,
        "4W_PICKUP": 0,
        HEAVY_TRUCK: 0,
      };

      for (const it of updatedItems) {
        if (it.selected) {
          vehicleCounts[it.deliveryVehicleType] = (vehicleCounts[it.deliveryVehicleType] || 0) + 1;
        }
      }

      return {
        ...st,
        items: updatedItems,
        subtotal,
        preGstTotal,
        gstTotal,
        itemCount: updatedItems.length,
        vehicleCounts,
      };
    });

    const grandTotal = updatedStages.reduce((s, st) => s + st.subtotal, 0);
    const grandPreGst = updatedStages.reduce((s, st) => s + st.preGstTotal, 0);
    const grandGst = grandTotal - grandPreGst;
    const costPerSqFt = inputs.builtUpSqFt > 0 ? Math.round(grandTotal / inputs.builtUpSqFt) : 0;
    const totalItemsCount = updatedStages.reduce((s, st) => s + st.items.length, 0);

    const vehicleSummary = {
      bike: updatedStages.reduce((s, st) => s + (st.vehicleCounts["2W_BIKE"] || 0), 0),
      eLoader: updatedStages.reduce((s, st) => s + (st.vehicleCounts["3W_ELECTRIC_LOADER"] || 0), 0),
      pickup: updatedStages.reduce((s, st) => s + (st.vehicleCounts["4W_PICKUP"] || 0), 0),
      truckOrTrolley: updatedStages.reduce((s, st) => s + (st.vehicleCounts["HEAVY_TRUCK"] || 0), 0),
    };

    return {
      inputs,
      stages: updatedStages,
      grandTotal,
      grandPreGst,
      grandGst,
      costPerSqFt,
      totalItemsCount,
      vehicleSummary,
    };
  }, [rawEstimate, itemOverrides, inputs]);

  // Current active stage
  const activeStage =
    finalEstimate.stages.find((s) => s.stageId === activeStageId) || finalEstimate.stages[0];

  const selectedItemsInActiveStage = activeStage.items.filter((i) => i.selected);
  const selectedTotalInActiveStage = selectedItemsInActiveStage.reduce(
    (s, it) => s + it.lineTotal,
    0
  );

  // Toggle item selection
  const handleToggleItem = (itemId: string) => {
    setItemOverrides((prev) => {
      const current = prev[itemId]?.selected ?? activeStage.items.find((i) => i.id === itemId)?.selected ?? true;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          selected: !current,
        },
      };
    });
  };

  // Update item quantity
  const handleUpdateQty = (itemId: string, newQty: number) => {
    setItemOverrides((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: Math.max(1, newQty),
      },
    }));
  };

  // Toggle all items in active stage
  const handleToggleAll = (selectAll: boolean) => {
    const updates: Record<string, { selected: boolean }> = {};
    for (const it of activeStage.items) {
      updates[it.id] = {
        ...itemOverrides[it.id],
        selected: selectAll,
      };
    }
    setItemOverrides((prev) => ({ ...prev, ...updates }));
  };

  // 1-Click Add Active Stage to Conon-Now Cart
  const handleAddStageToCart = async () => {
    if (selectedItemsInActiveStage.length === 0) {
      toast.error("Please select at least one item to add to cart");
      return;
    }

    setIsAddingToCart(true);
    toast.loading(`Adding ${selectedItemsInActiveStage.length} Stage ${activeStage.stageId} materials to cart...`, {
      id: "add-stage-cart",
    });

    try {
      for (const it of selectedItemsInActiveStage) {
        await addToCart.mutateAsync({
          data: {
            materialId: it.matchedSkuId || it.id,
            name: `${it.title} (${it.brand})`,
            category: it.categorySlug,
            price: it.sellingPrice,
            unit: it.unit,
            quantity: it.quantity,
          },
        });
      }

      toast.success(
        `Added Stage ${activeStage.stageId} (${selectedItemsInActiveStage.length} items • ₹${Math.round(selectedTotalInActiveStage).toLocaleString("en-IN")}) to cart!`,
        {
          id: "add-stage-cart",
          action: {
            label: "View Cart",
            onClick: () => setLocation("/cart"),
          },
        }
      );
    } catch {
      toast.error("Could not add all items to cart. Please try again.", {
        id: "add-stage-cart",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // WhatsApp Pre-Formatted BOQ Share
  const handleShareWhatsApp = () => {
    const stageBreakdown = finalEstimate.stages
      .map((s) => `• Stage ${s.stageId} (${s.shortName}): ₹${Math.round(s.subtotal).toLocaleString("en-IN")}`)
      .join("\n");

    const message = `*CONON-NOW • 6-Stage Construction Material Estimate*
📍 *Site:* ${inputs.lucknowZone}, Lucknow
📐 *Built-Up Area:* ${inputs.builtUpSqFt.toLocaleString("en-IN")} sq ft (${inputs.floors === 1 ? "Ground" : `G+${inputs.floors - 1}`})
⭐ *Specification Tier:* ${inputs.qualityTier} Quality (${inputs.wallType === "RED_BRICK" ? "Kiln Red Bricks" : "AAC Blocks"})
💰 *Estimated Rate:* ₹${finalEstimate.costPerSqFt.toLocaleString("en-IN")}/sq ft

*Stage-by-Stage Subtotals:*
${stageBreakdown}

💎 *Grand Total (All 6 Stages):* ₹${Math.round(finalEstimate.grandTotal).toLocaleString("en-IN")} (Incl. GST)

_Generated live via Conon-Now 60-Minute Lucknow Delivery Platform_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919696727279?text=${encoded}`, "_blank");
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb & Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/home")}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Builder Kit • Flagship Planner
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-400">753 Live SKUs Synced</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                6-Stage Home Construction BOQ & Takeoff
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintModalOpen(true)}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs hidden sm:flex items-center gap-1.5"
            >
              <span>Print A4 BOQ</span>
            </button>
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Civil Engineer Call</span>
            </button>
          </div>
        </div>

        {/* 1. Project Configurator Bar */}
        <ProjectConfiguratorBar
          inputs={inputs}
          onChange={(up) => setInputs((prev) => ({ ...prev, ...up }))}
          costPerSqFt={finalEstimate.costPerSqFt}
          grandTotal={finalEstimate.grandTotal}
        />

        {/* 2. 6-Stage Timeline Stepper */}
        <StageTimelineStepper
          stages={finalEstimate.stages}
          activeStageId={activeStageId}
          onSelectStage={setActiveStageId}
        />

        {/* 3. Active Stage Header & Context Info */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1E293B] text-[#FDB813] text-[10px] font-black uppercase tracking-wider">
                Active Stage {activeStage.stageId} of 6
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeStage.items.length} verified material line items
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {activeStage.stageName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{activeStage.description}</p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Stage Subtotal (Incl. GST)
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900">
                ₹{Math.round(activeStage.subtotal).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Active Stage Interactive BOQ Table */}
        <StageBOQTable
          items={activeStage.items}
          onToggleItem={handleToggleItem}
          onUpdateQty={handleUpdateQty}
          onToggleAll={handleToggleAll}
        />

        {/* 5. Sticky Action Bar */}
        <StageStickyActionBar
          activeStage={activeStage}
          selectedCount={selectedItemsInActiveStage.length}
          selectedTotal={selectedTotalInActiveStage}
          onAddToCart={handleAddStageToCart}
          isAddingToCart={isAddingToCart}
          onPrintBOQ={() => setPrintModalOpen(true)}
          onShareWhatsApp={handleShareWhatsApp}
          onRequestQuote={() => setQuoteModalOpen(true)}
        />

        {/* Printable A4 BOQ Modal */}
        {isPrintModalOpen && (
          <PrintableBOQView
            estimate={finalEstimate}
            onClose={() => setPrintModalOpen(false)}
          />
        )}

        {/* Request Civil Engineer Consultation Modal */}
        <RequestQuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          estimate={finalEstimate}
        />
      </div>
    </Layout>
  );
}
