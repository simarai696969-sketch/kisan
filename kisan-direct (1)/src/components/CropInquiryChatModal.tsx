import React, { useState, useEffect, useRef } from "react";
import { CropListing, CropInquiryMessage, Language, UserProfile } from "../types";
import { 
  X, 
  Send, 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  Clock, 
  CheckCheck, 
  Paperclip, 
  Sparkles, 
  Info,
  CheckCircle2
} from "lucide-react";

interface CropInquiryChatModalProps {
  crop: CropListing | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: UserProfile;
  onOpenCallMasking?: (crop: CropListing) => void;
}

export const CropInquiryChatModal: React.FC<CropInquiryChatModalProps> = ({
  crop,
  isOpen,
  onClose,
  language,
  currentUser,
  onOpenCallMasking,
}) => {
  const isHi = language === "hi";
  const [messages, setMessages] = useState<CropInquiryMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation when opened
  useEffect(() => {
    if (crop && isOpen) {
      setMessages([
        {
          id: `msg-1`,
          cropId: crop.id,
          senderId: crop.farmerId,
          senderName: crop.farmerName,
          senderRole: "farmer",
          recipientId: currentUser.id,
          recipientName: currentUser.name,
          message: isHi 
            ? `नमस्कार! मैं ${crop.farmerName} हूँ। ${crop.titleHi} बिल्कुल ताजा और उच्च गुणवत्ता की है। आप कितनी मात्रा लेना चाहते हैं?` 
            : `Hello! I am ${crop.farmerName}. ${crop.titleEn} is fresh and high quality. How much quantity are you looking for?`,
          timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
        },
      ]);
    }
  }, [crop, isOpen, currentUser, isHi]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !crop) return null;

  const quickQuestions = isHi ? [
    "क्या भाव में थोक छूट संभव है?",
    "माल तुरंत डिस्पैच हो जाएगा?",
    "क्या सीधे खेत आकर सैम्पल देख सकते हैं?",
    "ट्रांसपोर्ट लोडिंग की सुविधा उपलब्ध है?",
  ] : [
    "Is bulk discount negotiable?",
    "Can it be dispatched today?",
    "Can I inspect samples at farm?",
    "Is transport loading available?",
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: CropInquiryMessage = {
      id: `msg-${Date.now()}`,
      cropId: crop.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role || "buyer",
      recipientId: crop.farmerId,
      recipientName: crop.farmerName,
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulated farmer response
    setTimeout(() => {
      let reply = isHi 
        ? `जी अवश्य, हमारे पास ${crop.availableStock} ${crop.unit} का पूरा स्टॉक तैयार है। आप प्लेटफॉर्म के सुरक्षित एस्क्रो के माध्यम से तुरंत ऑर्डर कर सकते हैं!` 
        : `Yes definitely, we have full stock of ${crop.availableStock} ${crop.unit} ready. You can safely order via Escrow!`;

      if (text.includes("छूट") || text.includes("discount") || text.includes("भाव")) {
        reply = isHi 
          ? `थोक खरीद के लिए टियर छूट पहले से लागू है। 10+ ${crop.unit} पर सीधा विशेष मूल्य मिलेगा!` 
          : `Wholesale bulk tier discounts are auto-applied on 10+ ${crop.unit}!`;
      } else if (text.includes("ट्रांसपोर्ट") || text.includes("loading") || text.includes("लोडिंग")) {
        reply = isHi 
          ? `हां, खेत पर ट्रैक्टर और लोडिंग मजदूर उपलब्ध हैं। हमारे वेरिफाइड ट्रांसपोर्टर पार्टनर भी सीधे पिकअप कर सकते हैं।` 
          : `Yes, loading assistance and partner verified trucks are available at the farm.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          cropId: crop.id,
          senderId: crop.farmerId,
          senderName: crop.farmerName,
          senderRole: "farmer",
          recipientId: currentUser.id,
          recipientName: currentUser.name,
          message: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
        }
      ]);
    }, 1000);
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
        className="bg-white rounded-2xl max-w-lg w-full border border-[#DCD7CC] shadow-2xl space-y-0 my-6 animate-in fade-in zoom-in duration-200 h-[85vh] max-h-[640px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#2D5A27] text-white p-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={crop.farmerPhoto}
              alt={crop.farmerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">{crop.farmerName}</span>
                <span className="bg-[#86EFAC] text-[#14532D] text-[9px] font-bold px-1.5 py-0.2 rounded-sm">
                  VERIFIED KISAN
                </span>
              </div>
              <div className="text-[11px] text-[#D1FAE5] flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{crop.farmerLocation} • {crop.distanceKm} किमी</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCallMasking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCallMasking(crop);
                }}
                className="p-1.5 px-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                title="सुरक्षित मास्क कॉल करें"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#86EFAC]" />
                <span className="hidden sm:inline text-[11px]">मास्क कॉल</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Context Banner */}
        <div className="bg-[#FAF8F5] px-3.5 py-2 border-b border-[#DCD7CC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <img
              src={crop.images[0]}
              alt={crop.titleHi}
              className="w-8 h-8 rounded-md object-cover border border-[#DCD7CC]"
            />
            <div>
              <div className="font-bold text-xs text-[#2D2D2D] line-clamp-1">{crop.titleHi}</div>
              <div className="text-[10px] text-[#75716B] font-mono">
                ₹{crop.pricePerUnit}/{crop.unit} • स्टॉक: {crop.availableStock} {crop.unit}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
              0% LEAK ESCROW BRIDGE
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#FBF9F6]">
          <div className="text-center">
            <span className="bg-[#FAF8F5] border border-[#E5E0D8] text-[#75716B] text-[10px] font-medium px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#2D5A27]" />
              {isHi ? "सुरक्षित इन-ऐप चैट • फोन नंबर पूरी तरह सुरक्षित है" : "Encrypted In-App Chat • 0% Number Leak"}
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl p-2.5 text-xs shadow-xs ${
                    isMe
                      ? "bg-[#2D5A27] text-white rounded-tr-none"
                      : "bg-white text-[#2D2D2D] border border-[#E5E0D8] rounded-tl-none"
                  }`}
                >
                  <div className="leading-relaxed">{msg.message}</div>
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                      isMe ? "text-[#D1FAE5]" : "text-[#75716B]"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-[#86EFAC]" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-1.5 bg-[#FAF8F5] border-t border-[#DCD7CC] flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="text-[10px] bg-white border border-[#DCD7CC] hover:border-[#2D5A27] hover:text-[#2D5A27] text-[#5C5850] font-semibold px-2 py-1 rounded-full shrink-0 transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-2.5 bg-white border-t border-[#DCD7CC] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isHi ? "किसान से सीधा संदेश लिखें..." : "Type message to farmer..."}
            className="flex-1 py-2 px-3 bg-[#FAF8F5] border border-[#DCD7CC] rounded-xl text-xs text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-[#2D5A27] hover:bg-[#234A1F] disabled:opacity-40 text-white rounded-xl font-bold transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
