import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import PageLoading from "../../../../components/loading/PageLoading";
import Page from "../../../../components/Page";
import { trpc } from "../../../../utils/trpc";

export default function LocationLink() {
  const router = useRouter();
  const { linkId } = router.query;

  const { data: link, isLoading: isLoadingLink } = trpc.links.retrieve.useQuery(
    { linkId: linkId as string }
  );

  return (
    <Page
      pages={[
        { title: "🔗 روابط المراجعات", link: "/dashboard/links" },
        {
          title: link ? `🔗 ${link?.name}` : "...",
          link: "/dashboard/links/" + linkId,
        },
      ]}
      isLoading={isLoadingLink}
      loadingComponent={PageLoading}
    >
      <div className="grid w-full grid-cols-12 gap-4">
        <div
          className="col-span-12 flex h-16 transform cursor-pointer items-center justify-center gap-4 rounded-md bg-white p-4 shadow-md transition duration-300 ease-in-out hover:scale-105 active:scale-95"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                process.env.NEXT_PUBLIC_URL + "/customer-review/" + linkId
              );
              toast("تم نسخ الرابط بنجاح", {
                icon: "✅",
              });
            } catch (err) {
              console.error("Failed to copy: ", err);
            }
          }}
        >
          <p className="text-2xl">📑</p>
          <p className="cursor-default rounded-lg bg-gray-700 p-2">
            {process.env.NEXT_PUBLIC_URL}/customer-review/{linkId}
          </p>
        </div>
        <div
          onClick={() => router.push(`/dashboard/links/${linkId}/qrcode`)}
          className="col-span-12 h-48 transform cursor-pointer rounded-md bg-white p-4 shadow-md transition duration-300 ease-in-out hover:scale-105 active:scale-95 md:col-span-4"
        >
          <div className="flex items-center gap-2">
            <p className="select-none text-xl text-black/80">
              📲 رمز الـ QR Code
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
}
