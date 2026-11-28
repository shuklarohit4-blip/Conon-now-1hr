import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Percent,
  Sparkles,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import {
  resolveMerchandisingAssetUrl,
  type BentoDealCard,
  type HeroBrandBanner,
  type HomeThemeMasthead,
  type LinkType,
  type OfferCarouselStrip,
  type PromoAnnouncementStrip,
} from "@/services/liveMerchandisingStore";

interface NavigateProps {
  onNavigate?: (linkType: LinkType, linkTarget: string) => void;
  updatedAt?: string;
  compactPreview?: boolean;
}

function formatRupee(amount?: number): string {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return "";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function SmartCardImage({
  src,
  alt,
  className,
  fallbackIcon,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-75">
        {fallbackIcon || <Tag className="w-6 h-6 text-slate-400" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className || "w-full h-full object-contain"}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   1. BLINKIT-STYLE THEMED CAMPAIGN MASTHEAD + ASYMMETRIC 5-CARD BENTO GRID
   ────────────────────────────────────────────────────────────────────────── */
export function MerchandisingMastheadAndBento({
  masthead,
  cards,
  updatedAt,
  onNavigate,
  compactPreview = false,
}: {
  masthead: HomeThemeMasthead;
  cards: BentoDealCard[];
} & NavigateProps) {
  const activeCards = useMemo(
    () =>
      [...cards]
        .filter((c) => c.isActive)
        .sort((a, b) => a.slotOrder - b.slotOrder),
    [cards]
  );

  if (!masthead.isEnabled && activeCards.length === 0) return null;

  const heroCard =
    activeCards.find((c) => c.slotType === "HERO_LEFT") || activeCards[0];
  const gridTiles = activeCards
    .filter((c) => c.id !== heroCard?.id)
    .slice(0, 4);

  const patternUrl = masthead.bgPatternImageUrl
    ? resolveMerchandisingAssetUrl(masthead.bgPatternImageUrl, updatedAt || masthead.updatedAt)
    : "";

  const containerStyle: React.CSSProperties = masthead.isEnabled
    ? {
        background: `linear-gradient(180deg, ${masthead.bgGradientStart || "#0B292E"} 0%, ${
          masthead.bgGradientEnd || "#124249"
        } 100%)`,
        color: masthead.textColor || "#FFFFFF",
      }
    : {
        background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)",
        color: "#0F172A",
      };

  return (
    <section
      aria-label="Campaign Deals Showcase"
      className="relative w-full overflow-hidden select-none"
      style={containerStyle}
    >
      {/* Subtle radial glow & optional pattern overlay */}
      {masthead.isEnabled && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[220px] rounded-full opacity-25 blur-3xl"
            style={{ background: masthead.accentColor || "#FACC15" }}
          />
          {patternUrl && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay"
              style={{ backgroundImage: `url("${patternUrl}")` }}
            />
          )}
        </>
      )}

      {/* Subtle decorative sparkles */}
      {masthead.isEnabled && masthead.showSparkles && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <Sparkles
            className="absolute top-3 left-[8%] w-3.5 h-3.5 opacity-60 animate-pulse"
            style={{ color: masthead.accentColor || "#FACC15" }}
          />
          <Sparkles
            className="hidden sm:block absolute top-5 right-[12%] w-4 h-4 opacity-50 animate-pulse"
            style={{ color: masthead.accentColor || "#FACC15" }}
          />
          <span
            className="absolute top-9 right-[26%] w-1.5 h-1.5 rounded-full opacity-55"
            style={{ backgroundColor: masthead.accentColor || "#FACC15" }}
          />
          <span
            className="absolute top-7 left-[24%] w-1 h-1 rounded-full opacity-45"
            style={{ backgroundColor: masthead.accentColor || "#FACC15" }}
          />
        </div>
      )}

      <div
        className={`relative z-10 mx-auto ${
          compactPreview
            ? "px-2.5 pt-2.5 pb-4"
            : "max-w-[1160px] px-3 sm:px-6 pt-3 sm:pt-5 pb-6 sm:pb-8"
        }`}
      >
        {/* Campaign Title & Subtitle */}
        {masthead.isEnabled && (masthead.campaignTitle || masthead.campaignSubtitle) && (
          <div className="text-center mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1 shadow-xs"
              style={{
                backgroundColor: masthead.pillBgColor || "rgba(255,255,255,0.14)",
                color: masthead.pillTextColor || "#FDE047",
              }}
            >
              <Zap className="w-3 h-3 shrink-0" />
              <span>Lucknow Flash Campaign</span>
            </div>
            <h2
              className={`${
                compactPreview ? "text-[18px]" : "text-[20px] sm:text-[26px] md:text-[30px]"
              } font-black tracking-tight leading-tight drop-shadow-xs`}
              style={{ color: masthead.textColor || "#FFFFFF" }}
            >
              {masthead.campaignTitle}
            </h2>
            {masthead.campaignSubtitle && (
              <p
                className={`${
                  compactPreview ? "text-[10.5px]" : "text-[11.5px] sm:text-[13px]"
                } font-semibold opacity-85 mt-0.5`}
                style={{ color: masthead.textColor || "#FFFFFF" }}
              >
                {masthead.campaignSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Asymmetric 5-Card Bento Grid (1 Left Tall Spotlight + 2x2 Right Tiles) */}
        {activeCards.length > 0 && (
          <div
            className={`grid grid-cols-12 ${
              compactPreview ? "gap-1.5" : "gap-2 sm:gap-3"
            } items-stretch`}
          >
            {/* Left Tall Hero Spotlight Card */}
            {heroCard && (
              <button
                type="button"
                onClick={() => onNavigate?.(heroCard.linkType, heroCard.linkTarget)}
                className={`${
                  gridTiles.length > 0 ? "col-span-5 md:col-span-4" : "col-span-12"
                } text-left rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-white/60 transition-all active:scale-[0.985] cursor-pointer flex flex-col justify-between group`}
                style={{
                  backgroundColor: heroCard.cardBgColor || "#FFFBEB",
                  minHeight: compactPreview ? "178px" : "220px",
                }}
              >
                <div className={compactPreview ? "p-2 pb-1" : "p-2.5 sm:p-4 pb-1"}>
                  {(heroCard.badgePrefix || heroCard.badgeHighlight) && (
                    <div className="inline-flex flex-wrap items-center gap-1 mb-1.5">
                      {heroCard.badgePrefix && (
                        <span className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-wide text-slate-700 bg-white/85 px-1.5 py-0.5 rounded-md border border-slate-200/70">
                          {heroCard.badgePrefix}
                        </span>
                      )}
                      {heroCard.badgeHighlight && (
                        <span
                          className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-wide text-white px-1.5 py-0.5 rounded-md shadow-2xs"
                          style={{ backgroundColor: heroCard.badgeColor || "#E11D48" }}
                        >
                          {heroCard.badgeHighlight}
                        </span>
                      )}
                    </div>
                  )}

                  <h3
                    className={`${
                      compactPreview
                        ? "text-[12px] leading-snug"
                        : "text-[13px] sm:text-[17px] md:text-[19px] leading-tight"
                    } font-black text-slate-900 line-clamp-2`}
                  >
                    {heroCard.title}
                  </h3>
                  {heroCard.subtitle && (
                    <p
                      className={`${
                        compactPreview ? "text-[9.5px]" : "text-[10px] sm:text-xs"
                      } font-semibold text-slate-600 mt-0.5 line-clamp-1`}
                    >
                      {heroCard.subtitle}
                    </p>
                  )}

                  {(heroCard.offerPrice || heroCard.originalPrice) && (
                    <div className="mt-1.5 sm:mt-2 flex flex-wrap items-baseline gap-1.5">
                      {heroCard.offerPrice && (
                        <span
                          className={`${
                            compactPreview ? "text-[12.5px] px-1.5 py-0.5" : "text-[14px] sm:text-[18px] px-2 py-0.5"
                          } font-black rounded-lg text-white shadow-xs`}
                          style={{ backgroundColor: heroCard.badgeColor || "#E11D48" }}
                        >
                          {formatRupee(heroCard.offerPrice)}
                        </span>
                      )}
                      {heroCard.originalPrice && (
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through">
                          {formatRupee(heroCard.originalPrice)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`w-full ${
                    compactPreview ? "h-20 px-2 pb-1.5" : "h-24 sm:h-36 md:h-40 px-2.5 pb-2.5"
                  } flex items-end justify-center`}
                >
                  <SmartCardImage
                    src={resolveMerchandisingAssetUrl(
                      heroCard.imageUrl,
                      updatedAt || heroCard.updatedAt
                    )}
                    alt={heroCard.title}
                    className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    fallbackIcon={<Zap className="w-8 h-8 text-amber-500" />}
                  />
                </div>
              </button>
            )}

            {/* Right 2x2 Grid Tiles */}
            {gridTiles.length > 0 && (
              <div
                className={`col-span-7 md:col-span-8 grid grid-cols-2 ${
                  compactPreview ? "gap-1.5" : "gap-2 sm:gap-3"
                }`}
              >
                {gridTiles.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => onNavigate?.(tile.linkType, tile.linkTarget)}
                    className="text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-white/60 transition-all active:scale-[0.985] cursor-pointer flex flex-col justify-between group"
                    style={{
                      backgroundColor: tile.cardBgColor || "#FFFFFF",
                      minHeight: compactPreview ? "86px" : "108px",
                    }}
                  >
                    <div
                      className={`${
                        compactPreview ? "p-1.5 pb-0.5" : "p-2 sm:p-3 pb-0.5"
                      } flex items-start justify-between gap-1`}
                    >
                      <div className="min-w-0 flex-1">
                        {(tile.badgePrefix || tile.badgeHighlight) && (
                          <div className="inline-flex flex-wrap items-center gap-0.5 mb-1">
                            {tile.badgePrefix && (
                              <span className="text-[7.5px] sm:text-[9px] font-extrabold uppercase text-slate-600 bg-white/80 px-1 py-0.5 rounded">
                                {tile.badgePrefix}
                              </span>
                            )}
                            {tile.badgeHighlight && (
                              <span
                                className="text-[7.5px] sm:text-[9.5px] font-black uppercase text-white px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: tile.badgeColor || "#0F766E" }}
                              >
                                {tile.badgeHighlight}
                              </span>
                            )}
                          </div>
                        )}
                        <h3
                          className={`${
                            compactPreview
                              ? "text-[10.5px] leading-tight"
                              : "text-[11.5px] sm:text-[14px] leading-tight"
                          } font-black text-slate-900 line-clamp-2`}
                        >
                          {tile.title}
                        </h3>
                        {tile.offerPrice ? (
                          <div className="mt-0.5 flex items-baseline gap-1">
                            <span className="text-[10.5px] sm:text-[13px] font-black text-slate-900">
                              {formatRupee(tile.offerPrice)}
                            </span>
                            {tile.originalPrice && (
                              <span className="text-[8.5px] sm:text-[10.5px] font-semibold text-slate-400 line-through">
                                {formatRupee(tile.originalPrice)}
                              </span>
                            )}
                          </div>
                        ) : tile.subtitle ? (
                          <p className="text-[9px] sm:text-[11px] font-semibold text-slate-600 mt-0.5 line-clamp-1">
                            {tile.subtitle}
                          </p>
                        ) : null}
                      </div>

                      <div
                        className={`${
                          compactPreview
                            ? "w-11 h-12"
                            : "w-12 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24"
                        } shrink-0 flex items-center justify-center`}
                      >
                        <SmartCardImage
                          src={resolveMerchandisingAssetUrl(
                            tile.imageUrl,
                            updatedAt || tile.updatedAt
                          )}
                          alt={tile.title}
                          className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                          fallbackIcon={<Tag className="w-5 h-5 text-slate-400" />}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Edge Transition into White Storefront */}
      {masthead.isEnabled && masthead.bottomEdgeStyle === "dotted-pattern" && (
        <div
          aria-hidden="true"
          className="w-full h-3.5 sm:h-4"
          style={{
            backgroundImage:
              "radial-gradient(circle at 8px 12px, #F8FAFC 8px, transparent 8.5px)",
            backgroundSize: "16px 16px",
            backgroundRepeat: "repeat-x",
          }}
        />
      )}
      {masthead.isEnabled && masthead.bottomEdgeStyle === "curved" && (
        <div aria-hidden="true" className="w-full h-4 sm:h-5 bg-[#F8FAFC] rounded-t-[24px]" />
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   2. BLINKIT-STYLE HORIZONTAL OFFER DEAL PILL CAROUSEL
   ────────────────────────────────────────────────────────────────────────── */
export function MerchandisingOfferCarousel({
  strips,
  updatedAt,
  onNavigate,
  compactPreview = false,
}: {
  strips: OfferCarouselStrip[];
} & NavigateProps) {
  const active = useMemo(
    () => [...strips].filter((s) => s.isActive).sort((a, b) => a.order - b.order),
    [strips]
  );

  if (active.length === 0) return null;

  const renderIcon = (strip: OfferCarouselStrip) => {
    const imgUrl = resolveMerchandisingAssetUrl(
      strip.iconImageUrl,
      updatedAt || strip.updatedAt
    );
    if (strip.iconType === "custom" && imgUrl) {
      return (
        <img
          src={imgUrl}
          alt=""
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover shrink-0"
        />
      );
    }
    const cls = "w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0";
    if (strip.iconType === "truck") return <Truck className={cls} />;
    if (strip.iconType === "bolt") return <Zap className={cls} />;
    if (strip.iconType === "tag") return <Tag className={cls} />;
    return <Percent className={cls} />;
  };

  return (
    <section
      aria-label="Quick Promotional Offers"
      className={
        compactPreview
          ? "w-full px-2.5 py-2"
          : "w-full max-w-[1160px] mx-auto px-3 sm:px-6 pt-3 pb-1"
      }
    >
      <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
        {active.map((strip) => (
          <button
            key={strip.id}
            type="button"
            onClick={() => onNavigate?.(strip.linkType, strip.linkTarget)}
            className={`${
              compactPreview ? "min-w-[210px] px-2.5 py-2" : "min-w-[240px] sm:min-w-[285px] px-3 sm:px-4 py-2.5"
            } snap-start rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.985] cursor-pointer text-left border border-black/5 shrink-0`}
            style={{
              backgroundColor: strip.bgColor || "#0F172A",
              color: strip.textColor || "#FFFFFF",
            }}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              {renderIcon(strip)}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={`${
                  compactPreview ? "text-[11.5px]" : "text-[12.5px] sm:text-[13.5px]"
                } font-black leading-tight truncate`}
              >
                {strip.title}
              </div>
              <div
                className={`${
                  compactPreview ? "text-[9.5px]" : "text-[10.5px] sm:text-[11.5px]"
                } font-medium opacity-85 truncate mt-0.5`}
              >
                {strip.subtitle}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-75 shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   3. FLIPKART MINUTES-STYLE SPONSORED BRAND HERO & MID-PAGE BANNER CAROUSEL
   ────────────────────────────────────────────────────────────────────────── */
export function MerchandisingHeroBannerCarousel({
  banners,
  updatedAt,
  onNavigate,
  compactPreview = false,
  ariaLabel = "Featured Campaign Banners",
}: {
  banners: HeroBrandBanner[];
  ariaLabel?: string;
} & NavigateProps) {
  const active = useMemo(
    () => [...banners].filter((b) => b.isActive).sort((a, b) => a.order - b.order),
    [banners]
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    setActiveIdx(0);
  }, [active.length]);

  useEffect(() => {
    if (active.length <= 1) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) {
        setActiveIdx((prev) => (prev + 1) % active.length);
      }
    }, 4500);
    return () => window.clearInterval(id);
  }, [active.length]);

  if (active.length === 0) return null;

  const current = active[activeIdx % active.length];
  const imgUrl = resolveMerchandisingAssetUrl(
    current.bannerImageUrl,
    updatedAt || current.updatedAt
  );
  const logoUrl = resolveMerchandisingAssetUrl(
    current.brandLogoUrl,
    updatedAt || current.updatedAt
  );

  return (
    <section
      aria-label={ariaLabel}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      className={
        compactPreview
          ? "w-full px-2.5 py-2"
          : "w-full max-w-[1160px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5"
      }
    >
      <div
        className={`relative w-full overflow-hidden shadow-md border border-slate-200/70 ${
          compactPreview
            ? "rounded-2xl min-h-[145px]"
            : "rounded-2xl sm:rounded-[22px] min-h-[160px] sm:aspect-[16/6.2]"
        } bg-slate-900 group`}
      >
        {/* Background Photo */}
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={current.headline}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#12325B] to-slate-950" />
        )}

        {/* Scrim Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              current.overlayGradient ||
              "linear-gradient(90deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.45) 58%, rgba(15,23,42,0.12) 100%)",
          }}
        />

        {/* Foreground Content */}
        <button
          type="button"
          onClick={() => onNavigate?.(current.linkType, current.linkTarget)}
          className={`relative z-10 w-full h-full text-left flex flex-col justify-between cursor-pointer ${
            compactPreview ? "p-3.5" : "p-4 sm:p-7 md:p-9"
          }`}
        >
          <div className="max-w-[82%] sm:max-w-[62%]">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Partner brand"
                className="h-5 sm:h-7 w-auto object-contain mb-2 bg-white/95 rounded-md px-2 py-0.5 shadow-xs"
              />
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-amber-300 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider mb-1.5 sm:mb-2 border border-white/15">
                <Sparkles className="w-2.5 h-2.5" />
                Verified Partner Offer
              </span>
            )}

            <h3
              className={`${
                compactPreview
                  ? "text-[16px] leading-snug"
                  : "text-[18px] sm:text-[26px] md:text-[32px] leading-[1.12]"
              } font-black text-white tracking-tight drop-shadow-xs`}
            >
              {current.headline}
            </h3>
            {current.subheadline && (
              <p
                className={`${
                  compactPreview ? "text-[10.5px]" : "text-[11.5px] sm:text-[14px] md:text-[15px]"
                } text-slate-200 font-medium mt-1 sm:mt-1.5 line-clamp-2`}
              >
                {current.subheadline}
              </p>
            )}
          </div>

          <div className="mt-3 sm:mt-4 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full font-black shadow-md transition-transform group-hover:translate-x-0.5 ${
                compactPreview
                  ? "px-3 py-1 text-[10.5px]"
                  : "px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-[13px]"
              }`}
              style={{
                backgroundColor: current.ctaBgColor || "#FACC15",
                color: current.ctaTextColor || "#0F172A",
              }}
            >
              <span>{current.ctaText || "Order Now"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* Prev/Next Controls on Desktop */}
        {active.length > 1 && !compactPreview && (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev - 1 + active.length) % active.length);
              }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev + 1) % active.length);
              }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {active.length > 1 && (
          <div className="absolute bottom-2.5 right-3 sm:right-5 z-20 flex items-center gap-1.5">
            {active.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Show banner ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(i);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === activeIdx % active.length
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/45 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   4. FLIPKART MINUTES-STYLE THIN PROMO & PAYMENT PARTNER STRIPS
   ────────────────────────────────────────────────────────────────────────── */
export function MerchandisingPromoStrips({
  strips,
  updatedAt,
  onNavigate,
  compactPreview = false,
}: {
  strips: PromoAnnouncementStrip[];
} & NavigateProps) {
  const active = useMemo(
    () => [...strips].filter((s) => s.isActive).sort((a, b) => a.order - b.order),
    [strips]
  );

  if (active.length === 0) return null;

  return (
    <section
      aria-label="Offer & Payment Strips"
      className={
        compactPreview
          ? "w-full px-2.5 py-1.5 space-y-1.5"
          : "w-full max-w-[1160px] mx-auto px-3 sm:px-6 py-1.5 sm:py-2 space-y-2"
      }
    >
      {active.map((strip) => {
        const partnerLogo = resolveMerchandisingAssetUrl(
          strip.partnerLogoUrl,
          updatedAt || strip.updatedAt
        );
        const isPartner = strip.stripType === "PAYMENT_PARTNER";

        return (
          <button
            key={strip.id}
            type="button"
            onClick={() => onNavigate?.(strip.linkType, strip.linkTarget)}
            className={`w-full text-left rounded-xl flex items-center justify-between gap-2.5 sm:gap-3 transition-all hover:shadow-sm active:scale-[0.995] cursor-pointer ${
              compactPreview ? "px-2.5 py-2" : "px-3 sm:px-4 py-2.5"
            }`}
            style={{
              backgroundColor: strip.bgColor || "#ECFDF5",
              color: strip.textColor || "#064E3B",
              border: `1.5px solid ${strip.borderColor || "#10B981"}`,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {partnerLogo ? (
                <img
                  src={partnerLogo}
                  alt={strip.badgeLabel}
                  className="h-5 sm:h-6 w-auto object-contain shrink-0 rounded"
                />
              ) : (
                <span
                  className={`${
                    compactPreview ? "text-[9.5px] px-2 py-0.5" : "text-[10.5px] sm:text-xs px-2.5 py-1"
                  } font-black uppercase tracking-wide rounded-lg shrink-0 shadow-2xs`}
                  style={{
                    backgroundColor: isPartner ? "#FFFFFF" : strip.borderColor || "#10B981",
                    color: isPartner ? strip.textColor || "#0F172A" : "#FFFFFF",
                    border: isPartner ? `1px solid ${strip.borderColor || "#CBD5E1"}` : "none",
                  }}
                >
                  {strip.badgeLabel}
                </span>
              )}

              <div
                aria-hidden="true"
                className="w-px h-4 sm:h-5 opacity-30 shrink-0"
                style={{ backgroundColor: strip.textColor || "#064E3B" }}
              />

              <p
                className={`${
                  compactPreview ? "text-[10.5px]" : "text-[11.5px] sm:text-[13px]"
                } truncate`}
              >
                <span className="font-black mr-1">{strip.boldText}</span>
                <span className="font-medium opacity-85">{strip.regularText}</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {strip.termsText && (
                <span className="hidden sm:inline text-[10px] font-bold opacity-70">
                  {strip.termsText}
                </span>
              )}
              <ArrowRight className="w-3.5 h-3.5 opacity-75 shrink-0" />
            </div>
          </button>
        );
      })}
    </section>
  );
}
