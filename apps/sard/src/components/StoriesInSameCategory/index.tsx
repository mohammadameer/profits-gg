import { type Story } from "@prisma/client";
import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import Link from "next-multilingual/link";
import { useMessages } from "next-multilingual/messages";

import { useRouter } from "next-multilingual/router";
import { Fragment, useEffect, useRef } from "react";
import StoryImage from "~/components/StoryImage";
import { api } from "~/utils/api";

export default function StoriesInSameCategory({
  storyId,
  categoryName,
  onStoryClick,
}: {
  storyId: string;
  categoryName: string;
  onStoryClick?: (story: Story) => void;
}) {
  const router = useRouter();

  const messages = useMessages();

  const inViewRef = useRef<HTMLDivElement>(null);
  const inViewConfig = useInViewObserver(inViewRef, {});
  const inView = inViewConfig?.isIntersecting;

  const {
    data: stories,
    isFetching,
    refetch: refetchStories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = api.story.list.useInfiniteQuery(
    {
      id: storyId,
      category: categoryName,
      limit: 3,
      language: router.locale,
      hidden: false,
      select: {
        smallImage: true,
      },
    },
    {
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

  if (!stories?.pages?.[0]?.stories?.length) return null;

  return (
    <div className="flex w-full flex-col">
      <p className="text-3xl">{messages.format("relatedStories")}</p>
      <div className="relative flex w-full gap-4 overflow-scroll py-8">
        {stories?.pages?.[0]?.stories?.length ? (
          stories?.pages?.map(
            (page) =>
              page?.stories?.map((story, index) => (
                <Link
                  href={`/short-learning-stories-for-childrens/story/${story.slug}`}
                  key={story.id}
                  className="story relative z-20 flex h-40 min-w-[50%] cursor-pointer select-none items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:min-w-[25%] lg:min-w-[16%]">
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
        ) : isFetching ? (
          <Fragment>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative col-span-6 flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-3 lg:col-span-2">
                <div className="h-full w-full animate-pulse bg-gray-200" />
              </div>
            ))}
          </Fragment>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-8 rounded-md p-6">
            <p className="text text-xl font-bold leading-10 text-gray-900 md:text-2xl">
              {messages.format("noStories")}
            </p>
          </div>
        )}
        {isFetchingNextPage &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="col-span-full flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-6 lg:col-span-4">
              <div className="flex h-full w-full animate-pulse flex-col">
                <div className="h-3/4 w-full rounded-md bg-gray-200" />
                <div className="h-1/4 w-full rounded-md bg-gray-200" />
              </div>
            </div>
          ))}
        <div ref={inViewRef} className="h-40  w-1/2 min-w-[50%] md:min-w-[25%] lg:min-w-[16%]" />
      </div>
    </div>
  );
}
