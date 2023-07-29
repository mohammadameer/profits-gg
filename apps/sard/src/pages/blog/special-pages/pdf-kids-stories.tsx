import { NextSeo } from "next-seo";
import Link from "next/link";

export default function PdfKidsStories() {
  return (
    <>
      <NextSeo
        title="سرد - قصص اطفال pdf"
        description="قصص اطفال pdf"
        canonical="https://sard.dev/blog/special-pages/pdf-stories"
        openGraph={{
          url: "https://sard.dev/blog/special-pages/pdf-stories",
          title: "سرد - قصص اطفال pdf",
          description: "قصص اطفال pdf",
          siteName: "سرد",
        }}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-6">
        قصص اطفال pdf
      </h1>

      <p className="p-6 py-4 pb-4 text-xl md:pb-14">
        مجموعة من قصص وكتب الأطفال التعليمة، القصيرة، المبسطة والمصورة، يمكن
        تحميلها كملفات PDF
      </p>

      <div className="relative grid grid-cols-12 grid-rows-6 gap-4 p-6">
        <Link
          href="/"
          className="text col-span-full rounded-lg bg-blue-500 px-6 py-4 text-center font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 md:col-span-4"
        >
          الذهاب للصفحة الرئيسية
        </Link>
      </div>
    </>
  );
}
