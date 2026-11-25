import React, { useState } from "react";
import { ArrowLeft, Search, X, MapPin, Crosshair, AlertCircle } from "lucide-react";

export interface LocationSelection {
  address: string;
  locality: string;
  pincode: string;
  isServiceable: boolean;
  pinLabel?: string;
  hindiLabel?: string;
}

interface SelectLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (loc: LocationSelection) => void;
  currentAddress?: string;
}

const PRESET_LOCATIONS: LocationSelection[] = [
  {
    address: "Sector J, Lucknow, Uttar Pradesh 226002",
    locality: "Sector J, Alambagh, Lucknow",
    pincode: "226002",
    isServiceable: true,
    pinLabel: "Sector J Alambagh",
    hindiLabel: "सेक्टर जे आलमबाग",
  },
  {
    address: "Jeevan enclave sushant golf city, Unnamed Road, Lucknow",
    locality: "Sushant Golf City, Lucknow",
    pincode: "226030",
    isServiceable: false, // Matches Screenshot 7 unserviceable demo
    pinLabel: "Jeevan enclave sushant golf city",
    hindiLabel: "जीवन एन्क्लेव सुशांत गोल्फ़ सिटी",
  },
  {
    address: "560035, Sarjapur Road, Bengaluru, Karnataka",
    locality: "Sarjapur Road, Bengaluru",
    pincode: "560035",
    isServiceable: true,
    pinLabel: "560035 Bengaluru Hub",
    hindiLabel: "बेंगलुरु हब 560035",
  },
  {
    address: "560002, Kalasipalyam, Bengaluru, Karnataka",
    locality: "Kalasipalya, Bengaluru",
    pincode: "560002",
    isServiceable: true,
    pinLabel: "Kalasipalyam Market",
    hindiLabel: "कलासीपल्याम मार्केट",
  },
  {
    address: "Hazratganj, Lucknow, Uttar Pradesh 226001",
    locality: "Hazratganj, Central Lucknow",
    pincode: "226001",
    isServiceable: true,
    pinLabel: "Hazratganj Hub",
    hindiLabel: "हज़रतगंज हब",
  },
  {
    address: "Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010",
    locality: "Gomti Nagar, Lucknow",
    pincode: "226010",
    isServiceable: true,
    pinLabel: "Vibhuti Khand",
    hindiLabel: "विभूति खंड गोमती नगर",
  },
];

export function SelectLocationModal({
  isOpen,
  onClose,
  onConfirmLocation,
  currentAddress = "Sector J, Lucknow, Uttar Pradesh 226002",
}: SelectLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState(
    currentAddress.includes("sushant")
      ? "Jeevan enclave sushant golf city, Unnamed Road, Lucknow"
      : currentAddress
  );
  const [selectedLoc, setSelectedLoc] = useState<LocationSelection>(
    PRESET_LOCATIONS.find((l) => l.address === currentAddress) || PRESET_LOCATIONS[1]
  );
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (loc: LocationSelection) => {
    setSelectedLoc(loc);
    setSearchQuery(loc.address);
    setIsSearching(false);
  };

  const filteredPresets = PRESET_LOCATIONS.filter(
    (l) =>
      l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.pincode.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden animate-in fade-in duration-200">
      {/* Top Header (Screenshot 7: < Select Your Location) */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-white shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-800 transition active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h2 className="text-base font-bold text-slate-900">Select Your Location</h2>
      </div>

      {/* Search Bar Input (Screenshot 7: Jeevan enclave sushant golf city... [X]) */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 relative shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 shadow-inner">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
            placeholder="Search address, locality, landmark..."
            className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 font-medium truncate"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearching(true);
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 transition"
              aria-label="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isSearching && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {filteredPresets.length > 0 ? (
              filteredPresets.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(loc)}
                  className="w-full p-3 text-left hover:bg-slate-50 flex items-start gap-3 transition"
                >
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{loc.locality}</p>
                    <p className="text-[11px] text-slate-500 truncate">{loc.address}</p>
                    {!loc.isServiceable ? (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                        Unserviceable area
                      </span>
                    ) : (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                        60-min delivery available
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching locations. Try &quot;Jeevan enclave&quot;, &quot;Sector J&quot;, or &quot;Hazratganj&quot;.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Realistic Map Visual Area (Screenshot 7) */}
      <div className="flex-1 relative bg-[#e5e3df] overflow-hidden flex items-center justify-center select-none">
        {/* Realistic Google Maps Canvas Vector */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* Background Map Land */}
            <rect width="100%" height="100%" fill="#f2efe9" />

            {/* Building parcels */}
            <g fill="#e6e1d8" stroke="#d5cebf" strokeWidth="1">
              <rect x="15%" y="12%" width="90" height="70" rx="2" />
              <rect x="68%" y="10%" width="120" height="90" rx="2" />
              <rect x="20%" y="42%" width="110" height="80" rx="2" />
              <rect x="70%" y="45%" width="100" height="85" rx="2" />
              <rect x="18%" y="72%" width="140" height="80" rx="2" />
              <rect x="65%" y="70%" width="120" height="90" rx="2" />
            </g>

            {/* Minor Roads */}
            <g stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M -20 180 L 800 190" />
              <path d="M -20 420 L 800 410" />
              <path d="M 180 -20 L 190 800" />
              <path d="M 380 -20 L 370 800" />
            </g>

            {/* Major Arterial Roads (Screenshot 7 Blue-Grey Highway Grid) */}
            <g stroke="#b8c8d8" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
              <path d="M -40 240 Q 200 230 460 250 T 900 270" />
              <path d="M 450 -20 L 410 800" />
              <path d="M -20 540 L 900 560" />
              <path d="M -20 580 L 900 600" />
            </g>
            {/* Inner White Road Fill */}
            <g stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
              <path d="M -40 240 Q 200 230 460 250 T 900 270" />
              <path d="M 450 -20 L 410 800" />
              <path d="M -20 540 L 900 560" />
              <path d="M -20 580 L 900 600" />
            </g>
          </svg>
        </div>

        {/* Map POI Labels matching Screenshot 7 */}
        <div className="absolute top-20 left-12 text-[10px] font-bold text-slate-500 pointer-events-none">
          Spacia Jeevan Enclave
        </div>
        <div className="absolute top-28 left-4 flex items-center gap-1 text-[10px] font-semibold text-blue-500 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px]">
            🛍
          </div>
          <span>Shop</span>
        </div>
        <div className="absolute top-14 right-4 text-[10px] font-medium text-slate-400 pointer-events-none text-right">
          RBCS water
          <br />
          cleaning s...
        </div>
        <div className="absolute bottom-28 left-6 text-[10px] font-bold text-slate-500 pointer-events-none">
          Brand Solar Panel
        </div>
        <div className="absolute bottom-40 right-16 flex items-center gap-1 text-[10px] font-bold text-slate-600 pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[8px]">
            🏢
          </div>
          <span>Shreeji Designs</span>
        </div>

        {/* Google Map Watermarks at bottom left / right (Screenshot 7) */}
        <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1 pointer-events-none opacity-85">
          <span className="font-black text-sm tracking-tighter text-slate-700">Google</span>
        </div>
        <div className="absolute bottom-2 right-3 z-10 text-[9px] text-slate-500 font-medium pointer-events-none hidden sm:block">
          Keyboard shortcuts · Map data ©2026 Google · Terms
        </div>

        {/* Center Pin & Unserviceable Callout (Screenshot 7 Exact Visual) */}
        <div className="relative z-20 flex flex-col items-center">
          {/* Callout Bubble with Triangle */}
          {!selectedLoc.isServiceable ? (
            <div className="flex flex-col items-center mb-1">
              <div className="px-3.5 py-1.5 bg-[#d92d20] text-white text-xs font-bold rounded-lg shadow-xl flex items-center gap-1">
                <span>Unserviceable area</span>
              </div>
              {/* Downward triangle arrow */}
              <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#d92d20]" />
            </div>
          ) : (
            <div className="flex flex-col items-center mb-1">
              <div className="px-3.5 py-1.5 bg-[#15803d] text-white text-xs font-bold rounded-lg shadow-xl flex items-center gap-1">
                <span>⚡ Delivery in 60 mins</span>
              </div>
              <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#15803d]" />
            </div>
          )}

          {/* Yellow Location Pin with Tree/Home Icon (Screenshot 7) */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#facc15] shadow-lg flex items-center justify-center text-slate-900 border-2 border-white">
                <span className="text-xs">🏡</span>
              </div>
              <div className="w-2.5 h-1 bg-black/30 rounded-full mx-auto mt-0.5 blur-[1px] absolute -bottom-1" />
            </div>

            {/* Pink / Magenta Location Text Callout (Screenshot 7) */}
            <div className="text-left font-bold text-xs text-[#d946ef] leading-tight drop-shadow-sm max-w-[180px]">
              <div>{selectedLoc.pinLabel || selectedLoc.locality}</div>
              {selectedLoc.hindiLabel && (
                <div className="text-[10px] text-[#c026d3]">{selectedLoc.hindiLabel}</div>
              )}
            </div>
          </div>
        </div>

        {/* Current Location Floating Button (Screenshot 7: White rounded capsule) */}
        <button
          onClick={() => {
            const defaultServiceable = PRESET_LOCATIONS[0];
            setSelectedLoc(defaultServiceable);
            setSearchQuery(defaultServiceable.address);
          }}
          className="absolute bottom-6 right-4 z-20 px-4 py-2 bg-white rounded-full shadow-lg border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition active:scale-95"
        >
          <Crosshair className="w-4 h-4 text-[#15803d]" />
          <span>Current Location</span>
        </button>
      </div>

      {/* Bottom Sheet Card: Delivering your order to (Screenshot 7) */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-2xl space-y-3 shrink-0">
        <p className="text-xs font-bold text-slate-800">Delivering your order to</p>

        {/* Yellow Delivery Address Card (Screenshot 7) */}
        <div className="bg-[#fef9c3] border border-[#fef08a] rounded-xl p-3 flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold text-slate-900 leading-snug">
            {selectedLoc.address}
          </div>
        </div>

        {/* Action Button: Non-deliverable area (Screenshot 7) OR Confirm Location */}
        {!selectedLoc.isServiceable ? (
          <button
            disabled
            className="w-full py-3.5 bg-[#2d2d2d] text-white font-bold text-sm rounded-xl cursor-not-allowed opacity-95 shadow-sm text-center"
          >
            Non-deliverable area
          </button>
        ) : (
          <button
            onClick={() => onConfirmLocation(selectedLoc)}
            className="w-full py-3.5 bg-[#15803d] hover:bg-[#166534] text-white font-bold text-sm rounded-xl transition shadow-md active:scale-[0.99] text-center"
          >
            Confirm Location
          </button>
        )}
      </div>
    </div>
  );
}
