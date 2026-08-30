import React, { useState, useEffect, useRef } from "react";
import { CropListing, Language, CropQualityAnalysis, CropUnit, BulkTierPrice } from "../types";
import { translations } from "../data/translations";
import { 
  X, 
  Upload, 
  Sparkles, 
  Leaf, 
  IndianRupee, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  Info,
  Camera,
  RefreshCw,
  Award,
  Zap,
  Package,
  Layers,
  Warehouse,
  Plus,
  Trash2
} from "lucide-react";

interface FarmerListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCrop: (crop: Omit<CropListing, "id" | "reviews">) => void;
  language: Language;
  isOffline: boolean;
  onOpenAnalyzer?: () => void;
  initialAnalysis?: CropQualityAnalysis | null;
  initialImage?: string;
}

export const FarmerListingModal: React.FC<FarmerListingModalProps> = ({
  isOpen,
  onClose,
  onAddCrop,
  language,
  isOffline,
  onOpenAnalyzer,
  initialAnalysis,
  initialImage,
}) => {
  const t = translations[language];
  const isHi = language === "hi";

  const [titleHi, setTitleHi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [category, setCategory] = useState<CropListing["category"]>("grains");
  const [pricePerUnit, setPricePerUnit] = useState<number>(2450);
  const [unit, setUnit] = useState<CropUnit>("quintal");
  const [unitWeightKg, setUnitWeightKg] = useState<number>(100);
  const [availableStock, setAvailableStock] = useState<number>(150);
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(2);
  const [harvestDate, setHarvestDate] = useState<string>("2026-08-25");
  const [storageCondition, setStorageCondition] = useState<"Cold Storage" | "Granary" | "Direct Field">("Granary");
  const [isOrganic, setIsOrganic] = useState<boolean>(true);
  const [organicCert, setOrganicCert] = useState<string>("ORG-IN-2026");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  
  // Bulk Pricing Tiers
  const [enableBulkTiers, setEnableBulkTiers] = useState(true);
  const [bulkTiers, setBulkTiers] = useState<BulkTierPrice[]>([
    { minQuantity: 10, pricePerUnit: 2400, discountPercentage: 2 },
    { minQuantity: 50, pricePerUnit: 2320, discountPercentage: 5.3 }
  ]);

  const [imageUrl, setImageUrl] = useState<string>(
    initialImage || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80"
  );
  const [activeAnalysis, setActiveAnalysis] = useState<CropQualityAnalysis | null>(initialAnalysis || null);
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync unit weight default when unit changes
  useEffect(() => {
    if (unit === "quintal") setUnitWeightKg(100);
    else if (unit === "ton") setUnitWeightKg(1000);
    else if (unit === "bori") setUnitWeightKg(50);
    else if (unit === "crate") setUnitWeightKg(25);
    else if (unit === "kg") setUnitWeightKg(1);
    else setUnitWeightKg(1);
  }, [unit]);

  // Sync initialAnalysis or initialImage if provided
  useEffect(() => {
    if (initialAnalysis) {
      setActiveAnalysis(initialAnalysis);
      setTitleHi(initialAnalysis.cropDetectedHi);
      setTitleEn(initialAnalysis.cropDetectedEn);
      setPricePerUnit(initialAnalysis.recommendedListingPrice);
      setUnit(initialAnalysis.unit);
      setDescriptionHi(`${initialAnalysis.grade} • AI गुणवत्ता स्कोर: ${initialAnalysis.qualityScore}/100। शुद्ध, ताज़ा व बिना मिलावट।`);
      setDescriptionEn(`${initialAnalysis.grade} • AI Quality Score: ${initialAnalysis.qualityScore}/100.`);
      if (initialAnalysis.cropDetectedHi.includes("गेहूं") || initialAnalysis.cropDetectedHi.includes("धान")) {
        setCategory("grains");
      } else if (initialAnalysis.cropDetectedHi.includes("टमाटर") || initialAnalysis.cropDetectedHi.includes("प्याज")) {
        setCategory("vegetables");
      } else if (initialAnalysis.cropDetectedHi.includes("सरसों")) {
        setCategory("spices");
      }
    }
  }, [initialAnalysis]);

  useEffect(() => {
    if (initialImage) {
      setImageUrl(initialImage);
    }
  }, [initialImage]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQuickAnalyzeImage = async (imgToAnalyze: string) => {
    setIsQuickAnalyzing(true);
    try {
      let imagePayload = imgToAnalyze;
      if (imgToAnalyze.startsWith("http")) {
        try {
          const resp = await fetch(imgToAnalyze);
          const blob = await resp.blob();
          const reader = new FileReader();
          imagePayload = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          imagePayload = imgToAnalyze;
        }
      }

      const res = await fetch("/api/analyze-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePayload,
          cropHint: titleHi || "फसल",
          language: language,
          state: "MP",
        }),
      });

      const data = await res.json();
      if (data && data.analysis) {
        const analysis: CropQualityAnalysis = data.analysis;
        setActiveAnalysis(analysis);
        if (!titleHi) setTitleHi(analysis.cropDetectedHi);
        if (!titleEn) setTitleEn(analysis.cropDetectedEn);
        setPricePerUnit(analysis.recommendedListingPrice);
        setUnit(analysis.unit);
        setDescriptionHi(`${analysis.grade} • AI गुणवत्ता स्कोर: ${analysis.qualityScore}/100। ${analysis.healthStatus.summaryHi}`);
      }
    } catch (e) {
      console.warn("Quick analyze fallback:", e);
    } finally {
      setIsQuickAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const MAX_SIZE_BYTES = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setImageError(
          language === "hi"
            ? `⚠️ फोटो 5MB से अधिक बड़ी है (${sizeMb} MB)। कृपया 5MB से छोटी फाइल चुनें।`
            : `⚠️ File size exceeds 5MB limit (${sizeMb} MB). Please choose a smaller image.`
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setImageError(null);
      const reader = new FileReader();

      reader.onload = () => {
        try {
          if (typeof reader.result === "string") {
            setImageUrl(reader.result);
            handleQuickAnalyzeImage(reader.result);
          }
        } catch (readErr) {
          console.error("Error reading file:", readErr);
          setImageError(
            language === "hi"
              ? "फोटो पढ़ने में समस्या आई। कृपया पुनः प्रयास करें।"
              : "Failed to read image. Please retry."
          );
        }
      };

      reader.onerror = () => {
        setImageError(
          language === "hi"
            ? "फोटो पढ़ने में त्रुटि। कृपया कोई अन्य फोटो चुनें।"
            : "Error reading image file."
        );
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error in listing modal:", err);
      setImageError(
        language === "hi"
          ? "फोटो अपलोड करते समय समस्या आई।"
          : "An unexpected error occurred during photo selection."
      );
    }
  };

  const handleAddBulkTier = () => {
    const lastTier = bulkTiers[bulkTiers.length - 1];
    const newQty = lastTier ? lastTier.minQuantity * 2 : 20;
    const newPrice = Math.round(pricePerUnit * 0.9);
    setBulkTiers([
      ...bulkTiers,
      { minQuantity: newQty, pricePerUnit: newPrice, discountPercentage: 10 }
    ]);
  };

  const handleRemoveBulkTier = (index: number) => {
    setBulkTiers(bulkTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleHi.trim() || !pricePerUnit || !availableStock) return;

    onAddCrop({
      titleHi,
      titleEn: titleEn || titleHi,
      category,
      farmerId: "f-self",
      farmerName: "रामचरण धाकड़ (Farmer)",
      farmerPhoto: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80",
      farmerLocation: "सीहोर कृषि फार्म, मध्य प्रदेश",
      farmerPhone: "+91 98930 11224",
      farmerRating: 5.0,
      farmerTotalReviews: 1,
      farmerExperienceYears: 14,
      verifiedKisan: true,
      pricePerUnit: Number(pricePerUnit),
      unit,
      unitWeightKg: Number(unitWeightKg),
      availableStock: Number(availableStock),
      minOrderQuantity: Number(minOrderQuantity),
      inventoryStatus: Number(availableStock) > 0 ? "in_stock" : "out_of_stock",
      bulkTiers: enableBulkTiers && bulkTiers.length > 0 ? bulkTiers : undefined,
      harvestDate,
      storageCondition,
      isOrganic,
      organicCertificateNo: isOrganic ? organicCert : undefined,
      images: [imageUrl],
      descriptionHi: descriptionHi || "सीधे खेत से ताजा व शुद्ध फसल। 100% सुरक्षित एस्क्रो लेन-देन।",
      descriptionEn: descriptionEn || "Pure farm-fresh produce direct from farmer. 100% Escrow protected.",
      distanceKm: 8.5,
      mandiBenchmarkPrice: activeAnalysis ? activeAnalysis.mandiAveragePrice : Math.round(pricePerUnit * 1.2),
      tags: activeAnalysis ? [activeAnalysis.gradeCode, "AI Verified", activeAnalysis.variety] : ["Direct Seller", "Escrow Verified"],
    });

    onClose();
  };

  const sampleImages = [
    { label: "गेहूं / Wheat", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80" },
    { label: "टमाटर / Tomato", url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80" },
    { label: "धान / Paddy", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80" },
    { label: "आम / Mango", url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80" },
    { label: "सरसों / Mustard", url: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80" },
    { label: "दाल / Pulses", url: "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?w=600&auto=format&fit=crop&q=80" },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#121212]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-5 border border-[#DCD7CC] shadow-2xl space-y-4 my-6 animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DCD7CC] pb-2.5 shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5] text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                0% COMMISSION • DIRECT ESCROW
              </span>
              {activeAnalysis && (
                <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[9px] font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#D97706]" />
                  {activeAnalysis.gradeCode} AI VERIFIED
                </span>
              )}
              {isOffline && (
                <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                  OFFLINE DRAFT
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-[#2D2D2D] mt-1">
              {t.listCropTitle}
            </h2>
            <p className="text-xs text-[#75716B]">
              {isHi ? "उन्नत इकाई (Quintal/Kg/Bori) व थोक डिस्काउंट के साथ फसल लिस्ट करें" : "List crop with multi-units (Quintal/Kg/Bori) & bulk tier discounts"}
            </p>
          </div>

          <button
            onClick={onClose}
            title={language === "hi" ? "काटें / बंद करें (Close)" : "Close Form"}
            aria-label="Close Crop Listing Modal"
            className="p-1.5 px-2.5 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
            <span className="text-[11px]">{language === "hi" ? "काटें" : "Close"}</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {/* AI Analyzer Banner / Shortcut */}
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#86EFAC]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2D2D2D]">
                  {language === "hi" ? "फसल फोटो का AI विश्लेषण व उचित भाव सुझाव" : "AI Crop Quality & Price Estimator"}
                </div>
                <div className="text-[11px] text-[#5C5850]">
                  {activeAnalysis 
                    ? `सत्यापित: ${activeAnalysis.grade} (स्कोर: ${activeAnalysis.qualityScore}/100)`
                    : "फोटो अपलोड करके ग्रेड (A+, A) और सर्वोत्तम भाव ऑटो-फिल करें"}
                </div>
              </div>
            </div>

            {onOpenAnalyzer && (
              <button
                type="button"
                onClick={onOpenAnalyzer}
                className="bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                <Camera className="w-3.5 h-3.5 text-[#86EFAC]" />
                <span>{language === "hi" ? "✨ AI स्कैनर खोलें" : "✨ Open AI Scanner"}</span>
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} id="crop-listing-form" className="space-y-3 text-xs">
            {/* Crop Names (Hi & En) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  {t.cropNameHi} *
                </label>
                <input
                  type="text"
                  required
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="उदा. देसी शरबती गेहूं (ग्रेड-ए प्रीमियम)"
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  {t.cropNameEn}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Sharbati Desi Wheat (Grade A Premium)"
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D]"
                />
              </div>
            </div>

            {/* Category, Units & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  {t.selectCategory}
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D]"
                >
                  <option value="grains">{t.grains}</option>
                  <option value="vegetables">{t.vegetables}</option>
                  <option value="fruits">{t.fruits}</option>
                  <option value="pulses">{t.pulses}</option>
                  <option value="spices">{t.spices}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  {isHi ? "व्यापारिक इकाई (Trading Unit) *" : "Trading Unit *"}
                </label>
                <select
                  value={unit}
                  onChange={(e: any) => setUnit(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-bold text-[#2D5A27]"
                >
                  <option value="quintal">🌾 क्विंटल (Quintal - 100 Kg)</option>
                  <option value="ton">🚛 टन (Metric Ton - 1000 Kg)</option>
                  <option value="bori">📦 बोरी / कट्टा (Bag - 50 Kg)</option>
                  <option value="crate">🧺 क्रेट (Crate - 25 Kg)</option>
                  <option value="kg">⚖️ किलोग्राम (Kilogram - 1 Kg)</option>
                  <option value="dozen">🍌 दर्जन (Dozen)</option>
                  <option value="packet">🏷️ पैकेट (Packet)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  सीधा बिक्री मूल्य (₹ / {unit}) *
                </label>
                <div className="relative font-mono">
                  <input
                    type="number"
                    required
                    min={1}
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(Number(e.target.value))}
                    className="w-full py-1.5 pl-6 pr-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-bold text-[#2D5A27]"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#75716B] font-bold font-sans">
                    ₹
                  </span>
                </div>
              </div>
            </div>

            {/* Quantities, Unit Weight & Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  कुल स्टॉक ({unit}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={availableStock}
                  onChange={(e) => setAvailableStock(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D] font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  न्यूनतम ऑर्डर ({unit})
                </label>
                <input
                  type="number"
                  min={1}
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D] font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  प्रति {unit} वजन (Kg)
                </label>
                <input
                  type="number"
                  min={1}
                  value={unitWeightKg}
                  onChange={(e) => setUnitWeightKg(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D] font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">
                  भंडारण (Storage)
                </label>
                <select
                  value={storageCondition}
                  onChange={(e: any) => setStorageCondition(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D]"
                >
                  <option value="Granary">सुरक्षित भंडार गृह (Granary)</option>
                  <option value="Cold Storage">कोल्ड स्टोरेज (Cold Storage)</option>
                  <option value="Direct Field">सीधा ताजा खेत (Direct Field)</option>
                </select>
              </div>
            </div>

            {/* Bulk Pricing Tier Management */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span className="font-bold text-xs text-[#2D2D2D]">
                    {isHi ? "थोक खरीद रियायत टियर (Bulk Pricing Tiers for Wholesalers)" : "Wholesale Bulk Discount Tiers"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddBulkTier}
                  className="px-2 py-0.5 rounded bg-[#2D5A27] text-white text-[10px] font-bold hover:bg-[#234A1F] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isHi ? "टियर जोड़ें" : "Add Tier"}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {bulkTiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[11px] font-bold text-[#75716B] shrink-0">Tier {idx + 1}:</span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#75716B]">न्यूनतम:</span>
                      <input
                        type="number"
                        min={1}
                        value={tier.minQuantity}
                        onChange={(e) => {
                          const updated = [...bulkTiers];
                          updated[idx].minQuantity = Number(e.target.value);
                          setBulkTiers(updated);
                        }}
                        className="w-16 px-1.5 py-0.5 border border-[#DCD7CC] rounded text-center font-bold text-xs"
                      />
                      <span className="text-[10px] text-[#75716B]">{unit}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#75716B]">रियायती भाव:</span>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          value={tier.pricePerUnit}
                          onChange={(e) => {
                            const updated = [...bulkTiers];
                            updated[idx].pricePerUnit = Number(e.target.value);
                            setBulkTiers(updated);
                          }}
                          className="w-20 pl-4 pr-1 py-0.5 border border-[#DCD7CC] rounded font-bold text-xs text-[#2D5A27]"
                        />
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-[#75716B]">₹</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBulkTier(idx)}
                      className="p-1 text-[#991B1B] hover:bg-[#FEF2F2] rounded"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Organic Verification */}
            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DCD7CC] space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="rounded text-[#2D5A27] focus:ring-[#2D5A27] w-3.5 h-3.5"
                />
                <span className="font-bold text-[#2D2D2D] flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-[#2D5A27]" />
                  {t.isOrganicLabel}
                </span>
              </label>

              {isOrganic && (
                <div>
                  <label className="font-semibold text-[#5C5850] block mb-0.5 text-[11px]">
                    {t.certNumber}
                  </label>
                  <input
                    type="text"
                    value={organicCert}
                    onChange={(e) => setOrganicCert(e.target.value)}
                    placeholder="उदा. NPOP/IN/2026/9901 (वैकल्पिक)"
                    className="w-full py-1 px-2.5 bg-white border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
                  />
                </div>
              )}
            </div>

            {/* Image Selection & Instant AI Scan Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#2D2D2D]">
                  फसल फोटो (Image URL या नीचे से चुनें)
                </label>
                <button
                  type="button"
                  disabled={isQuickAnalyzing}
                  onClick={() => handleQuickAnalyzeImage(imageUrl)}
                  className="text-[11px] font-bold text-[#2D5A27] hover:underline flex items-center gap-1"
                >
                  {isQuickAnalyzing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-[#2D5A27]" />
                      <span>{language === "hi" ? "AI जांच जारी..." : "Analyzing..."}</span>
                    </>
                  ) : activeAnalysis ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-[#2D5A27]" />
                      <span className="text-[#2D5A27]">
                        {language === "hi"
                          ? `सत्यापित: ${activeAnalysis.gradeCode} (₹${activeAnalysis.recommendedListingPrice}/${activeAnalysis.unit}) • पुनः जांचें`
                          : `Verified: ${activeAnalysis.gradeCode} • Re-scan`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-[#D97706]" />
                      <span>{language === "hi" ? "✨ इस फोटो की गुणवत्ता जांचें" : "✨ Check Crop Quality"}</span>
                    </>
                  )}
                </button>
              </div>

              {imageError && (
                <div className="mb-2 p-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mb-1.5">
                {sampleImages.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImageUrl(s.url);
                      handleQuickAnalyzeImage(s.url);
                    }}
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all ${
                      imageUrl === s.url
                        ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                        : "bg-[#FAF8F5] text-[#5C5850] border-[#DCD7CC] hover:bg-[#EDE8DF]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-[#EDE8DF] hover:bg-[#E2DDD3] text-[#2D2D2D] rounded-lg border border-[#DCD7CC] font-bold text-xs flex items-center gap-1 shrink-0"
                >
                  <Camera className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>अपलोड</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-[#2D2D2D] block mb-1">
                {t.cropDesc}
              </label>
              <textarea
                rows={2}
                value={descriptionHi}
                onChange={(e) => setDescriptionHi(e.target.value)}
                placeholder="फसल की मिठास, दाना का आकार, भंडारण निर्देश आदि..."
                className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
              />
            </div>

            {/* Direct Profit Calculator Highlight */}
            <div className="bg-[#FEF3C7] p-2.5 rounded-lg border border-[#FDE68A] text-[#92400E] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D97706] shrink-0" />
              <div className="text-[10px] leading-tight">
                <strong>सीधा मुनाफा अनुमान:</strong> ₹{pricePerUnit}/{unit} पर बेचने से आपको स्थानीय मंडी आढ़त की तुलना में लगभग <strong>{activeAnalysis ? activeAnalysis.extraDirectProfitPercentage : 24}% अधिक आय</strong> प्राप्त होगी!
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCD7CC] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg font-bold text-[#5C5850] hover:bg-[#FAF8F5]"
          >
            {t.cancel}
          </button>

          <button
            type="submit"
            form="crop-listing-form"
            className="px-4 py-2 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-[#86EFAC]" />
            <span>{t.publishCrop}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


