import React, { useState, useMemo } from "react";
import { MandiRate, Language, CropListing } from "../types";
import { getLocalizedCropName, getLocalizedUnit } from "../utils/languageUtils";
import { 
  X, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldCheck, 
  Bell, 
  Sparkles, 
  Truck, 
  Calendar, 
  Building2, 
  Layers, 
  Share2, 
  ExternalLink,
  Info,
  Scale,
  ShoppingBag,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Search,
  Zap,
  Award,
  ChevronRight,
  TrendingDownIcon
} from "lucide-react";

interface MandiDetailModalProps {
  rate: MandiRate | null;
  allRates: MandiRate[];
  crops: CropListing[];
  language: Language;
  onClose: () => void;
  onSetPriceAlert: (cropName: string, price: number) => void;
  onSelectCropListing?: (crop: CropListing) => void;
  onSelectMandiRateId?: (id: string) => void;
  onNavigateToTab?: (tab: "market" | "mandi") => void;
}

export const MandiDetailModal: React.FC<MandiDetailModalProps> = ({
  rate,
  allRates,
  crops,
  language,
  onClose,
  onSetPriceAlert,
  onSelectCropListing,
  onSelectMandiRateId,
  onNavigateToTab,
}) => {
  if (!rate) return null;

  const isHindi = language === "hi";

  // Filter & Search states for the all-mandi matrix
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("all");
  const [mandiSearchQuery, setMandiSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"price_desc" | "price_asc" | "arrival_desc" | "name">("price_desc");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Extract core keywords from the selected crop name to find all mandis across India for this crop
  const safeCropEn = (rate.cropNameEn || "").split(" ")[0].toLowerCase();
  const safeCropHi = (rate.cropNameHi || "").split(" ")[0];

  // Helper keyword mappings to accurately group similar commodities
  const getCropKeywords = (nameEn: string, nameHi: string): string[] => {
    const en = nameEn.toLowerCase();
    const hi = nameHi;
    if (en.includes("wheat") || hi.includes("गेहूं")) return ["wheat", "गेहूं"];
    if (en.includes("paddy") || en.includes("rice") || en.includes("basmati") || hi.includes("धान") || hi.includes("चावल") || hi.includes("बासमती")) return ["paddy", "rice", "basmati", "धान", "चावल", "बासमती"];
    if (en.includes("onion") || hi.includes("प्याज")) return ["onion", "प्याज"];
    if (en.includes("tomato") || hi.includes("टमाटर")) return ["tomato", "टमाटर"];
    if (en.includes("potato") || hi.includes("आलू")) return ["potato", "आलू"];
    if (en.includes("mustard") || en.includes("sarson") || hi.includes("सरसों")) return ["mustard", "sarson", "सरसों", "खल"];
    if (en.includes("soybean") || hi.includes("सोयाबीन")) return ["soybean", "सोयाबीन"];
    if (en.includes("cotton") || en.includes("narma") || hi.includes("कपास") || hi.includes("नरमा")) return ["cotton", "narma", "कपास", "नरमा"];
    if (en.includes("chana") || en.includes("gram") || en.includes("chickpea") || hi.includes("चना")) return ["chana", "gram", "chickpea", "चना"];
    if (en.includes("moong") || hi.includes("मूंग")) return ["moong", "मूंग"];
    if (en.includes("tur") || en.includes("arhar") || hi.includes("तुअर") || hi.includes("अरहर")) return ["tur", "arhar", "तुअर", "अरहर"];
    if (en.includes("urad") || hi.includes("उड़द")) return ["urad", "उड़द"];
    if (en.includes("garlic") || hi.includes("लहसुन")) return ["garlic", "लहसुन"];
    if (en.includes("jeera") || en.includes("cumin") || hi.includes("जीरा")) return ["jeera", "cumin", "जीरा"];
    if (en.includes("apple") || hi.includes("सेब")) return ["apple", "सेब"];
    if (en.includes("maize") || en.includes("corn") || hi.includes("मक्का")) return ["maize", "corn", "मक्का"];
    if (en.includes("chilli") || hi.includes("मिर्च")) return ["chilli", "मिर्च"];
    if (en.includes("ginger") || hi.includes("अदरक")) return ["ginger", "अदरक"];
    if (en.includes("turmeric") || hi.includes("हल्दी")) return ["turmeric", "हल्दी"];
    return [safeCropEn, safeCropHi];
  };

  const cropKeywords = getCropKeywords(rate.cropNameEn, rate.cropNameHi);

  // Find ALL mandis in India matching this commodity
  const allMandisForThisCrop = useMemo(() => {
    const safeList = allRates || [];
    const directMatches = safeList.filter((r) => {
      if (!r) return false;
      const rEn = (r.cropNameEn || "").toLowerCase();
      const rHi = r.cropNameHi || "";
      const matchesKeyword = cropKeywords.some((kw) => kw && (rEn.includes(kw.toLowerCase()) || rHi.includes(kw)));
      return matchesKeyword;
    });

    // If direct matches are fewer than 3, backfill with items from the same category
    if (directMatches.length < 3) {
      const categoryMatches = safeList.filter(
        (r) => r && r.commodityCategory === rate.commodityCategory && !directMatches.some(dm => dm.id === r.id)
      );
      return [...directMatches, ...categoryMatches];
    }
    return directMatches;
  }, [allRates, rate]);

  // Available States from the matching mandis for filtering
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    allMandisForThisCrop.forEach((m) => {
      if (m.state) states.add(m.state);
    });
    return Array.from(states);
  }, [allMandisForThisCrop]);

  // Filter and Sort the Mandis
  const filteredMandis = useMemo(() => {
    let list = [...allMandisForThisCrop];

    if (selectedStateFilter !== "all") {
      list = list.filter((m) => m.state === selectedStateFilter);
    }

    if (mandiSearchQuery.trim()) {
      const q = mandiSearchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          (m.marketName || "").toLowerCase().includes(q) ||
          (m.district || "").toLowerCase().includes(q) ||
          (m.state || "").toLowerCase().includes(q) ||
          (m.cropNameHi || "").toLowerCase().includes(q) ||
          (m.cropNameEn || "").toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "price_desc") return b.currentPrice - a.currentPrice;
      if (sortBy === "price_asc") return a.currentPrice - b.currentPrice;
      if (sortBy === "arrival_desc") return (b.arrivalVolumeQuintals || 0) - (a.arrivalVolumeQuintals || 0);
      if (sortBy === "name") return (a.marketName || "").localeCompare(b.marketName || "");
      return 0;
    });

    return list;
  }, [allMandisForThisCrop, selectedStateFilter, mandiSearchQuery, sortBy]);

  // Highest and Lowest price mandis across India for this crop
  const highestPriceMandi = useMemo(() => {
    if (allMandisForThisCrop.length === 0) return rate;
    return [...allMandisForThisCrop].sort((a, b) => b.currentPrice - a.currentPrice)[0];
  }, [allMandisForThisCrop, rate]);

  const lowestPriceMandi = useMemo(() => {
    if (allMandisForThisCrop.length === 0) return rate;
    return [...allMandisForThisCrop].sort((a, b) => a.currentPrice - b.currentPrice)[0];
  }, [allMandisForThisCrop, rate]);

  const nationalAvgPrice = useMemo(() => {
    if (allMandisForThisCrop.length === 0) return rate.currentPrice;
    const total = allMandisForThisCrop.reduce((sum, item) => sum + item.currentPrice, 0);
    return Math.round(total / allMandisForThisCrop.length);
  }, [allMandisForThisCrop, rate]);

  const totalNationalArrivals = useMemo(() => {
    return allMandisForThisCrop.reduce((sum, item) => sum + (item.arrivalVolumeQuintals || 0), 0);
  }, [allMandisForThisCrop]);

  // Find farmers selling similar crop directly
  const directFarmerListings = useMemo(() => {
    return (crops || []).filter((c) => {
      if (!c) return false;
      const matchesCat = c.category === rate.commodityCategory;
      const matchesHi = c.titleHi && c.titleHi.includes(safeCropHi);
      const matchesEn = c.titleEn && c.titleEn.toLowerCase().includes(safeCropEn);
      return matchesCat || matchesHi || matchesEn;
    }).slice(0, 3);
  }, [crops, rate, safeCropHi, safeCropEn]);

  // Calculate MSP difference
  const mspPriceVal = rate.mspPrice || 0;
  const mspDiff = mspPriceVal > 0 ? (rate.currentPrice || 0) - mspPriceVal : 0;
  const mspPercent = mspPriceVal > 0 ? ((mspDiff / mspPriceVal) * 100).toFixed(1) : "0.0";

  // Find max and min price in history for chart scaling
  const historyPrices = (rate.history || []).map((h) => h.price);
  const minHist = Math.min(...(historyPrices.length ? historyPrices : [rate.minPrice]), rate.minPrice);
  const maxHist = Math.max(...(historyPrices.length ? historyPrices : [rate.maxPrice]), rate.maxPrice);
  const priceRange = maxHist - minHist || 100;

  const handleShare = () => {
    const mandiListSummary = allMandisForThisCrop
      .slice(0, 5)
      .map((m) => `• ${m.marketName} (${m.district}): ₹${m.currentPrice}/Qtl`)
      .join("\n");

    const text = `📢 *लाइव मंडी भाव रिपोर्ट (Live Mandi Update)*\n🌾 फसल: ${rate.cropNameHi}\n🏛️ वर्तमान मंडी: ${rate.marketName} (${rate.state})\n💰 लाइव मॉडल भाव: ₹${rate.currentPrice}/क्विंटल (₹${(rate.currentPrice/100).toFixed(1)}/किग्रा)\n📊 रेंज: ₹${rate.minPrice} - ₹${rate.maxPrice}\n⚖️ सरकारी MSP: ₹${rate.mspPrice}\n\n🏆 *अन्य प्रमुख मंडियों में आज का भाव:*\n${mandiListSummary}\n\n📲 किसान डायरेक्ट पर लाइव अपडेट देखें: https://kisan-direct.app`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: `मंडी भाव - ${rate.cropNameHi}`, text }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-[#E0D8C3] overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#182F15] via-[#24461F] to-[#1E3B1A] text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-2 rounded-full transition-colors z-10"
            title={isHindi ? "बंद करें" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2 pr-12">
            <span className="bg-[#86EFAC]/20 text-[#86EFAC] border border-[#86EFAC]/50 px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86EFAC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#86EFAC]"></span>
              </span>
              {isHindi ? "🔴 लाइव राष्ट्रीय APMC फ्लोर रिपोर्ट" : "🔴 Live National APMC Floor Report"}
            </span>

            <span className="bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {rate.variety}
            </span>

            <span className="bg-[#FFA07A]/20 text-[#FFA07A] border border-[#FFA07A]/40 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {rate.commodityCategory.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{getLocalizedCropName(rate, language)}</span>
                {rate.isRealtimeTicking && (
                  <span className="text-[10px] bg-[#86EFAC] text-[#182F15] font-black px-2 py-0.5 rounded-full animate-bounce">
                    ⚡ लाइव अपडेट
                  </span>
                )}
              </h2>
              
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-[#D1E7CD] mt-1.5">
                <div className="flex items-center gap-1 font-bold text-[#86EFAC]">
                  <Building2 className="w-4 h-4 text-[#86EFAC]" />
                  <span>{rate.marketName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#FFA07A]" />
                  <span>{rate.district}, {rate.state}</span>
                </div>
                <div className="flex items-center gap-1 text-xs opacity-90">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isHindi ? "ताज़ा सिंक:" : "Synced:"} {rate.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isCopied
                    ? "bg-[#86EFAC] text-[#182F15] border-[#86EFAC]"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                }`}
                title={isHindi ? "व्हाट्सएप पर शेयर करें" : "Share on WhatsApp"}
              >
                <Share2 className={`w-3.5 h-3.5 ${isCopied ? "text-[#182F15]" : "text-[#86EFAC]"}`} />
                <span>{isCopied ? (isHindi ? "कॉपी हुआ! ✓" : "Copied! ✓") : (isHindi ? "शेयर करें" : "Share")}</span>
              </button>

              <button
                onClick={() => onSetPriceAlert(rate.cropNameHi, rate.currentPrice)}
                className="px-3 py-1.5 rounded-xl bg-[#86EFAC] hover:bg-[#A3F7C2] text-[#182F15] text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
                title={isHindi ? "भाव अलर्ट सेट करें" : "Set Price Alert"}
              >
                <Bell className="w-3.5 h-3.5 text-[#182F15]" />
                <span>{isHindi ? "अलर्ट सेट करें" : "Set Alert"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FAF8F5]">
          
          {/* Key Price Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Modal Price */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-[#2D5A27]/20 shadow-sm col-span-2 sm:col-span-1 relative overflow-hidden">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>{isHindi ? "मॉडल / मुख्य भाव" : "Modal Price"}</span>
                <span className="text-[10px] bg-[#E8F3E5] text-[#2D5A27] px-1.5 py-0.2 rounded font-bold">
                  {rate.district}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#182F15]">
                ₹{(rate.currentPrice || 0).toLocaleString("en-IN")}
                <span className="text-xs font-normal text-[#666] ml-1">/क्विं.</span>
              </div>
              <div className="text-xs text-[#2D5A27] font-bold mt-1 flex items-center justify-between">
                <span>≈ ₹{((rate.currentPrice || 0) / 100).toFixed(1)} / किग्रा</span>
                <span className="text-[10px] text-[#777]">100 किग्रा = 1 क्विं.</span>
              </div>
            </div>

            {/* Min - Max Range */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E0D8C3] shadow-sm">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1">
                {isHindi ? "न्यूनतम - उच्चतम भाव" : "Min - Max Range"}
              </div>
              <div className="text-base sm:text-lg font-black text-[#2D2D2D]">
                ₹{(rate.minPrice || 0).toLocaleString("en-IN")} - ₹{(rate.maxPrice || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#888] mt-1">
                {isHindi ? "गुणवत्ता ग्रेड के अनुसार" : "Based on quality grade"}
              </div>
            </div>

            {/* 24h Trend */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E0D8C3] shadow-sm">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1">
                {isHindi ? "24 घंटे का बदलाव" : "24h Price Change"}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {rate.trend === "up" ? (
                  <div className="flex items-center gap-1 text-[#2D5A27] font-black text-lg">
                    <TrendingUp className="w-5 h-5 text-[#2D5A27]" />
                    +{rate.changePercentage}%
                  </div>
                ) : rate.trend === "down" ? (
                  <div className="flex items-center gap-1 text-[#D9381E] font-black text-lg">
                    <TrendingDown className="w-5 h-5 text-[#D9381E]" />
                    {rate.changePercentage}%
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[#666] font-black text-lg">
                    <Minus className="w-5 h-5 text-[#666]" />
                    0.0% (स्थिर)
                  </div>
                )}
              </div>
              <div className="text-xs text-[#666] mt-0.5">
                {isHindi ? `कल का भाव: ₹${rate.previousPrice || 0}` : `Yesterday: ₹${rate.previousPrice || 0}`}
              </div>
            </div>

            {/* MSP Comparison */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E0D8C3] shadow-sm">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#E76F51]" />
                <span>{isHindi ? "सरकारी MSP" : "Govt MSP"}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-[#2D2D2D]">
                ₹{(rate.mspPrice || 0).toLocaleString("en-IN")}
                <span className="text-xs font-normal text-[#666] ml-1">/क्विं.</span>
              </div>
              <div className={`text-xs font-bold mt-1 ${mspDiff >= 0 ? "text-[#2D5A27]" : "text-[#D9381E]"}`}>
                {rate.mspPrice ? (mspDiff >= 0 ? `+₹${mspDiff} (MSP से ${mspPercent}% ऊपर)` : `-₹${Math.abs(mspDiff)} (MSP से कम)`) : "MSP उपलब्ध नहीं"}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 🌟 ALL-INDIA MANDI LIVE RATE MATRIX (सभी मंडियों में लाइव भाव तुलना) */}
          {/* ========================================================================= */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#2D5A27]/30 shadow-md">
            
            {/* Section Header with Live Pulse */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E0D8C3]">
              <div>
                <h3 className="text-lg font-black text-[#182F15] flex items-center gap-2">
                  <span className="p-1.5 bg-[#182F15] text-[#86EFAC] rounded-lg">
                    <Layers className="w-5 h-5" />
                  </span>
                  <span>{isHindi ? `अखिल भारत में ${rate.cropNameHi.split(" ")[0]} के लाइव मंडी भाव` : `All-India Live Mandi Rates for ${rate.cropNameEn.split(" ")[0]}`}</span>
                  <span className="text-xs bg-[#E8F3E5] text-[#2D5A27] font-bold px-2 py-0.5 rounded-full border border-[#2D5A27]/20">
                    {allMandisForThisCrop.length} {isHindi ? "मंडियां सक्रिय" : "Active Mandis"}
                  </span>
                </h3>
                <p className="text-xs text-[#666] mt-1">
                  {isHindi ? "देश की विभिन्न मंडियों के भाव देखें, तुलना करें और सबसे अच्छे भाव वाली मंडी चुनें। किसी भी मंडी पर क्लिक करके उसका विवरण देखें।" : "Compare real-time prices across state APMC yards to find the highest paying mandi."}
                </p>
              </div>

              {/* Real-time Indicator */}
              <div className="flex items-center gap-1.5 bg-[#F0FDF4] px-3 py-1.5 rounded-xl border border-[#86EFAC] shrink-0 self-start sm:self-auto">
                <Zap className="w-4 h-4 text-[#2D5A27] animate-pulse" />
                <span className="text-xs font-bold text-[#182F15]">
                  {isHindi ? "🔴 लाइव राष्ट्रीय ऑटो-अपडेट" : "🔴 Live Auto-Syncing"}
                </span>
              </div>
            </div>

            {/* National Summary Arbitrage Gain Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              {/* Highest Price Mandi */}
              <div 
                onClick={() => onSelectMandiRateId && onSelectMandiRateId(highestPriceMandi.id)}
                className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] p-3.5 rounded-xl border border-[#86EFAC] shadow-sm cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="text-[11px] font-bold text-[#2D5A27] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#2D5A27]" />
                    {isHindi ? "🏆 सर्वोच्च भाव वाली मंडी" : "Highest Price Mandi"}
                  </span>
                  <span className="text-[10px] bg-[#2D5A27] text-white px-1.5 py-0.2 rounded font-bold">बेस्ट भाव</span>
                </div>
                <div className="text-sm font-black text-[#182F15] mt-1 group-hover:text-[#2D5A27] transition-colors">
                  {highestPriceMandi.marketName}
                </div>
                <div className="text-xs text-[#666] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E76F51]" />
                  <span>{highestPriceMandi.district}, {highestPriceMandi.state}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between pt-1.5 border-t border-[#86EFAC]/40">
                  <span className="text-lg font-black text-[#2D5A27]">
                    ₹{(highestPriceMandi?.currentPrice || 0).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-[#666]">/क्विं.</span>
                  </span>
                  {(highestPriceMandi?.currentPrice || 0) > (rate.currentPrice || 0) && (
                    <span className="text-xs font-bold text-[#2D5A27] bg-white px-2 py-0.5 rounded-full shadow-xs border border-[#86EFAC]">
                      +₹{(highestPriceMandi?.currentPrice || 0) - (rate.currentPrice || 0)} अधिक मुनाफा
                    </span>
                  )}
                </div>
              </div>

              {/* Lowest Price Mandi */}
              <div 
                onClick={() => onSelectMandiRateId && lowestPriceMandi?.id && onSelectMandiRateId(lowestPriceMandi.id)}
                className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#ECE5D8] shadow-sm cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider flex items-center justify-between">
                  <span>{isHindi ? "📉 न्यूनतम भाव वाली मंडी" : "Lowest Price Mandi"}</span>
                </div>
                <div className="text-sm font-bold text-[#182F15] mt-1 group-hover:text-[#2D5A27] transition-colors">
                  {lowestPriceMandi?.marketName || "-"}
                </div>
                <div className="text-xs text-[#666] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E76F51]" />
                  <span>{lowestPriceMandi?.district || "-"}, {lowestPriceMandi?.state || "-"}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between pt-1.5 border-t border-[#E0D8C3]">
                  <span className="text-lg font-black text-[#666]">
                    ₹{(lowestPriceMandi?.currentPrice || 0).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-[#888]">/क्विं.</span>
                  </span>
                  <span className="text-xs text-[#888]">
                    रेंज: ₹{lowestPriceMandi?.minPrice || 0} - ₹{lowestPriceMandi?.maxPrice || 0}
                  </span>
                </div>
              </div>

              {/* All-India Average & Total Arrivals */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#ECE5D8] shadow-sm">
                <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider flex items-center justify-between">
                  <span>{isHindi ? "📊 अखिल भारतीय औसत" : "National All-India Avg"}</span>
                  <span className="text-[10px] bg-[#E8F3E5] text-[#2D5A27] px-1.5 py-0.2 rounded font-bold">औसत भाव</span>
                </div>
                <div className="text-xl font-black text-[#182F15] mt-1">
                  ₹{(nationalAvgPrice || 0).toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-[#666]">/क्विं.</span>
                </div>
                <div className="text-xs text-[#666] mt-2 pt-1.5 border-t border-[#E0D8C3] flex items-center justify-between">
                  <span>कुल राष्ट्रीय आवक:</span>
                  <span className="font-bold text-[#182F15]">{(totalNationalArrivals || 0).toLocaleString("en-IN")} क्विंटल</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Controls for Mandis */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#ECE5D8]">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#888] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={mandiSearchQuery}
                  onChange={(e) => setMandiSearchQuery(e.target.value)}
                  placeholder={isHindi ? "मंडी, जिला या राज्य खोजें..." : "Search mandi or district..."}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#D1C9B8] bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                />
              </div>

              {/* State Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#666]" />
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#D1C9B8] bg-white text-[#182F15] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                >
                  <option value="all">{isHindi ? "सभी राज्य (All States)" : "All States"}</option>
                  {availableStates.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#666]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-[#D1C9B8] bg-white text-[#182F15] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                >
                  <option value="price_desc">{isHindi ? "भाव: अधिक से कम" : "Price: High to Low"}</option>
                  <option value="price_asc">{isHindi ? "भाव: कम से अधिक" : "Price: Low to High"}</option>
                  <option value="arrival_desc">{isHindi ? "आवक: सबसे ज्यादा" : "Arrivals: High to Low"}</option>
                  <option value="name">{isHindi ? "मंडी नाम (A-Z)" : "Mandi Name (A-Z)"}</option>
                </select>
              </div>
            </div>

            {/* Interactive Mandis List / Table */}
            <div className="space-y-2.5">
              {filteredMandis.map((mandi) => {
                const isCurrentSelected = mandi.id === rate.id;
                const isHighest = mandi.id === highestPriceMandi.id;
                const diffFromCurrent = mandi.currentPrice - rate.currentPrice;

                return (
                  <div
                    key={mandi.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrentSelected
                        ? "bg-[#F0FDF4] border-2 border-[#2D5A27] shadow-md ring-1 ring-[#2D5A27]/30"
                        : "bg-[#FAF8F5] hover:bg-white border-[#E0D8C3] hover:border-[#2D5A27]/40 shadow-xs"
                    }`}
                  >
                    {/* Left Info */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isCurrentSelected ? "bg-[#2D5A27] text-white" : "bg-[#EAE4D5] text-[#182F15]"}`}>
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-black text-[#182F15] text-sm sm:text-base">
                            {mandi.marketName}
                          </span>

                          {isCurrentSelected && (
                            <span className="text-[10px] bg-[#2D5A27] text-white font-black px-2 py-0.5 rounded-full">
                              {isHindi ? "वर्तमान देख रहे हैं" : "Currently Viewing"}
                            </span>
                          )}

                          {isHighest && (
                            <span className="text-[10px] bg-[#FEF08A] text-[#854D0E] font-black px-2 py-0.5 rounded-full border border-[#FACC15] flex items-center gap-0.5">
                              <Award className="w-3 h-3" />
                              {isHindi ? "सर्वोच्च भाव" : "Top Price"}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#666] mt-1">
                          <span className="flex items-center gap-1 font-semibold text-[#182F15]">
                            <MapPin className="w-3 h-3 text-[#E76F51]" />
                            {mandi.district}, {mandi.state}
                          </span>
                          <span className="text-[#AAA]">•</span>
                          <span>किस्म: <strong className="text-[#333]">{mandi.variety}</strong></span>
                          <span className="text-[#AAA]">•</span>
                          <span>दैनिक आवक: <strong className="text-[#2D5A27]">{(mandi.arrivalVolumeQuintals || 0).toLocaleString("en-IN")} क्विंटल</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE4D5]">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl sm:text-2xl font-black text-[#182F15]">
                            ₹{(mandi.currentPrice || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs font-semibold text-[#666]">/क्विं.</span>

                          {/* Trend */}
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                            mandi.trend === "up" 
                              ? "bg-[#DCFCE7] text-[#166534]" 
                              : mandi.trend === "down" 
                              ? "bg-[#FEE2E2] text-[#991B1B]" 
                              : "bg-[#F3F4F6] text-[#4B5563]"
                          }`}>
                            {mandi.trend === "up" && <TrendingUp className="w-3 h-3" />}
                            {mandi.trend === "down" && <TrendingDown className="w-3 h-3" />}
                            {mandi.trend === "stable" && <Minus className="w-3 h-3" />}
                            <span>{mandi.changePercentage >= 0 ? `+${mandi.changePercentage}%` : `${mandi.changePercentage}%`}</span>
                          </span>
                        </div>

                        <div className="text-[11px] text-[#777] mt-0.5 flex items-center sm:justify-end gap-2">
                          <span>रेंज: ₹{mandi.minPrice} - ₹{mandi.maxPrice}</span>
                          {!isCurrentSelected && diffFromCurrent !== 0 && (
                            <span className={`font-bold ${diffFromCurrent > 0 ? "text-[#166534]" : "text-[#991B1B]"}`}>
                              ({diffFromCurrent > 0 ? `+₹${diffFromCurrent} अधिक` : `-₹${Math.abs(diffFromCurrent)} कम`})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Switch to this Mandi or Alert */}
                      <div className="flex items-center gap-1.5">
                        {!isCurrentSelected && onSelectMandiRateId ? (
                          <button
                            onClick={() => onSelectMandiRateId(mandi.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            title={isHindi ? "इस मंडी का पूर्ण विश्लेषण देखें" : "View full analysis for this mandi"}
                          >
                            <span>{isHindi ? "विवरण देखें" : "View Details"}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSetPriceAlert(mandi.cropNameHi, mandi.currentPrice)}
                            className="p-2 rounded-lg bg-[#EAE4D5] hover:bg-[#DCD4C0] text-[#182F15] text-xs font-bold transition-colors"
                            title={isHindi ? "इस मंडी का भाव अलर्ट सेट करें" : "Set alert for this mandi"}
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMandis.length === 0 && (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#D1C9B8]">
                  <p className="text-sm font-bold text-[#666]">
                    {isHindi ? "खोजे गए फ़िल्टर के अनुसार कोई मंडी नहीं मिली।" : "No mandis found matching the selected filters."}
                  </p>
                  <button
                    onClick={() => { setSelectedStateFilter("all"); setMandiSearchQuery(""); }}
                    className="mt-2 text-xs font-bold text-[#2D5A27] underline"
                  >
                    {isHindi ? "सभी फ़िल्टर हटाएं" : "Clear All Filters"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Price History & Trend Graph */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0D8C3] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#182F15] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2D5A27]" />
                  <span>{isHindi ? `${rate.marketName} का 7-दिवसीय मूल्य इतिहास` : `7-Day Price History for ${rate.marketName}`}</span>
                </h3>
                <p className="text-xs text-[#666] mt-0.5">
                  {isHindi ? "दैनिक मॉडल भाव का वास्तविक उतार-चढ़ाव (प्रति क्विंटल)" : "Daily modal price fluctuations (per quintal)"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs bg-[#E8F3E5] text-[#2D5A27] font-bold px-2.5 py-1 rounded-full border border-[#2D5A27]/20">
                  {isHindi ? "7 दिन का औसत:" : "7-Day Avg:"} ₹{historyPrices.length ? Math.round(historyPrices.reduce((a, b) => a + b, 0) / historyPrices.length) : rate.currentPrice}
                </span>
              </div>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE5D8]">
              <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 relative">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-x-2 top-4 border-b border-dashed border-[#DDD] flex justify-between text-[10px] text-[#999]">
                  <span>₹{maxHist} (उच्चतम)</span>
                </div>
                <div className="absolute inset-x-2 bottom-8 border-b border-dashed border-[#DDD] flex justify-between text-[10px] text-[#999]">
                  <span>₹{minHist} (न्यूनतम)</span>
                </div>

                {(rate.history || []).map((h, idx) => {
                  const barHeightPercent = Math.max(15, Math.min(100, ((h.price - minHist) / priceRange) * 80 + 20));
                  const isLatest = idx === (rate.history || []).length - 1;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 z-10 group relative">
                      {/* Price Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#182F15] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap transition-opacity pointer-events-none">
                        ₹{h.price}
                      </div>

                      <div className="text-[11px] font-black text-[#182F15] group-hover:text-[#2D5A27]">
                        ₹{h.price}
                      </div>
                      
                      <div 
                        className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${
                          isLatest 
                            ? "bg-gradient-to-t from-[#2D5A27] to-[#86EFAC] shadow-md ring-2 ring-[#2D5A27]" 
                            : "bg-gradient-to-t from-[#D0E2CC] to-[#A8C8A3]"
                        }`}
                        style={{ height: `${barHeightPercent}%` }}
                      />

                      <div className={`text-[10px] font-semibold ${isLatest ? "text-[#2D5A27] font-bold" : "text-[#777]"}`}>
                        {h.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mandi Location & Arrival Details Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0D8C3] shadow-sm">
            <h3 className="text-base font-bold text-[#182F15] mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2D5A27]" />
              <span>{isHindi ? "मंडी का पता एवं दैनिक आवक विवरण" : "Mandi Location & Daily Arrival Info"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE5D8]">
                <div className="text-xs text-[#666] font-medium">{isHindi ? "मंडी का पूरा नाम" : "Full Mandi Name"}</div>
                <div className="font-bold text-[#182F15] mt-0.5">{rate.marketName}</div>
                <div className="text-xs text-[#2D5A27] font-semibold mt-1">APMC Regulated Market Yard</div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE5D8]">
                <div className="text-xs text-[#666] font-medium">{isHindi ? "स्थान (राज्य / जिला)" : "Location (State/District)"}</div>
                <div className="font-bold text-[#182F15] mt-0.5">{rate.district}, {rate.state}</div>
                <div className="text-xs text-[#888] mt-1">पिनकोड व प्रमुख राष्ट्रीय कृषि हब</div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE5D8]">
                <div className="text-xs text-[#666] font-medium">{isHindi ? "आज की कुल आवक (Arrivals)" : "Today's Arrival Volume"}</div>
                <div className="font-black text-[#E76F51] text-lg mt-0.5">
                  {(rate.arrivalVolumeQuintals || 0).toLocaleString("en-IN")} <span className="text-xs font-normal text-[#666]">क्विंटल ({Math.round((rate.arrivalVolumeQuintals || 0) / 10)} टन)</span>
                </div>
                <div className="text-xs text-[#2D5A27] font-medium mt-1">सक्रिय दैनिक नीलामी चालू है</div>
              </div>
            </div>
          </div>

          {/* Direct Farmer Availability on KisanDirect */}
          {directFarmerListings.length > 0 && (
            <div className="bg-[#F0FDF4] p-4 sm:p-5 rounded-2xl border-2 border-[#86EFAC]/60 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#2D5A27] text-white rounded-lg">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#182F15]">
                      {isHindi ? "सीधे किसान से खरीदें (बिना बिचौलिए का भाव)" : "Buy Direct From Verified Farmers"}
                    </h3>
                    <p className="text-xs text-[#2D5A27]">
                      {isHindi ? "किसान डायरेक्ट पर उपलब्ध ताज़ा स्टॉक" : "Fresh farm harvest available on KisanDirect"}
                    </p>
                  </div>
                </div>

                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab("market");
                    }}
                    className="text-xs font-bold text-[#2D5A27] hover:text-[#182F15] flex items-center gap-1 underline"
                  >
                    <span>{isHindi ? "सभी किसान लिस्टिंग देखें" : "View All Listings"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {directFarmerListings.map((farmerCrop) => (
                  <div
                    key={farmerCrop.id}
                    onClick={() => {
                      if (onSelectCropListing) {
                        onClose();
                        onSelectCropListing(farmerCrop);
                      }
                    }}
                    className="bg-white p-3 rounded-xl border border-[#D1E7CD] hover:border-[#2D5A27] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={farmerCrop.images?.[0] || "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200"} 
                        alt={isHindi ? farmerCrop.titleHi : farmerCrop.titleEn} 
                        className="w-10 h-10 rounded-lg object-cover border border-[#E0D8C3] shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#182F15] truncate">
                          {isHindi ? farmerCrop.titleHi : farmerCrop.titleEn}
                        </div>
                        <div className="text-[10px] text-[#666] truncate flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-[#2D5A27] shrink-0" />
                          <span>{farmerCrop.farmerName} ({farmerCrop.farmerLocation.split(",")[0]})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0ECE1]">
                      <span className="font-black text-[#2D5A27]">₹{farmerCrop.pricePerUnit}/{farmerCrop.unit}</span>
                      <span className="text-[10px] text-[#888]">{farmerCrop.availableStock} {farmerCrop.unit} स्टॉक</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF8F5] px-4 sm:px-6 py-3 border-t border-[#E0D8C3] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-[#666]">
            <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
            <span>{isHindi ? "AgMarknet व भारत सरकार के e-NAM द्वारा प्रमाणित लाइव दरें" : "Verified by AgMarknet & Govt of India e-NAM APMC Portal"}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#666] hover:text-[#2D2D2D] transition-colors rounded-xl border border-[#DCD7CC] hover:bg-[#F0ECE1]"
            >
              {isHindi ? "बंद करें" : "Close"}
            </button>
            <button
              onClick={() => onSetPriceAlert(rate.cropNameHi, rate.currentPrice)}
              className="px-4 py-2 text-xs font-bold bg-[#2D5A27] hover:bg-[#1E3E1A] text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isHindi ? "भाव अलर्ट सेट करें" : "Set Alert for this Crop"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
