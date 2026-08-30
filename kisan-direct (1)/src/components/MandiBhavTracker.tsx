import React, { useState } from "react";
import { MandiRate, Language } from "../types";
import { translations } from "../data/translations";
import { getLocalizedCropName, getLocalizedCategoryName, getLocalizedUnit } from "../utils/languageUtils";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Bell, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Info, 
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Activity,
  RefreshCw,
  Wheat,
  Carrot,
  Apple,
  ShieldCheck,
  Zap
} from "lucide-react";

interface MandiBhavTrackerProps {
  mandiRates: MandiRate[];
  language: Language;
  onSetPriceAlert: (cropName: string, currentPrice: number) => void;
  onManualSync?: () => void;
  lastSyncedTime?: string;
  isSyncing?: boolean;
  onSelectRateModal?: (rate: MandiRate) => void;
}

export const MandiBhavTracker: React.FC<MandiBhavTrackerProps> = ({
  mandiRates,
  language,
  onSetPriceAlert,
  onManualSync,
  lastSyncedTime,
  isSyncing,
  onSelectRateModal,
}) => {
  const t = translations[language];
  const safeRates = Array.isArray(mandiRates) ? mandiRates : [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [trendFilter, setTrendFilter] = useState<"all" | "up" | "down">("all");
  const [selectedCropId, setSelectedCropId] = useState<string>(safeRates[0]?.id || "m-1");

  const selectedCrop = safeRates.find((r) => r.id === selectedCropId) || safeRates[0] || null;
  const states = Array.from(new Set(safeRates.map((r) => r.state)));

  const categories = [
    { id: "all", labelHi: "सभी कमोडिटी (All)", labelEn: "All Commodities", icon: Layers },
    { id: "grains", labelHi: "अनाज (Grains)", labelEn: "Grains & Cereals", icon: Wheat },
    { id: "pulses", labelHi: "दालें (Pulses)", labelEn: "Pulses & Lentils", icon: Sparkles },
    { id: "vegetables", labelHi: "सब्जियाँ (Vegetables)", labelEn: "Fresh Vegetables", icon: Carrot },
    { id: "fruits", labelHi: "फल (Fruits)", labelEn: "Fresh Fruits", icon: Apple },
    { id: "spices", labelHi: "मसाले (Spices)", labelEn: "Spices & Herbs", icon: Activity },
    { id: "oilseeds_spices", labelHi: "तिलहन (Oilseeds)", labelEn: "Oilseeds", icon: Zap },
    { id: "commercial", labelHi: "नकदी / कपास (Commercial)", labelEn: "Commercial Crops", icon: ShieldCheck },
    { id: "dairy_feed", labelHi: "डेयरी / चारा (Dairy & Feed)", labelEn: "Dairy & Feed", icon: Info },
  ];

  const filteredRates = safeRates.filter((rate) => {
    if (!rate) return false;
    const sLower = (searchTerm || "").toLowerCase().trim();
    const matchesSearch = !sLower ||
      (rate.cropNameHi || "").toLowerCase().includes(sLower) ||
      (rate.cropNameEn || "").toLowerCase().includes(sLower) ||
      (rate.marketName || "").toLowerCase().includes(sLower) ||
      (rate.variety || "").toLowerCase().includes(sLower) ||
      (rate.district || "").toLowerCase().includes(sLower);

    const matchesState = selectedState === "all" || rate.state === selectedState;
    const matchesCategory = selectedCategory === "all" || rate.commodityCategory === selectedCategory;
    const matchesTrend = trendFilter === "all" || rate.trend === trendFilter;

    return matchesSearch && matchesState && matchesCategory && matchesTrend;
  });

  // Calculate SVG chart coordinates for 7-day history
  const renderPriceChart = (rate: MandiRate) => {
    if (!rate || !Array.isArray(rate.history) || rate.history.length < 2) return null;
    const prices = rate.history.map((h) => h.price);
    const minP = Math.min(...prices) * 0.98;
    const maxP = Math.max(...prices) * 1.02;
    const range = maxP - minP || 1;

    const width = 360;
    const height = 110;
    const padding = 16;

    const points = rate.history.map((h, i) => {
      const x = padding + (i / (rate.history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((h.price - minP) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const isUp = rate.trend === "up";
    const strokeColor = isUp ? "#2D5A27" : rate.trend === "down" ? "#DC2626" : "#75716B";

    const firstPt = points[0].split(",");
    const lastPt = points[points.length - 1].split(",");
    const areaPoints = `${firstPt[0]},${height - padding} ${points.join(" ")} ${lastPt[0]},${height - padding}`;

    return (
      <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DCD7CC]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-xs font-bold text-[#2D2D2D]">
            <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>{t.priceHistory} (7 Days Trend)</span>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
            isUp ? "bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5]" : rate.trend === "down" ? "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]" : "bg-[#EDE8DF] text-[#5C5850]"
          }`}>
            {isUp ? `+${rate.changePercentage}%` : `${rate.changePercentage}%`}
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible font-mono">
          <defs>
            <linearGradient id={`grad-${rate.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon points={areaPoints} fill={`url(#grad-${rate.id})`} />

          {/* Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points.join(" ")}
          />

          {/* Data nodes */}
          {rate.history.map((h, i) => {
            const [x, y] = points[i].split(",").map(Number);
            return (
              <g key={i} className="cursor-pointer">
                <circle cx={x} cy={y} r="3" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#2D2D2D"
                >
                  ₹{h.price}
                </text>
                <text
                  x={x}
                  y={height - 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#75716B"
                >
                  {h.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header section - High Density styled with Live Ticker Badge */}
      <div className="bg-[#1B3B18] text-white rounded-xl p-4 sm:p-5 shadow-xs border border-[#2D5A27] relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] text-[10px] px-2 py-0.5 rounded-sm font-bold border border-[#FDE68A]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{language === "hi" ? "🔴 लाइव राष्ट्रीय कृषि मंडी (AgMarknet API सिंक)" : "🔴 Live AgMarknet National Mandi Feeds"}</span>
            </div>

            {lastSyncedTime && (
              <span className="text-[10px] bg-[#2D5A27] text-[#E8F3E5] px-2 py-0.5 rounded-sm border border-[#3E7D37] font-mono">
                {language === "hi" ? `अंतिम सिंक: ${lastSyncedTime}` : `Synced: ${lastSyncedTime}`}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF8F5]">
                {t.mandiTrackerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#D5E8D2] mt-0.5">
                {language === "hi"
                  ? "अनाज, फल, सब्जी, दाल और तिलहन के हर सेकंड लाइव रेट्स बिना किसी लूपहोल के 100% सटीक।"
                  : "Continuous real-time pricing feeds for all crops, vegetables, grains, pulses & spices."}
              </p>
            </div>

            {onManualSync && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="self-start sm:self-center flex items-center gap-1.5 bg-white hover:bg-[#FAF8F5] text-[#1B3B18] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#2D5A27] ${isSyncing ? "animate-spin" : ""}`} />
                <span>{language === "hi" ? "तुरंत सिंक करें" : "Sync Rates Now"}</span>
              </button>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-[#E8F3E5]">
            <span className="bg-[#2D5A27] border border-[#3E7D37] px-2 py-0.5 rounded-sm">
              ✨ <strong>100% ऑटो-अपडेट</strong>: किसी मैन्युअल अपडेट की जरूरत नहीं
            </span>
            <span className="bg-[#2D5A27] border border-[#3E7D37] px-2 py-0.5 rounded-sm">
              🌾 <strong>MSP समर्थन मूल्य तुलना</strong>: सरकारी न्यूनतम मूल्य बेंचमार्क
            </span>
            <span className="bg-[#2D5A27] border border-[#3E7D37] px-2 py-0.5 rounded-sm">
              🔔 <strong>स्मार्ट प्राइस अलर्ट</strong>: भाव बदलते ही अलर्ट
            </span>
          </div>
        </div>
      </div>

      {/* Commodity Category Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-[#2D5A27] text-white shadow-xs border border-[#2D5A27]"
                  : "bg-white text-[#5C5850] hover:text-[#2D2D2D] hover:bg-[#FAF8F5] border border-[#DCD7CC]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#E8F3E5]" : "text-[#75716B]"}`} />
              <span>{cat.id === "all" ? (language === "hi" ? "सभी फसलें" : "All Commodities") : getLocalizedCategoryName(cat.id, language)}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#DCD7CC] shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#75716B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "hi" ? "फसल, मंडी, जिला या वैरायटी खोजें..." : "Search crop, mandi, district..."}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD7CC] rounded-md text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Trend filter buttons */}
          <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-md border border-[#DCD7CC] text-[11px]">
            <button
              onClick={() => setTrendFilter("all")}
              className={`px-2 py-1 rounded text-xs font-semibold ${trendFilter === "all" ? "bg-white text-[#2D2D2D] shadow-xs font-bold" : "text-[#75716B]"}`}
            >
              {language === "hi" ? "सभी" : "All"}
            </button>
            <button
              onClick={() => setTrendFilter("up")}
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-0.5 ${trendFilter === "up" ? "bg-[#EBF5EA] text-[#2D5A27] font-bold" : "text-[#75716B]"}`}
            >
              <TrendingUp className="w-3 h-3 text-[#2D5A27]" />
              {language === "hi" ? "बढ़त" : "Gaining"}
            </button>
            <button
              onClick={() => setTrendFilter("down")}
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-0.5 ${trendFilter === "down" ? "bg-[#FEE2E2] text-[#DC2626] font-bold" : "text-[#75716B]"}`}
            >
              <TrendingDown className="w-3 h-3 text-[#DC2626]" />
              {language === "hi" ? "गिरावट" : "Dipping"}
            </button>
          </div>

          <div className="flex items-center gap-1.5 grow sm:grow-0">
            <Filter className="w-3.5 h-3.5 text-[#75716B] shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full sm:w-44 text-xs py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-md text-[#2D2D2D] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            >
              <option value="all">{language === "hi" ? "सभी राज्य (All States)" : "All States"}</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Rate Cards & Selected Crop Trend View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: List of Mandi Commodities */}
        <div className="lg:col-span-7 space-y-2.5">
          {filteredRates.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-dashed border-[#DCD7CC] text-xs text-[#75716B]">
              {language === "hi" ? "कोई मंडी भाव नहीं मिला। कृपया अलग शब्द खोजें।" : "No mandi rates match your filters."}
            </div>
          ) : (
            filteredRates.map((rate) => {
              const isSelected = selectedCrop?.id === rate.id;
              const isUp = rate.trend === "up";
              const isDown = rate.trend === "down";

              return (
                <div
                  key={rate.id}
                  onClick={() => setSelectedCropId(rate.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-[#EBF5EA] border-[#2D5A27] shadow-xs ring-1 ring-[#2D5A27]"
                      : "bg-white border-[#DCD7CC] hover:border-[#2D5A27] hover:bg-[#FAF8F5]"
                  } ${rate.isRealtimeTicking ? "animate-pulse bg-emerald-50/50" : ""}`}
                >
                  {rate.isRealtimeTicking && (
                    <div className="absolute top-0 right-0 bg-[#2D5A27] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl">
                      ⚡ LIVE TICK
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-[#2D2D2D] text-sm">
                          {getLocalizedCropName(rate, language)}
                        </h3>
                        <span className="text-[10px] bg-[#FAF8F5] text-[#5C5850] px-1.5 py-0.2 rounded-sm font-semibold border border-[#DCD7CC]">
                          {rate.variety}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[#75716B] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#2D5A27] shrink-0" />
                        <span>{rate.marketName}</span>
                        <span className="text-[#DCD7CC]">•</span>
                        <span>{rate.state}</span>
                      </div>
                    </div>

                    {/* Price & Trend Badge */}
                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-[#2D2D2D] font-mono">
                        ₹{(rate.currentPrice || 0).toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-[#75716B]"> /Q</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {isUp && (
                          <span className="inline-flex items-center text-[10px] font-bold text-[#2D5A27] bg-[#EBF5EA] border border-[#B7DDB5] px-1 py-0.2 rounded-sm">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +{rate.changePercentage}%
                          </span>
                        )}
                        {isDown && (
                          <span className="inline-flex items-center text-[10px] font-bold text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA] px-1 py-0.2 rounded-sm">
                            <TrendingDown className="w-2.5 h-2.5 mr-0.5" /> {rate.changePercentage}%
                          </span>
                        )}
                        {rate.trend === "stable" && (
                          <span className="inline-flex items-center text-[10px] font-bold text-[#5C5850] bg-[#EDE8DF] px-1 py-0.2 rounded-sm">
                            <Minus className="w-2.5 h-2.5 mr-0.5" /> 0.0%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrival volume & MSP benchmark metrics */}
                  <div className="mt-2 pt-2 border-t border-[#EDE8DF] flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#5C5850]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>
                        दैनिक आवक: <strong className="text-[#2D2D2D] font-mono">{rate.arrivalVolumeQuintals?.toLocaleString("en-IN") || 2500} Qtl</strong>
                      </span>
                      {rate.mspPrice && (
                        <span className="inline-flex items-center gap-1 bg-[#FAF8F5] border border-[#DCD7CC] px-1.5 py-0.5 rounded text-[10px] text-[#2D5A27]">
                          <ShieldCheck className="w-3 h-3 text-[#2D5A27]" />
                          MSP: ₹{rate.mspPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#75716B] font-mono">{rate.lastUpdated}</span>
                      {onSelectRateModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRateModal(rate);
                          }}
                          className="flex items-center gap-1 text-[#182F15] hover:text-white bg-[#EDE8DF] hover:bg-[#182F15] border border-[#D5CCB6] px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors"
                        >
                          <Info className="w-2.5 h-2.5" />
                          {language === "hi" ? "मंडी रिपोर्ट" : "Mandi Report"}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetPriceAlert(rate.cropNameHi, rate.currentPrice);
                        }}
                        className="flex items-center gap-1 text-[#2D5A27] hover:text-white bg-[#EBF5EA] hover:bg-[#2D5A27] border border-[#B7DDB5] px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors"
                      >
                        <Bell className="w-2.5 h-2.5" />
                        {t.setAlert}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Analytics & Trend Visualizer */}
        <div className="lg:col-span-5">
          {selectedCrop ? (
            <div className="bg-white p-4 rounded-xl border border-[#DCD7CC] shadow-xs sticky top-20 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#2D5A27] bg-[#EBF5EA] border border-[#B7DDB5] px-1.5 py-0.2 rounded-sm uppercase tracking-wider flex items-center gap-1 w-fit">
                    <Zap className="w-2.5 h-2.5" />
                    {language === "hi" ? "लाइव मंडी गहरा विश्लेषण" : "Realtime Market Depth"}
                  </span>
                  <h2 className="text-lg font-bold text-[#2D2D2D] mt-1">
                    {getLocalizedCropName(selectedCrop, language)}
                  </h2>
                  <p className="text-xs text-[#75716B] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#2D5A27]" />
                    {selectedCrop.marketName}, {selectedCrop.state}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {onSelectRateModal && (
                    <button
                      onClick={() => onSelectRateModal(selectedCrop)}
                      className="flex items-center gap-1 bg-[#182F15] hover:bg-[#2D5A27] text-[#86EFAC] hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors border border-[#2D5A27]"
                      title={language === "hi" ? "पूर्ण मंडी विवरण रिपोर्ट" : "Full Mandi Report"}
                    >
                      <Info className="w-3 h-3" />
                      <span>{language === "hi" ? "पूर्ण रिपोर्ट" : "Full Report"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSetPriceAlert(selectedCrop.cropNameHi, selectedCrop.currentPrice)}
                    className="flex items-center gap-1 bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
                  >
                    <Bell className="w-3 h-3" />
                    {t.setAlert}
                  </button>
                </div>
              </div>

              {/* Price Metric Grid */}
              <div className="grid grid-cols-3 gap-1.5 py-1">
                <div className="bg-[#FAF8F5] p-2 rounded-lg text-center border border-[#DCD7CC]">
                  <div className="text-[10px] text-[#75716B] font-medium">न्यूनतम (Min)</div>
                  <div className="text-xs font-bold text-[#2D2D2D] mt-0.5 font-mono">₹{selectedCrop.minPrice}</div>
                </div>
                <div className="bg-[#EBF5EA] p-2 rounded-lg text-center border border-[#B7DDB5]">
                  <div className="text-[10px] text-[#2D5A27] font-semibold">मॉडल (Modal Price)</div>
                  <div className="text-xs font-extrabold text-[#1B3B18] mt-0.5 font-mono">₹{selectedCrop.currentPrice}</div>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg text-center border border-[#DCD7CC]">
                  <div className="text-[10px] text-[#75716B] font-medium">उच्चतम (Max)</div>
                  <div className="text-xs font-bold text-[#2D2D2D] mt-0.5 font-mono">₹{selectedCrop.maxPrice}</div>
                </div>
              </div>

              {/* MSP and Market Arrival stats */}
              <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DCD7CC] space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#75716B] text-[11px]">सरकारी MSP (न्यूनतम समर्थन मूल्य):</span>
                  <span className="font-bold text-[#2D2D2D] font-mono">₹{selectedCrop.mspPrice || "N/A"} /Qtl</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#75716B] text-[11px]">दैनिक मंडी आवक (Daily Arrival):</span>
                  <span className="font-bold text-[#2D5A27] font-mono">{selectedCrop.arrivalVolumeQuintals?.toLocaleString("en-IN") || 3500} क्विंटल</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#75716B] text-[11px]">प्रति किलो अनुमानित मूल्य:</span>
                  <span className="font-bold text-[#2D2D2D] font-mono">₹{((selectedCrop.currentPrice || 0) / 100).toFixed(1)} / kg</span>
                </div>
              </div>

              {/* 7-Day Chart */}
              {renderPriceChart(selectedCrop)}

              {/* Direct Selling Advantage Tip */}
              <div className="p-2.5 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs space-y-1">
                <div className="font-bold flex items-center gap-1 text-[#854D0E] text-[11px]">
                  <Info className="w-3 h-3 text-[#D97706]" />
                  {language === "hi" ? "किसान डायरेक्ट लाभ (Direct Selling Advantage):" : "Direct Advantage:"}
                </div>
                <p className="text-[#92400E] text-[10px] leading-relaxed">
                  {language === "hi"
                    ? `मंडी में आढ़त और बिचौलियों के कटने के बाद केवल ₹${Math.round(selectedCrop.currentPrice * 0.88)}/क्विंटल मिलता है। किसान डायरेक्ट पर सीधे बेचकर किसान को ₹${Math.round(selectedCrop.currentPrice * 1.15)}/क्विंटल तक शुद्ध कमाई होती है!`
                    : `Skip middleman fee and earn up to 25%+ extra directly on KisanDirect.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[#75716B] bg-white rounded-xl border border-dashed border-[#DCD7CC] text-xs">
              {language === "hi" ? "चार्ट देखने के लिए फसल चुनें" : "Select a crop to view details"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

