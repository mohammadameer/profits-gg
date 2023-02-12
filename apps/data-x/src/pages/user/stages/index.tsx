import { GridCard, Page } from "@profits-gg/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";

export default function Stages() {
  const router = useRouter();

  const { data: stages } = api.stage.list.useQuery();

  return (
    <Page
      pages={[
        {
          title: "شخصي",
          link: "/",
        },
        {
          title: "🚦 المراحل",
          link: "/user/stages",
        },
      ]}
      buttons={[
        {
          text: "إنشاء مرحلة",
          onClick: () => router.push("/user/stages/create"),
        },
      ]}
    >
      <div className="grid w-full grid-cols-12 gap-4">
        {stages?.map((stage) => (
          <GridCard
            key={stage.id}
            title={stage.name}
            link={"/user/stages/" + stage.id}
          />
        ))}
      </div>
    </Page>
  );
}
