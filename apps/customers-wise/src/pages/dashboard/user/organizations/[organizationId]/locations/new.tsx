import type { Location } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Button from "../../../../../../components/form/Button";
import TextInput from "../../../../../../components/form/TextInput";
import Page from "../../../../../../components/Page";
import { required } from "../../../../../../utils/formRules";
import { trpc } from "../../../../../../utils/trpc";

export default function NewLocation() {
  const router = useRouter();

  const { organizationId } = router.query;

  const { control, handleSubmit } = useForm<Location>();

  const { mutate: createLocation, isLoading: isCreatingLocation } =
    trpc.locations.create.useMutation();
  const { data: totalLocations } = trpc.locations.total.useQuery();
  const { data: organization, isLoading: isLoadingOrganization } =
    trpc.organizations.retrieve.useQuery(organizationId as string);
  // subscription
  const { data: subscription, isLoading: isLoadingSubscription } =
    trpc.stripe.subscription.useQuery({
      stripeSubscriptionId: organization?.stripeSubscriptionId as string,
    });

  const onSubmit = (values: Location) => {
    // if no subscription, or greater than subscription limit, return
    if (organization?.stripeSubscriptionStatus !== "active") {
      toast("يجب عليك الإشتراك في باقة لإضافة فروع", {
        icon: "🚫",
      });
      return;
    }
    if (
      totalLocations !== undefined &&
      subscription?.items?.data &&
      subscription?.items?.data.length > 0 &&
      subscription?.items?.data[0] &&
      subscription?.items?.data[0]?.quantity &&
      totalLocations >= subscription?.items?.data[0]?.quantity
    ) {
      toast("لقد وصلت إلى الحد الأقصى لعدد الفروع المسموح بها", {
        icon: "🚫",
      });
      toast("يمكنك تطوير باقتك لعدد أكبر من الفروع", {
        icon: "⬆️",
      });
      return;
    }

    createLocation(values, {
      onSuccess: () => router.back(),
    });
  };

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
          title: "📍 الفروع",
          link: `/dashboard/user/organizations/${organizationId}/locations`,
        },
        {
          title: "📍 إضافة فرع",
          link: `/dashboard/user/organizations/${organizationId}/locations`,
        },
      ]}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4 md:w-1/2"
      >
        <div className="flex w-full flex-col">
          <TextInput
            name="name"
            label="الإسم"
            placeholder="إسم الفرع"
            control={control}
            rules={{ required }}
          />
          <TextInput
            name="description"
            label="الوصف"
            placeholder="وصف للفرع"
            control={control}
          />
        </div>
        <Button
          text="إضافة"
          type="submit"
          className="w-full md:w-1/2"
          loading={isCreatingLocation}
        />
      </form>
    </Page>
  );
}
