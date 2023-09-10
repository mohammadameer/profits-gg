import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";
import Link from "next-multilingual/link";
import SuperJSON from "superjson";
import StoryImage from "~/components/StoryImage";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { api } from "~/utils/api";
import categories, { type StaticCategory } from "~/utils/categories";
import { getLocalizedRouteParameters, useRouter } from "next-multilingual/router";
import { getStaticPropsLocales } from "next-multilingual";
import { useMessages } from "next-multilingual/messages";
import Head from "next-multilingual/head";

export default function Category({ category }: { category: StaticCategory }) {
  const router = useRouter();

  const messages = useMessages();

  const { data: stories } = api.story.list.useInfiniteQuery({
    category: category?.value,
    limit: 20,
    hidden: false,
    language: router.locale,
    select: {
      smallImage: true,
    },
  });

  return (
    <>
      <Head>
        <title>
          {messages.format("storyAbout")} {category?.label}
        </title>
        <meta name="description" content={messages.format("bestStoriesAbout") + " " + category?.label} />
        <meta property="og:title" content={messages.format("storyAbout") + " " + category?.label} />
        <meta
          property="og:description"
          content={messages.format("bestStoriesAbout") + " " + category?.label}
        />
      </Head>

      <h1 className="p-6 text-4xl font-bold">
        {messages.format("storyAbout")} {category?.label}
      </h1>
      <div className="relative grid grid-cols-12 gap-4 p-6">
        {stories?.pages?.[0]?.stories?.length ? (
          stories?.pages?.map(
            (page) =>
              page?.stories?.map((story, index) => (
                <Link
                  href={`/stories/${story.slug}`}
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
      </div>
    </>
  );
}

export const getStaticPaths = async () => {
  const paths: { params: { category: string } }[] = [];

  categories.forEach((category) => {
    Object.entries(category.label).forEach(([key, value]) => {
      paths.push({
        params: {
          category: value,
        },
      });
    });
  });

  return { paths, fallback: "blocking" };
};

export async function getStaticProps(context: GetServerSidePropsContext<{ category: string }>) {
  const category = context.params?.category as string;

  const { locale } = getStaticPropsLocales(context);

  const localizedRouteParameters = getLocalizedRouteParameters(
    context,
    {
      category,
    },
    import.meta.url
  );

  const categoryValue = categories.find((c) =>
    Object.entries(c.label).some(([key, value]) => value === category)
  );

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(),
    transformer: SuperJSON,
  });

  await helpers?.story?.list?.prefetchInfinite({
    category: categoryValue?.value,
    limit: 20,
    hidden: false,
    language: locale,
    select: {
      smallImage: true,
    },
  });

  return {
    props: {
      localizedRouteParameters,
      trpcState: helpers?.dehydrate(),
      category: { ...categoryValue, label: categoryValue?.label[locale as keyof typeof categoryValue.label] },
      key: categoryValue?.value,
    },
  };
}
