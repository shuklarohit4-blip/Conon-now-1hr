import React from "react";
import { useLocation } from "wouter";
import { CartMainView } from "@/components/cart";

export default function CartPage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex justify-center">
      {/* Mobile-first centered app frame (matches home-run.co mobile browser view in screenshots) */}
      <div className="w-full sm:max-w-md md:max-w-lg min-h-screen bg-[#f4f5f7] shadow-xl flex flex-col">
        <CartMainView onBack={handleBack} isStandalonePage={true} />
      </div>
    </div>
  );
}
