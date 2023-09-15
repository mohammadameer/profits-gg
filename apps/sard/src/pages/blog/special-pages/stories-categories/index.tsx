import clsx from "clsx";
import Link from "next-multilingual/link";
import categories, { Category, type StaticCategory } from "~/utils/categories";
import { useMessages } from "next-multilingual/messages";
import { useRouter } from "next-multilingual/router";
import { getStaticPropsLocales } from "next-multilingual";
import { type GetStaticProps } from "next";
import SEO from "~/components/SEO";
import { useGetLocalizedUrl } from "next-multilingual/url";

export default function Categories({ categories }: { categories: StaticCategory[] }) {
  const router = useRouter();
  const { getLocalizedUrl } = useGetLocalizedUrl();

  const messages = useMessages();
  return (
    <>
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(`/blog/special-pages/stories-categories`, router.locale, undefined, true)}
        keywords={[messages.format("title"), messages.format("description")]}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">{messages.format("title")}</h1>
      <div className="grid grid-cols-12 gap-4 p-6 pb-4 md:w-full">
        {categories.map((category) => (
          <Link
            key={category.value}
            className={clsx(
              "category col-span-6 flex cursor-pointer select-none flex-col rounded-md border-4 border-transparent bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 md:col-span-3"
            )}
            href={`/blog/special-pages/stories-categories/${encodeURIComponent(category.label)}`}>
            <p className="text-4xl">{category.emoji}</p>
            <p className="text text-xl font-bold text-gray-900">
              {messages.format("storyAbout")} {category.label}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { locale } = getStaticPropsLocales(context);

  return {
    props: {
      categories: categories.map((category) => ({
        ...category,
        label: category.label[locale as keyof typeof category.label],
      })),
    },
  };
};
