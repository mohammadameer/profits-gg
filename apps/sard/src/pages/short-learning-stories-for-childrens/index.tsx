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

import type { GetStaticProps, NextPage } from "next";
import { getStaticPropsLocales } from "next-multilingual";
import { useMessages } from "next-multilingual/messages";
import SEO from "~/components/SEO";
import { useGetLocalizedUrl } from "next-multilingual/url";

const ChildrenStories: NextPage<{ locale: string }> = ({ locale }) => {
  const router = useRouter();
  const { getLocalizedUrl } = useGetLocalizedUrl();

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
      language: locale,
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
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(`/short-learning-stories-for-childrens`, router.locale, undefined, true)}
        keywords={[messages.format("title"), messages.format("description")]}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-14">{messages.format("title")}</h1>

      <div className="relative grid grid-cols-12 gap-4 p-6">
        {stories?.pages?.[0]?.stories?.length ? (
          stories?.pages?.map(
            (page) =>
              page?.stories?.map((story, index) => (
                <Link
                  href={`/short-learning-stories-for-childrens/story/${story.slug}`}
                  key={story.id}
                  className="story relative z-20 col-span-6 flex h-40 cursor-pointer select-none items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-3 lg:col-span-2">
                  <StoryImage
                    index={index}
                    id={story.id}
                    src={story.smallImage as string}
                    alt={story.title as string}
                  />
                  <div className="absolute bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-black/50 via-black/50 p-2">
                    <p className="text text-2xl font-bold leading-10 text-white md:text-2xl">{story.title}</p>
                  </div>
                </Link>
              ))
          )
        ) : (
          <div className="col-span-full flex h-96 flex-col items-center justify-center gap-8 rounded-md p-6">
            <p className="text text-xl font-bold leading-10 text-gray-900 md:text-2xl">لا توجد قصص حاليا</p>
          </div>
        )}
        {isFetchingNextPage &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="col-span-6 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-3 lg:col-span-2">
              <div className="flex h-full w-full animate-pulse flex-col">
                <div className="h-3/4 w-full rounded-md bg-gray-200" />
                <div className="h-1/4 w-full rounded-md bg-gray-200" />
              </div>
            </div>
          ))}
        <div ref={inViewRef} className="absolute bottom-0 left-0 h-1/2 w-full " />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { locale } = getStaticPropsLocales(context);

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(),
    transformer: SuperJSON,
  });

  await helpers?.story?.list?.prefetchInfinite({
    hidden: false,
    limit: 6,
    language: locale,
    select: {
      smallImage: true,
    },
  });

  return {
    props: {
      locale,
      trpcState: helpers?.dehydrate(),
    },
  };
};

export default ChildrenStories;
