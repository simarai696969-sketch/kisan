import React, { useState, useEffect } from "react";
import { CartItem, Language, DeliveryOrder } from "../types";
import { translations } from "../data/translations";
import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Building, 
  Wallet, 
  Truck, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Phone,
  User,
  ArrowRight,
  Receipt,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  Smartphone,
  Landmark,
  Lock,
  Loader2,
  AlertCircle,
  Percent,
  BadgeCheck
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  language: Language;
  onOrderSuccess: (order: DeliveryOrder) => void;
  onClearCart: () => void;
  onViewTracking?: (order: DeliveryOrder) => void;
  onUpdateQuantity?: (cropId: string, delta: number) => void;
  onRemoveItem?: (cropId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  language,
  onOrderSuccess,
  onClearCart,
  onViewTracking,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const t = translations[language];

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod" | "kisan_credit">("upi");
  const [upiSubMethod, setUpiSubMethod] = useState<"qr" | "vpa">("qr");
  const [upiIdInput, setUpiIdInput] = useState("buyer@okhdfcbank");
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [buyerName, setBuyerName] = useState("अमित शर्मा (Amit Sharma)");
  const [buyerPhone, setBuyerPhone] = useState("+91 98765 43210");
  const [buyerAddress, setBuyerAddress] = useState("मकान नं. 45, सिविल लाइन्स, भोपाल, मध्य प्रदेश");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationSuccessMessage, setVerificationSuccessMessage] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState("UTR" + Math.floor(100000000000 + Math.random() * 900000000000));
  const [orderComplete, setOrderComplete] = useState<DeliveryOrder | null>(null);

  const majorBanks = [
    { id: "sbi", nameHi: "भारतीय स्टेट बैंक (SBI)", nameEn: "State Bank of India (SBI)", code: "SBIN" },
    { id: "hdfc", nameHi: "HDFC बैंक", nameEn: "HDFC Bank", code: "HDFC" },
    { id: "icici", nameHi: "ICICI बैंक", nameEn: "ICICI Bank", code: "ICIC" },
    { id: "pnb", nameHi: "पंजाब नेशनल बैंक (PNB)", nameEn: "Punjab National Bank (PNB)", code: "PUNB" },
    { id: "bob", nameHi: "बैंक ऑफ बड़ौदा (BOB)", nameEn: "Bank of Baroda (BOB)", code: "BARB" },
    { id: "axis", nameHi: "एक्सिस बैंक (Axis Bank)", nameEn: "Axis Bank", code: "UTIB" },
    { id: "canara", nameHi: "केनरा बैंक (Canara Bank)", nameEn: "Canara Bank", code: "CNRB" },
    { id: "union", nameHi: "यूनियन बैंक ऑफ इंडिया", nameEn: "Union Bank of India", code: "UBIN" },
    { id: "nabard", nameHi: "नाबार्ड / ग्रामीण बैंक (RRB)", nameEn: "NABARD / Regional Rural Bank", code: "RRBI" },
  ];

  // When modal is reopened with active cart items, reset completion state
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      setOrderComplete(null);
      setIsProcessing(false);
      setIsVerifyingPayment(false);
      setVerificationSuccessMessage(null);
    }
  }, [isOpen, cartItems]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setOrderComplete(null);
    setIsProcessing(false);
    setIsVerifyingPayment(false);
    setVerificationSuccessMessage(null);
    onClose();
  };

  // Commission & Fee calculations
  const cropSubtotal = cartItems.reduce(
    (sum, item) => sum + item.listing.pricePerUnit * item.quantity,
    0
  );
  // Platform Seller/Marketplace Commission: 4% (Escrow, QC, Matching)
  const platformCommission = Math.round(cropSubtotal * 0.04);
  // Delivery & Logistics Service Fee: ₹50 standard
  const deliveryFee = cropSubtotal > 0 ? 50 : 0;
  // Total payable by buyer
  const totalAmount = cropSubtotal + platformCommission + deliveryFee;
  // Farmer direct payout (Full crop value)
  const farmerPayout = cropSubtotal;
  // Total platform earnings (Platform commission + delivery logistics fee)
  const platformRevenue = platformCommission + deliveryFee;

  const handleProcessOrderSubmission = () => {
    if (!buyerName || !buyerPhone || !buyerAddress || cartItems.length === 0) return;

    const firstItem = cartItems[0];
    const cropNamesHi = cartItems.map(i => `${i.listing.titleHi} (${i.quantity} ${i.listing.unit})`).join(", ");
    const cropNamesEn = cartItems.map(i => `${i.listing.titleEn} (${i.quantity} ${i.listing.unit})`).join(", ");
    const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
    const txnId = paymentMethod === "cod" ? `COD-${Date.now().toString().slice(-6)}` : `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: DeliveryOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `KD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      cropListingId: firstItem.listing.id,
      cropNameHi: cartItems.length === 1 ? firstItem.listing.titleHi : cropNamesHi,
      cropNameEn: cartItems.length === 1 ? firstItem.listing.titleEn : cropNamesEn,
      quantity: totalQty,
      unit: cartItems.length === 1 ? firstItem.listing.unit : "कुल मात्रा",
      cropSubtotal,
      platformCommission,
      deliveryFee,
      totalAmount,
      farmerPayout,
      platformRevenue,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "escrow_hold" : "paid",
      paymentVerificationStatus: paymentMethod === "cod" ? "cod_pending" : "verified",
      paymentTransactionId: txnId,
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      orderDate: new Date().toLocaleDateString("hi-IN", { hour: "2-digit", minute: "2-digit" }),
      deliveryDateEstimated: "कल दोपहर, 02:00 PM (Tomorrow)",
      status: "order_placed",
      farmerName: firstItem.listing.farmerName,
      farmerLocation: firstItem.listing.farmerLocation,
      farmerPhone: firstItem.listing.farmerPhone,
      buyerName,
      buyerAddress,
      buyerPhone,
      driverName: "रवि कुमार (Agri-Van Logistics Driver)",
      driverPhone: "+91 98930 44556",
      vehicleNumber: "MP 04 ZB 4412",
      driverLat: 23.250,
      driverLng: 77.410,
      originLat: 23.200,
      originLng: 77.085,
      destLat: 23.260,
      destLng: 77.420,
      temperatureControl: true,
      checkpoints: [
        {
          titleHi: paymentMethod === "cod" ? "ऑर्डर दर्ज (COD)" : "भुगतान सत्यापित व एस्क्रो लॉक",
          titleEn: paymentMethod === "cod" ? "Order Placed (COD)" : "Payment Verified & Escrow Locked",
          time: "अभी (Just Now)",
          completed: true,
          current: true,
          descriptionHi: paymentMethod === "cod" 
            ? "कैश ऑन डिलीवरी ऑर्डर सफलतापूर्वक दर्ज किया गया। डिलीवरी पर भुगतान देय है।"
            : `₹${totalAmount} का ऑनलाइन भुगतान सत्यापित हो चुका है। राशि किसान सुरक्षा एस्क्रो में सुरक्षित है।`,
          descriptionEn: paymentMethod === "cod" 
            ? "Cash on delivery registered." 
            : `₹${totalAmount} payment verified via gateway. Escrow active.`
        },
        {
          titleHi: "खेत से ताजी तुड़ाई व पैकिंग",
          titleEn: "Fresh Harvest & Packing at Farm",
          time: "प्रक्रियाधीन",
          completed: false,
          current: false,
          descriptionHi: `${firstItem.listing.farmerName} खेत से ताजा माल पैक कर रहे हैं।`,
          descriptionEn: "Farmer packing fresh harvest in eco-sealed crates."
        },
        {
          titleHi: "तापमान नियंत्रित वाहन रवानगी",
          titleEn: "Agri-Fleet Dispatched",
          time: "कल सुबह 09:00 AM",
          completed: false,
          current: false,
          descriptionHi: "वाहन द्वारा सुरक्षित फार्म-टू-डोरस्टेप परिवहन।",
          descriptionEn: "Dispatched via climate-controlled truck."
        },
        {
          titleHi: "घर पर सुरक्षित डिलीवरी व एस्क्रो रिलीज",
          titleEn: "Doorstep Delivery with OTP",
          time: "कल दोपहर 02:00 PM",
          completed: false,
          current: false,
          descriptionHi: "OTP सत्यापन के बाद ही किसान को भुगतान रिलीज होगा।",
          descriptionEn: "Delivered & verified with customer OTP."
        }
      ]
    };

    setOrderComplete(newOrder);
    onOrderSuccess(newOrder);
    onClearCart();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      // safe fallback
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !buyerAddress || cartItems.length === 0) return;

    if (paymentMethod === "cod") {
      // For COD, confirm directly without online payment verification
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        handleProcessOrderSubmission();
      }, 700);
    } else {
      // For Online payment (UPI, Netbanking, Kisan Wallet), run verification simulation
      setIsVerifyingPayment(true);
      setTimeout(() => {
        setIsVerifyingPayment(false);
        setVerificationSuccessMessage(`भुगतान सफल! (₹${totalAmount}) - ट्रांजैक्शन ID: ${utrNumber}`);
        setTimeout(() => {
          handleProcessOrderSubmission();
        }, 800);
      }, 1600);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#121212]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={handleModalClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 border border-[#DCD7CC] shadow-2xl space-y-4 my-6 animate-in fade-in zoom-in duration-200"
      >
        {orderComplete ? (
          /* Order Success Screen */
          <div className="text-center space-y-3 py-3">
            <div className="w-12 h-12 rounded-lg bg-[#EBF5EA] border border-[#B7DDB5] text-[#2D5A27] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#75716B] font-bold">{orderComplete.orderNumber}</span>
              <h2 className="text-xl font-extrabold text-[#2D2D2D]">
                {language === "hi" ? "ऑर्डर सफलतापूर्वक कन्फर्म हुआ! 🎉" : "Order Placed Successfully! 🎉"}
              </h2>
              <p className="text-xs text-[#5C5850] max-w-md mx-auto">
                {orderComplete.paymentMethod === "cod"
                  ? "कैश ऑन डिलीवरी ऑर्डर दर्ज हो चुका है। डिलीवरी के समय भुगतान करें।"
                  : `₹${orderComplete.totalAmount} का ऑनलाइन भुगतान सफलतापूर्वक सत्यापित हुआ और एस्क्रो में लॉक है।`}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#DCD7CC] text-left text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between font-bold text-[#2D2D2D] border-b border-[#DCD7CC] pb-1.5 font-sans">
                <span className="flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>{language === "hi" ? "डिजिटल एस्क्रो रसीद व बिल" : "Digital Receipt"}</span>
                </span>
                <span className="text-[#2D5A27] font-extrabold font-mono text-sm">₹{orderComplete.totalAmount}</span>
              </div>

              <div className="flex justify-between text-[#5C5850]">
                <span>फसल उप-योग (Produce Subtotal):</span>
                <span className="font-semibold text-[#2D2D2D]">₹{orderComplete.cropSubtotal}</span>
              </div>
              <div className="flex justify-between text-[#5C5850]">
                <span>प्लेटफ़ॉर्म सेवा शुल्क (Platform Fee @ 4%):</span>
                <span>₹{orderComplete.platformCommission}</span>
              </div>
              <div className="flex justify-between text-[#5C5850]">
                <span>फार्म डिलीवरी व लॉजिस्टिक्स (Delivery Fee):</span>
                <span>₹{orderComplete.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-[#5C5850] border-t border-dashed border-[#DCD7CC] pt-1">
                <span>डिलीवरी सत्यापन OTP:</span>
                <span className="font-bold text-[#2D5A27] bg-[#EBF5EA] px-1.5 py-0.2 rounded">{orderComplete.deliveryOtp}</span>
              </div>
              <div className="flex justify-between text-[#5C5850]">
                <span>भुगतान स्थिति:</span>
                <span className="font-bold text-[#2D5A27] uppercase">
                  {orderComplete.paymentMethod === "cod" ? "COD (डिलीवरी पर देय)" : "भुगतान सत्यापित (Verified)"}
                </span>
              </div>
              
              {/* Masked Contact & Intermediary Protection note */}
              <div className="mt-2 p-2 bg-white rounded border border-[#DCD7CC] text-[10px] text-[#5C5850] font-sans">
                <strong>🔒 सुरक्षा व बिचौलिया रोकथाम:</strong> किसान का प्रत्यक्ष नंबर गोपनीय रखा जाता है। कोई भी सहायता या प्रश्न होने पर <strong>किसान डायरेक्ट सहायता हेल्पलाइन</strong> द्वारा सुरक्षित संपर्क कराया जाएगा।
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  handleModalClose();
                  if (onViewTracking) {
                    onViewTracking(orderComplete);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{language === "hi" ? "लाइव डिलीवरी ट्रैक करें" : "Track Live Delivery"}</span>
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 rounded-lg border border-[#DCD7CC] text-[#2D2D2D] hover:bg-[#FAF8F5] text-xs font-semibold"
              >
                {t.close}
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart in Checkout */
          <div className="space-y-4 py-8 text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#DCD7CC] flex items-center justify-center mx-auto text-[#75716B]">
              <Truck className="w-6 h-6 text-[#2D5A27]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-[#2D2D2D] text-base">
                {language === "hi" ? "कोई फसल चयनित नहीं है" : "No Items in Cart"}
              </h3>
              <p className="text-xs text-[#75716B] max-w-xs mx-auto">
                {language === "hi" 
                  ? "चेकआउट व डिलीवरी ऑर्डर दर्ज करने के लिए मार्केटप्लेस से कोई भी फसल चुनें या 'सीधे खरीदें' दबाएं।"
                  : "Please add a crop to your cart or click 'Buy Direct' to proceed."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleModalClose}
              className="bg-[#2D5A27] hover:bg-[#234A1F] text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              {language === "hi" ? "मार्केटप्लेस देखें" : "Browse Marketplace"}
            </button>
          </div>
        ) : (
          /* Checkout Form Screen */
          <>
            <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2D5A27]" />
                <div>
                  <h3 className="font-bold text-[#2D2D2D] text-sm sm:text-base">
                    {t.checkoutTitle}
                  </h3>
                  <p className="text-[11px] text-[#75716B]">
                    {language === "hi" ? "बिचौलिया-मुक्त 100% सुरक्षित भुगतान" : "Zero Middlemen Direct Escrow"}
                  </p>
                </div>
              </div>

              {/* Explicit cut / close button */}
              <button
                onClick={handleModalClose}
                title={language === "hi" ? "काटें / बंद करें (Close)" : "Close Checkout"}
                aria-label="Close Checkout"
                className="p-1.5 px-2.5 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">{language === "hi" ? "काटें" : "Close"}</span>
              </button>
            </div>

            {/* Cart Items List in Checkout */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#2D2D2D]">
                <span>ऑर्डर की जाने वाली फसलें ({cartItems.length}):</span>
                <span className="text-[10px] text-[#2D5A27] font-normal">मात्रा समायोजित करें</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.listing.id}
                    className="flex items-center justify-between bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.listing.images[0]}
                        alt={item.listing.titleHi}
                        className="w-9 h-9 rounded object-cover border border-[#DCD7CC] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h5 className="font-bold text-[#2D2D2D] truncate text-[11px]">
                          {language === "hi" ? item.listing.titleHi : item.listing.titleEn}
                        </h5>
                        <p className="text-[10px] text-[#75716B]">
                          ₹{item.listing.pricePerUnit}/{item.listing.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="font-extrabold text-[#2D2D2D] font-mono text-xs">
                        ₹{item.listing.pricePerUnit * item.quantity}
                      </div>

                      {/* Quantity Controller */}
                      {onUpdateQuantity && (
                        <div className="flex items-center gap-1 bg-white border border-[#DCD7CC] rounded p-0.5 font-mono text-[10px]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.listing.id, -1)}
                            className="px-1 text-[#2D2D2D] hover:bg-[#FAF8F5] font-bold rounded"
                          >
                            -
                          </button>
                          <span className="px-1 font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.listing.id, 1)}
                            className="px-1 text-[#2D2D2D] hover:bg-[#FAF8F5] font-bold rounded"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {onRemoveItem && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.listing.id)}
                          className="text-[#75716B] hover:text-red-600 p-0.5"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Transparent Commission Breakdown */}
            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DCD7CC] text-xs space-y-1.5">
              <div className="flex justify-between text-[#5C5850]">
                <span>🌾 फसल उप-योग (Produce Subtotal):</span>
                <span className="font-mono font-bold text-[#2D2D2D]">₹{cropSubtotal}</span>
              </div>
              <div className="flex justify-between text-[#5C5850]">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-[#2D5A27]" />
                  <span>प्लेटफ़ॉर्म सेवा व एस्क्रो गारंटी (Platform Fee @ 4%):</span>
                </span>
                <span className="font-mono text-[#2D5A27] font-bold">₹{platformCommission}</span>
              </div>
              <div className="flex justify-between text-[#5C5850]">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#2D5A27]" />
                  <span>फार्म-टू-डोरस्टेप ताज़ा डिलीवरी व हैंडलिंग:</span>
                </span>
                <span className="font-mono font-bold text-[#2D2D2D]">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-extrabold text-[#2D2D2D] text-sm border-t border-[#DCD7CC] pt-1.5">
                <span>कुल देय राशि (Total Payable Amount):</span>
                <span className="text-[#2D5A27] font-mono text-base">₹{totalAmount}</span>
              </div>

              {/* Business Commission Transparency Callout */}
              <div className="pt-1 text-[10px] text-[#5C5850] bg-white p-2 rounded border border-[#E5E0D6] flex items-center justify-between">
                <span>👨‍🌾 किसान को प्राप्त होगा: <strong className="text-[#2D2D2D]">₹{farmerPayout}</strong></span>
                <span>💼 प्लेटफ़ॉर्म कमाई (कमीशन + डिलीवरी): <strong className="text-[#2D5A27]">₹{platformRevenue}</strong></span>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {/* Buyer Delivery Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#2D2D2D] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>{t.deliveryAddress}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="आपका नाम"
                    className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                  />
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="फ़ोन नंबर (OTP के लिए)"
                    className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="पूरा डिलीवरी पता (मकान नं, कॉलोनी, शहर, पिन कोड)"
                  className="w-full py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#2D2D2D] flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>{t.paymentMethod}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "upi"
                        ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18] ring-1 ring-[#2D5A27]"
                        : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850] hover:bg-[#EDE8DF]"
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#2D5A27] shrink-0" />
                    <div>
                      <div className="font-bold text-xs">UPI / Dynamic QR Code</div>
                      <div className="text-[10px] text-[#75716B]">GPay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "netbanking"
                        ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18] ring-1 ring-[#2D5A27]"
                        : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850] hover:bg-[#EDE8DF]"
                    }`}
                  >
                    <Building className="w-4 h-4 text-[#2D5A27] shrink-0" />
                    <div>
                      <div className="font-bold text-xs">{t.payNetbanking} (इंटरनेट बैंकिंग)</div>
                      <div className="text-[10px] text-[#75716B]">SBI, HDFC, ICICI, PNB & All Banks</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("kisan_credit")}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "kisan_credit"
                        ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18] ring-1 ring-[#2D5A27]"
                        : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850] hover:bg-[#EDE8DF]"
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-[#2D5A27] shrink-0" />
                    <div>
                      <div className="font-bold text-xs">{t.payKisanCredit} / Wallet</div>
                      <div className="text-[10px] text-[#75716B]">Kisan Digital Escrow Balance</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18] ring-1 ring-[#2D5A27]"
                        : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850] hover:bg-[#EDE8DF]"
                    }`}
                  >
                    <Truck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                    <div>
                      <div className="font-bold text-xs">{t.payCOD}</div>
                      <div className="text-[10px] text-[#75716B]">डिलीवरी पर नकद (Cash on Delivery)</div>
                    </div>
                  </label>
                </div>

                {/* Sub-Interface: UPI & Dynamic QR Code */}
                {paymentMethod === "upi" && (
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#2D5A27]/40 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#2D2D2D]">
                        <QrCode className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>लाइव UPI QR कोड से भुगतान</span>
                      </div>
                      <div className="flex bg-white rounded-md border border-[#DCD7CC] p-0.5 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setUpiSubMethod("qr")}
                          className={`px-2 py-0.5 rounded ${upiSubMethod === "qr" ? "bg-[#2D5A27] text-white" : "text-[#5C5850] hover:bg-[#FAF8F5]"}`}
                        >
                          QR कोड स्कैन
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMethod("vpa")}
                          className={`px-2 py-0.5 rounded ${upiSubMethod === "vpa" ? "bg-[#2D5A27] text-white" : "text-[#5C5850] hover:bg-[#FAF8F5]"}`}
                        >
                          UPI ID
                        </button>
                      </div>
                    </div>

                    {upiSubMethod === "qr" ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-[#DCD7CC]">
                        {/* Dynamic Live QR Code */}
                        <div className="p-2 bg-white rounded-lg border border-[#DCD7CC] shadow-xs flex flex-col items-center shrink-0">
                          <QRCodeSVG
                            value={`upi://pay?pa=kisandirect.escrow@icici&pn=KisanDirectEscrow&am=${totalAmount}&cu=INR&tn=KisanDirect_${buyerName.replace(/\s+/g, '')}`}
                            size={110}
                            level="M"
                            marginSize={1}
                          />
                          <span className="text-[9px] font-mono text-[#75716B] mt-1 font-bold">
                            ₹{totalAmount} के लिए सक्रिय
                          </span>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-1.5 text-xs text-[#2D2D2D]">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#2D5A27]">
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>GPay, PhonePe, Paytm, BHIM से स्कैन करें</span>
                          </div>
                          <p className="text-[11px] text-[#5C5850] leading-relaxed">
                            क्यूआर कोड स्कैन करके भुगतान करें। भुगतान के बाद नीचे <strong>"भुगतान सत्यापित करें"</strong> दबाएं।
                          </p>

                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="bg-[#FAF8F5] px-2 py-0.8 rounded border border-[#DCD7CC] text-[10px] font-mono text-[#5C5850] flex items-center gap-1.5">
                              <span>UPI ID: <strong>kisandirect.escrow@icici</strong></span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText("kisandirect.escrow@icici");
                                  setCopiedUpi(true);
                                  setTimeout(() => setCopiedUpi(false), 2000);
                                }}
                                className="text-[#2D5A27] hover:underline"
                                title="कॉपी करें"
                              >
                                {copiedUpi ? <Check className="w-3 h-3 text-[#2D5A27]" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Manual UPI ID Input */
                      <div className="space-y-2 bg-white p-3 rounded-lg border border-[#DCD7CC]">
                        <label className="text-[11px] font-bold text-[#2D2D2D] block">
                          अपनी UPI ID (VPA) दर्ज करें:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={upiIdInput}
                            onChange={(e) => setUpiIdInput(e.target.value)}
                            placeholder="उदा. yourname@oksbi"
                            className="flex-1 py-1.5 px-2.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-xs font-mono text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                          />
                        </div>
                        <p className="text-[10px] text-[#75716B]">
                          आपके UPI ऐप पर ₹{totalAmount} की रिक्वेस्ट भेजी जाएगी।
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Interface: Internet Banking */}
                {paymentMethod === "netbanking" && (
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#2D5A27]/40 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#2D2D2D]">
                        <Landmark className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>इंटरनेट बैंकिंग (सभी प्रमुख भारतीय बैंक)</span>
                      </div>
                      <span className="text-[10px] text-[#2D5A27] font-bold bg-[#EBF5EA] px-1.5 py-0.5 rounded">
                        256-Bit SSL सुरक्षित
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#5C5850] block">
                        अपना बैंक चुनें (Select Your Bank):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {majorBanks.map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between ${
                              selectedBank === bank.id
                                ? "bg-white border-[#2D5A27] text-[#2D5A27] ring-1 ring-[#2D5A27] font-bold shadow-2xs"
                                : "bg-white border-[#DCD7CC] text-[#2D2D2D] hover:bg-[#F4F1EA]"
                            }`}
                          >
                            <span className="text-[11px] font-semibold leading-tight">
                              {language === "hi" ? bank.nameHi : bank.nameEn}
                            </span>
                            <span className="text-[9px] text-[#75716B] font-mono mt-1">
                              {bank.code} NetBanking
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="bg-white p-2 rounded-md border border-[#DCD7CC] flex items-center justify-between text-xs text-[#5C5850]">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Lock className="w-3 h-3 text-[#2D5A27]" />
                          <span>चयनित बैंक: <strong className="text-[#2D2D2D]">{majorBanks.find(b => b.id === selectedBank)?.nameHi}</strong></span>
                        </div>
                        <span className="text-[10px] text-[#2D5A27] font-bold">गेटवे कनेक्टेड</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Interface: Kisan Credit Wallet */}
                {paymentMethod === "kisan_credit" && (
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#2D5A27]/40 space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-1.5">
                      <span className="font-bold text-[#2D2D2D]">किसान डिजिटल वॉलेट बैलेंस</span>
                      <span className="font-bold font-mono text-[#2D5A27]">उपलब्ध: ₹18,450</span>
                    </div>
                    <p className="text-[11px] text-[#5C5850]">
                      आपके वॉलेट से ₹{totalAmount} की राशि सीधे किसान सुरक्षा एस्क्रो में लॉक की जाएगी। उत्पाद की डिलीवरी पर सत्यापन के बाद ही राशि किसान के खाते में स्थानांतरित होगी।
                    </p>
                  </div>
                )}

                {/* Sub-Interface: Cash on Delivery */}
                {paymentMethod === "cod" && (
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#2D5A27]/40 space-y-1.5 text-xs animate-in fade-in duration-200">
                    <div className="font-bold text-[#2D2D2D] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>कैश ऑन डिलीवरी (घर पर नकद)</span>
                    </div>
                    <p className="text-[11px] text-[#5C5850]">
                      जब ताजी फसल आपके पते पर पहुंचेगी, तब आप डिलीवरी पार्टनर को नकद या UPI के माध्यम से ₹{totalAmount} का भुगतान कर सकते हैं।
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Verification status feedback */}
              {isVerifyingPayment && (
                <div className="bg-[#EBF5EA] border border-[#2D5A27] p-3 rounded-lg text-center space-y-1.5 animate-pulse">
                  <Loader2 className="w-5 h-5 text-[#2D5A27] animate-spin mx-auto" />
                  <div className="font-bold text-xs text-[#1B3B18]">
                    NPCI / बैंक पेमेंट गेटवे से ₹{totalAmount} की पुष्टि हो रही है...
                  </div>
                  <p className="text-[10px] text-[#5C5850]">
                    कृपया प्रतीक्षा करें, ट्रांजैक्शन रिकॉर्ड किया जा रहा है।
                  </p>
                </div>
              )}

              {verificationSuccessMessage && (
                <div className="bg-[#EBF5EA] border border-[#2D5A27] p-2.5 rounded-lg flex items-center gap-2 text-xs text-[#1B3B18] font-bold">
                  <BadgeCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                  <span>{verificationSuccessMessage}</span>
                </div>
              )}

              {/* Escrow note */}
              <p className="text-[10px] text-[#92400E] bg-[#FEF3C7] p-2 rounded-md border border-[#FDE68A] leading-tight">
                {t.escrowNote}
              </p>

              {/* Submit and Cancel buttons */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={isProcessing || isVerifyingPayment}
                  className="flex-1 py-2.5 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
                >
                  {isProcessing || isVerifyingPayment ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>सत्यापन व ऑर्डर दर्ज हो रहा है...</span>
                    </span>
                  ) : paymentMethod === "cod" ? (
                    <>
                      <span>कैश ऑन डिलीवरी ऑर्डर कन्फर्म करें (₹{totalAmount})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>भुगतान सत्यापित करें व ऑर्डर कन्फर्म करें (₹{totalAmount})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2.5 rounded-lg border border-[#DCD7CC] text-[#5C5850] hover:text-[#2D2D2D] hover:bg-[#FAF8F5] text-xs font-bold transition-colors text-center"
                >
                  {language === "hi" ? "काटें / रद्द करें" : "Cancel & Close"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
