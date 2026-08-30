import React, { useState } from "react";
import { CropListing, Language, UserRole } from "../types";
import { translations } from "../data/translations";
import { getLocalizedCropName, getLocalizedCategoryName, getLocalizedUnit } from "../utils/languageUtils";
import { 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle, 
  Star, 
  Calendar, 
  ShoppingCart, 
  ShieldCheck, 
  Phone, 
  Leaf, 
  Tag,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Plus,
  Minus,
  Navigation,
  Layers,
  MessageSquare,
  PhoneCall,
  SlidersHorizontal
} from "lucide-react";

interface MarketplaceProps {
  crops: CropListing[];
  language: Language;
  userRole: UserRole;
  onAddToCart: (crop: CropListing, quantity: number) => void;
  onBuyDirect: (crop: CropListing, quantity: number) => void;
  onViewDetails: (crop: CropListing) => void;
  onOpenAddCrop: () => void;
  onOpenChat?: (crop: CropListing) => void;
  onOpenCallMasking?: (crop: CropListing) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  crops,
  language,
  userRole,
  onAddToCart,
  onBuyDirect,
  onViewDetails,
  onOpenAddCrop,
  onOpenChat,
  onOpenCallMasking,
}) => {
  const t = translations[language];
  const isHi = language === "hi";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(100); // 0 = all
  const [organicOnly, setOrganicOnly] = useState(false);
  const [bulkOnly, setBulkOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "price_asc" | "price_desc" | "rating">("distance");
  
  // Local quantity selections for each crop card
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getCropQuantity = (crop: CropListing) => {
    return quantities[crop.id] !== undefined ? quantities[crop.id] : (crop.minOrderQuantity || 1);
  };

  const handleQuantityChange = (crop: CropListing, delta: number) => {
    const current = getCropQuantity(crop);
    const min = crop.minOrderQuantity || 1;
    const max = crop.availableStock || 9999;
    const updated = Math.min(max, Math.max(min, current + delta));
    setQuantities(prev => ({ ...prev, [crop.id]: updated }));
  };

  const handleManualQuantityInput = (crop: CropListing, val: number) => {
    const min = crop.minOrderQuantity || 1;
    const max = crop.availableStock || 9999;
    const sanitized = isNaN(val) || val < min ? min : Math.min(max, Math.max(min, val));
    setQuantities(prev => ({ ...prev, [crop.id]: sanitized }));
  };

  const categories = [
    { id: "all", labelHi: "सभी फसलें", labelEn: "All Crops", icon: "🌾" },
    { id: "grains", labelHi: "अनाज (Grains)", labelEn: "Grains & Cereals", icon: "🌾" },
    { id: "vegetables", labelHi: "ताज़ी सब्जियां", labelEn: "Fresh Veggies", icon: "🥦" },
    { id: "fruits", labelHi: "मीठे फल", labelEn: "Farm Fruits", icon: "🥭" },
    { id: "pulses", labelHi: "दालें व दलहन", labelEn: "Pulses & Dal", icon: "🫘" },
    { id: "spices", labelHi: "मसाले", labelEn: "Spices", icon: "🌶️" },
    { id: "organic", labelHi: "100% जैविक", labelEn: "100% Organic", icon: "🌿" },
  ];

  const radiusOptions = [
    { label: isHi ? "सभी दूरी (All)" : "All Distance", val: 100 },
    { label: isHi ? "10 किमी के भीतर" : "Within 10 km", val: 10 },
    { label: isHi ? "25 किमी के भीतर" : "Within 25 km", val: 25 },
    { label: isHi ? "50 किमी के भीतर" : "Within 50 km", val: 50 },
  ];

  const filteredCrops = crops
    .filter((crop) => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        (crop.titleHi || "").toLowerCase().includes(searchLower) ||
        (crop.titleEn || "").toLowerCase().includes(searchLower) ||
        (crop.farmerName || "").toLowerCase().includes(searchLower) ||
        (crop.farmerLocation || "").toLowerCase().includes(searchLower) ||
        (crop.tags || []).some((t) => (t || "").toLowerCase().includes(searchLower)) ||
        (crop.relatedTags || []).some((t) => (t || "").toLowerCase().includes(searchLower));

      const matchesCat =
        selectedCategory === "all"
          ? true
          : selectedCategory === "organic"
          ? crop.isOrganic
          : crop.category === selectedCategory;

      const matchesUnit =
        selectedUnit === "all" ? true : crop.unit === selectedUnit;

      const matchesRadius =
        maxRadiusKm >= 100 ? true : crop.distanceKm <= maxRadiusKm;

      const matchesOrganic = organicOnly ? crop.isOrganic : true;
      const matchesBulk = bulkOnly ? (crop.bulkTiers && crop.bulkTiers.length > 0) : true;

      return matchesSearch && matchesCat && matchesUnit && matchesRadius && matchesOrganic && matchesBulk;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.pricePerUnit - b.pricePerUnit;
      if (sortBy === "price_desc") return b.pricePerUnit - a.pricePerUnit;
      if (sortBy === "rating") return b.farmerRating - a.farmerRating;
      return a.distanceKm - b.distanceKm;
    });

  // Calculate related crops when user is searching or viewing a filtered set
  const relatedCrops = React.useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return [];

    const matchedIds = new Set(filteredCrops.map((c) => c.id));
    
    return crops.filter((crop) => {
      if (matchedIds.has(crop.id)) return false;

      const isRelatedByTag = crop.relatedTags?.some((tag) =>
        searchLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(searchLower)
      );

      const isSameCategoryAsMatched = filteredCrops.some((m) => m.category === crop.category);

      return isRelatedByTag || isSameCategoryAsMatched;
    }).slice(0, 4);
  }, [searchTerm, filteredCrops, crops]);

  // Suggested quick search pills
  const quickSearchPills = [
    { labelHi: "🌾 शरबती गेहूं", labelEn: "Sharbati Wheat", q: "गेहूं" },
    { labelHi: "🍅 ताज़ा टमाटर", labelEn: "Fresh Tomato", q: "टमाटर" },
    { labelHi: "🧅 नासिक प्याज", labelEn: "Nashik Onion", q: "प्याज" },
    { labelHi: "🥔 देसी आलू", labelEn: "Desi Potato", q: "आलू" },
    { labelHi: "🍚 बासमती चावल", labelEn: "Basmati Rice", q: "चावल" },
    { labelHi: "🫘 हरी मूंग दाल", labelEn: "Moong Dal", q: "मूंग" },
    { labelHi: "🟡 पीली सरसों", labelEn: "Mustard", q: "सरसों" },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Banner with Direct Farm-to-Fork Advantage */}
      <div className="bg-[#1B3B18] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#2D5A27] relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-2.5 py-0.5 rounded-sm border border-[#FDE68A]">
            <Sparkles className="w-3 h-3 text-[#D97706]" />
            <span>{isHi ? "0% बिचौलिया • सुरक्षित एस्क्रो लेन-देन" : "Direct From Farmers • Escrow Guaranteed"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FAF8F5]">
            {isHi ? "खेत से ताज़ा थोक व खुदरा फसल, सीधे सत्यापित किसानों से" : "Farm Fresh Produce Directly From Verified Farmers"}
          </h1>
          <p className="text-xs text-[#D5E8D2] leading-relaxed">
            {isHi
              ? "क्विंटल, टन व बोरी में थोक खरीददारी, रेडियस आधारित लोकेशन सर्च और सुरक्षित एस्क्रो भुगतान व्यवस्था।"
              : "Enterprise-grade agricultural marketplace with radius filtering, multi-unit stock, and secure escrow settlement."}
          </p>

          {userRole === "farmer" && (
            <div className="pt-1">
              <button
                onClick={onOpenAddCrop}
                className="bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#854D0E] font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 border border-[#FDE68A] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHi ? "+ नई फसल लिस्ट करें (निशुल्क 0% कमीशन)" : "+ List Crop (0% Commission)"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search, Radius & Filter Section */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#DCD7CC] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Search bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-[#75716B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg shadow-2xs text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27]"
            />
          </div>

          {/* Unit Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DCD7CC] text-xs rounded-lg py-1.5 px-2 font-semibold text-[#2D2D2D]"
            >
              <option value="all">{isHi ? "सभी इकाइयां (Units)" : "All Units"}</option>
              <option value="quintal">🌾 क्विंटल (Quintal)</option>
              <option value="ton">🚛 टन (Ton)</option>
              <option value="bori">📦 बोरी (Bag)</option>
              <option value="crate">🧺 क्रेट (Crate)</option>
              <option value="kg">⚖️ किलो (Kg)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DCD7CC] text-xs rounded-lg py-1.5 px-2 font-semibold text-[#2D2D2D]"
            >
              <option value="distance">{t.distanceNear}</option>
              <option value="price_asc">{t.priceLowToHigh}</option>
              <option value="price_desc">{t.priceHighToLow}</option>
              <option value="rating">{t.ratingHigh}</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="sm:col-span-2 flex items-center gap-2 justify-end">
            <label className="flex items-center gap-1 cursor-pointer text-xs font-bold text-[#2D5A27] select-none">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="rounded text-[#2D5A27] focus:ring-[#2D5A27] w-3.5 h-3.5"
              />
              <span>🌿 {isHi ? "जैविक" : "Organic"}</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer text-xs font-bold text-[#92400E] select-none">
              <input
                type="checkbox"
                checked={bulkOnly}
                onChange={(e) => setBulkOnly(e.target.checked)}
                className="rounded text-[#D97706] focus:ring-[#D97706] w-3.5 h-3.5"
              />
              <span>📦 {isHi ? "थोक टियर" : "Bulk"}</span>
            </label>
          </div>
        </div>

        {/* Radius Filter & Distance Slider (Requirement 3) */}
        <div className="pt-2 border-t border-[#EDE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span className="text-xs font-bold text-[#2D2D2D]">
              {isHi ? "📍 दूरी दायरा (Radius Filter):" : "📍 Distance Radius Filter:"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {radiusOptions.map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => setMaxRadiusKm(r.val)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  maxRadiusKm === r.val
                    ? "bg-[#2D5A27] text-white shadow-xs"
                    : "bg-[#FAF8F5] text-[#5C5850] border border-[#DCD7CC] hover:bg-[#EBF5EA]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#2D5A27] text-white shadow-xs"
                    : "bg-[#FAF8F5] text-[#4A4742] border border-[#DCD7CC] hover:bg-[#EDE8DF]"
                }`}
              >
                <span className="text-xs">{cat.icon}</span>
                <span>{language === "hi" ? cat.labelHi : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[10px] text-[#75716B] font-semibold shrink-0">
            {language === "hi" ? "त्वरित खोज:" : "Quick Picks:"}
          </span>
          {quickSearchPills.map((pill) => (
            <button
              key={pill.q}
              onClick={() => setSearchTerm(pill.q)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors shrink-0 cursor-pointer ${
                searchTerm === pill.q
                  ? "bg-[#2D5A27] text-white border-[#2D5A27] font-bold"
                  : "bg-white text-[#5C5850] border-[#DCD7CC] hover:border-[#2D5A27] hover:text-[#2D2D2D]"
              }`}
            >
              {language === "hi" ? pill.labelHi : pill.labelEn}
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[10px] text-[#DC2626] font-bold hover:underline shrink-0 ml-1"
            >
              ✕ {language === "hi" ? "हटाएं" : "Clear"}
            </button>
          )}
        </div>
      </div>

      {/* Produce Grid */}
      {filteredCrops.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-[#DCD7CC] text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#DCD7CC] flex items-center justify-center mx-auto text-[#75716B] text-xl">
            🌾
          </div>
          <h3 className="text-sm font-bold text-[#2D2D2D]">
            {language === "hi" ? "कोई फसल नहीं मिली" : "No crops match your search/radius"}
          </h3>
          <p className="text-xs text-[#75716B] max-w-sm mx-auto">
            {language === "hi"
              ? "कृपया दूरी का दायरा बढ़ाएं या अलग शब्द खोजें।"
              : "Try expanding your distance radius or adjusting search filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => {
            const isSavings =
              crop.mandiBenchmarkPrice && crop.mandiBenchmarkPrice > crop.pricePerUnit;
            const savingsPercent = crop.mandiBenchmarkPrice
              ? Math.round(
                  ((crop.mandiBenchmarkPrice - crop.pricePerUnit) / crop.mandiBenchmarkPrice) * 100
                )
              : 0;

            const currentQty = getCropQuantity(crop);
            
            // Check bulk tier pricing
            let currentPrice = crop.pricePerUnit || 0;
            let hasBulkActive = false;
            if (crop.bulkTiers && crop.bulkTiers.length > 0) {
              const applied: any = [...crop.bulkTiers]
                .sort((a, b) => (b.minQuantity ?? b.minQty ?? 0) - (a.minQuantity ?? a.minQty ?? 0))
                .find(t => currentQty >= (t.minQuantity ?? t.minQty ?? 0));
              if (applied) {
                if (applied.pricePerUnit) {
                  currentPrice = applied.pricePerUnit;
                } else if (applied.discountPercentage || applied.discountPercent) {
                  const disc = applied.discountPercentage || applied.discountPercent || 0;
                  currentPrice = Math.round((crop.pricePerUnit || 0) * (1 - disc / 100));
                }
                hasBulkActive = true;
              }
            }
            const totalPrice = (currentQty || 1) * (currentPrice || 0);

            return (
              <div
                key={crop.id}
                className="bg-white rounded-2xl border border-[#DCD7CC] overflow-hidden shadow-xs hover:border-[#2D5A27] transition-all flex flex-col group"
              >
                {/* Crop Image & Badges */}
                <div className="relative h-44 bg-[#FAF8F5] overflow-hidden">
                  <img
                    src={crop.images[0] || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80"}
                    alt={language === "hi" ? crop.titleHi : crop.titleEn}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Organic Badge */}
                  {crop.isOrganic && (
                    <div className="absolute top-2.5 left-2.5 bg-[#2D5A27]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-xs">
                      <Leaf className="w-2.5 h-2.5" />
                      <span>{t.organicCertified}</span>
                    </div>
                  )}

                  {/* Bulk Tiers Badge */}
                  {crop.bulkTiers && crop.bulkTiers.length > 0 && (
                    <div className="absolute top-2.5 right-2.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm shadow-xs flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-[#D97706]" />
                      <span>{isHi ? "थोक छूट उपलब्ध" : "BULK TIERS"}</span>
                    </div>
                  )}

                  {/* Distance pill */}
                  <div className="absolute bottom-2.5 left-2.5 bg-[#1E1E1E]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 font-mono">
                    <MapPin className="w-2.5 h-2.5 text-[#86EFAC]" />
                    <span>{crop.distanceKm} km ({crop.farmerLocation.split(",")[0]})</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Farmer Profile Line & Direct Chat/Call Trigger */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={crop.farmerPhoto}
                          alt={crop.farmerName}
                          className="w-6 h-6 rounded-full object-cover border border-[#DCD7CC]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#2D2D2D] flex items-center gap-1">
                            {crop.farmerName.split(" ")[0]}
                            {crop.verifiedKisan && (
                              <CheckCircle className="w-3 h-3 text-[#2D5A27] fill-[#B7DDB5]" />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Direct In-App Communication Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenChat && onOpenChat(crop)}
                          className="p-1 px-1.5 bg-[#FAF8F5] hover:bg-[#EBF5EA] text-[#2D5A27] border border-[#DCD7CC] hover:border-[#2D5A27] rounded-md text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="किसान से चैट करें"
                        >
                          <MessageSquare className="w-3 h-3 text-[#2D5A27]" />
                          <span>चैट</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenCallMasking && onOpenCallMasking(crop)}
                          className="p-1 px-1.5 bg-[#FAF8F5] hover:bg-[#EBF5EA] text-[#2D5A27] border border-[#DCD7CC] hover:border-[#2D5A27] rounded-md text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="मास्क कॉल करें"
                        >
                          <PhoneCall className="w-3 h-3 text-[#2D5A27]" />
                          <span>कॉल</span>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onViewDetails(crop)}
                      className="font-bold text-[#2D2D2D] text-sm leading-snug hover:text-[#2D5A27] cursor-pointer line-clamp-1"
                    >
                      {getLocalizedCropName(crop, language)}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-[#5C5850] line-clamp-2 leading-relaxed">
                      {language === "hi" ? crop.descriptionHi : crop.descriptionEn}
                    </p>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5 text-[10px] text-[#5C5850] font-medium">
                      <span className="bg-[#FAF8F5] border border-[#DCD7CC] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-[#75716B]" />
                        {crop.harvestDate}
                      </span>
                      <span className="bg-[#FAF8F5] border border-[#DCD7CC] px-1.5 py-0.5 rounded-sm">
                        {t.minOrder}: {crop.minOrderQuantity || 1} {crop.unit}
                      </span>
                      {crop.unitWeightKg && (
                        <span className="bg-[#FAF8F5] border border-[#DCD7CC] px-1.5 py-0.5 rounded-sm">
                          {crop.unitWeightKg} Kg/{crop.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2 border-t border-[#DCD7CC] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-base font-extrabold text-[#2D2D2D] font-mono">
                          ₹{currentPrice}
                          <span className="text-[11px] font-normal text-[#75716B]"> / {crop.unit}</span>
                          {hasBulkActive && (
                            <span className="ml-1.5 text-[10px] bg-[#EBF5EA] text-[#15803D] font-bold px-1 py-0.2 rounded">
                              थोक दर लागू
                            </span>
                          )}
                        </div>
                        {crop.mandiBenchmarkPrice && (
                          <div className="text-[10px] text-[#A8A29E] line-through">
                            मंडी भाव: ₹{crop.mandiBenchmarkPrice}/{crop.unit}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-[#2D5A27] bg-[#EBF5EA] border border-[#B7DDB5] px-1.5 py-0.5 rounded-sm">
                        {crop.availableStock} {crop.unit} {isHi ? "स्टॉक" : "left"}
                      </span>
                    </div>

                    {/* Quantity Selector Stepper */}
                    <div className="bg-[#FAF8F5] p-1.5 rounded-lg border border-[#DCD7CC] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#5C5850] font-bold">
                          {isHi ? "मात्रा:" : "Qty:"}
                        </span>
                        <div className="flex items-center bg-white border border-[#DCD7CC] rounded-md overflow-hidden font-mono shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(crop, -1)}
                            disabled={currentQty <= (crop.minOrderQuantity || 1)}
                            className="px-2 py-0.5 text-xs font-bold text-[#2D2D2D] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            title="घटाएं"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={crop.minOrderQuantity || 1}
                            max={crop.availableStock}
                            value={currentQty}
                            onChange={(e) => handleManualQuantityInput(crop, parseInt(e.target.value, 10))}
                            className="w-12 text-center text-xs font-bold py-0.5 border-x border-[#DCD7CC] focus:outline-none text-[#2D2D2D] bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(crop, 1)}
                            disabled={currentQty >= crop.availableStock}
                            className="px-2 py-0.5 text-xs font-bold text-[#2D2D2D] hover:bg-[#FAF8F5] disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            title="बढ़ाएं"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[10px] text-[#75716B] font-medium">{crop.unit}</span>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-extrabold text-[#2D2D2D]">
                          ₹{(totalPrice || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => onAddToCart(crop, currentQty)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-[#DCD7CC] bg-white text-[#2D2D2D] hover:bg-[#FAF8F5] hover:border-[#2D5A27] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3 text-[#2D5A27]" />
                        <span>{t.addToCart}</span>
                      </button>

                      <button
                        onClick={() => onBuyDirect(crop, currentQty)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>{isHi ? "एस्क्रो से खरीदें" : "Buy Direct"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Related & Complementary Products Recommendation Section */}
      {relatedCrops.length > 0 && (
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DCD7CC] space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#2D2D2D]">
                {language === "hi"
                  ? `💡 "${searchTerm}" से जुड़े अन्य ताज़ा उत्पाद (Related & Complementary Picks)`
                  : `💡 Recommended with "${searchTerm}"`}
              </h3>
            </div>
            <span className="text-[10px] text-[#2D5A27] font-bold bg-[#EBF5EA] border border-[#B7DDB5] px-2 py-0.5 rounded-full">
              स्मार्ट एग्री मैच
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedCrops.map((rec) => (
              <div
                key={rec.id}
                className="bg-white p-3 rounded-lg border border-[#DCD7CC] hover:border-[#2D5A27] transition-all flex flex-col justify-between shadow-2xs"
              >
                <div className="flex gap-2.5 items-start">
                  <img
                    src={rec.images[0]}
                    alt={rec.titleHi}
                    className="w-14 h-14 rounded-md object-cover border border-[#DCD7CC] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <h4
                      onClick={() => onViewDetails(rec)}
                      className="font-bold text-xs text-[#2D2D2D] hover:text-[#2D5A27] cursor-pointer truncate"
                    >
                      {language === "hi" ? rec.titleHi : rec.titleEn}
                    </h4>
                    <div className="text-[10px] text-[#75716B] flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#2D5A27]" />
                      <span>{rec.farmerLocation.split(",")[0]}</span>
                    </div>
                    <div className="text-xs font-bold text-[#2D2D2D] font-mono">
                      ₹{rec.pricePerUnit}/{rec.unit}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#EDE8DF] flex gap-1.5">
                  <button
                    onClick={() => onViewDetails(rec)}
                    className="flex-1 text-[11px] py-1 bg-[#FAF8F5] hover:bg-[#EDE8DF] text-[#2D2D2D] border border-[#DCD7CC] rounded font-semibold transition-colors"
                  >
                    विवरण देखें
                  </button>
                  <button
                    onClick={() => onAddToCart(rec, 1)}
                    className="p-1 bg-[#2D5A27] hover:bg-[#234A1F] text-white rounded transition-colors"
                    title="कार्ट में जोड़ें"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


