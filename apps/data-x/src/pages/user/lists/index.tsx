import { GridCard, Page } from "@profits-gg/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";
import type Stripe from "stripe";
import { toast } from "react-hot-toast";

export default function Lists() {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: subscription } = api.stripe.subscription.useQuery();

  const { data: lists } = api.list.list.useQuery();

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
      ]}
      buttons={[
        {
          text: "إنشاء قائمة",
          onClick: () => {
            if (session?.user.stripeSubscriptionStatus === "active") {
              const product = subscription?.price.product as Stripe.Product;

              if (product.name == "basic") return;

              router.push("/user/lists/create");
            } else {
              toast("متوفرة للإشتراك المفضل والشركات", {
                icon: "🔒",
              });
            }
          },
        },
      ]}
    >
      <div className="grid w-full grid-cols-12 gap-4">
        {lists?.map((list) => (
          <GridCard
            key={list.id}
            title={list.name}
            link={"/user/lists/" + list.id}
          />
        ))}
      </div>
    </Page>
  );
}
