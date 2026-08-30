import React, { useState } from "react";
import { Language, UserRole } from "../types";
import { SUPPORTED_LANGUAGES, ALL_INDIAN_STATES, StateInfo } from "../utils/languageUtils";
import { translations } from "../data/translations";
import { Globe, MapPin, Check, Sparkles, X, ChevronRight } from "lucide-react";

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  selectedState: string;
  onSelectState: (stateCode: string, autoLang?: Language) => void;
  userRole: UserRole;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
  selectedState,
  onSelectState,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<"languages" | "states">("languages");
  const [searchQuery, setSearchQuery] = useState("");
  const t = translations[currentLanguage];

  if (!isOpen) return null;

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const activeStateObj = ALL_INDIAN_STATES.find(s => s.code === selectedState || s.nameEn === selectedState || s.nameHi === selectedState) || ALL_INDIAN_STATES[0];

  const filteredStates = ALL_INDIAN_STATES.filter(s => 
    s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nameHi.includes(searchQuery) ||
    s.nameNative.includes(searchQuery) ||
    s.majorHubs.includes(searchQuery)
  );

  const handleStateClick = (state: StateInfo) => {
    onSelectState(state.code, state.defaultLang);
    onSelectLanguage(state.defaultLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF8F5] border border-[#DCD7CC] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1B3B18] text-white p-5 flex items-start justify-between border-b border-[#2D5A27]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#2D5A27] text-[#86EFAC]">
                <Globe className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">
                {currentLanguage === "hi" ? "भाषा और राज्य चुनें" : 
                 currentLanguage === "pa" ? "ਭਾਸ਼ਾ ਅਤੇ ਰਾਜ ਚੁਣੋ" :
                 currentLanguage === "mr" ? "भाषा आणि राज्य निवडा" :
                 currentLanguage === "gu" ? "ભાષા અને રાજ્ય પસંદ કરો" :
                 currentLanguage === "te" ? "భాష మరియు రాష్ట్రాన్ని ఎంచుకోండి" :
                 currentLanguage === "kn" ? "ಭಾಷೆ ಮತ್ತು ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ" :
                 currentLanguage === "ta" ? "மொழி மற்றும் மாநிலத்தைத் தேர்வுசெய்க" :
                 currentLanguage === "bn" ? "ভাষা ও রাজ্য নির্বাচন করুন" :
                 currentLanguage === "ml" ? "ഭാഷയും സംസ്ഥാനവും തിരഞ്ഞെടുക്കുക" :
                 "Select Language & State"}
              </h2>
            </div>
            <p className="text-xs text-[#D5E8D2] font-medium">
              {currentLanguage === "hi" ? "किसान और ग्राहक अपनी क्षेत्रीय भाषा में 100% सही नाम और भाव देखें" :
               "Get 100% verified authentic crop names & mandi rates tailored to your state"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#2D5A27] text-[#D5E8D2] hover:text-white hover:bg-[#234A1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#DCD7CC] bg-[#EDE8DF] p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab("languages")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "languages"
                ? "bg-[#2D5A27] text-white shadow-xs"
                : "text-[#4A4742] hover:bg-[#FAF8F5]"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>10 भारतीय भाषाएं (10 Languages)</span>
          </button>

          <button
            onClick={() => setActiveTab("states")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "states"
                ? "bg-[#2D5A27] text-white shadow-xs"
                : "text-[#4A4742] hover:bg-[#FAF8F5]"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>राज्य अनुसार ऑटो-भाषा (States)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "languages" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A4742] uppercase tracking-wider">
                  Select Preferred Language
                </span>
                <span className="text-[11px] text-[#2D5A27] font-semibold flex items-center gap-1 bg-[#EBF5EA] px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Active: {activeLangObj.nativeName} ({activeLangObj.name})
                </span>
              </div>

              {/* Grid of 10 Indian Regional Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLanguage(lang.code);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-[#EBF5EA] border-[#2D5A27] ring-1 ring-[#2D5A27] shadow-xs"
                          : "bg-white border-[#DCD7CC] hover:border-[#2D5A27]/50 hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-[#2D2D2D]">
                              {lang.nativeName}
                            </span>
                            <span className="text-xs text-[#75716B] font-medium">
                              ({lang.name})
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8C8880] truncate max-w-[170px]">
                            {lang.primaryStates.join(", ")}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-[#2D5A27] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#8C8880] shrink-0 opacity-40" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* State Suggestion Banner */}
              <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-3 flex items-start gap-2.5 text-[#92400E] text-xs">
                <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">राज्य के अनुसार भाषा स्वतः सेट करें:</p>
                  <p className="text-[11px] text-[#78350F] mt-0.5">
                    यदि आप पंजाब, महाराष्ट्र, गुजरात, आंध्र/तेलंगाना, कर्नाटक, तमिलनाडु, बंगाल या केरल से हैं, तो 'राज्य' टैब से अपना राज्य चुनें।
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* States Tab with Auto Language Detection */
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="राज्य या प्रमुख मंडी खोजें (उदा. पंजाब, गुजरात, नासिक...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#DCD7CC] focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
                />
              </div>

              <div className="space-y-2">
                {filteredStates.map((state) => {
                  const isStateSelected = selectedState === state.code || selectedState === state.nameEn || selectedState === state.nameHi;
                  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === state.defaultLang);

                  return (
                    <button
                      key={state.code}
                      onClick={() => handleStateClick(state)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isStateSelected
                          ? "bg-[#EBF5EA] border-[#2D5A27] ring-1 ring-[#2D5A27]"
                          : "bg-white border-[#DCD7CC] hover:border-[#2D5A27]/50 hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isStateSelected ? "text-[#2D5A27]" : "text-[#75716B]"}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#2D2D2D]">
                              {state.nameNative}
                            </span>
                            <span className="text-xs text-[#75716B]">
                              ({state.nameEn})
                            </span>
                            {langInfo && (
                              <span className="text-[10px] bg-[#EDE8DF] text-[#4A4742] font-semibold px-1.5 py-0.5 rounded-sm">
                                {langInfo.nativeName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8C8880] mt-0.5">
                            🌾 प्रमुख मंडियां: {state.majorHubs}
                          </p>
                        </div>
                      </div>

                      {isStateSelected ? (
                        <span className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#2D5A27] flex items-center gap-0.5 shrink-0">
                          चुनें <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EDE8DF] border-t border-[#DCD7CC] flex items-center justify-between">
          <div className="text-xs text-[#5C5850]">
            <span className="font-bold text-[#2D2D2D]">{activeLangObj.nativeName}</span> ({activeStateObj.nameEn})
          </div>
          <button
            onClick={onClose}
            className="bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-xs"
          >
            {currentLanguage === "hi" ? "लागू करें" : 
             currentLanguage === "pa" ? "ਲਾਗੂ ਕਰੋ" :
             currentLanguage === "mr" ? "लागू करा" :
             currentLanguage === "gu" ? "લાગુ કરો" :
             currentLanguage === "te" ? "వర్తింపజేయి" :
             currentLanguage === "kn" ? "ಅನ್ವಯಿಸಿ" :
             currentLanguage === "ta" ? "பயன்படுத்து" :
             currentLanguage === "bn" ? "প্রয়োগ করুন" :
             currentLanguage === "ml" ? "ബാധകമാക്കുക" :
             "Apply & Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
