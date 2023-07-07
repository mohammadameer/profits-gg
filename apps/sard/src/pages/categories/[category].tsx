import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import SuperJSON from "superjson";
import StoryImage from "~/components/StoryImage";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api } from "~/utils/api";
import categories from "~/utils/categories";

export default function Category({ category }: { category: string }) {
  const { data: stories } = api.story.list.useInfiniteQuery({
    category,
    limit: 20,
    hidden: false,
    select: {
      smallImage: true,
    },
  });

  const categoryObj = categories.find((c) => c.value === category);

  return (
    <>
      <NextSeo
        title={`سرد - قصص عن ${categoryObj?.label}`}
        description={`أفضل قصص عن ${categoryObj?.label}`}
        canonical="https://sard.dev/"
        openGraph={{
          url: "https://sard.dev/",
          title: `سرد - قصص عن ${categoryObj?.label}`,
          description: `أفضل قصص عن ${categoryObj?.label}`,
          siteName: "سرد",
        }}
      />
      <h1 className="p-6 text-4xl font-bold">قصص عن {categoryObj?.label}</h1>
      <div className="relative grid grid-cols-12 gap-4 p-6">
        {stories?.pages?.[0]?.stories?.length ? (
          stories?.pages?.map((page) =>
            page?.stories?.map((story, index) => (
              <Link
                href={`/stories/${story.slug}`}
                key={story.id}
                className="story relative z-20 col-span-6 flex h-40 cursor-pointer select-none items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-3 lg:col-span-2"
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
              </Link>
            ))
          )
        ) : (
          <div className="col-span-full flex h-96 flex-col items-center justify-center gap-8 rounded-md p-6">
            <p className="text text-xl font-bold leading-10 text-gray-900 md:text-2xl">
              لا توجد قصص حاليا
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = categories.map((category) => ({
    params: { category: category.value },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps(
  context: GetServerSidePropsContext<{ category: string }>
) {
  const category = context.params?.category as string;

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(),
    transformer: SuperJSON,
  });

  await helpers?.story?.list?.prefetchInfinite({
    category,
    limit: 20,
    hidden: false,
    select: {
      smallImage: true,
    },
  });

  return {
    props: {
      trpcState: helpers?.dehydrate(),
      category,
      key: category,
    },
  };
}
