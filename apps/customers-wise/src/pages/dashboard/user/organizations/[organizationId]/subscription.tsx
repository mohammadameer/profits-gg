import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type Stripe from "stripe";
import Button from "../../../../../components/form/Button";
import SliderInput from "../../../../../components/form/Slider";
import SwitchInput from "../../../../../components/form/SwitchInput";
import Page from "../../../../../components/Page";
import { trpc } from "../../../../../utils/trpc";

type Tier = {
  index: number;
  name: string;
  tier: string;
  features: string[];
};

type Product = Tier & Stripe.Product & { prices: Stripe.Price[] };

const tiers = {
  basic: {
    index: 1,
    name: "1️⃣ الباقة الأساسية",
    tier: "basic",
    features: [
      "حساب واحد لكل الفروع",
      "عدد لا محدود من الروابط",
      "عدد لا محدود من المراجعات",
    ],
  },
  preferred: {
    index: 2,
    tier: "preferred",
    name: "2️⃣ الباقة المفضلة",
    features: [
      "٣ حسابات لكل الفروع",
      "عدد لا محدود من الروابط",
      "عدد لا محدود من المراجعات",
      "تقارير يومية، شهرية وسنوية",
      "ردود تلقائية",
      //   "المراجعات من الإنترنت، قوقل، بوكنق، تريب ادفايزر ...",
      "مجتمع متخصص",
    ],
  },
  enterprise: {
    index: 3,
    tier: "enterprise",
    name: "3️⃣ باقة الشركات",
    features: [
      "١٠ حسابات لكل الفروع",
      "عدد لا محدود من الروابط",
      "عدد لا محدود من المراجعات",
      "تقارير يومية، شهرية وسنوية",
      "ردود تلقائية",
      "مجتمع متخصص",
      //   "المراجعات من الإنترنت، قوقل، بوكنق، تريب ادفايزر ...",
      "وصول للـ API",
    ],
  },
};

export default function OrganizationSubscription() {
  const router = useRouter();
  const { organizationId } = router.query;

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      numberOfBranchs: [0],
      yearly: false,
    },
  });

  const yearly = watch("yearly");
  const numberOfBranchs: number[] = watch("numberOfBranchs");

  const [selectedTier, setSelectedTier] = useState<Product>();

  const selectedPrice = selectedTier?.prices?.find(
    (price) => price.recurring?.interval === (yearly ? "year" : "month")
  );

  const { data: stripeProducts } = trpc.stripe.products.useQuery();
  const { data: stripePrices } = trpc.stripe.prices.useQuery();
  const { data: organization, isLoading: isLoadingOrganization } =
    trpc.organizations.retrieve.useQuery(organizationId as string);
  const { isFetching: isGettingSessionUrl, refetch: getSessionUrl } =
    trpc.stripe.getSession.useQuery(
      {
        price: selectedPrice?.id as string,
        numberOfBranchs: (numberOfBranchs ? numberOfBranchs[0] : 0) as number,
        organizationId: organizationId as string,
        stripeCustomerId: organization?.stripeCustomerId as string,
      },
      {
        enabled: false,
        refetchOnWindowFocus: false,
        onSuccess: (sessionUrl) => window.open(sessionUrl, "_self"),
      }
    );
  const { data: subscription } = trpc.stripe.subscription.useQuery({
    stripeSubscriptionId: organization?.stripeSubscriptionId as string,
  });

  const [products, setProducts] = useState<Product[]>();

  const onSubmit = async () => {
    if (numberOfBranchs[0] !== 0 && selectedPrice?.id) getSessionUrl({});
  };

  useEffect(() => {
    if (stripeProducts && stripePrices) {
      const products = stripeProducts?.data
        ?.map((product) => ({
          ...product,
          ...tiers[product.name as keyof typeof tiers],
          prices: stripePrices?.data?.filter(
            (price) => price.product === product.id
          ),
        }))
        .sort((a, b) => a.index - b.index);

      setProducts(products);
      setSelectedTier(products[0]);
    }
  }, [stripeProducts, stripePrices]);

  // set default values if user has a subscription
  useEffect(() => {
    if (
      products &&
      subscription?.items?.data?.length &&
      subscription?.items?.data?.length > 0 &&
      subscription?.items?.data[0]?.quantity
    ) {
      setValue("numberOfBranchs", [
        subscription?.items?.data[0]?.quantity as number,
      ]);
      setValue(
        "yearly",
        subscription?.items?.data[0]?.price?.recurring?.interval === "year"
      );
      setSelectedTier(
        products?.find(
          (product) =>
            product.prices?.find(
              (price) => price.id === subscription?.items?.data[0]?.price?.id
            )?.id === subscription?.items?.data[0]?.price?.id
        )
      );
    }
  }, [subscription, products]);

  const subscriptionIsActive = subscription?.status === "active";

  return (
    <Page
      pages={[
        {
          title: "👤 حسابي",
          link: "/dashboard/user",
        },
        {
          title: "🏬 مؤسساتي",
          link: "/dashboard/user/organizations",
        },
        {
          title: organization?.name ?? "...",
          link: `/dashboard/user/organizations/${organizationId}`,
        },
        {
          title: "💰 الاشتراك",
          link: `/dashboard/user/organizations/${organizationId}/subscription`,
        },
      ]}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <p>شهري</p>
            <SwitchInput
              name="yearly"
              control={control}
              disabled={subscriptionIsActive}
            />
            <p>سنوي مع خصم ٢٠٪ واسترجاع خلال ٦٠ يوم</p>
          </div>
        </div>
        <h1 className="text-xl">الباقات</h1>

        <div className="flex flex-col items-end gap-4 lg:flex-row">
          {products && products?.length > 0 ? (
            products?.map((product) => {
              return (
                <div
                  key={product.id}
                  className={clsx(
                    `flex w-full cursor-pointer flex-col gap-4 rounded-lg border-4 bg-gray-700 p-4 hover:scale-105 active:scale-95 lg:w-1/3 ${
                      selectedTier?.tier === product.tier
                        ? "border-gray-600"
                        : "border-gray-700"
                    }`,
                    subscription?.items.data[0]?.price.id ==
                      product.prices.find(
                        (price) =>
                          price.recurring?.interval ===
                          (yearly ? "year" : "month")
                      )?.id && "border-white"
                  )}
                  onClick={() =>
                    subscriptionIsActive ? null : setSelectedTier(product)
                  }
                >
                  <p className="text-xl">{product.name}</p>
                  <div>
                    {product?.features?.map((feature) => (
                      <p key={feature.slice(0, 5)} className="text">
                        - {feature}
                      </p>
                    ))}
                  </div>
                  <p className="text-xl font-bold">
                    {product?.prices.length > 0
                      ? (product?.prices?.find(
                          (price) =>
                            price.recurring?.interval ===
                            (yearly ? "year" : "month")
                        )?.unit_amount ?? 0) / 100
                      : "-"}{" "}
                    ر.س / منتج أو فرع / {yearly ? "سنة" : "شهر"}
                  </p>
                </div>
              );
            })
          ) : (
            <>
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    style={{
                      height: (index + 1.8) * 60,
                    }}
                    className={`flex w-full animate-pulse cursor-pointer flex-col gap-4 rounded-lg border-4 border-gray-700 bg-gray-700 p-4 hover:scale-105 active:scale-95 lg:w-1/3`}
                  ></div>
                ))}
            </>
          )}
        </div>

        <h1 className="text-xl">عدد المنتجات أو الفروع</h1>

        <div className="flex items-center gap-4 text-xl">
          <p>0</p>
          <SliderInput
            name="numberOfBranchs"
            control={control}
            max={50}
            disabled={subscriptionIsActive}
          />
          <p>+50</p>
        </div>

        {/* your subscription */}
        {subscriptionIsActive ? (
          <>
            <h2 className="mt-4 text-lg">
              أنت مشترك حالياً بالبـ{" "}
              <span className="font-bold">
                {
                  products?.find(
                    (product) =>
                      product.prices?.find(
                        (price) =>
                          price.id === subscription?.items?.data[0]?.price?.id
                      )?.id === subscription?.items?.data[0]?.price?.id
                  )?.name
                }
              </span>{" "}
              بمجموع{" "}
              <span className="font-bold">
                {((subscription?.items?.data[0]?.price?.unit_amount ?? 0) *
                  (subscription?.items?.data[0]?.quantity ?? 0)) /
                  100}
              </span>{" "}
              ر.س تدفع {yearly ? "سنوياً" : "شهرياً"}
            </h2>
            <h3>
              عدد الفروع{" "}
              <span className="font-bold">
                {subscription?.items?.data[0]?.quantity}
              </span>{" "}
              و نهاية الإشتراك{" "}
              <span className="font-bold">
                {subscription?.current_period_end
                  ? new Date(
                      subscription?.current_period_end * 1000
                    ).toLocaleDateString("ar-EG")
                  : "-"}
              </span>
            </h3>
          </>
        ) : (
          <>
            <h2 className="mt-4 text-lg">
              السعر النهائي: {numberOfBranchs[0] == 50 ? "+" : ""}
              {numberOfBranchs[0] || 0} *{" "}
              {(selectedPrice?.unit_amount || 0) / 100} ر.س ={" "}
              {((selectedPrice?.unit_amount ?? 0) / 100) *
                (numberOfBranchs[0] || 0)}{" "}
              ر.س
            </h2>

            <Button
              text="دفع"
              className="mt-8 w-full md:w-1/2"
              type="submit"
              disabled={numberOfBranchs[0] === 0 || !selectedPrice?.id}
              loading={isGettingSessionUrl}
            />
          </>
        )}
      </form>
    </Page>
  );
}
