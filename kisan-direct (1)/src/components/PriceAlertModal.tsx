import React, { useState, useEffect } from "react";
import { PriceAlert, MandiRate, Language } from "../types";
import { translations } from "../data/translations";
import { 
  X, 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles
} from "lucide-react";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  mandiRates: MandiRate[];
  language: Language;
  onAddAlert: (alert: Omit<PriceAlert, "id" | "createdAt" | "active">) => void;
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  preselectedCrop?: string;
  preselectedPrice?: number;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  mandiRates,
  language,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  preselectedCrop,
  preselectedPrice,
}) => {
  const t = translations[language];

  const safeRates = Array.isArray(mandiRates) ? mandiRates : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const [cropName, setCropName] = useState(preselectedCrop || safeRates[0]?.cropNameHi || "गेहूं");
  const [targetPrice, setTargetPrice] = useState(preselectedPrice ? Math.round(preselectedPrice * 1.05) : 2450);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [state, setState] = useState("मध्य प्रदेश");
  const [showNotificationToast, setShowNotificationToast] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;

    onAddAlert({
      cropName,
      targetPrice: Number(targetPrice),
      condition,
      state,
      notificationSent: false,
    });

    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3000);
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
        className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 border border-[#DCD7CC] shadow-2xl space-y-4 my-6 animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DCD7CC] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#2D2D2D]">
                {t.priceAlertTitle}
              </h2>
              <p className="text-xs text-[#75716B]">
                {t.priceAlertDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title={language === "hi" ? "काटें / बंद करें (Close)" : "Close Alert Modal"}
            aria-label="Close Price Alert Modal"
            className="p-1.5 px-2.5 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
            <span className="text-[11px]">{language === "hi" ? "काटें" : "Close"}</span>
          </button>
        </div>

        {/* Notification Toast Alert */}
        {showNotificationToast && (
          <div className="bg-[#EBF5EA] text-[#2D5A27] p-2.5 rounded-lg border border-[#B7DDB5] text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
            <span>मूल्य अलर्ट सक्रिय हो गया है! लक्ष्य भाव पर आपको तुरंत सूचित किया जाएगा।</span>
          </div>
        )}

        {/* Add Alert Form */}
        <form onSubmit={handleSubmit} className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DCD7CC] space-y-2.5 text-xs">
          <div className="font-bold text-[#2D2D2D] text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>नया मूल्य अलर्ट बनाएं</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-[#5C5850] block mb-1">फसल चुनें</label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-[#DCD7CC] rounded-lg font-medium text-[#2D2D2D]"
              >
                {safeRates.map((r) => (
                  <option key={r.id} value={r.cropNameHi}>
                    {language === "hi" ? r.cropNameHi : r.cropNameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#5C5850] block mb-1">
                {t.targetPriceLabel}
              </label>
              <input
                type="number"
                required
                min={100}
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full py-1.5 px-2.5 bg-white border border-[#DCD7CC] rounded-lg font-bold text-[#2D5A27] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#5C5850] block mb-1">{t.notifyWhen}</label>
            <div className="grid grid-cols-2 gap-2">
              <label
                onClick={() => setCondition("above")}
                className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer text-xs ${
                  condition === "above"
                    ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18] font-bold"
                    : "bg-white border-[#DCD7CC] text-[#5C5850]"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  checked={condition === "above"}
                  onChange={() => setCondition("above")}
                  className="text-[#2D5A27]"
                />
                <span>{t.conditionAbove}</span>
              </label>

              <label
                onClick={() => setCondition("below")}
                className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer text-xs ${
                  condition === "below"
                    ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18] font-bold"
                    : "bg-white border-[#DCD7CC] text-[#5C5850]"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  checked={condition === "below"}
                  onChange={() => setCondition("below")}
                  className="text-[#2D5A27]"
                />
                <span>{t.conditionBelow}</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.saveAlert}</span>
          </button>
        </form>

        {/* Existing Alerts List */}
        <div className="space-y-1.5 text-xs">
          <div className="font-bold text-[#2D2D2D] flex items-center justify-between">
            <span>{t.activeAlerts} ({safeAlerts.length})</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {safeAlerts.length === 0 ? (
              <p className="text-[#75716B] text-[11px] italic py-2 text-center">
                {t.noActiveAlerts}
              </p>
            ) : (
              safeAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DCD7CC] flex items-center justify-between gap-2.5"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#2D2D2D] flex items-center gap-1.5">
                      <span>{alt.cropName}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-sm font-semibold font-mono ${
                        alt.condition === "above" ? "bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5]" : "bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]"
                      }`}>
                        {alt.condition === "above" ? ">= ₹" + alt.targetPrice : "<= ₹" + alt.targetPrice} /क्विंटल
                      </span>
                    </div>
                    <div className="text-[10px] text-[#75716B]">
                      सेट: {alt.createdAt} • स्थिति: {alt.active ? "सक्रिय" : "निष्क्रिय"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleAlert(alt.id)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        alt.active ? "bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5]" : "bg-[#EDE8DF] text-[#75716B]"
                      }`}
                    >
                      {alt.active ? "सक्रिय" : "चालू करें"}
                    </button>
                    <button
                      onClick={() => onDeleteAlert(alt.id)}
                      className="p-1 text-[#75716B] hover:text-[#DC2626]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 border-t border-[#DCD7CC] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DCD7CC] text-[#75716B] hover:text-[#2D2D2D] hover:bg-[#FAF8F5] text-xs font-semibold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
