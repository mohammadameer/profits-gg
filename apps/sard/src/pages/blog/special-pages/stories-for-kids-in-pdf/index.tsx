import { NextSeo } from "next-seo";
import Link from "next-multilingual/link";
import { useMessages } from "next-multilingual/messages";
import Head from "next-multilingual/head";

export default function PdfKidsStories() {
  const messages = useMessages();
  return (
    <>
      <Head>
        <title>{messages.format("title")}</title>
        <meta name="description" content={messages.format("description")} />
        <meta property="og:title" content={messages.format("title")} />
        <meta property="og:description" content={messages.format("description")} />
      </Head>

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-6">{messages.format("title")}</h1>

      <p className="p-6 py-4 pb-4 text-xl md:pb-14">{messages.format("description")}</p>

      <div className="relative grid grid-cols-12 grid-rows-6 gap-4 p-6">
        <Link
          href="/short-learning-stories-for-childrens"
          className="text col-span-full rounded-lg bg-blue-500 px-6 py-4 text-center font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 md:col-span-4">
          {messages.format("mainPage")}
        </Link>
      </div>
    </>
  );
}
