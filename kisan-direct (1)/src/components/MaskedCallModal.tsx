import React, { useState, useEffect } from "react";
import { CropListing, Language, UserProfile } from "../types";
import { 
  X, 
  PhoneCall, 
  PhoneOff, 
  ShieldCheck, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  Lock,
  MapPin,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface MaskedCallModalProps {
  crop: CropListing | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: UserProfile;
}

export const MaskedCallModal: React.FC<MaskedCallModalProps> = ({
  crop,
  isOpen,
  onClose,
  language,
  currentUser,
}) => {
  const isHi = language === "hi";
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  // Masked Bridge Number
  const bridgeNumber = "+91 1800-KISAN-88";
  const virtualExtension = crop ? `EXT-${crop.id.slice(0, 4)}` : "EXT-9921";

  // Simulate call progression
  useEffect(() => {
    if (!isOpen) {
      setCallStatus("connecting");
      setCallSeconds(0);
      return;
    }

    const t1 = setTimeout(() => {
      setCallStatus("ringing");
    }, 1500);

    const t2 = setTimeout(() => {
      setCallStatus("connected");
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  // Timer when connected
  useEffect(() => {
    let interval: any = null;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  if (!isOpen || !crop) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#121212]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1E293B] text-white rounded-3xl max-w-sm w-full p-6 border border-[#334155] shadow-2xl space-y-6 my-6 animate-in fade-in zoom-in duration-200 text-center flex flex-col items-center"
      >
        {/* Top Masked Badge */}
        <div className="flex items-center gap-1.5 bg-[#0F172A] border border-[#334155] px-3 py-1 rounded-full text-[10px] font-bold text-[#34D399]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{isHi ? "0% नंबर लीक • सुरक्षित कॉल ब्रिज" : "Zero Number Leak • Secure Bridge"}</span>
        </div>

        {/* Farmer Photo & Ripple Animation */}
        <div className="relative my-2">
          {callStatus === "ringing" && (
            <div className="absolute inset-0 rounded-full animate-ping bg-[#10B981]/30 -m-2" />
          )}
          {callStatus === "connected" && (
            <div className="absolute inset-0 rounded-full animate-pulse bg-[#10B981]/20 -m-3" />
          )}
          <img
            src={crop.farmerPhoto}
            alt={crop.farmerName}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#10B981] relative z-10 shadow-lg"
          />
        </div>

        {/* Farmer Details & Status */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">{crop.farmerName}</h3>
          <div className="text-xs text-[#94A3B8] flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-[#10B981]" />
            <span>{crop.farmerLocation}</span>
          </div>

          <div className="pt-2">
            {callStatus === "connecting" && (
              <span className="text-xs font-semibold text-[#FBBF24] animate-pulse">
                {isHi ? "सुरक्षित ब्रिज से कनेक्ट हो रहा है..." : "Connecting via secure bridge..."}
              </span>
            )}
            {callStatus === "ringing" && (
              <span className="text-xs font-semibold text-[#60A5FA] animate-bounce">
                {isHi ? "घंटी बज रही है (Ringing)..." : "Ringing..."}
              </span>
            )}
            {callStatus === "connected" && (
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#10B981] flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  {isHi ? "कॉल कनेक्टेड (सुरक्षित एन्क्रिप्टेड)" : "Call Connected (Encrypted)"}
                </span>
                <div className="text-lg font-mono font-black text-white">
                  {formatTime(callSeconds)}
                </div>
              </div>
            )}
            {callStatus === "ended" && (
              <span className="text-xs font-semibold text-[#EF4444]">
                {isHi ? "कॉल समाप्त हुआ" : "Call Ended"}
              </span>
            )}
          </div>
        </div>

        {/* Bridge Security Info Box */}
        <div className="bg-[#0F172A] p-3 rounded-xl border border-[#334155] w-full text-left space-y-1 text-[11px] text-[#94A3B8]">
          <div className="flex justify-between items-center text-white font-bold">
            <span>वर्चुअल रूट:</span>
            <span className="text-[#34D399] font-mono">{bridgeNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>फसल संदर्भ:</span>
            <span className="text-white font-medium truncate max-w-[140px]">{crop.titleHi}</span>
          </div>
          <div className="text-[10px] text-[#64748B] pt-1 border-t border-[#1E293B]">
            🛡️ यह बातचीत गुणवत्ता और एस्क्रो सुरक्षा ऑडिट के लिए किसान डायरेक्ट ब्रिज द्वारा सुरक्षित रखी जाती है।
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Mute */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-all ${
              isMuted ? "bg-[#EF4444] text-white" : "bg-[#334155] hover:bg-[#475569] text-white"
            }`}
            title="म्यूट करें"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button
            type="button"
            onClick={handleEndCall}
            className="p-4 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xl transition-all scale-110"
            title="कॉल काटें"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker */}
          <button
            type="button"
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-full transition-all ${
              isSpeaker ? "bg-[#10B981] text-white" : "bg-[#334155] hover:bg-[#475569] text-white"
            }`}
            title="स्पीकर"
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
