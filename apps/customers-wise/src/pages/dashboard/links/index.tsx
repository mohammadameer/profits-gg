import { useRouter } from "next/router";
import Card from "../../../components/Card";
import PageLoading from "../../../components/loading/PageLoading";
import Page from "../../../components/Page";
import { trpc } from "../../../utils/trpc";

export default function LocationLinks() {
  const router = useRouter();
  const { data: links, isLoading: isLoadingLinks } = trpc.links.list.useQuery();

  return (
    <Page
      pages={[{ title: "🔗 روابط المراجعات", link: "/dashboard/links" }]}
      buttons={[
        {
          text: "إضافة رابط",
          onClick: () => router.push(`/dashboard/links/new`),
        },
      ]}
      isLoading={isLoadingLinks}
      loadingComponent={PageLoading}
    >
      <div className="grid w-full grid-cols-12 gap-4">
        {links?.map((link) => (
          <Card
            key={link.id}
            title={link.name}
            link={`/dashboard/links/${link.id}`}
          />
        ))}
      </div>
    </Page>
  );
}
