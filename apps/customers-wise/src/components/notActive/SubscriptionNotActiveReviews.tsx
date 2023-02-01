import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import SelectInput from "../form/SelectInput";
import Page from "../Page";

const reviews = [
  {
    emoji: "😐",
    comment:
      "تجربة جيدة ولكن لم تكن الخدمة كما توقعتها، واجهتني مشكلة في الخدمة",
    location: "📍 الفرع الرئيسي",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😍",
    comment: "تجربة رائعة وممتعة، استمتعت جدا وسأعود مرة أخرى",
    location: "📍 فرع قرطبة",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😡",
    comment: "تجربة سيئة جدا لن أعود مرة أخرى وسأقترح على الآخرين عدم الذهاب",
    location: "📍 فرع السليمانية",
    link: "🔗 رابط خاص بقسم ٨",
  },
  {
    emoji: "😃",
    comment: "كل شي كان كويس لكن الخدمة كانت بطيئة",
    location: "📍 فرع قرطبة",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😐",
    comment: "من ماسمعت كنت أعتقد أن تكون الخدمة أسرع و أن يكون الطعام أفضل",
    location: "📍 فرع اليرموك",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😍",
    comment: "رائع جدا جدا تعامل، احترافية مهنية وسرعة في الخدمة",
    location: "📍 فرع السليمانية",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😠",
    comment:
      "فاهمين الخدمة خطأ، مشكلتي اخذت ساعتين ولم يتم حلها ولا يوجد اي مسؤولية",
    location: "📍 فرع قرطبة",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😐",
    comment: "عادي جدا ولم يكن كما توقعتها",
    location: "📍 فرع السليمانية",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😊",
    comment: "المكان جميل وواسع والخدمة جيدة",
    location: "📍 الفرع الرئيسي",
    link: "🔗 الرابط الرئيسي",
  },
  {
    emoji: "😐",
    comment: "بون تعليق",
    location: "📍 الفرع الرئيسي",
    link: "🔗 الرابط الرئيسي",
  },
];

export default function SubscriptionNotActiveReviews() {
  const router = useRouter();

  const { control, watch } = useForm({
    defaultValues: {
      location: "all",
      rating: "all",
    },
  });

  return (
    <div className="relative flex w-full grow flex-col">
      <Page
        title="🗣️ مراجعات عملائي"
        filterComponent={() => (
          <form className="flex flex-wrap items-center gap-4">
            <SelectInput
              name="location"
              label="📍 الفرع"
              options={[{ value: "all", label: "الكل" }]}
              placeholder="اختر موقع"
              control={control}
              className="w-full md:w-3/12"
            />
            <SelectInput
              name="rating"
              label="🌟 التقييم"
              options={[{ value: "all", label: "الكل" }]}
              placeholder="اختر التقييم"
              control={control}
              className="w-full md:w-3/12"
            />
          </form>
        )}
        className="relative select-none blur-[2px]"
      >
        <div className="flex flex-col gap-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="flex min-h-[80px] w-full cursor-pointer flex-col gap-4 rounded-md  bg-gray-700 p-4 shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex items-start gap-4">
                <p className="text-xl">{review.emoji}</p>
                <p>{review.comment}</p>
              </div>
              <div className="flex items-start gap-2">
                <p>{review.location}</p> - <p>{review.link}</p>
              </div>
            </div>
          ))}
        </div>
      </Page>
      <div className="absolute top-0 left-0 flex h-full w-full items-start justify-center pt-40">
        <div className=" sticky top-0 flex flex-col items-center justify-center gap-6 rounded-lg bg-gray-700 p-4 shadow-2xl">
          <p>إشترك في أحد الباقات حتى تستطيع استخدام البرنامج</p>
          <div className="flex flex-wrap items-center gap-4 md:gap-2">
            <p
              className="cursor-pointer text-2xl transition-all hover:scale-105 active:scale-95"
              onClick={() => router.push("/dashboard/user/")}
            >
              👤 حسابي
            </p>
            <p className="text-2xl last:hidden">⬅️</p>
            <p
              className="cursor-pointer text-2xl transition-all hover:scale-105 active:scale-95"
              onClick={() => router.push("/dashboard/user/organizations")}
            >
              🏬 مؤسساتي
            </p>
            <p className="text-2xl last:hidden">⬅️</p>
            <p
              className="cursor-pointer text-2xl transition-all hover:scale-105 active:scale-95"
              onClick={() => router.push("/dashboard/user/organizations")}
            >
              🏬 مؤسستي
            </p>
            <p className="text-2xl last:hidden">⬅️</p>
            <p
              className="cursor-pointer text-2xl transition-all hover:scale-105 active:scale-95"
              onClick={() => router.push("/dashboard/user/organizations")}
            >
              💰 الاشتراك
            </p>
            <p className="text-2xl last:hidden">⬅️</p>
          </div>
        </div>
      </div>
    </div>
  );
}
