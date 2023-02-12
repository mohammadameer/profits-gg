import { Page } from "@profits-gg/ui";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";

export default function Stage() {
  const router = useRouter();
  const { stageId } = router.query;

  const { data: stage } = api.stage.retrieve.useQuery({
    stageId: stageId as string,
  });

  const { data: stageData } = api.stage.data.useQuery({
    stageId: stageId as string,
  });

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
        {
          title: stage ? "🚦 " + stage?.name : "-",
          link: "/user/stages/" + stageId,
        },
      ]}
    >
      <div className="flex flex-col gap-4">
        {stageData?.map((dataItem) => (
          <div
            key={dataItem.id}
            className="flex w-full cursor-pointer gap-4 rounded-md  bg-gray-800 p-4 shadow-md transition-all hover:scale-105 active:scale-95"
          >
            {dataItem.nameAr}
          </div>
        ))}
      </div>
    </Page>
  );
}
