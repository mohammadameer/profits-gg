import { NextSeo } from "next-seo";
import Link from "next/link";

export default function Blog() {
  return (
    <>
      <NextSeo
        title="سرد - المدونة"
        description="مدونة موقع سرد"
        canonical="https://sard.dev/blog"
        openGraph={{
          url: "https://sard.dev/blog",
          title: "سرد - المدونة",
          description: "مدونة موقع سرد",
          siteName: "سرد",
        }}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">
        المدونة
      </h1>

      <div className="relative grid grid-cols-12 gap-4 p-6">
        <Link
          href="/blog/special-pages"
          className="col-span-full row-span-1 flex flex-col gap-2 rounded-md bg-white p-4 shadow-md md:col-span-4"
        >
          <p>📃</p>
          <p>الصفحات الخاصة</p>
        </Link>
      </div>
    </>
  );
}
