import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight, Clock, Truck, Lightbulb } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { CheckoutDialog } from "./CheckoutDialog";
import PaymentCheckout from "./PaymentCheckout";
import {
  useGetCart, useRemoveFromCart, useUpdateCartItem, getGetCartQueryKey,
} from "@workspace/api-client-react";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const BRAND_DARK = "#1b4366";
const BRAND_MID  = "#5c92b1";
const AMBER      = "#f59e0b";

const TRUCK_CAPACITY_KG = 1500;

function estimateWeightKg(unit: string, quantity: number): number {
  const u = (unit || "").toLowerCase();
  let kgPer = 10;
  if (u.includes("bag"))    kgPer = 50;
  else if (u.includes("kg")) kgPer = 1;
  else if (u.includes("ton") || u.includes("tonne")) kgPer = 1000;
  else if (u.includes("cft") || u.includes("cuft"))  kgPer = 42;
  else if (u.includes("piece") || u.includes("no") || u.includes("nos")) kgPer = 3;
  else if (u.includes("litre") || u.includes("ltr") || u.includes("lt")) kgPer = 1.2;
  else if (u.includes("bundle")) kgPer = 25;
  return kgPer * quantity;
}

function TruckFillIndicator({ cart }: { cart: any }) {
  const totalKg = cart.categories.flatMap((c: any) => c.items).reduce((sum: number, item: any) => {
    return sum + estimateWeightKg(item.unit, item.quantity);
  }, 0);
  const pct     = Math.min(Math.round((totalKg / TRUCK_CAPACITY_KG) * 100), 100);
  const remain  = Math.max(0, TRUCK_CAPACITY_KG - totalKg);

  let barColor = "#15803d";
  let tipText  = "";
  if (pct < 40) {
    barColor = "#ef4444";
    tipText  = `Truck is only ${pct}% full — you're paying full delivery for a near-empty truck. Add more to save!`;
  } else if (pct < 75) {
    barColor = AMBER;
    tipText  = `Add ~${Math.round(remain / 50)} bags of cement or equivalent to fill the truck for the same trip cost.`;
  } else if (pct < 100) {
    barColor = "#15803d";
    tipText  = `Great load! Truck is ${pct}% full — maximum delivery value.`;
  } else {
    barColor = BRAND_DARK;
    tipText  = `Full truck! Consider splitting into two deliveries for safe transport.`;
  }

  const truckSegments = ["axle", "body-rear", "body-mid", "body-front", "cab"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[24px] p-4 mb-4 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: "#fff7ed" }}>
            <Truck className="w-4 h-4" style={{ color: AMBER }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Smart Load</p>
            <p className="text-xs font-black" style={{ color: BRAND_DARK }}>Mini-Truck Optimizer</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-display font-black italic" style={{ color: barColor }}>{pct}%</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Filled</p>
        </div>
      </div>

      {/* Truck silhouette bar */}
      <div className="relative mb-3">
        <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full transition-all"
            style={{ background: barColor }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-bold text-slate-300">0</span>
          <span className="text-[8px] font-bold text-slate-300">{(TRUCK_CAPACITY_KG / 1000).toFixed(1)} T capacity</span>
        </div>
      </div>

      {/* Tip */}
      {tipText && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-2.5">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: AMBER }} />
          <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">{tipText}</p>
        </div>
      )}
    </motion.div>
  );
}

export function CartSheet() {
  const { isCartOpen, setCartOpen } = useUI();
  const { data: cart, isLoading } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: isCartOpen } });
  const [checkoutCategory, setCheckoutCategory] = useState<string | null>(null);
  const [checkoutTotal, setCheckoutTotal]       = useState(0);

  const qc     = useQueryClient();
  const remove = useRemoveFromCart({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) } });
  const update = useUpdateCartItem({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) } });

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
              style={{ borderLeft: "1px solid #e2e8f0" }}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <h2 className="text-lg font-display font-black italic flex items-center gap-2" style={{ color: BRAND_DARK }}>
                  <ShoppingBag className="w-5 h-5" style={{ color: AMBER }} />
                  Smart Cart
                </h2>
                <button onClick={() => setCartOpen(false)} className="bg-slate-100 p-2 rounded-xl text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-0 scrollbar-hide bg-slate-50">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2].map(i => <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse" />)}
                  </div>
                ) : !cart || cart.categories.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <ShoppingBag className="w-14 h-14 mb-4 text-slate-300" />
                    <p className="font-display font-black italic text-lg" style={{ color: BRAND_DARK }}>Cart is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Add materials for 60-min JIT delivery</p>
                  </div>
                ) : (
                  <>
                    {/* Truck fill indicator — top of body */}
                    <TruckFillIndicator cart={cart} />

                    <div className="space-y-4">
                      {cart.categories.map((cat: any, ci: number) => (
                        <motion.div
                          key={cat.category}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: ci * 0.06 }}
                          className="bg-white rounded-[28px] overflow-hidden card-shadow"
                          style={{ border: "1px solid #f1f5f9" }}
                        >
                          {/* Cat header */}
                          <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <div>
                              <p className="font-display font-bold text-sm capitalize" style={{ color: BRAND_DARK }}>{cat.category}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">Via {cat.vendor}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                              <Clock className="w-2.5 h-2.5" />{cat.deliveryTime}m
                            </div>
                          </div>

                          {/* Items */}
                          <div className="p-4 space-y-3">
                            {cat.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <button
                                  onClick={() => remove.mutate({ itemId: item.id })}
                                  disabled={remove.isPending}
                                  aria-label={`Remove ${item.name} from cart`}
                                  title="Remove item"
                                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-90 transition disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-500" />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">₹{item.price}/{item.unit}</p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-1 py-0.5">
                                  <button
                                    onClick={() => item.quantity <= 1 ? remove.mutate({ itemId: item.id }) : update.mutate({ itemId: item.id, data: { quantity: item.quantity - 1 }})}
                                    className="w-6 h-6 flex items-center justify-center rounded-lg"
                                  >
                                    {item.quantity <= 1 ? <Trash2 className="w-3 h-3 text-rose-400" /> : <Minus className="w-3 h-3 text-slate-500" />}
                                  </button>
                                  <span className="text-sm font-black w-4 text-center" style={{ color: BRAND_DARK }}>{item.quantity}</span>
                                  <button onClick={() => update.mutate({ itemId: item.id, data: { quantity: item.quantity + 1 }})} className="w-6 h-6 flex items-center justify-center rounded-lg">
                                    <Plus className="w-3 h-3 text-slate-500" />
                                  </button>
                                </div>
                                <p className="text-sm font-black w-14 text-right" style={{ color: BRAND_DARK }}>₹{item.total}</p>
                              </div>
                            ))}
                          </div>

                          {/* Subtotal row */}
                          <div className="px-4 py-3 flex justify-between items-center" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subtotal</p>
                              <p className="text-base font-black italic" style={{ color: BRAND_DARK }}>₹{cat.subtotal}</p>
                            </div>
                            <button
                              onClick={() => { setCheckoutCategory(cat.category); setCheckoutTotal(cat.subtotal); }}
                              className="flex items-center gap-1.5 px-4 h-9 rounded-[20px] text-xs font-black text-white"
                              style={{ background: BRAND_DARK }}
                            >
                              Checkout <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Grand total */}
              {cart && cart.categories.length > 0 && (
                <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Grand Total ({cart.totalItems} items)</p>
                      <p className="text-2xl font-display font-black italic" style={{ color: BRAND_DARK }}>₹{cart.grandTotal}</p>
                    </div>
                    <button
                      onClick={() => { setCheckoutCategory("All Items"); setCheckoutTotal(cart.grandTotal); }}
                      className="px-6 h-11 rounded-[22px] font-black text-sm text-white shadow-lg"
                      style={{ background: BRAND_DARK, boxShadow: "0 4px 16px rgba(27,67,102,0.3)" }}
                    >
                      Checkout All
                    </button>
                  </div>

                  {/* ── Razorpay payment button ── */}
                  <PaymentCheckout amountPaise={Math.round(cart.grandTotal * 100)} />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutDialog
        isOpen={checkoutCategory !== null}
        onClose={() => { setCheckoutCategory(null); setCartOpen(false); }}
        categoryFilter={checkoutCategory === "All Items" ? undefined : checkoutCategory || undefined}
        total={checkoutTotal}
      />
    </>
  );
}
