export type StaticCategory = {
  emoji: string;
  label: string;
  value: string | null;
  field: string;
};

export type Category = {
  emoji: string;
  label: {
    "ar-sa": string;
    "en-us": string;
  };
  value: string | null;
  field: string;
};

export type StaticField = {
  value: string;
  label: string;
};

export const fields = [
  {
    value: "morals",
    label: {
      "ar-sa": "القيم",
      "en-us": "Morals",
    },
  },
  {
    value: "things",
    label: {
      "ar-sa": "الأشياء",
      "en-us": "Things",
    },
  },
];

const categories: Category[] = [
  {
    emoji: "🌟",
    label: {
      "ar-sa": "الاخلاق والفضائل",
      "en-us": "Ethics and Virtues",
    },
    value: "ethics-and-virtues",
    field: "morals",
  },
  {
    emoji: "✨",
    label: {
      "ar-sa": "الصدق",
      "en-us": "Honesty",
    },
    value: "honesty",
    field: "morals",
  },
  {
    emoji: "👍",
    label: {
      "ar-sa": "الأمانة",
      "en-us": "Trustworthiness",
    },
    value: "trustworthiness",
    field: "morals",
  },
  {
    emoji: "👨‍👩‍👦",
    label: {
      "ar-sa": "بر الوالدين",
      "en-us": "Kindness to Parents",
    },
    value: "respecting-parents",
    field: "morals",
  },
  {
    emoji: "🤲",
    label: {
      "ar-sa": "الإيثار",
      "en-us": "Altruism",
    },
    value: "selflessness",
    field: "morals",
  },
  {
    emoji: "🤝",
    label: {
      "ar-sa": "حسن الظن",
      "en-us": "Positive Assumption (thinking well of others)",
    },
    value: "good-opinion",
    field: "morals",
  },
  {
    emoji: "🛌",
    label: {
      "ar-sa": "النوم في الوقت المناسب",
      "en-us": "Proper Sleep",
    },
    value: "sleeping-on-time",
    field: "morals",
  },
  {
    emoji: "🧼",
    label: {
      "ar-sa": "النظافة الشخصية",
      "en-us": "Personal Hygiene",
    },
    value: "personal-hygiene",
    field: "morals",
  },
  {
    emoji: "🥰",
    label: {
      "ar-sa": "الرفق",
      "en-us": "Gentleness",
    },
    value: "gentleness",
    field: "morals",
  },
  {
    emoji: "🫤",
    label: {
      "ar-sa": "التنمر",
      "en-us": "Bullying",
    },
    value: "bullying",
    field: "morals",
  },
  {
    emoji: "💪",
    label: {
      "ar-sa": "الثقة في النفس",
      "en-us": "Self-Confidence",
    },
    value: "self-confidence",
    field: "morals",
  },
  {
    emoji: "😎",
    label: {
      "ar-sa": "المسؤولية",
      "en-us": "Responsibility",
    },
    value: "responsibility",
    field: "morals",
  },
  {
    emoji: "😮‍💨",
    label: {
      "ar-sa": "الصبر",
      "en-us": "Patience",
    },
    value: "patience",
    field: "morals",
  },
  {
    emoji: "🤝",
    label: {
      "ar-sa": "التعاون",
      "en-us": "Cooperation",
    },
    value: "cooperation",
    field: "morals",
  },
  {
    emoji: "🤥",
    label: {
      "ar-sa": "الكذب",
      "en-us": "Lying",
    },
    value: "lying",
    field: "morals",
  },
  {
    emoji: "🤔",
    label: {
      "ar-sa": "الفضول",
      "en-us": "Curiosity",
    },
    value: "curiosity",
    field: "morals",
  },
  {
    emoji: "🫡",
    label: {
      "ar-sa": "الإحترام",
      "en-us": "Respect",
    },
    value: "respect",
    field: "morals",
  },
  {
    label: {
      "ar-sa": "الصداقة",
      "en-us": "Friendship",
    },
    emoji: "🤝",
    value: "friendship",
    field: "morals",
  },
  {
    label: {
      "ar-sa": "المثابرة",
      "en-us": "Perseverance",
    },
    emoji: "🏋️‍♂️",
    value: "perseverance",
    field: "morals",
  },
  {
    label: {
      "ar-sa": "الشجاعة",
      "en-us": "Courage",
    },
    emoji: "🦸‍♂️",
    value: "bravery",
    field: "morals",
  },
  {
    label: {
      "ar-sa": "الرحمة",
      "en-us": "Mercy",
    },
    emoji: "🥰",
    value: "compassion",
    field: "morals",
  },
  {
    label: {
      "ar-sa": "العمل الجاد",
      "en-us": "Hard Work",
    },
    emoji: "🏃‍♂️",
    value: "Hard Work",
    field: "morals",
  },
  {
    label: {
      "ar-sa": "الكرم",
      "en-us": "Generosity",
    },
    emoji: "🤲",
    value: "generosity",
    field: "morals",
  },
  {
    value: "theft",
    field: "morals",
    label: {
      "ar-sa": "السرقة",
      "en-us": "Theft",
    },
    emoji: "🥷 ",
  },
  {
    value: "numbers",
    label: {
      "ar-sa": "الأرقام",
      "en-us": "Numbers",
    },
    emoji: "🔢",
    field: "things",
  },
  {
    value: "colors",
    label: {
      "ar-sa": "الألوان",
      "en-us": "Colors",
    },
    emoji: "🎨",
    field: "things",
  },
  {
    value: "shapes",
    label: {
      "ar-sa": "الأشكال",
      "en-us": "Shapes",
    },
    emoji: "🔺",
    field: "things",
  },
  {
    value: "letters",
    label: {
      "ar-sa": "الحروف",
      "en-us": "Letters",
    },
    emoji: "🔠",
    field: "things",
  },
  {
    value: "animals",
    label: {
      "ar-sa": "الحيوانات",
      "en-us": "Animals",
    },
    emoji: "🐣",
    field: "things",
  },
  {
    value: "plants",
    label: {
      "ar-sa": "النباتات",
      "en-us": "Plants",
    },
    emoji: "🌱",
    field: "things",
  },
  {
    value: "fruits",
    label: {
      "ar-sa": "الفواكه",
      "en-us": "Fruits",
    },
    emoji: "🍎",
    field: "things",
  },
  {
    value: "vegetables",
    label: {
      "ar-sa": "الخضروات",
      "en-us": "Vegetables",
    },
    emoji: "🥕",
    field: "things",
  },
  {
    value: "food",
    label: {
      "ar-sa": "الطعام",
      "en-us": "Food",
    },
    emoji: "🥙",
    field: "things",
  },
  {
    value: "drinks",
    label: {
      "ar-sa": "المشروبات",
      "en-us": "Drinks",
    },
    emoji: "🧃",
    field: "things",
  },
  {
    value: "clothes",
    label: {
      "ar-sa": "الملابس",
      "en-us": "Clothing",
    },
    emoji: "👕",
    field: "things",
  },
  {
    value: "weather",
    label: {
      "ar-sa": "الطقس",
      "en-us": "Weather",
    },
    emoji: "🌤",
    field: "things",
  },
  {
    value: "seasons",
    label: {
      "ar-sa": "الفصول",
      "en-us": "Seasons",
    },
    emoji: "🍂",
    field: "things",
  },
  {
    value: "transportation",
    label: {
      "ar-sa": "وسائل المواصلات",
      "en-us": "Means of Transportation",
    },
    emoji: "🚗",
    field: "things",
  },
  {
    value: "jobs",
    label: {
      "ar-sa": "الوظائف",
      "en-us": "Jobs",
    },
    emoji: "👨‍🏭",
    field: "things",
  },
  {
    value: "places",
    label: {
      "ar-sa": "الأماكن",
      "en-us": "Places",
    },
    emoji: "🏠",
    field: "things",
  },
  {
    value: "family",
    label: {
      "ar-sa": "العائلة",
      "en-us": "Family",
    },
    emoji: "👨‍👩‍👧‍👦",
    field: "things",
  },
  {
    value: "feelings",
    label: {
      "ar-sa": "المشاعر",
      "en-us": "Emotions",
    },
    emoji: "🤗",
    field: "things",
  },
  {
    value: "hobbies",
    label: {
      "ar-sa": "الهوايات",
      "en-us": "Hobbies",
    },
    emoji: "🎮",
    field: "things",
  },
  {
    value: "sports",
    label: {
      "ar-sa": "الرياضة",
      "en-us": "Sports",
    },
    emoji: "🏀",
    field: "things",
  },
  {
    value: "games",
    label: {
      "ar-sa": "الألعاب",
      "en-us": "Games",
    },
    emoji: "🎲",
    field: "things",
  },
  {
    value: "tools",
    label: {
      "ar-sa": "الأدوات",
      "en-us": "Tools",
    },
    emoji: "🔧",
    field: "things",
  },
  {
    value: "furniture",
    label: {
      "ar-sa": "الأثاث",
      "en-us": "Furniture",
    },
    emoji: "🛋",
    field: "things",
  },
  {
    value: "buildings",
    label: {
      "ar-sa": "المباني",
      "en-us": "Buildings",
    },
    emoji: "🏢",
    field: "things",
  },
  {
    value: "countries",
    label: {
      "ar-sa": "الدول",
      "en-us": "Countries",
    },
    emoji: "🌍",
    field: "things",
  },
  {
    value: "cities",
    label: {
      "ar-sa": "المدن",
      "en-us": "Cities",
    },
    emoji: "🏙",
    field: "things",
  },
  {
    value: "continents",
    label: {
      "ar-sa": "القارات",
      "en-us": "Continents",
    },
    emoji: "🌎",
    field: "things",
  },
  {
    value: "planets",
    label: {
      "ar-sa": "الكواكب",
      "en-us": "Planets",
    },
    emoji: "🪐",
    field: "things",
  },
  {
    value: "space",
    label: {
      "ar-sa": "الفضاء",
      "en-us": "Space",
    },
    emoji: "🚀",
    field: "things",
  },
  {
    value: "time",
    label: {
      "ar-sa": "الوقت",
      "en-us": "Time",
    },
    emoji: "⏰",
    field: "things",
  },
  {
    value: "money",
    label: {
      "ar-sa": "المال",
      "en-us": "Money",
    },
    emoji: "💵",
    field: "things",
  },
];

export default categories;
