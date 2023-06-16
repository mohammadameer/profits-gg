import { NextApiRequest, NextApiResponse, type NextPage } from "next";
import { NextSeo } from "next-seo";

import { Button } from "@profits-gg/ui";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { prisma } from "~/server/db";
import { Story } from "@prisma/client";
import StoryImage from "~/components/StoryImage";
import { api } from "~/utils/api";
import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import { createServerSideHelpers } from "@trpc/react-query/server";
import SuperJSON from "superjson";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";

type FormValues = {
  category: string;
  place: string;
};

const SelectInputClassNames = {
  container: () => "rounded-lg bg-gray-200",
  control: ({ hasValue }: { hasValue: boolean }) =>
    `rounded-lg px-2 py-1 border-gray-500 border ${
      hasValue ? "text-gray-900" : "text-gray-400"
    } outline-none focus:border-white`,
  valueContainer: () => "bg-gray-200 rounded-r-lg gap-2 ",
  multiValue: () => "bg-gray-700 rounded-lg",
  menu: () => "bg-gray-300 rounded-lg p-2 mt-2 z-50",
  option: () => "hover:bg-gray-400 !cursor-pointer p-2 rounded-lg ",
};

const Home = () => {
  const router = useRouter();

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
      <NextSeo
        title="قصص اطفال تعليمية قصيرة "
        description="قصص اطفال عربية، جديدة، تعليمية، مؤثرة، قيمة، جميلة قصيرة، و مخصصة لطفلك، لقبل النوم وللتعليم"
        canonical="https://sard.dev/"
        openGraph={{
          url: "https://sard.dev/",
          title: "قصص اطفال تعليمية قصيرة",
          description:
            "قصص اطفال عربية، جديدة، تعليمية، مؤثرة، قيمة، جميلة قصيرة، و مخصصة لطفلك، لقبل النوم وللتعليم",
          siteName: "سرد",
        }}
      />

      <h1 className="md:pt-18 p-6 py-4 pb-4 text-4xl font-bold md:pb-14 md:text-8xl">
        قصص اطفال تعليمية قصيرة
      </h1>

      <div className="grid grid-cols-12 gap-4 p-6">
        {stories?.pages?.[0]?.stories?.length ? (
          stories?.pages?.map((page) =>
            page?.stories?.map((story) => (
              <div
                key={story.id}
                className="relative col-span-full flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-6 lg:col-span-4"
                onClick={() => {
                  router.push(`/stories/${story.slug}`);
                  (window as any)?.ttq?.track("ViewContent", {
                    content_id: story.id,
                    content_type: "product",
                    content_name: story.title,
                  });
                }}
              >
                <StoryImage
                  id={story.id}
                  src={story.mainImage as string}
                  alt={story.title as string}
                />
                <div className="absolute bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-black/50 via-black/50 p-2">
                  <p className="text text-2xl font-bold leading-10 text-white md:text-2xl">
                    {story.title}
                  </p>
                </div>
              </div>
            ))
          )
        ) : (
          <div className="col-span-full flex h-96 flex-col items-center justify-center gap-8 rounded-md p-6">
            <p className="text text-xl font-bold leading-10 text-gray-900 md:text-2xl">
              لا توجد قصص حاليا
            </p>
          </div>
        )}
        {isFetchingNextPage &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="col-span-full flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-6 lg:col-span-4"
            >
              <div className="flex h-full w-full animate-pulse flex-col">
                <div className="h-3/4 w-full rounded-md bg-gray-200" />
                <div className="h-1/4 w-full rounded-md bg-gray-200" />
              </div>
            </div>
          ))}
      </div>
      <div ref={inViewRef} className="h-20 w-full" />
    </>
  );
};

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(),
    transformer: SuperJSON,
  });
  await helpers?.story?.list?.prefetchInfinite({
    hidden: false,
  });

  // revalidate every 1 hour
  res?.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  return {
    props: {
      trpcState: helpers?.dehydrate(),
    },
  };
}

export default Home;
