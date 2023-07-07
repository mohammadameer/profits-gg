import clsx from "clsx";
import { NextSeo } from "next-seo";
import Link from "next/link";
import categories from "~/utils/categories";

export default function Categories() {
  return (
    <>
      <NextSeo
        title="سرد - مواضيع القصص في الموقع"
        description="جميع مواضيع القصص في موقع سرد"
        canonical="https://sard.dev/"
        openGraph={{
          url: "https://sard.dev/",
          title: "سرد - مواضيع القصص في الموقع",
          description: "جميع مواضيع القصص في موقع سرد",
          siteName: "سرد",
        }}
      />
      <div className="p-6">
        <h1 className="text-4xl font-bold">جميع المواضيع في موقع سرد</h1>
        <div className="mt-12 grid grid-cols-12 gap-4 pb-4 md:w-full">
          {categories.map((category) => (
            <Link
              key={category.value}
              className={clsx(
                "category col-span-6 flex cursor-pointer select-none flex-col rounded-md border-4 border-transparent bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 md:col-span-3"
              )}
              href={`/categories/${category.value}`}
            >
              <p className="text-4xl">{category.emoji}</p>
              <p className="text text-xl font-bold text-gray-900">
                قصص عن {category.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
