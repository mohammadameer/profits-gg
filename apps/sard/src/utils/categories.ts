export type Category = {
  emoji: string;
  label: string;
  value: string | null;
  field: string;
};

export const fields = [
  { value: "morals", label: "القيم" },
  { value: "things", label: "الأشياء" },
];

const categories: Category[] = [
  {
    emoji: "🛌",
    label: "النوم في الوقت المناسب",
    value: "sleeping-on-time",
    field: "morals",
  },
  {
    emoji: "🧼",
    label: "النظافة الشخصية",
    value: "personal-hygiene",
    field: "morals",
  },
  {
    emoji: "🫤",
    label: "التنمر",
    value: "bullying",
    field: "morals",
  },
  {
    emoji: "💪",
    label: "الثقة في النفس",
    value: "self-confidence",
    field: "morals",
  },
  {
    emoji: "😎",
    label: "المسؤولية",
    value: "responsibility",
    field: "morals",
  },
  {
    emoji: "🤝",
    label: "التعاون",
    value: "cooperation",
    field: "morals",
  },
  {
    emoji: "🤥",
    label: "الكذب",
    value: "lying",
    field: "morals",
  },
  {
    emoji: "🤔",
    label: "الفضول",
    value: "curiosity",
    field: "morals",
  },
  {
    emoji: "🫡",
    label: "الإحترام",
    value: "respect",
    field: "morals",
  },
  {
    label: "المثابرة",
    emoji: "🏋️‍♂️",
    value: "perseverance",
    field: "morals",
  },
  {
    label: "الشجاعة",
    emoji: "🦸‍♂️",
    value: "bravery",
    field: "morals",
  },
  {
    label: "الرحمة",
    emoji: "🥰",
    value: "compassion",
    field: "morals",
  },
  {
    label: "العمل الجاد",
    emoji: "🏃‍♂️",
    value: "Hard Work",
    field: "morals",
  },
  {
    label: "الكرم",
    emoji: "🤲",
    value: "generosity",
    field: "morals",
  },
  {
    value: "theft",
    field: "morals",
    label: "السرقة",
    emoji: "🥷 ",
  },
  {
    value: "numbers",
    label: "الأرقام",
    emoji: "🔢",
    field: "things",
  },
  {
    value: "colors",
    label: "الألوان",
    emoji: "🎨",
    field: "things",
  },
  {
    value: "shapes",
    label: "الأشكال",
    emoji: "🔺",
    field: "things",
  },
  {
    value: "letters",
    label: "الحروف",
    emoji: "🔠",
    field: "things",
  },
  {
    value: "animals",
    label: "الحيوانات",
    emoji: "🐣",
    field: "things",
  },
  {
    value: "plants",
    label: "النباتات",
    emoji: "🌱",
    field: "things",
  },
  {
    value: "fruits",
    label: "الفواكه",
    emoji: "🍎",
    field: "things",
  },
  {
    value: "vegetables",
    label: "الخضروات",
    emoji: "🥕",
    field: "things",
  },
  {
    value: "food",
    label: "الطعام",
    emoji: "🥙",
    field: "things",
  },
  {
    value: "drinks",
    label: "المشروبات",
    emoji: "🧃",
    field: "things",
  },
  {
    value: "clothes",
    label: "الملابس",
    emoji: "👕",
    field: "things",
  },
  {
    value: "weather",
    label: "الطقس",
    emoji: "🌤",
    field: "things",
  },
  {
    value: "seasons",
    label: "الفصول",
    emoji: "🍂",
    field: "things",
  },
  {
    value: "transportation",
    label: "وسائل المواصلات",
    emoji: "🚗",
    field: "things",
  },
  {
    value: "jobs",
    label: "الوظائف",
    emoji: "👨‍🏭",
    field: "things",
  },
  {
    value: "places",
    label: "الأماكن",
    emoji: "🏠",
    field: "things",
  },
  {
    value: "family",
    label: "العائلة",
    emoji: "👨‍👩‍👧‍👦",
    field: "things",
  },
  {
    value: "feelings",
    label: "المشاعر",
    emoji: "🤗",
    field: "things",
  },
  {
    value: "hobbies",
    label: "الهوايات",
    emoji: "🎮",
    field: "things",
  },
  {
    value: "sports",
    label: "الرياضة",
    emoji: "🏀",
    field: "things",
  },
  {
    value: "games",
    label: "الألعاب",
    emoji: "🎲",
    field: "things",
  },
  {
    value: "toys",
    label: "الألعاب",
    emoji: "🧸",
    field: "things",
  },
  {
    value: "tools",
    label: "الأدوات",
    emoji: "🔧",
    field: "things",
  },
  {
    value: "furniture",
    label: "الأثاث",
    emoji: "🛋",
    field: "things",
  },
  {
    value: "buildings",
    label: "المباني",
    emoji: "🏢",
    field: "things",
  },
  {
    value: "countries",
    label: "الدول",
    emoji: "🌍",
    field: "things",
  },
  {
    value: "cities",
    label: "المدن",
    emoji: "🏙",
    field: "things",
  },
  {
    value: "continents",
    label: "القارات",
    emoji: "🌎",
    field: "things",
  },
  {
    value: "planets",
    label: "الكواكب",
    emoji: "🪐",
    field: "things",
  },
  {
    value: "space",
    label: "الفضاء",
    emoji: "🚀",
    field: "things",
  },
  {
    value: "time",
    label: "الوقت",
    emoji: "⏰",
    field: "things",
  },
  {
    value: "money",
    label: "المال",
    emoji: "💵",
    field: "things",
  },
];

export default categories;
