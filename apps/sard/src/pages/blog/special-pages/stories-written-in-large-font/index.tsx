import Link from "next-multilingual/link";
import { useMessages } from "next-multilingual/messages";
import SEO from "~/components/SEO";
import { useGetLocalizedUrl } from "next-multilingual/url";
import { useRouter } from "next-multilingual/router";
import { type GetStaticProps } from "next";
import { getStaticPropsLocales } from "next-multilingual";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import SuperJSON from "superjson";
import { api } from "~/utils/api";
import { Button } from "@profits-gg/ui";
import StoryImage from "~/components/StoryImage";

export default function StoriesWithLargeFont({ locale }: { locale: string }) {
  const router = useRouter();
  const { getLocalizedUrl } = useGetLocalizedUrl();

  const {
    data: stories,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = api.story.list.useInfiniteQuery(
    {
      hidden: false,
      initialCursor: 7,
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

  const messages = useMessages();
  return (
    <>
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(
          `/blog/special-pages/stories-written-in-large-font`,
          router.locale,
          undefined,
          true
        )}
        keywords={[messages.format("title"), messages.format("description")]}
      />
      <h1 className="md:pt-18 p-6 py-4 pb-4 text-6xl font-bold md:pb-6">{messages.format("title")}</h1>

      <h2 className="p-6 py-4 pb-4 text-xl md:pb-14">{messages.format("description")}</h2>

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
            <p className="text text-xl font-bold leading-10 text-gray-900 md:text-2xl">
              {messages.format("noStories")}
            </p>
          </div>
        )}
        <div className="col-span-full mt-2 flex flex-col items-center justify-center gap-4">
          <Button
            text={isFetching ? "🪄" : hasNextPage ? messages.format("loadMore") : messages.format("reachEnd")}
            onClick={() => {
              fetchNextPage().catch((error) => {
                console.error(error);
              });
            }}
            className="w-full md:w-5/12"
          />
          <Link
            href="/short-learning-stories-for-childrens/new-and-special-story-for-your-children"
            className="text col-span-full h-auto rounded-lg bg-blue-500 px-6 py-4 text-center font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 lg:w-1/3">
            {messages.format("newStory")} 🪄
          </Link>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { locale } = getStaticPropsLocales(context);

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(),
    transformer: SuperJSON,
  });

  await helpers?.story?.list?.prefetchInfinite({
    hidden: false,
    initialCursor: 7,
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
