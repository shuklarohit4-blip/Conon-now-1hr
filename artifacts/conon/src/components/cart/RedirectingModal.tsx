import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface RedirectingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

export function RedirectingModal({
  isOpen,
  onCancel,
  onComplete,
}: RedirectingModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200">
      {/* Top Bar with Back Arrow */}
      <div className="p-4 flex items-center shrink-0">
        <button
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
      </div>

      {/* Centered Content (Screenshot 2: Green Circle with Truck Graphic) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        {/* Large Green Circle with White Cement Truck and Motion Dashes (Screenshot 2) */}
        <div className="w-28 h-28 rounded-full bg-[#1e7e34] flex items-center justify-center text-white shadow-xl shadow-green-800/20 mb-8 relative">
          <svg
            className="w-18 h-18"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Speed / motion lines on left */}
            <path
              d="M6 31H16M10 26H18M8 36H15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* 3 Tank Bubbles on top of truck cargo (Cement / Construction Tanker) */}
            <circle cx="25" cy="23" r="3.5" fill="white" />
            <circle cx="32" cy="23" r="3.5" fill="white" />
            <circle cx="39" cy="23" r="3.5" fill="white" />
            {/* Delivery Truck Body */}
            <path d="M19 25 H43 V37 H19 Z" fill="white" />
            {/* Front Cab */}
            <path d="M43 27 H49 L55 33 V37 H43 V27 Z" fill="white" />
            {/* Cab Window */}
            <path d="M45 29 H48 L52 33 H45 V29 Z" fill="#1e7e34" />
            {/* Front Bumper & Headlight */}
            <rect x="54" y="34" width="2" height="2" rx="0.5" fill="#facc15" />
            {/* Wheels with 4-spoke star hub */}
            <circle cx="28" cy="38" r="4.5" fill="white" />
            <circle cx="28" cy="38" r="3" fill="#1e7e34" />
            <circle cx="48" cy="38" r="4.5" fill="white" />
            <circle cx="48" cy="38" r="3" fill="#1e7e34" />
            <path d="M28 35.5 V40.5 M25.5 38 H30.5" stroke="white" strokeWidth="0.8" />
            <path d="M48 35.5 V40.5 M45.5 38 H50.5" stroke="white" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Title (Screenshot 2) */}
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
          Almost there! Redirecting to secure payment...
        </h2>

        {/* Subtitle (Screenshot 2: exact text with period and no space after partner) */}
        <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-xs">
          Please wait while we connect you to our secure payment partner.This will take a moment
        </p>
      </div>
    </div>
  );
}
