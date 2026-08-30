import React, { useState } from "react";
import { NotificationLog, Language, DeliveryOrder } from "../types";
import { 
  Bell, 
  MessageSquare, 
  Phone, 
  Smartphone, 
  Send, 
  CheckCheck, 
  Clock, 
  ExternalLink, 
  Share2, 
  User, 
  Tractor, 
  Truck, 
  ShieldCheck, 
  X,
  Search,
  Filter,
  Sparkles,
  Copy,
  Check
} from "lucide-react";

interface AlertsNotificationCenterModalProps {
  notifications: NotificationLog[];
  orders: DeliveryOrder[];
  language: Language;
  onClose: () => void;
  onSendTestNotification?: (orderId: string, event: NotificationLog["event"]) => void;
}

export const AlertsNotificationCenterModal: React.FC<AlertsNotificationCenterModalProps> = ({
  notifications,
  orders,
  language,
  onClose,
  onSendTestNotification,
}) => {
  const isHi = language === "hi";

  const [activeRecipientFilter, setActiveRecipientFilter] = useState<"all" | "buyer" | "farmer">("all");
  const [activeChannelFilter, setActiveChannelFilter] = useState<"all" | "whatsapp" | "sms">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifForPreview, setSelectedNotifForPreview] = useState<NotificationLog | null>(
    notifications.length > 0 ? notifications[0] : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = notifications.filter((notif) => {
    if (activeRecipientFilter !== "all" && notif.recipientType !== activeRecipientFilter) return false;
    if (activeChannelFilter !== "all" && notif.channel !== activeChannelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        notif.orderNumber.toLowerCase().includes(q) ||
        notif.recipientName.toLowerCase().includes(q) ||
        notif.messageHi.toLowerCase().includes(q) ||
        notif.messageEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (message: string, phone?: string) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    const phoneParam = cleanPhone.length >= 10 ? `phone=${cleanPhone}&` : "";
    const url = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#DCD7CC] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header Bar */}
        <div className="bg-[#1B3B18] text-white p-4 px-5 flex items-center justify-between border-b border-[#2D5A27]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D5A27] flex items-center justify-center text-white border border-[#3E7036]">
              <Bell className="w-5 h-5 text-[#86EFAC]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>{isHi ? "स्वचालित अलर्ट व SMS/WhatsApp सूचना केंद्र" : "Automated SMS & WhatsApp Alerts Engine"}</span>
                <span className="text-[10px] bg-[#25D366] text-white font-black px-1.5 py-0.5 rounded uppercase">
                  LIVE AUTO-SYNC
                </span>
              </h3>
              <p className="text-[11px] text-[#A7F3D0]">
                किसान और ग्राहक दोनों के लिए हर ऑर्डर माइलस्टोन पर तुरंत रीयल-टाइम अपडेट
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#D5E8D2] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-[#FAF8F5] p-3 px-5 border-b border-[#DCD7CC] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Recipient Segment */}
          <div className="flex items-center gap-1 bg-[#EDE8DF] p-1 rounded-lg border border-[#DCD7CC]">
            <button
              onClick={() => setActiveRecipientFilter("all")}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                activeRecipientFilter === "all"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              {isHi ? "सभी अलर्ट्स" : "All"} ({notifications.length})
            </button>

            <button
              onClick={() => setActiveRecipientFilter("farmer")}
              className={`px-3 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                activeRecipientFilter === "farmer"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              <Tractor className="w-3.5 h-3.5" />
              <span>{isHi ? "किसान संदेश (Seller)" : "Farmers"}</span>
            </button>

            <button
              onClick={() => setActiveRecipientFilter("buyer")}
              className={`px-3 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
                activeRecipientFilter === "buyer"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isHi ? "ग्राहक संदेश (Buyer)" : "Buyers"}</span>
            </button>
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveChannelFilter(activeChannelFilter === "whatsapp" ? "all" : "whatsapp")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                activeChannelFilter === "whatsapp"
                  ? "bg-[#25D366] border-[#1EBE5D] text-white"
                  : "bg-white border-[#DCD7CC] text-[#5C5850] hover:bg-[#FAF8F5]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveChannelFilter(activeChannelFilter === "sms" ? "all" : "sms")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                activeChannelFilter === "sms"
                  ? "bg-[#2D5A27] border-[#2D5A27] text-white"
                  : "bg-white border-[#DCD7CC] text-[#5C5850] hover:bg-[#FAF8F5]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>SMS Gateway</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#75716B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? "ऑर्डर / मोबाइल से खोजें..." : "Search order or phone..."}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DCD7CC] rounded-lg text-xs focus:outline-none focus:border-[#2D5A27]"
            />
          </div>
        </div>

        {/* Main Split Body: Logs List & WhatsApp Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#DCD7CC]">
          
          {/* Left Column: Notification Feed */}
          <div className="md:col-span-7 overflow-y-auto p-4 space-y-3 max-h-[58vh]">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-[#75716B]">
                <Bell className="w-8 h-8 mx-auto text-[#DCD7CC]" />
                <p className="text-xs font-bold">{isHi ? "कोई अलर्ट नहीं मिला" : "No alerts found"}</p>
              </div>
            ) : (
              filteredLogs.map((item) => {
                const isSelected = selectedNotifForPreview?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNotifForPreview(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF5EA] border-[#2D5A27] shadow-xs"
                        : "bg-white border-[#DCD7CC] hover:border-[#B7DDB5] hover:bg-[#FCFBF8]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#EDE8DF] pb-2">
                      <div className="flex items-center gap-2">
                        {item.channel === "whatsapp" ? (
                          <span className="w-6 h-6 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center">
                            <Smartphone className="w-3.5 h-3.5" />
                          </span>
                        )}

                        <div>
                          <div className="font-extrabold text-xs text-[#2D2D2D] flex items-center gap-1.5">
                            <span>{item.titleHi}</span>
                            <span className="font-mono text-[10px] text-[#75716B]">({item.orderNumber})</span>
                          </div>
                          <div className="text-[10px] text-[#5C5850]">
                            प्राप्तकर्ता: <strong className="text-[#2D2D2D]">{item.recipientName}</strong> ({item.recipientType === "farmer" ? "👨‍🌾 किसान" : "👤 ग्राहक"})
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-[#75716B] flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.timestamp}</span>
                        </div>
                        <div className="text-[9px] text-[#2D5A27] font-bold flex items-center justify-end gap-0.5 mt-0.5">
                          <CheckCheck className="w-3 h-3 text-[#25D366]" />
                          <span>डिलीवर हुआ</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#5C5850] mt-2 line-clamp-2 leading-relaxed">
                      {item.messageHi}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-[#EDE8DF] text-[11px]">
                      <span className="font-mono text-[#75716B] text-[10px]">
                        📱 {item.recipientPhone}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.messageHi, item.id);
                          }}
                          className="text-[#5C5850] hover:text-[#2D2D2D] p-1 rounded hover:bg-[#EDE8DF]"
                          title="मैसेज कॉपी करें"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#2D5A27]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenWhatsApp(item.messageHi, item.recipientPhone);
                          }}
                          className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Live Interactive WhatsApp Device Preview */}
          <div className="md:col-span-5 bg-[#FAF8F5] p-4 flex flex-col justify-between overflow-y-auto max-h-[58vh]">
            {selectedNotifForPreview ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#2D2D2D] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>लाइव मोबाइल स्क्रीन प्रीव्यू (Live Simulation)</span>
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#DCD7CC] font-mono text-[#5C5850]">
                    {selectedNotifForPreview.channel.toUpperCase()}
                  </span>
                </div>

                {/* Simulated Phone WhatsApp UI */}
                <div className="bg-[#EFEAE2] rounded-2xl border-2 border-[#DCD7CC] p-3 shadow-md space-y-2.5 overflow-hidden font-sans">
                  
                  {/* WhatsApp Chat Header */}
                  <div className="bg-[#075E54] text-white p-2.5 -m-3 mb-2 rounded-t-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white text-[#075E54] flex items-center justify-center font-bold text-xs">
                        KD
                      </div>
                      <div>
                        <div className="font-bold text-xs">Kisan Direct Official</div>
                        <div className="text-[9px] text-[#A7F3D0]">सत्यापित बिजनेस खाता (Verified)</div>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#86EFAC] animate-ping"></div>
                  </div>

                  {/* Security Notice Bubble */}
                  <div className="bg-[#FFF8E7] text-[#8C6B38] text-[9px] p-2 rounded-lg text-center shadow-2xs leading-tight border border-[#F5E7B8]">
                    🔒 संदेश पूर्णतः एन्क्रिप्टेड हैं। कोई भी बिचौलिया या तीसरा व्यक्ति इसे नहीं पढ़ सकता।
                  </div>

                  {/* WhatsApp Message Bubble */}
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs border border-[#E0D8C8] space-y-1.5 text-xs text-[#111B21]">
                    <div className="font-bold text-[#075E54] text-[11px] flex items-center justify-between">
                      <span>{selectedNotifForPreview.titleHi}</span>
                      <span className="text-[9px] text-[#8696A0] font-normal">{selectedNotifForPreview.timestamp.split(",")[1]}</span>
                    </div>

                    <p className="text-xs text-[#111B21] leading-relaxed whitespace-pre-line">
                      {selectedNotifForPreview.messageHi}
                    </p>

                    {selectedNotifForPreview.deliveryOtp && (
                      <div className="bg-[#E7F3EF] p-2 rounded-xl border border-[#25D366]/30 text-center">
                        <div className="text-[10px] text-[#075E54] font-semibold">आपका सीक्रेट डिलीवरी OTP:</div>
                        <div className="text-base font-black font-mono tracking-widest text-[#075E54]">
                          {selectedNotifForPreview.deliveryOtp}
                        </div>
                      </div>
                    )}

                    {selectedNotifForPreview.utrNumber && (
                      <div className="bg-[#FAF8F5] p-1.5 rounded-lg border border-[#DCD7CC] text-[10px] font-mono text-[#5C5850]">
                        बैंक UTR: <strong className="text-[#1B3B18]">{selectedNotifForPreview.utrNumber}</strong>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696A0] pt-1">
                      <span>{selectedNotifForPreview.timestamp.split(",")[1]}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                    </div>
                  </div>
                </div>

                {/* Quick Interactive Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleOpenWhatsApp(selectedNotifForPreview.messageHi, selectedNotifForPreview.recipientPhone)}
                    className="w-full py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp पर वास्तविक मैसेज भेजें</span>
                  </button>

                  <button
                    onClick={() => handleCopy(selectedNotifForPreview.messageHi, selectedNotifForPreview.id)}
                    className="w-full py-2 bg-white hover:bg-[#FAF8F5] text-[#2D2D2D] font-bold text-xs rounded-xl border border-[#DCD7CC] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#5C5850]" />
                    <span>{copiedId === selectedNotifForPreview.id ? "मैसेज कॉपी हो गया ✅" : "पूरा मैसेज टेक्स्ट कॉपी करें"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#75716B] text-xs">
                किसी अलर्ट पर क्लिक करके लाइव प्रीव्यू देखें
              </div>
            )}

            {/* Test Trigger Engine */}
            <div className="mt-4 pt-3 border-t border-[#DCD7CC] bg-white p-3 rounded-xl border border-[#EDE8DF]">
              <div className="text-[11px] font-bold text-[#2D2D2D] mb-1.5 flex items-center gap-1">
                <Send className="w-3 h-3 text-[#2D5A27]" />
                <span>परीक्षण अलर्ट ट्रिगर करें (Simulate Instant SMS/WhatsApp):</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onSendTestNotification && orders[0] && onSendTestNotification(orders[0].id, "order_placed")}
                  className="py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#EBF5EA] text-[#2D5A27] rounded-lg border border-[#DCD7CC] text-[10px] font-bold transition-colors"
                >
                  📦 नया ऑर्डर अलर्ट
                </button>
                <button
                  onClick={() => onSendTestNotification && orders[0] && onSendTestNotification(orders[0].id, "delivered")}
                  className="py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#EBF5EA] text-[#2D5A27] rounded-lg border border-[#DCD7CC] text-[10px] font-bold transition-colors"
                >
                  ✅ डिलीवरी व पेआउट
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F5] p-3 px-5 border-t border-[#DCD7CC] flex justify-between items-center text-xs">
          <div className="text-[11px] text-[#75716B]">
            SMS Gateway: <strong>KisanDirect-DLT</strong> (Govt Approved Header)
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2D2D2D] hover:bg-[#1E1E1E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {isHi ? "बंद करें (Close)" : "Close"}
          </button>
        </div>

      </div>
    </div>
  );
};
