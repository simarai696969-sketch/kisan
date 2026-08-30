import { DeliveryOrder, NotificationLog, Language } from "../types";

export const generateOrderNotifications = (
  order: DeliveryOrder,
  event: NotificationLog["event"],
  extra?: { utr?: string; returnReason?: string; resolutionNotes?: string }
): NotificationLog[] => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("hi-IN", { day: "numeric", month: "short" });
  const timestamp = `${dateStr}, ${timeStr}`;

  const logs: NotificationLog[] = [];

  switch (event) {
    case "order_placed":
      // Buyer WhatsApp / SMS
      logs.push({
        id: `notif-buyer-${Date.now()}-1`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "buyer",
        recipientName: order.buyerName,
        recipientPhone: order.buyerPhone,
        channel: "whatsapp",
        event: "order_placed",
        titleHi: "ऑर्डर दर्ज व एस्क्रो सुरक्षित",
        titleEn: "Order Confirmed & Escrow Locked",
        messageHi: `नमस्ते ${order.buyerName} ji! आपका किसान डायरेक्ट ऑर्डर (${order.orderNumber}) ₹${order.totalAmount} सफलतापूर्वक दर्ज हुआ। आपकी राशि हमारे बैंक एस्क्रो में 100% सुरक्षित है। किसान (${order.farmerName}) को सीधे खेत से तुड़ाई हेतु सूचित कर दिया गया है। आपका डिलीवरी OTP है: *${order.deliveryOtp || "4821"}* (यह OTP केवल डिलीवरी के समय जांच के बाद ही दें)।`,
        messageEn: `Hello ${order.buyerName}! Your Kisan Direct order (${order.orderNumber}) for ${order.cropNameEn} is confirmed. Amount ₹${order.totalAmount} is secured in Bank Escrow. Your secret delivery OTP is: *${order.deliveryOtp || "4821"}*.`,
        timestamp,
        status: "delivered",
        deliveryOtp: order.deliveryOtp || "4821"
      });

      // Farmer WhatsApp / SMS
      logs.push({
        id: `notif-farmer-${Date.now()}-2`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "farmer",
        recipientName: order.farmerName,
        recipientPhone: order.farmerPhone,
        channel: "whatsapp",
        event: "order_placed",
        titleHi: "नया खरीद ऑर्डर प्राप्त!",
        titleEn: "New Crop Order Received!",
        messageHi: `बधाई हो ${order.farmerName} जी! आपको ${order.quantity} ${order.unit} ${order.cropNameHi} का नया सीधा ऑर्डर मिला है (ऑर्डर नं: ${order.orderNumber})। आपका शुद्ध पेआउट: *₹${order.farmerPayout}* एस्क्रो वॉल्ट में लॉक हो चुका है। कृपया खेत से ताजी तुड़ाई कर पैकिंग तैयार रखें। एग्री-वाहन जल्द पहुंचेगा।`,
        messageEn: `Congratulations ${order.farmerName}! New direct order for ${order.quantity} ${order.unit} ${order.cropNameEn}. Your Net Payout ₹${order.farmerPayout} is locked in Escrow. Please prepare for dispatch.`,
        timestamp,
        status: "delivered"
      });
      break;

    case "in_transit":
      // Buyer alert
      logs.push({
        id: `notif-buyer-${Date.now()}-3`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "buyer",
        recipientName: order.buyerName,
        recipientPhone: order.buyerPhone,
        channel: "sms",
        event: "in_transit",
        titleHi: "फसल खेत से रवाना (In Transit)",
        titleEn: "Farm Dispatched & In Transit",
        messageHi: `अपडेट: आपका ऑर्डर ${order.orderNumber} (${order.cropNameHi}) खेत से रवाना हो गया है। ड्राइवर: ${order.driverName} (${order.driverPhone}), वाहन: ${order.vehicleNumber}। अनुमानित आगमन: ${order.deliveryDateEstimated}। किसान डायरेक्ट लाइव ट्रैकिंग: kisan-direct.app/track/${order.orderNumber}`,
        messageEn: `Update: Order ${order.orderNumber} is in transit with Driver ${order.driverName} (${order.vehicleNumber}). Track live at kisan-direct.app/track/${order.orderNumber}`,
        timestamp,
        status: "delivered"
      });
      break;

    case "out_for_delivery":
      logs.push({
        id: `notif-buyer-${Date.now()}-4`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "buyer",
        recipientName: order.buyerName,
        recipientPhone: order.buyerPhone,
        channel: "whatsapp",
        event: "out_for_delivery",
        titleHi: "डिलीवरी के लिए निकला (Out for Delivery)",
        titleEn: "Out for Delivery Today",
        messageHi: `🚚 वाहन आपके दरवाजे के निकट है! ड्राइवर ${order.driverName} (${order.driverPhone}) थोड़ी देर में पहुंचेगा। कृपया उपज की ताजगी व वजन जांचने के बाद ही डिलीवरी OTP *${order.deliveryOtp || "4821"}* साझा करें।`,
        messageEn: `🚚 Driver ${order.driverName} is arriving shortly. Inspect produce freshness before giving OTP: *${order.deliveryOtp || "4821"}*.`,
        timestamp,
        status: "delivered",
        deliveryOtp: order.deliveryOtp || "4821"
      });
      break;

    case "delivered":
      // Buyer Delivered alert
      logs.push({
        id: `notif-buyer-${Date.now()}-5`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "buyer",
        recipientName: order.buyerName,
        recipientPhone: order.buyerPhone,
        channel: "whatsapp",
        event: "delivered",
        titleHi: "ऑर्डर सफलतापूर्वक डिलीवर हुआ",
        titleEn: "Delivered Successfully",
        messageHi: `✅ प्रिय ${order.buyerName}, आपका ऑर्डर ${order.orderNumber} OTP सत्यापन उपरांत डिलीवर हो चुका है। आपका डिजिटल GST बिल डाउनलोड करें: kisan-direct.app/invoice/${order.orderNumber}। यदि गुणवत्ता में कोई समस्या हो तो 24 घंटे के भीतर ऐप से आसान वापसी अनुरोध दर्ज कर सकते हैं।`,
        messageEn: `✅ Order ${order.orderNumber} delivered with OTP verification. Download GST Bill at kisan-direct.app/invoice/${order.orderNumber}. 24-hr return window active.`,
        timestamp,
        status: "delivered"
      });

      // Farmer Delivered & Escrow Released
      logs.push({
        id: `notif-farmer-${Date.now()}-6`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "farmer",
        recipientName: order.farmerName,
        recipientPhone: order.farmerPhone,
        channel: "sms",
        event: "payout_released",
        titleHi: "पेआउट निर्गत (Escrow Released)",
        titleEn: "Payout Released to Bank",
        messageHi: `🎉 ${order.farmerName} जी, ग्राहक द्वारा डिलीवरी OTP सत्यापन के बाद आपका शुद्ध पेआउट ₹${order.farmerPayout} आपके बैंक खाते में ट्रांसफर किया जा रहा है। UTR: ${extra?.utr || order.payoutUtr || "SBI-IMPS-9920194821"}. शून्य आढ़त, सीधा फायदा!`,
        messageEn: `🎉 Payout ₹${order.farmerPayout} released to your bank account after delivery OTP verification. UTR: ${extra?.utr || order.payoutUtr || "SBI-IMPS-9920194821"}.`,
        timestamp,
        status: "delivered",
        utrNumber: extra?.utr || order.payoutUtr || "SBI-IMPS-9920194821"
      });
      break;

    case "return_requested":
      logs.push({
        id: `notif-buyer-${Date.now()}-7`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "buyer",
        recipientName: order.buyerName,
        recipientPhone: order.buyerPhone,
        channel: "whatsapp",
        event: "return_requested",
        titleHi: "वापसी / विवाद अनुरोध दर्ज",
        titleEn: "Return/Dispute Request Registered",
        messageHi: `⚠️ आपका वापसी अनुरोध (ऑर्डर: ${order.orderNumber}) दर्ज हो चुका है। कारण: "${extra?.returnReason || order.returnRequest?.reason || "गुणवत्ता जांच"}". एस्क्रो से किसान पेआउट तत्काल रोक (Hold) दिया गया है। हमारा एडमिन पैनल 2 घंटे में समाधान करेगा।`,
        messageEn: `⚠️ Return request registered for ${order.orderNumber}. Escrow payout put on HOLD. Our safety desk is reviewing your ticket.`,
        timestamp,
        status: "delivered"
      });

      logs.push({
        id: `notif-farmer-${Date.now()}-8`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "farmer",
        recipientName: order.farmerName,
        recipientPhone: order.farmerPhone,
        channel: "sms",
        event: "return_requested",
        titleHi: "ऑर्डर पर विवाद सूचना (Escrow On-Hold)",
        titleEn: "Dispute Notice on Order",
        messageHi: `सूचना: ऑर्डर ${order.orderNumber} पर ग्राहक द्वारा गुणवत्ता/क्षति शिकायत दर्ज की गई है। एस्क्रो राशि अस्थायी रूप से रोक दी गई है। हमारी एडमिन टीम आपसे संपर्क कर निष्पक्ष समाधान करेगी।`,
        messageEn: `Notice: Dispute raised on ${order.orderNumber}. Escrow is temporarily on hold pending quality desk review.`,
        timestamp,
        status: "delivered"
      });
      break;

    case "dispute_resolved":
      logs.push({
        id: `notif-buyer-${Date.now()}-9`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipientType: "buyer",
        recipientName: order.buyerName,
        recipientPhone: order.buyerPhone,
        channel: "whatsapp",
        event: "dispute_resolved",
        titleHi: "विवाद समाधान संपन्न",
        titleEn: "Dispute Resolved",
        messageHi: `✅ ऑर्डर ${order.orderNumber} के विवाद का समाधान हो चुका है। निर्णय: ${extra?.resolutionNotes || "रिफंड स्वीकृत व सुरक्षित संसाधित"}। किसान डायरेक्ट सुरक्षा के साथ खरीदारी के लिए धन्यवाद।`,
        messageEn: `✅ Dispute on ${order.orderNumber} resolved: ${extra?.resolutionNotes || "Refund processed to source account."}`,
        timestamp,
        status: "delivered"
      });
      break;

    default:
      break;
  }

  return logs;
};

export const getInitialNotificationHistory = (orders: DeliveryOrder[]): NotificationLog[] => {
  const initialLogs: NotificationLog[] = [];
  orders.forEach((ord) => {
    if (ord.status === "delivered") {
      initialLogs.push(...generateOrderNotifications(ord, "delivered", { utr: ord.payoutUtr || "SBI-IMPS-77291039" }));
    } else if (ord.status === "in_transit") {
      initialLogs.push(...generateOrderNotifications(ord, "order_placed"));
      initialLogs.push(...generateOrderNotifications(ord, "in_transit"));
    } else if (ord.status === "packed_at_farm") {
      initialLogs.push(...generateOrderNotifications(ord, "order_placed"));
    }
  });
  return initialLogs;
};
