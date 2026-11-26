import React, { useState, useMemo } from "react";
import {
  X,
  Trash2,
  Clock,
  MapPin,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertTriangle,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Plus,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  useGetCart,
  useRemoveFromCart,
  useUpdateCartItem,
  useAddToCart,
  usePlaceOrder,
  getGetCartQueryKey,
  getGetOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CononProductMedia } from "../CononProductMedia";
import {
  SelectLocationModal,
  AddAddressModal,
  DeliveringToSheet,
  RedirectingModal,
  CashfreePaymentModal,
  type LocationSelection,
  type UserAddress,
} from "./index";
import { Confetti } from "../Confetti";

// Fixed delivery charges matching screenshots (708 total = 410 + 199 + 99)
const DELIVERY_CHARGE = 199;
const HANDLING_CHARGE = 99;
const UNLOADING_CHARGE = 199;

interface CartMainViewProps {
  onBack: () => void;
  isStandalonePage?: boolean;
}

function UnloadingHelperGraphic() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs text-emerald-600">
      <Truck className="w-6 h-6 text-emerald-600" />
    </div>
  );
}

function GstBadgeGraphic() {
  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#047857] p-1.5 flex flex-col items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
      <div className="w-8 h-8 bg-white/95 rounded-lg shadow-inner flex flex-col items-center justify-center relative p-1 border border-emerald-100">
        <span className="text-[10px] font-black tracking-tight text-[#047857] leading-none">GST</span>
        <div className="w-5 h-0.5 bg-emerald-200 rounded mt-1" />
        <div className="w-3.5 h-0.5 bg-emerald-200 rounded mt-0.5" />
      </div>
    </div>
  );
}

export function CartMainView({ onBack, isStandalonePage = false }: CartMainViewProps) {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const { data: cart, isLoading } = useGetCart({
    query: { queryKey: getGetCartQueryKey() },
  });

  const remove = useRemoveFromCart({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.info("Item removed from cart");
      },
    },
  });

  const update = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
    },
  });

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Sample item added to cart!");
      },
    },
  });

  const placeOrder = usePlaceOrder({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
        qc.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
      },
    },
  });

  // State management
  const [address, setAddress] = useState<UserAddress | null>(() => {
    try {
      const saved = localStorage.getItem("conon_user_address");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentLocation, setCurrentLocation] = useState<LocationSelection>({
    address: "560035, Sarjapur Road, Bengaluru, Karnataka",
    locality: "560035",
    pincode: "560035",
    isServiceable: true,
  });

  // Collapsible cards state
  const [billDetailsOpen, setBillDetailsOpen] = useState(true);
  const [cancellationPolicyOpen, setCancellationPolicyOpen] = useState(true);

  // Unloading helper toggle state
  const [unloadingAdded, setUnloadingAdded] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // GST Number State
  const [gstModalOpen, setGstModalOpen] = useState(false);
  const [gstinInput, setGstinInput] = useState(() => localStorage.getItem("conon_gstin") || "");
  const [companyInput, setCompanyInput] = useState(() => localStorage.getItem("conon_company") || "");
  const [savedGstin, setSavedGstin] = useState<string | null>(() => localStorage.getItem("conon_gstin"));

  // Flow Modals State
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [isAddAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [isDeliveringToOpen, setDeliveringToOpen] = useState(false);
  const [isRedirectingOpen, setRedirectingOpen] = useState(false);
  const [isCashfreeOpen, setCashfreeOpen] = useState(false);
  const [showOrderSuccessConfetti, setShowOrderSuccessConfetti] = useState(false);

  // Sync address changes
  const handleSaveAddress = (newAddr: UserAddress) => {
    setAddress(newAddr);
    localStorage.setItem("conon_user_address", JSON.stringify(newAddr));
    setAddAddressModalOpen(false);
  };

  const handleConfirmLocation = (loc: LocationSelection) => {
    setCurrentLocation(loc);
    setLocationModalOpen(false);
    setAddAddressModalOpen(true);
  };

  // Cart items compilation
  const allCartItems = useMemo(() => {
    if (!cart || !cart.categories) return [];
    return cart.categories.flatMap((cat: any) =>
      cat.items.map((item: any) => ({
        ...item,
        category: cat.category,
      }))
    );
  }, [cart]);

  // If cart is empty, user can seed Ultratech PPC Cement 50kg (matches Screenshot 1)
  const handleSeedDemoUltratech = () => {
    addToCart.mutate({
      data: {
        materialId: "ultratech-ppc-cement-50kg",
        category: "cement",
        name: "Ultratech PPC Cement, 50 Kg Bag",
        price: 410,
        unit: "50 Kg Bag",
        quantity: 1,
      },
    });
  };

  const subTotal = cart?.grandTotal || 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const unloadingFee = unloadingAdded ? UNLOADING_CHARGE : 0;

  const grandTotal = useMemo(() => {
    if (allCartItems.length === 0) return 0;
    return Math.max(0, subTotal - couponDiscount + DELIVERY_CHARGE + HANDLING_CHARGE + unloadingFee);
  }, [subTotal, couponDiscount, unloadingFee, allCartItems.length]);

  const payableAmount = grandTotal;

  // Coupon handler
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === "CONON100" || code === "PAYTM100") {
      setAppliedCoupon({ code, discount: 100 });
      toast.success(`Coupon ${code} applied! ₹100 discount`);
    } else if (code === "FIRST50") {
      setAppliedCoupon({ code, discount: 50 });
      toast.success(`Coupon ${code} applied! ₹50 discount`);
    } else if (code === "LUCKNOW60") {
      setAppliedCoupon({ code, discount: 60 });
      toast.success(`Coupon ${code} applied! ₹60 discount`);
    } else {
      toast.error("Invalid coupon code. Try 'CONON100' or 'FIRST50'");
    }
  };

  // Step increment & decrement helpers
  const handleStepQty = (item: any, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      remove.mutate({ itemId: item.id });
    } else {
      update.mutate({ itemId: item.id, data: { quantity: newQty } });
    }
  };

  // Clear Cart
  const handleClearCart = () => {
    if (allCartItems.length === 0) return;
    allCartItems.forEach((it: any) => {
      remove.mutate({ itemId: it.id });
    });
    toast.info("Cart cleared");
  };

  // Handle Save GST
  const handleSaveGst = (e: React.FormEvent) => {
    e.preventDefault();
    if (gstinInput.length < 15) {
      toast.error("Please enter a valid 15-digit GSTIN");
      return;
    }
    localStorage.setItem("conon_gstin", gstinInput.toUpperCase());
    localStorage.setItem("conon_company", companyInput);
    setSavedGstin(gstinInput.toUpperCase());
    setGstModalOpen(false);
    toast.success("GST details verified and saved for B2B tax invoice!");
  };

  // Order Placement
  const executeOrderPlacement = (paymentMethod: "CASH_ON_DELIVERY" | "CASHFREE_UPI") => {
    if (!address) {
      toast.error("Please add delivery address before ordering");
      return;
    }

    placeOrder.mutate(
      {
        data: {
          deliveryAddress: address.fullAddress,
          phoneNumber: address.receiverPhone,
        },
      },
      {
        onSuccess: () => {
          setShowOrderSuccessConfetti(true);
          toast.success(
            paymentMethod === "CASH_ON_DELIVERY"
              ? "Order Placed Successfully! Pay on Delivery enabled."
              : "Payment Verified & Order Placed Successfully!"
          );
          setDeliveringToOpen(false);
          setCashfreeOpen(false);
          setTimeout(() => {
            setLocation("/orders");
          }, 1800);
        },
        onError: () => {
          toast.error("Failed to place order. Please try again.");
        },
      }
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#f4f5f7] min-h-0 relative">
      {/* ── TOP HEADER (Screenshot 1: < 📍 560035 [Change]) ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-800 transition active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-slate-800 shrink-0" />
            {address ? (
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {address.houseNumber || address.tag || "Home"}
                </div>
                <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  {address.pincode ? `${address.pincode}, ` : ""}
                  {address.areaLocality?.split(",")[1]?.trim() || address.areaLocality?.split(",")[0]?.trim() || "Bengaluru"}
                </div>
              </div>
            ) : (
              <span className="text-sm font-bold text-slate-900 truncate">
                {currentLocation.pincode || "560035"}
              </span>
            )}
          </div>
        </div>

        {/* Change Location Button (Screenshot 1: Rounded button with green border) */}
        <button
          onClick={() => {
            if (address) {
              setAddAddressModalOpen(true);
            } else {
              setLocationModalOpen(true);
            }
          }}
          className="px-3.5 py-1 rounded-lg border border-[#1e7e34] text-[#1e7e34] bg-white text-xs font-semibold hover:bg-emerald-50 transition active:scale-95 shrink-0"
        >
          Change
        </button>
      </div>

      {/* ── SCROLLABLE CART BODY (Screenshot 1 & 5) ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : allCartItems.length === 0 ? (
          /* Empty Cart State with 1-Click Demo Seed */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center flex flex-col items-center justify-center my-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#1e7e34] mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Your Cart is Empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Load the benchmark Ultratech PPC Cement bag to test the exact 60-min delivery checkout experience.
            </p>

            <button
              onClick={handleSeedDemoUltratech}
              disabled={addToCart.isPending}
              className="mt-4 px-5 py-2.5 bg-[#1e7e34] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ultratech Cement (₹410)</span>
            </button>
          </div>
        ) : (
          <>
            {/* ── CARD 1: Delivery in 1 hr (Screenshot 1) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Delivery Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {/* Green Clock Circle Badge */}
                  <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1e7e34] shrink-0">
                    <Clock className="w-5 h-5 text-[#1e7e34]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">
                      Delivery in 1 hr
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Shipment of {allCartItems.length} {allCartItems.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                {/* Clear Button */}
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-1 text-xs font-medium text-[#1e7e34] hover:text-[#166534] transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {allCartItems.map((item: any) => {
                  return (
                    <div key={item.id} className="p-4 flex items-center gap-3">
                      {/* Product Thumbnail (Screenshot 1: Square with border) */}
                      <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        <CononProductMedia
                          product={item}
                          category={item.category}
                          title={item.name}
                          alt={item.name}
                          variant="thumb"
                          showGalleryBadge={false}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Title, Price & Bulk Pricing Link */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          ₹{item.price}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            toast.info(
                              "Bulk Pricing: 50+ bags @ 5% off · 100+ bags @ 8% off with free unloading!"
                            )
                          }
                          className="text-[11px] font-medium text-blue-600 underline underline-offset-2 decoration-dotted hover:text-blue-700 block mt-0.5 text-left"
                        >
                          Unlock Bulk Prices
                        </button>
                      </div>

                      {/* Dark Green Capsule Stepper (Screenshot 1: « - qty + ») */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center bg-[#1e7e34] text-white rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm gap-2">
                          <button
                            onClick={() => handleStepQty(item, -5)}
                            className="text-[10px] text-emerald-200 hover:text-white transition"
                            title="Decrement 5"
                          >
                            «
                          </button>
                          <button
                            onClick={() => handleStepQty(item, -1)}
                            className="text-xs hover:text-emerald-200 transition font-bold px-0.5"
                            title="Decrease 1"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleStepQty(item, 1)}
                            className="text-xs hover:text-emerald-200 transition font-bold px-0.5"
                            title="Increase 1"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleStepQty(item, 5)}
                            className="text-[10px] text-emerald-200 hover:text-white transition"
                            title="Increment 5"
                          >
                            »
                          </button>
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          ₹{item.total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── CARD 2: Coupons (Screenshot 1) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Coupons</h3>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1e7e34] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold">
                  <span>
                    Coupon &quot;{appliedCoupon.code}&quot; Applied (-₹{appliedCoupon.discount})
                  </span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* ── CARD 3: Bill Details (Screenshot 1, Collapsible) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <button
                onClick={() => setBillDetailsOpen(!billDetailsOpen)}
                className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm"
              >
                <span>Bill Details</span>
                {billDetailsOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {billDetailsOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Sub Total (Inclusive of GST)</span>
                    <span className="font-semibold text-slate-900">
                      ₹{subTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Coupon Discount</span>
                    <span className="font-semibold text-slate-900">
                      {couponDiscount > 0 ? `-₹${couponDiscount}` : "₹0"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="underline underline-offset-2 decoration-dotted text-slate-600">
                      Delivery Charge
                    </span>
                    <span className="font-semibold text-slate-900">₹{DELIVERY_CHARGE}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="underline underline-offset-2 decoration-dotted text-slate-600">
                      Handling Charge
                    </span>
                    <span className="font-semibold text-slate-900">₹{HANDLING_CHARGE}</span>
                  </div>

                  {unloadingAdded && (
                    <div className="flex justify-between text-amber-800 font-medium">
                      <span>Ground Floor Unloading Helper</span>
                      <span className="font-semibold">₹{UNLOADING_CHARGE}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2.5 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>Paying with wallet</span>
                    <span>₹0</span>
                  </div>

                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-0.5">
                    <span>Payable Amount</span>
                    <span>₹{payableAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── CARD 4: Need help with unloading? (Screenshot 1 & 5) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Delivery Helper 3D Graphic */}
                  <UnloadingHelperGraphic />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Need help with unloading?
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      A helper will unload the goods on the{" "}
                      <strong className="text-slate-800 font-bold">ground floor</strong> only
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-slate-900">₹199</span>
                  <button
                    onClick={() => {
                      setUnloadingAdded(!unloadingAdded);
                      toast.info(
                        !unloadingAdded
                          ? "Unloading helper added (+₹199)"
                          : "Unloading helper removed"
                      );
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                      unloadingAdded
                        ? "bg-[#1e7e34] text-white shadow-sm"
                        : "border border-[#1e7e34] text-[#1e7e34] hover:bg-emerald-50 bg-white"
                    }`}
                  >
                    {unloadingAdded ? "Added ✓" : "Add"}
                  </button>
                </div>
              </div>

              {/* Yellow Alert Banner Underneath (Screenshot 5) */}
              <div className="bg-[#FFFBEB] border-t border-[#FEF3C7] px-4 py-2 text-[11px] text-[#92400E] font-medium flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  !
                </div>
                <span>If you skip this, unloading will be your responsibility</span>
              </div>
            </div>

            {/* ── CARD 5: Add GST Number (Screenshot 5) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <GstBadgeGraphic />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {savedGstin ? `GSTIN: ${savedGstin}` : "Add GST number"}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {savedGstin
                      ? "GST Input Tax Credit (ITC) enabled for 18% invoice"
                      : "Claim GST input credit on your order"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setGstModalOpen(true)}
                className="px-4 py-1.5 rounded-lg border border-[#1e7e34] text-[#1e7e34] bg-white text-xs font-bold hover:bg-emerald-50 transition active:scale-95 shrink-0"
              >
                {savedGstin ? "Edit" : "Add"}
              </button>
            </div>

            {/* ── CARD 6: Cancellation Policy (Screenshot 5, Collapsible) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-4">
              <button
                onClick={() => setCancellationPolicyOpen(!cancellationPolicyOpen)}
                className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span>Cancellation Policy</span>
                </div>
                {cancellationPolicyOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {cancellationPolicyOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Orders cannot be modified once packed</p>
                  <p>
                    • Delivery location of an order cannot be changed. INR 199 additional charges in unavoidable cases
                  </p>
                  <p>
                    • Orders cannot be cancelled once dispatched. Cancellation charges of INR 199 would apply
                  </p>
                </div>
              )}
            </div>

            {/* ── FOOTER: App Download Badges & Links (Screenshot 5) ── */}
            <div className="pt-2 pb-6 space-y-4 text-center">
              {/* App Badges */}
              <div className="flex items-center justify-center gap-3">
                <div className="px-3 py-1.5 bg-black text-white rounded-lg flex items-center gap-2 text-[10px] font-semibold shadow-sm cursor-pointer hover:bg-slate-800">
                  <span>▶</span>
                  <div className="text-left leading-tight">
                    <span className="text-[8px] block uppercase text-slate-400">GET IT ON</span>
                    <span>Google Play</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-black text-white rounded-lg flex items-center gap-2 text-[10px] font-semibold shadow-sm cursor-pointer hover:bg-slate-800">
                  <span></span>
                  <div className="text-left leading-tight">
                    <span className="text-[8px] block uppercase text-slate-400">Download on the</span>
                    <span>App Store</span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-4 text-left max-w-xs mx-auto text-xs pt-2">
                <div>
                  <p className="font-bold text-slate-800">Company</p>
                  <p className="text-slate-500 mt-1 cursor-pointer hover:underline">About Us</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Policy</p>
                  <p className="text-slate-500 mt-1 cursor-pointer hover:underline">Refund Policy</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── STICKY BOTTOM ACTION BAR (Screenshot 1 & 4) ── */}
      {allCartItems.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-200 shadow-2xl shrink-0 z-10">
          {!address ? (
            /* When Address is NOT added (Screenshot 1 & 5): Solid green button "Add Address" */
            <button
              onClick={() => setAddAddressModalOpen(true)}
              className="w-full py-3.5 bg-[#1e7e34] hover:bg-[#166534] text-white font-bold text-sm rounded-xl transition shadow-md active:scale-[0.99] flex items-center justify-center text-center"
            >
              Add Address
            </button>
          ) : (
            /* When Address IS added (Screenshot 4): Price on left + "Continue to checkout >" on right */
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xl font-bold text-slate-900 leading-none">
                  ₹{Math.round(payableAmount).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Including GST
                </p>
              </div>

              <button
                onClick={() => setDeliveringToOpen(true)}
                className="py-3.5 px-6 bg-[#1e7e34] hover:bg-[#166534] text-white font-bold text-sm rounded-xl transition shadow-md active:scale-[0.99] flex items-center gap-1.5"
              >
                <span>Continue to checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: Select Location on Map (Screenshot 7) ── */}
      <SelectLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onConfirmLocation={handleConfirmLocation}
        currentAddress={address?.fullAddress || currentLocation.address}
      />

      {/* ── MODAL 2: Add Address Details (Screenshot 3) ── */}
      <AddAddressModal
        isOpen={isAddAddressModalOpen}
        onClose={() => setAddAddressModalOpen(false)}
        onSaveAddress={handleSaveAddress}
        onChangeLocation={() => {
          setAddAddressModalOpen(false);
          setLocationModalOpen(true);
        }}
        initialLocality={currentLocation.locality}
        initialPincode={currentLocation.pincode}
      />

      {/* ── MODAL 3: Delivering To Bottom Sheet (Screenshot 4) ── */}
      {address && (
        <DeliveringToSheet
          isOpen={isDeliveringToOpen}
          onClose={() => setDeliveringToOpen(false)}
          address={address}
          totalAmount={payableAmount}
          onPayOnDelivery={() => executeOrderPlacement("CASH_ON_DELIVERY")}
          onPayOnline={() => {
            setDeliveringToOpen(false);
            setRedirectingOpen(true);
          }}
          isPlacingOrder={placeOrder.isPending}
        />
      )}

      {/* ── MODAL 4: Redirecting Screen (Screenshot 2) ── */}
      <RedirectingModal
        isOpen={isRedirectingOpen}
        onCancel={() => setRedirectingOpen(false)}
        onComplete={() => {
          setRedirectingOpen(false);
          setCashfreeOpen(true);
        }}
      />

      {/* ── MODAL 5: Cashfree Payment Partner Modal (Screenshot 6) ── */}
      <CashfreePaymentModal
        isOpen={isCashfreeOpen}
        onClose={() => setCashfreeOpen(false)}
        totalAmount={payableAmount}
        phoneNumber={address?.receiverPhone || "9696727279"}
        onPaymentSuccess={(_method, _txId) => {
          executeOrderPlacement("CASHFREE_UPI");
        }}
        isProcessing={placeOrder.isPending}
      />

      {/* ── GST Number Entry Modal ── */}
      {gstModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Add GST Details</h3>
              <button onClick={() => setGstModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveGst} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstinInput}
                  onChange={(e) => setGstinInput(e.target.value.toUpperCase())}
                  placeholder="09AAAAA0000A1Z5"
                  className="w-full p-2.5 border rounded-xl font-mono uppercase text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Registered Business Name
                </label>
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="e.g. Verma Builders & Hardware"
                  className="w-full p-2.5 border rounded-xl text-xs"
                  required
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setGstModalOpen(false)}
                  className="flex-1 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#1e7e34] text-white rounded-xl text-xs font-bold"
                >
                  Save GST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confetti */}
      {showOrderSuccessConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti count={60} duration={3} />
        </div>
      )}
    </div>
  );
}
