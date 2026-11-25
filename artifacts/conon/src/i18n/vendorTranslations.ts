/**
 * CONON PARTNER DUKAAN OS — BILINGUAL I18N DICTIONARY
 *
 * Natural, everyday Indian hardware-shop Hindi (Devanagari script)
 * paired with crisp, high-clarity English.
 *
 * Written specifically for Lucknow building material dealers, munims,
 * dispatchers, and counter sales staff. Universal brand names
 * (UltraTech, Tata Tiscon, Asian Paints, Astral, Fevicol, Jaquar,
 * GSTIN, PAN, UPI, QR) and currency figures remain crisp and readable.
 */

export type VendorLang = "en" | "hi";

export interface VendorTranslationSchema {
  [key: string]: string;
  // Brand & Header Lockup
  brandTagline: string;
  dukaanOsVersion: string;
  verifiedPartner: string;
  switchHub: string;
  hubSwitcherTitle: string;
  zeroReloadNote: string;
  registerNewShop: string;
  underKycBadge: string;
  onlineDuty: string;
  busyDuty: string;
  toggleDutyTitle: string;

  // Voice Command Bar
  voicePrompt: string;
  voiceListening: string;
  voiceActionAccepted: string;
  voiceActionStockOut: string;
  voiceActionSimulated: string;
  voiceChipAccept: string;
  voiceChipStockOut: string;
  voiceChipSimulate: string;

  // Header Live KPIs
  kpiActiveOrders: string;
  kpiInFlight: string;
  kpiSettledToday: string;
  kpiEscrowLocked: string;
  openAdminPanel: string;
  openDriverCockpit: string;
  openCustomerStore: string;

  // Column 1: 180s Flash Buzzer & Order Queue
  col1Title: string;
  col1Subtitle: string;
  flashBuzzerActive: string;
  flashBuzzerCountdown: string;
  weightLabel: string;
  vehicleAssigned: string;
  guaranteedNetPayout: string;
  acceptOrderBtn: string;
  orderAcceptedBadge: string;
  loadingChecklist: string;
  loadingChecklistDone: string;
  splitItemBtn: string;
  splitItemModalTitle: string;
  splitItemDesc: string;
  neighbourHubLabel: string;
  payoutSplitCut: string;
  confirmSplitBtn: string;
  driverIncomingHeader: string;
  driverOtpLabel: string;
  scanQrPrompt: string;
  confirmLoadedBtn: string;
  noActiveOrdersTitle: string;
  noActiveOrdersDesc: string;
  simulateOrderBtn: string;
  speakReadoutBtn: string;

  // Column 2: 16-Category Catalog & Stock Control
  col2Title: string;
  col2Subtitle: string;
  searchCatalogPlaceholder: string;
  allCategoriesTab: string;
  inStockCountLabel: string;
  outOfStockCountLabel: string;
  openFullStudioBtn: string;
  inStockBadge: string;
  outOfStockBadge: string;
  toggleStockTip: string;
  updatePhotoBtn: string;
  addNewProductBtn: string;
  bulkHedgeTitle: string;
  bulkHedgeSubtitle: string;
  adminLockOffer: string;
  lockedRateLabel: string;
  instantAdvanceLabel: string;
  lockHedgeBtn: string;
  hedgeLockedBadge: string;
  demandRadarTitle: string;
  demandRadarSubtitle: string;
  hotCorridorBadge: string;

  // 16 Categories Display Names
  catCementCivil: string;
  catTmtSteel: string;
  catBricksSand: string;
  catPlumbingTanks: string;
  catPaintsWaterproofing: string;
  catTileStone: string;
  catFevicolAdhesives: string;
  catPlywoodBoards: string;
  catDoorHardware: string;
  catFurnitureHardware: string;
  catElectricalWires: string;
  catLighting: string;
  catSanitaryBath: string;
  catKitchenSinks: string;
  catModularKitchen: string;
  catHomeAppliances: string;
  catPowerToolsSafety: string;
  catCctvNetworking: string;

  // Column 3: Escrow-to-UPI Pipeline & Driver Radar
  col3Title: string;
  col3Subtitle: string;
  stageLoaded: string;
  stageEnRoute: string;
  stageVerified: string;
  stageSettled: string;
  driverRadarTitle: string;
  driverEtaLabel: string;
  driverVehicleLabel: string;
  callDriverBtn: string;
  payoutProgressDesc: string;
  autoSettledToast: string;

  // Vendor Registration & KYC Wizard (/vendor/register)
  kycWizardTitle: string;
  kycWizardSubtitle: string;
  kycStep1Title: string;
  kycStep1Desc: string;
  kycStep2Title: string;
  kycStep2Desc: string;
  kycStep3Title: string;
  kycStep3Desc: string;
  kycStep4Title: string;
  kycStep4Desc: string;

  // KYC Step 1 Form Fields
  firmNameLabel: string;
  ownerNameLabel: string;
  phoneLabel: string;
  sendOtpBtn: string;
  otpVerifiedBadge: string;
  zoneSelectLabel: string;
  categoriesSelectLabel: string;
  loadingBayLabel: string;
  loadingBayLoader: string;
  loadingBayNarrow: string;
  gpsLocationLabel: string;
  gpsCapturedBadge: string;

  // KYC Step 2 Form Fields (AI OCR)
  gstinLabel: string;
  panLabel: string;
  shopPhotoLabel: string;
  dealershipProofLabel: string;
  aiOcrVerified: string;
  aiOcrScanning: string;
  uploadClickOrDrop: string;
  reUploadAlert: string;

  // KYC Step 3 Form Fields (Bank & Penny Drop)
  accountNumberLabel: string;
  confirmAccountLabel: string;
  ifscLabel: string;
  upiIdLabel: string;
  pennyDropBtn: string;
  pennyDropSuccess: string;
  pennyDropPending: string;
  instantVerificationNote: string;

  // KYC Step 4 Form Fields (SLA Pledge)
  slaPledgeTitle: string;
  slaPledge1: string;
  slaPledge2: string;
  slaPledge3: string;
  submitKycBtn: string;
  submittingKyc: string;
  kycPendingSandboxBanner: string;
  backBtn: string;
  nextBtn: string;
}

export const VENDOR_TRANSLATIONS: Record<VendorLang, VendorTranslationSchema> = {
  en: {
    brandTagline: "CONON PARTNER",
    dukaanOsVersion: "DUKAAN OS v3.0",
    verifiedPartner: "Verified Hub",
    switchHub: "Switch Hub",
    hubSwitcherTitle: "1-Click Lucknow Hub Switcher",
    zeroReloadNote: "Zero Page Reload",
    registerNewShop: "+ Register New Hardware Dukaan",
    underKycBadge: "UNDER KYC",
    onlineDuty: "ONLINE",
    busyDuty: "BUSY",
    toggleDutyTitle: "Click to toggle shop between Online and Busy/Rush mode",

    voicePrompt: 'Speak order action or tap chip...',
    voiceListening: "Listening to Munim voice...",
    voiceActionAccepted: 'Voice Command: Order Accepted!',
    voiceActionStockOut: 'Voice Command: Stock status toggled!',
    voiceActionSimulated: 'Voice Command: Express order incoming!',
    voiceChipAccept: '✨ "Accept New Order"',
    voiceChipStockOut: '⚡ "Mark OPC Out of Stock"',
    voiceChipSimulate: '📦 "Simulate Express Order"',

    kpiActiveOrders: "Active Orders",
    kpiInFlight: "In Flight",
    kpiSettledToday: "Settled UPI (Today)",
    kpiEscrowLocked: "Escrow Hold",
    openAdminPanel: "Admin OS",
    openDriverCockpit: "Driver Radar",
    openCustomerStore: "Customer Storefront",

    col1Title: "180s Flash Buzzer Queue",
    col1Subtitle: "Live site orders awaiting immediate loading",
    flashBuzzerActive: "⚡ FLASH DISPATCH BUZZER",
    flashBuzzerCountdown: "Auto-Reassign Countdown",
    weightLabel: "Weight",
    vehicleAssigned: "Loader Assigned",
    guaranteedNetPayout: "Guaranteed Net Payout",
    acceptOrderBtn: "Accept Order & Start Loading",
    orderAcceptedBadge: "Order Accepted • Loading Bay Active",
    loadingChecklist: "Material Loading Checklist",
    loadingChecklistDone: "All items verified for loading",
    splitItemBtn: "Split Missing Item (Invisible Warehouse)",
    splitItemModalTitle: "Split Order with Neighbouring Mandi Hub",
    splitItemDesc: "Never lose a customer sale. Transfer missing SKUs seamlessly to a 1.5 km partner depot.",
    neighbourHubLabel: "Select Neighbouring Partner Hub",
    payoutSplitCut: "Sub-Vendor Payout Share",
    confirmSplitBtn: "Confirm Split & Dispatch Multi-Stop Route",
    driverIncomingHeader: "Driver Approaching Shop",
    driverOtpLabel: "Pickup Gate Pass OTP",
    scanQrPrompt: "Scan Driver Cockpit QR to Handover",
    confirmLoadedBtn: "Confirm Material Loaded & Release Driver",
    noActiveOrdersTitle: "No Incoming Orders in Queue",
    noActiveOrdersDesc: "Your dukaan is live on Lucknow express dispatch radar. New site orders will ring buzzer instantly.",
    simulateOrderBtn: "⚡ Simulate Live Contractor Order",
    speakReadoutBtn: "🔊 Speak Order Readout",

    col2Title: "16-Category Visual Catalog & Hedge",
    col2Subtitle: "1-tap in/out of stock switches and admin rate locks",
    searchCatalogPlaceholder: "Search cement, sariya, pipes, paints, locks...",
    allCategoriesTab: "All Categories",
    inStockCountLabel: "In Stock",
    outOfStockCountLabel: "Out of Stock",
    openFullStudioBtn: "Open 16-Category Catalog Studio",
    inStockBadge: "IN STOCK",
    outOfStockBadge: "OUT OF STOCK",
    toggleStockTip: "1-tap stock kill switch",
    updatePhotoBtn: "Update Photo",
    addNewProductBtn: "+ Add New Product",
    bulkHedgeTitle: "Admin Rate-Lock Bulk Hedge Inbox",
    bulkHedgeSubtitle: "Pre-committed builder volume with advance cash credit",
    adminLockOffer: "CONON Admin Volume Commitment",
    lockedRateLabel: "Locked Landing Rate",
    instantAdvanceLabel: "Instant Advance Credit",
    lockHedgeBtn: "🤝 Lock Bulk Hedge & Take Advance",
    hedgeLockedBadge: "100% Hedged • Advance Credited",
    demandRadarTitle: "Next 2-Hour Zone Demand Radar",
    demandRadarSubtitle: "Live contractor carts forming in your 4 km radius",
    hotCorridorBadge: "High Volume Corridor",

    catCementCivil: "Cement & Civil Works",
    catTmtSteel: "TMT Sariya & Binding Wire",
    catBricksSand: "Bricks, Sand (Morang) & Gitti",
    catPlumbingTanks: "CPVC Plumbing & Water Tanks",
    catPaintsWaterproofing: "Paints, Putty & Waterproofing",
    catTileStone: "Tiles & Natural Stone",
    catFevicolAdhesives: "Fevicol, Adhesives & Sealants",
    catPlywoodBoards: "Plywood, Doors & Laminates",
    catDoorHardware: "Door Hardware & Locks",
    catFurnitureHardware: "Furniture & Wardrobe Hardware",
    catElectricalWires: "Wires, MCB & Electrical",
    catLighting: "Lighting & LED Fixtures",
    catSanitaryBath: "Sanitary & Bath Fittings",
    catKitchenSinks: "Kitchen Sinks & Faucets",
    catModularKitchen: "Modular Kitchen Systems",
    catHomeAppliances: "Home Appliances & Geysers",
    catPowerToolsSafety: "Power Tools & Site Safety",
    catCctvNetworking: "CCTV & Networking",

    col3Title: "Escrow-to-UPI Pipeline & Driver Radar",
    col3Subtitle: "Instant bank settlement upon site photo verification",
    stageLoaded: "Loaded at Dukaan",
    stageEnRoute: "En Route to Site",
    stageVerified: "Geo-Photo Verified",
    stageSettled: "UPI Settled",
    driverRadarTitle: "Driver Dispatch Radar",
    driverEtaLabel: "Estimated Arrival",
    driverVehicleLabel: "Vehicle Assigned",
    callDriverBtn: "Call Driver",
    payoutProgressDesc: "Funds locked in CONON Escrow Vault. Instant auto-release to your verified UPI VPA as soon as driver unloads at site.",
    autoSettledToast: "UPI Bank Settlement Credited Successfully!",

    kycWizardTitle: "Hardware Partner Dukaan Onboarding",
    kycWizardSubtitle: "Join Lucknow's verified express building materials supply network in 4 simple steps",
    kycStep1Title: "1. Dukaan Identity & GPS",
    kycStep1Desc: "Shop firm name, owner details, loading lane width and pinpoint map coordinates",
    kycStep2Title: "2. Papers with AI OCR",
    kycStep2Desc: "Instant automated document scanning for GSTIN, PAN, signboard photo & brand dealership",
    kycStep3Title: "3. Bank & ₹1 Penny-Drop",
    kycStep3Desc: "NPCI/IMPS instant ₹1 deposit to authenticate shop bank account and UPI VPA",
    kycStep4Title: "4. Digital SLA & E-Sign",
    kycStep4Desc: "Transparent delivery standards, genuine ISI material pledge and digital agreement",

    firmNameLabel: "Registered Firm / Dukaan Name",
    ownerNameLabel: "Proprietor / Owner Full Name",
    phoneLabel: "Mobile Number (WhatsApp Enabled)",
    sendOtpBtn: "Send OTP",
    otpVerifiedBadge: "Mobile Verified via OTP",
    zoneSelectLabel: "Operating Lucknow Hub Zone",
    categoriesSelectLabel: "Product Categories Handled",
    loadingBayLabel: "Loading Bay Vehicle Access",
    loadingBayLoader: "E-Loader & Chhota Hathi Accessible (>15 ft Lane)",
    loadingBayNarrow: "Narrow Lane / 2-Wheeler Only (<15 ft)",
    gpsLocationLabel: "Dukaan Exact Pinpoint GPS",
    gpsCapturedBadge: "Pinpoint GPS Lat/Lng Captured",

    gstinLabel: "GSTIN Certificate (09-Uttar Pradesh)",
    panLabel: "Proprietor / Firm PAN Card",
    shopPhotoLabel: "Shop Front Photo (Signboard Visible)",
    dealershipProofLabel: "Brand Dealership / Distributor Invoice",
    aiOcrVerified: "AI OCR Match Verified (100% Genuine)",
    aiOcrScanning: "Scanning Document via AI OCR...",
    uploadClickOrDrop: "Click or drag document file to upload",
    reUploadAlert: "Verification failed. Please re-upload a clearer image.",

    accountNumberLabel: "Bank Account Number",
    confirmAccountLabel: "Confirm Account Number",
    ifscLabel: "Bank IFSC Code",
    upiIdLabel: "Direct UPI VPA (For Instant Settlement)",
    pennyDropBtn: "⚡ Trigger ₹1 Penny-Drop Bank Verification",
    pennyDropSuccess: "₹1 IMPS Deposited • Bank Account Name Matched Successfully",
    pennyDropPending: "Verifying with Bank NPCI Gateway...",
    instantVerificationNote: "We deposit ₹1 via IMPS to verify your bank account title matches your GST/PAN firm name.",

    slaPledgeTitle: "CONON PARTNER DUKAAN QUALITY PLEDGE",
    slaPledge1: "I pledge to pack and make orders ready for driver loading within 180 seconds of acceptance.",
    slaPledge2: "I guarantee 100% genuine, brand-new ISI certified materials with zero counterfeit substitutions.",
    slaPledge3: "I accept instant Escrow-to-UPI settlements upon geo-tagged photo delivery at builder sites.",
    submitKycBtn: "Complete Dukaan Registration & Start Earning",
    submittingKyc: "Submitting Verification Application...",
    kycPendingSandboxBanner: "Verification In Progress • Operating in Protected Sandbox Mode with Full Feature Access",
    backBtn: "Back",
    nextBtn: "Next Step",
  },

  hi: {
    brandTagline: "कोनोन पार्टनर",
    dukaanOsVersion: "दुकान ओएस v3.0",
    verifiedPartner: "वेरिफ़ाइड हब",
    switchHub: "दुकान बदलें",
    hubSwitcherTitle: "1-क्लिक लखनऊ हब स्विचर",
    zeroReloadNote: "बिना पेज रीलोड",
    registerNewShop: "+ नई हार्डवेयर दुकान जोड़ें",
    underKycBadge: "सत्यापन जारी",
    onlineDuty: "ऑनलाइन",
    busyDuty: "व्यस्त (Rush)",
    toggleDutyTitle: "दुकान को ऑनलाइन या व्यस्त मोड में बदलने के लिए टैप करें",

    voicePrompt: 'बोलकर आदेश दें या चिप दबाएं...',
    voiceListening: "मुंशी जी सुन रहे हैं...",
    voiceActionAccepted: 'आवाज़ से आदेश: ऑर्डर स्वीकार कर लिया गया!',
    voiceActionStockOut: 'आवाज़ से आदेश: स्टॉक बदल दिया गया!',
    voiceActionSimulated: 'आवाज़ से आदेश: नया एक्सप्रेस ऑर्डर आ रहा है!',
    voiceChipAccept: '✨ "नया ऑर्डर स्वीकार करें"',
    voiceChipStockOut: '⚡ "ओपीसी सीमेंट स्टॉक खत्म"',
    voiceChipSimulate: '📦 "नया एक्सप्रेस ऑर्डर भेजें"',

    kpiActiveOrders: "चालू ऑर्डर्स",
    kpiInFlight: "लोडिंग/रास्ते में",
    kpiSettledToday: "आज का सेटल यूपीआई",
    kpiEscrowLocked: "एस्क्रो में सुरक्षित",
    openAdminPanel: "एडमिन ओएस",
    openDriverCockpit: "ड्राइवर रडार",
    openCustomerStore: "ग्राहक स्टोरफ़्रंट",

    col1Title: "180s फ़्लैश बजर ऑर्डर कतार",
    col1Subtitle: "तुरंत लोडिंग के लिए तैयार लाइव साइट ऑर्डर्स",
    flashBuzzerActive: "⚡ फ़्लैश डिस्पैच बजर चालू",
    flashBuzzerCountdown: "ऑटो-रीअसाइन उलटी गिनती",
    weightLabel: "कुल वज़न",
    vehicleAssigned: "गाड़ी असाइन",
    guaranteedNetPayout: "पक्की नेट दुकान कमाई",
    acceptOrderBtn: "ऑर्डर स्वीकार करें और लोडिंग शुरू करें",
    orderAcceptedBadge: "ऑर्डर स्वीकार हुआ • लोडिंग बे तैयार",
    loadingChecklist: "सामान लोडिंग चेकलिस्ट",
    loadingChecklistDone: "सभी सामान चेक व लोड हो गए",
    splitItemBtn: "सामान शेयर करें (अदृश्य गोदाम)",
    splitItemModalTitle: "पड़ोसी मंडी हब के साथ ऑर्डर बांटें",
    splitItemDesc: "ग्राहक की सेल कभी न टूटे। अधूरा सामान 1.5 किमी दूर पार्टनर डिपो से तुरंत मंगाएं।",
    neighbourHubLabel: "पड़ोसी पार्टनर दुकान चुनें",
    payoutSplitCut: "पार्टनर का भुगतान हिस्सा",
    confirmSplitBtn: "शेयर पक्का करें और मल्टी-स्टॉप रूट चालू करें",
    driverIncomingHeader: "ड्राइवर दुकान पर पहुंच रहा है",
    driverOtpLabel: "पिकअप गेट पास ओटीपी",
    scanQrPrompt: "ड्राइवर कॉकपिट का क्यूआर स्कैन करें",
    confirmLoadedBtn: "सामान लोड हुआ और गाड़ी रवाना करें",
    noActiveOrdersTitle: "कतार में अभी कोई नया ऑर्डर नहीं",
    noActiveOrdersDesc: "आपकी दुकान लखनऊ एक्सप्रेस डिस्पैच रडार पर लाइव है। नई साइट का ऑर्डर आते ही घंटी बजेगी।",
    simulateOrderBtn: "⚡ लाइव ठेकेदार ऑर्डर टेस्ट करें",
    speakReadoutBtn: "🔊 ऑर्डर पढ़कर सुनाएं",

    col2Title: "16-श्रेणी विजुअल कैटलॉग व बल्क हेज",
    col2Subtitle: "1-टैप स्टॉक स्विच और एडमिन रेट-लॉक हेजिंग",
    searchCatalogPlaceholder: "सीमेंट, सरिया, पाइप, पेंट, ताले खोजें...",
    allCategoriesTab: "सभी 16 श्रेणियां",
    inStockCountLabel: "स्टॉक में है",
    outOfStockCountLabel: "स्टॉक खत्म",
    openFullStudioBtn: "16-श्रेणी कैटलॉग स्टूडियो खोलें",
    inStockBadge: "स्टॉक में है",
    outOfStockBadge: "स्टॉक खत्म",
    toggleStockTip: "1-टैप स्टॉक किल स्विच",
    updatePhotoBtn: "फोटो बदलें",
    addNewProductBtn: "+ नया सामान जोड़ें",
    bulkHedgeTitle: "एडमिन रेट-लॉक बल्क हेज इनबॉक्स",
    bulkHedgeSubtitle: "बिल्डर वॉल्यूम की गारंटी और तुरंत एडवांस बैंक क्रेडिट",
    adminLockOffer: "कोनोन एडमिन वॉल्यूम कमिटमेंट",
    lockedRateLabel: "तय लैंडिंग भाव",
    instantAdvanceLabel: "तुरंत एडवांस क्रेडिट",
    lockHedgeBtn: "🤝 बल्क हेज लॉक करें और एडवांस लें",
    hedgeLockedBadge: "100% हेज्ड • एडवांस जमा",
    demandRadarTitle: "अगले 2 घंटे का ज़ोन डिमांड रडार",
    demandRadarSubtitle: "आपके 4 किमी दायरे में बन रहे ठेकेदार कार्ट्स",
    hotCorridorBadge: "अधिक मांग वाला क्षेत्र",

    catCementCivil: "सीमेंट एवं सिविल सामग्री",
    catTmtSteel: "टीएमटी सरिया एवं बाइंडिंग तार",
    catBricksSand: "ईंट, मौरंग (बालू) एवं गिट्टी",
    catPlumbingTanks: "सीपीवीसी पाइप एवं पानी की टंकी",
    catPaintsWaterproofing: "पेंट, पुट्टी एवं वाटरप्रूफिंग",
    catTileStone: "टाइल्स एवं प्राकृतिक पत्थर",
    catFevicolAdhesives: "फेविकोल, एडहेसिव एवं सीलेंट",
    catPlywoodBoards: "प्लाईवुड, दरवाजे एवं लेमिनेट",
    catDoorHardware: "दरवाजे की फिटिंग एवं ताले",
    catFurnitureHardware: "फर्नीचर एवं अलमारी हार्डवेयर",
    catElectricalWires: "तार, एमसीबी एवं बिजली फिटिंग",
    catLighting: "लाइटिंग एवं एलईडी फिक्स्चर",
    catSanitaryBath: "सैनिटरी एवं बाथरूम फिटिंग",
    catKitchenSinks: "किचन सिंक एवं नल",
    catModularKitchen: "मॉड्यूलर किचन सिस्टम",
    catHomeAppliances: "होम अप्लायंसेज एवं गीजर",
    catPowerToolsSafety: "पावर टूल्स एवं साइट सुरक्षा",
    catCctvNetworking: "सीसीटीवी एवं नेटवर्किंग",

    col3Title: "एस्क्रो से यूपीआई सेटलमेंट व ड्राइवर रडार",
    col3Subtitle: "साइट पर फोटो सत्यापन होते ही सीधा बैंक में भुगतान",
    stageLoaded: "दुकान पर लोड हुआ",
    stageEnRoute: "साइट के रास्ते में",
    stageVerified: "जियो-फोटो सत्यापित",
    stageSettled: "यूपीआई सेटल",
    driverRadarTitle: "ड्राइवर डिस्पैच रडार",
    driverEtaLabel: "पहुंचने का समय",
    driverVehicleLabel: "असाइन वाहन",
    callDriverBtn: "ड्राइवर को कॉल करें",
    payoutProgressDesc: "पैसा कोनोन एस्क्रो में सुरक्षित है। साइट पर अनलोड और फोटो मिलते ही तुरंत आपके यूपीआई में जमा होगा।",
    autoSettledToast: "यूपीआई सेटलमेंट बैंक खाते में सफलता से जमा हो गया!",

    kycWizardTitle: "हार्डवेयर पार्टनर दुकान ऑनबोर्डिंग",
    kycWizardSubtitle: "4 आसान चरणों में लखनऊ के सबसे बड़े बिल्डिंग सामग्री नेटवर्क से जुड़ें",
    kycStep1Title: "1. दुकान की पहचान एवं जीपीएस",
    kycStep1Desc: "फर्म का नाम, मालिक का विवरण, गाड़ी लोडिंग रास्ता और सटीक नक्शा लोकेशन",
    kycStep2Title: "2. कागज़ात सत्यापन (AI OCR)",
    kycStep2Desc: "जीएसटीआईएन, पैन, साइनबोर्ड फोटो और डीलरशिप का ऑटोमैटिक स्कैनर",
    kycStep3Title: "3. बैंक एवं ₹1 पेनी-ड्रॉप सत्यापन",
    kycStep3Desc: "एनपीसीआई/आईएमपीएस द्वारा ₹1 जमा कर बैंक खाते और यूपीआई की तुरंत जांच",
    kycStep4Title: "4. डिजिटल शपथ पत्र व हस्ताक्षर",
    kycStep4Desc: "समयबद्ध लोडिंग, असली आईएसआई सामग्री की गारंटी और डिजिटल अनुबंध",

    firmNameLabel: "रजिस्टर्ड फर्म / दुकान का नाम",
    ownerNameLabel: "मालिक / प्रोप्राइटर का पूरा नाम",
    phoneLabel: "मोबाइल नंबर (व्हाट्सएप सहित)",
    sendOtpBtn: "ओटीपी भेजें",
    otpVerifiedBadge: "मोबाइल ओटीपी सत्यापित",
    zoneSelectLabel: "लखनऊ हब कार्य क्षेत्र",
    categoriesSelectLabel: "दुकान में बिकने वाली सामग्री श्रेणियां",
    loadingBayLabel: "दुकान के सामने गाड़ी आने का रास्ता",
    loadingBayLoader: "लोडर व छोटा हाथी आ सकता है (>15 फीट चौड़ी सड़क)",
    loadingBayNarrow: "सड़क संकरी है / केवल बाइक या ई-रिक्शा (<15 फीट)",
    gpsLocationLabel: "दुकान की सटीक जीपीएस लोकेशन",
    gpsCapturedBadge: "सटीक जीपीएस लोकेशन दर्ज हो गई",

    gstinLabel: "जीएसटीआईएन प्रमाणपत्र (09-उत्तर प्रदेश)",
    panLabel: "प्रोप्राइटर / फर्म पैन कार्ड",
    shopPhotoLabel: "दुकान के सामने की फोटो (बोर्ड साफ दिखे)",
    dealershipProofLabel: "ब्रांड डीलरशिप प्रमाणपत्र / चालान",
    aiOcrVerified: "एआई ओसीआर मिलान सफल (100% असली)",
    aiOcrScanning: "एआई द्वारा कागज़ात स्कैन हो रहा है...",
    uploadClickOrDrop: "फाइल अपलोड करने के लिए क्लिक करें या ड्रैग करें",
    reUploadAlert: "फोटो साफ नहीं है। कृपया स्पष्ट तस्वीर दोबारा अपलोड करें।",

    accountNumberLabel: "बैंक खाता संख्या",
    confirmAccountLabel: "खाता संख्या दोबारा दर्ज करें",
    ifscLabel: "बैंक आईएफएससी (IFSC) कोड",
    upiIdLabel: "सीधा यूपीआई पता (तुरंत सेटलमेंट हेतु)",
    pennyDropBtn: "⚡ ₹1 पेनी-ड्रॉप बैंक सत्यापन शुरू करें",
    pennyDropSuccess: "₹1 आईएमपीएस जमा हुआ • खाता नाम फर्म से शत-प्रतिशत मिल गया",
    pennyDropPending: "बैंक एनपीसीआई गेटवे से जांच हो रही है...",
    instantVerificationNote: "हम ₹1 जमा कर तुरंत पुष्टि करते हैं कि बैंक खाता और जीएसटी नाम एक ही फर्म के हैं।",

    slaPledgeTitle: "कोनोन पार्टनर दुकान गुणवत्ता शपथ पत्र",
    slaPledge1: "मैं ऑर्डर स्वीकार करने के 180 सेकंड के भीतर सामान पैक व लोडिंग हेतु तैयार रखने की शपथ लेता हूँ।",
    slaPledge2: "मैं बिना किसी मिलावट के 100% असली, नई और आईएसआई प्रमाणित सामग्री देने की पूरी गारंटी देता हूँ।",
    slaPledge3: "मैं साइट पर जियो-टैग फोटो डिलीवरी पूर्ण होते ही एस्क्रो से तुरंत यूपीआई सेटलमेंट स्वीकार करता हूँ।",
    submitKycBtn: "पंजीकरण पूरा करें और ऑर्डर लेना शुरू करें",
    submittingKyc: "सत्यापन आवेदन भेजा जा रहा है...",
    kycPendingSandboxBanner: "सत्यापन प्रक्रियाधीन है • सुरक्षित सैंडबॉक्स मोड में सभी फीचर्स चालू हैं",
    backBtn: "पीछे जाएं",
    nextBtn: "अगला कदम",
  },
};
