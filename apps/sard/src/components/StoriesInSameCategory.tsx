import { Story } from "@prisma/client";
import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import { useRouter } from "next/router";
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
      <p className="text-3xl">قصص أخرى في نفس الموضوع</p>
      <div className="relative flex w-full gap-4 overflow-scroll py-8">
        {stories?.pages?.[0]?.stories?.length ? (
          stories?.pages?.map((page) =>
            page?.stories?.map((story, index) => (
              <div
                key={story.id}
                className="story relative z-20 flex h-40 min-w-[50%] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:min-w-[25%] lg:min-w-[16%]"
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
                  index={index}
                  id={story.id}
                  src={story.smallImage as string}
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
        ) : isFetching ? (
          <Fragment>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative col-span-6 flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-3 lg:col-span-2"
              >
                <div className="h-full w-full animate-pulse bg-gray-200"></div>
              </div>
            ))}
          </Fragment>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-8 rounded-md p-6">
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
        <div
          ref={inViewRef}
          className="h-40  w-1/2 min-w-[50%] md:min-w-[25%] lg:min-w-[16%]"
        />
      </div>
    </div>
  );
}
