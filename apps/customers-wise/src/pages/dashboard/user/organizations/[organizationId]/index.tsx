import { useRouter } from "next/router";
import PageLoading from "../../../../../components/loading/PageLoading";
import Page from "../../../../../components/Page";
import { trpc } from "../../../../../utils/trpc";

export default function Organization() {
  const router = useRouter();
  const { organizationId } = router.query;

  const pages = [
    // {
    //   title: "📝 بيانات المؤسسة",
    //   link: `/dashboard/user/organizations/${organizationId}/details`,
    // },
    {
      title: "📍 الفروع",
      link: `/dashboard/user/organizations/${organizationId}/locations`,
    },
    {
      title: "💰 اشتراكي",
      link: `/dashboard/user/organizations/${organizationId}/subscription`,
    },
  ];

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
      ]}
      isLoading={isLoadingOrganization}
      loadingComponent={PageLoading}
    >
      <div className="grid w-full grid-cols-12 gap-4">
        {pages.map((page) => (
          <div
            key={page.title}
            className="col-span-full h-48 cursor-pointer rounded-lg bg-white p-4 transition-all hover:scale-105 active:scale-95 md:col-span-4"
            onClick={() => router.push(page.link)}
          >
            <p className="select-none text-xl text-black/80">{page.title}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}
