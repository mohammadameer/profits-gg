import { NextApiRequest, NextApiResponse, type NextPage } from "next";
import { NextSeo } from "next-seo";

import { Button } from "@profits-gg/ui";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { prisma } from "~/server/db";
import { Story } from "@prisma/client";

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

const Home = ({ stories }: { stories: Story[] }) => {
  const router = useRouter();
  const { control, handleSubmit, watch } = useForm<FormValues>();

  const [category, setCategory] = useState<string>();
  const [place, setPlace] = useState<string>();

  // const {
  //   data: stories,
  //   isLoading: isLoadingData,
  //   isFetching,
  //   isFetchingNextPage,
  //   hasNextPage,
  //   status,
  //   fetchNextPage,
  //   refetch: refetchStories,
  // } = api.story.list.useInfiniteQuery(
  //   {
  //     category: category as string,
  //     place: place as string,
  //   },
  //   {
  //     enabled: false,
  //   }
  // );

  const [isLoading, setIsLoading] = useState(false);

  // const handleFetchNextPage = () => {
  //   if (!isFetching && hasNextPage && status === "success") {
  //     fetchNextPage();
  //   }
  // };

  // const buttonInView = useInViewObserver(handleFetchNextPage);

  const handleSearchStories = (values: FormValues) => {
    setCategory(values.category);
    setPlace(values.place);
  };

  const handleCreateStory = (values: FormValues) => {
    router.push(
      `/stories/new?category=${values.category}&place=${values.place}`
    );
  };

  // useEffect(() => {
  //   refetchStories();
  // }, [category, place]);

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
        {stories?.length ? (
          stories?.map((story) => (
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
              <Image
                src={"data:image/png;base64," + story.mainImage}
                alt={story.title as string}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
                unoptimized={true}
              />
              <div className="absolute bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-black/50 via-black/50 p-2">
                <p className="text text-2xl font-bold leading-10 text-white md:text-2xl">
                  {story.title}
                </p>
              </div>
            </div>
          ))
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
};

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const stories = await prisma.story.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    where: {
      version: 4,
      hidden: false,
      mainImage: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      mainImage: true,
    },
  });

  // revalidate every 1 hour
  res?.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");

  return {
    props: {
      stories,
    },
  };
}

export default Home;
