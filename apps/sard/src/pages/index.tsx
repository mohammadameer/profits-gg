import { useRouter } from "next-multilingual/router";
import Link from "next-multilingual/link";

import type { GetServerSideProps, NextPage } from "next";
import { type ResolvedLocaleServerSideProps, resolveLocale, useResolvedLocale } from "next-multilingual";
import { useMessages } from "next-multilingual/messages";
import SEO from "~/components/SEO";
import { useGetLocalizedUrl } from "next-multilingual/url";

const Home: NextPage<ResolvedLocaleServerSideProps> = ({ resolvedLocale }) => {
  const { getLocalizedUrl } = useGetLocalizedUrl();

  const router = useRouter();
  const messages = useMessages();

  useResolvedLocale(resolvedLocale);
  return (
    <>
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(`/`, router.locale, undefined, true)}
        keywords={[messages.format("title"), messages.format("description")]}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">{messages.format("title")}</h1>

      <div className="relative grid grid-cols-12 gap-4 p-6">
        <Link
          href="/short-learning-stories-for-childrens"
          className="col-span-full row-span-1 flex flex-col gap-2 rounded-md bg-white p-4 shadow-md md:col-span-4">
          <p>📃</p>
          <p>{messages.format("childrenStories")}</p>
        </Link>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ResolvedLocaleServerSideProps> = async (
  context
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  return {
    props: {
      resolvedLocale: resolveLocale(context),
    },
  };
};

export default Home;
