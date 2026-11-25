import React from "react";
import { useLocation } from "wouter";
import { AuthModal } from "@/components/AuthModal";

export function Login() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-screen w-full bg-slate-100 flex items-center justify-center overflow-hidden">
      {/* ── Realistic Blurred Background Backdrop (Mimicking Storefront behind popup) ── */}
      <div className="absolute inset-0 filter blur-md pointer-events-none opacity-45 select-none scale-105">
        {/* Mock Top Banner */}
        <div className="h-9 bg-[#f2b705] w-full" />
        {/* Mock Navigation */}
        <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 rounded-md" />
          <div className="h-10 w-96 bg-slate-100 rounded-xl" />
          <div className="h-9 w-24 bg-slate-200 rounded-full" />
        </div>
        {/* Mock Hero Showcase Banner */}
        <div className="max-w-6xl mx-auto mt-6 h-64 bg-amber-100 rounded-3xl border border-amber-200 flex items-center justify-center">
          <div className="text-amber-800 text-3xl font-black opacity-30">FLAT 3% CASHBACK</div>
        </div>
        {/* Mock Product Grid */}
        <div className="max-w-6xl mx-auto mt-6 grid grid-cols-4 gap-4 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>

      {/* ── Active Centered Auth Modal (Exact Match to User Reference) ── */}
      <AuthModal
        isOpen={true}
        onClose={() => setLocation("/home")}
        onSuccess={() => setLocation("/home")}
      />
    </div>
  );
}

export default Login;
