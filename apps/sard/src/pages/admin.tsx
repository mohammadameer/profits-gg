import useLocalStorage from "@profits-gg/lib/hooks/useLocalStorage";
import { Button, SelectInput, TextInput } from "@profits-gg/ui";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import categories, { Category } from "~/utils/categories";

export default function Admin() {
  const router = useRouter();

  const { control, watch } = useForm();

  const id = watch("id");
  const category = watch("category");
  const title = watch("title");
  const slug = watch("slug");
  const hidden = watch("hidden");

  const [userId, setUserId] = useLocalStorage("userId", "");

  const [isAdmin, setIsAdmin] = useState(false);

  const { data: user, isLoading } = api.user.get.useQuery(
    {
      id: userId,
    },
    {
      enabled: !!userId,
    }
  );

  const {
    data: stories,
    isFetching: isFetchingStories,
    refetch: refetchStories,
  } = api.story.list.useInfiniteQuery(
    {
      id: id as string,
      category: category as string,
      title: title as string,
      slug: slug as string,
      hidden: hidden as boolean,
    },
    {
      enabled: isAdmin,
    }
  );

  const { mutate: updateStory } = api.story.update.useMutation();

  useEffect(() => {
    if (!userId && isLoading) {
      router.push("/");
    }

    if (userId && !isLoading) {
      if (!user || user.email !== "mohammadameerabdallah@gmail.com") {
        toast.error("You are not an admin");
        router.push("/");
      } else {
        setIsAdmin(true);
      }
    }
  }, [userId, user, isLoading]);

  return (
    <>
      <div className="flex gap-2 p-6 ">
        <SelectInput
          className="w-full"
          name="category"
          control={control}
          label="المواضيع"
          options={[
            {
              label: "الكل",
              value: null,
            },
            ...(categories?.map((category) => ({
              label: category.label,
              value: category.value,
            })) as Category[]),
          ]}
          classNames={{
            container: () => "rounded-lg bg-gray-200",
            control: ({ hasValue }: { hasValue: boolean }) =>
              `rounded-lg px-2 py-1 border-gray-500 border ${
                hasValue ? "text-gray-900" : "text-gray-400"
              } outline-none focus:border-white`,
            valueContainer: () => "bg-gray-200 rounded-r-lg gap-2 ",
            multiValue: () => "bg-gray-700 rounded-lg",
            menu: () => "bg-gray-300 rounded-lg p-2 mt-2 z-50",
            option: () => "hover:bg-gray-400 !cursor-pointer p-2 rounded-lg ",
          }}
        />
        <SelectInput
          className="w-full"
          name="hidden"
          control={control}
          label="الحالة"
          options={[
            {
              label: "الكل",
              value: null,
            },
            {
              label: "مخفي",
              value: true,
            },
            {
              label: "ظاهر",
              value: false,
            },
          ]}
          classNames={{
            container: () => "rounded-lg bg-gray-200",
            control: ({ hasValue }: { hasValue: boolean }) =>
              `rounded-lg px-2 py-1 border-gray-500 border ${
                hasValue ? "text-gray-900" : "text-gray-400"
              } outline-none focus:border-white`,
            valueContainer: () => "bg-gray-200 rounded-r-lg gap-2 ",
            multiValue: () => "bg-gray-700 rounded-lg",
            menu: () => "bg-gray-300 rounded-lg p-2 mt-2 z-50",
            option: () => "hover:bg-gray-400 !cursor-pointer p-2 rounded-lg ",
          }}
        />
        <TextInput
          inputClassName="!bg-gray-200 focus:!border-gray-500"
          name="id"
          control={control}
          label="الرقم"
        />
        <TextInput
          className="w-full"
          name="title"
          control={control}
          label="العنوان"
          inputClassName="!bg-gray-200 focus:!border-gray-500"
        />
        <TextInput
          inputClassName="!bg-gray-200 focus:!border-gray-500"
          name="slug"
          control={control}
          label="الرابط"
        />
      </div>
      <div className="grid w-full grid-cols-12 gap-4 p-6">
        {stories?.pages?.length && stories?.pages?.[0]?.stories?.length ? (
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
                {story.mainImage ? (
                  <Image
                    src={
                      story.mainImage.includes("http")
                        ? story.mainImage
                        : "data:image/png;base64," + story.mainImage
                    }
                    alt={story.title as string}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-md"
                    unoptimized={true}
                  />
                ) : null}
                <div className="absolute bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-black/50 via-black/50 p-2">
                  <p className="text text-2xl font-bold leading-10 text-white md:text-2xl">
                    {story.title}
                  </p>
                </div>

                <Button
                  text={story?.hidden ? "إظهار" : "إخفاء"}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStory(
                      {
                        id: story.id,
                        hidden: !story.hidden,
                      },
                      {
                        onSuccess: () => {
                          refetchStories();
                        },
                      }
                    );
                  }}
                  className="absolute left-2 top-2 select-none shadow-md"
                />
              </div>
            ))
          )
        ) : isFetchingStories ? (
          <Fragment>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative col-span-full flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm md:col-span-6 lg:col-span-4"
              >
                <div className="h-full w-full animate-pulse bg-gray-200"></div>
              </div>
            ))}
          </Fragment>
        ) : (
          <p className="col-span-full py-40 text-center text-2xl">
            لا توجد قصص
          </p>
        )}
      </div>
    </>
  );
}