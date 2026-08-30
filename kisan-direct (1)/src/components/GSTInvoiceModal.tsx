import React, { useRef } from "react";
import { DeliveryOrder, Language } from "../types";
import { 
  FileText, 
  Printer, 
  Download, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  User, 
  Tractor, 
  QrCode, 
  X,
  Clock,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface GSTInvoiceModalProps {
  order: DeliveryOrder;
  language: Language;
  onClose: () => void;
}

export const GSTInvoiceModal: React.FC<GSTInvoiceModalProps> = ({
  order,
  language,
  onClose,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const isHi = language === "hi";

  // Derive agricultural HSN code based on crop name
  const getHsnCode = (cropName: string) => {
    const lower = cropName.toLowerCase();
    if (lower.includes("गेहूं") || lower.includes("wheat") || lower.includes("शरबती")) return "10019910";
    if (lower.includes("धान") || lower.includes("चावल") || lower.includes("rice") || lower.includes("paddy")) return "10061010";
    if (lower.includes("टमाटर") || lower.includes("tomato")) return "07020000";
    if (lower.includes("प्याज") || lower.includes("onion")) return "07031010";
    if (lower.includes("आलू") || lower.includes("potato")) return "07019000";
    if (lower.includes("सेब") || lower.includes("apple")) return "08081000";
    if (lower.includes("हल्दी") || lower.includes("turmeric")) return "09103030";
    if (lower.includes("सरसों") || lower.includes("mustard")) return "12075000";
    if (lower.includes("चना") || lower.includes("chana") || lower.includes("gram")) return "07132000";
    return "07099990";
  };

  const hsnCode = getHsnCode(order.cropNameHi + " " + order.cropNameEn);
  const invoiceNumber = `KD-INV-${order.orderNumber.replace("KD-", "") || order.id.slice(-6).toUpperCase()}`;
  const ewayBillNumber = `EWB-2026-${Math.abs(order.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0) * 83).toString().slice(0, 10)}`;

  // GST Calculation Breakdown
  // 1. Raw Produce: 0% GST (Exempted under Notification No. 2/2017 - Central Tax (Rate))
  const produceGstRate = 0;
  const produceGstAmount = 0;

  // 2. Platform Technology Facilitation Fee (4%): 18% GST (9% CGST + 9% SGST)
  const platformFeeTaxable = Math.round((order.platformCommission / 1.18) * 100) / 100;
  const platformCgst = Math.round((order.platformCommission - platformFeeTaxable) / 2 * 100) / 100;
  const platformSgst = platformCgst;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp share invoice link
  const handleShareWhatsApp = () => {
    const text = `🌾 *किसान डायरेक्ट डिजिटल टैक्स इनवॉइस (GST Invoice)*\n\n📄 इनवॉइस नं: ${invoiceNumber}\n📦 ऑर्डर नं: ${order.orderNumber}\n🌾 फसल: ${order.cropNameHi} (${order.quantity} ${order.unit})\n👨‍🌾 किसान: ${order.farmerName}\n👤 खरीदार: ${order.buyerName}\n💰 कुल भुगतान राशि: ₹${order.totalAmount}\n🔒 एस्क्रो स्थिति: ${order.status === "delivered" ? "सत्यापित व पेआउट सफल" : "एस्क्रो वॉल्ट में सुरक्षित"}\n\n📲 बिल डाउनलोड करें: https://kisan-direct.app/invoice/${order.orderNumber}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#DCD7CC] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header Action Bar */}
        <div className="bg-[#1B3B18] text-white p-3.5 px-5 flex items-center justify-between border-b border-[#2D5A27] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#86EFAC]" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isHi ? "डिजिटल GST टैक्स इनवॉइस व ई-वे बिल" : "Digital Tax Invoice & E-Way Bill"}
              </h3>
              <p className="text-[11px] text-[#A7F3D0]">
                {invoiceNumber} • {order.status === "delivered" ? "✅ डिलीवर व सत्यापित" : "🔒 एस्क्रो सुरक्षित"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-[#2D5A27] hover:bg-[#234A1F] text-[#E8F3E5] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border border-[#3E7036]"
              title="प्रिंट / PDF सेव करें"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHi ? "प्रिंट / PDF" : "Print"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
              title="व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#D5E8D2] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div ref={invoiceRef} className="p-5 sm:p-6 space-y-4 text-[#2D2D2D] bg-[#FCFBF8] text-xs font-sans">
          
          {/* Top Company & Bill Identity */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-[#DCD7CC] pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center font-black text-sm">
                  🌾
                </span>
                <div>
                  <h1 className="font-extrabold text-base sm:text-lg text-[#1B3B18] tracking-tight">
                    KISAN DIRECT AGRI-TECH PVT. LTD.
                  </h1>
                  <p className="text-[10px] text-[#75716B]">
                    भारत सरकार मान्यता प्राप्त डायरेक्ट फार्म-टू-कंज्यूमर डिजिटल एग्री प्लेटफ़ॉर्म
                  </p>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-[#5C5850] space-y-0.5">
                <div><strong>GSTIN:</strong> 08AABCK1234F1Z8 | <strong>PAN:</strong> AABCK1234F</div>
                <div><strong>FSSAI सेंट्रल लाइसेंस नं:</strong> 10022081000123</div>
                <div><strong>कॉर्पोरेट कार्यालय:</strong> एग्रीटेक इनोवेशन टॉवर, सी-स्कीम, जयपुर, राजस्थान - 302001</div>
              </div>
            </div>

            <div className="sm:text-right bg-white p-3 rounded-xl border border-[#DCD7CC] shadow-2xs sm:min-w-[200px]">
              <div className="text-[10px] uppercase font-bold text-[#75716B] tracking-wider">TAX INVOICE / बिल</div>
              <div className="text-sm font-extrabold text-[#2D2D2D] font-mono mt-0.5">{invoiceNumber}</div>
              <div className="text-[10px] text-[#5C5850] mt-1">दिनांक: <strong>{order.orderDate}</strong></div>
              <div className="text-[10px] text-[#5C5850]">ई-वे बिल: <span className="font-mono font-bold text-[#2D5A27]">{ewayBillNumber}</span></div>
              <div className="text-[10px] text-[#2D5A27] font-semibold mt-1 flex items-center sm:justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% बिचौलिया मुक्त खरीद</span>
              </div>
            </div>
          </div>

          {/* Parties Info Grid: Farmer (Supplier) & Buyer (Consignee) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Supplier - Farmer */}
            <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-1">
                <span className="text-[11px] font-extrabold text-[#1B3B18] flex items-center gap-1.5">
                  <Tractor className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>विक्रेता / उत्पादक किसान (Supplier)</span>
                </span>
                <span className="text-[9px] bg-[#EBF5EA] text-[#2D5A27] font-bold px-1.5 py-0.5 rounded">
                  सत्यापित किसान
                </span>
              </div>
              <div className="text-xs font-bold text-[#2D2D2D]">{order.farmerName}</div>
              <div className="text-[11px] text-[#5C5850]">खेत का पता: {order.farmerLocation}</div>
              <div className="text-[10px] text-[#75716B]">संपर्क: {order.farmerPhone}</div>
              <div className="text-[9px] text-[#2D5A27] font-semibold bg-[#FAF8F5] p-1.5 rounded border border-[#EDE8DF]">
                किसान क्रेडिट कार्ड / आधार सत्यापित • शून्य मंडी दलाली भुगतान
              </div>
            </div>

            {/* Buyer - Consignee */}
            <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-1">
                <span className="text-[11px] font-extrabold text-[#1B3B18] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>क्रेता व प्राप्तकर्ता (Billed & Shipped To)</span>
                </span>
                <span className="text-[9px] bg-[#EDE8DF] text-[#5C5850] font-bold px-1.5 py-0.5 rounded">
                  कंज्यूमर B2C
                </span>
              </div>
              <div className="text-xs font-bold text-[#2D2D2D]">{order.buyerName}</div>
              <div className="text-[11px] text-[#5C5850]">डिलीवरी पता: {order.buyerAddress}</div>
              <div className="text-[10px] text-[#75716B]">मोबाइल: {order.buyerPhone}</div>
              <div className="text-[9px] text-[#5C5850] bg-[#FAF8F5] p-1.5 rounded border border-[#EDE8DF]">
                जीएसटी श्रेणी: अपंजीकृत अंतिम उपभोक्ता (Unregistered End Consumer)
              </div>
            </div>
          </div>

          {/* Itemized Produce & Charges Table */}
          <div className="bg-white rounded-xl border border-[#DCD7CC] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#5C5850] text-[10px] uppercase font-bold border-b border-[#DCD7CC]">
                  <th className="p-2.5">क्र.</th>
                  <th className="p-2.5">उपज विवरण (Item Description)</th>
                  <th className="p-2.5">HSN कोड</th>
                  <th className="p-2.5 text-center">मात्रा (Qty)</th>
                  <th className="p-2.5 text-right">दर (Rate)</th>
                  <th className="p-2.5 text-center">GST दर</th>
                  <th className="p-2.5 text-right">शुद्ध मूल्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE8DF]">
                {/* 1. Fresh Crop Produce */}
                <tr>
                  <td className="p-2.5 font-mono text-[11px] text-[#75716B]">1</td>
                  <td className="p-2.5">
                    <div className="font-bold text-[#2D2D2D]">{order.cropNameHi}</div>
                    <div className="text-[10px] text-[#75716B]">{order.cropNameEn} (सीधे खेत से ताजी तुड़ाई)</div>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-[#5C5850]">{hsnCode}</td>
                  <td className="p-2.5 text-center font-bold font-mono">{order.quantity} {order.unit}</td>
                  <td className="p-2.5 text-right font-mono">₹{(order.cropSubtotal / order.quantity).toFixed(1)}</td>
                  <td className="p-2.5 text-center font-semibold text-[#2D5A27]">0% (Exempt)</td>
                  <td className="p-2.5 text-right font-bold font-mono text-[#2D2D2D]">₹{order.cropSubtotal}</td>
                </tr>

                {/* 2. Platform Facilitation & Quality QC (4%) */}
                <tr className="bg-[#FAF8F5]/50">
                  <td className="p-2.5 font-mono text-[11px] text-[#75716B]">2</td>
                  <td className="p-2.5">
                    <div className="font-semibold text-[#2D2D2D]">किसान डायरेक्ट डिजिटल मैचिंग व एस्क्रो सेवा</div>
                    <div className="text-[10px] text-[#75716B]">Technology Platform Facilitation & Escrow Safety (4%)</div>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-[#5C5850]">998313</td>
                  <td className="p-2.5 text-center font-mono">1 Job</td>
                  <td className="p-2.5 text-right font-mono">₹{platformFeeTaxable}</td>
                  <td className="p-2.5 text-center font-semibold text-[#5C5850]">18% (GST Inc.)</td>
                  <td className="p-2.5 text-right font-mono text-[#2D2D2D]">₹{order.platformCommission}</td>
                </tr>

                {/* 3. Farm-to-Doorstep Logistics */}
                <tr>
                  <td className="p-2.5 font-mono text-[11px] text-[#75716B]">3</td>
                  <td className="p-2.5">
                    <div className="font-semibold text-[#2D2D2D]">फार्म-टू-डोरस्टेप सीधी परिवहन सेवा</div>
                    <div className="text-[10px] text-[#75716B]">Direct Agri-Van Transportation ({order.vehicleNumber})</div>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-[#5C5850]">996511</td>
                  <td className="p-2.5 text-center font-mono">1 Trip</td>
                  <td className="p-2.5 text-right font-mono">₹{order.deliveryFee}</td>
                  <td className="p-2.5 text-center font-semibold text-[#2D5A27]">0% (Agri Exempt)</td>
                  <td className="p-2.5 text-right font-mono text-[#2D2D2D]">₹{order.deliveryFee}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Summary & Total Calculation Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
            {/* Left: Escrow & Verification Seal */}
            <div className="bg-[#EBF5EA] p-3.5 rounded-xl border border-[#B7DDB5] space-y-2">
              <div className="flex items-center gap-2 text-[#1B3B18] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>डिजिटल सुरक्षा व डिलीवरी सत्यापन</span>
              </div>
              <div className="text-[11px] text-[#2D5A27] space-y-1">
                <div>• एस्क्रो वॉल्ट आईडी: <strong className="font-mono">ESC-{order.id.slice(-6).toUpperCase()}</strong></div>
                <div>• भुगतान माध्यम: <strong className="font-mono uppercase">{order.paymentMethod}</strong> (ट्रांजेक्शन: {order.paymentTransactionId || 'TXN-984210'})</div>
                <div>• डिलीवरी OTP: <strong className="font-mono text-[#1B3B18] bg-white px-1.5 py-0.5 rounded border border-[#B7DDB5]">{order.deliveryOtp || '4821'}</strong></div>
                {order.payoutUtr && (
                  <div>• किसान बैंक UTR: <strong className="font-mono">{order.payoutUtr}</strong></div>
                )}
              </div>
              <div className="text-[9px] text-[#1B3B18]/80 pt-1 border-t border-[#B7DDB5]">
                यह एक कंप्यूटर जनरेटेड डिजिटल टैक्स इनवॉइस है। इस पर किसी भौतिक हस्ताक्षर की आवश्यकता नहीं है।
              </div>
            </div>

            {/* Right: Total Summary */}
            <div className="bg-white p-3.5 rounded-xl border border-[#DCD7CC] space-y-2 text-xs">
              <div className="flex justify-between text-[#5C5850]">
                <span>फसल कुल मूल्य (Crop Subtotal):</span>
                <span className="font-bold text-[#2D2D2D] font-mono">₹{order.cropSubtotal}</span>
              </div>
              <div className="flex justify-between text-[#5C5850]">
                <span>प्लेटफ़ॉर्म शुल्क (18% GST सहित):</span>
                <span className="font-mono font-semibold">₹{order.platformCommission}</span>
              </div>
              <div className="flex justify-between text-[#5C5850]">
                <span>सीधा डिलीवरी शुल्क:</span>
                <span className="font-mono font-semibold">₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#75716B] pt-1 border-t border-[#EDE8DF]">
                <span>कृषि उपज GST (0% छूट):</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#75716B]">
                <span>CGST (9%) + SGST (9%) ऑन सर्विस:</span>
                <span className="font-mono">₹{(platformCgst + platformSgst).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-[#1B3B18] border-t-2 border-[#2D5A27] pt-2">
                <span>कुल देय राशि (Total Paid):</span>
                <span className="text-base font-mono text-[#2D5A27]">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-[#DCD7CC] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#75716B] gap-2">
            <div>
              हेल्पलाइन: <strong>1800-KISAN-DIRECT</strong> | support@kisan-direct.app
            </div>
            <div className="flex items-center gap-1 text-[#2D5A27] font-semibold">
              <span>🌾 आत्मनिर्भर किसान, समृद्ध उपभोक्ता</span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Close */}
        <div className="bg-[#FAF8F5] p-3 px-5 border-t border-[#DCD7CC] flex justify-end gap-2 print:hidden">
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
