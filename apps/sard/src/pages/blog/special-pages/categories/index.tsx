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
        canonical="https://sard.dev/blog/special-pages/categories"
        openGraph={{
          url: "https://sard.dev/blog/special-pages/categories",
          title: "سرد - مواضيع القصص في الموقع",
          description: "جميع مواضيع القصص في موقع سرد",
          siteName: "سرد",
        }}
      />
      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">
        جميع المواضيع في موقع سرد
      </h1>
      <div className="grid grid-cols-12 gap-4 p-6 pb-4 md:w-full">
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
    </>
  );
}
