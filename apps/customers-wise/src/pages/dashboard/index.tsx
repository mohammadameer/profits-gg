import { useSession } from "next-auth/react";
import SubscriptionNotActiveReviews from "../../components/notActive/SubscriptionNotActiveReviews";
import SubscriptionNotActivStatics from "../../components/notActive/SubscriptionNotActiveStatics";
import Page from "../../components/Page";
import { trpc } from "../../utils/trpc";

const ratingEmoji = [
  "😡",
  null,
  "😠",
  null,
  "😐",
  null,
  "😊",
  null,
  "😃",
  null,
  "😍",
];

export default function Dashboard() {
  const { data: totalReviews } = trpc.statistics.totalReviews.useQuery();
  const { data: midianRating } = trpc.statistics.medianRating.useQuery();
  const { data: locationsAverageRating } =
    trpc.statistics.locationsAverageRating.useQuery();

  const { data: session } = trpc.auth.getSession.useQuery();

  if (session?.user?.organization?.stripeSubscriptionStatus !== "active")
    return <SubscriptionNotActivStatics />;

  return (
    <Page title="📊 إحصائياتي">
      <div className="grid w-full grid-cols-12 gap-4">
        <div
          className="col-span-12 flex 
        flex-col gap-4 rounded-lg bg-gray-700 p-4 md:col-span-6
        "
        >
          <p className="text-xl">عدد المراجعات </p>
          <p className="text-4xl">{totalReviews || "0"}</p>
        </div>
        <div
          className="col-span-12 flex 
        flex-col gap-4 rounded-lg bg-gray-700 p-4 md:col-span-6
        "
        >
          <p className="text-xl">متوسط المراجعات لكل الفروع</p>
          <p className="text-4xl">
            {ratingEmoji[Math.floor(midianRating?._avg.rating as number)]}
          </p>
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
  );
}
