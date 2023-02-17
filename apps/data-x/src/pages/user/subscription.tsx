import { Button, Page, SwitchInput } from "@profits-gg/ui";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import type Stripe from "stripe";
import { api } from "../../utils/api";

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
      "عدد لا محدود من مشاهدة البيانات",
      "عدد لا محدود من حفظ البيانات في القوائم",
      "500 كحد أعلى شهري لاستخراج البيانات",
      "1000 كحد أعلى شهري لنتائج البحث",
    ],
  },
  preferred: {
    index: 2,
    tier: "preferred",
    name: "2️⃣ الباقة المفضلة",
    features: [
      "عدد لا محدود من مشاهدة البيانات",
      "عدد لا محدود من حفظ البيانات في القوائم",
      "2500 كحد أعلى شهري لاستخراج البيانات",
      "5000 كحد أعلى شهري لنتائج البحث",
      "إنشاء قوائم خاصة",
    ],
  },
  enterprise: {
    index: 3,
    tier: "enterprise",
    name: "3️⃣ باقة الشركات",
    features: [
      "عدد لا محدود من مشاهدة البيانات",
      "عدد لا محدود من حفظ البيانات في القوائم",
      "5000 كحد أعلى شهري لاستخراج البيانات",
      "10000 كحد أعلى شهري لنتائج البحث",
      "إنشاء قوائم خاصة",
      "وصول لل API",
    ],
  },
};

export default function OrganizationSubscription() {
  const router = useRouter();
  const { success, error } = router.query;

  const { data: session } = useSession();

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      yearly: false,
    },
  });

  const yearly = watch("yearly");

  const [selectedTier, setSelectedTier] = useState<Product>();

  const selectedPrice = selectedTier?.prices?.find(
    (price) => price.recurring?.interval === (yearly ? "year" : "month"),
  );

  const { data: stripeProducts } = api.stripe.products.useQuery();
  const { data: stripePrices } = api.stripe.prices.useQuery();
  const { isFetching: isGettingSessionUrl, refetch: getSessionUrl } =
    api.stripe.getSession.useQuery(
      {
        price: selectedPrice?.id as string,
      },
      {
        enabled: false,
        refetchOnWindowFocus: false,
        onSuccess: (sessionUrl) => {
          window.location.href = sessionUrl;
        },
      },
    );
  const { data: subscription } = api.stripe.subscription.useQuery();

  const [products, setProducts] = useState<Product[]>();

  const onSubmit = async () => {
    if (selectedPrice?.id) getSessionUrl({});
  };

  useEffect(() => {
    if (stripeProducts && stripePrices) {
      const products = stripeProducts?.data
        ?.map((product) => ({
          ...product,
          ...tiers[product.name as keyof typeof tiers],
          prices: stripePrices?.data?.filter(
            (price) => price.product === product.id,
          ),
        }))
        .sort((a, b) => a.index - b.index);

      setProducts(products);
      setSelectedTier(products[0]);
    }
  }, [stripeProducts, stripePrices]);

  // set default values if user has a subscription
  useEffect(() => {
    if (products && subscription?.quantity) {
      setValue("yearly", subscription?.price?.recurring?.interval === "year");
      setSelectedTier(
        products?.find(
          (product) =>
            product.prices?.find(
              (price) => price.id === subscription?.price?.id,
            )?.id === subscription?.price?.id,
        ),
      );
    }
  }, [subscription, products]);

  useEffect(() => {
    if (error) {
      toast("خطأ في دفع الإشتراك", {
        icon: "🚨",
      });
    }

    if (success) {
      toast("تم دفع الإشتراك بنجاح", {
        icon: "🎉",
      });
    }
  }, [error, success]);

  const subscriptionIsActive =
    session?.user.stripeSubscriptionStatus === "active";

  return (
    <Page
      pages={[
        {
          title: "شخصي",
          link: "/",
        },
        {
          title: "📦 الاشتراك",
          link: `/user/subscription`,
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
            <p>سنوي مع خصم ٢٠٪</p>
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
                    subscription?.price.id ==
                      product.prices.find(
                        (price) =>
                          price.recurring?.interval ===
                          (yearly ? "year" : "month"),
                      )?.id && "border-white",
                  )}
                  onClick={() =>
                    subscriptionIsActive ? null : setSelectedTier(product)
                  }
                >
                  <p className="text-xl">{product.name}</p>
                  <div className="flex flex-col gap-2">
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
                            (yearly ? "year" : "month"),
                        )?.unit_amount ?? 0) / 100
                      : "-"}{" "}
                    ر.س / {yearly ? "سنة" : "شهر"}
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
                    className="flex w-full animate-pulse cursor-pointer flex-col gap-4 rounded-lg border-4 border-gray-700 bg-gray-700 p-4 hover:scale-105 active:scale-95 lg:w-1/3"
                  />
                ))}
            </>
          )}
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
                        (price) => price.id === subscription?.price?.id,
                      )?.id === subscription?.price?.id,
                  )?.name
                }
              </span>{" "}
              بمجموع{" "}
              <span className="font-bold">
                {((subscription?.price?.unit_amount ?? 0) *
                  (subscription?.quantity ?? 0)) /
                  100}
              </span>{" "}
              ر.س تدفع {yearly ? "سنوياً" : "شهرياً"}
            </h2>
            {/* <h3>
              نهاية الإشتراك{" "}
              <span className="font-bold">
                {subscription?.current_period_end
                  ? new Date(
                      subscription?.current_period_end * 1000,
                    ).toLocaleDateString("ar-EG")
                  : "-"}
              </span>
            </h3> */}
          </>
        ) : (
          <>
            <Button
              text="دفع"
              className="mt-8 w-full md:w-1/2"
              type="submit"
              disabled={!selectedPrice?.id}
              loading={isGettingSessionUrl}
            />
          </>
        )}
      </form>
    </Page>
  );
}
