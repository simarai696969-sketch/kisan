import React, { useState, useMemo } from "react";
import { CropListing, DeliveryOrder, MandiRate, Language } from "../types";
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Edit3, 
  Trash2, 
  Eye, 
  Store, 
  ArrowUpRight, 
  Sparkles,
  MapPin,
  Lock,
  Leaf,
  Building2,
  QrCode,
  Download,
  Printer,
  FileText,
  Check,
  AlertCircle,
  X,
  ChevronRight,
  RefreshCw,
  Smartphone,
  CreditCard,
  Award,
  ArrowDownLeft,
  Info,
  BadgeCheck,
  Percent,
  Search,
  Filter
} from "lucide-react";

interface FarmerDashboardProps {
  crops: CropListing[];
  orders: DeliveryOrder[];
  mandiRates: MandiRate[];
  language: Language;
  onOpenNewListingModal: () => void;
  onOpenAnalyzer?: () => void;
  onUpdateStock: (cropId: string, newStock: number) => void;
  onUpdatePrice?: (cropId: string, newPrice: number) => void;
  onToggleListingActive?: (cropId: string) => void;
  onDeleteListing?: (cropId: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: DeliveryOrder["status"]) => void;
  onOpenAdminDashboard?: () => void;
  onOpenGSTInvoice?: (order: DeliveryOrder) => void;
  onOpenAlertsCenter?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  crops,
  orders,
  mandiRates,
  language,
  onOpenNewListingModal,
  onOpenAnalyzer,
  onUpdateStock,
  onUpdatePrice,
  onDeleteListing,
  onUpdateOrderStatus,
  onOpenAdminDashboard,
  onOpenGSTInvoice,
  onOpenAlertsCenter,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"listings" | "orders" | "earnings" | "insights">("listings");
  
  // Listings Controls State
  const [stockEditCropId, setStockEditCropId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [priceEditCropId, setPriceEditCropId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<number>(0);
  const [listingSearchQuery, setListingSearchQuery] = useState<string>("");
  const [listingCategoryFilter, setListingCategoryFilter] = useState<string>("all");

  // Orders Controls State
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "new" | "in_transit" | "delivered" | "cancelled">("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  
  // Modals State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<DeliveryOrder | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [bankNotification, setBankNotification] = useState<string | null>(null);

  // Bank & UPI Profile State (Persistent in local state)
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "रमेश कुमार वर्मा (Ramesh Kumar Verma)",
    bankName: "भारतीय स्टेट बैंक (State Bank of India)",
    accountNumber: "XXXX-XXXX-4819",
    rawAccountNumber: "38920194819",
    ifscCode: "SBIN0001234",
    upiId: "ramesh.kisan@oksbi",
    accountType: "किसान क्रेडिट / बचत खाता (Kisan Savings A/C)",
    branch: "सीहोर मुख्य शाखा (Sehore Main Branch, MP)"
  });

  const safeCrops = Array.isArray(crops) ? crops : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeMandiRates = Array.isArray(mandiRates) ? mandiRates : [];

  // Filter listings for this farmer (default demo farmer f-101 / all crops in demo)
  const farmerCrops = safeCrops;

  // Calculate sold stats & financials from all orders
  const financialStats = useMemo(() => {
    let grossSales = 0;
    let platformFee = 0;
    let totalPaidPayout = 0;
    let totalEscrowHold = 0;
    let totalSoldKg = 0;
    let deliveredOrdersCount = 0;
    let activeOrdersCount = 0;

    safeOrders.forEach((o) => {
      grossSales += o.cropSubtotal || 0;
      platformFee += o.platformCommission || 0;
      
      const qtyInKg = o.unit === "kg" ? o.quantity : o.unit === "quintal" ? o.quantity * 100 : o.quantity;
      totalSoldKg += qtyInKg;

      if (o.status === "delivered" || o.paymentStatus === "paid") {
        totalPaidPayout += o.farmerPayout || 0;
        deliveredOrdersCount += 1;
      } else if (o.status !== "cancelled") {
        totalEscrowHold += o.farmerPayout || 0;
        activeOrdersCount += 1;
      }
    });

    const totalLiveStockKg = farmerCrops.reduce(
      (acc, c) => acc + (c.unit === "kg" ? c.availableStock : c.unit === "quintal" ? c.availableStock * 100 : c.availableStock * 10),
      0
    );

    // Mandi comparison: Mandi arhatiyas take ~15% + 3% weighting/handling cut = 18%
    const traditionalMandiLoss = Math.round(grossSales * 0.18);
    const kisanDirectFee = platformFee; // only 4%
    const farmerExtraProfitSaved = Math.max(0, traditionalMandiLoss - kisanDirectFee);

    return {
      grossSales,
      platformFee,
      totalPaidPayout,
      totalEscrowHold,
      totalSoldKg,
      deliveredOrdersCount,
      activeOrdersCount,
      totalLiveStockKg,
      farmerExtraProfitSaved,
      totalOrders: safeOrders.length
    };
  }, [safeOrders, farmerCrops]);

  // Filtered crops list
  const filteredCrops = farmerCrops.filter((crop) => {
    const matchesSearch = 
      crop.titleHi.toLowerCase().includes(listingSearchQuery.toLowerCase()) ||
      crop.titleEn.toLowerCase().includes(listingSearchQuery.toLowerCase());
    const matchesCategory = listingCategoryFilter === "all" || crop.category === listingCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered orders list
  const filteredOrders = safeOrders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.cropNameHi.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.cropNameEn.toLowerCase().includes(orderSearchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (orderStatusFilter === "new") {
      matchesStatus = order.status === "order_placed" || order.status === "packed_at_farm";
    } else if (orderStatusFilter === "in_transit") {
      matchesStatus = order.status === "in_transit" || order.status === "out_for_delivery";
    } else if (orderStatusFilter === "delivered") {
      matchesStatus = order.status === "delivered";
    } else if (orderStatusFilter === "cancelled") {
      matchesStatus = order.status === "cancelled";
    }

    return matchesSearch && matchesStatus;
  });

  // Handler for instant settlement request simulation
  const handleRequestInstantSettlement = () => {
    setBankNotification(
      language === "hi" 
        ? "✅ तुरंत पेआउट अनुरोध स्वीकार कर लिया गया है। स्वीकृत एस्क्रो राशि 15-30 मिनट में आपके SBI खाते में क्रेडिट कर दी जाएगी।"
        : "✅ Instant settlement request submitted. Escrow funds will be credited to your SBI account within 15-30 minutes."
    );
    setTimeout(() => setBankNotification(null), 5000);
  };

  return (
    <div className="space-y-5">
      {/* 1. Farmer Account Profile & Verification Header */}
      <div className="bg-[#1B3B18] text-white rounded-2xl p-4 sm:p-6 border border-[#2D5A27] relative overflow-hidden shadow-sm">
        {/* Subtle background art elements */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Store className="w-56 h-56 text-white" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#2D5A27] border-2 border-emerald-400 overflow-hidden shrink-0 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
                  alt="Ramesh Verma"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full border-2 border-[#1B3B18]" title="KYC व आधार सत्यापित">
                <BadgeCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  रमेश कुमार वर्मा (Ramesh Verma)
                </h1>
                <span className="inline-flex items-center gap-1 bg-[#2D5A27] text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  सत्यापित विक्रेता (#KD-KISAN-8841)
                </span>
              </div>

              <p className="text-xs text-[#D5E8D2] mt-1 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  सीहोर क्लस्टर, मध्य प्रदेश
                </span>
                <span className="text-[#A7F3D0] hidden sm:inline">•</span>
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  ⭐ 4.9 रेटिंग (128 संतुष्ट ग्राहक)
                </span>
                <span className="text-[#A7F3D0] hidden sm:inline">•</span>
                <span className="text-emerald-200">18 वर्ष खेती अनुभव</span>
              </p>

              {/* Linked Bank & UPI preview pill */}
              <div className="mt-2 flex items-center gap-2">
                <div 
                  onClick={() => setIsBankModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-black/30 hover:bg-black/40 text-emerald-200 text-[11px] font-mono px-2.5 py-1 rounded-lg border border-emerald-500/30 cursor-pointer transition-colors"
                  title="बैंक व UPI खाता विवरण देखें या बदलें"
                >
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span>{bankDetails.bankName.split(" ")[0]} ({bankDetails.accountNumber})</span>
                  <span className="text-white/40">|</span>
                  <Smartphone className="w-3 h-3 text-amber-300" />
                  <span>UPI: {bankDetails.upiId}</span>
                  <Edit3 className="w-3 h-3 text-white/70 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:self-end lg:self-center">
            {onOpenAnalyzer && (
              <button
                onClick={onOpenAnalyzer}
                className="flex items-center gap-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] px-3.5 py-2 rounded-xl font-extrabold text-xs shadow-sm transition-all hover:scale-102 cursor-pointer border border-[#FDE68A]"
              >
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>{language === "hi" ? "AI फसल स्कैनर" : "Scan Quality"}</span>
              </button>
            )}

            <button
              onClick={onOpenNewListingModal}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#0F290D] px-4 py-2 rounded-xl font-extrabold text-xs shadow-sm transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "hi" ? "+ नई फसल लिस्ट करें" : "+ List New Crop"}</span>
            </button>

            <button
              onClick={() => setIsBankModalOpen(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl font-semibold text-xs transition-colors border border-white/20"
              title="बैंक व भुगतान सेटिंग्स"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">बैंक खाता</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast alert banner for settlement */}
      {bankNotification && (
        <div className="bg-[#EBF5EA] border border-[#B7DDB5] text-[#1B3B18] px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
            <span className="font-semibold">{bankNotification}</span>
          </div>
          <button onClick={() => setBankNotification(null)} className="text-[#2D5A27] font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* 2. Key Performance Indicators (5 Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1: Gross Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] shadow-xs space-y-1 hover:border-[#2D5A27] transition-all">
          <div className="flex items-center justify-between text-xs text-[#75716B]">
            <span>कुल फसल बिक्री</span>
            <span className="p-1 rounded-md bg-[#FAF8F5] text-[#2D5A27]">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#2D2D2D] font-mono">
            ₹{(financialStats.grossSales || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#2D5A27] font-semibold flex items-center gap-1">
            <span>बिना बिचौलिए 100% मूल्य</span>
          </div>
        </div>

        {/* Metric 2: Total Sold Goods (बिका हुआ माल) */}
        <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] shadow-xs space-y-1 hover:border-[#2D5A27] transition-all">
          <div className="flex items-center justify-between text-xs text-[#75716B]">
            <span>कुल बिका हुआ माल</span>
            <span className="p-1 rounded-md bg-[#FAF8F5] text-[#D97706]">
              <Package className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#2D2D2D] font-mono">
            {(financialStats.totalSoldKg || 0).toLocaleString()} <span className="text-xs font-normal text-[#75716B]">kg</span>
          </div>
          <div className="text-[10px] text-[#5C5850]">
            {financialStats.totalOrders || 0} कुल ऑर्डर्स में से
          </div>
        </div>

        {/* Metric 3: Paid & Transferred to Bank */}
        <div className="bg-[#EBF5EA] p-3.5 rounded-xl border border-[#B7DDB5] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#2D5A27] font-semibold">
            <span>खाते में जमा पेआउट</span>
            <span className="p-1 rounded-md bg-white text-[#2D5A27] border border-[#B7DDB5]">
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#1B3B18] font-mono">
            ₹{(financialStats.totalPaidPayout || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#2D5A27] font-semibold">
            {financialStats.deliveredOrdersCount || 0} ऑर्डर्स का भुगतान सफल
          </div>
        </div>

        {/* Metric 4: Escrow Protected */}
        <div className="bg-[#FEF3C7] p-3.5 rounded-xl border border-[#FDE68A] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#92400E] font-semibold">
            <span>एस्क्रो में सुरक्षित</span>
            <span className="p-1 rounded-md bg-white text-[#D97706] border border-[#FDE68A]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#92400E] font-mono">
            ₹{(financialStats.totalEscrowHold || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#B45309]">
            डिलीवरी पर स्वतः रिलीज
          </div>
        </div>

        {/* Metric 5: Active Live Stock Remaining */}
        <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] shadow-xs space-y-1 col-span-2 sm:col-span-1 hover:border-[#2D5A27] transition-all">
          <div className="flex items-center justify-between text-xs text-[#75716B]">
            <span>बिक्री हेतु उपलब्ध स्टॉक</span>
            <span className="p-1 rounded-md bg-[#FAF8F5] text-emerald-600">
              <Store className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#2D2D2D] font-mono">
            {(financialStats.totalLiveStockKg || 0).toLocaleString()} <span className="text-xs font-normal text-[#75716B]">kg</span>
          </div>
          <div className="text-[10px] text-[#2D5A27] font-semibold">
            {farmerCrops.length} सक्रिय फसल लिस्टिंग्स
          </div>
        </div>
      </div>

      {/* 3. Dashboard Sub-tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#DCD7CC] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("listings")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "listings"
              ? "bg-[#2D5A27] text-white shadow-xs"
              : "bg-white text-[#5C5850] hover:bg-[#FAF8F5] border border-[#DCD7CC]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{language === "hi" ? "मेरी लिस्ट की हुई फसलें (My Produce)" : "My Listed Crops"} ({farmerCrops.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("orders")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "orders"
              ? "bg-[#2D5A27] text-white shadow-xs"
              : "bg-white text-[#5C5850] hover:bg-[#FAF8F5] border border-[#DCD7CC]"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{language === "hi" ? "प्राप्त ऑर्डर्स व बिका हुआ माल (Orders)" : "Orders & Sold Goods"} ({safeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("earnings")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "earnings"
              ? "bg-[#2D5A27] text-white shadow-xs"
              : "bg-white text-[#5C5850] hover:bg-[#FAF8F5] border border-[#DCD7CC]"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{language === "hi" ? "कुल कमाई, पेआउट व बैंक खाता (Payouts)" : "Earnings & Bank Status"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("insights")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "insights"
              ? "bg-[#2D5A27] text-white shadow-xs"
              : "bg-white text-[#5C5850] hover:bg-[#FAF8F5] border border-[#DCD7CC]"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{language === "hi" ? "बिक्री विश्लेषण व मंडी मांग (Analytics)" : "Demand Analytics"}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: MY LISTED CROPS & INVENTORY MANAGEMENT        */}
      {/* ======================================================== */}
      {activeSubTab === "listings" && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#DCD7CC] shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#75716B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === "hi" ? "फसल का नाम खोजें (उदा. गेहूं, टमाटर)..." : "Search crop by name..."}
                value={listingSearchQuery}
                onChange={(e) => setListingSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-[#75716B] font-semibold hidden md:inline">श्रेणी:</span>
              {[
                { id: "all", label: "सभी" },
                { id: "grains", label: "अनाज" },
                { id: "vegetables", label: "सब्जियां" },
                { id: "pulses", label: "दालें" },
                { id: "spices", label: "मसाले" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setListingCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    listingCategoryFilter === cat.id
                      ? "bg-[#2D5A27] text-white"
                      : "bg-[#FAF8F5] text-[#5C5850] hover:bg-[#EDE8DF] border border-[#DCD7CC]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <button
                onClick={onOpenNewListingModal}
                className="flex items-center gap-1 bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0 ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नई फसल जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Crop Listings Grid */}
          {filteredCrops.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#DCD7CC] p-10 text-center space-y-3">
              <Package className="w-12 h-12 text-[#75716B] mx-auto opacity-50" />
              <div className="font-bold text-sm text-[#2D2D2D]">कोई फसल नहीं मिली</div>
              <p className="text-xs text-[#75716B] max-w-sm mx-auto">
                आपके द्वारा खोजे गए नाम या श्रेणी में कोई फसल सूचीबद्ध नहीं है। नई फसल जोड़ने के लिए नीचे क्लिक करें।
              </p>
              <button
                onClick={onOpenNewListingModal}
                className="bg-[#2D5A27] text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>नई फसल लिस्ट करें</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCrops.map((crop) => {
                const benchmark = crop.mandiBenchmarkPrice;
                const isStockEditing = stockEditCropId === crop.id;
                const isPriceEditing = priceEditCropId === crop.id;

                // Calculate sold units for this specific crop
                const cropSoldOrders = safeOrders.filter((o) => o.cropListingId === crop.id || o.cropNameHi.includes(crop.titleHi.slice(0, 4)));
                const cropSoldQty = cropSoldOrders.reduce((sum, o) => sum + o.quantity, 0);
                const estimatedTotal = crop.availableStock + cropSoldQty;
                const soldPercentage = estimatedTotal > 0 ? Math.min(100, Math.round((cropSoldQty / estimatedTotal) * 100)) : 0;

                const isLowStock = crop.availableStock > 0 && crop.availableStock < 50;
                const isOutOfStock = crop.availableStock <= 0;

                return (
                  <div
                    key={crop.id}
                    className="bg-white rounded-2xl border border-[#DCD7CC] overflow-hidden shadow-xs hover:border-[#2D5A27] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header with Price & Badges */}
                      <div className="relative h-40 bg-[#EDE8DF]">
                        <img
                          src={crop.images[0]}
                          alt={crop.titleHi}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          {crop.isOrganic && (
                            <span className="bg-[#2D5A27] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                              <Leaf className="w-2.5 h-2.5 text-emerald-300" />
                              जैविक (Organic)
                            </span>
                          )}
                          {isOutOfStock ? (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                              स्टॉक समाप्त
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                              कम स्टॉक
                            </span>
                          ) : (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                              लाइव बिक्री पर
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-mono font-bold">
                          ₹{crop.pricePerUnit} / {crop.unit}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-sm text-[#2D2D2D] line-clamp-1">
                            {language === "hi" ? crop.titleHi : crop.titleEn}
                          </h3>
                          <div className="text-[11px] text-[#75716B] mt-0.5">
                            कटाई: {crop.harvestDate} | न्यूनतम आर्डर: {crop.minOrderQuantity} {crop.unit}
                          </div>
                        </div>

                        {/* Sold Produce vs Stock Progress Bar */}
                        <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DCD7CC] space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#5C5850]">बिका हुआ माल:</span>
                            <span className="font-bold text-[#2D5A27] font-mono">
                              {cropSoldQty} {crop.unit} बिका
                            </span>
                          </div>
                          <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#2D5A27] h-full rounded-full transition-all"
                              style={{ width: `${soldPercentage || 12}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#75716B]">
                            <span>उपलब्ध शेष: <strong className="text-[#2D2D2D] font-mono">{crop.availableStock} {crop.unit}</strong></span>
                            <span>{soldPercentage}% बिक्री पूर्ण</span>
                          </div>
                        </div>

                        {/* Mandi Benchmark Price Comparison */}
                        {benchmark && (
                          <div className="bg-[#EBF5EA] p-2 rounded-lg border border-[#B7DDB5] flex items-center justify-between text-[11px]">
                            <div className="text-[#1B3B18]">
                              <span>मंडी आढ़त भाव: </span>
                              <span className="line-through text-[#75716B] font-mono">₹{benchmark}</span>
                            </div>
                            <span className="font-bold text-[#2D5A27] font-mono bg-white px-1.5 py-0.5 rounded border border-[#B7DDB5]">
                              +₹{Math.max(0, crop.pricePerUnit - benchmark)}/{crop.unit} अधिक लाभ
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls Footer */}
                    <div className="p-3 bg-[#FAF8F5] border-t border-[#DCD7CC] space-y-2">
                      {/* Stock Edit Inline Mode */}
                      {isStockEditing ? (
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-[#5C5850]">नया उपलब्ध स्टॉक दर्ज करें:</div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={tempStockValue}
                              onChange={(e) => setTempStockValue(Number(e.target.value))}
                              className="w-full text-xs py-1 px-2 border border-[#DCD7CC] rounded-md bg-white font-mono font-bold"
                            />
                            <button
                              onClick={() => {
                                onUpdateStock(crop.id, tempStockValue);
                                setStockEditCropId(null);
                              }}
                              className="bg-[#2D5A27] text-white text-xs font-bold px-3 py-1 rounded-md"
                            >
                              सहेजें
                            </button>
                            <button
                              onClick={() => setStockEditCropId(null)}
                              className="bg-[#EDE8DF] text-[#5C5850] text-xs font-bold px-2 py-1 rounded-md"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : isPriceEditing ? (
                        /* Price Edit Inline Mode */
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-[#5C5850]">नया बिक्री भाव दर्ज करें (प्रति {crop.unit}):</div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={tempPriceValue}
                              onChange={(e) => setTempPriceValue(Number(e.target.value))}
                              className="w-full text-xs py-1 px-2 border border-[#DCD7CC] rounded-md bg-white font-mono font-bold"
                            />
                            <button
                              onClick={() => {
                                onUpdatePrice?.(crop.id, tempPriceValue);
                                setPriceEditCropId(null);
                              }}
                              className="bg-[#2D5A27] text-white text-xs font-bold px-3 py-1 rounded-md"
                            >
                              सहेजें
                            </button>
                            <button
                              onClick={() => setPriceEditCropId(null)}
                              className="bg-[#EDE8DF] text-[#5C5850] text-xs font-bold px-2 py-1 rounded-md"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Regular Quick Action Buttons */
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => {
                              setStockEditCropId(crop.id);
                              setTempStockValue(crop.availableStock);
                              setPriceEditCropId(null);
                            }}
                            className="flex items-center justify-center gap-1 bg-white hover:bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5] py-1.5 px-2 rounded-lg font-bold text-xs transition-colors"
                            title="स्टॉक अपडेट करें"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>स्टॉक</span>
                          </button>

                          <button
                            onClick={() => {
                              setPriceEditCropId(crop.id);
                              setTempPriceValue(crop.pricePerUnit);
                              setStockEditCropId(null);
                            }}
                            className="flex items-center justify-center gap-1 bg-white hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] py-1.5 px-2 rounded-lg font-bold text-xs transition-colors"
                            title="भाव बदलें"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>भाव</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`क्या आप ${crop.titleHi} को मार्केटप्लेस से हटाना चाहते हैं?`)) {
                                onDeleteListing?.(crop.id);
                              }
                            }}
                            className="flex items-center justify-center gap-1 bg-white hover:bg-red-50 text-[#DC2626] border border-red-200 py-1.5 px-2 rounded-lg font-bold text-xs transition-colors"
                            title="फसल हटाएं"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>हटाएं</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: RECEIVED ORDERS & SOLD PRODUCE MANAGEMENT     */}
      {/* ======================================================== */}
      {activeSubTab === "orders" && (
        <div className="space-y-4">
          {/* Order Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#DCD7CC] shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#75716B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ऑर्डर नंबर या फसल नाम खोजें..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg focus:outline-none focus:border-[#2D5A27]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "all", label: `सभी (${safeOrders.length})` },
                { id: "new", label: "पैक योग्य" },
                { id: "in_transit", label: "रास्ते में" },
                { id: "delivered", label: "डिलीवर व भुगतान" },
                { id: "cancelled", label: "रद्द" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setOrderStatusFilter(filter.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    orderStatusFilter === filter.id
                      ? "bg-[#2D5A27] text-white"
                      : "bg-[#FAF8F5] text-[#5C5850] hover:bg-[#EDE8DF] border border-[#DCD7CC]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#DCD7CC] p-10 text-center space-y-2">
              <Truck className="w-12 h-12 text-[#75716B] mx-auto opacity-50" />
              <div className="font-bold text-sm text-[#2D2D2D]">इस फ़िल्टर में कोई ऑर्डर नहीं है</div>
              <p className="text-xs text-[#75716B]">जैसे ही कोई खरीदार आपकी फसल खरीदेगा, उसका पिकअप ऑर्डर यहाँ दिखाई देगा।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isDelivered = order.status === "delivered";
                const isCancelled = order.status === "cancelled";
                const isPaid = order.paymentStatus === "paid";
                const isPacked = order.status === "packed_at_farm";
                const isNew = order.status === "order_placed";

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#DCD7CC] p-4 sm:p-5 shadow-xs space-y-4 hover:border-[#2D5A27] transition-all"
                  >
                    {/* Header: Order ID, Status, Sold Produce & Net Payout */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE8DF] pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-[#2D2D2D]">
                            ऑर्डर #{order.orderNumber}
                          </span>
                          <span className="text-xs text-[#75716B]">({order.orderDate})</span>
                          
                          {/* Order Status Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            isDelivered
                              ? "bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5]"
                              : isCancelled
                              ? "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]"
                              : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                          }`}>
                            {order.status === "order_placed"
                              ? "नया आर्डर प्राप्त (New Order)"
                              : order.status === "packed_at_farm"
                              ? "खेत पर पैक हुआ (Packed at Farm)"
                              : order.status === "in_transit"
                              ? "एग्री-वाहन रास्ते में है (In Transit)"
                              : order.status === "out_for_delivery"
                              ? "डिलीवरी के लिए रवाना"
                              : order.status === "delivered"
                              ? "सफलतापूर्वक डिलीवर (Delivered)"
                              : "रद्द"}
                          </span>
                        </div>

                        <div className="text-base font-bold text-[#2D2D2D] mt-1 flex items-center gap-2">
                          <span>🌾 बिका हुआ माल:</span>
                          <span className="text-[#2D5A27]">{order.cropNameHi}</span>
                          <span className="bg-[#EDE8DF] text-[#2D2D2D] text-xs font-mono px-2 py-0.5 rounded-md">
                            {order.quantity} {order.unit}
                          </span>
                        </div>
                      </div>

                      {/* Net Financial Payout Box */}
                      <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DCD7CC] text-right sm:min-w-[200px]">
                        <div className="text-[11px] text-[#75716B]">किसान शुद्ध पेआउट:</div>
                        <div className="text-lg font-extrabold text-[#2D5A27] font-mono">
                          ₹{(order.farmerPayout || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#75716B]">
                          (कुल ₹{order.cropSubtotal || 0} - 4% कमिशन ₹{order.platformCommission || 0})
                        </div>
                      </div>
                    </div>

                    {/* Details Grid: Payment Status, Driver Logistics & Buyer Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC]">
                      {/* Payment & Escrow Status */}
                      <div className="space-y-1">
                        <div className="text-[10px] text-[#75716B] font-semibold flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-[#2D5A27]" />
                          <span>भुगतान स्थिति (Payment Status):</span>
                        </div>
                        {isPaid ? (
                          <div>
                            <div className="font-bold text-[#2D5A27] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>बैंक खाते में क्रेडिट हो चुका है</span>
                            </div>
                            <div className="text-[10px] font-mono text-[#5C5850] mt-0.5">
                              UTR: {order.paymentTransactionId || "SBI-UTR-99201948214"}
                            </div>
                          </div>
                        ) : isCancelled ? (
                          <div className="font-bold text-[#DC2626]">
                            ऑर्डर रद्द (रिफंड प्रोसेस)
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-[#92400E] flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>सुरक्षित एस्क्रो में जमा (100% गारंटी)</span>
                            </div>
                            <div className="text-[10px] text-[#75716B] mt-0.5">
                              डिलीवरी पूर्ण होते ही 30 मिनट में रिलीज
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pickup Driver Details */}
                      <div className="space-y-1">
                        <div className="text-[10px] text-[#75716B] font-semibold flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#2D5A27]" />
                          <span>असाइन एग्री-ड्राइवर (Pickup Driver):</span>
                        </div>
                        <div className="font-bold text-[#2D2D2D]">
                          {order.driverName}
                        </div>
                        <div className="text-[11px] text-[#2D5A27] font-mono font-semibold">
                          📞 {order.driverPhone} ({order.vehicleNumber})
                        </div>
                      </div>

                      {/* Buyer Privacy Protected Destination */}
                      <div className="space-y-1">
                        <div className="text-[10px] text-[#75716B] font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-[#2D5A27]" />
                          <span>गंतव्य क्षेत्र (Buyer Privacy Protected):</span>
                        </div>
                        <div className="font-bold text-[#2D2D2D]">
                          {order.buyerAddress.split(",")[order.buyerAddress.split(",").length - 1] || "भोपाल क्लस्टर ज़ोन"}
                        </div>
                        <div className="text-[10px] text-[#75716B] italic">
                          *गोपनीयता नीति अनुसार ग्राहक फोन सुरक्षित
                        </div>
                      </div>
                    </div>

                    {/* Order Action Controls for Farmer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        {isNew && (
                          <button
                            onClick={() => onUpdateOrderStatus?.(order.id, "packed_at_farm")}
                            className="bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>माल पैक हो गया (Mark as Packed)</span>
                          </button>
                        )}

                        {isPacked && (
                          <button
                            onClick={() => onUpdateOrderStatus?.(order.id, "in_transit")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>ड्राइवर को माल सौंपा (Handed Over)</span>
                          </button>
                        )}

                        {isDelivered && (
                          <span className="text-xs text-[#2D5A27] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                            <span>डिलीवरी पूर्ण व सुरक्षित भुगतान संपन्न</span>
                          </span>
                        )}
                      </div>

                      {/* View Official Payout Receipt */}
                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="bg-white hover:bg-[#FAF8F5] text-[#2D2D2D] border border-[#DCD7CC] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>पेआउट रसीद देखें</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: EARNINGS, PAYOUT HISTORY & BANK MANAGEMENT    */}
      {/* ======================================================== */}
      {activeSubTab === "earnings" && (
        <div className="space-y-5">
          {/* Earnings Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-[#DCD7CC] shadow-xs space-y-1">
              <div className="text-xs text-[#75716B]">कुल फसल बिक्री (Gross Produce Sales):</div>
              <div className="text-2xl font-extrabold text-[#2D2D2D] font-mono">
                ₹{(financialStats.grossSales || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#2D5A27] font-semibold">100% बिचौलिया व आढ़त मुक्त</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#DCD7CC] shadow-xs space-y-1">
              <div className="text-xs text-[#75716B]">किसान डायरेक्ट कमिशन (Platform Fee 4%):</div>
              <div className="text-2xl font-extrabold text-[#D97706] font-mono">
                - ₹{(financialStats.platformFee || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#5C5850]">क्वालिटी जांच, तकनीक व लॉजिस्टिक्स सेवा</div>
            </div>

            <div className="bg-[#EBF5EA] p-4 rounded-2xl border border-[#B7DDB5] shadow-xs space-y-1">
              <div className="text-xs text-[#2D5A27] font-semibold">शुद्ध बैंक पेआउट (Total Transferred):</div>
              <div className="text-2xl font-extrabold text-[#1B3B18] font-mono">
                ₹{(financialStats.totalPaidPayout || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#2D5A27]">सीधे आपके बैंक खाते में जमा</div>
            </div>
          </div>

          {/* Zero Mandi Commission Comparison Banner */}
          <div className="bg-gradient-to-r from-[#1B3B18] to-[#2D5A27] text-white p-5 rounded-2xl border border-[#2D5A27] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-base text-white">
                  पारंपरिक मंडी आढ़त बनाम किसान डायरेक्ट बचत
                </h3>
              </div>
              <p className="text-xs text-[#D5E8D2] max-w-xl leading-relaxed">
                पारंपरिक मंडियों में 18% तक आढ़त, पल्लेदारी व वजन कटौती कटती है। किसान डायरेक्ट पर सीधे बेचकर आपने 
                लगभग <strong className="text-amber-300 text-sm font-mono font-bold">₹{(financialStats.farmerExtraProfitSaved || 0).toLocaleString()}</strong> की अतिरिक्त बचत की है!
              </p>
            </div>

            <button
              onClick={handleRequestInstantSettlement}
              className="bg-amber-400 hover:bg-amber-300 text-[#0F290D] px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-transform hover:scale-102 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>तुरंत पेआउट अनुरोध (Instant Payout)</span>
            </button>
          </div>

          {/* Linked Bank Account & UPI Details Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCD7CC] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE8DF] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2D5A27]" />
                  <span>जुड़ा हुआ बैंक खाता व UPI विवरण (Payout Settlement Account)</span>
                </h3>
                <p className="text-xs text-[#75716B] mt-0.5">
                  सभी फसलों का विक्रय मूल्य सीधे इसी खाते में स्वतः भेजा जाता है।
                </p>
              </div>

              <button
                onClick={() => setIsBankModalOpen(true)}
                className="bg-[#FAF8F5] hover:bg-[#EDE8DF] text-[#2D2D2D] border border-[#DCD7CC] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>बैंक / UPI बदलें</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC]">
                <div className="text-[10px] text-[#75716B]">खाताधारक का नाम:</div>
                <div className="font-bold text-[#2D2D2D] mt-0.5">{bankDetails.accountHolder}</div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC]">
                <div className="text-[10px] text-[#75716B]">बैंक का नाम व शाखा:</div>
                <div className="font-bold text-[#2D2D2D] mt-0.5">{bankDetails.bankName}</div>
                <div className="text-[10px] text-[#75716B]">{bankDetails.branch}</div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC]">
                <div className="text-[10px] text-[#75716B]">खाता संख्या व IFSC:</div>
                <div className="font-mono font-bold text-[#2D2D2D] mt-0.5">{bankDetails.accountNumber}</div>
                <div className="text-[10px] font-mono text-[#2D5A27] font-semibold">IFSC: {bankDetails.ifscCode}</div>
              </div>

              <div className="bg-[#EBF5EA] p-3 rounded-xl border border-[#B7DDB5]">
                <div className="text-[10px] text-[#2D5A27] font-semibold">प्राथमिक UPI VPA:</div>
                <div className="font-mono font-bold text-[#1B3B18] mt-0.5">{bankDetails.upiId}</div>
                <div className="text-[10px] text-[#2D5A27]">⚡ तुरंत IMPS / UPI क्रेडिट सक्रिय</div>
              </div>
            </div>
          </div>

          {/* Payout History Ledger Table */}
          <div className="bg-white rounded-2xl border border-[#DCD7CC] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#EDE8DF] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#2D2D2D]">
                  पेआउट स्टेटमेंट व लेन-देन इतिहास (Payout History Log)
                </h3>
                <p className="text-xs text-[#75716B]">पिछले सभी ऑर्डर्स का विस्तृत बैंक ट्रांसफर विवरण</p>
              </div>

              <button
                onClick={() => window.print()}
                className="text-xs text-[#2D5A27] font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>स्टेटमेंट प्रिंट करें</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#5C5850] font-semibold border-b border-[#EDE8DF]">
                  <tr>
                    <th className="p-3">ऑर्डर व तारीख</th>
                    <th className="p-3">बिका हुआ माल</th>
                    <th className="p-3 font-mono">ग्रॉस बिक्री</th>
                    <th className="p-3 font-mono">4% कमिशन</th>
                    <th className="p-3 font-mono text-[#2D5A27]">शुद्ध पेआउट</th>
                    <th className="p-3">भुगतान स्थिति</th>
                    <th className="p-3">UTR / रेफरेंस</th>
                    <th className="p-3 text-right">रसीद</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE8DF]">
                  {safeOrders.map((order) => {
                    const isDelivered = order.status === "delivered";
                    const isPaid = order.paymentStatus === "paid";

                    return (
                      <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="p-3">
                          <div className="font-mono font-bold text-[#2D2D2D]">{order.orderNumber}</div>
                          <div className="text-[10px] text-[#75716B]">{order.orderDate}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-[#2D2D2D]">{order.cropNameHi}</div>
                          <div className="text-[10px] text-[#5C5850]">{order.quantity} {order.unit}</div>
                        </td>

                        <td className="p-3 font-mono font-bold text-[#2D2D2D]">
                          ₹{order.cropSubtotal}
                        </td>

                        <td className="p-3 font-mono text-[#D97706]">
                          -₹{order.platformCommission}
                        </td>

                        <td className="p-3 font-mono font-extrabold text-[#2D5A27]">
                          ₹{order.farmerPayout}
                        </td>

                        <td className="p-3">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D5A27] bg-[#EBF5EA] px-2 py-0.5 rounded-full border border-[#B7DDB5]">
                              <CheckCircle2 className="w-3 h-3" />
                              खाते में जमा (Paid)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                              <Clock className="w-3 h-3" />
                              एस्क्रो होल्ड
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-mono text-[10px] text-[#5C5850]">
                          {order.paymentTransactionId || "SBI-UTR-99201948214"}
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="p-1.5 text-[#2D5A27] hover:bg-[#EBF5EA] rounded-md transition-colors inline-flex items-center"
                            title="रसीद देखें"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: SOLD PRODUCE ANALYTICS & MARKET DEMAND       */}
      {/* ======================================================== */}
      {activeSubTab === "insights" && (
        <div className="space-y-4">
          <div className="bg-[#FEF3C7] p-3.5 rounded-xl border border-[#FDE68A] text-[#92400E] text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <strong>💡 स्मार्ट मंडी मांग व मूल्य सुझाव:</strong> आपके नजदीकी सीहोर, भोपाल व इंदौर मंडियों में 
              शरबती गेहूं, बासमती धान और देशी टमाटर की मांग में 12% की तेजी दर्ज की गई है। सीधा बिक्री मूल्य अपडेट करके लाभ बढ़ाएं।
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Commodity Wise Sold Produce Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-[#DCD7CC] shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2D5A27]" />
                <span>फसलवार बिका हुआ माल व कमाई (Sold Produce Breakdown)</span>
              </h3>

              <div className="space-y-2.5">
                {[
                  { name: "शरबती देसी गेहूं", sold: "175 kg", revenue: 6650, progress: 70, color: "bg-[#2D5A27]" },
                  { name: "देसी लाल टमाटर", sold: "15 kg", revenue: 360, progress: 20, color: "bg-amber-600" },
                  { name: "जैविक पीली सरसों", sold: "40 kg", revenue: 2450, progress: 45, color: "bg-emerald-600" }
                ].map((item, i) => (
                  <div key={i} className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2D2D2D]">{item.name}</span>
                      <span className="font-bold text-[#2D5A27] font-mono">₹{(item.revenue || 0).toLocaleString()} ({item.sold})</span>
                    </div>
                    <div className="w-full bg-[#EDE8DF] h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Benchmark APMC Trends */}
            <div className="bg-white p-4 rounded-2xl border border-[#DCD7CC] shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-[#2D2D2D] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2D5A27]" />
                <span>नजदीकी मंडी दैनिक भाव ट्रेंड (Benchmark APMC Rates)</span>
              </h3>

              <div className="space-y-2.5">
                {safeMandiRates.slice(0, 3).map((rate) => (
                  <div key={rate.id} className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#2D2D2D]">{rate.cropNameHi}</div>
                      <div className="text-[10px] text-[#75716B]">{rate.marketName} ({rate.district})</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-[#2D5A27] font-mono">₹{rate.currentPrice}/Qtl</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        {rate.trend === "up" ? "▲ मांग में तेजी" : "● भाव स्थिर"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: OFFICIAL DIGITAL PAYOUT RECEIPT / INVOICE SLIP  */}
      {/* ======================================================== */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#DCD7CC] shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-[#1B3B18] text-white p-4 flex items-center justify-between border-b border-[#2D5A27]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base">किसान डायरेक्ट - पेआउट रसीद</h3>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-white/70 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-5 space-y-4 text-xs" id="payout-receipt-printable">
              {/* Receipt Header Badge */}
              <div className="text-center border-b border-dashed border-[#DCD7CC] pb-3 space-y-0.5">
                <div className="text-[11px] font-extrabold tracking-widest text-[#2D5A27] uppercase">
                  KISAN DIRECT SETTLEMENT INVOICE
                </div>
                <div className="font-mono font-bold text-sm text-[#2D2D2D]">
                  रसीद सं: REC-{selectedReceiptOrder.orderNumber}
                </div>
                <div className="text-[10px] text-[#75716B]">
                  तारीख: {selectedReceiptOrder.orderDate} | स्थिति: {selectedReceiptOrder.paymentStatus === "paid" ? "✅ सेटल्ड" : "🟡 एस्क्रो सुरक्षित"}
                </div>
              </div>

              {/* Farmer & Buyer Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC]">
                <div>
                  <div className="text-[10px] text-[#75716B] font-semibold">विक्रेता (Farmer):</div>
                  <div className="font-bold text-[#2D2D2D]">{bankDetails.accountHolder}</div>
                  <div className="text-[10px] text-[#5C5850]">सीहोर क्लस्टर, MP</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#75716B] font-semibold">भुगतान माध्यम (Mode):</div>
                  <div className="font-bold text-[#2D2D2D]">IMPS / Direct UPI</div>
                  <div className="text-[10px] font-mono text-[#2D5A27]">{bankDetails.bankName.split(" ")[0]} (****4819)</div>
                </div>
              </div>

              {/* Itemized Calculation */}
              <div className="border border-[#DCD7CC] rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#DCD7CC] text-[#5C5850]">
                    <tr>
                      <th className="p-2.5 text-left">बिका हुआ माल (Produce)</th>
                      <th className="p-2.5 text-center">मात्रा</th>
                      <th className="p-2.5 text-right">रकम</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE8DF]">
                    <tr>
                      <td className="p-2.5 font-bold text-[#2D2D2D]">{selectedReceiptOrder.cropNameHi}</td>
                      <td className="p-2.5 text-center font-mono">{selectedReceiptOrder.quantity} {selectedReceiptOrder.unit}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#2D2D2D]">₹{selectedReceiptOrder.cropSubtotal}</td>
                    </tr>
                    <tr className="bg-[#FAF8F5]/50 text-[#75716B]">
                      <td colSpan={2} className="p-2.5">किसान डायरेक्ट प्लेटफार्म सुविधा शुल्क (4%)</td>
                      <td className="p-2.5 text-right font-mono text-[#D97706]">-₹{selectedReceiptOrder.platformCommission}</td>
                    </tr>
                    <tr className="bg-[#EBF5EA] font-extrabold text-[#1B3B18]">
                      <td colSpan={2} className="p-2.5 text-sm">किसान शुद्ध जमा राशि (Net Payout)</td>
                      <td className="p-2.5 text-right font-mono text-base text-[#2D5A27]">₹{selectedReceiptOrder.farmerPayout}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bank Transfer UTR & QR Stamp */}
              <div className="flex items-center justify-between bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC]">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-[#75716B]">बैंक UTR रेफरेंस नंबर:</div>
                  <div className="font-mono font-bold text-[#2D5A27] text-xs">
                    {selectedReceiptOrder.paymentTransactionId || "SBI-UTR-99201948214"}
                  </div>
                  <div className="text-[10px] text-[#75716B]">0% मंडी आढ़त कटौती गारंटी</div>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-white border border-[#DCD7CC] rounded-lg flex items-center justify-center p-1">
                    <QrCode className="w-full h-full text-[#2D2D2D]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#DCD7CC] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-3.5 py-1.5 bg-[#EDE8DF] hover:bg-[#E2DDD3] text-[#2D2D2D] rounded-lg font-bold text-xs transition-colors"
              >
                बंद करें
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#2D5A27] hover:bg-[#234A1F] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट / डाउनलोड</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: BANK & UPI DETAILS MANAGEMENT MODAL             */}
      {/* ======================================================== */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#DCD7CC] shadow-2xl overflow-hidden my-auto">
            <div className="bg-[#1B3B18] text-white p-4 flex items-center justify-between border-b border-[#2D5A27]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base">पेआउट बैंक व UPI खाता प्रबंधित करें</h3>
              </div>
              <button onClick={() => setIsBankModalOpen(false)} className="text-white/70 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsBankModalOpen(false);
                setBankNotification("✅ बैंक व UPI विवरण सफलतापूर्वक अपडेट कर दिया गया है।");
                setTimeout(() => setBankNotification(null), 4000);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-[#5C5850] font-bold mb-1">खाताधारक का पूरा नाम (नाम पासबुक अनुसार):</label>
                <input
                  type="text"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  required
                  className="w-full p-2 border border-[#DCD7CC] rounded-lg bg-[#FAF8F5] font-semibold text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div>
                <label className="block text-[#5C5850] font-bold mb-1">बैंक का नाम:</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  required
                  className="w-full p-2 border border-[#DCD7CC] rounded-lg bg-[#FAF8F5] font-semibold text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#5C5850] font-bold mb-1">बैंक खाता संख्या:</label>
                  <input
                    type="text"
                    value={bankDetails.rawAccountNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBankDetails({
                        ...bankDetails,
                        rawAccountNumber: val,
                        accountNumber: val.length > 4 ? `XXXX-XXXX-${val.slice(-4)}` : val
                      });
                    }}
                    required
                    className="w-full p-2 border border-[#DCD7CC] rounded-lg bg-[#FAF8F5] font-mono font-bold text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C5850] font-bold mb-1">IFSC कोड:</label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    required
                    className="w-full p-2 border border-[#DCD7CC] rounded-lg bg-[#FAF8F5] font-mono font-bold text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5C5850] font-bold mb-1">प्राथमिक UPI VPA (उदा. PhonePe/GPay/BHIM):</label>
                <input
                  type="text"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                  required
                  className="w-full p-2 border border-[#DCD7CC] rounded-lg bg-[#FAF8F5] font-mono font-bold text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="p-3 bg-[#EBF5EA] rounded-xl border border-[#B7DDB5] text-[11px] text-[#1B3B18] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>यह खाता 100% एन्क्रिप्टेड व भारतीय रिजर्व बैंक (RBI) मानकों अनुसार सुरक्षित है।</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 bg-[#EDE8DF] text-[#2D2D2D] rounded-lg font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D5A27] hover:bg-[#234A1F] text-white rounded-lg font-bold shadow-xs"
                >
                  सहेजें व सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
