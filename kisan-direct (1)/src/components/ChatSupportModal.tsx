import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Language } from "../types";
import { translations } from "../data/translations";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Mic,
  MicOff,
  RefreshCw, 
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Truck,
  Leaf,
  ShieldCheck,
  FlaskConical,
  PhoneCall,
  CheckCircle2,
  Trash2
} from "lucide-react";

interface ChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ChatSupportModal: React.FC<ChatSupportModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  const [expertMode, setExpertMode] = useState<"general" | "scientist">("general");
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "bot",
      text:
        language === "hi"
          ? "नमस्ते! मैं आपका डिजिटल कृषि व खरीद विशेषज्ञ 'किसान मित्र' हूँ। 🙏\n\nआप मुझसे बिना किसी झिझक के कोई भी सवाल पूछ सकते हैं:\n• 🛒 **खरीद व डिलीवरी**: ताज़ा फसल सीधे खेत से कैसे खरीदें, एस्क्रो भुगतान, लाइव GPS ट्रैकिंग।\n• 🌾 **मंडी भाव**: गेहूं, बासमती धान, टमाटर, प्याज आदि का आज का ताज़ा भाव।\n• 🐛 **फसल रोग व कीट**: पत्ती मुड़ना, पीला रतुआ, तना छेदक व जैविक कीटनाशक।\n• 🧪 **खाद व पोषण**: DAP, यूरिया, वर्मीकम्पोस्ट व संतुलित खुराक प्रति एकड़।\n• 💳 **एस्क्रो व रिफंड**: 100% सुरक्षित भुगतान, 4% कमीशन व रिफंड गारंटी।"
          : "Hello! I am Kisan Mitra, your 24/7 AI Agricultural Scientist & Direct Marketplace Assistant. 🙏\n\nAsk me anything about:\n• 🛒 Direct farm buying & live GPS tracking\n• 🌾 Today's Mandi market rates\n• 🐛 Crop diseases, pests & organic recipes\n• 🧪 Fertilizer dosages & soil nutrition\n• 💳 Escrow payments, 4% commission & instant refunds",
      timestamp: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Voice Input (Speech-to-Text)
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      let recognition: any = null;
      try {
        if (typeof (window as any).webkitSpeechRecognition === "function") {
          const WebkitRec = (window as any).webkitSpeechRecognition;
          recognition = new WebkitRec();
        } else if (typeof (window as any).SpeechRecognition === "function") {
          const StdRec = (window as any).SpeechRecognition;
          recognition = new StdRec();
        }
      } catch (constructErr) {
        console.warn("Speech recognition initialization warning:", constructErr);
        recognition = null;
      }

      if (!recognition) {
        setVoiceError(
          language === "hi"
            ? "वॉइस इनपुट इस ब्राउज़र में उपलब्ध नहीं है। कृपया टेक्स्ट टाइप करें।"
            : "Voice input is not supported in this browser. Please type your message."
        );
        setTimeout(() => setVoiceError(null), 3500);
        setIsListening(false);
        return;
      }

      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (startErr) {
        console.warn("Speech recognition start error:", startErr);
        setIsListening(false);
      }
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  const quickQuestions = [
    {
      category: "buying",
      label: language === "hi" ? "🛒 खेत से सीधी खरीद कैसे करें?" : "🛒 How to buy directly?",
      query: language === "hi" ? "किसान डायरेक्ट से सीधे खेत से ताज़ा फसल खरीदने का क्या तरीका है और एस्क्रो पेमेंट कैसे काम करता है?" : "How do I buy fresh crops directly from farmers with escrow protection?",
    },
    {
      category: "mandi",
      label: language === "hi" ? "🌾 गेहूं व धान का ताज़ा मंडी भाव" : "🌾 Wheat & Paddy Rates",
      query: language === "hi" ? "आज का गेहूं, बासमती धान और प्रमुख फसलों का मंडी भाव क्या है?" : "What are today's Mandi prices for wheat, basmati paddy, and vegetables?",
    },
    {
      category: "pest",
      label: language === "hi" ? "🍅 टमाटर में पत्ती मुड़ना व कीट उपचार" : "🍅 Tomato Leaf Curl Remedy",
      query: language === "hi" ? "टमाटर में पत्ती मुड़ने वाले रोग और सफेद मक्खी का देसी जैविक व वैज्ञानिक उपचार क्या है?" : "What is the organic and scientific remedy for tomato leaf curl disease?",
    },
    {
      category: "wheat_care",
      label: language === "hi" ? "🌾 गेहूं में पीला रतुआ का इलाज" : "🌾 Wheat Yellow Rust Care",
      query: language === "hi" ? "गेहूं में पीला रतुआ (Yellow Rust) के लक्षण और प्रोपिकोनाज़ोल का सटीक स्प्रे डोज क्या है?" : "What is the recommended dosage of Propiconazole for yellow rust in wheat?",
    },
    {
      category: "fertilizer",
      label: language === "hi" ? "🧪 प्रति एकड़ संतुलित खाद मात्रा" : "🧪 Fertilizer Dosage Per Acre",
      query: language === "hi" ? "फसल में DAP, यूरिया, पोटाश और वर्मीकम्पोस्ट का प्रति एकड़ संतुलित उपयोग कैसे करें?" : "What is the balanced NPK, DAP, Urea, and Vermicompost schedule per acre?",
    },
    {
      category: "escrow",
      label: language === "hi" ? "💳 4% कमीशन व रिफंड गारंटी" : "💳 4% Fee & Escrow Refund",
      query: language === "hi" ? "किसान डायरेक्ट का 4% प्लेटफॉर्म कमीशन, डिलीवरी चार्ज और ऑर्डर कैंसलेशन रिफंड नियम क्या हैं?" : "Explain the 4% platform commission, delivery fee, and instant refund policy.",
    },
    {
      category: "organic",
      label: language === "hi" ? "🌿 जीवामृत बनाने की आसान विधि" : "🌿 Jeevamrut Recipe",
      query: language === "hi" ? "देसी गाय के गोबर व गोमूत्र से 1 एकड़ के लिए जीवामृत बनाने की सटीक विधि बताएं।" : "How to prepare Jeevamrut organic fertilizer for 1 acre?",
    },
    {
      category: "helpline",
      label: language === "hi" ? "📞 आधिकारिक सहायता हेल्पलाइन" : "📞 Official Support Desk",
      query: language === "hi" ? "किसान डायरेक्ट का टोल फ्री हेल्पलाइन नंबर क्या है और किसान से बात कैसे करें?" : "What is the toll-free customer support hotline and contact policy?",
    },
  ];

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          language,
          expertMode,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      const botReply = data.reply || (language === "hi" ? "नमस्ते! जानकारी प्राप्त हो गई है।" : "Response received.");

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }),
        source: data.source,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `b-err-${Date.now()}`,
        sender: "bot",
        text: language === "hi"
          ? "🌾 **त्वरित कृषि सहायता:**\n• **मंडी भाव**: ऊपर 'लाइव मंडी भाव' टैब में सभी फसलों के ताज़ा रेट देखें।\n• **डिलीवरी स्थिति**: 'डिलीवरी' टैब पर क्लिक करके वाहन की लोकेशन ट्रैक करें।\n• **कीट समाधान**: नीम तेल 5ml/L या इमिडाक्लोप्रिड का छिड़काव करें।\n• **टोल-फ्री हेल्पलाइन**: 1800-KISAN-DIRECT"
          : "🌾 **Quick Help:** Check 'Live Mandi Prices' tab for today's market rates, or visit 'Track Deliveries' to see your active farm vehicle GPS status.",
        timestamp: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = (msgId: string, text: string) => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis) {
        if (speakingMsgId === msgId) {
          try {
            window.speechSynthesis.cancel();
          } catch (_) {}
          setSpeakingMsgId(null);
          return;
        }
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}

        const SpeechUtteranceClass = (window as any).SpeechSynthesisUtterance;
        if (!SpeechUtteranceClass || typeof SpeechUtteranceClass !== "function") {
          return;
        }

        const cleanText = text.replace(/[*#_•]/g, " ").replace(/₹/g, "रुपये ");
        let utterance: any = null;
        try {
          utterance = new SpeechUtteranceClass(cleanText);
        } catch (uErr) {
          console.warn("SpeechSynthesisUtterance instantiation failed:", uErr);
          return;
        }

        if (!utterance) return;
        utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
        utterance.rate = 0.95;
        utterance.onend = () => setSpeakingMsgId(null);
        utterance.onerror = () => setSpeakingMsgId(null);
        setSpeakingMsgId(msgId);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn("Text-to-speech error:", err);
      setSpeakingMsgId(null);
    }
  };

  const handleClearChat = () => {
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (_) {}
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: "bot",
        text:
          language === "hi"
            ? "नई बातचीत शुरू हुई है। 🙏 आप फसल रोग, खाद की मात्रा, आज के मंडी भाव, या सीधे खरीद-बिक्री के बारे में कोई भी प्रश्न पूछ सकते हैं!"
            : "New chat session started. Ask any question regarding farming, pest remedies, market prices, or direct orders!",
        timestamp: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#121212]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full h-[620px] max-h-[92vh] shadow-2xl border border-[#DCD7CC] flex flex-col justify-between animate-in fade-in zoom-in duration-200 overflow-hidden"
      >
        {/* Chat Header */}
        <div className="p-3 sm:p-3.5 bg-[#1B3B18] text-white flex items-center justify-between shrink-0 border-b border-[#2D5A27]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D5A27] border border-[#44803B] flex items-center justify-center text-[#FEF3C7] shadow-inner">
              <Bot className="w-5 h-5 text-[#86EFAC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#F4F1EA]">
                  {language === "hi" ? "किसान मित्र एवं AI कृषि विशेषज्ञ" : "Kisan Mitra & AI Agri Expert"}
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#86EFAC] animate-pulse"></span>
              </div>
              <p className="text-[10px] text-[#A7C4A0] flex items-center gap-1">
                <span>{language === "hi" ? "24x7 सक्रिय • हर सवाल का सटीक समाधान" : "24x7 Active • Complete Farm & Buyer Answers"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Clear Chat Button */}
            <button
              onClick={handleClearChat}
              title={language === "hi" ? "चैट रीसेट करें" : "Reset Chat"}
              className="p-1.5 rounded-lg text-[#A7C4A0] hover:text-white hover:bg-[#2D5A27] transition-colors text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Prominent High-Contrast Cut / Close Button */}
            <button
              onClick={onClose}
              title={language === "hi" ? "काटें / बंद करें (Close)" : "Close Popup"}
              aria-label="Close popup"
              className="p-1.5 px-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs hover:scale-105"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">{language === "hi" ? "काटें" : "Close"}</span>
            </button>
          </div>
        </div>

        {/* Expert Mode Switcher Banner */}
        <div className="bg-[#FAF8F5] px-3 py-1.5 border-b border-[#DCD7CC] flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] font-bold text-[#2D2D2D] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>विशेषज्ञ मोड:</span>
          </span>
          <div className="flex items-center gap-1 bg-[#EBE7DF] p-0.5 rounded-lg border border-[#DCD7CC]">
            <button
              onClick={() => setExpertMode("general")}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                expertMode === "general"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              👨‍🌾 {language === "hi" ? "किसान व ग्राहक सहायक" : "General & Buyer Guide"}
            </button>
            <button
              onClick={() => setExpertMode("scientist")}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                expertMode === "scientist"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              🔬 {language === "hi" ? "कृषि वैज्ञानिक (वैज्ञानिक डोज)" : "Agri Scientist (Doses)"}
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F4F1EA] text-xs">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            const isSpeaking = speakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4 text-[#FEF3C7]" />
                  </div>
                )}

                <div className="space-y-1 max-w-[88%] sm:max-w-[82%]">
                  <div
                    className={`p-3 rounded-xl leading-relaxed whitespace-pre-line text-xs shadow-xs transition-all ${
                      isBot
                        ? "bg-white text-[#2D2D2D] border border-[#DCD7CC] rounded-tl-xs"
                        : "bg-[#2D5A27] text-white rounded-tr-xs font-medium"
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-[9px] text-[#75716B] ${
                      isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    <span className="font-mono">{msg.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => handleSpeakText(msg.id, msg.text)}
                        title={isSpeaking ? "आवाज़ रोकें (Stop)" : "बोलकर सुनें (Listen)"}
                        className={`p-1 rounded-md transition-colors flex items-center gap-1 ${
                          isSpeaking
                            ? "bg-[#2D5A27] text-white"
                            : "hover:text-[#2D5A27] hover:bg-white text-[#75716B]"
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3 text-red-300" /> : <Volume2 className="w-3 h-3" />}
                        <span className="text-[9px] font-bold">{isSpeaking ? "रोकें" : "सुनें"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#2D5A27] border border-[#DCD7CC] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2 items-center text-xs text-[#75716B] italic animate-in fade-in duration-150">
              <div className="w-7 h-7 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 text-[#FEF3C7] animate-spin" />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DCD7CC] shadow-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] text-[#2D2D2D] font-bold ml-1">
                  {language === "hi" ? "किसान मित्र जवाब तैयार कर रहे हैं..." : "Formulating expert response..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topic Chips */}
        <div className="px-3 py-2 bg-white border-t border-[#DCD7CC] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.query)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EBF5EA] hover:text-[#2D5A27] text-[#5C5850] text-[10px] font-bold whitespace-nowrap transition-all border border-[#DCD7CC] hover:border-[#2D5A27] shrink-0"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Voice Error Banner */}
        {voiceError && (
          <div className="px-4 py-1.5 bg-[#FEF2F2] border-t border-[#FCA5A5] text-[#991B1B] text-[11px] font-medium flex items-center justify-between animate-in fade-in">
            <span>⚠️ {voiceError}</span>
            <button onClick={() => setVoiceError(null)} className="text-[#991B1B] hover:text-black font-bold ml-2">✕</button>
          </div>
        )}

        {/* Input Bar with Voice Input & Submit */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-2.5 sm:p-3 bg-white border-t border-[#DCD7CC] flex items-center gap-2 shrink-0"
        >
          {/* Voice Microphone Input */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? "सुनना बंद करें" : "माइक से बोलकर पूछें (Voice Input)"}
            className={`p-2 rounded-xl border transition-all ${
              isListening
                ? "bg-red-600 text-white border-red-700 animate-pulse"
                : "bg-[#FAF8F5] text-[#2D5A27] border-[#DCD7CC] hover:bg-[#EBF5EA]"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isListening
                ? (language === "hi" ? "कृपया बोलें, हम सुन रहे हैं..." : "Listening, please speak...")
                : (language === "hi" ? "फसल, कीट, मंडी भाव, खरीद या डिलीवरी का सवाल पूछें..." : "Ask any farm, price, order or pest question...")
            }
            className="flex-1 py-2 px-3 text-xs bg-[#FAF8F5] border border-[#DCD7CC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5A27] font-medium text-[#2D2D2D]"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="py-2 px-3.5 rounded-xl bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold text-xs transition-colors disabled:opacity-40 shadow-xs flex items-center gap-1.5"
          >
            <span>{language === "hi" ? "पूछें" : "Send"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>

          {/* Quick Exit / Close button inside footer */}
          <button
            type="button"
            onClick={onClose}
            title="पॉपअप बंद करें"
            className="p-2 px-2.5 rounded-xl border border-[#DCD7CC] text-[#75716B] hover:text-[#2D2D2D] hover:bg-[#FAF8F5] text-xs font-semibold"
          >
            {t.close}
          </button>
        </form>
      </div>
    </div>
  );
};
