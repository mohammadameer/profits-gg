import { useRouter } from "next/router";
import Page from "../Page";

export default function SubscriptionNotActivStatics() {
  const router = useRouter();

  return (
    <div className="relative flex w-full grow flex-col">
      <Page title="📊 إحصائياتي" className="relative select-none blur-[2px]">
        <div className="grid w-full grid-cols-12 gap-4">
          <div
            className="col-span-12 flex 
        flex-col gap-4 rounded-lg bg-gray-700 p-4 md:col-span-6
        "
          >
            <p className="text-xl">عدد المراجعات </p>
            <p className="text-4xl">458</p>
          </div>
          <div
            className="col-span-12 flex 
        flex-col gap-4 rounded-lg bg-gray-700 p-4 md:col-span-6
        "
          >
            <p className="text-xl">متوسط المراجعات لكل الفروع</p>
            <p className="text-4xl">😍</p>
          </div>
          {/* <div
          className="col-span-12 flex 
        flex-col gap-4 rounded-lg bg-gray-700 p-4
        "
        >
          <p className="text-xl">تفاصيل الفروع </p>

          {locationsDetails?.map((location) => (
            <div key={location?.locationId}>
              <p className="text-2xl">{location?.locationName}</p>
              <p className="text-2xl">
                {ratingEmoji[Math.floor(midianRating?._avg.rating as number)]}
              </p>
            </div>
          ))}
        </div> */}
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
