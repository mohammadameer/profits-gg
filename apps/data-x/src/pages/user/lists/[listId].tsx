import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import { Button, Page } from "@profits-gg/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { toast } from "react-hot-toast";
import DataItem from "../../../components/DataItem";
import { LoginModalContext } from "../../../components/Layout";
import { api } from "../../../utils/api";
import type Stripe from "stripe";

const productsMaxes = {
  basic: {
    search: 500,
    download: 250,
  },
  preferred: {
    search: 2000,
    download: 1000,
  },
  enterprise: {
    search: 5000,
    download: 3000,
  },
};

export default function List() {
  const router = useRouter();
  const { listId } = router.query;

  const { setLoginOpen } = useContext(LoginModalContext);

  const { data: session, status: sessionStatus } = useSession();

  const { data: subscription } = api.stripe.subscription.useQuery();

  const { data: lists } = api.list.list.useQuery();

  const { data: list } = api.list.retrieve.useQuery({
    listId: listId as string,
  });

  const {
    data: listData,
    isLoading: isLoadingData,
    isFetching,
    status,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.list.data.useInfiniteQuery({
    listId: listId as string,
  });

  const handleFetchNextPage = () => {
    // check if user is logged in
    if (sessionStatus == "unauthenticated") {
      setLoginOpen?.(true);
      return;
    }

    if (session?.user.stripeSubscriptionStatus !== "active") {
      toast("اشترك في أحد الباقات لزيادة حد ظهور البيانات", {
        icon: "🔒",
      });
      return;
    }

    // check if subscription high amount is reached
    const product = subscription?.price.product as Stripe.Product;
    if (!product) return;
    const productMaxSearch =
      productsMaxes[product.name as keyof typeof productsMaxes].search;
    const dataLength =
      listData?.pages.reduce((acc, page) => acc + page.data.length, 0) || 0;

    if (
      productsMaxes[product.name as keyof typeof productsMaxes].search <=
      dataLength
    ) {
      toast("لقد وصلت لحد ظهور البيانات في باقتك", {
        icon: "🔒",
      });
      return;
    }

    if (product.name)
      if (!isFetching && hasNextPage && status === "success") {
        fetchNextPage();
      }
  };

  const buttonInView = useInViewObserver(handleFetchNextPage);

  return (
    <Page
      pages={[
        {
          title: "شخصي",
          link: "/",
        },
        {
          title: "🗂️ القوائم",
          link: "/user/lists",
        },
        {
          title: list ? "🗂️ " + list?.name : "-",
          link: "/user/lists/" + listId,
        },
      ]}
    >
      <div className="flex flex-col gap-4">
        {listData?.pages?.length && listData?.pages[0]?.data?.length ? (
          listData?.pages?.map((page) =>
            page?.data.map((dataItem) => (
              <DataItem key={dataItem.id} dataItem={dataItem} lists={lists} />
            )),
          )
        ) : isLoadingData ? (
          <>
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex h-14 w-full cursor-pointer gap-4 rounded-md  bg-gray-800 p-4 shadow-md transition-all hover:scale-105 active:scale-95"
                />
              ))}
          </>
        ) : (
          <div className="flex w-full grow items-center justify-center">
            <p className="text-center text-xl">لا توجد متاجر</p>
          </div>
        )}
        <div className="w-full" ref={buttonInView.ref}>
          <Button
            text={hasNextPage ? "حمل المزيد من المتاجر" : "وصلت للنهاية"}
            noStyles={hasNextPage ? false : true}
            loading={isFetchingNextPage}
            disabled={!hasNextPage}
            onClick={() => (hasNextPage ? handleFetchNextPage() : null)}
            className="w-full"
          />
        </div>
      </div>
    </Page>
  );
}
