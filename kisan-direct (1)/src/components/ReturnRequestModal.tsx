import React, { useState } from "react";
import { DeliveryOrder, Language, DisputeTicket } from "../types";
import { 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Camera, 
  Upload, 
  CheckCircle2, 
  X, 
  Clock, 
  IndianRupee, 
  Wallet, 
  HelpCircle,
  FileCheck2
} from "lucide-react";

interface ReturnRequestModalProps {
  order: DeliveryOrder;
  language: Language;
  onClose: () => void;
  onSubmitReturn: (
    orderId: string, 
    returnDetails: {
      reason: string;
      reasonType: DisputeTicket["reason"];
      description: string;
      evidencePhotos: string[];
      refundMethod: "original_upi" | "instant_wallet";
    }
  ) => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  order,
  language,
  onClose,
  onSubmitReturn,
}) => {
  const isHi = language === "hi";

  const [selectedReasonType, setSelectedReasonType] = useState<DisputeTicket["reason"]>("damaged_in_transit");
  const [customDescription, setCustomDescription] = useState("");
  const [refundMethod, setRefundMethod] = useState<"original_upi" | "instant_wallet">("original_upi");
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const returnReasons: { type: DisputeTicket["reason"]; titleHi: string; titleEn: string; descHi: string }[] = [
    {
      type: "damaged_in_transit",
      titleHi: "परिवहन के दौरान क्षति या फसल दबना / सड़ना",
      titleEn: "Transit Damage / Crushed Crop in Transit",
      descHi: "सड़क परिवहन के दौरान फसल की बोरियां फटना, दबना या अत्यधिक गर्मी से खराब होना।"
    },
    {
      type: "quality_mismatch",
      titleHi: "AI ग्रेड व लिस्टिंग गुणवत्ता से भिन्न माल",
      titleEn: "Quality Mismatch from Listed Grade",
      descHi: "प्राप्त फसल का दाना, रंग या ताजगी ऐप पर दिखाए गए फोटो/ग्रेड से मेल नहीं खाता।"
    },
    {
      type: "weight_shortage",
      titleHi: "वजन या मात्रा में कमी (Short Quantity)",
      titleEn: "Short Quantity / Deficient Weight",
      descHi: "वजन कांटे पर तोलने पर पैकेट में कुल मात्रा बिल से कम निकली।"
    },
    {
      type: "delayed_spoilage",
      titleHi: "अत्यधिक डिलीवरी देरी से ताजगी नष्ट होना",
      titleEn: "Freshness Lost Due to Severe Delay",
      descHi: "तय समय से अत्यधिक देरी के कारण ताजी हरी सब्जियां सूख गईं।"
    }
  ];

  const handleAddSamplePhoto = () => {
    // Add realistic sample photo
    const samples = [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
    ];
    const nextPhoto = samples[evidencePhotos.length % samples.length];
    setEvidencePhotos(prev => [...prev, nextPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setEvidencePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reasonObj = returnReasons.find(r => r.type === selectedReasonType);
    const reasonText = reasonObj ? reasonObj.titleHi : "फसल वापसी अनुरोध";

    setTimeout(() => {
      onSubmitReturn(order.id, {
        reason: reasonText,
        reasonType: selectedReasonType,
        description: customDescription || reasonObj?.descHi || "उपभोक्ता द्वारा गुणवत्ता समस्या की रिपोर्ट की गई।",
        evidencePhotos,
        refundMethod
      });
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DCD7CC] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#B45309] text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isHi ? "24-घंटे आसान वापसी व रिफंड अनुरोध" : "24-Hour Return & Refund Request"}
              </h3>
              <p className="text-[11px] text-amber-100">
                ऑर्डर: {order.orderNumber} • {order.cropNameHi}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmittedSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#EBF5EA] text-[#2D5A27] flex items-center justify-center mx-auto border border-[#B7DDB5]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-[#2D2D2D]">
                {isHi ? "वापसी अनुरोध सफलतापूर्वक दर्ज!" : "Return Request Registered!"}
              </h4>
              <p className="text-xs text-[#5C5850] max-w-sm mx-auto leading-relaxed">
                {isHi 
                  ? "किसान डायरेक्ट एस्क्रो वॉल्ट से किसान का पेआउट तत्काल रोक (Hold) दिया गया है। हमारा एडमिन पैनल 2 घंटे के भीतर जांच कर आपके खाते में रिफंड जारी करेगा।"
                  : "Escrow funds locked. Our safety admin desk is reviewing your ticket for rapid resolution."}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DCD7CC] text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#75716B]">रिफंड योग्य कुल राशि:</span>
                <strong className="text-[#2D5A27] font-mono text-sm">₹{order.totalAmount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75716B]">रिफंड माध्यम:</span>
                <strong className="text-[#2D2D2D]">
                  {refundMethod === "instant_wallet" ? "किसान डायरेक्ट वॉलेट (तत्काल)" : "मूल UPI / बैंक खाता (24 घंटे)"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75716B]">एस्क्रो सुरक्षा स्थिति:</span>
                <span className="text-[#B45309] font-bold">🔒 होल्ड व सुरक्षित</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold transition-colors shadow-xs"
            >
              {isHi ? "ठीक है, ट्रैक करें (Done)" : "Done"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#2D2D2D]">
            
            {/* 24-Hour Policy Banner */}
            <div className="bg-[#FEF3C7] p-3 rounded-xl border border-[#FDE68A] text-[#92400E] flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>🔒 100% उपभोक्ता सुरक्षा गारंटी:</strong> डिलीवरी के 24 घंटे के भीतर किसी भी खराबी या गुणवत्ता अंतर पर आपका पूरा भुगतान एस्क्रो में सुरक्षित है। अनुरोध दर्ज होते ही किसान पेआउट स्वतः होल्ड हो जाता है।
              </div>
            </div>

            {/* Step 1: Select Reason */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-[#2D2D2D] block">
                1. वापसी / शिकायत का मुख्य कारण चुनें (Select Reason):
              </label>
              <div className="space-y-2">
                {returnReasons.map((item) => (
                  <label
                    key={item.type}
                    onClick={() => setSelectedReasonType(item.type)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReasonType === item.type
                        ? "bg-[#FEF3C7] border-[#D97706] text-[#92400E]"
                        : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnReason"
                      checked={selectedReasonType === item.type}
                      onChange={() => setSelectedReasonType(item.type)}
                      className="mt-0.5 text-[#B45309] focus:ring-[#B45309]"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs">{item.titleHi}</div>
                      <div className="text-[10px] text-[#75716B] mt-0.5">{item.descHi}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Custom Description */}
            <div className="space-y-1">
              <label className="font-bold text-[#2D2D2D] block">
                2. समस्या का संक्षिप्त विवरण (Issue Details):
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="उदा. टमाटर नीचे के हिस्से में दब गए हैं, कृपया जांच कर रिफंड करें..."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-xl text-xs text-[#2D2D2D] focus:outline-none focus:border-[#B45309] focus:bg-white"
                rows={2}
              />
            </div>

            {/* Step 3: Photo Evidence Upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#2D2D2D] block">
                  3. फसल / खराबी के फोटो प्रमाण (Evidence Photos):
                </label>
                <button
                  type="button"
                  onClick={handleAddSamplePhoto}
                  className="text-[10px] font-bold text-[#2D5A27] hover:underline flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>+ फोटो जोड़ें</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {evidencePhotos.map((photo, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg border border-[#DCD7CC] overflow-hidden shrink-0 group">
                    <img src={photo} alt="evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSamplePhoto}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-[#DCD7CC] hover:border-[#2D5A27] bg-[#FAF8F5] flex flex-col items-center justify-center text-[#75716B] hover:text-[#2D5A27] shrink-0 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">अपलोड</span>
                </button>
              </div>
            </div>

            {/* Step 4: Refund Method Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#2D2D2D] block">
                4. रिफंड प्राप्ति का पसंदीदा माध्यम:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefundMethod("original_upi")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    refundMethod === "original_upi"
                      ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18]"
                      : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850]"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>मूल UPI / बैंक खाता</span>
                  </div>
                  <div className="text-[10px] text-[#75716B] mt-0.5">24 घंटे में सीधे बैंक में</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundMethod("instant_wallet")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    refundMethod === "instant_wallet"
                      ? "bg-[#FEF3C7] border-[#D97706] text-[#92400E]"
                      : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850]"
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>किसान डायरेक्ट वॉलेट</span>
                  </div>
                  <div className="text-[10px] text-[#B45309] font-bold mt-0.5">तत्काल + ₹50 बोनस कूपन</div>
                </button>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white font-extrabold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>एस्क्रो होल्ड व दर्ज हो रहा है...</span>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>वापसी अनुरोध सबमिट करें (₹{order.totalAmount})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#DCD7CC] text-[#5C5850] hover:bg-[#FAF8F5] font-semibold text-xs"
              >
                रद्द करें
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
