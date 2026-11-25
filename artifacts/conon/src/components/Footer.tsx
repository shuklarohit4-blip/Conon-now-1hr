import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ShieldCheck, Truck, Clock, Phone, Mail, MapPin,
  CheckCircle2, Lock, Store, Navigation, Radio
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";

export function Footer() {
  const [, setLocation] = useLocation();
  const { openAuthModal } = useAuthContext();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Founder Convenience Trigger: Triple-click copyright text (Local Admin only)
  const handleCopyrightClick = () => {
    if (!IS_LOCAL_ADMIN) return;
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      openAuthModal("admin");
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 700);
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-10 pb-28 border-t border-slate-800 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Trust Value Props Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 mb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">1-Hour Delivery</p>
              <p className="text-[10px] text-slate-400">Hyperlocal site dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Direct from top brands</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Secure Payments</p>
              <p className="text-[10px] text-slate-400">Razorpay PCI-DSS certified</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Full Fleet Logistics</p>
              <p className="text-[10px] text-slate-400">From 500kg to 25 Ton tippers</p>
            </div>
          </div>
        </div>

        {/* Links Grid: 5 Balanced Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img
                src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                alt="CONON-NOW"
                className="h-7 w-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <span className="text-white font-black text-sm tracking-wide">CONON-NOW</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
              India&apos;s leading on-demand construction materials delivery platform. Fast, authentic, and reliable supply for modern builders, contractors, and home-owners.
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">
              Operated by <strong>CONON Infrabuilt Pvt. Ltd.</strong>
            </p>
          </div>

          {/* Col 2: Fast Quick Links */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">Quick Links</p>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li><Link href="/home" className="hover:text-white transition">Home Storefront</Link></li>
              <li><Link href="/categories" className="hover:text-white transition">All Categories</Link></li>
              <li><Link href="/kits" className="hover:text-white transition">Builder Kit BOQs</Link></li>
              <li><Link href="/rentals" className="hover:text-white transition">Machine & Rentals</Link></li>
              <li><Link href="/track" className="hover:text-white transition">Live Order Tracking</Link></li>
              <li><Link href="/khata" className="hover:text-white transition">CONON-NOW Khata</Link></li>
            </ul>
          </div>

          {/* Col 3: For Partners */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">For Partners</p>
            <ul className="space-y-2.5 text-slate-400 text-[11px]">
              <li>
                <Link
                  href="/vendor"
                  className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 font-medium transition group"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Partner Dukaan (Dukandar OS)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/driver"
                  className="flex items-center gap-2 text-slate-300 hover:text-amber-400 font-medium transition group"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Driver Partner (Cockpit)</span>
                </Link>
              </li>
              <li className="pt-2 text-[10px] text-slate-500 leading-normal">
                Join Lucknow&apos;s fastest dealer-fleet logistics network. Zero inventory overhead.
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Legal */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">Legal & Compliance</p>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li><Link href="/privacy-policy" className="hover:text-white transition font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition font-medium">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition font-medium">Cancellation & Refund</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition font-medium">Shipping Policy</Link></li>
              <li><Link href="/delete-account" className="hover:text-red-400 transition font-medium">Data Removal</Link></li>
              {IS_LOCAL_ADMIN && (
                <li>
                  <button
                    type="button"
                    onClick={() => openAuthModal("admin")}
                    className="hover:text-indigo-400 text-slate-500 transition font-semibold flex items-center gap-1 cursor-pointer text-[10.5px] mt-1"
                  >
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>Admin Command Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 5: Corporate Contact */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">Customer Support</p>
            <div className="space-y-2.5 text-slate-400 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Gomti Nagar, Lucknow, UP 226010, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>0522-4721924 (7 AM - 9 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>support@conon.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Secret Founder Convenience Trigger */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[10px]">
          <p
            onClick={handleCopyrightClick}
            title="CONON-NOW Infrabuilt (Click 3x or press Ctrl+Shift+A)"
            className="cursor-pointer select-none hover:text-slate-400 transition"
          >
            © {new Date().getFullYear()} CONON Infrabuilt Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Razorpay Verified Merchant
            </span>
            <span>•</span>
            <span>GST Registered</span>
            <span>•</span>
            <span>ISO 9001:2015 Compliant Supply Chain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
