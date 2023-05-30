import { type NextPage } from "next";
import Head from "next/head";
import { NextSeo } from "next-seo";

import { api } from "~/utils/api";
import { Button, SelectInput } from "@profits-gg/ui";
import { useForm } from "react-hook-form";
import { required } from "@profits-gg/lib/utils/formRules";
import { useCallback, useEffect, useState } from "react";
import { useReCaptcha } from "next-recaptcha-v3";
import va from "@vercel/analytics";
import { toast } from "react-hot-toast";
import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import { useRouter } from "next/router";
import Image from "next/image";
import categories from "~/utils/categories";
import places from "~/utils/places";

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

const Home: NextPage = () => {
  const router = useRouter();
  const { control, handleSubmit, watch } = useForm<FormValues>();

  const [category, setCategory] = useState<string>();
  const [place, setPlace] = useState<string>();

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
      category: category as string,
      place: place as string,
    },
    {
      enabled: false,
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleFetchNextPage = () => {
    if (!isFetching && hasNextPage && status === "success") {
      fetchNextPage();
    }
  };

  const buttonInView = useInViewObserver(handleFetchNextPage);

  const handleSearchStories = (values: FormValues) => {
    setCategory(values.category);
    setPlace(values.place);
  };

  const handleCreateStory = (values: FormValues) => {
    router.push(
      `/stories/new?category=${values.category}&place=${values.place}`
    );
  };

  useEffect(() => {
    refetchStories();
  }, [category, place]);

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

      <h1 className="p-6 py-10 text-6xl font-bold md:pb-14 md:pt-24 md:text-8xl">
        قصص اطفال تعليمية قصيرة
      </h1>

      <form
        onSubmit={handleSubmit(handleSearchStories)}
        className="flex flex-col items-center justify-between p-6 lg:flex-row"
      >
        <div className="flex w-full gap-4 md:flex-row">
          <SelectInput
            name="category"
            label="موضوع القصة"
            className="w-full lg:w-1/4"
            options={categories}
            control={control}
            disabled={isLoading}
            classNames={SelectInputClassNames}
            rules={{ required }}
          />
          <SelectInput
            name="place"
            label="المكان"
            className="w-full lg:w-1/4"
            options={places}
            control={control}
            disabled={isLoading}
            classNames={SelectInputClassNames}
          />
        </div>
        <div className="flex w-full flex-col gap-4 md:flex-row lg:w-1/3">
          <Button
            text="بحث"
            type="submit"
            loading={isLoading}
            className="w-full"
          />
          <Button
            text="أنشئ قصة خاصة"
            onClick={handleSubmit(handleCreateStory)}
            loading={isLoading}
            className="w-full !bg-blue-500 !text-white"
          />
        </div>
      </form>

      <div className="grid grid-cols-12 gap-4 p-6">
        {stories?.pages?.length && stories?.pages[0]?.stories?.length ? (
          stories?.pages?.map((page) =>
            page?.stories.map((story) => (
              <div
                key={story.id}
                className="col-span-full flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md bg-white p-6 shadow-sm md:col-span-6 lg:col-span-4"
                onClick={() => {
                  router.push(`/stories/${story.slug}`);
                }}
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={story.mainImage as string}
                    alt={story.title as string}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <p className="text text-xl font-bold leading-10 text-gray-900 md:text-2xl">
                  {story.title}
                </p>
                <p className="text text-lg leading-10 text-gray-900 md:text-xl">
                  {story.description}
                </p>
              </div>
            ))
          )
        ) : isFetching ? (
          Array.from({ length: 6 }).map(() => (
            <div className="col-span-full flex cursor-wait flex-col items-center justify-center gap-4 rounded-md bg-white p-6 md:col-span-6 lg:col-span-4 ">
              <div className="h-64 w-full animate-pulse rounded-md bg-gray-400" />
              <div className="h-8 w-1/2 animate-pulse rounded-md bg-gray-400" />
              <div className="h-8 w-3/4 animate-pulse rounded-md bg-gray-400" />
            </div>
          ))
        ) : (
          <div className="col-span-full flex h-96 flex-col items-center justify-center gap-8 rounded-md p-6">
            <p className="text text-xl font-bold leading-10 text-gray-900 md:text-2xl">
              لا توجد قصص في هذا الموضوع حالياً
            </p>

            <div>
              <Button
                text="أنشئ قصة خاصة"
                onClick={handleSubmit(handleCreateStory)}
                className="w-full !bg-blue-500 !text-white"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
