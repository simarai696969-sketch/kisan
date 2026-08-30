import React, { useState, useEffect } from "react";
import { DeliveryOrder, Language } from "../types";
import { translations } from "../data/translations";
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  User, 
  Navigation,
  Thermometer,
  RotateCcw,
  Sparkles,
  Package,
  Layers,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  Percent,
  Receipt,
  Check,
  ChevronRight
} from "lucide-react";

interface DeliveryTrackingMapProps {
  orders: DeliveryOrder[];
  language: Language;
  selectedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: DeliveryOrder["status"]) => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
  onOpenGSTInvoice?: (order: DeliveryOrder) => void;
  onOpenReturnRequest?: (order: DeliveryOrder) => void;
  onOpenAlertsCenter?: () => void;
}

export const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  orders,
  language,
  selectedOrderId,
  onSelectOrder,
  onUpdateOrderStatus,
  onCancelOrder,
  onOpenGSTInvoice,
  onOpenReturnRequest,
  onOpenAlertsCenter,
}) => {
  const t = translations[language];

  const [activeOrderId, setActiveOrderId] = useState<string>(
    selectedOrderId || (orders.length > 0 ? orders[0].id : "")
  );
  const [driverProgress, setDriverProgress] = useState(0.55);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("गलती से गलत मात्रा चुनी गई थी (Wrong quantity selected)");
  const [customReason, setCustomReason] = useState("");
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  useEffect(() => {
    if (selectedOrderId) {
      setActiveOrderId(selectedOrderId);
    } else if (orders.length > 0 && !activeOrderId) {
      setActiveOrderId(orders[0].id);
    }
  }, [selectedOrderId, orders, activeOrderId]);

  // Animated truck movement simulation for active delivery
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        if (prev >= 0.95) return 0.15;
        return Number((prev + 0.02).toFixed(3));
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const selectedOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  if (!selectedOrder) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#DCD7CC] text-center space-y-3">
        <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#DCD7CC] text-[#75716B] flex items-center justify-center mx-auto">
          <Truck className="w-6 h-6 text-[#75716B]" />
        </div>
        <h3 className="text-base font-bold text-[#2D2D2D]">
          {language === "hi" ? "कोई सक्रिय ऑर्डर नहीं है" : "No Active Orders Found"}
        </h3>
        <p className="text-xs text-[#75716B] max-w-sm mx-auto">
          {language === "hi"
            ? "मंडी या बाजार से सीधे ताजी फसल खरीदें और लाइव फार्म-टू-डोरस्टेप डिलीवरी ट्रैक करें।"
            : "Purchase fresh produce from the marketplace to track real-time delivery."}
        </p>
      </div>
    );
  }

  // Calculate simulated driver coordinates
  const originX = 18;
  const originY = 72;
  const destX = 82;
  const destY = 28;
  const currentX = originX + (destX - originX) * driverProgress;
  const currentY = originY + (destY - originY) * driverProgress;

  // Status-specific badges & styling
  const getStatusBadge = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "delivered":
        return {
          bg: "bg-[#EBF5EA] text-[#2D5A27] border-[#B7DDB5]",
          textHi: "सफलतापूर्वक डिलीवर हुआ",
          textEn: "Delivered",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
        };
      case "cancelled":
        return {
          bg: "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]",
          textHi: "ऑर्डर रद्द किया गया",
          textEn: "Cancelled",
          icon: <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
        };
      case "out_for_delivery":
        return {
          bg: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
          textHi: "डिलीवरी के लिए निकला (Out for Delivery)",
          textEn: "Out for Delivery",
          icon: <Truck className="w-3.5 h-3.5 text-[#D97706]" />
        };
      case "in_transit":
        return {
          bg: "bg-[#EBF5EA] text-[#2D5A27] border-[#B7DDB5]",
          textHi: "वाहन रास्ते में है (In Transit)",
          textEn: "In Transit",
          icon: <Truck className="w-3.5 h-3.5 text-[#2D5A27]" />
        };
      case "packed_at_farm":
        return {
          bg: "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]",
          textHi: "खेत से पैक हुआ (Packed at Farm)",
          textEn: "Packed at Farm",
          icon: <Package className="w-3.5 h-3.5 text-[#2563EB]" />
        };
      case "order_placed":
      default:
        return {
          bg: "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]",
          textHi: "ऑर्डर दर्ज हुआ (Order Placed)",
          textEn: "Order Placed",
          icon: <Clock className="w-3.5 h-3.5 text-[#4B5563]" />
        };
    }
  };

  const currentBadge = getStatusBadge(selectedOrder.status);

  // Financial calculations
  const cropSubtotal = selectedOrder.cropSubtotal ?? (selectedOrder.totalAmount - (selectedOrder.platformCommission || 40) - (selectedOrder.deliveryFee || 50));
  const platformCommission = selectedOrder.platformCommission ?? Math.round(cropSubtotal * 0.04);
  const deliveryFee = selectedOrder.deliveryFee ?? 50;
  const farmerPayout = selectedOrder.farmerPayout ?? cropSubtotal;
  const platformRevenue = selectedOrder.platformRevenue ?? (platformCommission + deliveryFee);

  const handleStatusChange = (newStatus: DeliveryOrder["status"]) => {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(selectedOrder.id, newStatus);
    }
  };

  const handleConfirmCancel = () => {
    const finalReason = cancelReason === "अन्य कारण (Other Reason)" && customReason ? customReason : cancelReason;
    if (onCancelOrder) {
      onCancelOrder(selectedOrder.id, finalReason);
    } else if (onUpdateOrderStatus) {
      onUpdateOrderStatus(selectedOrder.id, "cancelled");
    }
    setShowCancelModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header with Order Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCD7CC] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#2D2D2D] flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#2D5A27]" />
            <span>{t.deliveryTrackingTitle}</span>
          </h2>
          <p className="text-xs text-[#75716B]">
            {language === "hi"
              ? "फार्म से उपभोक्ता तक सीधा, पारदर्शी व तापमान-नियंत्रित परिवहन"
              : "Live temperature-controlled logistics directly from farm gate."}
          </p>
        </div>

        {/* Order Selector Tabs */}
        {orders.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {orders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setActiveOrderId(ord.id);
                  if (onSelectOrder) onSelectOrder(ord.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border shrink-0 ${
                  activeOrderId === ord.id
                    ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                    : "bg-[#FAF8F5] text-[#5C5850] border-[#DCD7CC] hover:bg-[#EDE8DF]"
                }`}
              >
                {ord.orderNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live Map & Status Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Order Banner with Current Status */}
          <div className="bg-white p-4 rounded-xl border border-[#DCD7CC] shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCD7CC] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#75716B]">{selectedOrder.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${currentBadge.bg}`}>
                    {currentBadge.icon}
                    <span>{language === "hi" ? currentBadge.textHi : currentBadge.textEn}</span>
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-[#2D2D2D] mt-0.5">
                  {language === "hi" ? selectedOrder.cropNameHi : selectedOrder.cropNameEn}
                </h3>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-[#75716B]">कुल देय राशि</div>
                <div className="text-sm font-extrabold text-[#2D5A27] font-mono">
                  ₹{selectedOrder.totalAmount}
                </div>
              </div>
            </div>

            {/* If Order is Cancelled: Banner */}
            {selectedOrder.status === "cancelled" ? (
              <div className="bg-[#FEE2E2] p-3 rounded-lg border border-[#FCA5A5] space-y-1.5 text-xs text-[#991B1B]">
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4 text-[#DC2626]" />
                  <span>ऑर्डर रद्द हो चुका है (Order Cancelled)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  कारण: {selectedOrder.cancellationReason || "उपभोक्ता के अनुरोध पर ऑर्डर रद्द किया गया।"}
                </p>
                <div className="bg-white p-2 rounded border border-[#FECACA] text-[10px] text-[#7F1D1D]">
                  💳 <strong>रिफंड सूचना:</strong>{" "}
                  {selectedOrder.paymentMethod === "cod"
                    ? "यह कैश ऑन डिलीवरी ऑर्डर था। कोई भुगतान नहीं लिया गया है।"
                    : `₹${selectedOrder.totalAmount} की राशि 1-2 कार्यदिवस में आपके मूल भुगतान खाते में स्वतः क्रेडिट कर दी जाएगी। (रिफंड Ref: RFD-${selectedOrder.id.slice(-6)})`}
                </div>
              </div>
            ) : selectedOrder.status === "delivered" ? (
              /* If Order is Delivered: Success banner */
              <div className="bg-[#EBF5EA] p-3 rounded-lg border border-[#B7DDB5] space-y-2 text-xs text-[#1B3B18]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                    <span>सफलतापूर्वक डिलीवर हुआ (Delivered)</span>
                  </div>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#B7DDB5]">
                    OTP सत्यापित: {selectedOrder.deliveryOtp || "4821"}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  उपभोक्ता द्वारा ताजी फसल की जांच उपरांत डिलीवरी पूर्ण हुई। किसान सुरक्षा एस्क्रो से ₹{farmerPayout} किसान के खाते में सफलतापूर्वक हस्तांतरित कर दिए गए हैं।
                </p>
              </div>
            ) : (
              /* If Order is Active: Route Details */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
                  <span className="text-[10px] text-[#75716B] block">अनुमानित डिलीवरी</span>
                  <span className="font-bold text-[#2D2D2D] text-[11px]">{selectedOrder.deliveryDateEstimated}</span>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
                  <span className="text-[10px] text-[#75716B] block">डिलीवरी OTP</span>
                  <span className="font-mono font-bold text-[#2D5A27] text-xs">{selectedOrder.deliveryOtp || "4821"}</span>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
                  <span className="text-[10px] text-[#75716B] block">कोल्ड-चेन स्थिति</span>
                  <span className="font-bold text-[#2D5A27] text-[11px] flex items-center gap-0.5">
                    <Thermometer className="w-3 h-3 text-[#2D5A27]" />
                    <span>4°C (इष्टतम ताज़गी)</span>
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#DCD7CC]">
                  <span className="text-[10px] text-[#75716B] block">भुगतान विधि</span>
                  <span className="font-bold text-[#2D2D2D] text-[11px] uppercase">{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Simulated Map Stage (Shown for Active Orders) */}
          {selectedOrder.status !== "cancelled" && (
            <div className="bg-[#FAF8F5] rounded-xl border border-[#DCD7CC] p-4 relative overflow-hidden shadow-inner min-h-[260px] flex flex-col justify-between">
              {/* Grid Background Effect */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#2D5A27_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Map Header Overlay */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#DCD7CC] text-[10px] font-mono text-[#2D2D2D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-ping" />
                  <span>GPS लाइव सैटेलाइट ट्रैकिंग</span>
                </div>

                <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#DCD7CC] text-[10px] font-bold text-[#2D5A27] flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  <span>सक्रिय वेंटिलेशन व तापमान मॉनिटर</span>
                </div>
              </div>

              {/* SVG Delivery Route Visualization */}
              <div className="relative w-full h-36 my-2">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Route path */}
                  <path
                    d={`M ${originX} ${originY} Q 50 85, ${destX} ${destY}`}
                    fill="none"
                    stroke="#DCD7CC"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                  />
                  {/* Traveled path */}
                  <path
                    d={`M ${originX} ${originY} Q 50 85, ${selectedOrder.status === 'delivered' ? destX : currentX} ${selectedOrder.status === 'delivered' ? destY : currentY}`}
                    fill="none"
                    stroke="#2D5A27"
                    strokeWidth="3"
                  />
                </svg>

                {/* Origin Farm Pin */}
                <div
                  style={{ left: `${originX}%`, top: `${originY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2D5A27] text-white flex items-center justify-center shadow-md border-2 border-white text-xs">
                    🌱
                  </div>
                  <span className="text-[9px] font-bold bg-white/95 px-1.5 py-0.5 rounded shadow-2xs text-[#2D2D2D] border border-[#DCD7CC] mt-0.5 whitespace-nowrap">
                    खेत (Farm Gate)
                  </span>
                </div>

                {/* Moving Agri-Truck Pin (if in transit/packed/out_for_delivery) */}
                {selectedOrder.status !== "delivered" && (
                  <div
                    style={{ left: `${currentX}%`, top: `${currentY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000 ease-linear"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1B3B18] text-white flex items-center justify-center shadow-lg border-2 border-[#86EFAC]">
                      <Truck className="w-4 h-4 text-[#86EFAC] animate-bounce" />
                    </div>
                    <span className="text-[9px] font-extrabold bg-[#1B3B18] text-white px-1.5 py-0.2 rounded shadow-xs font-mono mt-0.5 whitespace-nowrap">
                      Agri-Van (42 km/h)
                    </span>
                  </div>
                )}

                {/* Destination Buyer Pin */}
                <div
                  style={{ left: `${destX}%`, top: `${destY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs ${selectedOrder.status === 'delivered' ? 'bg-[#2D5A27] text-white' : 'bg-[#D97706] text-white'}`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-bold bg-white/95 px-1.5 py-0.5 rounded shadow-2xs text-[#2D2D2D] border border-[#DCD7CC] mt-0.5 whitespace-nowrap">
                    उपभोक्ता पता (Delivery)
                  </span>
                </div>
              </div>

              {/* Map Footer Route Info */}
              <div className="relative z-10 grid grid-cols-2 gap-2 bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-[#DCD7CC] text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">📍</span>
                  <span className="text-[#5C5850] truncate">
                    स्रोत: <strong className="text-[#2D2D2D]">{selectedOrder.farmerLocation}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-xs">🏠</span>
                  <span className="text-[#5C5850] truncate">
                    गंतव्य: <strong className="text-[#2D2D2D]">{selectedOrder.buyerAddress}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Masked Driver & Support Bridge (Direct Contact Prevention) */}
          <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#EBF5EA] border border-[#B7DDB5] flex items-center justify-center text-[#2D5A27] font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#75716B] font-bold uppercase">{t.driverDetails}</span>
                <h4 className="font-bold text-[#2D2D2D] text-xs sm:text-sm">{selectedOrder.driverName}</h4>
                <p className="text-[10px] text-[#75716B] font-mono">{selectedOrder.vehicleNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`tel:${selectedOrder.driverPhone}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 bg-[#2D5A27] hover:bg-[#234A1F] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.callDriver}</span>
              </a>

              {/* Masked Intermediary Platform Support Button */}
              <button
                type="button"
                onClick={() => setSupportModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 bg-[#FAF8F5] hover:bg-[#EDE8DF] text-[#2D2D2D] text-xs font-bold py-1.5 px-3 rounded-lg border border-[#DCD7CC] transition-colors"
                title="सुरक्षा हेतु सभी सहायता किसान डायरेक्ट मध्यस्थता डेस्क द्वारा दी जाती है"
              >
                <Lock className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>किसान सहायता डेस्क</span>
              </button>
            </div>
          </div>

          {/* Interactive Order Lifecycle Stepper / Simulator for Demonstration */}
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2D2D2D] flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>ऑर्डर स्थिति नियंत्रण व सिमुलेटर (Order Status Controls):</span>
              </span>
              <span className="text-[10px] text-[#75716B]">वर्तमान: {selectedOrder.status}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleStatusChange("order_placed")}
                className={`py-1.5 px-1 rounded border font-semibold text-center transition-all ${
                  selectedOrder.status === "order_placed"
                    ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                    : "bg-white text-[#5C5850] border-[#DCD7CC] hover:bg-[#FAF8F5]"
                }`}
              >
                1. ऑर्डर दर्ज
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("packed_at_farm")}
                className={`py-1.5 px-1 rounded border font-semibold text-center transition-all ${
                  selectedOrder.status === "packed_at_farm"
                    ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                    : "bg-white text-[#5C5850] border-[#DCD7CC] hover:bg-[#FAF8F5]"
                }`}
              >
                2. खेत पैकिंग
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("in_transit")}
                className={`py-1.5 px-1 rounded border font-semibold text-center transition-all ${
                  selectedOrder.status === "in_transit"
                    ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                    : "bg-white text-[#5C5850] border-[#DCD7CC] hover:bg-[#FAF8F5]"
                }`}
              >
                3. रास्ते में
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("out_for_delivery")}
                className={`py-1.5 px-1 rounded border font-semibold text-center transition-all ${
                  selectedOrder.status === "out_for_delivery"
                    ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                    : "bg-white text-[#5C5850] border-[#DCD7CC] hover:bg-[#FAF8F5]"
                }`}
              >
                4. डिलीवरी पर
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("delivered")}
                className={`py-1.5 px-1 rounded border font-semibold text-center transition-all ${
                  selectedOrder.status === "delivered"
                    ? "bg-[#2D5A27] text-white border-[#2D5A27]"
                    : "bg-white text-[#5C5850] border-[#DCD7CC] hover:bg-[#FAF8F5]"
                }`}
              >
                5. डिलीवर हुआ
              </button>
            </div>

            {/* Cancellation Trigger Button if order is still active */}
            {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ऑर्डर रद्द करें (Cancel Order)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkpoints, Transparent Commission Breakdown & Escrow Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Detailed Milestone Checkpoints Timeline */}
          <div className="bg-white p-4 rounded-xl border border-[#DCD7CC] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-2.5">
              <div>
                <h3 className="font-bold text-[#2D2D2D] text-sm">{t.deliveryStatus}</h3>
                <p className="text-[11px] text-[#75716B]">
                  {language === "hi" ? "खेत से घर तक चरणबद्ध प्रगति" : "Order Progression"}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentBadge.bg}`}>
                {language === "hi" ? currentBadge.textHi : currentBadge.textEn}
              </span>
            </div>

            {/* Detailed Milestone Checkpoints Timeline & Escrow Lifecycle */}
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCD7CC]">
              {selectedOrder.checkpoints.map((cp, idx) => {
                const isCompleted = cp.completed;
                const isCurrent = cp.current;

                return (
                  <div key={idx} className="relative flex items-start gap-2.5 pl-0.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold transition-colors ${
                        isCurrent
                          ? "bg-[#2D5A27] text-white ring-2 ring-[#B7DDB5]"
                          : isCompleted
                          ? "bg-[#2D5A27] text-white"
                          : "bg-[#EDE8DF] text-[#75716B]"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-xs font-bold ${isCurrent ? "text-[#2D5A27]" : isCompleted ? "text-[#2D2D2D]" : "text-[#75716B]"}`}>
                          {language === "hi" ? cp.titleHi : cp.titleEn}
                        </h5>
                        <span className="text-[9px] text-[#75716B] font-mono">{cp.time}</span>
                      </div>

                      <p className="text-[11px] text-[#5C5850] leading-relaxed">
                        {language === "hi" ? cp.descriptionHi : cp.descriptionEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5-Step Escrow Protection Pipeline Card (Requirement 4) */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DCD7CC] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#2D2D2D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>सुरक्षित एस्क्रो भुगतान स्थिति (Escrow Status)</span>
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                selectedOrder.status === "delivered" 
                  ? "bg-[#EBF5EA] text-[#15803D] border border-[#B7DDB5]" 
                  : selectedOrder.status === "cancelled"
                  ? "bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]"
                  : selectedOrder.status === "return_requested"
                  ? "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                  : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
              }`}>
                {selectedOrder.status === "delivered" 
                  ? "✓ किसान खाते में ट्रांसफर्ड" 
                  : selectedOrder.status === "cancelled"
                  ? "↩ रिफंड प्रक्रिया में"
                  : selectedOrder.status === "return_requested"
                  ? "⚠️ वापसी व विवाद में होल्ड"
                  : "🔒 एस्क्रो में सुरक्षित लॉक"}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-[#DCD7CC] space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5C5850]">एस्क्रो वॉल्ट आईडी:</span>
                <span className="font-mono font-bold text-[#2D2D2D]">ESC-{selectedOrder.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5C5850]">सुरक्षित राशि:</span>
                <span className="font-mono font-bold text-[#2D5A27]">₹{selectedOrder.totalAmount}</span>
              </div>
              <div className="text-[10px] text-[#75716B] leading-relaxed pt-1 border-t border-[#EDE8DF]">
                {selectedOrder.status === "delivered"
                  ? `उपभोक्ता ने डिलीवरी OTP (${selectedOrder.deliveryOtp || '4821'}) सत्यापित कर दिया है। ₹${farmerPayout} किसान के बैंक खाते में निर्गत कर दिए गए हैं।`
                  : "भुगतान किसान डायरेक्ट एस्क्रो में सुरक्षित है। जब आप डिलीवरी के समय OTP देंगे, तभी किसान को भुगतान ट्रांसफर होगा।"}
              </div>
            </div>

            {/* Quick Action Buttons for GST Bill & 24-Hour Return */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenGSTInvoice && (
                <button
                  type="button"
                  onClick={() => onOpenGSTInvoice(selectedOrder)}
                  className="p-2 bg-white hover:bg-[#EBF5EA] text-[#2D5A27] font-bold text-xs rounded-lg border border-[#B7DDB5] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>📄 GST इनवॉइस व बिल</span>
                </button>
              )}

              {onOpenReturnRequest && selectedOrder.status === "delivered" && (
                <button
                  type="button"
                  onClick={() => onOpenReturnRequest(selectedOrder)}
                  className="p-2 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] font-bold text-xs rounded-lg border border-[#FDE68A] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>🔄 24-घंटे आसान वापसी</span>
                </button>
              )}

              {onOpenAlertsCenter && (
                <button
                  type="button"
                  onClick={onOpenAlertsCenter}
                  className="col-span-2 p-1.5 bg-[#FAF8F5] hover:bg-[#EDE8DF] text-[#5C5850] font-semibold text-[11px] rounded-lg border border-[#DCD7CC] transition-colors flex items-center justify-center gap-1"
                >
                  <span>📲 SMS व WhatsApp ऑर्डर अपडेट्स देखें</span>
                </button>
              )}
            </div>
          </div>

          {/* Financial Breakdown & Commission Transparency Card */}
          <div className="bg-white p-4 rounded-xl border border-[#DCD7CC] shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-2">
              <span className="font-bold text-[#2D2D2D] flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>वित्तीय विवरण व पारदर्शी कमीशन</span>
              </span>
              <span className="text-[10px] text-[#2D5A27] font-bold bg-[#EBF5EA] px-1.5 py-0.5 rounded">
                100% पारदर्शी
              </span>
            </div>

            <div className="space-y-1.5 text-[#5C5850]">
              <div className="flex justify-between">
                <span>फसल मूल्य (Crop Subtotal):</span>
                <span className="font-bold text-[#2D2D2D] font-mono">₹{cropSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>प्लेटफ़ॉर्म मैचिंग व एस्क्रो शुल्क (4%):</span>
                <span className="text-[#2D5A27] font-mono font-semibold">₹{platformCommission}</span>
              </div>
              <div className="flex justify-between">
                <span>फार्म-टू-डोरस्टेप डिलीवरी शुल्क:</span>
                <span className="font-mono font-semibold">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-extrabold text-[#2D2D2D] border-t border-[#DCD7CC] pt-1">
                <span>कुल भुगतान राशि (Total Paid):</span>
                <span className="text-[#2D5A27] font-mono">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="p-2 bg-[#FAF8F5] rounded border border-[#DCD7CC] text-[10px] space-y-1 text-[#5C5850]">
              <div className="flex justify-between">
                <span>👨‍🌾 किसान को शुद्ध भुगतान (Net Payout):</span>
                <strong className="text-[#2D2D2D] font-mono">₹{farmerPayout}</strong>
              </div>
              <div className="flex justify-between">
                <span>💼 प्लेटफ़ॉर्म कुल कमाई (कमीशन + डिलीवरी):</span>
                <strong className="text-[#2D5A27] font-mono">₹{platformRevenue}</strong>
              </div>
            </div>
          </div>

          {/* Privacy & Escrow Policy Note */}
          <div className="bg-[#FEF3C7] p-3 rounded-xl border border-[#FDE68A] space-y-1.5 text-xs text-[#92400E]">
            <div className="font-bold flex items-center gap-1 text-[11px] text-[#854D0E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
              <span>किसान डायरेक्ट एस्क्रो व प्राइवेसी सुरक्षा:</span>
            </div>
            <p className="text-[10px] text-[#92400E] leading-relaxed">
              गुणवत्ता, उचित कमीशन और धोखाधड़ी रोकथाम हेतु सभी लेनदेन व संचार केवल किसान डायरेक्ट प्लेटफॉर्म के माध्यम से ही संसाधित होते हैं।
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-[#DCD7CC] shadow-2xl space-y-3.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2 text-red-600 border-b border-[#DCD7CC] pb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-[#2D2D2D]">ऑर्डर रद्द करने की पुष्टि करें</h3>
            </div>

            <p className="text-xs text-[#5C5850]">
              क्या आप सुनिश्चित हैं कि आप ऑर्डर <strong>{selectedOrder.orderNumber}</strong> को रद्द करना चाहते हैं?
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D2D2D] block">
                रद्द करने का कारण चुनें (Reason for Cancellation):
              </label>
              {[
                "गलती से गलत मात्रा चुनी गई थी (Wrong quantity selected)",
                "डिलीवरी में अधिक समय लग रहा है (Delivery delay)",
                "डिलीवरी पता बदलना है (Change delivery address)",
                "अन्य कारण (Other Reason)"
              ].map((reason, idx) => (
                <label
                  key={idx}
                  onClick={() => setCancelReason(reason)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                    cancelReason === reason
                      ? "bg-[#EBF5EA] border-[#2D5A27] text-[#1B3B18] font-bold"
                      : "bg-[#FAF8F5] border-[#DCD7CC] text-[#5C5850]"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                    className="text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {cancelReason.includes("अन्य कारण") && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="कृपया कारण विस्तार से बताएं..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-xs text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                  rows={2}
                />
              )}
            </div>

            <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DCD7CC] text-[10px] text-[#5C5850]">
              {selectedOrder.paymentMethod === "cod" ? (
                <span>कैश ऑन डिलीवरी ऑर्डर तुरंत रद्द कर दिया जाएगा।</span>
              ) : (
                <span>₹{selectedOrder.totalAmount} की राशि 1-2 कार्यदिवस में आपके खाते में स्वतः रिफंड हो जाएगी।</span>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
              >
                हाँ, ऑर्डर रद्द करें
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg border border-[#DCD7CC] text-[#2D2D2D] hover:bg-[#FAF8F5] text-xs font-semibold"
              >
                रद्द न करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Masked Farmer Support Bridge Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-[#DCD7CC] shadow-2xl space-y-3 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#2D5A27]" />
                <h3 className="font-bold text-sm text-[#2D2D2D]">किसान डायरेक्ट मध्यस्थता सहायता डेस्क</h3>
              </div>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-[#75716B] hover:text-[#2D2D2D]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#5C5850]">
              <p className="leading-relaxed">
                <strong>🔒 बिचौलिया रोकथाम व सुरक्षा नीति:</strong> उपभोक्ता की सुरक्षा, एस्क्रो गारंटी और फसल गुणवत्ता सुनिश्चित करने हेतु सभी बातचीत किसान डायरेक्ट आधिकारिक हेल्पलाइन द्वारा मध्यस्थ होती है।
              </p>

              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#DCD7CC] space-y-1.5">
                <div className="text-[11px] font-bold text-[#2D2D2D]">
                  किसान: {selectedOrder.farmerName} ({selectedOrder.farmerLocation})
                </div>
                <div className="text-[10px] text-[#75716B]">
                  ऑर्डर संख्या: {selectedOrder.orderNumber}
                </div>
                <div className="text-[11px] text-[#2D5A27] font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>आधिकारिक सपोर्ट हेल्पलाइन: 1800-KISAN-DIRECT (टोल फ्री)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSupportModalOpen(false)}
              className="w-full py-2 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold text-xs"
            >
              समझ गया (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
