import React, { useState } from "react";
import { DeliveryOrder, DisputeTicket, Language, FarmerPayoutRecord } from "../types";
import { 
  ShieldCheck, 
  IndianRupee, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Send, 
  Building2, 
  Download, 
  FileText, 
  User, 
  Tractor, 
  Clock, 
  Check, 
  X, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Coins,
  CreditCard,
  Percent,
  Receipt,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface AdminSettlementDisputeModalProps {
  orders: DeliveryOrder[];
  disputes: DisputeTicket[];
  language: Language;
  onClose: () => void;
  onDisbursePayout: (orderId: string, utrNumber?: string) => void;
  onBatchDisbursePayouts: (orderIds: string[]) => void;
  onResolveDispute: (
    disputeId: string, 
    action: "refund_buyer" | "release_to_farmer" | "split_settlement", 
    notes: string,
    customRefundAmount?: number
  ) => void;
  onOpenGSTInvoice?: (order: DeliveryOrder) => void;
}

export const AdminSettlementDisputeModal: React.FC<AdminSettlementDisputeModalProps> = ({
  orders,
  disputes,
  language,
  onClose,
  onDisbursePayout,
  onBatchDisbursePayouts,
  onResolveDispute,
  onOpenGSTInvoice,
}) => {
  const isHi = language === "hi";

  const [activeTab, setActiveTab] = useState<"settlements" | "disputes" | "commission_audit">("settlements");
  const [payoutFilter, setPayoutFilter] = useState<"all" | "pending" | "transferred" | "disputed">("all");
  const [disputeFilter, setDisputeFilter] = useState<"all" | "pending" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisputeForAction, setSelectedDisputeForAction] = useState<DisputeTicket | null>(
    disputes.length > 0 ? disputes[0] : null
  );
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isProcessingPayout, setIsProcessingPayout] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // Financial Metrics Calculations
  const grossTurnover = orders.reduce((sum, o) => sum + (o.cropSubtotal || 0), 0);
  const totalCommissionEarned = orders.reduce((sum, o) => sum + (o.platformCommission || 0), 0);
  const totalDeliveryFees = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const totalPlatformRevenue = totalCommissionEarned + totalDeliveryFees;
  
  const settledPayoutsTotal = orders
    .filter(o => o.status === "delivered" && (o.payoutStatus === "transferred" || o.paymentStatus === "paid"))
    .reduce((sum, o) => sum + (o.farmerPayout || 0), 0);

  const pendingPayoutsList = orders.filter(
    o => (o.status === "delivered" && o.payoutStatus !== "transferred" && o.paymentStatus !== "disputed") ||
         (o.status === "in_transit" && o.paymentStatus === "escrow_hold")
  );

  const pendingPayoutsTotal = pendingPayoutsList.reduce((sum, o) => sum + (o.farmerPayout || 0), 0);
  const escrowVaultHolding = orders
    .filter(o => o.paymentStatus === "escrow_hold" || o.paymentStatus === "disputed")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingDisputesCount = disputes.filter(d => d.status === "pending" || d.status === "investigating").length;

  // Filter Orders for Payouts Desk
  const filteredOrders = orders.filter((order) => {
    if (payoutFilter === "pending" && (order.payoutStatus === "transferred" || order.status !== "delivered")) return false;
    if (payoutFilter === "transferred" && order.payoutStatus !== "transferred") return false;
    if (payoutFilter === "disputed" && order.paymentStatus !== "disputed" && order.status !== "return_requested") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.farmerName.toLowerCase().includes(q) ||
        order.cropNameHi.toLowerCase().includes(q) ||
        order.buyerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter Disputes
  const filteredDisputes = disputes.filter((disp) => {
    if (disputeFilter === "pending" && disp.status !== "pending" && disp.status !== "investigating") return false;
    if (disputeFilter === "resolved" && disp.status === "pending") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        disp.orderNumber.toLowerCase().includes(q) ||
        disp.farmerName.toLowerCase().includes(q) ||
        disp.buyerName.toLowerCase().includes(q) ||
        disp.reasonTextHi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // 1-Click Payout Trigger
  const handleSinglePayout = (orderId: string) => {
    setIsProcessingPayout(orderId);
    setTimeout(() => {
      const utr = `IMPS-SBI-${Date.now().toString().slice(-8)}`;
      onDisbursePayout(orderId, utr);
      setIsProcessingPayout(null);
    }, 700);
  };

  // Batch Payout Trigger
  const handleBatchPayout = () => {
    const readyOrders = orders
      .filter(o => o.status === "delivered" && o.payoutStatus !== "transferred" && o.paymentStatus !== "disputed")
      .map(o => o.id);

    if (readyOrders.length === 0) return;

    setBatchProcessing(true);
    setTimeout(() => {
      onBatchDisbursePayouts(readyOrders);
      setBatchProcessing(false);
      setBatchSuccessMessage(`🎉 कुल ${readyOrders.length} किसान पेआउट सीधे बैंक खाते में सफलतापूर्वक ट्रांसफर किए गए!`);
      setTimeout(() => setBatchSuccessMessage(null), 4000);
    }, 1000);
  };

  // Resolve Dispute Trigger
  const handleExecuteResolution = (action: "refund_buyer" | "release_to_farmer" | "split_settlement") => {
    if (!selectedDisputeForAction) return;
    onResolveDispute(
      selectedDisputeForAction.id,
      action,
      resolutionNotes || (action === "refund_buyer" ? "100% उपभोक्ता रिफंड स्वीकृत" : "किसान एस्क्रो रिलीज स्वीकृत"),
      selectedDisputeForAction.orderAmount
    );
    setResolutionNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-[#DCD7CC] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
        
        {/* Top Header */}
        <div className="bg-[#182F15] text-white p-4 px-5 flex items-center justify-between border-b border-[#2D5A27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27] flex items-center justify-center text-white border border-[#3E7036] shadow-xs">
              <ShieldCheck className="w-6 h-6 text-[#86EFAC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg tracking-tight">
                  {isHi ? "किसान डायरेक्ट एडमिन व एस्क्रो सेटलमेंट डेस्क" : "Admin Settlement & Dispute Dashboard"}
                </h2>
                <span className="text-[10px] bg-[#86EFAC] text-[#1B3B18] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ADMIN DESK
                </span>
              </div>
              <p className="text-[11px] text-[#A7F3D0]">
                कमीशन ट्रैकिंग (4%), किसान त्वरित बैंक पेआउट्स, और 24-घंटे विवाद समाधान कंसोल
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#D5E8D2] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Top Metrics Row: Commission & Escrow Summary */}
        <div className="bg-[#FAF8F5] p-3.5 px-5 border-b border-[#DCD7CC] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] shadow-2xs space-y-0.5">
            <div className="text-[10px] text-[#75716B] font-bold uppercase flex items-center justify-between">
              <span>कुल फसल बिक्री (GMV)</span>
              <Coins className="w-3.5 h-3.5 text-[#D97706]" />
            </div>
            <div className="text-lg font-black text-[#2D2D2D] font-mono">
              ₹{grossTurnover.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-[#2D5A27] font-semibold">100% बिचौलिया मुक्त</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] shadow-2xs space-y-0.5">
            <div className="text-[10px] text-[#75716B] font-bold uppercase flex items-center justify-between">
              <span>प्लेटफ़ॉर्म कमिशन (4%)</span>
              <Percent className="w-3.5 h-3.5 text-[#2D5A27]" />
            </div>
            <div className="text-lg font-black text-[#2D5A27] font-mono">
              ₹{totalCommissionEarned.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-[#5C5850]">कुल आय: ₹{totalPlatformRevenue}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] shadow-2xs space-y-0.5">
            <div className="text-[10px] text-[#75716B] font-bold uppercase flex items-center justify-between">
              <span>किसान बैंक पेआउट्स</span>
              <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <div className="text-lg font-black text-[#1E40AF] font-mono">
              ₹{settledPayoutsTotal.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-[#2D5A27]">सीधा IMPS/UPI ट्रांसफर</div>
          </div>

          <div className="bg-[#FEF3C7] p-3 rounded-xl border border-[#FDE68A] shadow-2xs space-y-0.5 text-[#92400E]">
            <div className="text-[10px] font-bold uppercase flex items-center justify-between">
              <span>एस्क्रो वॉल्ट होल्ड</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
            </div>
            <div className="text-lg font-black text-[#92400E] font-mono">
              ₹{escrowVaultHolding.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-[#B45309] font-bold">
              {pendingDisputesCount > 0 ? `⚠️ ${pendingDisputesCount} विवाद लंबित` : "100% सुरक्षित"}
            </div>
          </div>

        </div>

        {/* Navigation Tabs & Controls */}
        <div className="bg-white p-2.5 px-5 border-b border-[#DCD7CC] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Main Module Tabs */}
          <div className="flex items-center gap-1 bg-[#EDE8DF] p-1 rounded-xl border border-[#DCD7CC]">
            <button
              onClick={() => setActiveTab("settlements")}
              className={`px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === "settlements"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isHi ? "किसान पेआउट्स डेस्क (Payouts)" : "Farmer Payouts"}</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("disputes")}
              className={`px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === "disputes"
                  ? "bg-[#B45309] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isHi ? "विवाद व वापसी समाधान (Disputes)" : "Dispute Cases"}</span>
              {pendingDisputesCount > 0 && (
                <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full">
                  {pendingDisputesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("commission_audit")}
              className={`px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
                activeTab === "commission_audit"
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#5C5850] hover:text-[#2D2D2D]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{isHi ? "कमिशन ऑडिट व GST रिपोर्ट" : "Commission Audit"}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#75716B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? "ऑर्डर / किसान / ग्राहक खोजें..." : "Search order or farmer..."}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#DCD7CC] rounded-lg text-xs focus:outline-none focus:border-[#2D5A27]"
            />
          </div>
        </div>

        {/* Batch Success Toast */}
        {batchSuccessMessage && (
          <div className="bg-[#EBF5EA] text-[#1B3B18] px-5 py-2 text-xs font-bold flex items-center justify-between border-b border-[#B7DDB5]">
            <span>{batchSuccessMessage}</span>
            <button onClick={() => setBatchSuccessMessage(null)} className="text-[#2D5A27] hover:text-[#1B3B18]">✕</button>
          </div>
        )}

        {/* Tab 1: Farmer Payouts Desk */}
        {activeTab === "settlements" && (
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
            {/* Action Bar with Batch Payout */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#DCD7CC]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2D2D2D]">फिल्टर:</span>
                {(["all", "pending", "transferred", "disputed"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPayoutFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      payoutFilter === filter
                        ? "bg-[#2D5A27] text-white"
                        : "bg-white border border-[#DCD7CC] text-[#5C5850] hover:bg-[#EDE8DF]"
                    }`}
                  >
                    {filter === "all" && "सभी"}
                    {filter === "pending" && "स्वीकृत / ट्रांसफर योग्य"}
                    {filter === "transferred" && "भुगतान पूर्ण"}
                    {filter === "disputed" && "विवाद में होल्ड"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchPayout}
                  disabled={batchProcessing}
                  className="bg-[#2D5A27] hover:bg-[#234A1F] text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{batchProcessing ? "प्रोसेस हो रहा है..." : "सभी स्वीकृत पेआउट ट्रांसफर करें (Batch IMPS)"}</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-[#DCD7CC] overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] text-[#5C5850] text-[10px] uppercase font-bold border-b border-[#DCD7CC]">
                    <th className="p-3">ऑर्डर नं</th>
                    <th className="p-3">किसान विवरण (Seller)</th>
                    <th className="p-3">फसल व मात्रा</th>
                    <th className="p-3 text-right">कुल बिक्री</th>
                    <th className="p-3 text-right">कमीशन (4%)</th>
                    <th className="p-3 text-right">शुद्ध पेआउट</th>
                    <th className="p-3 text-center">एस्क्रो स्थिति</th>
                    <th className="p-3 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE8DF]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#75716B]">
                        कोई पेआउट रिकॉर्ड नहीं मिला
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isTransferred = order.payoutStatus === "transferred" || order.paymentStatus === "paid";
                      const isDisputed = order.paymentStatus === "disputed" || order.status === "return_requested";
                      const isReadyForPayout = order.status === "delivered" && !isTransferred && !isDisputed;

                      return (
                        <tr key={order.id} className="hover:bg-[#FCFBF8]">
                          <td className="p-3">
                            <div className="font-extrabold font-mono text-[#2D2D2D]">{order.orderNumber}</div>
                            <div className="text-[10px] text-[#75716B]">{order.orderDate.split(" ")[0]}</div>
                            {onOpenGSTInvoice && (
                              <button
                                onClick={() => onOpenGSTInvoice(order)}
                                className="text-[10px] text-[#2D5A27] font-bold hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <FileText className="w-3 h-3" />
                                <span>GST बिल</span>
                              </button>
                            )}
                          </td>

                          <td className="p-3">
                            <div className="font-bold text-[#2D2D2D]">{order.farmerName}</div>
                            <div className="text-[10px] text-[#5C5850]">{order.farmerLocation}</div>
                            <div className="text-[10px] font-mono text-[#75716B]">📱 {order.farmerPhone}</div>
                            <div className="text-[9px] text-[#2D5A27] font-mono mt-0.5">
                              A/C: ****4921 (IFSC: SBIN0001234)
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="font-bold text-[#2D2D2D]">{order.cropNameHi}</div>
                            <div className="text-[10px] text-[#75716B] font-mono">{order.quantity} {order.unit}</div>
                            <div className="text-[9px] text-[#5C5850]">क्रेता: {order.buyerName}</div>
                          </td>

                          <td className="p-3 text-right font-mono font-bold text-[#2D2D2D]">
                            ₹{order.cropSubtotal}
                          </td>

                          <td className="p-3 text-right font-mono font-bold text-[#D97706]">
                            ₹{order.platformCommission}
                          </td>

                          <td className="p-3 text-right">
                            <div className="font-mono font-black text-sm text-[#1B3B18]">
                              ₹{order.farmerPayout}
                            </div>
                            <div className="text-[9px] text-[#75716B]">शून्य कटौती</div>
                          </td>

                          <td className="p-3 text-center">
                            {isTransferred ? (
                              <span className="inline-flex items-center gap-1 bg-[#EBF5EA] text-[#2D5A27] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#B7DDB5]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>सफल जमा</span>
                              </span>
                            ) : isDisputed ? (
                              <span className="inline-flex items-center gap-1 bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#FCA5A5]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>विवाद में होल्ड</span>
                              </span>
                            ) : isReadyForPayout ? (
                              <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#FDE68A]">
                                <Clock className="w-3 h-3" />
                                <span>स्वीकृत (Ready)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-[#FAF8F5] text-[#5C5850] px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#DCD7CC]">
                                <span>ट्रांजिट में सुरक्षित</span>
                              </span>
                            )}

                            {order.payoutUtr && (
                              <div className="text-[9px] font-mono text-[#75716B] mt-1 truncate max-w-[120px]">
                                UTR: {order.payoutUtr}
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            {isReadyForPayout ? (
                              <button
                                onClick={() => handleSinglePayout(order.id)}
                                disabled={isProcessingPayout === order.id}
                                className="bg-[#2D5A27] hover:bg-[#234A1F] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>{isProcessingPayout === order.id ? "ट्रांसफर..." : "1-क्लिक पेआउट"}</span>
                              </button>
                            ) : isDisferred(order) ? (
                              <span className="text-[11px] text-[#2D5A27] font-bold">✓ पूर्ण</span>
                            ) : isDisputed ? (
                              <button
                                onClick={() => {
                                  setActiveTab("disputes");
                                  const d = disputes.find(x => x.orderId === order.id);
                                  if (d) setSelectedDisputeForAction(d);
                                }}
                                className="bg-[#B45309] hover:bg-[#92400E] text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                              >
                                विवाद सुलझाएं
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#75716B]">डिलीवरी प्रतीक्षा</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Disputes & Resolution Desk */}
        {activeTab === "disputes" && (
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Left: Dispute Cases Feed */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-[#2D2D2D] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#B45309]" />
                  <span>सक्रिय विवाद व 24-घंटे रिटर्न टिकट ({filteredDisputes.length})</span>
                </h4>

                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => setDisputeFilter("pending")}
                    className={`px-2 py-0.5 rounded font-bold ${disputeFilter === "pending" ? "bg-[#B45309] text-white" : "bg-[#FAF8F5] text-[#5C5850]"}`}
                  >
                    लंबित ({pendingDisputesCount})
                  </button>
                  <button
                    onClick={() => setDisputeFilter("all")}
                    className={`px-2 py-0.5 rounded font-bold ${disputeFilter === "all" ? "bg-[#2D5A27] text-white" : "bg-[#FAF8F5] text-[#5C5850]"}`}
                  >
                    सभी
                  </button>
                </div>
              </div>

              {filteredDisputes.length === 0 ? (
                <div className="bg-[#FAF8F5] p-8 rounded-xl border border-[#DCD7CC] text-center text-[#75716B] space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#2D5A27]" />
                  <p className="font-bold text-xs">कोई सक्रिय विवाद लंबित नहीं है। सभी लेनदेन सुरक्षित हैं!</p>
                </div>
              ) : (
                filteredDisputes.map((ticket) => {
                  const isSelected = selectedDisputeForAction?.id === ticket.id;
                  const isPending = ticket.status === "pending" || ticket.status === "investigating";

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedDisputeForAction(ticket)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FEF3C7] border-[#D97706] shadow-xs"
                          : "bg-white border-[#DCD7CC] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-2">
                        <div>
                          <div className="font-extrabold text-xs text-[#2D2D2D] flex items-center gap-1.5">
                            <span>ऑर्डर: {ticket.orderNumber}</span>
                            <span className="font-mono text-[#92400E] font-bold">₹{ticket.orderAmount}</span>
                          </div>
                          <div className="text-[10px] text-[#75716B]">फसल: {ticket.cropNameHi}</div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {isPending ? "⚠️ जांच व निर्णय लंबित" : "✅ सुलझाया गया"}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-xs">
                        <div className="font-bold text-red-800 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>कारण: {ticket.reasonTextHi}</span>
                        </div>
                        <p className="text-[11px] text-[#5C5850] line-clamp-2 leading-relaxed">
                          "{ticket.description}"
                        </p>
                      </div>

                      <div className="mt-2.5 pt-1.5 border-t border-[#EDE8DF] flex justify-between items-center text-[10px] text-[#75716B]">
                        <span>क्रेता: <strong>{ticket.buyerName}</strong></span>
                        <span>किसान: <strong>{ticket.farmerName}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Dispute Action & Investigation Console */}
            <div className="md:col-span-6 bg-[#FAF8F5] p-4 rounded-xl border border-[#DCD7CC] flex flex-col justify-between space-y-3.5">
              {selectedDisputeForAction ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#2D2D2D]">
                        विवाद जांच कंसोल ({selectedDisputeForAction.orderNumber})
                      </h4>
                      <p className="text-[10px] text-[#75716B]">
                        टिकट आईडी: {selectedDisputeForAction.id} • दर्ज: {selectedDisputeForAction.createdAt}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-black text-[#B45309]">
                      होल्ड राशि: ₹{selectedDisputeForAction.orderAmount}
                    </span>
                  </div>

                  {/* Evidence Photo Preview */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2D2D2D] block">
                      क्रेता द्वारा अपलोड प्रमाण (Evidence Photos):
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {selectedDisputeForAction.evidenceImages?.map((img, i) => (
                        <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-[#DCD7CC] shrink-0">
                          <img src={img} alt="damage evidence" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statements */}
                  <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#75716B]">क्रेता का फोन:</span>
                      <span className="font-mono font-bold text-[#2D2D2D]">{selectedDisputeForAction.buyerPhone}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#75716B]">किसान का फोन:</span>
                      <span className="font-mono font-bold text-[#2D2D2D]">{selectedDisputeForAction.farmerPhone}</span>
                    </div>
                    <p className="text-[11px] text-[#5C5850] bg-[#FAF8F5] p-2 rounded-lg leading-relaxed">
                      <strong>क्रेता का बयान:</strong> {selectedDisputeForAction.description}
                    </p>
                  </div>

                  {/* Resolution Notes Box */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2D2D2D] block">
                      एडमिन जांच निर्णय व समाधान टिप्पणी (Admin Resolution Notes):
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="उदा. फोटो सत्यापन में 25% खराबी पाई गई, 100% रिफंड क्रेता को सुरक्षित जारी किया गया..."
                      className="w-full p-2 bg-white border border-[#DCD7CC] rounded-xl text-xs text-[#2D2D2D] focus:outline-none focus:border-[#2D5A27]"
                      rows={2}
                    />
                  </div>

                  {/* 3 Major Resolution Actions */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-[#2D2D2D]">
                      सुरक्षित एस्क्रो निपटान कार्रवाई चुनें:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleExecuteResolution("refund_buyer")}
                        className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors text-center shadow-xs"
                      >
                        <RotateCcw className="w-4 h-4 mx-auto mb-1" />
                        <div>100% खरीदार रिफंड</div>
                        <div className="text-[9px] font-normal opacity-90">₹{selectedDisputeForAction.orderAmount} रिफंड</div>
                      </button>

                      <button
                        onClick={() => handleExecuteResolution("release_to_farmer")}
                        className="p-2.5 bg-[#2D5A27] hover:bg-[#234A1F] text-white rounded-xl text-xs font-bold transition-colors text-center shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                        <div>किसान को एस्क्रो रिलीज</div>
                        <div className="text-[9px] font-normal opacity-90">₹{selectedDisputeForAction.farmerPayoutAmount} पेआउट</div>
                      </button>

                      <button
                        onClick={() => handleExecuteResolution("split_settlement")}
                        className="p-2.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold transition-colors text-center shadow-xs"
                      >
                        <Scale className="w-4 h-4 mx-auto mb-1" />
                        <div>50-50 आंशिक समझौता</div>
                        <div className="text-[9px] font-normal opacity-90">परस्पर क्षतिपूर्ति</div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-[#75716B] text-xs">
                  सूची से किसी विवाद टिकट को चुनें
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Commission Audit & GST Report */}
        {activeTab === "commission_audit" && (
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DCD7CC] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#2D5A27]" />
                  <h4 className="font-extrabold text-sm text-[#2D2D2D]">
                    प्लेटफ़ॉर्म कमिशन ऑडिट व वित्तीय पारदर्शिता रिपोर्ट
                  </h4>
                </div>
                <span className="text-[10px] bg-[#EBF5EA] text-[#2D5A27] font-bold px-2 py-0.5 rounded">
                  FY 2026-27
                </span>
              </div>

              <p className="text-[#5C5850] text-xs leading-relaxed">
                किसान डायरेक्ट मॉडल के तहत कच्ची कृषि उपज पर <strong>0% जीएसटी</strong> लगता है, जिससे किसानों को मंडी टैक्स व आढ़त की पूरी बचत होती है। प्लेटफ़ॉर्म मैचिंग व एस्क्रो गारंटी हेतु ली जाने वाली 4% सुविधा फीस पर <strong>18% जीएसटी</strong> सरकार को जमा किया जाता है।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] space-y-1">
                  <div className="text-[10px] text-[#75716B]">कुल किसान सकल मूल्य:</div>
                  <div className="text-base font-extrabold text-[#2D2D2D] font-mono">₹{grossTurnover}</div>
                  <div className="text-[9px] text-[#2D5A27]">0% जीएसटी (केंद्रीय अधिसूचना 2/2017)</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] space-y-1">
                  <div className="text-[10px] text-[#75716B]">प्लेटफ़ॉर्म मैचिंग आय (4%):</div>
                  <div className="text-base font-extrabold text-[#D97706] font-mono">₹{totalCommissionEarned}</div>
                  <div className="text-[9px] text-[#5C5850]">SAC: 998313 (एग्रीटेक प्लेटफॉर्म सेवा)</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#DCD7CC] space-y-1">
                  <div className="text-[10px] text-[#75716B]">कुल किसानों को वितरित शुद्ध राशि:</div>
                  <div className="text-base font-extrabold text-[#1B3B18] font-mono">₹{settledPayoutsTotal}</div>
                  <div className="text-[9px] text-[#2D5A27]">100% बैंक UTR सत्यापित</div>
                </div>
              </div>
            </div>

            {/* Compliance Info */}
            <div className="bg-white p-4 rounded-xl border border-[#DCD7CC] space-y-2 text-xs text-[#5C5850]">
              <div className="font-bold text-[#2D2D2D] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2D5A27]" />
                <span>वैधानिक अनुपालन व सुरक्षा नियम (Regulatory & Escrow Safeguards):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-[#5C5850]">
                <li>उपभोक्ता द्वारा ऑनलाइन भुगतान होते ही फंड्स भारतीय रिजर्व बैंक (RBI) द्वारा निर्देशित <strong>नोडल एस्क्रो खाते</strong> में लॉक हो जाते हैं।</li>
                <li>जब उपभोक्ता डिलीवरी के समय 4-अंकीय OTP सत्यापित करता है, तभी किसान के बैंक खाते में पेआउट स्वतः ट्रिगर होता है।</li>
                <li>यदि 24 घंटे के भीतर रिटर्न या गुणवत्ता विवाद उठता है, तो एस्क्रो फंड्स तत्काल फ्रीज रहते हैं जब तक एडमिन द्वारा निष्पक्ष निपटारा न हो।</li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Footer Bar */}
        <div className="bg-[#FAF8F5] p-3 px-5 border-t border-[#DCD7CC] flex justify-between items-center text-xs">
          <div className="text-[11px] text-[#75716B] flex items-center gap-2">
            <span>एस्क्रो ऑडिट स्थिति: <strong>सक्रिय व सुरक्षित</strong></span>
            <span className="text-[#2D5A27]">• 100% बैंक UTR सत्यापित</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2D2D2D] hover:bg-[#1E1E1E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {isHi ? "बंद करें (Close Dashboard)" : "Close Dashboard"}
          </button>
        </div>

      </div>
    </div>
  );
};

// Helper for type checking
function isDisferred(order: DeliveryOrder): boolean {
  return order.payoutStatus === "transferred" || order.paymentStatus === "paid";
}
