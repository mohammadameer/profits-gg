import Link from "next-multilingual/link";
import { useMessages } from "next-multilingual/messages";
import SEO from "~/components/SEO";
import { useGetLocalizedUrl } from "next-multilingual/url";
import { useRouter } from "next-multilingual/router";

export default function SpecialPages() {
  const router = useRouter();
  const messages = useMessages();

  const { getLocalizedUrl } = useGetLocalizedUrl();

  return (
    <>
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(`/special-pages`, router.locale, undefined, true)}
        keywords={[messages.format("title"), messages.format("description")]}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">{messages.format("title")}</h1>

      <div className="relative grid grid-cols-12 grid-rows-6 gap-4 p-6">
        <Link
          href="/blog/special-pages/stories-categories"
          className="col-span-full row-span-2 flex flex-col gap-2 rounded-md bg-white p-4 shadow-md md:col-span-4">
          <p>？</p>
          <p>{messages.format("categories")}</p>
        </Link>
        <Link
          href="/blog/special-pages/stories-for-kids-in-pdf"
          className="col-span-full row-span-2 flex flex-col gap-2 rounded-md bg-white p-4 shadow-md md:col-span-4">
          <p>📂</p>
          <p>{messages.format("pdfKidsStories")}</p>
        </Link>
      </div>
    </>
  );
}
