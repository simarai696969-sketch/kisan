import React, { useState, useEffect } from "react";
import { CropListing, Review, Language } from "../types";
import { translations } from "../data/translations";
import { getLocalizedCropName, getLocalizedUnit } from "../utils/languageUtils";
import { 
  X, 
  Star, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Calendar, 
  Leaf, 
  MessageSquare, 
  ShoppingCart, 
  ArrowRight,
  TrendingDown,
  User,
  Plus,
  Lock,
  Layers,
  PhoneCall,
  Shield,
  Clock,
  Warehouse
} from "lucide-react";

interface CropDetailModalProps {
  crop: CropListing | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddToCart: (crop: CropListing, quantity: number) => void;
  onBuyDirect: (crop: CropListing, quantity: number) => void;
  onAddReview: (cropId: string, review: Omit<Review, "id" | "date">) => void;
  onOpenChat?: (crop: CropListing) => void;
  onOpenCallMasking?: (crop: CropListing) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  isOpen,
  onClose,
  language,
  onAddToCart,
  onBuyDirect,
  onAddReview,
  onOpenChat,
  onOpenCallMasking,
}) => {
  const t = translations[language];
  const isHi = language === "hi";
  const [quantity, setQuantity] = useState(1);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  // Sync quantity when crop changes
  useEffect(() => {
    if (crop) {
      setQuantity(crop.minOrderQuantity || 1);
    }
  }, [crop]);

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

  if (!isOpen || !crop) return null;

  // Calculate bulk discount if applicable
  let applicablePrice = crop.pricePerUnit || 0;
  let appliedTier: any = null;
  if (crop.bulkTiers && crop.bulkTiers.length > 0) {
    const sortedTiers = [...crop.bulkTiers].sort((a, b) => {
      const minB = b.minQuantity ?? b.minQty ?? 0;
      const minA = a.minQuantity ?? a.minQty ?? 0;
      return minB - minA;
    });
    appliedTier = sortedTiers.find((tier) => {
      const minQ = tier.minQuantity ?? tier.minQty ?? 0;
      return quantity >= minQ;
    });
    if (appliedTier) {
      if (appliedTier.pricePerUnit) {
        applicablePrice = appliedTier.pricePerUnit;
      } else if (appliedTier.discountPercentage || appliedTier.discountPercent) {
        const disc = appliedTier.discountPercentage || appliedTier.discountPercent || 0;
        applicablePrice = Math.round(crop.pricePerUnit * (1 - disc / 100));
      }
    }
  }

  const totalPrice = (applicablePrice || 0) * (quantity || 1);
  const originalTotalPrice = (crop.pricePerUnit || 0) * (quantity || 1);
  const savings = Math.max(0, originalTotalPrice - totalPrice);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    onAddReview(crop.id, {
      userName: reviewerName || (isHi ? "सत्यापित उपभोक्ता" : "Verified Buyer"),
      userLocation: isHi ? "स्थानीय मंडी क्रेता" : "Local Buyer",
      rating: reviewRating,
      comment: reviewComment,
      verifiedBuyer: true,
      cropPurchased: `${quantity} ${crop.unit} ${crop.titleHi.split(" ")[0]}`,
    });

    setIsWritingReview(false);
    setReviewComment("");
    setReviewerName("");
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#121212]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-5 border border-[#DCD7CC] shadow-2xl space-y-3.5 my-6 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DCD7CC] pb-2.5">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {crop.isOrganic && (
                <span className="bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5] text-[10px] font-bold px-2 py-0.2 rounded-sm flex items-center gap-1">
                  <Leaf className="w-2.5 h-2.5" />
                  {t.organicCertified}
                </span>
              )}
              <span className="text-[10px] text-[#75716B] font-semibold uppercase">
                {crop.category}
              </span>
              <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                100% ESCROW PROTECTED
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#2D2D2D] mt-0.5">
              {getLocalizedCropName(crop, language)}
            </h2>
          </div>

          <button
            onClick={onClose}
            title={language === "hi" ? "काटें / बंद करें (Close)" : "Close Details"}
            aria-label="Close Crop Details"
            className="p-1.5 px-2.5 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
            <span className="text-[11px]">{language === "hi" ? "काटें" : "Close"}</span>
          </button>
        </div>

        {/* Media & Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#DCD7CC] h-44 relative">
            <img
              src={crop.images[0]}
              alt={crop.titleHi}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {crop.storageCondition && (
              <span className="absolute bottom-2 left-2 bg-[#121212]/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                <Warehouse className="w-2.5 h-2.5 text-[#86EFAC]" />
                {crop.storageCondition}
              </span>
            )}
          </div>

          {/* Farmer Bio Card & Direct Communication Bridge */}
          <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DCD7CC] flex flex-col justify-between space-y-2">
            <div className="flex items-start gap-2.5">
              <img
                src={crop.farmerPhoto}
                alt={crop.farmerName}
                className="w-10 h-10 rounded-full object-cover border border-[#2D5A27]"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-[#2D2D2D] text-xs sm:text-sm">{crop.farmerName}</span>
                  {crop.verifiedKisan && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#2D5A27]" />
                  )}
                </div>
                <div className="text-[10px] text-[#75716B] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#2D5A27]" />
                  <span>{crop.farmerLocation}</span>
                </div>
                <div className="text-[10px] text-[#75716B] mt-0.5">
                  {crop.farmerExperienceYears} वर्षों का कृषि अनुभव • {crop.farmerRating} ★ ({crop.farmerTotalReviews} समीक्षाएं)
                </div>
              </div>
            </div>

            {/* In-App Direct Communication Options */}
            <div className="pt-2 border-t border-[#DCD7CC] flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChat && onOpenChat(crop)}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-[#EBF5EA] text-[#2D5A27] border border-[#2D5A27] rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>{isHi ? "💬 चैट करें" : "Chat Now"}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCallMasking && onOpenCallMasking(crop)}
                className="flex-1 py-1.5 px-2 bg-[#2D5A27] hover:bg-[#234A1F] text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#86EFAC]" />
                <span>{isHi ? "📞 मास्क कॉल" : "Masked Call"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#75716B]">
              <span className="flex items-center gap-1 text-[#2D5A27] font-semibold">
                <ShieldCheck className="w-3 h-3 text-[#2D5A27]" />
                0% फोन नंबर लीक (सुरक्षित ब्रिज)
              </span>
              <span>दूरी: {crop.distanceKm} किमी</span>
            </div>
          </div>
        </div>

        {/* Bulk Pricing Tiers */}
        {crop.bulkTiers && crop.bulkTiers.length > 0 && (
          <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DCD7CC] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#2D2D2D] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
                {isHi ? "थोक खरीद रियायती दरें (Wholesale Bulk Tiers)" : "Wholesale Bulk Tiers"}
              </span>
              <span className="text-[10px] text-[#2D5A27] font-bold">
                {isHi ? "बड़ी मात्रा पर विशेष छूट" : "Discount for larger volume"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className={`p-2 rounded-lg border text-center transition-all ${
                !appliedTier ? "bg-white border-[#2D5A27] ring-1 ring-[#2D5A27]" : "bg-white border-[#E5E0D8]"
              }`}>
                <div className="text-[10px] text-[#75716B]">मानक (Standard):</div>
                <div className="font-bold text-xs text-[#2D2D2D]">₹{crop.pricePerUnit}/{crop.unit}</div>
                <div className="text-[9px] text-[#75716B]">
                  1-{(crop.bulkTiers[0].minQuantity || crop.bulkTiers[0].minQty || 10) - 1} {crop.unit}
                </div>
              </div>

              {crop.bulkTiers.map((tier, idx) => {
                const tierMin = tier.minQuantity ?? tier.minQty ?? 0;
                const tierPrice = tier.pricePerUnit || Math.round(crop.pricePerUnit * (1 - (tier.discountPercentage || tier.discountPercent || 0) / 100));
                const tierDiscount = tier.discountPercentage ?? tier.discountPercent;
                const isSelected = appliedTier && (appliedTier.minQuantity === tierMin || appliedTier.minQty === tierMin);
                return (
                  <div 
                    key={idx} 
                    onClick={() => setQuantity(tierMin)}
                    className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-[#EBF5EA] border-[#2D5A27] ring-1 ring-[#2D5A27]" 
                        : "bg-white border-[#E5E0D8] hover:border-[#2D5A27]"
                    }`}
                  >
                    <div className="text-[10px] text-[#2D5A27] font-bold">Tier {idx + 1} ({tierMin}+ {crop.unit})</div>
                    <div className="font-bold text-xs text-[#2D5A27]">₹{tierPrice}/{crop.unit}</div>
                    <div className="text-[9px] text-[#15803D] font-semibold">
                      {tierDiscount ? `~${tierDiscount}% छूट` : "रियायती दर"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Description & Specs */}
        <div className="space-y-1.5 text-xs">
          <h4 className="font-bold text-[#2D2D2D] text-xs">फसल विवरण व गुणवत्ता विवरण</h4>
          <p className="text-[#5C5850] leading-relaxed text-[11px]">
            {language === "hi" ? crop.descriptionHi : crop.descriptionEn}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
            <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
              <span className="text-[9px] text-[#75716B] block font-sans">{t.harvestedOn}</span>
              <span className="font-bold text-[#2D2D2D] text-[11px]">{crop.harvestDate}</span>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
              <span className="text-[9px] text-[#75716B] block font-sans">{t.availableStock}</span>
              <span className="font-bold text-[#2D2D2D] text-[11px]">{crop.availableStock} {crop.unit}</span>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
              <span className="text-[9px] text-[#75716B] block font-sans">{t.minOrder}</span>
              <span className="font-bold text-[#2D2D2D] text-[11px]">{crop.minOrderQuantity} {crop.unit}</span>
            </div>
            <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
              <span className="text-[9px] text-[#75716B] block font-sans">वजन प्रति इकाई</span>
              <span className="font-bold text-[#2D2D2D] text-[11px]">{crop.unitWeightKg || 100} Kg</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-2 pt-2 border-t border-[#DCD7CC]">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#2D2D2D] text-xs flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>{t.reviewsTitle} ({crop.reviews.length})</span>
            </h4>
            <button
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="text-[11px] font-bold text-[#2D5A27] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>{t.writeReview}</span>
            </button>
          </div>

          {/* Write Review Form */}
          {isWritingReview && (
            <form onSubmit={handleReviewSubmit} className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DCD7CC] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D]">{t.ratingStars}:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= reviewRating
                            ? "fill-[#D97706] text-[#D97706]"
                            : "text-[#DCD7CC]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="आपका नाम (वैकल्पिक)"
                className="w-full py-1 px-2.5 bg-white border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
              />

              <textarea
                rows={2}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={t.reviewComment}
                className="w-full py-1 px-2.5 bg-white border border-[#DCD7CC] rounded-lg text-[#2D2D2D]"
              />

              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsWritingReview(false)}
                  className="px-2.5 py-1 text-[#5C5850] font-semibold hover:bg-[#EDE8DF] rounded-md text-[11px]"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#2D5A27] text-white font-bold rounded-md hover:bg-[#234A1F] shadow-xs text-[11px]"
                >
                  समीक्षा भेजें
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {crop.reviews.length === 0 ? (
              <p className="text-[11px] text-[#75716B] italic py-1">
                अभी तक कोई समीक्षा नहीं है। पहले खरीदार बनें और अपनी राय साझा करें!
              </p>
            ) : (
              crop.reviews.map((rev) => (
                <div key={rev.id} className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DCD7CC] text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#2D2D2D] text-[11px]">{rev.userName}</span>
                      {rev.verifiedBuyer && (
                        <span className="bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5] text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                          {t.verifiedPurchase}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-[#D97706]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-[#D97706] text-[#D97706]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#5C5850] text-[11px] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quantity & Checkout Row with Live Calculation */}
        <div className="pt-2.5 border-t border-[#DCD7CC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#2D2D2D] font-mono">
                ₹{(totalPrice || 0).toLocaleString("en-IN")}
              </span>
              {savings > 0 && (
                <span className="text-xs text-[#15803D] font-bold line-through">
                  ₹{(originalTotalPrice || 0).toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-[11px] font-normal text-[#75716B] font-sans">
                ({quantity} {crop.unit} @ ₹{applicablePrice}/{crop.unit})
              </span>
            </div>
            {savings > 0 && (
              <div className="text-[10px] text-[#15803D] font-bold">
                🎉 थोक टियर डिस्काउंट से ₹{(savings || 0).toLocaleString("en-IN")} की सीधी बचत!
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-[#5C5850] font-medium">मात्रा ({crop.unit}):</span>
              <div className="flex items-center gap-1 bg-[#FAF8F5] rounded-md p-0.5 border border-[#DCD7CC] font-mono">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(crop.minOrderQuantity || 1, quantity - 1))}
                  className="px-2 py-0.5 text-xs font-bold text-[#2D2D2D] hover:bg-[#EDE8DF] rounded"
                >
                  -
                </button>
                <input
                  type="number"
                  min={crop.minOrderQuantity || 1}
                  max={crop.availableStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(crop.availableStock, Number(e.target.value))))}
                  className="w-14 text-center text-xs font-bold bg-transparent border-none focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(crop.availableStock, quantity + 1))}
                  className="px-2 py-0.5 text-xs font-bold text-[#2D2D2D] hover:bg-[#EDE8DF] rounded"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-lg border border-[#DCD7CC] text-[#75716B] hover:text-[#2D2D2D] hover:bg-[#FAF8F5] text-xs font-semibold"
            >
              {t.close}
            </button>

            <button
              onClick={() => {
                onAddToCart(crop, quantity);
                onClose();
              }}
              className="flex-1 sm:flex-initial py-2 px-3.5 rounded-lg border border-[#2D5A27] text-[#2D5A27] hover:bg-[#EBF5EA] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{t.addToCart}</span>
            </button>

            <button
              onClick={() => {
                onBuyDirect(crop, quantity);
                onClose();
              }}
              className="flex-1 sm:flex-initial py-2 px-4 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isHi ? "सुरक्षित एस्क्रो से खरीदें" : "Buy with Escrow"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

