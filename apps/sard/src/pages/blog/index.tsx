import Link from "next-multilingual/link";
import { useMessages } from "next-multilingual/messages";
import { useRouter } from "next-multilingual/router";
import { useGetLocalizedUrl } from "next-multilingual/url";
import SEO from "~/components/SEO";

export default function Blog() {
  const router = useRouter();
  const { getLocalizedUrl } = useGetLocalizedUrl();

  const messages = useMessages();
  return (
    <>
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(`/blog`, router.locale, undefined, true)}
        keywords={[messages.format("title"), messages.format("description")]}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">{messages.format("title")}</h1>

      <div className="relative grid grid-cols-12 gap-4 p-6">
        <Link
          href="/blog/special-pages"
          className="col-span-full row-span-1 flex flex-col gap-2 rounded-md bg-white p-4 shadow-md md:col-span-4">
          <p>📃</p>
          <p>{messages.format("specialPages")}</p>
        </Link>
      </div>
    </>
  );
}
