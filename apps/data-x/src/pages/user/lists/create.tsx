import type { List } from "@prisma/client";
import { required } from "@profits-gg/lib/utils/formRules";
import { Button, Page, TextInput } from "@profits-gg/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { api } from "../../../utils/api";
import type Stripe from "stripe";
import { toast } from "react-hot-toast";

export default function NewLink() {
  const router = useRouter();
  const { data: session } = useSession();
  const { control, handleSubmit } = useForm<List>();

  const { data: subscription } = api.stripe.subscription.useQuery();

  const { mutate: createList, isLoading: isCreatingList } =
    api.list.create.useMutation();

  const onSubmit = async (data: List) => {
    if (session?.user.stripeSubscriptionStatus === "active") {
      const product = subscription?.price.product as Stripe.Product;

      if (product.name == "basic") return;

      createList(
        {
          name: data.name as string,
          description: data.description as string,
        },
        {
          onSuccess: () => {
            router.push(`/user/lists`);
          },
        },
      );
    } else {
      toast("متوفرة للإشتراك المفضل والشركات", {
        icon: "🔒",
      });
    }
  };

  return (
    <Page
      title="🔗 رابط جديد"
      pages={[
        { title: "شخصي", link: "/" },
        {
          title: "🗂️ القوائم",
          link: "/dashboard/lists",
        },
        {
          title: "🗂️ قائمة جديدة",
          link: "/dashboard/locations/create",
        },
      ]}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4 md:w-1/2"
      >
        <TextInput
          name="name"
          label="الإسم"
          placeholder="إسم الرابط"
          control={control}
          rules={{ required }}
        />
        <TextInput
          name="description"
          label="الوصف"
          placeholder="وصف للرابط"
          control={control}
        />
        <Button
          text="إضافة"
          type="submit"
          className="w-full md:w-1/2"
          loading={isCreatingList}
        />
      </form>
    </Page>
  );
}
