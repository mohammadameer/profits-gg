import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import Button from "../../components/form/Button";
import SelectInput from "../../components/form/SelectInput";
import TextInput from "../../components/form/TextInput";
import SubscriptionNotActiveReviews from "../../components/notActive/SubscriptionNotActiveReviews";
import Page from "../../components/Page";
import { useInViewObserver } from "../../hooks/utils/useInViewObserver";
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

export default function Reviews() {
  const { control, watch } = useForm({
    defaultValues: {
      location: "all",
      rating: "all",
    },
  });

  const location = watch("location");
  const rating = watch("rating");

  const { data: session } = trpc.auth.getSession.useQuery();

  const {
    data: reviews,
    isLoading: isLoadingReviews,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    status,
    fetchNextPage,
  } = trpc.reviews.list.useInfiniteQuery(
    {
      location: location === "all" ? undefined : location,
      rating: rating === "all" ? undefined : +rating,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );

  const { data: locations } = trpc.locations.list.useQuery();

  const buttonInView = useInViewObserver(() => {
    if (!isFetching && hasNextPage && status === "success") {
      fetchNextPage();
    }
  });

  if (session?.user?.organization?.stripeSubscriptionStatus !== "active")
    return <SubscriptionNotActiveReviews />;

  return (
    <Page
      title="🗣️ مراجعات عملائي"
      filterComponent={() => (
        <form className="flex flex-wrap items-center gap-4">
          <SelectInput
            name="location"
            label="📍 الفرع"
            options={[
              { value: "all", label: "الكل" },
              ...(locations?.map((location) => ({
                value: location.id,
                label: location.name,
              })) ?? []),
            ]}
            placeholder="اختر موقع"
            control={control}
            className="w-full md:w-3/12"
          />
          <SelectInput
            name="rating"
            label="🌟 التقييم"
            options={[
              { value: "all", label: "الكل" },
              { label: "😡", value: 0 },
              { label: "😠", value: 2 },
              { label: "😐", value: 4 },
              { label: "😊", value: 6 },
              { label: "😃", value: 8 },
              { label: "😍", value: 10 },
            ]}
            placeholder="اختر التقييم"
            control={control}
            className="w-full md:w-3/12"
          />
        </form>
      )}
      isLoading={isLoadingReviews}
      loadingComponent={() => (
        <div className="flex flex-col gap-4">
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex h-20 w-full animate-pulse cursor-pointer gap-4 rounded-md bg-gray-700 p-4 shadow-md hover:scale-105 active:scale-95"
              />
            ))}
        </div>
      )}
    >
      <div className="flex flex-col gap-4">
        {reviews?.pages?.length && reviews?.pages[0]?.reviews?.length ? (
          reviews?.pages?.map((page) =>
            page?.reviews.map((review) => (
              <div
                key={review.id}
                className="flex min-h-[80px] w-full cursor-pointer flex-col gap-4 rounded-md  bg-gray-700 p-4 shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <div className="flex items-start gap-4">
                  <p className="text-xl">{ratingEmoji[review.rating]}</p>
                  <p>{review.comment || "لا يوجد تعليق"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <p>📍 {review.location?.name}</p> -
                  <p>🔗 {review.link.name}</p>
                </div>
              </div>
            ))
          )
        ) : (
          <div className="flex w-full grow items-center justify-center">
            <p className="text-center text-xl">لا يوجد مراجعات</p>
          </div>
        )}
        <div className="w-full" ref={buttonInView.ref}>
          <Button
            text={hasNextPage ? "حمل المزيد من المراجعات" : "وصلت للنهاية"}
            noStyles={hasNextPage ? false : true}
            loading={isFetchingNextPage}
            disabled={!hasNextPage}
            onClick={() => (hasNextPage ? fetchNextPage() : null)}
            className="w-full"
          />
        </div>
      </div>
    </Page>
  );
}
