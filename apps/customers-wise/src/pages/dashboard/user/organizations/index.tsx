import { useRouter } from "next/router";
import PageLoading from "../../../../components/loading/PageLoading";
import Page from "../../../../components/Page";
import { trpc } from "../../../../utils/trpc";

export default function Organizations() {
  const router = useRouter();

  const { data: organizations, isLoading: isLoadingOrganizations } =
    trpc.organizations.list.useQuery();

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
      ]}
      isLoading={isLoadingOrganizations}
      loadingComponent={PageLoading}
      buttons={[
        {
          text: "إضافة مؤسسة",
          onClick: () => router.push("/dashboard/user/organizations/new"),
        },
      ]}
    >
      <div className="grid w-full grid-cols-12 gap-4">
        {organizations?.map((organization) => (
          <div
            key={organization.id}
            className="col-span-full h-48 cursor-pointer rounded-lg bg-white p-4 transition-all hover:scale-105 active:scale-95 md:col-span-4"
            onClick={() =>
              router.push("/dashboard/user/organizations/" + organization.id)
            }
          >
            <p className="select-none text-xl text-black/80">
              {organization.name}
            </p>
          </div>
        ))}
      </div>
    </Page>
  );
}
