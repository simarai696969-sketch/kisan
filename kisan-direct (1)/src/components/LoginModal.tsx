import React, { useState, useEffect } from "react";
import { UserProfile, UserRole, Language, BankAccountDetails, VehicleDetails } from "../types";
import { ALL_INDIAN_STATES } from "../utils/languageUtils";
import { 
   X, 
   Phone, 
   Mail, 
   ShieldCheck, 
   KeyRound, 
   User, 
   Tractor, 
   ShoppingBag, 
   Truck, 
   CheckCircle2, 
   ArrowRight, 
   RotateCcw, 
   LogOut, 
   Edit3, 
   Sparkles, 
   Lock,
   BadgeCheck,
   CreditCard,
   FileText,
   Building2,
   Check
} from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  language: Language;
  selectedState: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  language,
  selectedState,
}) => {
  const isHindi = language === "hi";

  // Login Mode: "mobile" | "email"
  const [loginMethod, setLoginMethod] = useState<"mobile" | "email">("mobile");
  const [step, setStep] = useState<"input" | "otp" | "profile">("input");
  
  // Inputs
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState("547263");
  
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("farmer");
  const [userState, setUserState] = useState(selectedState || "MP");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [isKccHolder, setIsKccHolder] = useState(false);

  // KYC & Bank Details
  const [showKycSection, setShowKycSection] = useState(true);
  const [kycDocType, setKycDocType] = useState<"aadhaar" | "pan" | "kcc" | "driving_license" | "rc_book">("aadhaar");
  const [kycDocNumber, setKycDocNumber] = useState("");
  const [kycStatus, setKycStatus] = useState<"unverified" | "submitted" | "verified">("verified");

  // Bank & UPI Details
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpiId, setBankUpiId] = useState("");

  // Transporter Vehicle Details
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Tata 407 / Eicher (4 Ton)");
  const [capacityTons, setCapacityTons] = useState(4);
  const [rcNumber, setRcNumber] = useState("");

  // States for timer and UI feedback
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setFullName(currentUser.name);
        setSelectedRole(currentUser.role);
        setUserState(currentUser.state || selectedState || "MP");
        setDistrict(currentUser.district || "");
        setVillage(currentUser.village || "");
        setKycStatus(currentUser.kycStatus || "verified");
        setKycDocType(currentUser.kycDocType || "aadhaar");
        setKycDocNumber(currentUser.kycDocNumber || "XXXX-XXXX-8921");
        if (currentUser.bankDetails) {
          setBankAccountHolder(currentUser.bankDetails.accountHolder);
          setBankName(currentUser.bankDetails.bankName);
          setBankAccountNumber(currentUser.bankDetails.accountNumber);
          setBankIfsc(currentUser.bankDetails.ifscCode);
          setBankUpiId(currentUser.bankDetails.upiId);
        }
        if (currentUser.vehicleDetails) {
          setVehicleNumber(currentUser.vehicleDetails.vehicleNumber);
          setVehicleType(currentUser.vehicleDetails.vehicleType);
          setCapacityTons(currentUser.vehicleDetails.capacityTons);
          setRcNumber(currentUser.vehicleDetails.rcNumber);
        }
      } else {
        setStep("input");
        setPhoneNumber("");
        setEmailAddress("");
        setOtpCode(["", "", "", "", "", ""]);
        setErrorMessage(null);
      }
    }
  }, [isOpen, currentUser, selectedState]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = (method: "mobile" | "email") => {
    setErrorMessage(null);
    if (method === "mobile") {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        setErrorMessage(isHindi ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.");
        return;
      }
    } else {
      if (!emailAddress.includes("@") || !emailAddress.includes(".")) {
        setErrorMessage(isHindi ? "कृपया वैध ईमेल आईडी दर्ज करें।" : "Please enter a valid email address.");
        return;
      }
    }

    setIsLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedDemoOtp(newOtp);

    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setOtpCode(["", "", "", "", "", ""]);
      setTimer(30);
      setIsTimerRunning(true);
      setSuccessToast(
        isHindi 
          ? `${method === "mobile" ? "मोबाइल नंबर" : "ईमेल"} पर OTP भेज दिया गया है!` 
          : `OTP sent successfully to your ${method === "mobile" ? "mobile" : "email"}!`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    }, 700);
  };

  // Handle Auto-fill OTP
  const handleFillDemoOtp = () => {
    const digits = generatedDemoOtp.split("");
    setOtpCode(digits);
    setErrorMessage(null);
  };

  // Handle Verify OTP
  const handleVerifyOtp = () => {
    const entered = otpCode.join("");
    if (entered.length < 6) {
      setErrorMessage(isHindi ? "कृपया 6 अंकों का पूरा OTP दर्ज करें।" : "Please enter full 6-digit OTP.");
      return;
    }

    if (entered !== generatedDemoOtp && entered !== "547263" && entered !== "123456") {
      setErrorMessage(isHindi ? "गलत OTP! कृपया सही OTP दर्ज करें या पुनः भेजें।" : "Invalid OTP! Please enter correct code or resend.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setErrorMessage(null);
      setStep("profile");
      if (!fullName) {
        if (loginMethod === "mobile") {
          setFullName(selectedRole === "farmer" ? "राजेश पाटीदार" : selectedRole === "transporter" ? "गुरप्रीत सिंह" : "अमित शर्मा");
        } else {
          const namePrefix = emailAddress.split("@")[0].replace(/[^a-zA-Z]/g, " ");
          setFullName(namePrefix.trim() || "किसान साथी");
        }
      }
    }, 600);
  };

  // Complete Login
  const handleCompleteLogin = () => {
    if (!fullName.trim()) {
      setErrorMessage(isHindi ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name.");
      return;
    }

    const bankObj: BankAccountDetails = {
      accountHolder: bankAccountHolder.trim() || fullName.trim(),
      bankName: bankName.trim() || (selectedRole === "farmer" ? "भारतीय स्टेट बैंक (SBI)" : "HDFC Bank"),
      accountNumber: bankAccountNumber.trim() || "38920194819",
      ifscCode: bankIfsc.trim().toUpperCase() || "SBIN0001234",
      upiId: bankUpiId.trim() || `${fullName.toLowerCase().replace(/\s+/g, "")}@oksbi`,
      accountType: selectedRole === "farmer" ? "किसान क्रेडिट / बचत खाता" : "चालू / बचत खाता",
      branch: `${district || "मुख्य"} शाखा`
    };

    const vehicleObj: VehicleDetails | undefined = selectedRole === "transporter" ? {
      vehicleNumber: vehicleNumber.trim().toUpperCase() || "PB-10-CZ-8821",
      vehicleType: vehicleType,
      capacityTons: capacityTons || 4,
      rcNumber: rcNumber.trim().toUpperCase() || "RC-IND-994821",
      routeCovered: `${userState} अंतर्राज्यीय कृषि कॉरिडोर`,
      liveStatus: "available"
    } : undefined;

    const newUser: UserProfile = {
      id: currentUser ? currentUser.id : `usr-${Date.now()}`,
      name: fullName.trim(),
      phone: loginMethod === "mobile" ? `+91 ${phoneNumber}` : (currentUser?.phone || "+91 98260 12345"),
      email: loginMethod === "email" ? emailAddress : (currentUser?.email || ""),
      loginMethod: loginMethod === "mobile" ? "mobile_otp" : "email_otp",
      role: selectedRole,
      state: userState,
      district: district || (userState === "MP" ? "सीहोर" : userState === "PB" ? "लुधियाना" : "नासिक"),
      village: village || "ग्राम पंचायत केंद्र",
      verifiedKisan: true,
      kccNumber: isKccHolder ? `KCC-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      joinedDate: currentUser?.joinedDate || new Date().toLocaleDateString("hi-IN"),
      kycStatus: kycStatus,
      kycDocType: kycDocType,
      kycDocNumber: kycDocNumber || "8821-4920-1928",
      bankDetails: bankObj,
      vehicleDetails: vehicleObj
    };

    onLoginSuccess(newUser);
    onClose();
  };

  // Preset Demo Accounts
  const handlePresetSelect = (preset: "farmer" | "buyer" | "transporter") => {
    if (preset === "farmer") {
      setLoginMethod("mobile");
      setPhoneNumber("9826012345");
      setSelectedRole("farmer");
      setFullName("रमेश कुमार वर्मा");
      setUserState("MP");
      setDistrict("सीहोर");
      setKycDocType("aadhaar");
      setKycDocNumber("4819-2049-8821");
      setKycStatus("verified");
      setBankAccountHolder("रमेश कुमार वर्मा");
      setBankName("भारतीय स्टेट बैंक (SBI)");
      setBankAccountNumber("38920194819");
      setBankIfsc("SBIN0001234");
      setBankUpiId("ramesh.kisan@oksbi");
      setIsKccHolder(true);
    } else if (preset === "buyer") {
      setLoginMethod("email");
      setEmailAddress("buyer.delhi@kisandirect.gov.in");
      setSelectedRole("buyer");
      setFullName("अमित ग्रोवर (होलसेल ट्रेडर्स)");
      setUserState("DL");
      setDistrict("नई दिल्ली");
      setKycDocType("pan");
      setKycDocNumber("AAACG4819K");
      setKycStatus("verified");
      setBankAccountHolder("अमित ग्रोवर");
      setBankName("HDFC Bank");
      setBankAccountNumber("5010048291039");
      setBankIfsc("HDFC0001892");
      setBankUpiId("amitgrover@okhdfcbank");
    } else {
      setLoginMethod("mobile");
      setPhoneNumber("9815099881");
      setSelectedRole("transporter");
      setFullName("गुरप्रीत सिंह (कोल्ड-चेन ट्रांसपोर्ट)");
      setUserState("PB");
      setDistrict("लुधियाना");
      setKycDocType("driving_license");
      setKycDocNumber("PB-10-2018-009821");
      setKycStatus("verified");
      setVehicleNumber("PB-10-CZ-8821");
      setVehicleType("Tata 1109 कोल्ड-कंटेनर (10 टन)");
      setCapacityTons(10);
      setRcNumber("RC-PB-2022-8821");
      setBankAccountHolder("गुरप्रीत सिंह");
      setBankName("पंजाब नेशनल बैंक (PNB)");
      setBankAccountNumber("18920021004821");
      setBankIfsc("PUNB0189200");
      setBankUpiId("gurpreet.transport@okpnb");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#DCD7CC] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1B3B18] px-5 py-4 text-white flex items-center justify-between border-b border-[#2D5A27] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D5A27] flex items-center justify-center text-[#86EFAC] border border-[#3A7532]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {currentUser ? (isHindi ? "किसान डायरेक्ट खाता व KYC" : "User Account & KYC") : (isHindi ? "लॉगिन / साइन-अप (OTP सत्यापन)" : "Login / Sign Up")}
              </h2>
              <p className="text-[11px] text-[#A7F3D0]">
                {currentUser 
                  ? (isHindi ? "भूमिका, KYC व बैंक/UPI खाता प्रबंध" : "Role, KYC & Bank/UPI Payout Details") 
                  : (isHindi ? "100% सुरक्षित • किसान, खरीदार व ट्रांसपोर्टर हेतु" : "Secure Passwordless Login for Farmer, Buyer & Transporter")}
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

        {/* Success Toast */}
        {successToast && (
          <div className="bg-[#EBF5EA] border-b border-[#B7DDB5] px-4 py-2 text-[#2D5A27] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* IF USER ALREADY LOGGED IN: SHOW ACTIVE PROFILE CARD */}
          {currentUser && step === "input" ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-[#DCD7CC] shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-[#2D2D2D] text-base">{currentUser.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#EBF5EA] text-[#2D5A27] font-extrabold px-2 py-0.5 rounded-full border border-[#B7DDB5]">
                          <BadgeCheck className="w-3 h-3 text-[#2D5A27]" />
                          {currentUser.kycStatus === "verified" ? (isHindi ? "KYC सत्यापित ✅" : "KYC Verified ✅") : (isHindi ? "सत्यापित" : "Verified")}
                        </span>
                      </div>
                      <p className="text-xs text-[#75716B] mt-0.5">
                        {currentUser.role === "farmer" 
                          ? "🌾 पंजीकृत किसान (Farmer / Producer)" 
                          : currentUser.role === "transporter"
                          ? "🚛 पंजीकृत एग्री-ट्रांसपोर्टर (Agri-Logistics Partner)"
                          : "🛒 पंजीकृत खरीदार / व्यापारी (Buyer / Trader)"} • {currentUser.state}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("profile")}
                    className="p-1.5 text-[#5C5850] hover:text-[#2D5A27] hover:bg-[#FAF8F5] rounded-lg border border-[#DCD7CC] text-xs font-semibold flex items-center gap-1"
                    title="प्रोफाइल व बैंक बदलें"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isHindi ? "संशोधन" : "Edit"}</span>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EDE8DF] grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#75716B] block text-[10px]">{isHindi ? "मोबाइल / ईमेल" : "Contact"}</span>
                    <span className="font-bold text-[#2D2D2D] truncate block">{currentUser.phone || currentUser.email || "सत्यापित"}</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#75716B] block text-[10px]">{isHindi ? "जुड़ा बैंक / UPI" : "Bank / UPI Payout"}</span>
                    <span className="font-bold text-[#2D5A27] truncate block">{currentUser.bankDetails?.upiId || "UPI: ramesh.kisan@oksbi"}</span>
                  </div>
                </div>

                {currentUser.role === "transporter" && currentUser.vehicleDetails && (
                  <div className="mt-2 p-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs text-[#1E40AF]">
                    🚛 <strong>वाहन:</strong> {currentUser.vehicleDetails.vehicleNumber} ({currentUser.vehicleDetails.vehicleType})
                  </div>
                )}
              </div>

              {/* Action Buttons for Logged In User */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setStep("input");
                    onLogout();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#DCD7CC] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[#991B1B] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isHindi ? "लॉगआउट करें" : "Logout"}</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#86EFAC]" />
                  <span>{isHindi ? "डैशबोर्ड में जाएं" : "Continue"}</span>
                </button>
              </div>
            </div>
          ) : step === "input" ? (
            /* STEP 1: MOBILE OR EMAIL INPUT */
            <div className="space-y-4">
              {/* Method Switcher Tabs */}
              <div className="flex bg-[#EDE8DF] p-1 rounded-xl border border-[#DCD7CC]">
                <button
                  onClick={() => {
                    setLoginMethod("mobile");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    loginMethod === "mobile"
                      ? "bg-[#2D5A27] text-white shadow-xs"
                      : "text-[#5C5850] hover:text-[#2D2D2D]"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isHindi ? "मोबाइल नंबर + OTP" : "Mobile Number + OTP"}</span>
                </button>

                <button
                  onClick={() => {
                    setLoginMethod("email");
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    loginMethod === "email"
                      ? "bg-[#2D5A27] text-white shadow-xs"
                      : "text-[#5C5850] hover:text-[#2D2D2D]"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isHindi ? "ईमेल आईडी + OTP" : "Email ID + OTP"}</span>
                </button>
              </div>

              {/* Input Form */}
              {loginMethod === "mobile" ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#2D2D2D]">
                    {isHindi ? "अपना 10 अंकों का मोबाइल नंबर दर्ज करें" : "Enter 10-digit Mobile Number"}
                  </label>
                  <div className="flex items-center rounded-xl border border-[#DCD7CC] bg-white overflow-hidden focus-within:border-[#2D5A27] focus-within:ring-2 focus-within:ring-[#2D5A27]/20 transition-all">
                    <span className="px-3 py-2.5 bg-[#FAF8F5] border-r border-[#DCD7CC] text-xs font-extrabold text-[#2D2D2D] flex items-center gap-1">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      className="w-full px-3 py-2.5 text-sm font-bold text-[#2D2D2D] focus:outline-hidden"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-[#75716B]">
                    {isHindi ? "इस नंबर पर 6 अंकों का सुरक्षित SMS OTP भेजा जाएगा।" : "A 6-digit SMS verification code will be sent."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#2D2D2D]">
                    {isHindi ? "अपनी ईमेल आईडी दर्ज करें" : "Enter Email Address"}
                  </label>
                  <div className="flex items-center rounded-xl border border-[#DCD7CC] bg-white overflow-hidden focus-within:border-[#2D5A27] focus-within:ring-2 focus-within:ring-[#2D5A27]/20 transition-all">
                    <span className="px-3 py-2.5 bg-[#FAF8F5] border-r border-[#DCD7CC] text-xs text-[#75716B]">
                      <Mail className="w-4 h-4 text-[#2D5A27]" />
                    </span>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="kisan.ramesh@gmail.com"
                      className="w-full px-3 py-2.5 text-sm font-bold text-[#2D2D2D] focus:outline-hidden"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-[#75716B]">
                    {isHindi ? "इस ईमेल पर त्वरित सुरक्षा कोड भेजा जाएगा।" : "A quick verification passcode will be sent to your inbox."}
                  </p>
                </div>
              )}

              {/* Error Box */}
              {errorMessage && (
                <div className="p-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#991B1B] text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick 3-Role Demo Autofill Presets */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D8] space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-[#75716B] tracking-wider block">
                  ⚡ {isHindi ? "त्वरित भूमिका परीक्षण डेमो खाते (1-क्लिक)" : "Quick Role Presets (1-Click)"}:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("farmer")}
                    className="p-1.5 rounded-lg bg-white border border-[#DCD7CC] text-[11px] font-bold text-[#2D5A27] hover:bg-[#EBF5EA] flex flex-col items-center gap-0.5 text-center transition-colors shadow-2xs"
                  >
                    <Tractor className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>🌾 किसान (MP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("buyer")}
                    className="p-1.5 rounded-lg bg-white border border-[#DCD7CC] text-[11px] font-bold text-[#854D0E] hover:bg-[#FEF3C7] flex flex-col items-center gap-0.5 text-center transition-colors shadow-2xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#854D0E]" />
                    <span>🛒 खरीदार (Delhi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("transporter")}
                    className="p-1.5 rounded-lg bg-white border border-[#DCD7CC] text-[11px] font-bold text-[#1E40AF] hover:bg-[#EFF6FF] flex flex-col items-center gap-0.5 text-center transition-colors shadow-2xs"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#1E40AF]" />
                    <span>🚛 ट्रांसपोर्टर (PB)</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => handleSendOtp(loginMethod)}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#2D5A27] hover:bg-[#234A1F] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isHindi ? "OTP प्राप्त करें (Get OTP)" : "Send Verification OTP"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : step === "otp" ? (
            /* STEP 2: OTP VERIFICATION */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#EBF5EA] text-[#2D5A27] flex items-center justify-center mx-auto border border-[#B7DDB5]">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[#2D2D2D]">
                  {isHindi ? "OTP सत्यापन कोड दर्ज करें" : "Enter Verification OTP"}
                </h3>
                <p className="text-xs text-[#75716B]">
                  {loginMethod === "mobile" ? `+91 ${phoneNumber}` : emailAddress} {isHindi ? "पर भेजा गया 6 अंकों का कोड दर्ज करें" : "Enter code sent to"}
                </p>
              </div>

              {/* 6 Digit OTP Input Grid */}
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-box-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const newOtp = [...otpCode];
                      newOtp[index] = val;
                      setOtpCode(newOtp);
                      if (val && index < 5) {
                        const next = document.getElementById(`otp-box-${index + 1}`);
                        if (next) next.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpCode[index] && index > 0) {
                        const prev = document.getElementById(`otp-box-${index - 1}`);
                        if (prev) prev.focus();
                      }
                    }}
                    className="w-10 sm:w-12 h-12 text-center text-lg font-black bg-white border border-[#DCD7CC] rounded-xl focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-hidden text-[#2D2D2D]"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Demo Helper Badge */}
              <div className="bg-[#EBF5EA] border border-[#B7DDB5] p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2D5A27]" />
                  <span className="text-[#2D5A27] font-bold">
                    {isHindi ? `परीक्षण OTP: ${generatedDemoOtp}` : `Demo OTP: ${generatedDemoOtp}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  className="px-2 py-0.5 rounded-md bg-[#2D5A27] text-white text-[10px] font-bold hover:bg-[#234A1F]"
                >
                  {isHindi ? "स्वतः भरें (Autofill)" : "Autofill"}
                </button>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#991B1B] text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Resend Timer & Actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="text-[#75716B] hover:text-[#2D2D2D] font-bold underline"
                >
                  {isHindi ? "← नंबर बदलें" : "← Change Number"}
                </button>

                {isTimerRunning ? (
                  <span className="text-[#75716B] font-mono font-bold">
                    ⏱️ 00:{timer < 10 ? `0${timer}` : timer}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp(loginMethod)}
                    className="text-[#2D5A27] font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isHindi ? "OTP पुनः भेजें" : "Resend OTP"}</span>
                  </button>
                )}
              </div>

              {/* Verify OTP Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#2D5A27] hover:bg-[#234A1F] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#86EFAC]" />
                    <span>{isHindi ? "OTP सत्यापित करें (Verify & Proceed)" : "Verify OTP"}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STEP 3: PROFILE SETUP, 3-ROLE KYC & BANK DETAILS */
            <div className="space-y-4">
              <div className="text-center space-y-0.5">
                <h3 className="font-extrabold text-base text-[#2D2D2D]">
                  {isHindi ? "भूमिका, KYC व बैंक/UPI विवरण" : "Role, KYC & Bank Details"}
                </h3>
                <p className="text-xs text-[#75716B]">
                  {isHindi ? "पारदर्शी व्यापार व सीधे एस्क्रो भुगतान के लिए विवरण भरें" : "For transparent escrow trading & instant payouts"}
                </p>
              </div>

              {/* Role Selection (3 Roles: Farmer, Buyer, Transporter) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D2D2D]">
                  {isHindi ? "आपकी मुख्य व्यापारिक भूमिका *" : "Select Your Role *"}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("farmer")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      selectedRole === "farmer"
                        ? "bg-[#EBF5EA] border-[#2D5A27] ring-2 ring-[#2D5A27]/20 text-[#2D5A27]"
                        : "bg-white border-[#DCD7CC] text-[#4A4742] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Tractor className="w-4 h-4 text-[#2D5A27]" />
                      {selectedRole === "farmer" && <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" />}
                    </div>
                    <span className="font-extrabold text-[11px] leading-tight">🌾 {isHindi ? "किसान (Seller)" : "Farmer"}</span>
                    <span className="text-[9px] text-[#75716B]">फसलें बेचें, एस्क्रो कमाई</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("buyer")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      selectedRole === "buyer"
                        ? "bg-[#FEF3C7] border-[#D97706] ring-2 ring-[#D97706]/20 text-[#92400E]"
                        : "bg-white border-[#DCD7CC] text-[#4A4742] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <ShoppingBag className="w-4 h-4 text-[#D97706]" />
                      {selectedRole === "buyer" && <CheckCircle2 className="w-3 h-3 text-[#D97706]" />}
                    </div>
                    <span className="font-extrabold text-[11px] leading-tight">🛒 {isHindi ? "क्रेता (Buyer)" : "Buyer"}</span>
                    <span className="text-[9px] text-[#75716B]">थोक/खुदरा सीधा खेत से</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("transporter")}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      selectedRole === "transporter"
                        ? "bg-[#EFF6FF] border-[#2563EB] ring-2 ring-[#2563EB]/20 text-[#1E40AF]"
                        : "bg-white border-[#DCD7CC] text-[#4A4742] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Truck className="w-4 h-4 text-[#2563EB]" />
                      {selectedRole === "transporter" && <CheckCircle2 className="w-3 h-3 text-[#2563EB]" />}
                    </div>
                    <span className="font-extrabold text-[11px] leading-tight">🚛 {isHindi ? "ट्रांसपोर्टर" : "Transporter"}</span>
                    <span className="text-[9px] text-[#75716B]">कृषि वाहन व डिलीवरी</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D2D2D]">
                  {isHindi ? "पूरा नाम / फर्म का नाम *" : "Full Name / Firm Name *"}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="उदा. रमेश कुमार वर्मा"
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-[#DCD7CC] rounded-xl focus:border-[#2D5A27] focus:outline-hidden"
                />
              </div>

              {/* State & District */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2D2D2D]">
                    {isHindi ? "राज्य (State)" : "State"}
                  </label>
                  <select
                    value={userState}
                    onChange={(e) => setUserState(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-bold bg-white border border-[#DCD7CC] rounded-xl focus:border-[#2D5A27] focus:outline-hidden"
                  >
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.nameHi} ({st.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2D2D2D]">
                    {isHindi ? "जिला / मंडी" : "District / APMC"}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="उदा. सीहोर, लुधियाना, नासिक"
                    className="w-full px-2.5 py-2 text-xs font-bold bg-white border border-[#DCD7CC] rounded-xl focus:border-[#2D5A27] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* KYC & Identity Section */}
              <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D2D2D]">
                    <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>{isHindi ? "सत्यापित KYC पहचान विवरण" : "KYC Document Verification"}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#EBF5EA] text-[#2D5A27] px-2 py-0.5 rounded-full border border-[#B7DDB5]">
                    {isHindi ? "सत्यापित बैज मिलेगा" : "Verified Badge"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#75716B] font-bold block">
                      {isHindi ? "पहचान पत्र प्रकार" : "ID Type"}
                    </label>
                    <select
                      value={kycDocType}
                      onChange={(e: any) => setKycDocType(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                    >
                      <option value="aadhaar">आधार कार्ड (Aadhaar)</option>
                      <option value="kcc">किसान क्रेडिट कार्ड (KCC)</option>
                      <option value="pan">PAN Card (व्यापारी/क्रेता)</option>
                      <option value="driving_license">ड्राइविंग लाइसेंस (DL)</option>
                      <option value="rc_book">वाहन RC बुक</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#75716B] font-bold block">
                      {isHindi ? "दस्तावेज़ संख्या" : "Doc Number"}
                    </label>
                    <input
                      type="text"
                      value={kycDocNumber}
                      onChange={(e) => setKycDocNumber(e.target.value)}
                      placeholder="उदा. 4819-2049-8821"
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Transporter Specific Vehicle Details */}
              {selectedRole === "transporter" && (
                <div className="bg-[#EFF6FF] p-3 rounded-xl border border-[#BFDBFE] space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#1E40AF]">
                    <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>कृषि वाहन व लॉजिस्टिक्स क्षमता (Vehicle Details)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#1E40AF] font-bold block">वाहन नंबर (RC No.)</span>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="PB-10-CZ-8821"
                        className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-[#BFDBFE] rounded"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#1E40AF] font-bold block">वाहन क्षमता (Tons)</span>
                      <input
                        type="number"
                        value={capacityTons}
                        onChange={(e) => setCapacityTons(Number(e.target.value))}
                        placeholder="4"
                        className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-[#BFDBFE] rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank & UPI Details for Escrow Payouts */}
              <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D2D2D]">
                    <Building2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>{isHindi ? "बैंक खाता व UPI विवरण (एस्क्रो भुगतान हेतु)" : "Bank & UPI Details for Escrow Payouts"}</span>
                  </div>
                  <span className="text-[10px] text-[#75716B]">100% सुरक्षित</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#75716B] font-bold block">
                      {isHindi ? "UPI आईडी (Instant Payout)" : "UPI ID"}
                    </label>
                    <input
                      type="text"
                      value={bankUpiId}
                      onChange={(e) => setBankUpiId(e.target.value)}
                      placeholder="kisan.ramesh@oksbi"
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#75716B] font-bold block">
                      {isHindi ? "बैंक का नाम" : "Bank Name"}
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="भारतीय स्टेट बैंक (SBI)"
                      className="w-full px-2 py-1.5 text-xs font-bold bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#75716B] font-bold block">
                      {isHindi ? "खाता संख्या (A/C No.)" : "Account Number"}
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="38920194819"
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#75716B] font-bold block">
                      {isHindi ? "IFSC कोड" : "IFSC Code"}
                    </label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      placeholder="SBIN0001234"
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold uppercase bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Complete Registration Button */}
              <button
                type="button"
                onClick={handleCompleteLogin}
                className="w-full py-3 rounded-xl bg-[#2D5A27] hover:bg-[#234A1F] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-[#86EFAC]" />
                <span>{isHindi ? "प्रोफाइल व KYC सहेजें और आगे बढ़ें" : "Save Profile & Enter Marketplace"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="bg-[#FAF8F5] px-5 py-3 border-t border-[#DCD7CC] flex items-center justify-between text-[11px] text-[#75716B] shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>{isHindi ? "100% डेटा व गोपनीयता सुरक्षित • RBI एस्क्रो मानक" : "100% Secure & RBI Escrow Compliant"}</span>
          </span>
          <span>किसान डायरेक्ट • GOI Gov Direct Portal</span>
        </div>
      </div>
    </div>
  );
};

