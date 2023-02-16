import { Button, Page, SelectInput, TextInput } from "@profits-gg/ui";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";
import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useContext } from "react";
import { LoginModalContext } from "../../../components/Layout";
import type Stripe from "stripe";
import type { List } from "@prisma/client";
import { Stage } from "@prisma/client";
import DataItem from "../../../components/DataItem";

export default function DateType() {
  const router = useRouter();
  const { dataType } = router.query;
  const { data: session, status: sessionStatus } = useSession();

  const { control, watch } = useForm({
    defaultValues: {
      search: "",
      maroofType: "all",
      inLists: "in",
      lists: [],
    },
  });

  const search = watch("search");
  const maroofType = watch("maroofType");
  const choosedLists = watch("lists");
  const inLists = watch("inLists");

  const { setLoginOpen } = useContext(LoginModalContext);

  const { data: user } = api.user.retrieve.useQuery();

  const {
    data,
    isLoading: isLoadingData,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    status,
    fetchNextPage,
  } = api.data.list.useInfiniteQuery(
    {
      limit: 10,
      search: search === "" ? undefined : search,
      type: dataType as "onlineStore" | "company",
      maroofType: maroofType === "all" ? undefined : +maroofType,
      lists: choosedLists?.length === 0 ? undefined : choosedLists,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    },
  );

  const { data: lists } = api.list.list.useQuery();
  // const { data: stages } = api.stage.list.useQuery();

  const { data: subscription } = api.stripe.subscription.useQuery();

  const handleFetchNextPage = () => {
    // check if user is logged in
    if (sessionStatus == "unauthenticated") {
      setLoginOpen?.(true);
      return;
    }

    const dataLength =
      data?.pages.reduce((acc, page) => acc + page.data.length, 0) || 0;

    if (
      session?.user.stripeSubscriptionStatus !== "active" &&
      dataLength > 10
    ) {
      toast("اشترك في أحد الباقات لزيادة حد ظهور البيانات", {
        icon: "🔒",
      });
      return;
    }

    // check if subscription high amount is reached
    const product = subscription?.price.product as Stripe.Product;
    if (!product) return;

    if ((user?.searchMax || 11) < dataLength) {
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
          title: "البيانات",
          link: "/",
        },
        {
          title: "☁️ المتاجر الإلكترونية",
          link: "/data/companies",
        },
      ]}
    >
      <form className="istems-center flex flex-wrap gap-4">
        <TextInput
          name="search"
          label="الإسم"
          control={control}
          className="w-full md:w-3/12"
        />
        <SelectInput
          name="maroofType"
          label="النوع"
          options={[
            { value: "all", label: "الكل" },
            { value: 14, label: "تسويق إلكتروني" },
            { value: 16, label: "تصوير" },
            { value: 23, label: "مطبخ ومخبوزات" },
            { value: 24, label: "حلول إلكترونية" },
            { value: 25, label: "خدمات أكاديمية" },
            { value: 26, label: "مستلزمات المرأة" },
            { value: 34, label: "تصميم طباعة" },
            { value: 35, label: "تخطيط مناسبات وحفلات" },
            { value: 39, label: "كوافير وتجميل" },
            { value: 41, label: "إلكترونيات واكسسوارات" },
            { value: 45, label: "أخرى" },
            { value: 47, label: "السيارات" },
            { value: 48, label: "العقارات" },
            { value: 49, label: "أثاث وديكور" },
            { value: 51, label: "الحرف والصناعات اليدوية" },
          ]}
          placeholder="اختر موقع"
          control={control}
          className="w-full md:w-3/12"
        />
        <SelectInput
          name="lists"
          label="القوائم"
          options={
            lists?.map((list) => ({
              value: list.id,
              label: list.name,
            })) || []
          }
          isMulti={true}
          placeholder="اختر قائمة"
          control={control}
          className="w-full md:w-3/12"
        />
      </form>
      <div className="flex flex-col gap-4">
        {data?.pages?.length && data?.pages[0]?.data?.length ? (
          data?.pages?.map((page) =>
            page?.data.map((dataItem) => (
              <DataItem
                key={dataItem.id}
                dataItem={dataItem}
                lists={lists as List[]}
                // stages={stages as Stage[]}
              />
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
