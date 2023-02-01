import { useRouter } from "next/router";
import Card from "../../../../../../../components/Card";
import PageLoading from "../../../../../../../components/loading/PageLoading";
import Page from "../../../../../../../components/Page";
import { trpc } from "../../../../../../../utils/trpc";

export default function Location() {
  const router = useRouter();
  const { locationId, organizationId } = router.query;

  const { data: location, isLoading: isLoadingLocation } =
    trpc.locations.retrieve.useQuery({ locationId: locationId as string });

  const { data: organization, isLoading: isLoadingOrganization } =
    trpc.organizations.retrieve.useQuery(organizationId as string);

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
          title: location ? `📍 ${location.name}` : "...",
          link: "/dashboard/locations/" + locationId,
        },
      ]}
      isLoading={isLoadingLocation}
      loadingComponent={PageLoading}
    >
      <div className="grid w-full grid-cols-12 gap-4">
        {/* <Card
          title="بيانات الفرع"
          link={`/dashboard/locations/${location?.id}/edit`}
        /> */}
        {/* <Card
          title="🔗 الروابط"
          link={`/dashboard/locations/${location?.id}/links`}
        /> */}
      </div>
    </Page>
  );
}
