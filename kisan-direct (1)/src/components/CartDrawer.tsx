import React, { useEffect } from "react";
import { CartItem, Language } from "../types";
import { translations } from "../data/translations";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ShieldCheck, 
  ArrowRight,
  Sprout
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  language: Language;
  onUpdateQuantity: (cropId: string, delta: number) => void;
  onRemoveItem: (cropId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const t = translations[language];

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

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.listing.pricePerUnit * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#DCD7CC] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Top Bar */}
          <div className="p-4 border-b border-[#DCD7CC] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#2D5A27]" />
              <h2 className="text-base font-bold text-[#2D2D2D]">{t.cartTitle}</h2>
              <span className="bg-[#EBF5EA] text-[#2D5A27] border border-[#B7DDB5] text-[10px] font-bold px-1.5 py-0.2 rounded-sm font-mono">
                {cartItems.length}
              </span>
            </div>
            <button
              onClick={onClose}
              title={language === "hi" ? "काटें / बंद करें" : "Close Drawer"}
              aria-label="Close Cart Drawer"
              className="p-1 px-2 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
            >
              <X className="w-4 h-4" />
              <span className="text-[11px]">{language === "hi" ? "काटें" : "Close"}</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#FAF8F5]">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <div className="w-12 h-12 rounded-lg bg-white border border-[#DCD7CC] text-[#75716B] flex items-center justify-center mx-auto">
                  <Sprout className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <h4 className="font-bold text-[#2D2D2D] text-sm">{t.cartEmpty}</h4>
                <p className="text-xs text-[#75716B] max-w-xs mx-auto">
                  {language === "hi"
                    ? "स्थानीय किसानों से सीधे ताजा फल, सब्जियां व अनाज खोजें।"
                    : "Add fresh farm produce directly from verified farmers."}
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.listing.id}
                  className="bg-white p-3 rounded-lg border border-[#DCD7CC] flex gap-2.5 items-center shadow-xs"
                >
                  <img
                    src={item.listing.images[0]}
                    alt={item.listing.titleHi}
                    className="w-14 h-14 rounded-md object-cover shrink-0 border border-[#DCD7CC]"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 space-y-0.5">
                    <h4 className="font-bold text-[#2D2D2D] text-xs leading-snug line-clamp-1">
                      {language === "hi" ? item.listing.titleHi : item.listing.titleEn}
                    </h4>
                    <p className="text-[10px] text-[#75716B]">
                      किसान: {item.listing.farmerName.split(" ")[0]}
                    </p>
                    <div className="font-extrabold text-xs text-[#2D2D2D] font-mono">
                      ₹{item.listing.pricePerUnit * item.quantity}
                      <span className="text-[10px] font-normal text-[#75716B]">
                        {" "}
                        (₹{item.listing.pricePerUnit}/{item.listing.unit})
                      </span>
                    </div>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => onRemoveItem(item.listing.id)}
                      className="text-[#75716B] hover:text-[#DC2626] p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#DCD7CC] rounded-md p-0.5 font-mono">
                      <button
                        onClick={() => onUpdateQuantity(item.listing.id, -1)}
                        className="p-0.5 text-[#2D2D2D] hover:bg-[#EDE8DF] rounded"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold px-1">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.listing.id, 1)}
                        className="p-0.5 text-[#2D2D2D] hover:bg-[#EDE8DF] rounded"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-[#DCD7CC] bg-white space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#5C5850]">
                <span>उप-योग (Subtotal):</span>
                <span className="text-sm font-extrabold text-[#2D2D2D] font-mono">₹{subtotal}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#92400E] bg-[#FEF3C7] p-2 rounded-md border border-[#FDE68A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                <span>100% किसान एस्क्रो सुरक्षित डिलीवरी</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-2.5 rounded-lg bg-[#2D5A27] hover:bg-[#234A1F] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>चेकआउट व सुरक्षित भुगतान (₹{subtotal})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
