export type CampaignThemeKey = 'winter-sale' | 'monsoon-shield' | 'festive-build';

export interface SpotlightDeal {
  id: string;
  title: string;
  mrp: number;
  price: number;
  category: string;
  badge: string;
  image: string;
  unit: string;
}

export interface BentoCard {
  id: string;
  category: string;
  categorySlug: string;
  discountText: string;
  discountPrefix: string;
  titleLine1: string;
  titleLine2: string;
  images: string[];
}

export interface PromoStripConfig {
  badge: string;
  highlightText: string;
  normalText: string;
  subText: string;
  image: string;
  couponCode: string;
  categorySlug: string;
}

export interface CategoryStripItem {
  id: string;
  label: string;
  slug: string;
  isNew?: boolean;
  iconName: 'all' | 'sale' | 'cement' | 'steel' | 'paints' | 'plywood' | 'hardware' | 'electrical' | 'plumbing' | 'tiling';
}

export interface HeroCampaignConfig {
  themeKey: CampaignThemeKey;
  headline: string;
  accent: 'mittens' | 'sparkle' | 'umbrella' | 'festive-lamp';
  colors: {
    gradientTop: string;
    gradientMid: string;
    gradientHero: string;
    gradientDeep: string;
    hillFill: string;
    stitchedDash: string;
    cardBgFrom: string;
    cardBgTo: string;
    cardBorder: string;
    promoBgFrom: string;
    promoBgTo: string;
    accentGold: string;
  };
  searchPlaceholders: string[];
  categoryStrip: CategoryStripItem[];
  spotlightDeals: SpotlightDeal[];
  bentoCards: BentoCard[];
  promoStrip: PromoStripConfig;
}

export const CAMPAIGN_PRESETS: Record<CampaignThemeKey, HeroCampaignConfig> = {
  'winter-sale': {
    themeKey: 'winter-sale',
    headline: 'winter build sale',
    accent: 'mittens',
    colors: {
      gradientTop: '#4D9BE0',
      gradientMid: '#1B73CA',
      gradientHero: '#094596',
      gradientDeep: '#073A82',
      hillFill: '#073E8C',
      stitchedDash: 'rgba(255, 255, 255, 0.45)',
      cardBgFrom: 'rgba(106, 169, 224, 0.55)',
      cardBgTo: 'rgba(61, 126, 192, 0.45)',
      cardBorder: 'rgba(255, 255, 255, 0.20)',
      promoBgFrom: '#EBF5FC',
      promoBgTo: '#E3F1FB',
      accentGold: '#FACC15',
    },
    searchPlaceholders: [
      'Search "UltraTech Cement"',
      'Search "Asian Paints Royale"',
      'Search "TMT Steel 12mm"',
      'Search "Century Plywood 18mm"',
      'Search "Fevicol SH Drum"',
      'Search "Dr. Fixit URP 5kg"',
      'Search "Bosch Drill Machine"',
      'Search "Finolex 2.5 Sq mm Wire"',
    ],
    categoryStrip: [
      { id: 'all',        label: 'All',        slug: '',            iconName: 'all' },
      { id: 'sale',       label: 'Sale',       slug: 'sale',        iconName: 'sale', isNew: true },
      { id: 'cement',     label: 'Cement',     slug: 'cement',      iconName: 'cement' },
      { id: 'steel',      label: 'Steel',      slug: 'steel',       iconName: 'steel' },
      { id: 'paints',     label: 'Paints',     slug: 'paint',       iconName: 'paints' },
      { id: 'plywood',    label: 'Plywood',    slug: 'wood',        iconName: 'plywood' },
      { id: 'hardware',   label: 'Hardware',   slug: 'hardware',    iconName: 'hardware' },
      { id: 'electrical', label: 'Electrical', slug: 'electrical',  iconName: 'electrical' },
      { id: 'plumbing',   label: 'Plumbing',   slug: 'plumbing',    iconName: 'plumbing' },
      { id: 'tiling',     label: 'Tiling',     slug: 'tiles',       iconName: 'tiling' },
    ],
    spotlightDeals: [
      {
        id: 'deal-1',
        title: 'Royale Luxury 20L',
        mrp: 9435,
        price: 8499,
        category: 'paint',
        badge: 'Site Deals',
        image: '/images/hero/asianpaints-bucket.webp',
        unit: '20L Bucket',
      },
      {
        id: 'deal-2',
        title: 'Dr. Fixit URP 5kg',
        mrp: 2150,
        price: 1599,
        category: 'waterproofing',
        badge: 'Site Deals',
        image: '/images/hero/drfixit-bucket.webp',
        unit: '5kg Can',
      },
      {
        id: 'deal-3',
        title: 'Fevicol SH Drum',
        mrp: 10800,
        price: 9250,
        category: 'plywood',
        badge: 'Site Deals',
        image: '/images/hero/fevicol-drum.webp',
        unit: '50kg Drum',
      },
      {
        id: 'deal-4',
        title: 'Bosch Hammer Drill',
        mrp: 3999,
        price: 2749,
        category: 'hardware',
        badge: 'Site Deals',
        image: '/images/hero/bosch-drill.webp',
        unit: '500W GSB Tool',
      },
      {
        id: 'deal-5',
        title: 'UltraTech PPC 50kg',
        mrp: 430,
        price: 385,
        category: 'cement',
        badge: 'Site Deals',
        image: '/images/hero/acc-cement.webp',
        unit: '50kg Bag',
      },
    ],
    bentoCards: [
      {
        id: 'bento-paints',
        category: 'Paints & Putty',
        categorySlug: 'paint',
        discountPrefix: 'Up to',
        discountText: '40% OFF',
        titleLine1: 'Paints &',
        titleLine2: 'Putty',
        images: [
          '/images/hero/asianpaints-bucket.webp',
          '/images/hero/birlawhite-putty.webp',
          '/images/hero/drfixit-bucket.webp',
        ],
      },
      {
        id: 'bento-cement',
        category: 'Cement & Sand',
        categorySlug: 'cement',
        discountPrefix: 'Up to',
        discountText: '30% OFF',
        titleLine1: 'Cement &',
        titleLine2: 'Sand',
        images: [
          '/images/hero/acc-cement.webp',
          '/images/hero/birla-cement.webp',
        ],
      },
      {
        id: 'bento-plywood',
        category: 'Plywood & MDF',
        categorySlug: 'wood',
        discountPrefix: 'Up to',
        discountText: '35% OFF',
        titleLine1: 'Plywood',
        titleLine2: '& MDF',
        images: [
          '/images/hero/centuryply-ply.webp',
          '/images/hero/actiontesa-mdf.webp',
          '/images/hero/fevicol-drum.webp',
        ],
      },
      {
        id: 'bento-hardware',
        category: 'Hardware & Tools',
        categorySlug: 'hardware',
        discountPrefix: 'Up to',
        discountText: '50% OFF',
        titleLine1: 'Hardware',
        titleLine2: '& Tools',
        images: [
          '/images/hero/bosch-drill.webp',
          '/images/hero/godrej-lock.webp',
          '/images/hero/hettich-hinge.webp',
        ],
      },
    ],
    promoStrip: {
      badge: 'PROMO',
      highlightText: 'Flat ₹500 OFF',
      normalText: 'on bulk site orders',
      subText: 'Use code BUILD500 • Delivered in 60 mins',
      image: '/images/hero/fevicol-drum.webp',
      couponCode: 'BUILD500',
      categorySlug: 'cement',
    },
  },

  'monsoon-shield': {
    themeKey: 'monsoon-shield',
    headline: 'monsoon build shield',
    accent: 'umbrella',
    colors: {
      gradientTop: '#2C6EA7',
      gradientMid: '#1C548C',
      gradientHero: '#0E3A6B',
      gradientDeep: '#082548',
      hillFill: '#0A2E55',
      stitchedDash: 'rgba(255, 255, 255, 0.40)',
      cardBgFrom: 'rgba(64, 134, 196, 0.55)',
      cardBgTo: 'rgba(38, 97, 150, 0.45)',
      cardBorder: 'rgba(255, 255, 255, 0.20)',
      promoBgFrom: '#E7F2FA',
      promoBgTo: '#D8EBF7',
      accentGold: '#FBBF24',
    },
    searchPlaceholders: [
      'Search "Dr. Fixit URP"',
      'Search "Waterproof Putty"',
      'Search "Tarpaulin Sheets"',
      'Search "Anti-Damp Paint"',
    ],
    categoryStrip: [
      { id: 'all',        label: 'All',           slug: '',            iconName: 'all' },
      { id: 'sale',       label: 'Monsoon Sale',  slug: 'sale',        iconName: 'sale', isNew: true },
      { id: 'waterproof', label: 'Waterproofing', slug: 'waterproofing', iconName: 'paints' },
      { id: 'cement',     label: 'Cement',        slug: 'cement',      iconName: 'cement' },
      { id: 'plywood',    label: 'Marine Ply',    slug: 'wood',        iconName: 'plywood' },
      { id: 'plumbing',   label: 'Plumbing',      slug: 'plumbing',    iconName: 'plumbing' },
    ],
    spotlightDeals: [
      {
        id: 'deal-1',
        title: 'Dr Fixit URP 5kg',
        mrp: 2150,
        price: 1549,
        category: 'waterproofing',
        badge: 'Rain Shield',
        image: '/images/hero/drfixit-bucket.webp',
        unit: '5kg Can',
      },
    ],
    bentoCards: [
      {
        id: 'bento-waterproofing',
        category: 'Waterproofing',
        categorySlug: 'waterproofing',
        discountPrefix: 'Up to',
        discountText: '45% OFF',
        titleLine1: 'Waterproofing',
        titleLine2: 'Shield',
        images: ['/images/hero/drfixit-bucket.webp'],
      },
    ],
    promoStrip: {
      badge: 'WATERPROOF',
      highlightText: 'Flat ₹300 OFF',
      normalText: 'on Dr. Fixit & Roff orders',
      subText: 'Rain-proof your slab today',
      image: '/images/hero/drfixit-bucket.webp',
      couponCode: 'RAINSHIELD',
      categorySlug: 'waterproofing',
    },
  },

  'festive-build': {
    themeKey: 'festive-build',
    headline: 'festive mega build',
    accent: 'festive-lamp',
    colors: {
      gradientTop: '#9A3412',
      gradientMid: '#7C2D12',
      gradientHero: '#431407',
      gradientDeep: '#290E04',
      hillFill: '#451A03',
      stitchedDash: 'rgba(254, 240, 138, 0.50)',
      cardBgFrom: 'rgba(180, 83, 9, 0.55)',
      cardBgTo: 'rgba(120, 53, 15, 0.45)',
      cardBorder: 'rgba(254, 240, 138, 0.25)',
      promoBgFrom: '#FEF3C7',
      promoBgTo: '#FDE68A',
      accentGold: '#FDE047',
    },
    searchPlaceholders: [
      'Search "Asian Paints Royale"',
      'Search "Decorative Lighting"',
      'Search "Kajaria Living Tiles"',
      'Search "Modular Kitchen Fittings"',
    ],
    categoryStrip: [
      { id: 'all',        label: 'All',        slug: '',            iconName: 'all' },
      { id: 'sale',       label: 'Festive Deals', slug: 'sale',     iconName: 'sale', isNew: true },
      { id: 'paints',     label: 'Paints',     slug: 'paint',       iconName: 'paints' },
      { id: 'tiling',     label: 'Tiles',      slug: 'tiles',       iconName: 'tiling' },
      { id: 'hardware',   label: 'Hardware',   slug: 'hardware',    iconName: 'hardware' },
    ],
    spotlightDeals: [
      {
        id: 'deal-1',
        title: 'Royale Luxury 20L',
        mrp: 9435,
        price: 8299,
        category: 'paint',
        badge: 'Diwali Special',
        image: '/images/hero/asianpaints-bucket.webp',
        unit: '20L Bucket',
      },
    ],
    bentoCards: [
      {
        id: 'bento-paints',
        category: 'Luxury Paints',
        categorySlug: 'paint',
        discountPrefix: 'Up to',
        discountText: '50% OFF',
        titleLine1: 'Luxury',
        titleLine2: 'Paints',
        images: ['/images/hero/asianpaints-bucket.webp', '/images/hero/birlawhite-putty.webp'],
      },
    ],
    promoStrip: {
      badge: 'FESTIVE',
      highlightText: 'Flat ₹1,000 OFF',
      normalText: 'on festive painting kits',
      subText: 'Sparkle this season with Conon',
      image: '/images/hero/asianpaints-bucket.webp',
      couponCode: 'DIWALI1000',
      categorySlug: 'paint',
    },
  },
};

/**
 * ACTIVE CAMPAIGN SELECTOR
 * To change the campaign theme, change this variable to 'winter-sale' | 'monsoon-shield' | 'festive-build'
 * Takes less than 10 seconds without touching any JSX code!
 */
export const ACTIVE_CAMPAIGN_KEY: CampaignThemeKey = 'winter-sale';

export function getActiveCampaign(): HeroCampaignConfig {
  return CAMPAIGN_PRESETS[ACTIVE_CAMPAIGN_KEY];
}
