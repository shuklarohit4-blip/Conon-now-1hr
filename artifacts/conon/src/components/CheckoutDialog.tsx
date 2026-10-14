import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Share2, Clock, MapPin, Check,
  ChevronRight, XCircle, Tag, Percent, Minus, Plus,
  ShoppingBag, Heart, Star, Package, Truck, Building2,
  ChevronDown, Zap, ShieldCheck, BadgeCheck, RotateCcw,
  X, Phone,
} from "lucide-react";
import {
  usePlaceOrder, useGetCart, useGetMaterials,
  useUpdateCartItem, useRemoveFromCart,
  getGetCartQueryKey, getGetOrdersQueryKey, getGetMaterialsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/UserContext";
import {
  PROMO_CODES, validatePromo, rememberPromo, recallPromo, forgetPromo, type PromoCode,
} from "../lib/promoCodes";
import { estimateLogistics, formatWeight } from "../lib/logistics";
import { PaymentSheet } from "./PaymentSheet";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { toast } from "sonner";
import { categoryPhoto, onImgError } from "../lib/imgFallback";

/* ── charges & tax ───────────────────────────────────────────── */
const GST_RATE  = 0.18;            // 18% standard GST on materials + service
const SLOT_SECS = 15 * 60;         // 1-hour delivery promise window: 15 min to order
const GREEN     = "#2a7a3b";
const BRAND     = "#1b4366";
const AMBER     = "#f59e0b";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* GSTIN: 2-digit state + 10-char PAN + entity/Z/checksum (15 chars total) */
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryFilter?: string;
  total: number;
}

/* ── donation amounts ────────────────────────────────────────── */
const DONATE_OPTS = ["₹5", "₹10", "₹15", "Custom"] as const;
const TIP_OPTS    = [
  { label: "₹20", emoji: "😄" },
  { label: "₹30", emoji: "😍" },
  { label: "₹50", emoji: "😍" },
  { label: "Custom", emoji: "🤝" },
];

export function CheckoutDialog({ isOpen, onClose, categoryFilter, total }: CheckoutDialogProps) {
  const { phone: userPhone, name: userName } = useUser();
  const bodyRef = useRef<HTMLDivElement>(null);

  /* address & phone */
  const [address, setAddress] = useState(() => localStorage.getItem("conon_last_address") ?? "Plot 42, Hazratganj, Lucknow — 226001");
  const [phone, setPhone]     = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(false);

  /* delivery-details bottom sheet (replaces native window.prompt dialogs) */
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const proceedAfterSaveRef = useRef(false);

  /* extras */
  const [labourService, setLabourService] = useState(false);
  const [donation, setDonation]       = useState<string | null>(null);
  const [tip, setTip]                 = useState<string | null>(null);
  const [giftPack, setGiftPack]       = useState(false);

  /* delivery instructions */
  const [deliveryNotes, setDeliveryNotes] = useState<string[]>([]);
  const toggleNote = (n: string) =>
    setDeliveryNotes(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  /* business / B2B tax invoice */
  const [bizOpen, setBizOpen]       = useState(() => !!localStorage.getItem("conon_gstin"));
  const [gstin, setGstin]           = useState(() => localStorage.getItem("conon_gstin") ?? "");
  const [company, setCompany]       = useState(() => localStorage.getItem("conon_company") ?? "");
  const gstinValid = !gstin || GSTIN_RE.test(gstin.trim().toUpperCase());

  /* 1-hour delivery promise countdown */
  const [slot, setSlot] = useState(SLOT_SECS);

  /* promo */
  const [promoInput, setPromoInput]     = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError]     = useState<string | null>(null);
  const [showPromos, setShowPromos]     = useState(false);

  useEffect(() => { if (isOpen && userPhone && !phone) setPhone(userPhone); }, [isOpen, userPhone, phone]);

  /* reset & run the 1-hour delivery promise countdown while open */
  useEffect(() => {
    if (!isOpen) return;
    setSlot(SLOT_SECS);
    const t = setInterval(() => setSlot(s => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !appliedPromo && !promoInput) {
      const r = recallPromo(); if (r) setPromoInput(r);
    }
  }, [isOpen, appliedPromo, promoInput]);

  useEffect(() => {
    if (!appliedPromo) return;
    const r = validatePromo(appliedPromo.code, total);
    if (!r.ok) { setAppliedPromo(null); setPromoError(`${appliedPromo.code} removed: ${r.reason}`); forgetPromo(); }
  }, [total, appliedPromo]);

  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    const r = validatePromo(appliedPromo.code, total);
    return r.ok ? r.discount : 0;
  }, [appliedPromo, total]);

  const applyPromo = () => {
    setPromoError(null);
    const r = validatePromo(promoInput, total);
    if (!r.ok) { setAppliedPromo(null); setPromoError(r.reason); return; }
    setAppliedPromo(r.promo); setPromoInput(r.promo.code); rememberPromo(r.promo.code);
  };
  const removePromo = () => { setAppliedPromo(null); setPromoInput(""); setPromoError(null); forgetPromo(); };
  const pickPromo   = (code: string) => {
    setPromoInput(code); setPromoError(null);
    const r = validatePromo(code, total);
    if (r.ok) { setAppliedPromo(r.promo); rememberPromo(r.promo.code); setShowPromos(false); }
    else setPromoError(r.reason);
  };

  /* cart data for items display */
  const qc = useQueryClient();
  const { data: cart }      = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: isOpen } });
  const { data: materials } = useGetMaterials(undefined, { query: { queryKey: getGetMaterialsQueryKey(), enabled: isOpen } });

  const update = useUpdateCartItem({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) } });
  const remove = useRemoveFromCart({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) } });

  /* all items across categories */
  const allItems = cart?.categories?.flatMap((c: any) => c.items) ?? [];

  /* ── dynamic construction bill ──────────────────────────────── */
  const logistics = useMemo(
    () => estimateLogistics(allItems.map((it: any) => ({
      category: it.category, unit: it.unit, name: it.name, quantity: it.quantity,
    }))),
    [allItems],
  );

  const bill = useMemo(() => {
    const itemTotal  = total;
    const deliveryFee = logistics.fee;
    const labourFee   = labourService ? logistics.unloadFee : 0;
    const giftAmt     = giftPack ? 30 : 0;
    const taxable     = Math.max(0, itemTotal + deliveryFee + labourFee + giftAmt - discount);
    const gst         = Math.round(taxable * GST_RATE);
    const cgst        = Math.round(gst / 2);
    const sgst        = gst - cgst;
    const grandTotal  = taxable + gst;
    return { itemTotal, deliveryFee, labourFee, giftAmt, taxable, gst, cgst, sgst, grandTotal };
  }, [total, logistics, labourService, giftPack, discount]);

  const grandTotal = bill.grandTotal;

  /* persist business / B2B details for the tax invoice */
  useEffect(() => {
    const g = gstin.trim().toUpperCase();
    if (bizOpen && g && GSTIN_RE.test(g)) {
      localStorage.setItem("conon_gstin", g);
      localStorage.setItem("conon_company", company.trim());
    } else if (!bizOpen) {
      localStorage.removeItem("conon_gstin");
      localStorage.removeItem("conon_company");
    }
  }, [bizOpen, gstin, company]);

  const handleAddressSelect = (place: { address: string; lat: number; lng: number }) => {
    setAddress(place.address);
    localStorage.setItem("conon_last_address", place.address);
    localStorage.setItem(
      "conon_last_address_coords",
      JSON.stringify({ lat: place.lat, lng: place.lng, label: place.address }),
    );
    toast.success("Delivery address updated");
  };

  const openEditDetails = (proceedAfterSave: boolean) => {
    proceedAfterSaveRef.current = proceedAfterSave;
    setPhoneError(null);
    setEditDetailsOpen(true);
  };

  const saveDetails = () => {
    const p = phone.trim();
    if (!address.trim()) { setPhoneError(null); toast.error("Please add a delivery address"); return; }
    if (p.length !== 10) { setPhoneError("Enter a valid 10-digit mobile number"); return; }
    setPhoneError(null);
    setEditDetailsOpen(false);
    if (proceedAfterSaveRef.current) {
      proceedAfterSaveRef.current = false;
      setPayOpen(true);
    } else {
      toast.success("Delivery details updated");
    }
  };

  const handlePlaceOrder = () => {
    if (!address) {
      toast.error("Please add a delivery address");
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!phone || phone.trim().length !== 10) {
      openEditDetails(true);
      return;
    }
    setPayOpen(true);
  };

  /* suggested products not in cart */
  const suggested = (materials?.slice(0, 6) ?? []).filter(
    (m: any) => !allItems.some((it: any) => it.name === m.name)
  ).slice(0, 6);

  /* display name */
  const displayName = userName || (phone ? `User, ${phone}` : "Your account");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed inset-0 z-50 flex flex-col bg-gray-50"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <div className="shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="flex-1 text-lg font-black text-gray-900">Checkout</h1>
            <button
              onClick={async () => {
                const text = "Check out my CONON order — materials delivered in 60 mins!";
                try {
                  if (navigator.share) await navigator.share({ title: "CONON Cart", text });
                  else { await navigator.clipboard.writeText(text); toast.success("Cart link copied!"); }
                } catch { /* dismissed */ }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-bold text-gray-600 active:scale-95 transition">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* ── 1-hour delivery promise countdown ─────────────── */}
          <div
            className="shrink-0 px-4 py-2.5 flex items-center gap-2.5 text-white"
            style={{ background: slot > 0 ? `linear-gradient(90deg, ${BRAND}, ${GREEN})` : "#b91c1c" }}
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" fill="currentColor" />
            </div>
            <p className="flex-1 text-[12px] font-bold leading-tight">
              {slot > 0 ? (
                <>Order within{" "}
                  <span className="font-black tabular-nums tracking-wider px-1.5 py-0.5 rounded-md bg-white/25">
                    {mmss(slot)}
                  </span>{" "}
                  to get delivery in <span className="font-black">exactly 1 hour</span>.
                </>
              ) : (
                <>This express slot just closed — order now for the next available 1-hour slot.</>
              )}
            </p>
          </div>

          {/* ── Body ────────────────────────────────────────── */}
          {(
            <div ref={bodyRef} className="flex-1 overflow-y-auto pb-32" style={{ overscrollBehavior: "contain" }}>

              {/* ── Order-for bar ──────────────────────────── */}
              <div className="bg-white px-4 py-3 border-b border-gray-100">
                {editingContact ? (
                  <div className="flex items-center gap-2">
                    <input value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      inputMode="numeric" placeholder="10-digit mobile number" autoFocus
                      className="flex-1 text-[13px] font-semibold text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-400" />
                    <button onClick={() => { setEditingContact(false); toast.success("Contact updated"); }}
                      className="text-sm font-black active:scale-95 transition shrink-0" style={{ color: GREEN }}>Save</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-gray-700">
                      Order for <span className="font-black text-gray-900">{displayName}{phone ? `, ${phone}` : ""}</span>
                    </p>
                    <button onClick={() => setEditingContact(true)}
                      className="text-sm font-black active:scale-95 transition" style={{ color: GREEN }}>Change</button>
                  </div>
                )}
              </div>

              {/* ── Delivery address (Google Places autocomplete) ── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <MapPin className="w-4 h-4" style={{ color: GREEN }} />
                  <p className="text-sm font-black text-gray-900">Delivery Address</p>
                </div>
                <AddressAutocomplete
                  initialValue={address}
                  placeholder="Search building, street or area…"
                  onSelect={handleAddressSelect}
                />
                {address && (
                  <p className="mt-2.5 text-[12px] text-gray-500 font-semibold flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                    <span className="leading-snug">{address}</span>
                  </p>
                )}
              </div>

              {/* ── Delivery instructions ──────────────────── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4" style={{ color: GREEN }} />
                  <p className="text-sm font-black text-gray-900">Delivery Instructions</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Call before arrival", "Unload at gate", "Crane / forklift available", "Avoid wet area"].map(note => {
                    const active = deliveryNotes.includes(note);
                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => toggleNote(note)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-black transition active:scale-95"
                        style={{
                          background: active ? "#e7f6ea" : "#f3f4f6",
                          color: active ? GREEN : "#475569",
                          border: active ? `1.5px solid ${GREEN}` : "1.5px solid transparent",
                        }}
                      >
                        {active && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        {note}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Delivery card + items ──────────────────── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900">Delivery in 60 minutes</p>
                    <p className="text-[11px] text-gray-500">Shipment of {allItems.length || "–"} item{allItems.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* items */}
                {allItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.unit}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => item.quantity <= 1 ? remove.mutate({ itemId: item.id }) : update.mutate({ itemId: item.id, data: { quantity: item.quantity - 1 } })}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                          style={{ color: GREEN }}>
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-black text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => update.mutate({ itemId: item.id, data: { quantity: item.quantity + 1 } })}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                          style={{ color: GREEN }}>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-black text-gray-900">₹{item.total}</p>
                    </div>
                  </div>
                ))}

                {allItems.length === 0 && (
                  <div className="py-8 flex flex-col items-center gap-2 text-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                    <p className="text-sm text-gray-400 font-semibold">No items in cart</p>
                  </div>
                )}
              </div>

              {/* ── You might also like ────────────────────── */}
              {suggested.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-base font-black text-gray-900 px-4 mb-3">You might also like</h3>
                  <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                    {suggested.map((m: any) => (
                      <div key={m.id} className="w-32 shrink-0 bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
                        <div className="relative">
                          <div className="h-24 bg-gray-100 flex items-center justify-center">
                            <img
                              src={m.imageUrl || categoryPhoto(m.category)}
                              alt={m.name}
                              loading="lazy"
                              className="h-full w-full object-contain p-2"
                              onError={onImgError}
                            />
                          </div>
                          <button onClick={() => toast.success(`Saved to wishlist: ${m.name}`)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center active:scale-90 transition">
                            <Heart className="w-3 h-3 text-gray-400" />
                          </button>
                          <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5">
                            <p className="text-[9px] font-bold text-gray-600">{m.unit || "per unit"}</p>
                          </div>
                        </div>
                        <div className="px-2 py-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-black text-gray-900">₹{m.price}</p>
                            <button onClick={() => toast.success(`Added to cart: ${m.name}`)}
                              className="px-2 py-0.5 rounded-lg border text-[10px] font-black active:scale-90 transition" style={{ borderColor: GREEN, color: GREEN }}>
                              ADD
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-700 font-semibold leading-tight line-clamp-2">{m.name}</p>
                          {m.rating && (
                            <div className="flex items-center gap-0.5 mt-1">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span className="text-[9px] font-bold text-gray-500">{m.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Use Coupons ────────────────────────────── */}
              <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
                {appliedPromo ? (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900">{appliedPromo.code} applied</p>
                      <p className="text-[11px] font-semibold text-green-600">You save ₹{discount}</p>
                    </div>
                    <button onClick={removePromo} className="text-[11px] font-black text-red-500">Remove</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setShowPromos(v => !v)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Percent className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="flex-1 text-sm font-black text-gray-900 text-left">Use Coupons</span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showPromos ? "rotate-90" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showPromos && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
                          <div className="p-4 space-y-3">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input placeholder="Enter promo code"
                                  className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border-0 rounded-xl text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500"
                                  value={promoInput}
                                  onChange={e => { setPromoInput(e.target.value); if (promoError) setPromoError(null); }}
                                  onKeyDown={e => e.key === "Enter" && applyPromo()} />
                              </div>
                              <button onClick={applyPromo} disabled={!promoInput.trim()}
                                className="px-4 rounded-xl text-sm font-black text-white disabled:opacity-40"
                                style={{ background: GREEN }}>
                                Apply
                              </button>
                            </div>
                            {promoError && (
                              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> {promoError}
                              </p>
                            )}
                            <div className="space-y-2">
                              {Object.values(PROMO_CODES).map(p => (
                                <button key={p.code} onClick={() => pickPromo(p.code)}
                                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition ${total >= p.minOrder ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50 opacity-60"}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-gray-900">{p.code}</span>
                                    <span className="text-[10px] font-black text-green-600 uppercase">{p.label}</span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 mt-0.5">{p.description}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* ── Unloading / Labour Service toggle ──────── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: `${AMBER}22` }}>
                    🦺
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900">Include Unloading / Labour Service</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Our crew unloads & stacks the materials at your site — no need to arrange labour.
                    </p>
                  </div>
                  <button
                    onClick={() => setLabourService(v => !v)}
                    role="switch"
                    aria-checked={labourService}
                    aria-label="Include unloading and labour service"
                    className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${labourService ? "" : "bg-gray-200"}`}
                    style={labourService ? { background: GREEN } : {}}
                  >
                    <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${labourService ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                {labourService && (
                  <p className="text-[11px] font-bold mt-2.5 pl-13 flex items-center gap-1.5" style={{ color: GREEN }}>
                    <Check className="w-3.5 h-3.5" strokeWidth={3} /> Added · {fmt(logistics.unloadFee)} for a {logistics.truck.label}
                  </p>
                )}
              </div>

              {/* ── Bill Details (construction-specific) ───── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4">
                <h3 className="text-base font-black text-gray-900 mb-3">Bill details</h3>

                <BillRow label="Item total" value={fmt(bill.itemTotal)} strong />

                {/* delivery & logistics — dynamic by weight / truck */}
                <div className="flex items-start justify-between py-2.5 border-b border-dashed border-gray-200">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm text-gray-700 font-semibold">Delivery &amp; Logistics Fee</p>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {logistics.truck.label} · approx {formatWeight(logistics.weightKg)}
                    </p>
                  </div>
                  <span className="text-sm font-black text-gray-900 shrink-0">{fmt(bill.deliveryFee)}</span>
                </div>

                {/* labour */}
                {bill.labourFee > 0 && (
                  <BillRow label="Unloading / Labour Service" value={fmt(bill.labourFee)} underline />
                )}

                {/* gift */}
                {bill.giftAmt > 0 && (
                  <BillRow label="Hard hat gift packaging" value={fmt(bill.giftAmt)} underline />
                )}

                {/* discount */}
                {discount > 0 && (
                  <div className="flex items-center justify-between py-2.5 border-b border-dashed border-gray-200">
                    <p className="text-sm text-green-600 font-semibold">Promo ({appliedPromo?.code})</p>
                    <span className="text-sm font-black text-green-600">−{fmt(discount)}</span>
                  </div>
                )}

                {/* GST with CGST / SGST split */}
                <div className="py-2.5 border-b border-dashed border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 font-semibold">GST (18%)</p>
                    <span className="text-sm font-black text-gray-900">{fmt(bill.gst)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pl-3">
                    <p className="text-[11px] text-gray-400 font-semibold">CGST @ 9%</p>
                    <span className="text-[11px] font-bold text-gray-500">{fmt(bill.cgst)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5 pl-3">
                    <p className="text-[11px] text-gray-400 font-semibold">SGST @ 9%</p>
                    <span className="text-[11px] font-bold text-gray-500">{fmt(bill.sgst)}</span>
                  </div>
                </div>

                {/* grand total — large, readable */}
                <div className="flex items-end justify-between pt-3.5 mt-1 border-t-2 border-gray-900">
                  <div>
                    <span className="text-base font-black text-gray-900">Grand Total</span>
                    <p className="text-[11px] text-gray-400 font-semibold">incl. all taxes &amp; logistics</p>
                  </div>
                  <span className="text-2xl font-black tabular-nums" style={{ color: BRAND }}>{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* ── Buying for Business? (B2B tax invoice) ── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
                <button
                  onClick={() => setBizOpen(v => !v)}
                  aria-expanded={bizOpen}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900">Buying for Business?</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Add GSTIN to get a B2B tax invoice &amp; claim input credit.
                    </p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${bizOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {bizOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100">
                      <div className="p-4 space-y-3">
                        <div>
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-wide">GSTIN Number</label>
                          <input
                            value={gstin}
                            onChange={e => setGstin(e.target.value.toUpperCase().slice(0, 15))}
                            placeholder="22AAAAA0000A1Z5"
                            autoCapitalize="characters"
                            className={`w-full mt-1 px-4 py-3 rounded-xl border-2 text-sm font-bold tracking-wider focus:outline-none transition ${gstin && !gstinValid ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-green-400"}`}
                          />
                          {gstin && !gstinValid && (
                            <p className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Enter a valid 15-character GSTIN
                            </p>
                          )}
                          {gstin && gstinValid && (
                            <p className="text-[11px] font-bold mt-1.5 flex items-center gap-1" style={{ color: GREEN }}>
                              <Check className="w-3 h-3" strokeWidth={3} /> Valid GSTIN — invoice will be raised to your business
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-wide">Company Name</label>
                          <input
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="e.g. Sharma Constructions Pvt Ltd"
                            className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold focus:outline-none focus:border-green-400 transition"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Support Construction Workers (donate) ─── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
                <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-base font-black text-gray-900">🧱 Support Site Workers</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Together, we can support the hands that build your dreams
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">Donate with <span className="font-black underline">every order</span> ↓</p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-2xl">🏗️</div>
                </div>
                <div className="flex gap-2 px-4 pb-4 flex-wrap">
                  {DONATE_OPTS.map(opt => (
                    <button key={opt} onClick={() => setDonation(d => d === opt ? null : opt)}
                      className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all relative ${donation === opt ? "border-green-600 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-700"}`}>
                      {donation === opt && opt !== "Custom" && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full" style={{ background: GREEN }}>SELECTED</span>
                      )}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Tip your delivery partner ──────────────── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-base font-black text-gray-900">Tip your delivery partner</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
                    </p>
                  </div>
                  <div className="text-3xl shrink-0">🛵</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {TIP_OPTS.map(t => (
                    <button key={t.label} onClick={() => setTip(v => v === t.label ? null : t.label)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all ${tip === t.label ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-800"}`}>
                      <span>{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Gift packaging ─────────────────────────── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-xl">🎁</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900">Hard Hat Gift Packaging</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Get your items in a special safety-marked bag for just ₹30</p>
                  </div>
                  <button onClick={() => setGiftPack(v => !v)}
                    className={`px-4 py-1.5 rounded-xl border text-sm font-black transition-all ${giftPack ? "border-green-600 text-white" : "border-green-600 text-green-700 bg-white"}`}
                    style={giftPack ? { background: GREEN } : {}}>
                    {giftPack ? "Added" : "Select"}
                  </button>
                </div>
              </div>

              {/* ── Cancellation Policy ────────────────────── */}
              <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-4">
                <p className="text-sm font-black text-gray-900 mb-1.5">Cancellation Policy</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Once order placed, any cancellation may result in a fee. In case of unexpected delays leading to order cancellation, a complete refund will be provided.
                </p>
              </div>

              {/* bottom spacer */}
              <div className="h-4" />
            </div>
          )}

          {/* ── Sticky Bottom Bar ──────────────────────────── */}
          {(
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>

              {/* security badges */}
              <div className="flex items-stretch divide-x divide-gray-100 border-b border-gray-100">
                <TrustBadge icon={<ShieldCheck className="w-3.5 h-3.5" />} label="SSL Secure" />
                <TrustBadge icon={<BadgeCheck className="w-3.5 h-3.5" />} label="Verified Materials" />
                <TrustBadge icon={<RotateCcw className="w-3.5 h-3.5" />} label="100% Damage Refund" />
              </div>

              {/* address row */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-gray-900">
                    Delivering to <span style={{ color: GREEN }}>Site</span>
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{address || "Add delivery address"}</p>
                </div>
                <button
                  onClick={() => openEditDetails(false)}
                  className="text-sm font-black shrink-0" style={{ color: GREEN }}>
                  Change
                </button>
              </div>

              {/* pay row — PAY USING (≈30%) + Place Order (≈70%) */}
              <div className="flex items-stretch gap-2 px-4 py-2.5">
                {/* pay using dropdown — opens the payment-method picker */}
                <button
                  onClick={() => setPayOpen(true)}
                  className="basis-[30%] shrink-0 flex flex-col justify-center rounded-xl border border-gray-200 px-3 py-1.5 active:scale-95 transition"
                >
                  <span className="text-[9px] font-black text-gray-400 leading-none flex items-center gap-1">
                    PAY USING <ChevronDown className="w-3 h-3" />
                  </span>
                  <span className="flex items-center gap-1.5 mt-1">
                    <span className="w-6 h-4 rounded bg-purple-700 flex items-center justify-center shrink-0">
                      <span className="text-[7px] font-black text-white">UPI</span>
                    </span>
                    <span className="text-[12px] font-black text-gray-700 truncate">UPI</span>
                  </span>
                </button>

                {/* place order button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!address}
                  className="flex-1 flex items-center justify-between rounded-xl px-4 py-2.5 text-white disabled:opacity-50 active:scale-95 transition"
                  style={{ background: GREEN }}
                >
                  <span className="text-left">
                    <span className="block text-lg font-black leading-none tabular-nums">{fmt(grandTotal)}</span>
                    <span className="block text-[9px] font-bold opacity-80 leading-none mt-0.5">GRAND TOTAL</span>
                  </span>
                  <span className="text-sm font-black whitespace-nowrap flex items-center gap-1">
                    Place Order <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ── Edit delivery details bottom sheet ──────────── */}
          <AnimatePresence>
            {editDetailsOpen && (
              <motion.div
                key="edit-details-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setEditDetailsOpen(false)}
                className="absolute inset-0 z-[60] bg-black/40"
              />
            )}
            {editDetailsOpen && (
              <motion.div
                key="edit-details-sheet"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 280 }}
                className="absolute bottom-0 left-0 right-0 z-[61] bg-white rounded-t-3xl shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label="Delivery details"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                <div className="px-5 pt-3 pb-5">
                    <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-black text-gray-900">Delivery details</h2>
                      <button
                        onClick={() => setEditDetailsOpen(false)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* address */}
                    <label className="flex items-center gap-1.5 mb-2 text-[12px] font-black text-gray-700">
                      <MapPin className="w-3.5 h-3.5" style={{ color: GREEN }} /> Delivery address
                    </label>
                    <AddressAutocomplete
                      initialValue={address}
                      placeholder="Search building, street or area…"
                      onSelect={handleAddressSelect}
                    />

                    {/* phone */}
                    <label className="flex items-center gap-1.5 mt-4 mb-2 text-[12px] font-black text-gray-700">
                      <Phone className="w-3.5 h-3.5" style={{ color: GREEN }} /> Contact number
                    </label>
                    <div
                      className="flex items-center rounded-xl border bg-white px-3 transition focus-within:border-gray-400"
                      style={{ borderColor: phoneError ? "#ef4444" : "#e5e7eb" }}
                    >
                      <span className="text-sm font-bold text-gray-400 pr-2 border-r border-gray-200">+91</span>
                      <input
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setPhoneError(null); }}
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        className="flex-1 text-sm font-semibold text-gray-800 py-2.5 pl-3 focus:outline-none bg-transparent"
                      />
                      {phone.length === 10 && <Check className="w-4 h-4 text-green-600 shrink-0" strokeWidth={3} />}
                    </div>
                    {phoneError && <p className="mt-1.5 text-[11px] font-bold text-red-500">{phoneError}</p>}

                    <button
                      onClick={saveDetails}
                      className="mt-5 w-full rounded-xl py-3.5 text-white text-sm font-black active:scale-[0.98] transition"
                      style={{ background: GREEN }}
                    >
                      {proceedAfterSaveRef.current ? "Save & Continue" : "Save details"}
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Payment flow (method select → processing → success/failure) ── */}
          <PaymentSheet
            isOpen={payOpen}
            onClose={() => setPayOpen(false)}
            amount={grandTotal}
            categoryFilter={categoryFilter}
            deliveryAddress={address}
            phoneNumber={phone}
            onOrderPlaced={() => {
              setPayOpen(false);
              setAppliedPromo(null);
              setPromoInput("");
              forgetPromo();
              onClose();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BillRow({ label, value, underline, strong }: { label: string; value: string; underline?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dashed border-gray-200">
      <span className={`text-sm font-semibold ${strong ? "text-gray-900 font-black" : "text-gray-700"} ${underline ? "underline decoration-dashed decoration-gray-400 underline-offset-2" : ""}`}>
        {label}
      </span>
      <span className="text-sm font-black text-gray-900 ml-3 tabular-nums">{value}</span>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-center">
      <span className="text-green-600">{icon}</span>
      <span className="text-[9px] font-black text-gray-500 leading-tight">{label}</span>
    </div>
  );
}
