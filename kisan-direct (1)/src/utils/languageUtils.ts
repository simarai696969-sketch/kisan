import { Language, SupportedLanguageInfo } from "../types";

export const SUPPORTED_LANGUAGES: SupportedLanguageInfo[] = [
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    primaryStates: ["उत्तर प्रदेश", "मध्य प्रदेश", "राजस्थान", "बिहार", "हरियाणा", "दिल्ली", "छत्तीसगढ़", "झारखंड", "उत्तराखंड", "हिमाचल प्रदेश"]
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🌐",
    primaryStates: ["Pan-India", "All States"]
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    flag: "🌾",
    primaryStates: ["Punjab", "ਪੰਜਾਬ", "Haryana", "ਹਰਿਆਣਾ", "Chandigarh"]
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    flag: "🚩",
    primaryStates: ["Maharashtra", "महाराष्ट्र", "Goa"]
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    flag: "🌿",
    primaryStates: ["Gujarat", "ગુજરાત"]
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🌱",
    primaryStates: ["Andhra Pradesh", "ఆంధ్రప్రదేశ్", "Telangana", "తెలంగాణ"]
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: "🌻",
    primaryStates: ["Karnataka", "ಕರ್ನಾಟಕ"]
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "🌴",
    primaryStates: ["Tamil Nadu", "தமிழ்நாடு", "Puducherry"]
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🌾",
    primaryStates: ["West Bengal", "পশ্চিমবঙ্গ", "Tripura"]
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    flag: "🥥",
    primaryStates: ["Kerala", "കേരളം"]
  }
];

export interface StateInfo {
  code: string;
  nameEn: string;
  nameHi: string;
  nameNative: string;
  defaultLang: Language;
  majorHubs: string;
}

export const ALL_INDIAN_STATES: StateInfo[] = [
  { code: "MP", nameEn: "Madhya Pradesh", nameHi: "मध्य प्रदेश", nameNative: "मध्य प्रदेश", defaultLang: "hi", majorHubs: "सीहोर, इंदौर, मंदसौर, नीमच, जबलपुर" },
  { code: "UP", nameEn: "Uttar Pradesh", nameHi: "उत्तर प्रदेश", nameNative: "उत्तर प्रदेश", defaultLang: "hi", majorHubs: "मुजफ्फरनगर, कानपुर, आगरा, हाथरस, वाराणसी" },
  { code: "PB", nameEn: "Punjab", nameHi: "पंजाब", nameNative: "ਪੰਜਾਬ", defaultLang: "pa", majorHubs: "ਖੰਨਾ (Khanna), ਜਲੰਧਰ, ਅਬੋਹਰ, ਬਠਿੰਡਾ, ਲੁਧਿਆਣਾ" },
  { code: "MH", nameEn: "Maharashtra", nameHi: "महाराष्ट्र", nameNative: "महाराष्ट्र", defaultLang: "mr", majorHubs: "लासलगाव (कांदा), नाशिक, लातूर (सोयाबीन), नागपूर (संत्री), पुणे" },
  { code: "GJ", nameEn: "Gujarat", nameHi: "गुजरात", nameNative: "ગુજરાત", defaultLang: "gu", majorHubs: "ઊંઝા (જીરું), ગોંડલ, રાજકોટ, મહુવા (ડુંગળી), સુરત" },
  { code: "RJ", nameEn: "Rajasthan", nameHi: "राजस्थान", nameNative: "राजस्थान", defaultLang: "hi", majorHubs: "अलवर (सरसों), कोटा, गंगानगर, नोखा (जीरा), जोधपुर" },
  { code: "HR", nameEn: "Haryana", nameHi: "हरियाणा", nameNative: "हरियाणा / ਹਰਿਆਣਾ", defaultLang: "hi", majorHubs: "करनाल (बासमती), सिरसा, रोहतक, हिसार, कुरुक्षेत्र" },
  { code: "AP", nameEn: "Andhra Pradesh", nameHi: "आंध्र प्रदेश", nameNative: "ఆంధ్రప్రదేశ్", defaultLang: "te", majorHubs: "గుంటూరు (మిర్చి), మదనపల్లె (టమాటా), అనంతపురం" },
  { code: "TS", nameEn: "Telangana", nameHi: "तेलंगाना", nameNative: "తెలంగాణ", defaultLang: "te", majorHubs: "వరంగల్ (పత్తి/మిర్చి), ఖమ్మం, ఆదిలాబాద్, నిజామాబాద్" },
  { code: "KA", nameEn: "Karnataka", nameHi: "कर्नाटक", nameNative: "ಕರ್ನಾಟಕ", defaultLang: "kn", majorHubs: "ಕೋಲಾರ (ಟೊಮೆಟೊ), ಹುಬ್ಬಳ್ಳಿ, ಬೆಳಗಾವಿ, ಮೈಸೂರು, ಕಲಬುರಗಿ" },
  { code: "TN", nameEn: "Tamil Nadu", nameHi: "तमिलनाडु", nameNative: "தமிழ்நாடு", defaultLang: "ta", majorHubs: "கோயம்புத்தூர், சேலம் (மஞ்சள்), மதுரை, ஈரோடு, திண்டுக்கல்" },
  { code: "WB", nameEn: "West Bengal", nameHi: "पश्चिम बंगाल", nameNative: "পশ্চিমবঙ্গ", defaultLang: "bn", majorHubs: "বর্ধমান (ধান), শিলিগুড়ি, মেদিনীপুর, মালদা (আম)" },
  { code: "KL", nameEn: "Kerala", nameHi: "केरल", nameNative: "കേരളം", defaultLang: "ml", majorHubs: "വയനാട് (കുരുമുളക്), ഇടുക്കി (ഏലം), കൊച്ചി, കോട്ടയം" },
  { code: "BR", nameEn: "Bihar", nameHi: "बिहार", nameNative: "बिहार", defaultLang: "hi", majorHubs: "मुजफ्फरपुर (लीची), गुलाबबाग (मक्का), पटना, भागलपुर" },
  { code: "DL", nameEn: "Delhi NCR", nameHi: "दिल्ली NCR", nameNative: "दिल्ली NCR", defaultLang: "hi", majorHubs: "आजादपुर मंडी, गाजीपुर, नरेला" },
  { code: "CG", nameEn: "Chhattisgarh", nameHi: "छत्तीसगढ़", nameNative: "छत्तीसगढ़", defaultLang: "hi", majorHubs: "रायपुर, बिलासपुर, धमतरी (धान का कटोरा)" },
  { code: "JH", nameEn: "Jharkhand", nameHi: "झारखंड", nameNative: "झारखंड", defaultLang: "hi", majorHubs: "रांची, जमशेदपुर, हजारीबाग" },
  { code: "UK", nameEn: "Uttarakhand", nameHi: "उत्तराखंड", nameNative: "उत्तराखंड", defaultLang: "hi", majorHubs: "देहरादून, रुद्रपुर, हल्द्वानी, हरिद्वार" },
  { code: "HP", nameEn: "Himachal Pradesh", nameHi: "हिमाचल प्रदेश", nameNative: "हिमाचल प्रदेश", defaultLang: "hi", majorHubs: "शिमला (सेब मंडी), सोलन (टमाटर), कुल्लू" }
];

// Helper mapping for accurate crop names across all 10 languages
export interface MultiLangCropName {
  en: string;
  hi: string;
  pa: string;
  mr: string;
  gu: string;
  te: string;
  kn: string;
  ta: string;
  bn: string;
  ml: string;
  category: string;
}

export const CROP_DICTIONARY: Record<string, MultiLangCropName> = {
  wheat: {
    en: "Sharbati Desi Wheat",
    hi: "शरबती देसी गेहूं",
    pa: "ਸ਼ਰਬਤੀ ਦੇਸੀ ਕਣਕ",
    mr: "शरबती देशी गहू",
    gu: "શરબતી દેશી ઘઉં",
    te: "శర్బతి దేశీ గోధుమలు",
    kn: "ಶರ್ಬತಿ ನಾಟಿ ಗೋಧಿ",
    ta: "சர்பதி நாட்டு கோதுமை",
    bn: "শরবতী খাঁটি গম",
    ml: "ശർബതി നാടൻ ഗോതമ്പ്",
    category: "grains"
  },
  paddy: {
    en: "1121 Basmati Paddy / Rice",
    hi: "1121 बासमती धान / चावल",
    pa: "1121 ਬਾਸਮਤੀ ਝੋਨਾ / ਚੌਲ",
    mr: "1121 बासमती तांदूळ / भात",
    gu: "1121 બાસમતી ડાંગર / ચોખા",
    te: "1121 బాస్మతి వరి / బియ్యం",
    kn: "1121 ಬಾಸ್ಮತಿ ಭತ್ತ / ಅಕ್ಕಿ",
    ta: "1121 பாசுமதி நெல் / அரிசி",
    bn: "1121 বাসমতী ধান / চাল",
    ml: "1121 ബസുമതി നെല്ല് / അരി",
    category: "grains"
  },
  onion: {
    en: "Red Onion (Nashik / Lasalgaon)",
    hi: "लाल प्याज (नासिक / लासलगांव)",
    pa: "ਲਾਲ ਪਿਆਜ਼ (ਨਾਸਿਕ)",
    mr: "लासलगाव लाल कांदा",
    gu: "લાલ ડુંગળી (નાસિક / મહુવા)",
    te: "ఎర్ర ఉల్లిపాయలు",
    kn: "ಕೆಂಪು ಈರುಳ್ಳಿ",
    ta: "பெரிய வெங்காயம்",
    bn: "লাল পেঁয়াজ (নাসিক)",
    ml: "ചുവന്ന ഉള്ളി / സവാള",
    category: "vegetables"
  },
  tomato: {
    en: "Vine Fresh Desi Tomatoes",
    hi: "देसी लाल टमाटर (ताज़ा)",
    pa: "ਦੇਸੀ ਲਾਲ ਟਮਾਟਰ (ਤਾਜ਼ਾ)",
    mr: "गावरान लाल टोमॅटो",
    gu: "દેશી લાલ ટામેટા (તાજાં)",
    te: "తాజా నాటు టమాటాలు",
    kn: "ನಾಟಿ ಕೆಂಪು ಟೊಮೆಟೊ",
    ta: "நாட்டு தக்காளி",
    bn: "টাটকা দেশি টমেটো",
    ml: "നാടൻ ചുവന്ന തക്കാളി",
    category: "vegetables"
  },
  potato: {
    en: "Pahadi Organic Potatoes",
    hi: "पहाड़ी जैविक आलू",
    pa: "ਪਹਾੜੀ ਜੈਵਿਕ ਆਲੂ",
    mr: "सेंद्रिय बटाटा",
    gu: "દેશી બટાકા (ઓર્ગેનિક)",
    te: "సేంద్రీయ బంగాళాదుంపలు / ఆలు",
    kn: "ಸಾವಯವ ಆಲೂಗಡ್ಡೆ",
    ta: "இயற்கை உருளைக்கிழங்கு",
    bn: "পাহাড়ি জৈব আলু",
    ml: "നാടൻ ഉരുളക്കിഴങ്ങ്",
    category: "vegetables"
  },
  mustard: {
    en: "High-Oil Black Mustard / Sarson",
    hi: "काली सरसों / राई",
    pa: "ਕਾਲੀ ਸਰ੍ਹੋਂ (ਸਰੋਂ)",
    mr: "काळी मोहरी / सरसो",
    gu: "કાળી રાઈ / સરસવ",
    te: "నల్ల ఆవాలు",
    kn: "ಕಪ್ಪು ಸಾಸಿವೆ",
    ta: "கருப்பு கடுகு",
    bn: "কালো সরিষা (রাই)",
    ml: "കറുത്ത കടുക്",
    category: "oilseeds_spices"
  },
  soybean: {
    en: "Yellow Soybean (Graded)",
    hi: "पीली सोयाबीन (ग्रेड ए)",
    pa: "ਪੀਲੀ ਸੋਇਆਬੀਨ",
    mr: "पिवळी सोयाबीन (ग्रेड-१)",
    gu: "પીળી સોયાબીન",
    te: "పసుపు సోయాబీన్",
    kn: "ಹಳದಿ ಸೋಯಾಬೀನ್",
    ta: "மஞ்சள் சோயாபீன்",
    bn: "হলুদ সয়াবিন",
    ml: "മഞ്ഞ സോയാബീൻ",
    category: "grains"
  },
  cotton: {
    en: "Long Staple Cotton / Narma",
    hi: "लंबे रेशे वाली कपास / नरमा",
    pa: "ਲੰਬੇ ਰੇਸ਼ੇ ਵਾਲਾ ਨਰਮਾ / ਕਪਾਹ",
    mr: "लांब धाग्याचा कापूस",
    gu: "શંકર કપાસ / રૂ",
    te: "పత్తి (లాంగ్ స్టేపుల్ కాటన్)",
    kn: "ಉದ್ದ ಎಳೆಯ ಹತ್ತಿ",
    ta: "நீண்ட இழை பருத்தி",
    bn: "উন্নত মানের তুলা",
    ml: "പരുത്തി",
    category: "commercial"
  },
  chana: {
    en: "Desi Chickpea / Gram (Chana)",
    hi: "देसी चना (चना दाल)",
    pa: "ਦੇਸੀ ਛੋਲੇ / ਚਣਾ",
    mr: "देशी हरभरा (चना)",
    gu: "દેશી ચણા",
    te: "దేశీ శనగలు",
    kn: "ನಾಟಿ ಕಡಲೆಕಾಳು",
    ta: "நாட்டு கொண்டைக்கடலை",
    bn: "দেশি ছোলা",
    ml: "നാടൻ കടല",
    category: "pulses"
  },
  moong: {
    en: "Whole Green Moong Dal",
    hi: "साबुत हरी मूंग दाल",
    pa: "ਸਾਬਤ ਹਰੀ ਮੂੰਗੀ ਦਾਲ",
    mr: "अख्खा हिरवा मूग",
    gu: "આખા લીલા મગ",
    te: "ఆకుపచ్చ పెసలు",
    kn: "ಹಸಿರು ಹೆಸರುಕಾಳು",
    ta: "பச்சை பாசிப்பயறு",
    bn: "সবুজ গোটা মুগ ডাল",
    ml: "പച്ച ചെറുപയർ",
    category: "pulses"
  },
  tur: {
    en: "Unpolished Tur / Arhar Dal",
    hi: "तुअर / अरहर दाल (अनपॉलिश)",
    pa: "ਤੂਰ / ਅਰਹਰ ਦਾਲ",
    mr: "गावरान तूर डाळ (अनपॉलिश)",
    gu: "તુવેર દાળ (ઓર્ગેનિક)",
    te: "కందిపప్పు (పాలిష్ లేనిది)",
    kn: "ತೊಗರಿ ಬೇಳೆ",
    ta: "துவரம் பருப்பு",
    bn: "অড়হর ডাল",
    ml: "തുവരപ്പരിപ്പ്",
    category: "pulses"
  },
  garlic: {
    en: "Desi Garlic (Mandsaur / Ooty)",
    hi: "देसी लहसुन (मोटे कली वाला)",
    pa: "ਦੇਸੀ ਲਸਣ (ਮੋਟਾ ਲਸਣ)",
    mr: "गावरान लसूण",
    gu: "દેશી લસણ",
    te: "దేశీ వెల్లుల్లి",
    kn: "ನಾಟಿ ಬೆಳ್ಳುಳ್ಳಿ",
    ta: "நாட்டுப் பூண்டு",
    bn: "দেশি রসুন",
    ml: "നാടൻ വെളുത്തുള്ളി",
    category: "spices"
  },
  ginger: {
    en: "Fresh Farm Ginger",
    hi: "ताज़ा खेत का अदरक",
    pa: "ਤਾਜ਼ਾ ਅਦਰਕ",
    mr: "ताजे आले",
    gu: "તાજું આદું",
    te: "తాజా అల్లం",
    kn: "ತಾಜಾ ಹಸಿ ಶುಂಠಿ",
    ta: "புதிய இஞ்சி",
    bn: "টাটকা আদা",
    ml: "പച്ച ഇഞ്ചി",
    category: "spices"
  },
  turmeric: {
    en: "Raw Salem / Sangli Turmeric",
    hi: "कच्ची व साबुत हल्दी (सांगली)",
    pa: "ਸਾਬਤ ਗੰਢੀ ਹਲਦੀ",
    mr: "सांगली हळकुंड (हळद)",
    gu: "આખી હળદર / ગાંઠિયા",
    te: "పసుపు కొమ్ములు (సేలం)",
    kn: "ಅರಿಶಿನದ ಕೊಂಬು",
    ta: "சேலம் மஞ்சள் கொம்பு",
    bn: "খাঁটি গোটা হলুদ",
    ml: "പച്ച മഞ്ഞൾ / മഞ്ഞൾ",
    category: "spices"
  },
  cumin: {
    en: "Unjha Cumin Seeds (Jeera)",
    hi: "ऊंझा साबुत जीरा (सुगंधित)",
    pa: "ਸਾਬਤ ਖੁਸ਼ਬੂਦਾਰ ਜੀਰਾ",
    mr: "जिरे (बारीक सुगंधी)",
    gu: "ઊંઝાનું સ્પેશિયલ જીરું",
    te: "ఉంజా జీలకర్ర",
    kn: "ಜೀರಿಗೆ",
    ta: "உஞ்சா சீரகம்",
    bn: "গোটা সুগন্ধি জিরে",
    ml: "ജീരകം",
    category: "spices"
  },
  apple: {
    en: "Kinnaur / Shimla Royal Delicious Apples",
    hi: "किन्नौर / शिमला रॉयल सेब",
    pa: "ਸ਼ਿਮਲਾ ਰਾਇਲ ਸੇਬ",
    mr: "शिमला रॉयल सफरचंद",
    gu: "શિમલા રોયલ સફરજન",
    te: "సిమ్లా రాయల్ ఆపిల్స్",
    kn: "ಶಿಮ್ಲಾ ರಾಯಲ್ ಸೇಬು",
    ta: "சிம்லா ராயல் ஆப்பிள்",
    bn: "শিমলা রয়্যাল আপেল",
    ml: "ഷിംല റോയൽ ആപ്പിൾ",
    category: "fruits"
  },
  maize: {
    en: "Yellow Maize / Corn",
    hi: "पीली मक्का / भुट्टा",
    pa: "ਪੀਲੀ ਮੱਕੀ",
    mr: "पिवळा मका",
    gu: "પીળી મકાઈ",
    te: "పసుపు మొక్కజొన్న",
    kn: "ಹಳದಿ ಮೆಕ್ಕೆಜೋಳ",
    ta: "மஞ்சள் மக்காச்சோளம்",
    bn: "হলুদ ভুট্টা",
    ml: "മഞ്ഞ ചോളം",
    category: "grains"
  },
  chilli: {
    en: "Guntur / Fresh Green Chilli",
    hi: "गुंटूर / ताज़ी तीखी हरी मिर्च",
    pa: "ਤਾਜ਼ੀ ਤਿੱਖੀ ਹਰੀ ਮਿਰਚ",
    mr: "गुंटूर / ताजी तिखट हिरवी मिरची",
    gu: "ગુંટુર / તાજાં તીખાં મરચાં",
    te: "గుంటూరు పచ్చిమిర్చి / ఎర్ర మిర్చి",
    kn: "ಗುಂಟೂರು ಖಾರದ ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ",
    ta: "குண்டூர் காரமான பச்சை மிளகாய்",
    bn: "গুন্টুর কাঁচা ঝাল লঙ্কা",
    ml: "ഗുണ്ടൂർ എരിവുള്ള പച്ചമുളക്",
    category: "spices"
  }
};

/**
 * Returns accurately localized crop name according to user's selected language
 */
export function getLocalizedCropName(
  crop: { cropNameEn?: string; cropNameHi?: string; titleEn?: string; titleHi?: string },
  lang: Language
): string {
  const en = (crop.cropNameEn || crop.titleEn || "").toLowerCase();
  const hi = crop.cropNameHi || crop.titleHi || "";

  // Check dictionary keys
  let foundKey: string | null = null;
  if (en.includes("wheat") || hi.includes("गेहूं")) foundKey = "wheat";
  else if (en.includes("paddy") || en.includes("rice") || en.includes("basmati") || hi.includes("धान") || hi.includes("चावल") || hi.includes("बासमती")) foundKey = "paddy";
  else if (en.includes("onion") || hi.includes("प्याज") || hi.includes("कांदा")) foundKey = "onion";
  else if (en.includes("tomato") || hi.includes("टमाटर")) foundKey = "tomato";
  else if (en.includes("potato") || hi.includes("आलू") || hi.includes("बटाटा")) foundKey = "potato";
  else if (en.includes("mustard") || en.includes("sarson") || hi.includes("सरसों") || hi.includes("राई")) foundKey = "mustard";
  else if (en.includes("soybean") || hi.includes("सोयाबीन")) foundKey = "soybean";
  else if (en.includes("cotton") || en.includes("narma") || hi.includes("कपास") || hi.includes("नरमा")) foundKey = "cotton";
  else if (en.includes("chana") || en.includes("gram") || en.includes("chickpea") || hi.includes("चना")) foundKey = "chana";
  else if (en.includes("moong") || hi.includes("मूंग")) foundKey = "moong";
  else if (en.includes("tur") || en.includes("arhar") || hi.includes("तुअर") || hi.includes("अरहर")) foundKey = "tur";
  else if (en.includes("garlic") || hi.includes("लहसुन")) foundKey = "garlic";
  else if (en.includes("ginger") || hi.includes("अदरक")) foundKey = "ginger";
  else if (en.includes("turmeric") || hi.includes("हल्दी")) foundKey = "turmeric";
  else if (en.includes("cumin") || en.includes("jeera") || hi.includes("जीरा")) foundKey = "cumin";
  else if (en.includes("apple") || hi.includes("सेब")) foundKey = "apple";
  else if (en.includes("maize") || en.includes("corn") || hi.includes("मक्का")) foundKey = "maize";
  else if (en.includes("chilli") || hi.includes("मिर्च")) foundKey = "chilli";

  if (foundKey && CROP_DICTIONARY[foundKey]) {
    const dict = CROP_DICTIONARY[foundKey];
    return dict[lang] || dict.hi || dict.en;
  }

  if (lang === "en") return crop.cropNameEn || crop.titleEn || hi;
  if (lang === "hi") return crop.cropNameHi || crop.titleHi || en;
  return crop.cropNameHi || crop.titleHi || crop.cropNameEn || crop.titleEn || "";
}

/**
 * Returns localized category name
 */
export function getLocalizedCategoryName(categoryKey: string, lang: Language): string {
  const categoryMap: Record<string, Record<Language, string>> = {
    grains: {
      hi: "अनाज (Grains)",
      en: "Grains & Cereals",
      pa: "ਅਨਾਜ (Grains)",
      mr: "धान्य (Grains)",
      gu: "અનાજ (Grains)",
      te: "ధాన్యాలు (Grains)",
      kn: "ಧಾನ್ಯಗಳು (Grains)",
      ta: "தானியங்கள் (Grains)",
      bn: "খাদ্যশস্য ও দানা",
      ml: "ധാന്യങ്ങൾ (Grains)"
    },
    vegetables: {
      hi: "ताज़ी सब्जियां",
      en: "Fresh Vegetables",
      pa: "ਤਾਜ਼ੀਆਂ ਸਬਜ਼ੀਆਂ",
      mr: "ताज्या भाज्या",
      gu: "તાજાં શાકભાજી",
      te: "తాజా కూరగాయలు",
      kn: "ತಾಜಾ ತರಕಾರಿಗಳು",
      ta: "புதிய காய்கறிகள்",
      bn: "টাটকা শাকসবজি",
      ml: "പുതിയ പച്ചക്കറികൾ"
    },
    fruits: {
      hi: "ताज़े मीठे फल",
      en: "Farm Fresh Fruits",
      pa: "ਤਾਜ਼ੇ ਫਲ",
      mr: "ताजी फळे",
      gu: "તાજાં ફળો",
      te: "తాజా పండ్లు",
      kn: "ತಾಜಾ ಹಣ್ಣುಗಳು",
      ta: "புதிய பழங்கள்",
      bn: "সুস্বাদু ফল",
      ml: "പഴങ്ങൾ"
    },
    pulses: {
      hi: "दालें व दलहन",
      en: "Pulses & Lentils",
      pa: "ਦਾਲਾਂ ਅਤੇ ਦਲਹਨ",
      mr: "डाळी आणि कडधान्ये",
      gu: "કઠોળ અને દાળ",
      te: "పప్పు ధాన్యాలు",
      kn: "ಬೇಳೆಕಾಳುಗಳು",
      ta: "பருப்பு வகைகள்",
      bn: "ডাল ও শস্যদানা",
      ml: "പയറുവർഗ്ഗങ്ങൾ"
    },
    spices: {
      hi: "मसाले व जड़ी-बूटी",
      en: "Spices & Herbs",
      pa: "ਮਸਾਲੇ",
      mr: "मसाले आणि औषधी वनस्पती",
      gu: "મસાલા",
      te: "సుగంధ ద్రవ్యాలు",
      kn: "ಸಂಬಾರ ಪದಾರ್ಥಗಳು",
      ta: "மசாலா பொருட்கள்",
      bn: "মশলাপাতি",
      ml: "സുഗന്ധവ്യഞ്ജനങ്ങൾ"
    },
    oilseeds_spices: {
      hi: "तिलहन व मसाले",
      en: "Oilseeds & Spices",
      pa: "ਤੇਲ ਬੀਜ ਅਤੇ ਮਸਾਲੇ",
      mr: "गळीत धान्ये आणि मसाले",
      gu: "તેલીબિયાં અને મસાલા",
      te: "నూనె గింజలు & మసాలాలు",
      kn: "ಎಣ್ಣೆಕಾಳುಗಳು ಮತ್ತು ಸಂಬಾರ",
      ta: "எண்ணெய் வித்துக்கள் & மசாலா",
      bn: "তৈলবীজ ও মশলা",
      ml: "എണ്ണക്കുരുക്കളും സുഗന്ധവ്യഞ്ജനങ്ങളും"
    },
    commercial: {
      hi: "व्यावसायिक फसलें (कपास/गन्ना)",
      en: "Commercial Crops (Cotton)",
      pa: "ਵਪਾਰਕ ਫ਼ਸਲਾਂ (ਨਰਮਾ/ਗੰਨਾ)",
      mr: "व्यावसायिक पिके (कापूस)",
      gu: "રોકડિયા પાક (કપાસ)",
      te: "వాణిజ్య పంటలు (పత్తి)",
      kn: "ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು (ಹತ್ತಿ)",
      ta: "பணப்பயிர்கள் (பருத்தி)",
      bn: "অর্থকরী ফসল (তুলা)",
      ml: "വാണിജ്യ വിളകൾ (പരുത്തി)"
    },
    organic: {
      hi: "100% जैविक (Organic)",
      en: "100% Certified Organic",
      pa: "100% ਜੈਵਿਕ (Organic)",
      mr: "100% सेंद्रिय (Organic)",
      gu: "100% ઓર્ગેનિક (જૈવિક)",
      te: "100% సేంద్రీయ (Organic)",
      kn: "100% ಸಾವಯವ (Organic)",
      ta: "100% இயற்கை / ஆர்கானிக்",
      bn: "100% জৈব (Organic)",
      ml: "100% ജൈവ ഉൽപ്പന്നങ്ങൾ"
    }
  };

  return categoryMap[categoryKey]?.[lang] || categoryMap[categoryKey]?.hi || categoryKey;
}

/**
 * Returns localized unit
 */
export function getLocalizedUnit(unit: string, lang: Language): string {
  const u = (unit || "kg").toLowerCase();
  const unitMap: Record<string, Record<Language, string>> = {
    kg: {
      hi: "किलो",
      en: "kg",
      pa: "ਕਿਲੋ (kg)",
      mr: "किलो (kg)",
      gu: "કિલો (kg)",
      te: "కేజీ (kg)",
      kn: "ಕೆಜಿ (kg)",
      ta: "கிலோ (kg)",
      bn: "কেজি (kg)",
      ml: "കിലോഗ്രാം (kg)"
    },
    quintal: {
      hi: "क्विंटल",
      en: "quintal",
      pa: "ਕੁਇੰਟਲ",
      mr: "क्विंटल",
      gu: "ક્વિન્ટલ",
      te: "క్వింటా",
      kn: "ಕ್ವಿಂಟಾಲ್",
      ta: "குவிண்டால்",
      bn: "কুইন্টাল",
      ml: "ക്വിന്റൽ"
    },
    dozen: {
      hi: "दर्जन",
      en: "dozen",
      pa: "ਦਰਜਨ",
      mr: "डझन",
      gu: "ડઝન",
      te: "డజన్",
      kn: "ಡಜನ್",
      ta: "டஜன்",
      bn: "ডজন",
      ml: "ഡസൻ"
    },
    packet: {
      hi: "पैकेट",
      en: "packet",
      pa: "ਪੈਕੇਟ",
      mr: "पॅकेट",
      gu: "પેકેટ",
      te: "ప్యాకెట్",
      kn: "ಪ್ಯಾಕೆಟ್",
      ta: "பாக்கெட்",
      bn: "প্যাকেট",
      ml: "പാക്കറ്റ്"
    }
  };

  return unitMap[u]?.[lang] || unitMap[u]?.hi || u;
}
