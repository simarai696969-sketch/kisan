import React, { useState, useEffect } from "react";
import { 
  CropListing, 
  MandiRate, 
  DeliveryOrder, 
  ForumPost, 
  CartItem, 
  Language, 
  UserRole, 
  PriceAlert, 
  Review,
  UserProfile,
  AppSettings,
  DisputeTicket,
  NotificationLog
} from "./types";
import { translations } from "./data/translations";
import { 
  getStoredCrops, 
  saveCrops, 
  getStoredMandiRates, 
  saveMandiRates, 
  getStoredOrders, 
  saveOrders, 
  getStoredForumPosts, 
  saveForumPosts, 
  getStoredAlerts, 
  saveAlerts,
  getStoredCart,
  saveCart,
  getStoredUserProfile,
  saveStoredUserProfile,
  getStoredAppSettings,
  saveStoredAppSettings,
  getStoredDisputes,
  saveStoredDisputes,
  getStoredNotifications,
  saveStoredNotifications,
  clearOfflineQueue
} from "./utils/storage";
import { generateOrderNotifications } from "./utils/notificationEngine";

// Components
import { Navbar } from "./components/Navbar";
import { LiveMandiTickerBar } from "./components/LiveMandiTickerBar";
import { MandiDetailModal } from "./components/MandiDetailModal";
import { Marketplace } from "./components/Marketplace";
import { MandiBhavTracker } from "./components/MandiBhavTracker";
import { FarmerDashboard } from "./components/FarmerDashboard";
import { DeliveryTrackingMap } from "./components/DeliveryTrackingMap";
import { CommunityForum } from "./components/CommunityForum";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { CropDetailModal } from "./components/CropDetailModal";
import { PriceAlertModal } from "./components/PriceAlertModal";
import { FarmerListingModal } from "./components/FarmerListingModal";
import { CropQualityAnalyzerModal } from "./components/CropQualityAnalyzerModal";
import { ChatSupportModal } from "./components/ChatSupportModal";
import { CropInquiryChatModal } from "./components/CropInquiryChatModal";
import { MaskedCallModal } from "./components/MaskedCallModal";
import { LanguageSelectorModal } from "./components/LanguageSelectorModal";
import { LoginModal } from "./components/LoginModal";
import { AppSettingsModal } from "./components/AppSettingsModal";
import { AdminSettlementDisputeModal } from "./components/AdminSettlementDisputeModal";
import { AlertsNotificationCenterModal } from "./components/AlertsNotificationCenterModal";
import { GSTInvoiceModal } from "./components/GSTInvoiceModal";
import { ReturnRequestModal } from "./components/ReturnRequestModal";
import { tickMandiRates } from "./utils/mandiSyncEngine";
import { CropQualityAnalysis } from "./types";

import { 
  Bot, 
  ShoppingCart, 
  Bell, 
  WifiOff, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Settings as SettingsIcon,
  LifeBuoy
} from "lucide-react";

export default function App() {
  // Stored Settings & User Profile
  const [appSettings, setAppSettings] = useState<AppSettings>(getStoredAppSettings());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUserProfile());

  // Global App State
  const [language, setLanguage] = useState<Language>(appSettings.language || "hi");
  const [selectedState, setSelectedState] = useState<string>(appSettings.state || "MP");
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(currentUser?.role || "buyer");
  const [activeTab, setActiveTab] = useState<"market" | "mandi" | "deliveries" | "farmer_hub" | "forum">("market");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("अभी-अभी");
  const [isSyncingRates, setIsSyncingRates] = useState<boolean>(false);

  // Core Data - Safely initialized with Array.isArray validated storage loaders
  const [crops, setCrops] = useState<CropListing[]>(() => getStoredCrops());
  const [mandiRates, setMandiRates] = useState<MandiRate[]>(() => getStoredMandiRates());
  const [orders, setOrders] = useState<DeliveryOrder[]>(() => getStoredOrders());
  const [disputes, setDisputes] = useState<DisputeTicket[]>(() => getStoredDisputes());
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => getStoredNotifications());
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => getStoredForumPosts());
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => getStoredAlerts());
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getStoredCart());
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | undefined>(undefined);

  // Modals & Drawers Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAlertsCenterOpen, setIsAlertsCenterOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<DeliveryOrder | null>(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<DeliveryOrder | null>(null);
  const [prefilledAnalysis, setPrefilledAnalysis] = useState<CropQualityAnalysis | null>(null);
  const [prefilledImage, setPrefilledImage] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetCrop, setAlertTargetCrop] = useState<{ crop?: string; price?: number }>({});
  const [selectedCropDetail, setSelectedCropDetail] = useState<CropListing | null>(null);
  const [selectedMandiDetailId, setSelectedMandiDetailId] = useState<string | null>(null);
  
  // In-App Communication & Call Masking Modals (Requirement 5)
  const [isInquiryChatOpen, setIsInquiryChatOpen] = useState(false);
  const [inquiryChatCrop, setInquiryChatCrop] = useState<CropListing | null>(null);
  const [isCallMaskingOpen, setIsCallMaskingOpen] = useState(false);
  const [callMaskingCrop, setCallMaskingCrop] = useState<CropListing | null>(null);

  // Derived live selected mandi rate object that always receives live ticks
  const selectedMandiDetail = (mandiRates || []).find((r) => r.id === selectedMandiDetailId) || null;

  // Real-time Push Notification Toast Banner
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type: "price_drop" | "order_update" | "forum_reply";
  } | null>(null);

  // Initialize Data from Storage
  useEffect(() => {
    setCrops(getStoredCrops());
    setMandiRates(getStoredMandiRates());
    setOrders(getStoredOrders());
    setForumPosts(getStoredForumPosts());
    setAlerts(getStoredAlerts());
    setCartItems(getStoredCart());

    // Online / Offline Listeners
    const handleOnline = () => {
      setIsOffline(false);
      setActiveNotification({
        id: `on-${Date.now()}`,
        title: language === "hi" ? "इंटरनेट कनेक्टेड 🟢" : "Back Online 🟢",
        message: language === "hi" ? "सभी मंडी भाव व डेटा सिंक हो गया है।" : "All mandi prices and orders synchronized.",
        type: "order_update",
      });
    };
    const handleOffline = () => {
      setIsOffline(true);
      setActiveNotification({
        id: `off-${Date.now()}`,
        title: language === "hi" ? "ऑफ़लाइन मोड सक्रिय 📡" : "Offline Mode Active 📡",
        message: language === "hi" ? "आप बिना इंटरनेट के भी भाव देख सकते हैं।" : "You can browse saved rates and draft listings offline.",
        type: "price_drop",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Simulated Real-Time Price Alert Notification (Every 45s demo trigger)
    const notificationTimer = setTimeout(() => {
      setActiveNotification({
        id: `notif-${Date.now()}`,
        title: language === "hi" ? "⚡ लाइव भाव अलर्ट: गेहूं (सीहोर मंडी)" : "⚡ Price Alert: Wheat (Sehore Mandi)",
        message: language === "hi" ? "गेहूं का भाव आज ₹2,420/क्विंटल (+₹80) चढ़ गया है। बेचने का उत्तम समय!" : "Wheat price surged to ₹2,420/Qtl (+₹80). Optimal time for farmers to sell.",
        type: "price_drop",
      });
    }, 6000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(notificationTimer);
    };
  }, [language]);

  // Automatic Real-Time Mandi Rates Tick Simulator (Ticking every 8 seconds)
  useEffect(() => {
    const mandiInterval = setInterval(() => {
      setMandiRates((currentRates) => {
        if (!Array.isArray(currentRates) || currentRates.length === 0) return currentRates;
        const result = tickMandiRates(currentRates);
        return result.updatedRates;
      });
      setLastSyncedTime(new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 8000);

    return () => clearInterval(mandiInterval);
  }, []);

  // Manual Trigger for Mandi Rates Sync
  const handleManualSyncMandiRates = () => {
    setIsSyncingRates(true);
    setTimeout(() => {
      setMandiRates((currentRates) => {
        if (!Array.isArray(currentRates) || currentRates.length === 0) return currentRates;
        const result = tickMandiRates(currentRates);
        return result.updatedRates;
      });
      setLastSyncedTime(new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setIsSyncingRates(false);
      setActiveNotification({
        id: `sync-${Date.now()}`,
        title: language === "hi" ? "राष्ट्रीय मंडी डेटा सिंक 🟢" : "AgMarknet Sync Complete 🟢",
        message: language === "hi" ? "सभी फसलों के नवीनतम मंडी भाव 100% सटीक अपडेट हो गए हैं।" : "Live mandi rates refreshed across all APMC centers.",
        type: "price_drop",
      });
    }, 600);
  };

  // Farmer Stock Updater
  const handleUpdateStock = (cropId: string, newStock: number) => {
    setCrops((prev) =>
      prev.map((c) => (c.id === cropId ? { ...c, availableStock: newStock } : c))
    );
    setActiveNotification({
      id: `stock-${Date.now()}`,
      title: language === "hi" ? "स्टॉक अपडेट सफल ✅" : "Stock Updated ✅",
      message: language === "hi" ? `फसल का उपलब्ध स्टॉक ${newStock} यूनिट कर दिया गया है।` : `Inventory updated to ${newStock} units.`,
      type: "order_update",
    });
  };

  // Farmer Price Updater
  const handleUpdatePrice = (cropId: string, newPrice: number) => {
    setCrops((prev) =>
      prev.map((c) => (c.id === cropId ? { ...c, pricePerUnit: newPrice } : c))
    );
    setActiveNotification({
      id: `price-${Date.now()}`,
      title: language === "hi" ? "बिक्री भाव अपडेट सफल 💰" : "Price Updated 💰",
      message: language === "hi" ? `फसल का बिक्री मूल्य ₹${newPrice} प्रति यूनिट कर दिया गया है।` : `Crop price updated to ₹${newPrice} per unit.`,
      type: "order_update",
    });
  };

  // Farmer Delete Listing
  const handleDeleteListing = (cropId: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== cropId));
    setActiveNotification({
      id: `del-${Date.now()}`,
      title: language === "hi" ? "फसल हटाई गई 🗑️" : "Listing Removed 🗑️",
      message: language === "hi" ? "फसल को मार्केटप्लेस से हटा दिया गया है।" : "Crop listing removed from marketplace.",
      type: "order_update",
    });
  };

  // Persist State Changes
  useEffect(() => {
    if (crops.length > 0) saveCrops(crops);
  }, [crops]);

  useEffect(() => {
    if (mandiRates.length > 0) saveMandiRates(mandiRates);
  }, [mandiRates]);

  useEffect(() => {
    if (orders.length > 0) saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredDisputes(disputes);
  }, [disputes]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    if (forumPosts.length > 0) saveForumPosts(forumPosts);
  }, [forumPosts]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  // Handler: Add to Cart
  const handleAddToCart = (crop: CropListing, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.listing.id === crop.id);
      if (existing) {
        return prev.map((item) =>
          item.listing.id === crop.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { listing: crop, quantity }];
    });
    setIsCartOpen(true);
  };

  // Handler: Buy Direct (Instant Checkout)
  const handleBuyDirect = (crop: CropListing, quantity: number) => {
    setCartItems([{ listing: crop, quantity }]);
    setIsCheckoutOpen(true);
  };

  // Handler: Update Cart Quantity
  const handleUpdateCartQuantity = (cropId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.listing.id === cropId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Handler: Remove Item
  const handleRemoveCartItem = (cropId: string) => {
    setCartItems((prev) => prev.filter((i) => i.listing.id !== cropId));
  };

  // Handler: New Crop Added by Farmer
  const handleAddCrop = (newCropData: Omit<CropListing, "id" | "reviews">) => {
    const newCrop: CropListing = {
      ...newCropData,
      id: `crop-${Date.now()}`,
      reviews: [],
    };
    setCrops((prev) => [newCrop, ...prev]);
    setActiveNotification({
      id: `crop-add-${Date.now()}`,
      title: language === "hi" ? "फसल सफलतापूर्वक लिस्ट हुई! 🌾" : "Produce Listed Successfully! 🌾",
      message: language === "hi" ? `${newCrop.titleHi} अब सीधे खरीदारों को दिखाई दे रही है।` : `${newCrop.titleEn} is now live in marketplace.`,
      type: "order_update",
    });
  };

  // Handler: Order Placed
  const handleOrderSuccess = (newOrder: DeliveryOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setSelectedTrackingOrderId(newOrder.id);

    // Generate automated SMS & WhatsApp notification logs for farmer and buyer
    const generatedLogs = generateOrderNotifications(newOrder, "order_placed");
    setNotifications((prev) => [...generatedLogs, ...prev]);

    setActiveNotification({
      id: `order-${Date.now()}`,
      title: language === "hi" ? "ऑर्डर सफलतापूर्वक कन्फर्म हुआ! 📦" : "Order Confirmed! 📦",
      message: language === "hi" 
        ? `${newOrder.cropNameHi} का ऑर्डर एस्क्रो में सुरक्षित है। किसान व ग्राहक को SMS/WhatsApp अलर्ट भेजा गया।`
        : `Order ${newOrder.orderNumber} is locked in escrow. SMS/WhatsApp alerts sent.`,
      type: "order_update",
    });
  };

  // Handler: Update Order Lifecycle Status
  const handleUpdateOrderStatus = (orderId: string, status: DeliveryOrder["status"]) => {
    let targetOrder: DeliveryOrder | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const isDelivered = status === "delivered";
          const updatedCheckpoints = ord.checkpoints.map((cp, idx) => {
            if (status === "order_placed") {
              return { ...cp, completed: idx === 0, current: idx === 0 };
            } else if (status === "packed_at_farm") {
              return { ...cp, completed: idx <= 1, current: idx === 1 };
            } else if (status === "in_transit") {
              return { ...cp, completed: idx <= 2, current: idx === 2 };
            } else if (status === "out_for_delivery") {
              return { ...cp, completed: idx <= 3, current: idx === 3 };
            } else if (status === "delivered") {
              return { ...cp, completed: true, current: false };
            }
            return cp;
          });

          const updated: DeliveryOrder = {
            ...ord,
            status,
            paymentStatus: isDelivered ? "paid" : ord.paymentStatus,
            escrowStatus: isDelivered ? "released" : ord.escrowStatus || "held",
            payoutStatus: isDelivered ? "processed" : ord.payoutStatus || "pending",
            deliveredAt: isDelivered ? new Date().toLocaleTimeString("hi-IN") : ord.deliveredAt,
            checkpoints: updatedCheckpoints,
          };
          targetOrder = updated;
          return updated;
        }
        return ord;
      })
    );

    if (targetOrder) {
      const generatedLogs = generateOrderNotifications(targetOrder, status);
      setNotifications((prev) => [...generatedLogs, ...prev]);
    }

    setActiveNotification({
      id: `status-${Date.now()}`,
      title: language === "hi" ? "डिलीवरी स्थिति अपडेट 🚚" : "Delivery Status Updated 🚚",
      message: language === "hi"
        ? `ऑर्डर की नई स्थिति: ${status === "delivered" ? "सफलतापूर्वक डिलीवर हुआ (एस्क्रो पेआउट रिलीज)" : status === "cancelled" ? "रद्द किया गया" : "प्रगति पर"}`
        : `Order status changed to ${status}. Automated SMS/WhatsApp logs created.`,
      type: "order_update",
    });
  };

  // Handler: Cancel Order
  const handleCancelOrder = (orderId: string, reason: string) => {
    let targetOrder: DeliveryOrder | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: DeliveryOrder = {
            ...ord,
            status: "cancelled",
            cancellationReason: reason,
            cancelledAt: new Date().toLocaleDateString("hi-IN", { hour: "2-digit", minute: "2-digit" }),
            paymentStatus: ord.paymentMethod === "cod" ? "escrow_hold" : "refunded",
            escrowStatus: "refunded",
            refundStatus: ord.paymentMethod === "cod" ? undefined : "processing",
          };
          targetOrder = updated;
          return updated;
        }
        return ord;
      })
    );

    if (targetOrder) {
      const generatedLogs = generateOrderNotifications(targetOrder, "cancelled");
      setNotifications((prev) => [...generatedLogs, ...prev]);
    }

    setActiveNotification({
      id: `cancel-${Date.now()}`,
      title: language === "hi" ? "ऑर्डर रद्द किया गया ❌" : "Order Cancelled ❌",
      message: language === "hi"
        ? `ऑर्डर रद्द हो चुका है। रिफंड प्रक्रिया व किसान अलर्ट भेजा गया।`
        : `Order cancelled. Refund initiated & alerts sent.`,
      type: "order_update",
    });
  };

  // Handler: Customer 24-Hour Return Request (Easy Resolution Flow)
  const handleSubmitReturnRequest = (
    orderId: string,
    reason: string,
    description: string,
    photoUrl?: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const returnReq = {
      requestedAt: new Date().toLocaleString("hi-IN"),
      reason,
      description,
      status: "pending" as const,
      evidencePhotos: photoUrl ? [photoUrl] : [
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
      ]
    };

    // Update order state
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: "return_requested" as any,
            escrowStatus: "held",
            payoutStatus: "on_hold",
            returnRequest: returnReq
          };
        }
        return ord;
      })
    );

    // Create a new dispute ticket for Admin Dashboard
    const newTicket: DisputeTicket = {
      id: `disp-${Date.now().toString().slice(-4)}`,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      buyerName: targetOrder.buyerName || "उपभोक्ता",
      buyerPhone: targetOrder.buyerPhone || "+91 98110 22334",
      farmerName: targetOrder.farmerName,
      farmerPhone: targetOrder.farmerPhone || "+91 98765 43210",
      cropNameHi: targetOrder.cropNameHi,
      cropNameEn: targetOrder.cropNameEn,
      orderAmount: targetOrder.totalAmount,
      farmerPayoutAmount: targetOrder.farmerPayout || Math.round(targetOrder.totalAmount * 0.92),
      reason: reason as any,
      reasonTextHi: reason,
      description: description,
      evidenceImages: returnReq.evidencePhotos,
      status: "pending",
      createdAt: new Date().toLocaleString("hi-IN")
    };

    setDisputes((prev) => [newTicket, ...prev]);

    // Send notifications
    const returnLogs = generateOrderNotifications(
      { ...targetOrder, status: "return_requested" as any },
      "return_requested" as any
    );
    setNotifications((prev) => [...returnLogs, ...prev]);

    setActiveNotification({
      id: `return-${Date.now()}`,
      title: language === "hi" ? "वापसी अनुरोध दर्ज हुआ 🔄" : "Return Request Logged 🔄",
      message: language === "hi"
        ? "आपका 24-घंटे वापसी अनुरोध एडमिन मध्यस्थता डेस्क को भेज दिया गया है। एस्क्रो होल्ड पर है।"
        : "Return request submitted. Escrow payout held until resolution.",
      type: "order_update"
    });
  };

  // Handler: Admin Resolve Dispute Ticket
  const handleResolveDispute = (
    ticketId: string,
    resolution: string,
    action: "refund_buyer" | "release_to_farmer" | "partial_refund" | "reject",
    refundAmount?: number
  ) => {
    const ticket = disputes.find((d) => d.id === ticketId);
    if (!ticket) return;

    // Update dispute status
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === ticketId
          ? {
              ...d,
              status: "resolved",
              resolutionNote: resolution,
              resolutionAction: action,
              resolvedAt: new Date().toLocaleString("hi-IN")
            }
          : d
      )
    );

    // Update corresponding order
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === ticket.orderId) {
          return {
            ...ord,
            status: action === "refund_buyer" ? "refunded" as any : "delivered",
            escrowStatus: action === "refund_buyer" ? "refunded" : action === "partial_refund" ? "partially_refunded" : "released",
            payoutStatus: action === "refund_buyer" ? "cancelled" : "processed",
            paymentStatus: action === "refund_buyer" ? "refunded" : "paid",
            returnRequest: ord.returnRequest ? {
              ...ord.returnRequest,
              status: action === "reject" ? "rejected" : "approved",
              resolutionNote: resolution
            } : undefined
          };
        }
        return ord;
      })
    );

    setActiveNotification({
      id: `disp-res-${Date.now()}`,
      title: language === "hi" ? "विवाद समाधान संपन्न ⚖️" : "Dispute Resolved ⚖️",
      message: language === "hi"
        ? `टिकट ${ticketId} का निपटारा कर दिया गया है: ${resolution}`
        : `Dispute ${ticketId} resolved successfully.`,
      type: "order_update"
    });
  };

  // Handler: Admin Disburse Farmer Payout
  const handleDisbursePayout = (
    orderId: string,
    remarks: string,
    transactionRef: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            payoutStatus: "processed",
            escrowStatus: "released",
            paymentStatus: "paid",
            paymentTransactionId: transactionRef
          };
        }
        return ord;
      })
    );

    setActiveNotification({
      id: `payout-disb-${Date.now()}`,
      title: language === "hi" ? "किसान पेआउट जारी ✅" : "Farmer Payout Disbursed ✅",
      message: language === "hi"
        ? `ऑर्डर का पेआउट बैंक UTR (${transactionRef}) के साथ किसान खाते में निर्गत कर दिया गया।`
        : `Payout disbursed with UTR ${transactionRef}.`,
      type: "order_update"
    });
  };

  // Handler: Add Review
  const handleAddReview = (cropId: string, reviewData: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: language === "hi" ? "आज" : "Today",
    };

    setCrops((prev) =>
      prev.map((c) => {
        if (c.id === cropId) {
          const updatedReviews = [newReview, ...(c.reviews || [])];
          const avgRating = updatedReviews.length > 0
            ? Number(
                (
                  updatedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
                  updatedReviews.length
                ).toFixed(1)
              )
            : 5.0;
          return {
            ...c,
            reviews: updatedReviews,
            farmerRating: avgRating,
            farmerTotalReviews: updatedReviews.length,
          };
        }
        return c;
      })
    );

    // Also update selected modal crop if open
    if (selectedCropDetail && selectedCropDetail.id === cropId) {
      setSelectedCropDetail((prev) =>
        prev
          ? {
              ...prev,
              reviews: [newReview, ...prev.reviews],
              farmerTotalReviews: prev.farmerTotalReviews + 1,
            }
          : null
      );
    }
  };

  // Handler: Price Alert Triggers
  const handleOpenAlertModal = (cropName?: string, price?: number) => {
    setAlertTargetCrop({ crop: cropName, price });
    setIsAlertModalOpen(true);
  };

  const handleAddAlert = (alertData: Omit<PriceAlert, "id" | "createdAt" | "active">) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: `alt-${Date.now()}`,
      createdAt: new Date().toLocaleDateString("hi-IN"),
      active: true,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a))
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // Forum Handlers
  const handleAddForumPost = (
    postData: Omit<ForumPost, "id" | "likes" | "commentsCount" | "comments">
  ) => {
    const newPost: ForumPost = {
      ...postData,
      id: `fp-${Date.now()}`,
      likes: 1,
      commentsCount: 0,
      comments: [],
    };
    setForumPosts((prev) => [newPost, ...prev]);
  };

  const handleLikeForumPost = (postId: string) => {
    setForumPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  // User & Settings Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveStoredUserProfile(user);
    setUserRole(user.role);
    if (user.state) {
      setSelectedState(user.state);
    }
    setActiveNotification({
      id: `login-${Date.now()}`,
      title: language === "hi" ? "लॉगिन सफल 🌾" : "Login Successful 🌾",
      message: language === "hi" 
        ? `स्वागत है ${user.name}! आप ${user.role === "farmer" ? "किसान" : "क्रेता"} के रूप में जुड़े हैं।` 
        : `Welcome ${user.name}! Signed in as ${user.role}.`,
      type: "order_update",
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUserProfile(null);
    setActiveNotification({
      id: `logout-${Date.now()}`,
      title: language === "hi" ? "लॉगआउट 🔒" : "Signed Out 🔒",
      message: language === "hi" ? "आप सुरक्षित रूप से लॉगआउट हो गए हैं।" : "You have been securely logged out.",
      type: "order_update",
    });
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    saveStoredAppSettings(newSettings);
    if (newSettings.language !== language) {
      setLanguage(newSettings.language);
    }
    if (newSettings.state !== selectedState) {
      setSelectedState(newSettings.state);
    }
    setActiveNotification({
      id: `settings-${Date.now()}`,
      title: language === "hi" ? "सेटिंग्स अपडेट ⚙️" : "Settings Saved ⚙️",
      message: language === "hi" ? "आपकी प्राथमिकताएं सुरक्षित कर ली गई हैं।" : "Your preferences have been saved successfully.",
      type: "order_update",
    });
  };

  const handleRefreshMandiData = () => {
    setIsSyncingRates(true);
    setTimeout(() => {
      setMandiRates((currentRates) => {
        if (!Array.isArray(currentRates) || currentRates.length === 0) return currentRates;
        const result = tickMandiRates(currentRates);
        saveMandiRates(result.updatedRates);
        return result.updatedRates;
      });
      setIsSyncingRates(false);
      setLastSyncedTime(new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }));
    }, 600);
  };

  const handleResetCache = () => {
    clearOfflineQueue();
    setActiveNotification({
      id: `cache-${Date.now()}`,
      title: language === "hi" ? "कैश साफ 🧹" : "Cache Cleared 🧹",
      message: language === "hi" ? "अस्थायी डेटा साफ किया गया।" : "Temporary app data cleared.",
      type: "order_update",
    });
  };

  const handleAddForumComment = (postId: string, commentText: string) => {
    const newCmt = {
      id: `fc-${Date.now()}`,
      authorName: userRole === "farmer" ? "रामेश्वर पटेल (किसान)" : "सत्यापित उपभोक्ता",
      authorLocation: "भारत",
      content: commentText,
      date: language === "hi" ? "अभी" : "Just now",
    };

    setForumPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, newCmt],
              commentsCount: p.commentsCount + 1,
            }
          : p
      )
    );
  };

  const cartTotalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#2D2D2D] flex flex-col font-sans selection:bg-[#B7DDB5]">
      {/* Real-time Notification Banner */}
      {activeNotification && (
        <div className="bg-[#182F15] text-white px-3 py-2.5 shadow-md flex items-center justify-between text-xs transition-all animate-in slide-in-from-top duration-300 border-b border-[#2D5A27] relative z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#86EFAC] animate-ping shrink-0"></span>
              <div className="flex flex-wrap items-center gap-1.5 truncate">
                <span className="text-[#86EFAC] font-bold shrink-0">{activeNotification.title}:</span>
                <span className="text-[#E8F3E5] truncate text-[11px] sm:text-xs">{activeNotification.message}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-[#A8C8A3] hover:text-white bg-[#234A1F] hover:bg-[#2D5A27] px-2 py-1 rounded-md text-xs font-bold shrink-0 ml-2 transition-colors flex items-center gap-1 border border-[#3E7036]"
              title={language === "hi" ? "नोटिफिकेशन हटाएं" : "Dismiss notification"}
            >
              <span>✕</span>
              <span className="hidden sm:inline text-[10px]">{language === "hi" ? "हटाएं" : "Dismiss"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        language={language}
        onLanguageChange={(l) => setLanguage(l)}
        onToggleLanguage={() => setLanguage(language === "hi" ? "en" : "hi")}
        selectedState={selectedState}
        onStateChange={(st, autoLang) => {
          setSelectedState(st);
          if (autoLang) setLanguage(autoLang);
        }}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        userRole={userRole}
        onUserRoleChange={(r) => setUserRole(r)}
        onToggleRole={() => setUserRole(userRole === "farmer" ? "buyer" : "farmer")}
        cartItems={cartItems}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAddCrop={() => {
          setPrefilledAnalysis(null);
          setPrefilledImage(undefined);
          setIsAddCropOpen(true);
        }}
        onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
        onOpenPriceAlerts={() => handleOpenAlertModal()}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onChangeTab={setActiveTab}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        activeAlertsCount={alerts.filter(a => a.active).length}
      />

      {/* Live Mandi Ticker Bar (चलती हुई लाइव मंडी भाव पट्टी) */}
      <LiveMandiTickerBar
        mandiRates={mandiRates}
        language={language}
        onSelectMandiRate={(rate) => setSelectedMandiDetailId(rate.id)}
        onViewAllMandi={() => setActiveTab("mandi")}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {activeTab === "market" && (
          <Marketplace
            crops={crops}
            language={language}
            userRole={userRole}
            onAddToCart={handleAddToCart}
            onBuyDirect={handleBuyDirect}
            onViewDetails={(crop) => setSelectedCropDetail(crop)}
            onOpenAddCrop={() => {
              setPrefilledAnalysis(null);
              setPrefilledImage(undefined);
              setIsAddCropOpen(true);
            }}
            onOpenChat={(crop) => {
              setInquiryChatCrop(crop);
              setIsInquiryChatOpen(true);
            }}
            onOpenCallMasking={(crop) => {
              setCallMaskingCrop(crop);
              setIsCallMaskingOpen(true);
            }}
          />
        )}

        {activeTab === "mandi" && (
          <MandiBhavTracker
            mandiRates={mandiRates}
            language={language}
            onSetPriceAlert={(cropName, price) => handleOpenAlertModal(cropName, price)}
            onManualSync={handleManualSyncMandiRates}
            lastSyncedTime={lastSyncedTime}
            isSyncing={isSyncingRates}
            onSelectRateModal={(rate) => setSelectedMandiDetailId(rate.id)}
          />
        )}

        {activeTab === "farmer_hub" && (
          <FarmerDashboard
            crops={crops}
            orders={orders}
            mandiRates={mandiRates}
            language={language}
            onOpenNewListingModal={() => {
              setPrefilledAnalysis(null);
              setPrefilledImage(undefined);
              setIsAddCropOpen(true);
            }}
            onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
            onUpdateStock={handleUpdateStock}
            onUpdatePrice={handleUpdatePrice}
            onDeleteListing={handleDeleteListing}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === "deliveries" && (
          <DeliveryTrackingMap
            orders={orders}
            language={language}
            selectedOrderId={selectedTrackingOrderId}
            onSelectOrder={(id) => setSelectedTrackingOrderId(id)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeTab === "forum" && (
          <CommunityForum
            posts={forumPosts}
            language={language}
            userRole={userRole}
            onAddPost={handleAddForumPost}
            onLikePost={handleLikeForumPost}
            onAddComment={handleAddForumComment}
          />
        )}
      </main>

      {/* Floating Action Buttons: Kisan Mitra AI Assistant & Quick Cart */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
        {/* Cart Quick Button (if has items) */}
        {cartTotalCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="pointer-events-auto bg-[#1E1E1E] hover:bg-[#2D2D2D] text-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-xs font-bold transition-transform hover:scale-105 border border-[#404040]"
          >
            <ShoppingCart className="w-4 h-4 text-[#86EFAC]" />
            <span>टोकरी ({cartTotalCount})</span>
          </button>
        )}

        {/* Kisan Mitra AI Floating Trigger */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="pointer-events-auto bg-[#2D5A27] hover:bg-[#234A1F] text-white px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-lg shadow-lg flex items-center gap-2 font-bold text-xs sm:text-sm transition-all hover:scale-105 border border-[#86EFAC]/30 group"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-[#FDE68A] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping"></span>
          </div>
          <span className="hidden sm:inline text-xs font-bold">
            {language === "hi" ? "किसान मित्र AI सहायता" : "Kisan Mitra AI"}
          </span>
        </button>
      </div>

      {/* Modals & Slide-ins */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        language={language}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={() => setCartItems([])}
        onViewTracking={(order) => {
          setSelectedTrackingOrderId(order.id);
          setActiveTab("deliveries");
          setIsCheckoutOpen(false);
        }}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
      />

      <CropDetailModal
        crop={selectedCropDetail}
        isOpen={!!selectedCropDetail}
        onClose={() => setSelectedCropDetail(null)}
        language={language}
        onAddToCart={handleAddToCart}
        onBuyDirect={handleBuyDirect}
        onAddReview={handleAddReview}
        onOpenChat={(crop) => {
          setSelectedCropDetail(null);
          setInquiryChatCrop(crop);
          setIsInquiryChatOpen(true);
        }}
        onOpenCallMasking={(crop) => {
          setSelectedCropDetail(null);
          setCallMaskingCrop(crop);
          setIsCallMaskingOpen(true);
        }}
      />

      {/* In-App Direct Chat with Farmer Modal */}
      <CropInquiryChatModal
        crop={inquiryChatCrop}
        isOpen={isInquiryChatOpen}
        onClose={() => {
          setIsInquiryChatOpen(false);
          setInquiryChatCrop(null);
        }}
        language={language}
        currentUser={
          currentUser || {
            id: "guest-user",
            name: "सत्यापित क्रेता (Buyer)",
            role: userRole,
            isKycVerified: false,
          }
        }
        onOpenCallMasking={(crop) => {
          setCallMaskingCrop(crop);
          setIsCallMaskingOpen(true);
        }}
      />

      {/* Zero Number Leak Masked Calling Modal */}
      <MaskedCallModal
        crop={callMaskingCrop}
        isOpen={isCallMaskingOpen}
        onClose={() => {
          setIsCallMaskingOpen(false);
          setCallMaskingCrop(null);
        }}
        language={language}
        currentUser={
          currentUser || {
            id: "guest-user",
            name: "सत्यापित क्रेता (Buyer)",
            role: userRole,
            isKycVerified: false,
          }
        }
      />

      <FarmerListingModal
        isOpen={isAddCropOpen}
        onClose={() => {
          setIsAddCropOpen(false);
          setPrefilledAnalysis(null);
          setPrefilledImage(undefined);
        }}
        onAddCrop={handleAddCrop}
        language={language}
        isOffline={isOffline}
        onOpenAnalyzer={() => {
          setIsAddCropOpen(false);
          setIsAnalyzerOpen(true);
        }}
        initialAnalysis={prefilledAnalysis}
        initialImage={prefilledImage}
      />

      <CropQualityAnalyzerModal
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
        language={language}
        selectedState={selectedState}
        onApplyToListing={(analysis, image) => {
          setPrefilledAnalysis(analysis);
          setPrefilledImage(image);
          setIsAnalyzerOpen(false);
          setIsAddCropOpen(true);
        }}
      />

      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alerts={alerts}
        mandiRates={mandiRates}
        language={language}
        onAddAlert={handleAddAlert}
        onToggleAlert={handleToggleAlert}
        onDeleteAlert={handleDeleteAlert}
        preselectedCrop={alertTargetCrop.crop}
        preselectedPrice={alertTargetCrop.price}
      />

      <ChatSupportModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        language={language}
      />

      {/* Language & State Selector Modal (10 भारतीय भाषाएँ व राज्य चयन) */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={language}
        onSelectLanguage={(lang) => setLanguage(lang)}
        selectedState={selectedState}
        onSelectState={(stateCode, autoLang) => {
          setSelectedState(stateCode);
          if (autoLang) {
            setLanguage(autoLang);
          }
        }}
      />

      {/* Live Mandi Rate Detail & Location Modal (मंडी भाव व स्थान विवरण) */}
      <MandiDetailModal
        rate={selectedMandiDetail}
        allRates={mandiRates}
        crops={crops}
        language={language}
        onClose={() => setSelectedMandiDetailId(null)}
        onSetPriceAlert={(crop, price) => handleOpenAlertModal(crop, price)}
        onSelectCropListing={(crop) => setSelectedCropDetail(crop)}
        onSelectMandiRateId={(id) => setSelectedMandiDetailId(id)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      {/* User Login & Authentication Modal (मोबाइल/ईमेल + OTP) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        language={language}
        selectedState={selectedState}
      />

      {/* App Settings & Instant Troubleshooting Center (सेटिंग्स, भाषा व 1-क्लिक समाधान) */}
      <AppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={appSettings}
        onUpdateSettings={handleUpdateSettings}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          handleUpdateSettings({ ...appSettings, language: lang });
        }}
        selectedState={selectedState}
        onStateChange={(st, autoLang) => {
          setSelectedState(st);
          if (autoLang) setLanguage(autoLang);
          handleUpdateSettings({ ...appSettings, state: st, language: autoLang || language });
        }}
        onOpenChatBot={() => setIsChatOpen(true)}
        onRefreshMandiData={handleRefreshMandiData}
        onResetCache={handleResetCache}
      />

      {/* Floating Quick Action Launcher: 24x7 Helpdesk & Settings */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-white text-[#2D2D2D] px-3 py-2 rounded-full shadow-lg border border-[#DCD7CC] text-xs font-bold transition-all hover:scale-105"
          title={language === "hi" ? "त्वरित सहायता व सेटिंग्स" : "Quick Help & Settings"}
        >
          <SettingsIcon className="w-3.5 h-3.5 text-[#2D5A27]" />
          <span className="hidden sm:inline">{language === "hi" ? "त्वरित सहायता" : "Instant Help"}</span>
        </button>
      </div>

      {/* Footer - High Density Styled */}
      <footer className="bg-[#FAF8F5] text-[#75716B] border-t border-[#DCD7CC] text-[11px] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2D2D2D] text-xs">🌾 किसान डायरेक्ट (Kisan Direct)</span>
            <span className="text-[#A8A29E]">•</span>
            <span>100% बिचौलिया-मुक्त डायरेक्ट प्लेटफॉर्म</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#5C5850] font-medium">
            <span>राष्ट्रीय कृषि बाजार (e-NAM) समकालिक</span>
            <span>•</span>
            <span>एस्क्रो भुगतान सुरक्षा</span>
            <span>•</span>
            <span>24x7 AI कृषि चौपाल</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
