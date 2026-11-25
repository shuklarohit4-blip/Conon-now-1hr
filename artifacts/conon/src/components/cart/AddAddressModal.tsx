import React, { useState } from "react";
import { X, MapPin, Home, Briefcase } from "lucide-react";
import { toast } from "sonner";

export interface UserAddress {
  tag: "Home" | "Project";
  houseNumber: string;
  areaLocality: string;
  receiverName: string;
  receiverPhone: string;
  pincode: string;
  fullAddress: string;
}

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (address: UserAddress) => void;
  onChangeLocation: () => void;
  initialLocality?: string;
  initialPincode?: string;
  defaultPhone?: string;
}

export function AddAddressModal({
  isOpen,
  onClose,
  onSaveAddress,
  onChangeLocation,
  initialLocality = "Jayanagar",
  initialPincode = "560002",
  defaultPhone = "9696727279",
}: AddAddressModalProps) {
  const [tag, setTag] = useState<"Home" | "Project">("Home");
  const [houseNumber, setHouseNumber] = useState("");
  const [areaLocality, setAreaLocality] = useState(
    initialLocality.includes("Sector J")
      ? "Sector J, Alambagh, Lucknow, Uttar Pradesh 226002"
      : "Kalasipalyam New Extension, Kalasipalya, Bengaluru, Karnataka 560002"
  );
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState(defaultPhone);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber.trim()) {
      toast.error("Please enter apartment or building name");
      return;
    }
    if (!receiverName.trim()) {
      toast.error("Please enter receiver's name");
      return;
    }
    if (!receiverPhone.trim() || receiverPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    const full = `${houseNumber.trim()}, ${areaLocality.trim()}`;
    const newAddress: UserAddress = {
      tag,
      houseNumber: houseNumber.trim(),
      areaLocality: areaLocality.trim(),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      pincode: initialPincode,
      fullAddress: full,
    };

    onSaveAddress(newAddress);
    toast.success("Delivery address saved!");
  };

  const displayLocalityTitle = initialLocality.includes(",")
    ? initialLocality.split(",")[0].trim()
    : initialLocality;

  const displayLocalitySubtitle = initialLocality.includes(",")
    ? initialLocality
    : `${initialLocality}, Bengaluru`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header (Screenshot 3: Add Address Details [X]) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-slate-900">Add Address Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-800" />
          </button>
        </div>

        {/* Selected Locality Header Row (Screenshot 3: 📍 Jayanagar / Jayanagar, Bengaluru [Change]) */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="font-bold text-slate-900 text-sm block truncate">
                {displayLocalityTitle}
              </span>
              <span className="text-slate-400 text-xs truncate block">
                {displayLocalitySubtitle}
              </span>
            </div>
          </div>
          <button
            onClick={onChangeLocation}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 ml-2"
          >
            Change
          </button>
        </div>

        {/* Address Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* SAVE ADDRESS AS Toggle (Screenshot 3: Home / Project) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Save Address As
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTag("Home")}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition text-xs ${
                  tag === "Home"
                    ? "bg-[#FEF7D6] border-[#FDE047] text-slate-900 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Home className="w-4 h-4 text-slate-800" />
                Home
              </button>
              <button
                type="button"
                onClick={() => setTag("Project")}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition text-xs ${
                  tag === "Project"
                    ? "bg-[#FEF7D6] border-[#FDE047] text-slate-900 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Briefcase className="w-4 h-4 text-slate-800" />
                Project
              </button>
            </div>
          </div>

          {/* APARTMENT / BUILDING */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Apartment/House Number/Building Name
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder=""
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* AREA / SECTOR / LOCALITY */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Area/Sector/Locality
            </label>
            <textarea
              rows={2}
              value={areaLocality}
              onChange={(e) => setAreaLocality(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none leading-relaxed"
              required
            />
          </div>

          {/* RECEIVER'S NAME */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Receiver&apos;s Name
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder=""
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* RECEIVER'S PHONE NUMBER */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Receiver&apos;s Phone Number
            </label>
            <input
              type="tel"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              placeholder="9696727279"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* Save Address Button (Screenshot 3: Warm yellow button) */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-4 bg-[#FDB813] hover:bg-[#F5B800] text-slate-950 font-bold text-sm rounded-2xl transition shadow-md active:scale-[0.99] text-center"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
