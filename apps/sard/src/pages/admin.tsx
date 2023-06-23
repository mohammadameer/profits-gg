import { Story } from "@prisma/client";
import useLocalStorage from "@profits-gg/lib/hooks/useLocalStorage";
import {
  Button,
  Modal,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@profits-gg/ui";
import clsx from "clsx";
import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import StoryImage from "~/components/StoryImage";
import { api } from "~/utils/api";
import categories, { Category } from "~/utils/categories";
import useInViewObserver from "@profits-gg/lib/hooks/useInViewObserver";
import Compressor from "compressorjs";

export default function Admin() {
  const router = useRouter();

  const { control, watch, handleSubmit, getValues, reset } = useForm();

  const inViewRef = useRef<HTMLDivElement>(null);
  const inViewConfig = useInViewObserver(inViewRef, {});
  const inView = inViewConfig?.isIntersecting;

  const id = watch("id");
  const category = watch("category");
  const hidden = watch("hidden");

  const [userId, setUserId] = useLocalStorage("userId", "");

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = api.story.list.useInfiniteQuery(
    {
      id: id as string,
      category: category as string,
      hidden: hidden as boolean,
      select: {
        mainImage: true,
        smallImage: true,
        description: true,
        content: true,
      },
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
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

  const updateStoryDetails = async (data: any) => {};

  const handleFetchNextPage = () => {
    if (!isFetchingStories && hasNextPage && status === "success") {
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
      <div className={clsx("flex gap-2 p-6 ", selectedStory ? "blur-md" : "")}>
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
      </div>
      <div
        className={clsx(
          "grid w-full grid-cols-12 grid-rows-6 gap-4 p-6 transition-all",
          selectedStory ? "blur-md" : ""
        )}
      >
        {stories?.pages?.length && stories?.pages?.[0]?.stories?.length ? (
          stories?.pages?.map((page) =>
            page?.stories?.map((story) => (
              <div
                key={story.id}
                className={clsx(
                  "relative col-span-6 flex h-64 cursor-pointer items-center justify-start overflow-scroll rounded-md bg-white shadow-sm transition-all md:col-span-3 lg:col-span-2"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedStory?.id === story.id) {
                    setSelectedStory(null);
                  } else {
                    setSelectedStory(story);
                    reset({
                      title: story.title,
                      description: story.description,
                      slug: story.slug,
                      content: story.content,
                      imagePrompt: story.imagePrompt,
                      mainImage: story.mainImage,
                      smallImage: story.smallImage,
                    });
                  }
                }}
              >
                <StoryImage
                  id={story.id}
                  src={story.mainImage as string}
                  alt={story.imagePrompt as string}
                />
                {selectedStory?.id !== story.id ? (
                  <div className="absolute bottom-0 left-0 flex w-full items-center justify-center bg-gradient-to-t from-black/50 via-black/50 p-2">
                    <p className="text text-2xl font-bold leading-10 text-white md:text-2xl">
                      {story.title}
                    </p>
                  </div>
                ) : null}

                <div className="absolute left-2 top-2 flex gap-2">
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
                          onSuccess: async () => {
                            refetchStories();
                            await fetch("/api/revalidate");
                          },
                        }
                      );
                    }}
                    className="select-none shadow-md"
                  />
                </div>
              </div>
            ))
          )
        ) : isFetchingStories ? (
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
          <p className="col-span-full py-40 text-center text-2xl">
            لا توجد قصص
          </p>
        )}
        <div ref={inViewRef} className="h-20 w-full" />
      </div>

      <Modal
        open={!!selectedStory}
        setOpen={() => setSelectedStory(null)}
        className="!bg-gray-200 xl:!w-[60vw] xl:!max-w-[60vw] "
      >
        <form
          onSubmit={handleSubmit(updateStoryDetails)}
          className="grid w-full grid-cols-12 gap-2 p-6"
        >
          <div className="col-span-full flex flex-col items-start gap-2 xl:flex-row xl:items-end">
            <div className="relative col-span-full flex h-96 w-full max-w-[100vw] xl:w-96">
              <StoryImage
                id={selectedStory?.id as string}
                src={selectedStory?.mainImage as string}
                alt={selectedStory?.imagePrompt as string}
              />
            </div>
            <Button
              text="تحديث"
              type="submit"
              onClick={() => {
                // the logic will need to be add
              }}
              className="w-full select-none shadow-md xl:w-52"
            />
          </div>
          <div className="col-span-full flex flex-col items-start gap-2 xl:flex-row xl:items-end">
            <div className="relative col-span-full flex h-52 w-52">
              <StoryImage
                id={selectedStory?.id as string}
                src={selectedStory?.smallImage as string}
                alt={selectedStory?.imagePrompt as string}
              />
            </div>
            <Button
              text="إضافة"
              type="submit"
              onClick={async () => {
                function dataURLtoFile(dataurl: string, filename: string) {
                  var arr = dataurl.split(",") as any[],
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[arr.length - 1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);
                  while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                  }
                  return new File([u8arr], filename, { type: mime });
                }

                const smallCompressedImage = await new Promise<string>(
                  (resolve) => {
                    const url =
                      "data:image/png;base64," + selectedStory?.mainImage;
                    const imageFile = dataURLtoFile(url, `${Date.now()}.png`);

                    new Compressor(imageFile, {
                      strict: true,
                      checkOrientation: true,
                      maxWidth: 0,
                      maxHeight: 0,
                      minWidth: 0,
                      minHeight: 0,
                      width: 128,
                      height: 128,
                      resize: "cover",
                      quality: 0.2,
                      mimeType: "auto",
                      convertTypes: ["image/png"],
                      convertSize: 0,
                      success: (result) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(result);
                        reader.onloadend = () => {
                          const base64data = reader.result;
                          resolve(base64data as string);
                        };
                      },
                    });
                  }
                );

                updateStory(
                  {
                    id: selectedStory?.id as string,
                    smallImage: smallCompressedImage?.replace(
                      "data:image/jpeg;base64,",
                      ""
                    ),
                  },
                  {
                    onSuccess: () => {
                      refetchStories({
                        exact: true,
                      });
                      setSelectedStory(null);
                    },
                  }
                );
              }}
              className="w-full select-none shadow-md xl:w-52"
            />
          </div>
          <TextInput
            className="col-span-full"
            inputClassName="!bg-gray-200 focus:!border-gray-500"
            name="title"
            control={control}
            placeholder="العنوان"
            defaultValue={selectedStory?.title}
          />
          <TextInput
            className="col-span-full"
            inputClassName="!bg-gray-200 focus:!border-gray-500"
            name="description"
            control={control}
            placeholder="الوصف"
            defaultValue={selectedStory?.description}
          />
          <TextInput
            className="col-span-full"
            inputClassName="!bg-gray-200 focus:!border-gray-500"
            name="slug"
            control={control}
            placeholder="الرابط"
            defaultValue={selectedStory?.slug}
          />
          <TextAreaInput
            className="col-span-full"
            height="h-52"
            inputClassName="!bg-gray-200 focus:!border-gray-500"
            name="content"
            control={control}
            placeholder="المحتوى"
            defaultValue={selectedStory?.content}
          />

          <Button
            text="حفظ"
            type="submit"
            onClick={() => {
              if (!user) return router.push("/");

              updateStory(
                {
                  id: selectedStory?.id || "",
                  title: getValues("title"),
                  description: getValues("description"),
                  slug: getValues("slug"),
                  content: getValues("content"),
                },
                {
                  onSuccess: async () => {
                    refetchStories();
                    setSelectedStory(null);
                    await fetch("/api/revalidate");
                  },
                }
              );
            }}
            className="col-span-4 select-none shadow-md"
          />
        </form>
      </Modal>
    </>
  );
}
