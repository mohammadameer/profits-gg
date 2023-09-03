import { NextSeo } from "next-seo";
import { useEffect, useRef } from "react";
import { useRouter } from "next-multilingual/router";
import StoryImage from "~/components/StoryImage";
import { api } from "~/utils/api";
import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import { createServerSideHelpers } from "@trpc/react-query/server";
import SuperJSON from "superjson";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import Link from "next-multilingual/link";

import type { GetServerSideProps, NextPage } from "next";
import { ResolvedLocaleServerSideProps, resolveLocale, useResolvedLocale } from "next-multilingual";
import { useMessages } from "next-multilingual/messages";
import Head from "next-multilingual/head";

const Home: NextPage<ResolvedLocaleServerSideProps> = ({ resolvedLocale }) => {
  useResolvedLocale(resolvedLocale);

  const router = useRouter();
  const messages = useMessages();

  const inViewRef = useRef<HTMLDivElement>(null);

  const inViewConfig = useInViewObserver(inViewRef, {});
  const inView = inViewConfig?.isIntersecting;

  const {
    data: stories,
    isLoading: isLoadingData,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    status,
    fetchNextPage,
    refetch: refetchStories,
  } = api.story.list.useInfiniteQuery(
    {
      hidden: false,
      limit: 6,
      select: {
        smallImage: true,
      },
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: false,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );

  const handleFetchNextPage = () => {
    if (!isFetching && hasNextPage && status === "success") {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (inView) {
      handleFetchNextPage();
    }
  }, [inView]);

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
