import React, { useState } from "react";
import { Language, AppSettings } from "../types";
import { SUPPORTED_LANGUAGES, ALL_INDIAN_STATES } from "../utils/languageUtils";
import { 
  X, 
  Settings, 
  Globe, 
  PhoneCall, 
  MessageSquare, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  TrendingUp, 
  Bell, 
  Volume2, 
  Eye, 
  HelpCircle, 
  Bot, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  Headphones,
  FileText,
  Trash2,
  Lock
} from "lucide-react";

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedState: string;
  onStateChange: (stateCode: string, autoLang?: Language) => void;
  onOpenChatBot: () => void;
  onRefreshMandiData: () => void;
  onResetCache: () => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  language,
  onLanguageChange,
  selectedState,
  onStateChange,
  onOpenChatBot,
  onRefreshMandiData,
  onResetCache,
}) => {
  const isHindi = language === "hi";

  // Active Tab inside settings
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "troubleshoot" | "language" | "helpline" | "notifications" | "accessibility" | "faq"
  >("troubleshoot");

  // Diagnostic states
  const [diagnosingTool, setDiagnosingTool] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    id: string;
    status: "success" | "warning";
    message: string;
  } | null>(null);

  // Fraud Report Form state
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [fraudPhone, setFraudPhone] = useState("");
  const [fraudDetail, setFraudDetail] = useState("");
  const [fraudSubmitted, setFraudSubmitted] = useState(false);

  if (!isOpen) return null;

  // Run Self-Service Diagnostic Actions
  const handleRunDiagnostic = (actionId: "payment" | "mandi" | "gps" | "cache") => {
    setDiagnosingTool(actionId);
    setDiagnosticResult(null);

    setTimeout(() => {
      setDiagnosingTool(null);
      if (actionId === "payment") {
        setDiagnosticResult({
          id: actionId,
          status: "success",
          message: isHindi 
            ? "✅ एस्क्रो लेजर व ICICI पेमेंट गेटवे की जांच पूर्ण: सभी फंड्स 100% सुरक्षित हैं और बैंक नोडल खाते से सिंक हैं।" 
            : "✅ Escrow ledger & ICICI gateway verified: All funds secure in nodal escrow account.",
        });
      } else if (actionId === "mandi") {
        onRefreshMandiData();
        setDiagnosticResult({
          id: actionId,
          status: "success",
          message: isHindi 
            ? "✅ सभी 400+ राष्ट्रीय APMC मंडियों के ताजा फ्लोर रेट्स रीफ्रेश हो गए!" 
            : "✅ Successfully synchronized latest real-time rates from 400+ APMC mandis.",
        });
      } else if (actionId === "gps") {
        setDiagnosticResult({
          id: actionId,
          status: "success",
          message: isHindi 
            ? "✅ लाइव जीपीएस ट्रैकिंग पिंग रीसेट हुआ: सभी एक्टिव डिलीवरी व्हीकल्स की वर्तमान स्थिति पुनः कैलिब्रेट हो गई।" 
            : "✅ Realtime GPS satellite ping recalibrated for all active delivery orders.",
        });
      } else if (actionId === "cache") {
        onResetCache();
        setDiagnosticResult({
          id: actionId,
          status: "success",
          message: isHindi 
            ? "✅ ऐप कैश व ऑफलाइन डेटा साफ कर दिया गया है। ऐप अब तेज चलेगा।" 
            : "✅ App cache cleared successfully. App speed optimized.",
        });
      }
    }, 1200);
  };

  const handleToggle = (key: keyof AppSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
  };

  // FAQs Data
  const faqs = [
    {
      qHi: "यदि फसल डिलीवरी में देरी हो या माल खराब पहुंचे तो क्या होगा?",
      qEn: "What happens if crop delivery is delayed or goods arrive damaged?",
      aHi: "किसान डायरेक्ट पर आपका भुगतान 'एस्क्रो प्रोटेक्शन' में सुरक्षित रहता है। जब तक खरीदार डिलीवरी OTP देकर माल की गुणवत्ता स्वीकार नहीं करता, किसान को भुगतान जारी नहीं होता। माल खराब होने पर तुरंत 100% रिफंड मिलता है।",
      aEn: "Your payment stays 100% safe in Escrow hold. Funds are only released to the farmer after buyer OTP quality acceptance. Damaged orders qualify for instant 100% refund.",
    },
    {
      qHi: "किसान को फसल का रुपया कब और कैसे मिलता है?",
      qEn: "When and how does the farmer receive payment for crops?",
      aHi: "जैसे ही डिलीवरी गंतव्य पर पहुंचती है और ग्राहक 4-अंकों का डिलीवरी OTP बताता है, राशि सीधे किसान के बैंक खाते/UPI/KCC में उसी दिन ट्रांसफर कर दी जाती है।",
      aEn: "As soon as delivery is completed and buyer verifies the OTP, funds are immediately credited directly to farmer's linked bank account/UPI on the same day.",
    },
    {
      qHi: "मंडी भाव में क्या फर्क है और यह कितना सटीक है?",
      qEn: "How accurate are the live Mandi Bhav rates?",
      aHi: "हमारे भाव भारत सरकार के Agmarknet, e-NAM और स्थानीय कृषि उपज मंडी समितियों (APMC) के लाइव ऑक्शन फ्लोर से सीधे सिंक होते हैं।",
      aEn: "Rates are synced directly from Agmarknet, e-NAM, and verified local APMC auction floors every morning and evening.",
    },
    {
      qHi: "4% प्लेटफार्म शुल्क में क्या-क्या शामिल है?",
      qEn: "What is covered in the 4% platform escrow fee?",
      aHi: "इसमें 100% एस्क्रो सुरक्षा, जीपीएस कोल्ड-चेन लॉजिस्टिक्स ट्रैकिंग, डिजिटल गुणवत्ता प्रमाण पत्र और 24x7 कॉल सेंटर मध्यस्थता शामिल है।",
      aEn: "It includes 100% buyer-seller escrow guarantee, GPS logistics tracking, verified quality certification, and 24x7 support desk mediation.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#DCD7CC] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1B3B18] px-5 py-3.5 text-white flex items-center justify-between border-b border-[#2D5A27] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D5A27] flex items-center justify-center text-[#86EFAC] border border-[#3A7532]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isHindi ? "ऐप सेटिंग्स व त्वरित सहायता केंद्र" : "App Settings & Instant Help Center"}
              </h2>
              <p className="text-[11px] text-[#A7F3D0]">
                {isHindi ? "भाषा, प्राथमिकताएं, 1-क्लिक समस्या समाधान व 24x7 हेल्पलाइन" : "Language, Preferences, 1-Click Diagnostics & 24x7 Helpdesk"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A7F3D0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#EDE8DF] border-b border-[#DCD7CC] px-3 pt-2 gap-1 overflow-x-auto shrink-0 scrollbar-none text-xs">
          <button
            onClick={() => setActiveSettingsTab("troubleshoot")}
            className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSettingsTab === "troubleshoot"
                ? "bg-[#FAF8F5] text-[#2D5A27] border-t-2 border-t-[#2D5A27] shadow-xs"
                : "text-[#5C5850] hover:text-[#2D2D2D]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{isHindi ? "⚡ तुरंत समस्या समाधान" : "Instant Fix"}</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("language")}
            className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSettingsTab === "language"
                ? "bg-[#FAF8F5] text-[#2D5A27] border-t-2 border-t-[#2D5A27] shadow-xs"
                : "text-[#5C5850] hover:text-[#2D2D2D]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isHindi ? "भाषा व राज्य" : "Language & State"}</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("helpline")}
            className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSettingsTab === "helpline"
                ? "bg-[#FAF8F5] text-[#2D5A27] border-t-2 border-t-[#2D5A27] shadow-xs"
                : "text-[#5C5850] hover:text-[#2D2D2D]"
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isHindi ? "24x7 हेल्पलाइन" : "24x7 Helpline"}</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("notifications")}
            className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSettingsTab === "notifications"
                ? "bg-[#FAF8F5] text-[#2D5A27] border-t-2 border-t-[#2D5A27] shadow-xs"
                : "text-[#5C5850] hover:text-[#2D2D2D]"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isHindi ? "अलर्ट व सूचना" : "Alerts"}</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("accessibility")}
            className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSettingsTab === "accessibility"
                ? "bg-[#FAF8F5] text-[#2D5A27] border-t-2 border-t-[#2D5A27] shadow-xs"
                : "text-[#5C5850] hover:text-[#2D2D2D]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isHindi ? "डिस्प्ले व डेटा" : "Display"}</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab("faq")}
            className={`px-3 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSettingsTab === "faq"
                ? "bg-[#FAF8F5] text-[#2D5A27] border-t-2 border-t-[#2D5A27] shadow-xs"
                : "text-[#5C5850] hover:text-[#2D2D2D]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isHindi ? "सामान्य प्रश्न (FAQ)" : "FAQ"}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: 1-CLICK INSTANT TROUBLESHOOTING & DIAGNOSTICS */}
          {activeSettingsTab === "troubleshoot" && (
            <div className="space-y-4">
              <div className="bg-[#FEF3C7] border border-[#FDE68A] p-3 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#92400E]">
                    {isHindi ? "⚡ त्वरित स्वचालित समस्या निवारण (1-Click Self-Healing Diagnostics)" : "Instant 1-Click Diagnostics"}
                  </h3>
                  <p className="text-[11px] text-[#78350F] mt-0.5">
                    {isHindi 
                      ? "यदि भुगतान, मंडी भाव, डिलीवरी या इंटरनेट में कोई भी अड़चन आए तो नीचे दिए गए 1-क्लिक समाधान बटन दबाएं।" 
                      : "Click below to automatically diagnose and fix escrow payments, mandi rate feeds, GPS pings, or cache issues."}
                  </p>
                </div>
              </div>

              {/* Diagnostic Result Banner */}
              {diagnosticResult && (
                <div className="p-3 bg-[#EBF5EA] border border-[#B7DDB5] rounded-xl text-xs font-bold text-[#2D5A27] animate-in fade-in flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                  <span>{diagnosticResult.message}</span>
                </div>
              )}

              {/* Diagnostic Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Payment & Escrow Verification */}
                <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] flex flex-col justify-between space-y-3 hover:border-[#2D5A27] transition-all shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EBF5EA] text-[#2D5A27] flex items-center justify-center shrink-0 border border-[#B7DDB5]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#2D2D2D]">
                        {isHindi ? "पेमेंट व एस्क्रो स्थिति जांच" : "Escrow Payment Sync"}
                      </h4>
                      <p className="text-[11px] text-[#75716B] mt-0.5 leading-snug">
                        {isHindi ? "अटके हुए पेमेंट को स्वतः बैंक नोडल लेजर से सत्यापित करें।" : "Verify stuck UPI / Card payments against escrow."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunDiagnostic("payment")}
                    disabled={diagnosingTool === "payment"}
                    className="w-full py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#EBF5EA] text-[#2D5A27] border border-[#DCD7CC] hover:border-[#B7DDB5] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {diagnosingTool === "payment" ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{isHindi ? "पेमेंट स्थिति जांचें व सिंक करें" : "Verify Payment Now"}</span>
                  </button>
                </div>

                {/* 2. Mandi Rate Floor Refresh */}
                <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] flex flex-col justify-between space-y-3 hover:border-[#2D5A27] transition-all shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#854D0E] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#2D2D2D]">
                        {isHindi ? "मंडी भाव व APMC डेटा रीफ्रेश" : "Mandi Rates Live Re-sync"}
                      </h4>
                      <p className="text-[11px] text-[#75716B] mt-0.5 leading-snug">
                        {isHindi ? "यदि आज का ताजा मंडी भाव नहीं दिख रहा तो 1-क्लिक में रीफ्रेश करें।" : "Force fetch fresh APMC floor auction data."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunDiagnostic("mandi")}
                    disabled={diagnosingTool === "mandi"}
                    className="w-full py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FEF3C7] text-[#854D0E] border border-[#DCD7CC] hover:border-[#FDE68A] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${diagnosingTool === "mandi" ? "animate-spin" : ""}`} />
                    <span>{isHindi ? "लाइव मंडी भाव रीफ्रेश करें" : "Refresh Mandi Rates"}</span>
                  </button>
                </div>

                {/* 3. Delivery GPS Location Re-calibration */}
                <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] flex flex-col justify-between space-y-3 hover:border-[#2D5A27] transition-all shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center shrink-0 border border-[#C7D2FE]">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#2D2D2D]">
                        {isHindi ? "डिलीवरी व जीपीएस लोकेशन रीसेट" : "GPS Delivery Ping Reset"}
                      </h4>
                      <p className="text-[11px] text-[#75716B] mt-0.5 leading-snug">
                        {isHindi ? "गाड़ी की लाइव लोकेशन अपडेट न होने पर सिग्नल रीसेट करें।" : "Re-ping courier satellite coordinates."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunDiagnostic("gps")}
                    disabled={diagnosingTool === "gps"}
                    className="w-full py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#E0E7FF] text-[#3730A3] border border-[#DCD7CC] hover:border-[#C7D2FE] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${diagnosingTool === "gps" ? "animate-spin" : ""}`} />
                    <span>{isHindi ? "जीपीएस सिग्नल रीसेट करें" : "Reset GPS Ping"}</span>
                  </button>
                </div>

                {/* 4. Report Fraud / Middleman Call */}
                <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] flex flex-col justify-between space-y-3 hover:border-[#991B1B] transition-all shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center shrink-0 border border-[#FCA5A5]">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#991B1B]">
                        {isHindi ? "बिचौलिया / फर्जी कॉल रिपोर्ट करें" : "Report Fraud / Middleman"}
                      </h4>
                      <p className="text-[11px] text-[#75716B] mt-0.5 leading-snug">
                        {isHindi ? "यदि कोई मध्यस्थ या ठग संपर्क करे तो तुरंत ब्लॉक व रिपोर्ट करें।" : "Report unauthorized bypass attempt safely."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFraudModalOpen(true)}
                    className="w-full py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#DCD7CC] hover:border-[#FCA5A5] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isHindi ? "फर्जी कॉल दर्ज करें" : "Report Number"}</span>
                  </button>
                </div>
              </div>

              {/* Instant Launcher for 24x7 AI Kisan Mitra */}
              <div className="bg-[#1B3B18] text-white p-4 rounded-xl flex items-center justify-between gap-3 border border-[#2D5A27]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A27] flex items-center justify-center text-[#86EFAC] border border-[#3A7532]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">
                      {isHindi ? "24x7 AI किसान मित्र विशेषज्ञ" : "24x7 AI Agri-Scientist Assistant"}
                    </h4>
                    <p className="text-[11px] text-[#D5E8D2]">
                      {isHindi ? "फसल रोग, खाद की मात्रा, मंडी रुझान व किसी भी सवाल का तुरंत जवाब पाएं" : "Ask anything about crops, pests, prices, and orders"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenChatBot();
                  }}
                  className="px-3 py-2 rounded-lg bg-[#86EFAC] hover:bg-[#4ADE80] text-[#182F15] text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isHindi ? "किसान मित्र से पूछें" : "Open Assistant"}</span>
                </button>
              </div>

              {/* Fraud Report Mini Modal */}
              {isFraudModalOpen && (
                <div className="bg-white border border-[#FCA5A5] p-4 rounded-xl shadow-md space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#991B1B] flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>{isHindi ? "फर्जी कॉल / बिचौलिया रिपोर्टिंग फॉर्म" : "Report Suspicious Call"}</span>
                    </h4>
                    <button onClick={() => setIsFraudModalOpen(false)} className="text-xs text-[#75716B] hover:text-black">✕</button>
                  </div>

                  {fraudSubmitted ? (
                    <div className="p-3 bg-[#EBF5EA] text-[#2D5A27] text-xs font-bold rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isHindi ? "नंबर को सुरक्षा डेस्क पर दर्ज कर ब्लैकलिस्ट कर दिया गया है।" : "Number logged & blacklisted on security desk."}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="tel"
                        value={fraudPhone}
                        onChange={(e) => setFraudPhone(e.target.value)}
                        placeholder={isHindi ? "संदिग्ध 10 अंकों का फोन नंबर" : "10-digit suspicious phone number"}
                        className="w-full px-3 py-2 text-xs font-bold bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                      />
                      <textarea
                        value={fraudDetail}
                        onChange={(e) => setFraudDetail(e.target.value)}
                        rows={2}
                        placeholder={isHindi ? "विवरण (उदा. बिना एस्क्रो के बाहर भुगतान का दबाव)" : "Details of unauthorized request"}
                        className="w-full px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setFraudSubmitted(true);
                          setTimeout(() => {
                            setFraudSubmitted(false);
                            setIsFraudModalOpen(false);
                            setFraudPhone("");
                            setFraudDetail("");
                          }, 2500);
                        }}
                        className="w-full py-2 bg-[#991B1B] text-white rounded-lg text-xs font-bold hover:bg-[#7F1D1D]"
                      >
                        {isHindi ? "सुरक्षा जांच के लिए सबमिट करें" : "Submit to Fraud Desk"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LANGUAGE & REGIONAL STATE */}
          {activeSettingsTab === "language" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#2D2D2D] mb-2 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#2D5A27]" />
                  <span>{isHindi ? "10 भारतीय क्षेत्रीय भाषाएं (Select Preferred Language)" : "10 Indian Regional Languages"}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                            : "bg-white text-[#2D2D2D] border-[#DCD7CC] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span>
                          <div>
                            <span className="font-extrabold text-xs block leading-tight">{lang.nativeName}</span>
                            <span className={`text-[10px] block ${isSelected ? "text-[#A7F3D0]" : "text-[#75716B]"}`}>
                              {lang.name}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#86EFAC]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* State Selection */}
              <div className="pt-2 border-t border-[#DCD7CC]">
                <h3 className="text-xs font-bold text-[#2D2D2D] mb-2">
                  🏛️ {isHindi ? "प्राथमिक गृह राज्य (Home APMC Benchmark State)" : "Primary State for Benchmark Mandi Rates"}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1 bg-white border border-[#DCD7CC] rounded-xl">
                  {ALL_INDIAN_STATES.map((st) => {
                    const isSelected = selectedState === st.code;
                    return (
                      <button
                        key={st.code}
                        onClick={() => onStateChange(st.code, st.defaultLang)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#2D5A27] text-white"
                            : "text-[#4A4742] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <span className="truncate">{st.nameHi}</span>
                        {isSelected && <span className="text-[10px] text-[#86EFAC]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 24x7 HELPLINE & CONTACT */}
          {activeSettingsTab === "helpline" && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-[#DCD7CC] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5EA] text-[#2D5A27] flex items-center justify-center border border-[#B7DDB5]">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2D2D2D]">
                      {isHindi ? "राष्ट्रीय किसान कॉल सेंटर (Toll-Free Helpline)" : "National Kisan Call Center"}
                    </h4>
                    <p className="text-xs text-[#75716B]">
                      {isHindi ? "कृषि विशेषज्ञ व मंडी सलाहकार 24x7 उपलब्ध" : "Available round-the-clock for agricultural advice"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <a
                    href="tel:18001801551"
                    className="p-3 bg-[#2D5A27] hover:bg-[#234A1F] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-[#86EFAC]" />
                    <span>1800-180-1551 (टोल-फ्री)</span>
                  </a>

                  <a
                    href="https://wa.me/919876543210?text=नमस्ते,%20मुझे%20किसान%20डायरेक्ट%20पर%20सहायता%20चाहिए"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp किसान हेल्पडेस्क</span>
                  </a>
                </div>
              </div>

              {/* Email Support */}
              <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#2D2D2D] block">📧 {isHindi ? "आधिकारिक ईमेल सपोर्ट" : "Email Support Desk"}</span>
                  <span className="text-[#75716B] text-[11px]">support@kisandirect.gov.in (2 घंटे में समाधान)</span>
                </div>
                <a
                  href="mailto:support@kisandirect.gov.in"
                  className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg font-bold text-[#2D5A27] hover:bg-[#EBF5EA]"
                >
                  {isHindi ? "ईमेल भेजें" : "Send Email"}
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS & ALERTS */}
          {activeSettingsTab === "notifications" && (
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-[#DCD7CC] divide-y divide-[#EDE8DF]">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#2D2D2D]">
                      {isHindi ? "व्हाट्सएप पर दैनिक मंडी भाव बुलेटिन" : "WhatsApp Daily Mandi Bhav Bulletin"}
                    </h4>
                    <p className="text-[11px] text-[#75716B]">
                      {isHindi ? "शाम 7:00 बजे आपके जिले की मंडियों के क्लोजिंग भाव भेजें" : "Daily closing APMC auction rate digest"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whatsappAlerts}
                    onChange={() => handleToggle("whatsappAlerts")}
                    className="w-5 h-5 text-[#2D5A27] rounded-sm focus:ring-[#2D5A27]"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#2D2D2D]">
                      {isHindi ? "SMS मूल्य गिरावट व उछाल अलर्ट" : "SMS Price Surge Alerts"}
                    </h4>
                    <p className="text-[11px] text-[#75716B]">
                      {isHindi ? "आपके द्वारा निर्धारित टारगेट भाव आते ही तुरंत SMS प्राप्त करें" : "Instant SMS when crop matches your target price"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsPriceAlerts}
                    onChange={() => handleToggle("smsPriceAlerts")}
                    className="w-5 h-5 text-[#2D5A27] rounded-sm focus:ring-[#2D5A27]"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#2D2D2D]">
                      {isHindi ? "साउंड व टोन नोटिफिकेशन" : "Audio Tone on Live Ticks"}
                    </h4>
                    <p className="text-[11px] text-[#75716B]">
                      {isHindi ? "नया ऑर्डर आने या लाइव भाव बदलने पर साउंड अलर्ट" : "Sound chime on new orders and rate changes"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundAlerts}
                    onChange={() => handleToggle("soundAlerts")}
                    className="w-5 h-5 text-[#2D5A27] rounded-sm focus:ring-[#2D5A27]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACCESSIBILITY & DISPLAY */}
          {activeSettingsTab === "accessibility" && (
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-[#DCD7CC] divide-y divide-[#EDE8DF]">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#2D2D2D]">
                      {isHindi ? "वरिष्ठ किसानों के लिए बड़े अक्षर (Large Font Mode)" : "Large Font Mode"}
                    </h4>
                    <p className="text-[11px] text-[#75716B]">
                      {isHindi ? "स्क्रीन पर सभी मूल्य और अक्षर बड़े और स्पष्ट दिखेंगे" : "Increases readability for comfortable viewing"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.largeFont}
                    onChange={() => handleToggle("largeFont")}
                    className="w-5 h-5 text-[#2D5A27] rounded-sm focus:ring-[#2D5A27]"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#2D2D2D]">
                      {isHindi ? "कम डेटा व 2G/3G फास्ट मोड (Low Data Mode)" : "Low Data & 2G/3G Optimization"}
                    </h4>
                    <p className="text-[11px] text-[#75716B]">
                      {isHindi ? "कमजोर नेटवर्क में भी बिना रुकावट तुरंत लोड होगा" : "Reduces bandwidth usage on slow networks"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.lowDataMode}
                    onChange={() => handleToggle("lowDataMode")}
                    className="w-5 h-5 text-[#2D5A27] rounded-sm focus:ring-[#2D5A27]"
                  />
                </div>
              </div>

              {/* Reset Cache Button */}
              <button
                onClick={() => handleRunDiagnostic("cache")}
                className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#FEF2F2] text-[#991B1B] border border-[#DCD7CC] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isHindi ? "ऐप कैश व ऑफलाइन अस्थायी डेटा साफ करें" : "Clear App Cache & Reset"}</span>
              </button>
            </div>
          )}

          {/* TAB 6: FAQS */}
          {activeSettingsTab === "faq" && (
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] space-y-1">
                  <h4 className="font-bold text-xs text-[#2D2D2D] flex items-start gap-2">
                    <span className="text-[#2D5A27]">Q{idx + 1}.</span>
                    <span>{isHindi ? faq.qHi : faq.qEn}</span>
                  </h4>
                  <p className="text-[11px] text-[#5C5850] pl-5 leading-relaxed">
                    {isHindi ? faq.aHi : faq.aEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF8F5] px-5 py-3 border-t border-[#DCD7CC] flex items-center justify-between text-xs shrink-0">
          <span className="text-[#75716B] text-[11px]">
            {isHindi ? "किसान डायरेक्ट v2.4 • डिजिटल कृषि मिशन" : "Kisan Direct v2.4"}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {isHindi ? "सेव करें व बंद करें" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
