import React, { useState } from "react";
import { Language, UserRole, CartItem, UserProfile } from "../types";
import { translations } from "../data/translations";
import { SUPPORTED_LANGUAGES, ALL_INDIAN_STATES } from "../utils/languageUtils";
import { 
  Sprout, 
  ShoppingCart, 
  Bell, 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  User, 
  Tractor, 
  TrendingUp, 
  Truck, 
  Users, 
  Store,
  PlusCircle,
  Globe,
  MapPin,
  ChevronDown,
  Settings,
  LogIn,
  BadgeCheck,
  LifeBuoy,
  Sparkles,
  ShieldCheck,
  Scale
} from "lucide-react";

interface NavbarProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onToggleLanguage?: () => void;
  selectedState?: string;
  onStateChange?: (stateCode: string, autoLang?: Language) => void;
  onOpenLanguageModal?: () => void;
  userRole: UserRole;
  onUserRoleChange?: (role: UserRole) => void;
  onToggleRole?: () => void;
  activeTab: "market" | "mandi" | "deliveries" | "forum" | "my_crops" | "my_orders" | string;
  onTabChange?: (tab: any) => void;
  onChangeTab?: (tab: any) => void;
  cartItems?: CartItem[];
  cartCount?: number;
  onOpenCart: () => void;
  onOpenAddCrop: () => void;
  onOpenAnalyzer?: () => void;
  onOpenPriceAlerts?: () => void;
  onOpenAlertsCenter?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenChat?: () => void;
  onOpenLoginModal: () => void;
  onOpenSettingsModal: () => void;
  currentUser: UserProfile | null;
  isOffline: boolean;
  onToggleOffline?: () => void;
  activeAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  onToggleLanguage,
  selectedState = "MP",
  onStateChange,
  onOpenLanguageModal,
  userRole,
  onUserRoleChange,
  onToggleRole,
  activeTab,
  onTabChange,
  onChangeTab,
  cartItems = [],
  cartCount,
  onOpenCart,
  onOpenAddCrop,
  onOpenAnalyzer,
  onOpenPriceAlerts,
  onOpenAlertsCenter,
  onOpenAdminDashboard,
  onOpenChat,
  onOpenLoginModal,
  onOpenSettingsModal,
  currentUser,
  isOffline,
  onToggleOffline,
  activeAlertsCount = 0,
}) => {
  const t = translations[language] || translations.hi;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  const currentStateObj = ALL_INDIAN_STATES.find(s => s.code === selectedState || s.nameEn === selectedState) || ALL_INDIAN_STATES[0];

  const totalCartCount = cartCount !== undefined 
    ? cartCount 
    : cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleTab = (tab: any) => {
    if (onTabChange) onTabChange(tab);
    if (onChangeTab) onChangeTab(tab);
  };

  const handleLang = (lang: Language) => {
    if (onLanguageChange) onLanguageChange(lang);
    else if (onToggleLanguage) onToggleLanguage();
  };

  const handleRole = (role: UserRole) => {
    if (onUserRoleChange) onUserRoleChange(role);
    else if (onToggleRole) onToggleRole();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#DCD7CC] shadow-xs">
      {/* Live Mandi Alert Ticker Top Bar */}
      <div className="bg-[#1B3B18] text-[#E8F3E5] text-[11px] py-1.5 px-3 sm:px-4 font-medium overflow-hidden whitespace-nowrap flex items-center justify-between border-b border-[#2D5A27]">
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <span className="inline-flex items-center gap-1 bg-[#2D5A27] text-white px-2 py-0.5 rounded-sm text-[10px] font-bold shrink-0 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#86EFAC] animate-ping"></span>
            LIVE MANDI
          </span>
          <div className="truncate text-[#D5E8D2] font-mono text-[11px]">
            <span className="mx-2 font-semibold">🌾 {language === "hi" ? "गेहूं (सीहोर): ₹2,420/Q (+1.7%)" : language === "pa" ? "ਕਣਕ (ਖੰਨਾ): ₹2,420/Q" : language === "mr" ? "गहू (लातूर): ₹2,420/Q" : "Wheat (Sehore): ₹2,420/Q"}</span>
            <span className="mx-2 opacity-40">|</span>
            <span className="mx-2 font-semibold">🍚 {language === "hi" ? "बासमती धान (करनाल): ₹3,950/Q" : language === "pa" ? "1121 ਬਾਸਮਤੀ ਝੋਨਾ: ₹3,950/Q" : "Basmati Paddy: ₹3,950/Q"}</span>
            <span className="mx-2 opacity-40">|</span>
            <span className="mx-2 font-semibold">🧅 {language === "mr" ? "कांदा (लासलगाव): ₹2,150/Q (+4.2%)" : language === "gu" ? "લાલ ડુંગળી (મહુવા): ₹2,150/Q" : "Red Onion (Nashik): ₹2,150/Q"}</span>
            <span className="mx-2 opacity-40">|</span>
            <span className="mx-2 font-semibold">🌱 {language === "gu" ? "જીરું (ઊંઝા): ₹26,500/Q" : language === "hi" ? "सरसों (अलवर): ₹5,650/Q" : "Mustard: ₹5,650/Q"}</span>
          </div>
        </div>

        {/* Quick Language & State selector & Offline status */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Multi-language & State Modal Trigger */}
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center gap-1.5 bg-[#234A1F] hover:bg-[#2D5A27] text-white px-2 py-0.5 rounded-md text-[11px] font-bold border border-[#3A7532] shadow-xs transition-colors"
            title="भाषा और राज्य चुनें (Select Language & State)"
          >
            <Globe className="w-3.5 h-3.5 text-[#86EFAC]" />
            <span className="flex items-center gap-1">
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.nativeName}</span>
            </span>
            <span className="text-[10px] text-[#A7F3D0] hidden sm:inline">
              ({currentStateObj.nameEn})
            </span>
            <ChevronDown className="w-3 h-3 text-[#A7F3D0]" />
          </button>

          <button
            onClick={onToggleOffline}
            title={isOffline ? "Currently Offline" : "Currently Online"}
            className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold transition-colors ${
              isOffline ? "bg-[#B45309] text-white" : "bg-[#2D5A27]/80 text-[#E8F3E5] hover:bg-[#2D5A27]"
            }`}
          >
            {isOffline ? <WifiOff className="w-3 h-3 text-white" /> : <Wifi className="w-3 h-3 text-[#86EFAC]" />}
            <span>{isOffline ? t.offline : t.online}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo & Branding */}
          <div 
            onClick={() => handleTab("market")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#2D5A27] flex items-center justify-center text-white shadow-xs group-hover:bg-[#234A1F] transition-colors">
              <Sprout className="w-5 h-5 text-[#86EFAC]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#2D2D2D]">
                  {t.appName}
                </span>
                <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-1.5 py-0.2 rounded-sm border border-[#FDE68A]">
                  {language === "hi" ? "सीधा खेत से" : "Direct"}
                </span>
              </div>
              <p className="text-[10px] text-[#75716B] font-medium hidden sm:block">
                {userRole === "farmer" ? t.farmerTagline : t.tagline}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs - High Density Style */}
          <nav className="hidden md:flex items-center gap-1 bg-[#EDE8DF] p-1 rounded-lg border border-[#DCD7CC]">
            <button
              onClick={() => handleTab("market")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === "market"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#4A4742] hover:text-[#2D2D2D] hover:bg-[#FAF8F5]"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              {t.navMarket}
            </button>

            <button
              onClick={() => handleTab("mandi")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === "mandi"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#4A4742] hover:text-[#2D2D2D] hover:bg-[#FAF8F5]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {t.navMandiRates}
            </button>

            <button
              onClick={() => handleTab("deliveries")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === "deliveries"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#4A4742] hover:text-[#2D2D2D] hover:bg-[#FAF8F5]"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              {t.navDeliveries}
            </button>

            <button
              onClick={() => handleTab("farmer_hub")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === "farmer_hub"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#4A4742] hover:text-[#2D2D2D] hover:bg-[#FAF8F5]"
              }`}
            >
              <Tractor className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "किसान डैशबोर्ड" : "Seller Portal"}</span>
            </button>

            <button
              onClick={() => handleTab("forum")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === "forum"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#4A4742] hover:text-[#2D2D2D] hover:bg-[#FAF8F5]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {t.navForum}
            </button>

            {onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  activeTab === "admin"
                    ? "bg-[#182F15] text-[#86EFAC] shadow-xs"
                    : "text-[#182F15] bg-[#EBF5EA] hover:bg-[#D5E8D2] border border-[#B7DDB5]"
                }`}
                title="कमीशन ट्रैकिंग, किसान पेआउट्स व विवाद समाधान"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>{language === "hi" ? "एडमिन व सुरक्षा" : "Admin & Safety"}</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Automated Alerts & Notification Center Button */}
            {onOpenAlertsCenter && (
              <button
                onClick={onOpenAlertsCenter}
                title={language === "hi" ? "स्वचालित SMS व WhatsApp लाइव अलर्ट्स" : "Automated SMS & WhatsApp Alerts"}
                className="flex items-center gap-1 bg-[#FAF8F5] hover:bg-[#EBF5EA] text-[#1B3B18] px-2 py-1.5 rounded-lg text-xs font-bold transition-colors border border-[#DCD7CC]"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                <span className="hidden sm:inline">SMS/WhatsApp</span>
              </button>
            )}

            {/* Farmer Action: AI Crop Analyzer */}
            {userRole === "farmer" && onOpenAnalyzer && (
              <button
                onClick={onOpenAnalyzer}
                className="flex items-center gap-1 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
                title={language === "hi" ? "AI से फसल की गुणवत्ता व सही भाव जांचें" : "AI Crop Quality & Price Estimator"}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="hidden md:inline">{language === "hi" ? "AI गुणवत्ता जांच" : "AI Quality"}</span>
              </button>
            )}

            {/* Farmer Action: Add Crop */}
            {userRole === "farmer" && (
              <button
                onClick={onOpenAddCrop}
                className="flex items-center gap-1.5 bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === "hi" ? "फसल जोड़ें" : "Add Crop"}</span>
              </button>
            )}

            {/* Price Alert Button */}
            {onOpenPriceAlerts && (
              <button
                onClick={onOpenPriceAlerts}
                title={t.priceAlertTitle}
                className="relative p-1.5 text-[#5C5850] hover:text-[#2D5A27] hover:bg-[#EDE8DF] rounded-lg transition-colors border border-[#DCD7CC]"
              >
                <Bell className="w-4 h-4" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D97706] rounded-full ring-2 ring-white"></span>
                )}
              </button>
            )}

            {/* Kisan Mitra Chat Support */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1 bg-[#EDE8DF] hover:bg-[#E2DDD3] text-[#2D2D2D] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border border-[#DCD7CC]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span className="hidden sm:inline">{t.navChatSupport}</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-1.5 text-[#2D2D2D] hover:bg-[#EDE8DF] rounded-lg transition-colors border border-[#DCD7CC]"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#2D5A27] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Settings & Instant Help Button */}
            <button
              onClick={onOpenSettingsModal}
              title={language === "hi" ? "ऐप सेटिंग्स व तुरंत सहायता (Settings & Instant Help)" : "Settings & Instant Help"}
              className="p-1.5 text-[#5C5850] hover:text-[#2D5A27] hover:bg-[#EDE8DF] rounded-lg transition-colors border border-[#DCD7CC] relative group"
            >
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
            </button>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#EBF5EA] text-[#2D2D2D] border border-[#DCD7CC] hover:border-[#B7DDB5] px-2 py-1 rounded-lg text-xs font-bold transition-all"
                title="खाता विवरण व सेटिंग्स"
              >
                <div className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-[10px] font-extrabold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[80px] sm:max-w-[110px] truncate hidden xs:inline">
                  {currentUser.name}
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1 bg-[#2D5A27] hover:bg-[#234A1F] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                title="मोबाइल या ईमेल OTP से लॉगिन करें"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "लॉगिन / OTP" : "Login"}</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <button
              onClick={() => handleRole(userRole === "buyer" ? "farmer" : "buyer")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                userRole === "farmer"
                  ? "bg-[#FEF3C7] border-[#FDE68A] text-[#854D0E] hover:bg-[#FDE68A]"
                  : "bg-[#EBF5EA] border-[#B7DDB5] text-[#2D5A27] hover:bg-[#DBEED8]"
              }`}
              title={t.switchRole}
            >
              {userRole === "farmer" ? (
                <>
                  <Tractor className="w-3.5 h-3.5 text-[#854D0E]" />
                  <span className="hidden lg:inline">{t.farmerRole}</span>
                  <span className="lg:hidden">किसान</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span className="hidden lg:inline">{t.buyerRole}</span>
                  <span className="lg:hidden">ग्राहक</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-around py-1.5 border-t border-[#DCD7CC] overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => handleTab("market")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap ${
              activeTab === "market" ? "bg-[#2D5A27] text-white" : "text-[#4A4742]"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            {t.navMarket}
          </button>
          <button
            onClick={() => handleTab("mandi")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap ${
              activeTab === "mandi" ? "bg-[#2D5A27] text-white" : "text-[#4A4742]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {t.navMandiRates}
          </button>
          <button
            onClick={() => handleTab("deliveries")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap ${
              activeTab === "deliveries" ? "bg-[#2D5A27] text-white" : "text-[#4A4742]"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            {t.navDeliveries}
          </button>
          <button
            onClick={() => handleTab("farmer_hub")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap ${
              activeTab === "farmer_hub" ? "bg-[#2D5A27] text-white" : "text-[#4A4742]"
            }`}
          >
            <Tractor className="w-3.5 h-3.5" />
            <span>किसान</span>
          </button>
          <button
            onClick={() => handleTab("forum")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap ${
              activeTab === "forum" ? "bg-[#2D5A27] text-white" : "text-[#4A4742]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.navForum}
          </button>
        </div>
      </div>
    </header>
  );
};

