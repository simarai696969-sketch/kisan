import React, { useState } from "react";
import { MandiRate, Language } from "../types";
import { getLocalizedCropName, getLocalizedUnit } from "../utils/languageUtils";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Play, 
  Pause, 
  ArrowRight
} from "lucide-react";

interface LiveMandiTickerBarProps {
  mandiRates: MandiRate[];
  language: Language;
  onSelectMandiRate: (rate: MandiRate) => void;
  onViewAllMandi?: () => void;
}

export const LiveMandiTickerBar: React.FC<LiveMandiTickerBarProps> = ({
  mandiRates,
  language,
  onSelectMandiRate,
  onViewAllMandi,
}) => {
  const [speed, setSpeed] = useState<"normal" | "fast" | "slow">("slow");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const safeRates = Array.isArray(mandiRates) && mandiRates.length > 0 ? mandiRates : [];
  // Duplicate list to achieve infinite seamless CSS scrolling loop
  const marqueeList = [...safeRates, ...safeRates];

  const getAnimationClass = () => {
    if (isPaused) return "";
    if (speed === "fast") return "animate-marquee-fast";
    if (speed === "slow") return "animate-marquee-slow";
    return "animate-marquee";
  };

  const getLocalizedTickerHeader = () => {
    switch (language) {
      case "pa": return "🔴 ਲਾਈਵ ਮੰਡੀ ਭਾਅ";
      case "mr": return "🔴 थेट बाजार भाव";
      case "gu": return "🔴 લાઈવ યાર્ડ ભાવ";
      case "te": return "🔴 లైవ్ మార్కెట్ ధరలు";
      case "kn": return "🔴 ಲೈವ್ ಮಂಡಿ ದರಗಳು";
      case "ta": return "🔴 நேரலை மண்டி விலை";
      case "bn": return "🔴 লাইভ মান্ডি দর";
      case "ml": return "🔴 തത്സമയ വിപണി വില";
      case "en": return "🔴 Live Mandi Ticker";
      default: return "🔴 लाइव मंडी भाव";
    }
  };

  const getLocalizedClickHint = () => {
    switch (language) {
      case "pa": return "ਵੇਰਵੇ ਲਈ ਫ਼ਸਲ 'ਤੇ ਕਲਿੱਕ ਕਰੋ 👆";
      case "mr": return "सविस्तर माहितीसाठी क्लिक करा 👆";
      case "gu": return "વિગત માટે ક્લિક કરો 👆";
      case "te": return "వివరాల కోసం క్లిక్ చేయండి 👆";
      case "kn": return "ವಿವರಗಳಿಗಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ 👆";
      case "ta": return "விவரங்களுக்கு கிளிக் செய்க 👆";
      case "bn": return "বিস্তারিত দেখতে ক্লিক করুন 👆";
      case "ml": return "വിവരങ്ങൾക്ക് ക്ലിക്ക് ചെയ്യുക 👆";
      case "en": return "Click any commodity for details 👆";
      default: return "क्लिक करें 👆 पूरी जानकारी के लिए";
    }
  };

  return (
    <div className="w-full bg-[#182F15] text-white border-b-2 border-[#2D5A27] shadow-lg sticky top-0 z-40 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center">
        
        {/* Left Fixed Header / Badge */}
        <div className="bg-[#122410] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 border-r border-[#2D5A27] shrink-0 z-10 shadow-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86EFAC] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#86EFAC]"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-black text-[#86EFAC] uppercase tracking-wider flex items-center gap-1">
              <span>{getLocalizedTickerHeader()}</span>
            </span>
            <span className="text-[9px] text-[#A8C8A3] hidden sm:block">
              {getLocalizedClickHint()}
            </span>
          </div>
        </div>

        {/* Center Marquee Container */}
        <div 
          className="flex-1 overflow-hidden relative flex items-center py-1.5"
          style={{ maskImage: "linear-gradient(to right, transparent, black 2%, black 98%, transparent)" }}
        >
          <div 
            className={`flex items-center gap-3 whitespace-nowrap ${getAnimationClass()}`}
            style={isPaused ? { transform: "none" } : undefined}
          >
            {marqueeList.map((rate, index) => {
              const isUp = rate.trend === "up";
              const isDown = rate.trend === "down";
              const localizedCrop = getLocalizedCropName(rate, language);

              return (
                <button
                  key={`${rate.id}-${index}`}
                  onClick={() => onSelectMandiRate(rate)}
                  className="group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#234A1F]/80 hover:bg-[#2D5A27] border border-[#3A6B32] hover:border-[#86EFAC] transition-all hover:scale-105 hover:shadow-md cursor-pointer shrink-0 text-left"
                  title={`${localizedCrop} - ${rate.marketName}`}
                >
                  {/* Crop Name */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-[#86EFAC] transition-colors">
                      {localizedCrop}
                    </span>
                    <span className="text-[10px] text-[#A8C8A3] hidden md:inline">
                      ({rate.variety.split(" ")[0]})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-[#86EFAC]">
                      ₹{(rate.currentPrice || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[9px] text-[#D1E7CD]">/{getLocalizedUnit("quintal", language)}</span>
                  </div>

                  {/* Trend Indicator */}
                  <div 
                    className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isUp 
                        ? "bg-[#1E4D1B] text-[#86EFAC] border border-[#3E8037]" 
                        : isDown 
                        ? "bg-[#4D1B1B] text-[#FFA07A] border border-[#803737]" 
                        : "bg-[#2D2D2D] text-[#CCC]"
                    }`}
                  >
                    {isUp && <TrendingUp className="w-3 h-3 text-[#86EFAC]" />}
                    {isDown && <TrendingDown className="w-3 h-3 text-[#FFA07A]" />}
                    {rate.trend === "stable" && <Minus className="w-3 h-3 text-[#CCC]" />}
                    <span>{rate.changePercentage >= 0 ? `+${rate.changePercentage}%` : `${rate.changePercentage}%`}</span>
                  </div>

                  {/* Mandi Tag */}
                  <div className="flex items-center gap-0.5 text-[10px] text-[#FFA07A] bg-[#122410] px-1.5 py-0.5 rounded border border-[#2D5A27]">
                    <MapPin className="w-2.5 h-2.5 text-[#FFA07A]" />
                    <span className="font-semibold truncate max-w-[90px] sm:max-w-[120px]">
                      {rate.district}, {rate.state}
                    </span>
                  </div>

                  {/* Click Badge on Hover */}
                  <span className="text-[9px] bg-[#86EFAC] text-[#182F15] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
                    {language === "en" ? "Details 👆" : "विवरण 👆"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls (Speed & Pause & View All) */}
        <div className="bg-[#122410] px-2 sm:px-3 py-2 flex items-center gap-1.5 border-l border-[#2D5A27] shrink-0 z-10">
          
          {/* Pause / Play Toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-md bg-[#234A1F] hover:bg-[#2D5A27] text-[#D1E7CD] hover:text-white transition-colors"
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-[#86EFAC]" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Speed Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-[#1A3316] p-0.5 rounded-md border border-[#2D5A27]">
            <button
              onClick={() => setSpeed("slow")}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${speed === "slow" ? "bg-[#2D5A27] text-[#86EFAC]" : "text-[#A8C8A3] hover:text-white"}`}
            >
              {language === "en" ? "Slow" : "धीमी"}
            </button>
            <button
              onClick={() => setSpeed("normal")}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${speed === "normal" ? "bg-[#2D5A27] text-[#86EFAC]" : "text-[#A8C8A3] hover:text-white"}`}
            >
              {language === "en" ? "Med" : "मध्यम"}
            </button>
            <button
              onClick={() => setSpeed("fast")}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${speed === "fast" ? "bg-[#2D5A27] text-[#86EFAC]" : "text-[#A8C8A3] hover:text-white"}`}
            >
              {language === "en" ? "Fast" : "तेज़"}
            </button>
          </div>

          {/* View All Mandis Button */}
          {onViewAllMandi && (
            <button
              onClick={onViewAllMandi}
              className="ml-1 px-2.5 py-1 rounded-lg bg-[#2D5A27] hover:bg-[#3E7036] text-[#86EFAC] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 border border-[#48833E]"
              title="Open Mandi Tracker"
            >
              <span className="hidden sm:inline">{language === "en" ? "All Mandis" : "सभी मंडियां"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

