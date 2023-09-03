import { NextSeo } from "next-seo";
import Link from "next-multilingual/link";
import { useMessages } from "next-multilingual/messages";
import Head from "next-multilingual/head";

export default function SpecialPages() {
  const messages = useMessages();

  return (
    <>
      <Head>
        <title>{messages.format("title")}</title>
        <meta name="description" content={messages.format("description")} />
        <meta property="og:title" content={messages.format("title")} />
        <meta property="og:description" content={messages.format("description")} />
      </Head>

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
