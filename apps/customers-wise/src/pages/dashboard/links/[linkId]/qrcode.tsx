import { useRouter } from "next/router";
import { useRef } from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/form/Button";
import Page from "../../../../components/Page";
import { env } from "../../../../env/client.mjs";
import { trpc } from "../../../../utils/trpc";

export default function LocationLinkQRCode() {
  const pageRef = useRef(null);
  const qrCodeRef = useRef(null);

  const printPage = useReactToPrint({
    content: () => pageRef.current,
  });
  const printQRCode = useReactToPrint({
    content: () => qrCodeRef.current,
  });

  const router = useRouter();

  const { linkId } = router.query;
  const { data: link } = trpc.links.retrieve.useQuery({
    linkId: linkId as string,
  });

  return (
    <Page
      pages={[
        { title: "🔗 روابط المراجعات", link: "/dashboard/links" },
        {
          title: link ? `🔗 ${link?.name}` : "...",
          link: "/dashboard/links/" + linkId,
        },
        {
          title: "📲 رمز الاستجابة السريعة",
          link: "/dashboard/links/" + linkId + "/qrcode",
        },
      ]}
    >
      <div className="flex w-full flex-col gap-4 ">
        <div
          className="flex w-full flex-col gap-8 rounded-md bg-white p-12"
          ref={pageRef}
        >
          <div
            className="flex h-96 flex-col items-center justify-center print:pt-10 print:pb-20"
            ref={qrCodeRef}
          >
            <QRCode
              value={`${env.NEXT_PUBLIC_URL}/customer-review/${link?.id}`}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
        </div>
        {/* <Button
          text="طباعة الصفحة كاملة"
          className="w-full md:w-1/2"
          onClick={printPage}
        /> */}
        <Button
          text="طباعة رمز الـ QR Code"
          className="w-full md:w-1/2"
          onClick={printQRCode}
        />
      </div>
    </Page>
  );
}
