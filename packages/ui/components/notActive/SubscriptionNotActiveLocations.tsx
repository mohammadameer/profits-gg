import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Card from "../Card";
import SelectInput from "../form/SelectInput";
import Page from "../Page";

const locations = [
  "الفرع الرئيسي",
  "فرع قرطبة",
  "فرع اليرموك",
  "فرع الروضة",
  "فرع النسيم",
  "فرع الملز",
  "فرع العليا",
  "فرع السفاارات",
  "فرع حطين",
  "فرع النرجس",
  "فرع الياسمين",
];

export default function SubscriptionNotActiveLocations() {
  const router = useRouter();

  const { control, watch } = useForm({
    defaultValues: {
      location: "all",
      rating: "all",
    },
  });

  return (
    <div className="relative flex w-full grow flex-col">
      <Page title="📍 فروعي" className="relative select-none blur-[2px]">
        <div className="grid w-full grid-cols-12 gap-4">
          {locations?.map((location) => (
            <Card
              key={location}
              title={"📍 " + location}
              link={"/dashboard/locations/"}
            />
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
