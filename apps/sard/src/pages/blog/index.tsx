import { NextSeo } from "next-seo";
import Link from "next-multilingual/link";
import { useMessages } from "next-multilingual/messages";
import Head from "next-multilingual/head";

export default function Blog() {
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
