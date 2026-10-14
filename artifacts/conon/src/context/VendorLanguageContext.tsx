import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Vendor Panel localization (English / Hindi).

   A lightweight, dependency-free localization context. Switching the language
   updates a single piece of state, so every consumer re-renders instantly with
   no page reload. Hindi uses practical, daily business Hinglish written in both
   Roman and Devanagari script — the way shopkeepers actually speak.
   ────────────────────────────────────────────────────────────────────────── */

export type Lang = "en" | "hi";

export type TKey =
  | "myStore"
  | "live"
  | "offline"
  | "todaysOrders"
  | "todaysRevenue"
  | "newOrders"
  | "acceptOrder"
  | "statusNew"
  | "packing"
  | "readyForPickup"
  | "khataPayments"
  | "requestPayout"
  | "balanceDue"
  | "inventory"
  | "inStock"
  | "outOfStock"
  | "updatePrice"
  | "saveNewPrice"
  | "current"
  | "addNewProduct"
  | "storeClosed"
  | "storeLive"
  | "orderAccepted"
  | "enterValidPrice"
  | "addProductSoon"
  | "payoutRequested"
  | "newOrderToast"
  | "dashboard"
  | "liveOrders"
  | "markReady"
  | "awaitingPickup"
  | "noOrders"
  | "payoutHistory"
  | "pendingApproval"
  | "approved"
  | "credited"
  | "enterAmount"
  | "withdraw"
  | "amountExceeds"
  | "enterValidAmount"
  | "totalEarned"
  | "pendingPayouts"
  | "itemsInStock"
  | "recentOrders"
  | "viewAll"
  | "quickActions"
  | "orderReady"
  | "sale"
  | "payout"
  | "withdrawFunds"
  | "noPayouts"
  | "goToInventory"
  | "goToOrders"
  | "manageStock"
  | "outOfStockCount"
  | "products"
  | "addProduct"
  | "productName"
  | "sellingPrice"
  | "unitLabel"
  | "categoryLabel"
  | "imageUrlOptional"
  | "saveProduct"
  | "productAdded"
  | "addProductDesc"
  | "noProducts"
  | "goToProducts"
  | "loadingStore"
  | "loadError"
  | "retry"
  | "testNewOrder"
  | "simulatingOrder"
  | "aiMunshi"
  | "munshiListening"
  | "munshiTapToSpeak"
  | "munshiNothingToClose"
  | "smartInsights"
  | "linkedAccount"
  | "confirmWithdraw";

const DICT: Record<Lang, Record<TKey, string>> = {
  en: {
    myStore: "My Store",
    live: "Live",
    offline: "Offline",
    todaysOrders: "Today's Orders",
    todaysRevenue: "Today's Revenue",
    newOrders: "New Orders",
    acceptOrder: "Accept Order",
    statusNew: "New",
    packing: "Packing",
    readyForPickup: "Ready for Pickup",
    khataPayments: "Khata / Payments",
    requestPayout: "Request Payout",
    balanceDue: "Available Balance",
    inventory: "Inventory",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    updatePrice: "Update Price",
    saveNewPrice: "Save New Price",
    current: "Current",
    addNewProduct: "Add New Product",
    storeClosed: "Store closed",
    storeLive: "Store is now live!",
    orderAccepted: "Order accepted!",
    enterValidPrice: "Enter a valid price",
    addProductSoon: "Add product — coming in next release!",
    payoutRequested: "Payout requested",
    newOrderToast: "New Order!",
    dashboard: "Dashboard",
    liveOrders: "Live Orders",
    markReady: "Mark Ready",
    awaitingPickup: "Awaiting Pickup",
    noOrders: "No orders here yet",
    payoutHistory: "Payout History",
    pendingApproval: "Pending Admin Approval",
    approved: "Approved",
    credited: "Credited",
    enterAmount: "Enter amount to withdraw",
    withdraw: "Withdraw",
    amountExceeds: "Amount exceeds available balance",
    enterValidAmount: "Enter a valid amount",
    totalEarned: "Total Earned",
    pendingPayouts: "Pending Payouts",
    itemsInStock: "Items in Stock",
    recentOrders: "Recent Orders",
    viewAll: "View All",
    quickActions: "Quick Actions",
    orderReady: "Order is ready for pickup!",
    sale: "Sale",
    payout: "Payout",
    withdrawFunds: "Withdraw Funds",
    noPayouts: "No payouts yet",
    goToInventory: "Manage Inventory",
    goToOrders: "View Orders",
    manageStock: "Tap to toggle stock or update price",
    outOfStockCount: "Out of Stock",
    products: "Products",
    addProduct: "Add Product",
    productName: "Product Name",
    sellingPrice: "Selling Price",
    unitLabel: "Unit (bag, kg, piece…)",
    categoryLabel: "Category",
    imageUrlOptional: "Image URL (optional)",
    saveProduct: "Add to Store",
    productAdded: "Product added to your store!",
    addProductDesc: "List a new item buyers can order",
    noProducts: "No products yet — add your first one",
    goToProducts: "Add Product",
    loadingStore: "Loading your store…",
    loadError: "Couldn't load your store",
    retry: "Try Again",
    testNewOrder: "Test New Order",
    simulatingOrder: "Sending a test order…",
    aiMunshi: "AI Munshi",
    munshiListening: "Listening…",
    munshiTapToSpeak: "Tap & speak to update stock",
    munshiNothingToClose: "Everything is already out of stock",
    smartInsights: "Smart Insights",
    linkedAccount: "Linked Bank Account",
    confirmWithdraw: "Confirm & Withdraw",
  },
  hi: {
    myStore: "Meri Dukaan (मेरी दुकान)",
    live: "Live (लाइव)",
    offline: "Band (बंद)",
    todaysOrders: "Aaj Ke Orders (आज के ऑर्डर्स)",
    todaysRevenue: "Aaj Ki Kamai (आज की कमाई)",
    newOrders: "Naye Orders (नये ऑर्डर्स)",
    acceptOrder: "Order Manzoor Karein (ऑर्डर मंजूर करें)",
    statusNew: "Naya (नया)",
    packing: "Pack Ho Raha Hai (पैक हो रहा है)",
    readyForPickup: "Pickup Ke Liye Taiyar (पिकअप के लिए तैयार)",
    khataPayments: "Khata (खाता)",
    requestPayout: "Paisa Nikalein (पैसा निकालें)",
    balanceDue: "Jama Paisa (जमा पैसा)",
    inventory: "Stock / Saman (स्टॉक)",
    inStock: "Stock Mein Hai (स्टॉक में है)",
    outOfStock: "Stock Khatam (स्टॉक खत्म)",
    updatePrice: "Bhaav Badlein (भाव बदलें)",
    saveNewPrice: "Naya Bhaav Save Karein (नया भाव सेव करें)",
    current: "Abhi (अभी)",
    addNewProduct: "Naya Product Jodein (नया प्रोडक्ट जोड़ें)",
    storeClosed: "Dukaan band kar di (दुकान बंद कर दी)",
    storeLive: "Dukaan ab live hai! (दुकान अब लाइव है!)",
    orderAccepted: "Order manzoor ho gaya! (ऑर्डर मंजूर हो गया!)",
    enterValidPrice: "Sahi bhaav daalein (सही भाव डालें)",
    addProductSoon: "Naya product — agle update mein aayega! (अगले अपडेट में)",
    payoutRequested: "Paisa nikalne ki request bhej di (रिक्वेस्ट भेज दी)",
    newOrderToast: "Naya Order! (नया ऑर्डर!)",
    dashboard: "Dashboard (डैशबोर्ड)",
    liveOrders: "Live Orders (ऑर्डर्स)",
    markReady: "Taiyar Karein (तैयार करें)",
    awaitingPickup: "Pickup Ka Intezaar (पिकअप का इंतज़ार)",
    noOrders: "Abhi koi order nahi (अभी कोई ऑर्डर नहीं)",
    payoutHistory: "Paise Ka Hisaab (पैसे का हिसाब)",
    pendingApproval: "Admin Manzoori Baaki (एडमिन मंज़ूरी बाकी)",
    approved: "Manzoor (मंज़ूर)",
    credited: "Jama Ho Gaya (जमा हो गया)",
    enterAmount: "Kitna paisa nikalna hai (कितना पैसा निकालना है)",
    withdraw: "Nikalein (निकालें)",
    amountExceeds: "Itna paisa jama nahi hai (इतना पैसा जमा नहीं है)",
    enterValidAmount: "Sahi rakam daalein (सही रकम डालें)",
    totalEarned: "Total Kamai (कुल कमाई)",
    pendingPayouts: "Baaki Payout (बाकी पेआउट)",
    itemsInStock: "Stock Mein Saman (स्टॉक में सामान)",
    recentOrders: "Naye Orders (नये ऑर्डर्स)",
    viewAll: "Sab Dekhein (सब देखें)",
    quickActions: "Turant Kaam (तुरंत काम)",
    orderReady: "Order pickup ke liye taiyar! (पिकअप के लिए तैयार!)",
    sale: "Bikri (बिक्री)",
    payout: "Payout (पेआउट)",
    withdrawFunds: "Paisa Nikalein (पैसा निकालें)",
    noPayouts: "Abhi koi payout nahi (अभी कोई पेआउट नहीं)",
    goToInventory: "Stock Sambhalein (स्टॉक संभालें)",
    goToOrders: "Orders Dekhein (ऑर्डर्स देखें)",
    manageStock: "Stock badlein ya bhaav update karein (स्टॉक बदलें या भाव अपडेट करें)",
    outOfStockCount: "Stock Khatam (स्टॉक खत्म)",
    products: "Saman (सामान)",
    addProduct: "Naya Saman (नया सामान)",
    productName: "Saman Ka Naam (सामान का नाम)",
    sellingPrice: "Bhaav (भाव)",
    unitLabel: "Unit (bag, kg, piece…) (यूनिट)",
    categoryLabel: "Category (श्रेणी)",
    imageUrlOptional: "Photo URL (optional) (फोटो)",
    saveProduct: "Dukaan Mein Jodein (दुकान में जोड़ें)",
    productAdded: "Saman dukaan mein jud gaya! (सामान जुड़ गया!)",
    addProductDesc: "Naya saman jo grahak order kar sakein (नया सामान जोड़ें)",
    noProducts: "Abhi koi saman nahi — pehla jodein (अभी कोई सामान नहीं)",
    goToProducts: "Saman Jodein (सामान जोड़ें)",
    loadingStore: "Dukaan load ho rahi hai… (दुकान लोड हो रही है)",
    loadError: "Dukaan load nahi hui (दुकान लोड नहीं हुई)",
    retry: "Dobara Koshish (दोबारा कोशिश)",
    testNewOrder: "Test Order Bhejein (टेस्ट ऑर्डर भेजें)",
    simulatingOrder: "Test order bhej rahe hain… (टेस्ट ऑर्डर भेज रहे हैं)",
    aiMunshi: "AI Munshi (एआई मुंशी)",
    munshiListening: "Sun raha hoon… (सुन रहा हूँ)",
    munshiTapToSpeak: "Bolkar stock badlein (बोलकर स्टॉक बदलें)",
    munshiNothingToClose: "Sab saman pehle se out of stock hai (सब आउट ऑफ स्टॉक)",
    smartInsights: "Smart Salah (स्मार्ट सलाह)",
    linkedAccount: "Juda Bank Account (जुड़ा बैंक खाता)",
    confirmWithdraw: "Confirm Karke Nikalein (कन्फर्म करके निकालें)",
  },
};

interface VendorLanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: TKey) => string;
  /** Build a "price updated" message in the active language. */
  priceUpdated: (name: string, price: number) => string;
  /** Build an in/out of stock toast message in the active language. */
  stockMessage: (name: string, inStock: boolean) => string;
  /** Build a "payout requested for ₹X" message in the active language. */
  payoutMessage: (amount: number) => string;
}

const VendorLanguageContext = createContext<VendorLanguageValue | null>(null);

const STORAGE_KEY = "conon.vendor.lang";

export function VendorLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "hi" ? "hi" : "en";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === "en" ? "hi" : "en")), []);
  const t = useCallback((key: TKey) => DICT[lang][key] ?? DICT.en[key] ?? key, [lang]);
  const priceUpdated = useCallback(
    (name: string, price: number) =>
      lang === "hi"
        ? `${name} ka bhaav ₹${price.toLocaleString("en-IN")} ho gaya (भाव बदल गया)`
        : `${name} price updated to ₹${price.toLocaleString("en-IN")}`,
    [lang],
  );
  const stockMessage = useCallback(
    (name: string, inStock: boolean) =>
      lang === "hi"
        ? inStock
          ? `${name} ab stock mein hai (स्टॉक में)`
          : `${name} stock khatam (स्टॉक खत्म)`
        : inStock
          ? `${name} is back in stock`
          : `${name} marked out of stock`,
    [lang],
  );
  const payoutMessage = useCallback(
    (amount: number) =>
      lang === "hi"
        ? `₹${amount.toLocaleString("en-IN")} nikalne ki request bhej di (रिक्वेस्ट भेज दी)`
        : `Payout of ₹${amount.toLocaleString("en-IN")} requested`,
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, priceUpdated, stockMessage, payoutMessage }),
    [lang, setLang, toggleLang, t, priceUpdated, stockMessage, payoutMessage],
  );

  return <VendorLanguageContext.Provider value={value}>{children}</VendorLanguageContext.Provider>;
}

export function useVendorLanguage() {
  const ctx = useContext(VendorLanguageContext);
  if (!ctx) throw new Error("useVendorLanguage must be used within a VendorLanguageProvider");
  return ctx;
}
