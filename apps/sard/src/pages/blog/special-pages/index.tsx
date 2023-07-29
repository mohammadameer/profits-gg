import { NextSeo } from "next-seo";
import Link from "next/link";

export default function SpecialPages() {
  return (
    <>
      <NextSeo
        title="سرد - الصفحات الخاصة"
        description="صفحات خاصة تستهدف الباحثين عن مواضيع متعلقة بسرد وحلولها"
        canonical="https://sard.dev/blog/special-pages"
        openGraph={{
          url: "https://sard.dev/blog/special-pages",
          title: "سرد - الصفحات الخاصة",
          description:
            "صفحات خاصة تستهدف الباحثين عن مواضيع متعلقة بسرد وحلولها",
          siteName: "سرد",
        }}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">
        الصفحات الخاصة
      </h1>

      <div className="relative grid grid-cols-12 grid-rows-6 gap-4 p-6">
        <Link
          href="/blog/special-pages/categories"
          className="col-span-full row-span-2 flex flex-col gap-2 rounded-md bg-white p-4 shadow-md md:col-span-4"
        >
          <p>？</p>
          <p>مواضيع القصص في سرد</p>
        </Link>
        <Link
          href="/blog/special-pages/pdf-kids-stories"
          className="col-span-full row-span-2 flex flex-col gap-2 rounded-md bg-white p-4 shadow-md md:col-span-4"
        >
          <p>📂</p>
          <p>قصص اطفال pdf</p>
        </Link>
      </div>
    </>
  );
}
