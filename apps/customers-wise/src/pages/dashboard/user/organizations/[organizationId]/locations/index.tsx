import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Card from "../../../../../../components/Card";
import PageLoading from "../../../../../../components/loading/PageLoading";
import SubscriptionNotActiveLocations from "../../../../../../components/notActive/SubscriptionNotActiveLocations";
import Page from "../../../../../../components/Page";
import { trpc } from "../../../../../../utils/trpc";

export default function Locations() {
  const router = useRouter();

  const { organizationId } = router.query;

  const { data: session } = trpc.auth.getSession.useQuery();

  const { data: organization, isLoading: isLoadingOrganization } =
    trpc.organizations.retrieve.useQuery(organizationId as string);

  const { data: locations, isLoading: isLoadingLocatioons } =
    trpc.locations.list.useQuery();

  if (session?.user?.organization?.stripeSubscriptionStatus !== "active")
    return <SubscriptionNotActiveLocations />;

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
      ]}
      buttons={[
        {
          text: "إضافة فرع",
          onClick: () =>
            router.push(
              `/dashboard/user/organizations/${organizationId}/locations/new`
            ),
        },
      ]}
      isLoading={isLoadingLocatioons || isLoadingOrganization}
      loadingComponent={PageLoading}
    >
      {locations?.length ?? 0 > 0 ? (
        <div className="grid w-full grid-cols-12 gap-4">
          {locations?.map((location) => (
            <Card
              key={location.id}
              title={"📍 " + location.name}
              link={
                `/dashboard/user/organizations/${organizationId}/locations/` +
                location.id
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex w-full grow items-center justify-center">
          <p>لا يوجد لديك فروع حتى الآن، اضف فرعك الأول بالضغط على إضافة فرع</p>
        </div>
      )}
    </Page>
  );
}
