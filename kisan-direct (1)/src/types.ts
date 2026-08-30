export type Language = 
  | "hi" // Hindi (हिंदी)
  | "en" // English
  | "pa" // Punjabi (ਪੰਜਾਬੀ - ਪੰਜਾਬ/ਹਰਿਆਣਾ)
  | "mr" // Marathi (मराठी - महाराष्ट्र)
  | "gu" // Gujarati (ગુજરાતી - ગુજરાત)
  | "te" // Telugu (తెలుగు - ఆంధ్రప్రదేశ్/తెలంగాణ)
  | "kn" // Kannada (ಕನ್ನಡ - ಕರ್ನಾಟಕ)
  | "ta" // Tamil (தமிழ் - தமிழ்நாடு)
  | "bn" // Bengali (বাংলা - পশ্চিমবঙ্গ)
  | "ml"; // Malayalam (മലയാളം - കേരളം)

export interface SupportedLanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  primaryStates: string[];
}

export type UserRole = "buyer" | "farmer" | "transporter";

export interface BankAccountDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  accountType?: string;
  branch?: string;
}

export interface VehicleDetails {
  vehicleNumber: string;
  vehicleType: string;
  capacityTons: number;
  rcNumber: string;
  routeCovered?: string;
  liveStatus?: "available" | "on_trip" | "maintenance";
}

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginMethod: "mobile_otp" | "email_otp";
  role: UserRole;
  state: string;
  district?: string;
  village?: string;
  avatarUrl?: string;
  verifiedKisan: boolean;
  kccNumber?: string;
  joinedDate: string;
  kycStatus?: "unverified" | "submitted" | "verified";
  kycDocType?: "aadhaar" | "pan" | "kcc" | "driving_license" | "rc_book";
  kycDocNumber?: string;
  bankDetails?: BankAccountDetails;
  vehicleDetails?: VehicleDetails;
}

export interface AppSettings {
  language: Language;
  state: string;
  whatsappAlerts: boolean;
  smsPriceAlerts: boolean;
  soundAlerts: boolean;
  largeFont: boolean;
  highContrast: boolean;
  lowDataMode: boolean;
  autoSyncOffline: boolean;
}

export interface Review {
  id: string;
  userName: string;
  userLocation: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBuyer: boolean;
  cropPurchased?: string;
  farmerReply?: string;
}

export type CropUnit = "kg" | "quintal" | "bag" | "ton" | "crate" | "packet" | "dozen";

export interface BulkTierPrice {
  minQty?: number;
  minQuantity?: number;
  discountPercent?: number;
  discountPercentage?: number;
  pricePerUnit?: number;
  labelHi?: string;
  labelEn?: string;
}

export interface CropListing {
  id: string;
  titleHi: string;
  titleEn: string;
  category: "grains" | "vegetables" | "fruits" | "pulses" | "spices" | "organic";
  farmerId: string;
  farmerName: string;
  farmerPhoto: string;
  farmerLocation: string;
  farmerPhone: string;
  farmerRating: number;
  farmerTotalReviews: number;
  farmerExperienceYears: number;
  verifiedKisan: boolean;
  pricePerUnit: number;
  unit: CropUnit;
  unitWeightKg?: number; // e.g. 1 bag = 50 kg, 1 quintal = 100 kg, 1 crate = 20 kg
  availableStock: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  minOrderQuantity: number;
  bulkTiers?: BulkTierPrice[];
  harvestDate: string;
  isOrganic: boolean;
  organicCertificateNo?: string;
  images: string[];
  descriptionHi: string;
  descriptionEn: string;
  distanceKm: number;
  reviews: Review[];
  mandiBenchmarkPrice?: number;
  relatedTags?: string[];
  relatedCategoryHints?: string[];
  tags?: string[];
}

export interface MandiRate {
  id: string;
  cropNameHi: string;
  cropNameEn: string;
  variety: string;
  marketName: string;
  state: string;
  district: string;
  commodityCategory: "grains" | "vegetables" | "fruits" | "pulses" | "oilseeds_spices" | "commercial" | "spices" | "dairy_feed";
  currentPrice: number; // in INR per Quintal
  previousPrice: number;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  mspPrice?: number; // Govt Minimum Support Price benchmark
  arrivalVolumeQuintals?: number; // Daily Mandi Arrival Volume
  trend: "up" | "down" | "stable";
  changePercentage: number;
  lastUpdated: string;
  history: { date: string; price: number }[];
  isRealtimeTicking?: boolean;
}

export interface DeliveryCheckpoint {
  titleHi: string;
  titleEn: string;
  time: string;
  completed: boolean;
  current: boolean;
  descriptionHi: string;
  descriptionEn: string;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  cropListingId: string;
  cropNameHi: string;
  cropNameEn: string;
  quantity: number;
  unit: string;
  cropSubtotal: number;
  platformCommission: number;
  deliveryFee: number;
  totalAmount: number;
  farmerPayout: number;
  platformRevenue: number;
  paymentMethod: "upi" | "card" | "netbanking" | "cod" | "kisan_credit";
  paymentStatus: "paid" | "escrow_hold" | "released" | "refunded" | "disputed";
  paymentVerificationStatus?: "verified" | "pending" | "cod_pending";
  paymentTransactionId?: string;
  orderDate: string;
  deliveryDateEstimated: string;
  status: "order_placed" | "packed_at_farm" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled" | "return_requested" | "refunded";
  cancellationReason?: string;
  cancelledAt?: string;
  refundStatus?: "refunded_to_source" | "wallet_credited" | "not_applicable" | "pending_resolution";
  deliveredAt?: string;
  deliveryOtp?: string;
  farmerName: string;
  farmerLocation: string;
  farmerPhone: string;
  farmerBankDetails?: BankAccountDetails;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  driverLat: number;
  driverLng: number;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  checkpoints: DeliveryCheckpoint[];
  temperatureControl: boolean;
  deliveryNotes?: string;
  escrowStatus?: "locked_in_escrow" | "quality_verified" | "dispatched_escrow_hold" | "in_transit_escrow_hold" | "released_to_farmer" | "refunded" | "on_hold_dispute";
  escrowReleaseDate?: string;
  escrowTransactionRef?: string;
  transporterId?: string;
  payoutStatus?: "pending" | "processing" | "transferred" | "on_hold_dispute";
  payoutUtr?: string;
  payoutTransferredAt?: string;
  returnRequest?: {
    reason: string;
    description: string;
    requestedAt: string;
    evidencePhotos?: string[];
    status: "pending" | "investigating" | "approved_refund" | "dismissed" | "split_settlement";
    refundAmount?: number;
    resolutionNotes?: string;
    resolvedAt?: string;
  };
}

export interface DisputeTicket {
  id: string;
  orderId: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  farmerName: string;
  farmerPhone: string;
  cropNameHi: string;
  cropNameEn: string;
  orderAmount: number;
  farmerPayoutAmount: number;
  reason: "damaged_in_transit" | "quality_mismatch" | "weight_shortage" | "delayed_spoilage" | "other";
  reasonTextHi: string;
  description: string;
  evidenceImages: string[];
  status: "pending" | "investigating" | "refunded" | "released_to_farmer" | "split_settlement";
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  refundAmount?: number;
  resolutionActionTaken?: string;
}

export interface FarmerPayoutRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  farmerName: string;
  farmerPhone: string;
  cropNameHi: string;
  quantity: number;
  unit: string;
  grossCropAmount: number;
  platformFee: number;
  netPayout: number;
  status: "pending" | "processing" | "transferred" | "on_hold_dispute";
  payoutMode: "IMPS" | "UPI" | "NEFT";
  bankAccount: BankAccountDetails;
  utrNumber?: string;
  transferredAt?: string;
  deliveredAt?: string;
}

export interface NotificationLog {
  id: string;
  orderId: string;
  orderNumber: string;
  recipientType: "buyer" | "farmer" | "transporter";
  recipientName: string;
  recipientPhone: string;
  channel: "whatsapp" | "sms";
  event: 
    | "order_placed"
    | "packed"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "return_requested"
    | "dispute_resolved"
    | "payout_released";
  titleHi: string;
  titleEn: string;
  messageHi: string;
  messageEn: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  deliveryOtp?: string;
  utrNumber?: string;
  actionUrl?: string;
}

export interface CropInquiryMessage {
  id: string;
  cropId?: string;
  listingId?: string;
  cropTitle?: string;
  farmerId?: string;
  farmerName?: string;
  farmerPhoto?: string;
  buyerId?: string;
  buyerName?: string;
  buyerAvatar?: string;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "farmer" | "transporter";
  recipientId?: string;
  recipientName?: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  negotiatedPriceOffer?: number;
  isCounterOffer?: boolean;
  offerStatus?: "pending" | "accepted" | "rejected";
}

export interface MaskedCallSession {
  id: string;
  callBridgeNumber: string;
  callerRole: "buyer" | "farmer" | "transporter";
  receiverName: string;
  receiverRole: "farmer" | "buyer" | "driver";
  maskedDisplayNumber: string;
  status: "calling" | "ringing" | "connected" | "ended";
  durationSeconds: number;
  purpose: string;
  audioQuality: "HD Voice" | "Standard";
}

export interface ForumComment {
  id: string;
  authorName: string;
  authorRole: "farmer" | "expert" | "buyer";
  authorLocation: string;
  date: string;
  content: string;
  likes: number;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: "farmer" | "agronomist" | "buyer";
  authorAvatar: string;
  authorLocation: string;
  date: string;
  title: string;
  content: string;
  category: "pest_control" | "organic_farming" | "market_advice" | "weather_tips" | "gov_schemes" | "general";
  categoryLabelHi: string;
  categoryLabelEn: string;
  tags: string[];
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  comments: ForumComment[];
}

export interface PriceAlert {
  id: string;
  cropName: string;
  targetPrice: number;
  condition: "above" | "below";
  state: string;
  createdAt: string;
  active: boolean;
  notificationSent?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  source?: string;
}

export interface CartItem {
  listing: CropListing;
  quantity: number;
}

export interface CropQualityAnalysis {
  cropDetectedHi: string;
  cropDetectedEn: string;
  variety: string;
  grade: "Grade A+ (प्रीमियम / Export)" | "Grade A (उत्कृष्ट)" | "Grade B (सामान्य / मंडी मानक)" | "Grade C (प्रसंस्करण / औसत)";
  gradeCode: "A+" | "A" | "B" | "C";
  qualityScore: number; // 0 - 100
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  recommendedListingPrice: number;
  unit: "kg" | "quintal";
  mandiAveragePrice: number;
  extraDirectProfitPercentage: number;
  parameters: {
    lusterScore: number; // 0 - 100 दाने/फल की चमक
    uniformityScore: number; // 0 - 100 आकार की एकरूपता
    moistureEstimate: string; // उदा. "10-12% (आदर्श व सुरक्षित)"
    damagePercentage: number; // उदा. 1.2% (अत्यंत कम)
    cleanlinessScore: number; // 0 - 100 स्वच्छता व शुद्धता
  };
  healthStatus: {
    status: "healthy" | "minor_defect" | "requires_care";
    summaryHi: string;
    summaryEn: string;
    pestOrDiseaseDetected: string;
  };
  recommendationsHi: string[];
  recommendationsEn: string[];
  bestMarketStrategyHi: string;
  bestMarketStrategyEn: string;
  storageAdviceHi: string;
  estimatedShelfLifeDays: number;
  analyzedAt: string;
}
