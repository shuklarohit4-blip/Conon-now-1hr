import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onImgError } from "@/lib/imgFallback";
import {
  Star, Shield, ChevronRight, Plus, X,
  Share2, ShoppingBag, MapPin, Award,
  BookOpen, Layers, Home, Leaf, Compass,
  Image, Eye, Heart, MessageCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";

const BRAND_DARK = "#1b4366";
const GOLD       = "#b8960c";

/* ────────────────────────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────────────────────── */

const PRO_CATEGORIES = [
  { id: "architect",  icon: Home,    label: "Architects",          sub: "COA Verified",      color: "#1b4366", bg: "#eff6ff" },
  { id: "interior",   icon: Layers,  label: "Interior",            sub: "IIDA Certified",    color: "#7c3aed", bg: "#f5f3ff" },
  { id: "landscape",  icon: Leaf,    label: "Landscape",           sub: "ILA Members",       color: "#15803d", bg: "#f0fdf4" },
  { id: "vastu",      icon: Compass, label: "Vastu",               sub: "Certified Experts", color: "#b45309", bg: "#fffbeb" },
];

const DESIGNERS = [
  {
    id: 1,
    name: "Ar. Priya Sharma",
    role: "Architect",
    specialty: "Luxury Residences & High-Rise",
    city: "Lucknow",
    rating: 4.9,
    reviews: 142,
    exp: 14,
    verified: true,
    badge: "COA",
    badgeColor: GOLD,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format&fit=crop",
    projects: [
      {
        id: "p1",
        img: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&q=80&auto=format&fit=crop",
        title: "3BHK Gomti Nagar Villa",
        tags: [
          { label: "Kajaria Vitrified", price: "₹65/sqft", cat: "tiles"  },
          { label: "Asian Paints Apex", price: "₹340/L",   cat: "paint"  },
          { label: "Hafele Handles",    price: "₹1,200/pc", cat: "hardware" },
        ],
      },
      {
        id: "p2",
        img: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&q=80&auto=format&fit=crop",
        title: "Aashiyana Heights Lobby",
        tags: [
          { label: "Marble 24×24",      price: "₹95/sqft", cat: "tiles"  },
          { label: "Birla White Putty",  price: "₹385/bag", cat: "finishing" },
        ],
      },
    ],
    consultFee: "₹2,500 / hr",
    moodBoards: 8,
    blueprints: 3,
  },
  {
    id: 2,
    name: "Sanjay Mehta ID",
    role: "Interior Designer",
    specialty: "Luxury Kitchens & Modular",
    city: "Lucknow",
    rating: 4.8,
    reviews: 98,
    exp: 11,
    verified: true,
    badge: "IIDA",
    badgeColor: "#7c3aed",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=600&q=80&auto=format&fit=crop",
    projects: [
      {
        id: "p3",
        img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&auto=format&fit=crop",
        title: "Modular Kitchen — Aliganj",
        tags: [
          { label: "Greenply Shuttering",  price: "₹78/sqft",   cat: "shuttering" },
          { label: "Johnson Metro Tiles",  price: "₹48/sqft",   cat: "tiles"      },
          { label: "Havells LED Wiring",   price: "₹22/m",      cat: "electrical" },
        ],
      },
    ],
    consultFee: "₹1,800 / hr",
    moodBoards: 14,
    blueprints: 0,
  },
  {
    id: 3,
    name: "Ar. Reena Gupta",
    role: "Architect",
    specialty: "Commercial & Office Interiors",
    city: "Kanpur",
    rating: 4.7,
    reviews: 67,
    exp: 9,
    verified: true,
    badge: "COA",
    badgeColor: GOLD,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&auto=format&fit=crop",
    projects: [
      {
        id: "p4",
        img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80&auto=format&fit=crop",
        title: "Corp Office — Hazratganj",
        tags: [
          { label: "Somany Glossy Tiles", price: "₹55/sqft",  cat: "tiles"      },
          { label: "Nerolac Impressions", price: "₹280/L",    cat: "paint"      },
          { label: "Godrej Door Locks",   price: "₹2,800/pc", cat: "hardware"   },
        ],
      },
    ],
    consultFee: "₹1,500 / hr",
    moodBoards: 5,
    blueprints: 7,
  },
  {
    id: 4,
    name: "Vivek Vastu Expert",
    role: "Vastu Consultant",
    specialty: "Residential Vastu Planning",
    city: "Lucknow",
    rating: 4.6,
    reviews: 203,
    exp: 18,
    verified: false,
    badge: "",
    badgeColor: "#475569",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format&fit=crop",
    projects: [],
    consultFee: "₹800 / session",
    moodBoards: 0,
    blueprints: 12,
  },
];

const BLUEPRINTS = [
  {
    id: "bp1",
    title: "20×50 East Facing — 3BHK",
    author: "Ar. Priya Sharma",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop",
    price: "₹1,499",
    pages: 14,
    format: "PDF + DWG",
    sold: 87,
    badge: "Best Seller",
    badgeColor: "#1b4366",
  },
  {
    id: "bp2",
    title: "30×40 North Facing — 2BHK+Study",
    author: "Ar. Reena Gupta",
    img: "https://images.unsplash.com/photo-1574691250077-03a929faece5?w=400&q=80&auto=format&fit=crop",
    price: "₹1,299",
    pages: 10,
    format: "PDF + AutoCAD",
    sold: 54,
    badge: "Vastu Compliant",
    badgeColor: "#b45309",
  },
  {
    id: "bp3",
    title: "40×60 Duplex — 4BHK Premium",
    author: "Ar. Priya Sharma",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80&auto=format&fit=crop",
    price: "₹2,999",
    pages: 22,
    format: "PDF + 3D Renders",
    sold: 31,
    badge: "3D Renders",
    badgeColor: "#7c3aed",
  },
  {
    id: "bp4",
    title: "25×50 West Facing — 3BHK Corner",
    author: "Ar. Reena Gupta",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80&auto=format&fit=crop",
    price: "₹1,799",
    pages: 16,
    format: "PDF + DWG",
    sold: 43,
    badge: "New",
    badgeColor: "#15803d",
  },
];

const SAMPLE_MOODBOARD = {
  designer: "Sanjay Mehta ID",
  title: "Modern Minimalist — 3BHK Living Room",
  items: [
    { label: "Asian Paints — Misty Mountains",    cat: "paint",    price: "₹340/L",     color: "#c8d1d0" },
    { label: "Kajaria Timber Vitrified 60×120",   cat: "tiles",    price: "₹65/sqft",   color: "#c8a882" },
    { label: "Birla White Wall Putty",             cat: "finishing",price: "₹385/bag",   color: "#f5f0e8" },
    { label: "Havells LED Strip Wiring Kit",       cat: "electrical",price:"₹22/m",      color: "#f5f5dc" },
    { label: "Hettich Piano Hinges (SS)",          cat: "hardware", price: "₹280/pair",  color: "#c0c0c0" },
    { label: "Dulux Weathershield Primer",         cat: "paint",    price: "₹210/L",     color: "#e8e0d8" },
  ],
  total: "₹38,400 (estimated for 800 sqft)",
};

/* ────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
──────────────────────────────────────────────────────────────────── */

function ShoppablePhoto({ project, accentColor }: { project: typeof DESIGNERS[0]["projects"][0]; accentColor: string }) {
  const [showTags, setShowTags] = useState(false);
  return (
    <div className="relative rounded-[20px] overflow-hidden" style={{ aspectRatio: "4/3" }}>
      <img src={project.img} alt={project.title} className="w-full h-full object-cover" onError={onImgError} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Dot hotspots */}
      {project.tags.map((tag, ti) => (
        <button
          key={ti}
          onClick={() => { setShowTags(!showTags); }}
          className="absolute w-5 h-5 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-lg"
          style={{
            background: accentColor,
            top: `${28 + ti * 20}%`,
            left: `${20 + ti * 25}%`,
          }}
        >
          <Plus className="w-2.5 h-2.5 text-white" />
        </button>
      ))}

      {/* Shoppable badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
        <ShoppingBag className="w-2.5 h-2.5 text-amber-300" />
        <span className="text-[7px] font-black text-white uppercase tracking-wide">Shoppable</span>
      </div>

      {/* Title */}
      <p className="absolute bottom-2 left-3 text-white text-[9px] font-black drop-shadow">{project.title}</p>

      {/* Tag panel */}
      <AnimatePresence>
        {showTags && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white/96 backdrop-blur-sm rounded-t-[18px] p-3"
          >
            <button onClick={() => setShowTags(false)} className="absolute top-2 right-2 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Materials Used</p>
            <div className="space-y-1.5">
              {project.tags.map((tag, ti) => (
                <div key={ti} className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-700">{tag.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black" style={{ color: BRAND_DARK }}>{tag.price}</span>
                    <button
                      onClick={() => toast.success(`${tag.label} added to cart!`)}
                      className="px-2 py-0.5 rounded-full text-white text-[7px] font-black"
                      style={{ background: accentColor }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesignerCard({ d, onOpen }: { d: typeof DESIGNERS[0]; onOpen: (d: typeof DESIGNERS[0]) => void }) {
  const roleColor = d.role === "Architect" ? BRAND_DARK : d.role === "Interior Designer" ? "#7c3aed" : d.role === "Vastu Consultant" ? "#b45309" : "#15803d";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[28px] overflow-hidden mb-4"
      style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      {/* Cover + avatar */}
      <div className="relative h-28 overflow-hidden">
        <img src={d.cover} alt={d.name} className="w-full h-full object-cover" onError={onImgError} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {d.verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-white text-[7px] font-black shadow"
            style={{ background: d.badgeColor }}>
            <Award className="w-2.5 h-2.5" /> {d.badge} Verified
          </div>
        )}
        <div className="absolute -bottom-6 left-4">
          <img src={d.avatar} alt={d.name} onError={onImgError}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" />
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="font-black text-slate-900 text-sm leading-tight">{d.name}</p>
            <p className="text-[9px] font-black uppercase tracking-wide mt-0.5" style={{ color: roleColor }}>{d.role} · {d.city}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-black text-amber-600">{d.rating}</span>
            <span className="text-[8px] text-amber-400">({d.reviews})</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-500 font-bold mb-3">{d.specialty} · {d.exp} yrs exp</p>

        {/* Stats row */}
        <div className="flex gap-2 mb-3">
          {[
            { val: d.projects.length, label: "Projects" },
            { val: d.moodBoards,      label: "Boards"   },
            { val: d.blueprints,      label: "Plans"    },
          ].map(s => (
            <div key={s.label} className="flex-1 text-center py-2 bg-slate-50 rounded-[12px]">
              <p className="font-black text-sm" style={{ color: BRAND_DARK }}>{s.val}</p>
              <p className="text-[7px] font-bold text-slate-400 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Shoppable project photos */}
        {d.projects.length > 0 && (
          <div className="mb-3 space-y-2">
            {d.projects.slice(0, 1).map(proj => (
              <ShoppablePhoto key={proj.id} project={proj} accentColor={roleColor} />
            ))}
          </div>
        )}

        {/* CTA row */}
        <div className="flex gap-2">
          <button
            onClick={() => toast.success(`Consultation request sent to ${d.name}!`)}
            className="flex-1 py-2.5 rounded-[16px] text-white text-[10px] font-black"
            style={{ background: roleColor }}
          >
            Consult · {d.consultFee}
          </button>
          <button
            onClick={() => onOpen(d)}
            className="px-4 py-2.5 rounded-[16px] border text-[10px] font-black"
            style={{ borderColor: roleColor + "40", color: roleColor }}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />View All
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MoodBoardModal({ onClose }: { onClose: () => void }) {
  const mb = SAMPLE_MOODBOARD;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] overflow-hidden"
        style={{ maxHeight: "88vh" }}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />
        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "82vh" }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4 pt-2">
            <div>
              <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest">Material Palette</p>
              <p className="font-display font-black italic text-lg text-slate-900 leading-tight">{mb.title}</p>
              <p className="text-[9px] text-slate-400 font-bold">by {mb.designer}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Colour swatches */}
          <div className="flex gap-1.5 mb-4">
            {mb.items.map((item, i) => (
              <div key={i} className="flex-1 h-10 rounded-xl" style={{ background: item.color }} />
            ))}
          </div>

          {/* Items */}
          <div className="space-y-2.5 mb-5">
            {mb.items.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-[16px]"
              >
                <div className="w-8 h-8 rounded-[10px] shrink-0" style={{ background: item.color, border: "1px solid rgba(0,0,0,0.08)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-800 leading-tight truncate">{item.label}</p>
                  <p className="text-[8px] font-bold text-slate-400 capitalize">{item.cat}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-black" style={{ color: BRAND_DARK }}>{item.price}</span>
                  <button onClick={() => toast.success(`${item.label} added!`)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ background: BRAND_DARK }}>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Estimated total */}
          <div className="flex items-center justify-between px-4 py-3 rounded-[18px] mb-3"
            style={{ background: BRAND_DARK + "10" }}>
            <div>
              <p className="text-[8px] font-bold text-slate-400">Estimated Total</p>
              <p className="font-black text-base" style={{ color: BRAND_DARK }}>{mb.total}</p>
            </div>
          </div>

          {/* Order all */}
          <button
            onClick={() => { toast.success("All 6 materials added to cart! 🛒"); onClose(); }}
            className="w-full py-3.5 rounded-[20px] text-white font-black text-sm flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${BRAND_DARK} 0%, #2d6a9f 100%)` }}
          >
            <ShoppingBag className="w-4 h-4" /> Order All Materials
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Palette link copied!");
              } catch {
                toast.error("Couldn't copy link", { description: "Please copy it from the address bar." });
              }
            }}
            className="w-full py-3 rounded-[20px] border text-[11px] font-black flex items-center justify-center gap-2 mt-2"
            style={{ borderColor: BRAND_DARK + "30", color: BRAND_DARK }}
          >
            <Share2 className="w-3.5 h-3.5" /> Share Palette Link
          </button>
        </div>
      </motion.div>
    </>
  );
}

function DesignerDetailDrawer({ d, onClose }: { d: typeof DESIGNERS[0]; onClose: () => void }) {
  const roleColor = d.role === "Architect" ? BRAND_DARK : d.role === "Interior Designer" ? "#7c3aed" : "#b45309";
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
        <div className="overflow-y-auto pb-8" style={{ maxHeight: "86vh" }}>
          <div className="relative h-36 overflow-hidden">
            <img src={d.cover} alt={d.name} className="w-full h-full object-cover" onError={onImgError} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <button onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute -bottom-6 left-4 flex items-end gap-3">
              <img src={d.avatar} alt={d.name} onError={onImgError}
                className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-xl" />
            </div>
          </div>

          <div className="px-5 pt-9">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-900 text-base">{d.name}</p>
                  {d.verified && (
                    <span className="text-[7px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: d.badgeColor }}>
                      ✓ {d.badge}
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-black uppercase" style={{ color: roleColor }}>{d.role} · {d.city} · {d.exp} yrs</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-black text-amber-700">{d.rating} ({d.reviews})</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mb-4">{d.specialty}</p>

            {/* All projects */}
            {d.projects.length > 0 && (
              <div className="mb-5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Portfolio — Shoppable</p>
                <div className="space-y-3">
                  {d.projects.map(proj => (
                    <ShoppablePhoto key={proj.id} project={proj} accentColor={roleColor} />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { toast.success(`Consultation request sent to ${d.name}!`); onClose(); }}
              className="w-full py-3.5 rounded-[20px] text-white font-black text-sm"
              style={{ background: roleColor }}
            >
              Book Consultation · {d.consultFee}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────── */
export function DesignersHub() {
  const [activeTab, setActiveTab]     = useState<"portfolio"|"blueprints"|"boards">("portfolio");
  const [activeFilter, setFilter]     = useState<string | null>(null);
  const [openDesigner, setOpenDesigner] = useState<typeof DESIGNERS[0] | null>(null);
  const [showMoodBoard, setShowMoodBoard] = useState(false);

  const filtered = activeFilter
    ? DESIGNERS.filter(d => d.role.toLowerCase().includes(activeFilter))
    : DESIGNERS;

  return (
    <Layout>
      <div className="px-4 pt-5 pb-28">
        {/* Hero banner */}
        <div
          className="relative rounded-[28px] overflow-hidden mb-5 p-5"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1b4366 60%, #2d6a9f 100%)" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: "#f59e0b", transform: "translate(30%, -30%)" }} />
          <p className="text-[8px] font-black text-amber-300 uppercase tracking-[0.2em] mb-1">Professionals on CONON</p>
          <p className="font-display font-black italic text-white text-xl leading-tight mb-1">
            Design &amp; Architecture Hub
          </p>
          <p className="text-blue-200/70 text-[9px] mb-4">
            COA-verified Architects · IIDA Interior Designers · Vastu Experts
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/10 rounded-[14px] px-3 py-2 text-center">
              <p className="font-black text-white text-base">120+</p>
              <p className="text-[8px] text-blue-200/70 font-bold">Verified Pros</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-[14px] px-3 py-2 text-center">
              <p className="font-black text-white text-base">840+</p>
              <p className="text-[8px] text-blue-200/70 font-bold">Projects Done</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-[14px] px-3 py-2 text-center">
              <p className="font-black text-white text-base">260+</p>
              <p className="text-[8px] text-blue-200/70 font-bold">Blueprints</p>
            </div>
          </div>
        </div>

        {/* Pro category pills */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {PRO_CATEGORIES.map(pc => {
            const Icon = pc.icon;
            const isActive = activeFilter === pc.id;
            return (
              <motion.button key={pc.id} whileTap={{ scale: 0.93 }}
                onClick={() => setFilter(isActive ? null : pc.id)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-[20px] border transition-all"
                style={{
                  background: isActive ? pc.color : pc.bg,
                  borderColor: isActive ? pc.color : pc.color + "25",
                }}
              >
                <Icon className="w-5 h-5" style={{ color: isActive ? "#fff" : pc.color }} strokeWidth={1.8} />
                <span className="text-[8px] font-black uppercase tracking-tight text-center leading-tight"
                  style={{ color: isActive ? "#fff" : pc.color }}>
                  {pc.label}
                </span>
                <span className="text-[6px] font-bold text-center leading-tight"
                  style={{ color: isActive ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>
                  {pc.sub}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl mb-5">
          {[
            { key: "portfolio"  as const, label: "Live Portfolio" },
            { key: "blueprints" as const, label: "Blueprints" },
            { key: "boards"     as const, label: "Mood Boards" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all"
              style={{
                background: activeTab === t.key ? BRAND_DARK : "transparent",
                color: activeTab === t.key ? "#fff" : "#94a3b8",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PORTFOLIO TAB ────────────────────────────────────────── */}
        {activeTab === "portfolio" && (
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              {filtered.length} Professional{filtered.length !== 1 ? "s" : ""} Found
            </p>
            {filtered.map(d => (
              <DesignerCard key={d.id} d={d} onOpen={setOpenDesigner} />
            ))}
          </div>
        )}

        {/* ── BLUEPRINTS TAB ───────────────────────────────────────── */}
        {activeTab === "blueprints" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Ready-Made House Maps
              </p>
              <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                PDF + CAD Files
              </span>
            </div>

            <div className="space-y-4">
              {BLUEPRINTS.map((bp, i) => (
                <motion.div key={bp.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-[24px] overflow-hidden"
                  style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img src={bp.img} alt={bp.title} className="w-full h-full object-cover" onError={onImgError} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 text-[7px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ background: bp.badgeColor }}>{bp.badge}</div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <p className="font-black text-white text-sm drop-shadow leading-tight">{bp.title}</p>
                      <p className="text-white/70 text-[8px] font-bold">by {bp.author}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex gap-2 mb-3">
                      {[
                        { label: "Pages",  val: bp.pages       },
                        { label: "Format", val: bp.format      },
                        { label: "Sold",   val: `${bp.sold}×`  },
                      ].map(s => (
                        <div key={s.label} className="flex-1 text-center bg-slate-50 py-1.5 rounded-[10px]">
                          <p className="text-[8px] font-black text-slate-700">{s.val}</p>
                          <p className="text-[6px] font-bold text-slate-400 uppercase">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display font-black italic text-xl" style={{ color: BRAND_DARK }}>{bp.price}</p>
                        <p className="text-[8px] text-slate-400">instant download</p>
                      </div>
                      <button
                        onClick={() => toast.success(`${bp.title} purchased! Check email for download.`)}
                        className="px-5 py-2.5 rounded-[16px] text-white text-[10px] font-black"
                        style={{ background: BRAND_DARK }}
                      >
                        Buy Plan
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── MOOD BOARDS TAB ──────────────────────────────────────── */}
        {activeTab === "boards" && (
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Curated Material Palettes
            </p>

            {/* Explainer card */}
            <div className="p-4 rounded-[22px] mb-4"
              style={{ background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)" }}>
              <p className="text-[8px] font-black text-violet-200 uppercase tracking-widest mb-1">How It Works</p>
              <p className="font-display font-black italic text-white text-sm leading-tight mb-2">
                Designer picks materials → you approve → Order All in one tap
              </p>
              <div className="flex gap-2 text-[8px] text-violet-200 font-bold">
                <span>🎨 Paint</span><span>+</span><span>🏷️ Tiles</span><span>+</span>
                <span>💡 Wiring</span><span>→</span><span className="text-white font-black">Cart</span>
              </div>
            </div>

            {/* Sample board */}
            <div className="bg-white rounded-[24px] overflow-hidden mb-4"
              style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              {/* Swatch strip */}
              <div className="flex h-12">
                {SAMPLE_MOODBOARD.items.map((item, i) => (
                  <div key={i} className="flex-1" style={{ background: item.color }} />
                ))}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-black text-slate-900 text-sm leading-tight">{SAMPLE_MOODBOARD.title}</p>
                    <p className="text-[9px] text-slate-400">by {SAMPLE_MOODBOARD.designer}</p>
                  </div>
                  <span className="text-[7px] font-black bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                    {SAMPLE_MOODBOARD.items.length} items
                  </span>
                </div>
                <p className="text-[9px] font-black text-slate-500 mb-3">Est. {SAMPLE_MOODBOARD.total}</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowMoodBoard(true)}
                    className="flex-1 py-2.5 rounded-[16px] text-white text-[10px] font-black"
                    style={{ background: "#7c3aed" }}>
                    <Eye className="w-3 h-3 inline mr-1" />View Palette
                  </button>
                  <button onClick={() => { toast.success("All 6 materials added to cart! 🛒"); }}
                    className="flex-1 py-2.5 rounded-[16px] border text-[10px] font-black"
                    style={{ borderColor: "#7c3aed40", color: "#7c3aed" }}>
                    <ShoppingBag className="w-3 h-3 inline mr-1" />Order All
                  </button>
                </div>
              </div>
            </div>

            {/* CTA for designers */}
            <div className="p-4 rounded-[22px] border-2 border-dashed border-slate-200 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <p className="font-black text-slate-800 text-sm mb-1">Are You a Designer?</p>
              <p className="text-[9px] text-slate-400 mb-3">Apply for a Verified Badge and start sharing shoppable palettes with your clients.</p>
              <button
                onClick={() => toast.success("Application form will open soon!")}
                className="px-6 py-2.5 rounded-[16px] text-white text-[10px] font-black"
                style={{ background: BRAND_DARK }}
              >
                Apply for Pro Badge
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Designer detail drawer */}
      <AnimatePresence>
        {openDesigner && <DesignerDetailDrawer d={openDesigner} onClose={() => setOpenDesigner(null)} />}
      </AnimatePresence>

      {/* Mood board modal */}
      <AnimatePresence>
        {showMoodBoard && <MoodBoardModal onClose={() => setShowMoodBoard(false)} />}
      </AnimatePresence>
    </Layout>
  );
}
