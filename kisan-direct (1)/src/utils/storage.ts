import { CropListing, MandiRate, DeliveryOrder, ForumPost, PriceAlert, CartItem, UserProfile, AppSettings, DisputeTicket, NotificationLog } from "../types";
import { initialCropListings, initialMandiRates, initialDeliveryOrders, initialForumPosts, initialPriceAlerts } from "../data/mockData";
import { getInitialNotificationHistory } from "./notificationEngine";

const initialDisputes: DisputeTicket[] = [
  {
    id: "disp-101",
    orderId: "ord-8802",
    orderNumber: "KD-2026-8802",
    buyerName: "रोहित मल्होत्रा (Rohit Malhotra)",
    buyerPhone: "+91 98110 22334",
    farmerName: "बलविंदर सिंह (Balwinder Singh)",
    farmerPhone: "+91 98120 54321",
    cropNameHi: "ताजा देसी टमाटर (15 kg)",
    cropNameEn: "Farm Fresh Tomatoes (15 kg)",
    orderAmount: 424,
    farmerPayoutAmount: 346,
    reason: "damaged_in_transit",
    reasonTextHi: "परिवहन के दौरान 3 किलो टमाटर दबकर पिचक गए (Transit crushing damage)",
    description: "डिलीवरी के समय नीचे की परत में लगभग 3-4 किलो टमाटर काफी दब गए थे। शेष टमाटर ताजे हैं। 25% आंशिक रिफंड की मांग।",
    evidenceImages: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
    ],
    status: "pending",
    createdAt: "2026-08-28 11:45 AM"
  }
];

export const getStoredDisputes = (): DisputeTicket[] => {
  try {
    const raw = localStorage.getItem(KEYS.DISPUTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Disputes Storage error:", e);
  }
  return initialDisputes;
};

export const saveStoredDisputes = (disputes: DisputeTicket[]) => {
  try {
    const safe = Array.isArray(disputes) ? disputes : [];
    localStorage.setItem(KEYS.DISPUTES, JSON.stringify(safe));
  } catch (e) {
    console.error("Save disputes error:", e);
  }
};

export const getStoredNotifications = (): NotificationLog[] => {
  try {
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Notification storage error:", e);
  }
  return getInitialNotificationHistory(initialDeliveryOrders);
};

export const saveStoredNotifications = (logs: NotificationLog[]) => {
  try {
    const safe = Array.isArray(logs) ? logs : [];
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(safe));
  } catch (e) {
    console.error("Save notifications error:", e);
  }
};

const KEYS = {
  CROPS: "kisan_direct_crops_v1",
  MANDI: "kisan_direct_mandi_v2",
  ORDERS: "kisan_direct_orders_v1",
  FORUM: "kisan_direct_forum_v1",
  ALERTS: "kisan_direct_alerts_v1",
  CART: "kisan_direct_cart_v1",
  LANGUAGE: "kisan_direct_lang_v1",
  ROLE: "kisan_direct_role_v1",
  USER: "kisan_direct_user_profile_v1",
  SETTINGS: "kisan_direct_app_settings_v1",
  OFFLINE_QUEUE: "kisan_direct_offline_queue_v1",
  LAST_SYNC: "kisan_direct_last_sync_v1",
  DISPUTES: "kisan_direct_disputes_v1",
  NOTIFICATIONS: "kisan_direct_notifications_v1"
};

export const getStoredCrops = (): CropListing[] => {
  try {
    const raw = localStorage.getItem(KEYS.CROPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
  return Array.isArray(initialCropListings) ? initialCropListings : [];
};

export const saveStoredCrops = (crops: CropListing[]) => {
  try {
    const safe = Array.isArray(crops) ? crops : [];
    localStorage.setItem(KEYS.CROPS, JSON.stringify(safe));
    localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const getStoredMandiRates = (): MandiRate[] => {
  try {
    const raw = localStorage.getItem(KEYS.MANDI);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
  return Array.isArray(initialMandiRates) ? initialMandiRates : [];
};

export const saveStoredMandiRates = (rates: MandiRate[]) => {
  try {
    const safe = Array.isArray(rates) ? rates : [];
    localStorage.setItem(KEYS.MANDI, JSON.stringify(safe));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const getStoredOrders = (): DeliveryOrder[] => {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
  return Array.isArray(initialDeliveryOrders) ? initialDeliveryOrders : [];
};

export const saveStoredOrders = (orders: DeliveryOrder[]) => {
  try {
    const safe = Array.isArray(orders) ? orders : [];
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(safe));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const getStoredForumPosts = (): ForumPost[] => {
  try {
    const raw = localStorage.getItem(KEYS.FORUM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
  return Array.isArray(initialForumPosts) ? initialForumPosts : [];
};

export const saveStoredForumPosts = (posts: ForumPost[]) => {
  try {
    const safe = Array.isArray(posts) ? posts : [];
    localStorage.setItem(KEYS.FORUM, JSON.stringify(safe));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const getStoredPriceAlerts = (): PriceAlert[] => {
  try {
    const raw = localStorage.getItem(KEYS.ALERTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
  return Array.isArray(initialPriceAlerts) ? initialPriceAlerts : [];
};

export const saveStoredPriceAlerts = (alerts: PriceAlert[]) => {
  try {
    const safe = Array.isArray(alerts) ? alerts : [];
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(safe));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const getStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.CART);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
  return [];
};

export const saveStoredCart = (cart: CartItem[]) => {
  try {
    const safe = Array.isArray(cart) ? cart : [];
    localStorage.setItem(KEYS.CART, JSON.stringify(safe));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const getStoredOfflineQueue = (): any[] => {
  try {
    const raw = localStorage.getItem(KEYS.OFFLINE_QUEUE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
  return [];
};

export const addToOfflineQueue = (action: { type: string; payload: any }) => {
  try {
    const queue = getStoredOfflineQueue();
    queue.push({ ...action, timestamp: new Date().toISOString() });
    localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const getStoredUserProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Storage error:", e);
  }
  return null;
};

export const saveStoredUserProfile = (user: UserProfile | null) => {
  try {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const defaultAppSettings: AppSettings = {
  language: "hi",
  state: "MP",
  whatsappAlerts: true,
  smsPriceAlerts: true,
  soundAlerts: true,
  largeFont: false,
  highContrast: false,
  lowDataMode: false,
  autoSyncOffline: true,
};

export const getStoredAppSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) return { ...defaultAppSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Storage error:", e);
  }
  return defaultAppSettings;
};

export const saveStoredAppSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(KEYS.OFFLINE_QUEUE);
  } catch (e) {
    console.error("Storage error:", e);
  }
};

export const saveCrops = saveStoredCrops;
export const saveMandiRates = saveStoredMandiRates;
export const saveOrders = saveStoredOrders;
export const saveForumPosts = saveStoredForumPosts;
export const getStoredAlerts = getStoredPriceAlerts;
export const saveAlerts = saveStoredPriceAlerts;
export const saveCart = saveStoredCart;
