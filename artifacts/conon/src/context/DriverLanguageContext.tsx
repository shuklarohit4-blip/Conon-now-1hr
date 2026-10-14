import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Conon Fleet — Driver Partner localization (Hindi-first).

   Truck and mini-truck drivers in India read practical "Hinglish" far faster
   than formal English. The app therefore defaults to Hindi and exposes a
   permanent "English | हिंदी" toggle. Switching updates a single state value so
   every consumer re-renders instantly with no reload.
   ────────────────────────────────────────────────────────────────────────── */

export type Lang = "en" | "hi";

export type TKey =
  | "appName"
  | "driverPartner"
  | "duty"
  | "kamai"
  | "goOnline"
  | "goOffline"
  | "youAreOffline"
  | "youAreOnline"
  | "tapToStart"
  | "waitingForOrders"
  | "searchingNearby"
  | "testDispatch"
  | "newDeliveryRequest"
  | "earn"
  | "swipeToAccept"
  | "accept"
  | "decline"
  | "tripAccepted"
  | "declined"
  | "pickupStep"
  | "transitStep"
  | "dropStep"
  | "step"
  | "warehouse"
  | "customerSite"
  | "navigateToPickup"
  | "scanToLoad"
  | "scanning"
  | "materialLoaded"
  | "navigateToSite"
  | "arrivedAtLocation"
  | "arrived"
  | "proofOfDelivery"
  | "uploadPhoto"
  | "photoUploaded"
  | "capturing"
  | "holdSteady"
  | "enterCustomerOtp"
  | "otpVerified"
  | "askCustomerOtp"
  | "wrongOtp"
  | "completeTrip"
  | "finishPodFirst"
  | "tripSuccessful"
  | "addedToWallet"
  | "backToDuty"
  | "viewKamai"
  | "todaysEarnings"
  | "tripsToday"
  | "availableBalance"
  | "withdrawToBank"
  | "withdrawnTo"
  | "noEarningsYet"
  | "linkedAccount"
  | "onlineToast"
  | "offlineToast"
  | "goOnlineFirst"
  | "recentTrips"
  | "noTripsYet"
  | "distance"
  | "openMaps";

const DICT: Record<Lang, Record<TKey, string>> = {
  en: {
    appName: "Conon Fleet",
    driverPartner: "Driver Partner",
    duty: "Duty",
    kamai: "My Kamai",
    goOnline: "Go Online",
    goOffline: "Go Offline",
    youAreOffline: "You are Offline",
    youAreOnline: "You are Online",
    tapToStart: "Tap to start receiving trips",
    waitingForOrders: "Waiting for orders…",
    searchingNearby: "Searching nearby loads",
    testDispatch: "Test Dispatch",
    newDeliveryRequest: "New Delivery Request",
    earn: "Earn",
    swipeToAccept: "Swipe to Accept",
    accept: "ACCEPT",
    decline: "Decline",
    tripAccepted: "Trip Accepted!",
    declined: "Request declined",
    pickupStep: "Pickup",
    transitStep: "Transit",
    dropStep: "Drop & Proof",
    step: "Step",
    warehouse: "Pickup Warehouse",
    customerSite: "Customer Site",
    navigateToPickup: "Navigate to Pickup",
    scanToLoad: "Scan QR to Load Material",
    scanning: "Scanning QR…",
    materialLoaded: "Material Loaded!",
    navigateToSite: "Navigate to Site",
    arrivedAtLocation: "Arrived at Location",
    arrived: "Arrived",
    proofOfDelivery: "Proof of Delivery",
    uploadPhoto: "Upload Unloaded Material Photo",
    photoUploaded: "Photo Uploaded",
    capturing: "Capturing…",
    holdSteady: "Hold steady — capturing photo",
    enterCustomerOtp: "Enter Customer OTP",
    otpVerified: "OTP Verified",
    askCustomerOtp: "Ask the customer for their 4-digit OTP",
    wrongOtp: "Wrong OTP — try again",
    completeTrip: "Complete Trip",
    finishPodFirst: "Upload photo & verify OTP first",
    tripSuccessful: "Trip Successful!",
    addedToWallet: "added to your wallet",
    backToDuty: "Back to Duty",
    viewKamai: "View My Kamai",
    todaysEarnings: "Today's Earnings",
    tripsToday: "Trips Today",
    availableBalance: "Available Balance",
    withdrawToBank: "Withdraw to Bank",
    withdrawnTo: "withdrawn to",
    noEarningsYet: "No earnings yet — go online to start",
    linkedAccount: "Linked Bank Account",
    onlineToast: "You are now online",
    offlineToast: "You are now offline",
    goOnlineFirst: "Go online to receive trips",
    recentTrips: "Recent Trips",
    noTripsYet: "No trips completed yet today",
    distance: "Distance",
    openMaps: "Open in Maps",
  },
  hi: {
    appName: "Conon Fleet",
    driverPartner: "Driver Partner (ड्राइवर पार्टनर)",
    duty: "Duty (ड्यूटी)",
    kamai: "Meri Kamai (मेरी कमाई)",
    goOnline: "Online Aayein (ऑनलाइन आएं)",
    goOffline: "Offline Jaayein (ऑफलाइन जाएं)",
    youAreOffline: "Aap Offline Hain (आप ऑफलाइन हैं)",
    youAreOnline: "Aap Online Hain (आप ऑनलाइन हैं)",
    tapToStart: "Trip lene ke liye tap karein (तैयार होने के लिए टैप करें)",
    waitingForOrders: "Order ka intezaar… (ऑर्डर का इंतज़ार)",
    searchingNearby: "Aas-paas load dhoond rahe hain (नज़दीकी लोड खोज रहे हैं)",
    testDispatch: "Test Dispatch (टेस्ट डिस्पैच)",
    newDeliveryRequest: "Naya Delivery Request (नया डिलीवरी रिक्वेस्ट)",
    earn: "Kamai (कमाई)",
    swipeToAccept: "Accept ke liye swipe karein (स्वाइप करें)",
    accept: "MANZOOR (मंज़ूर)",
    decline: "Mana Karein (मना करें)",
    tripAccepted: "Trip Manzoor! (ट्रिप मंज़ूर!)",
    declined: "Request mana kar di (रिक्वेस्ट मना की)",
    pickupStep: "Pickup (पिकअप)",
    transitStep: "Raaste Mein (रास्ते में)",
    dropStep: "Drop & Saboot (ड्रॉप)",
    step: "Step (चरण)",
    warehouse: "Pickup Godown (पिकअप गोदाम)",
    customerSite: "Grahak Site (ग्राहक साइट)",
    navigateToPickup: "Pickup Tak Chalein (पिकअप तक चलें)",
    scanToLoad: "Material Load karne ke liye QR Scan karein (QR स्कैन करें)",
    scanning: "QR Scan ho raha hai… (स्कैन हो रहा है)",
    materialLoaded: "Material Load Ho Gaya! (माल लोड हो गया!)",
    navigateToSite: "Site Tak Chalein (साइट तक चलें)",
    arrivedAtLocation: "Site Par Pahunch Gaye (साइट पर पहुंचे)",
    arrived: "Pahunch Gaye (पहुंच गए)",
    proofOfDelivery: "Delivery Ka Saboot (डिलीवरी का सबूत)",
    uploadPhoto: "Unloaded Material Ki Photo Upload Karein (फोटो अपलोड करें)",
    photoUploaded: "Photo Upload Ho Gayi (फोटो अपलोड हो गई)",
    capturing: "Photo le rahe hain… (फोटो ले रहे हैं)",
    holdSteady: "Phone seedha rakhein — photo le rahe hain (फोन सीधा रखें)",
    enterCustomerOtp: "Grahak Ka OTP Daalein (ग्राहक का OTP डालें)",
    otpVerified: "OTP Sahi Hai (OTP सही है)",
    askCustomerOtp: "Grahak se unka 4-digit OTP poochein (ग्राहक से OTP पूछें)",
    wrongOtp: "Galat OTP — dobara koshish karein (गलत OTP)",
    completeTrip: "Trip Poori Karein (ट्रिप पूरी करें)",
    finishPodFirst: "Pehle photo aur OTP poora karein (पहले फोटो और OTP)",
    tripSuccessful: "Trip Safal! (ट्रिप सफल!)",
    addedToWallet: "aapke wallet mein jud gaye (वॉलेट में जुड़ गए)",
    backToDuty: "Duty Par Wapas (ड्यूटी पर वापस)",
    viewKamai: "Meri Kamai Dekhein (मेरी कमाई देखें)",
    todaysEarnings: "Aaj Ki Kamai (आज की कमाई)",
    tripsToday: "Aaj Ki Trips (आज की ट्रिप्स)",
    availableBalance: "Jama Paisa (जमा पैसा)",
    withdrawToBank: "Bank Mein Nikalein (बैंक में निकालें)",
    withdrawnTo: "nikal liya (निकाल लिया)",
    noEarningsYet: "Abhi koi kamai nahi — online aayein (अभी कोई कमाई नहीं)",
    linkedAccount: "Juda Bank Account (जुड़ा बैंक खाता)",
    onlineToast: "Aap ab online hain (आप अब ऑनलाइन हैं)",
    offlineToast: "Aap ab offline hain (आप अब ऑफलाइन हैं)",
    goOnlineFirst: "Trip lene ke liye online aayein (ऑनलाइन आएं)",
    recentTrips: "Pichhli Trips (पिछली ट्रिप्स)",
    noTripsYet: "Aaj abhi koi trip poori nahi hui (अभी कोई ट्रिप नहीं)",
    distance: "Doori (दूरी)",
    openMaps: "Maps Mein Kholein (मैप्स में खोलें)",
  },
};

interface DriverLanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: TKey) => string;
}

const DriverLanguageContext = createContext<DriverLanguageValue | null>(null);

const STORAGE_KEY = "conon.driver.lang";

export function DriverLanguageProvider({ children }: { children: React.ReactNode }) {
  /* Hindi-first: default to "hi" unless the driver has explicitly chosen English. */
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "hi";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "hi";
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

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

  return <DriverLanguageContext.Provider value={value}>{children}</DriverLanguageContext.Provider>;
}

export function useDriverLanguage() {
  const ctx = useContext(DriverLanguageContext);
  if (!ctx) throw new Error("useDriverLanguage must be used within a DriverLanguageProvider");
  return ctx;
}
