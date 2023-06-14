import { useReCaptcha } from "next-recaptcha-v3";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import va from "@vercel/analytics";
import Image from "next/image";
import useDebounce from "@profits-gg/lib/hooks/useDebounce";
import clsx from "clsx";
import { useMempershipModalOpen } from "~/contexts/membership";
import { useLocalStorage } from "usehooks-ts";
import places from "~/utils/places";
import categories from "~/utils/categories";

export default function Story() {
  const router = useRouter();
  const { slug: slugFromRouter, category, place } = router.query;

  const { executeRecaptcha, loaded: isRecaptchaLoaded } = useReCaptcha();

  const createCalledRef = useRef(false);

  const { isMempershipModalOpen, setIsMempershipModalOpen } =
    useMempershipModalOpen();

  const [userId, setUserId] = useLocalStorage<string>("userId", "");

  const { data: storyData, refetch: refetchStory } = api.story.get.useQuery(
    {
      slug: slugFromRouter as string,
    },
    {
      enabled: false,
      onSuccess: (data) => {
        setTitle(data?.title as string);
        setDescription(data?.description as string);
        setSlug(data?.slug as string);
        setMainImage(data?.mainImage as string);
        setContent(data?.content as string);
        setImagePrompt(data?.imagePrompt as string);
      },
    }
  );

  const { data: user } = api.user.get.useQuery(
    {
      id: userId,
    },
    {
      enabled: userId ? true : false,
    }
  );
  const { mutate: getImage, isLoading: isGettingImage } =
    api.openai.getImage.useMutation();

  const {
    mutate: createStory,
    isLoading: isCreatingStory,
    data: storyCreateData,
  } = api.story.create.useMutation();

  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [slug, setSlug] = useState<string>();
  const [mainImage, setMainImage] = useState<string>();
  const [content, setContent] = useState<string>();
  const [imagePrompt, setImagePrompt] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const debouncedImagePrompt = useDebounce(imagePrompt, 500);
  const debouncedContent = useDebounce(content, 5000);

  const handleCreateStory = useCallback(async () => {
    setIsLoading(true);

    setTitle("");
    setDescription("");
    setSlug("");
    setMainImage("");
    setContent("");
    setImagePrompt("");

    if (user && user?.membershipExpiration) {
      const membershipExpiration = new Date(user?.membershipExpiration);

      if (membershipExpiration < new Date()) {
        va.track("create story expired membership");
        setIsMempershipModalOpen(true);
        return;
      }
    }

    const token = await executeRecaptcha?.("createStory");

    va.track("creating-story");

    const response = await fetch("/api/openai/chat", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        category: category as string,
        place: place as string,
        userId,
        token,
      }),
    });

    if (!response.ok && response.status !== 429) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let result = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (chunkValue.includes("rate limit exceeded")) {
        va.track("rate-limit-exceeded");
        setIsLoading(false);
        if (user && user?.membershipExpiration) {
          const membershipExpiration = new Date(user?.membershipExpiration);

          if (membershipExpiration > new Date()) {
            va.track("rate limit exceeded but membership is valid");
            toast.error("اصبر شوي وحاول مرة ثانية", {
              icon: "👀",
            });
            router.push("/");
          }
        } else {
          setIsMempershipModalOpen(true);
        }

        return;
      }

      result += chunkValue;

      const [title, description, slug, imagePrompt, content] =
        result.split("#");

      if (title) setTitle(title);
      if (description) setDescription(description);
      if (slug) setSlug(slug);
      if (imagePrompt) setImagePrompt(imagePrompt);
      if (content) setContent(content);
    }

    setIsLoading(false);
  }, [executeRecaptcha, category, isLoading]);

  // create story if category is selected or get story if slug is selected
  useEffect(() => {
    if (
      category &&
      slugFromRouter == "new" &&
      isRecaptchaLoaded &&
      !isLoading &&
      !createCalledRef.current
    ) {
      // check if category is valid
      if (categories?.find((categoryItem) => categoryItem.value === category)) {
        // check if story is already created
        if (!title && !description && !slug && !mainImage && !content) {
          handleCreateStory();
          createCalledRef.current = true;
        }
      } else {
        va.track("invalid params");
        toast.error("الموضوع غير موجود");
        router.push("/");
      }
    }
  }, [category, isRecaptchaLoaded, slugFromRouter, isLoading]);

  // get story if slug is set
  useEffect(() => {
    if (slugFromRouter && slugFromRouter !== "new") {
      refetchStory();
    }
  }, [slugFromRouter]);

  // get image if image prompt is set
  useEffect(() => {
    if (debouncedImagePrompt && !mainImage && !isGettingImage) {
      va.track("getting-image");
      getImage(
        {
          prompt: debouncedImagePrompt as string,
        },
        {
          onSuccess: (data) => {
            setMainImage(data as string);
          },
        }
      );
    }
  }, [debouncedImagePrompt]);

  // if title, description, content and image are set, update the story
  useEffect(() => {
    if (
      !storyCreateData &&
      !storyData &&
      title &&
      description &&
      debouncedContent &&
      imagePrompt &&
      mainImage &&
      slug &&
      !isCreatingStory
    ) {
      createStory(
        {
          account: userId,
          title,
          description,
          slug: slug.trim(),
          mainImage,
          imagePrompt,
          content: debouncedContent,
          category: category as string,
          wordCount: debouncedContent.split(" ").length,
          language: "ar",
          version: 4,
        },
        {
          onSuccess: () => {
            va.track("created-story");
          },
        }
      );
    }
  }, [
    title,
    description,
    debouncedContent,
    imagePrompt,
    mainImage,
    isCreatingStory,
  ]);

  return (
    <>
      <div className={clsx("flex flex-col gap-8 p-6 py-10  pb-20 md:pt-24")}>
        {/* className="p-6 py-10 text-6xl font-bold md:pb-14 md:pt-24 md:text-8xl" */}
        {title ? (
          <h1 className="text-6xl font-bold md:pb-14 md:text-8xl">
            عنوان القصة: {title}
          </h1>
        ) : (
          <div className="h-24 w-3/4 animate-pulse rounded-md bg-gray-400" />
        )}
        {description ? (
          <p className="text-xl">وصف القصة: {description}</p>
        ) : (
          <div className="h-10 w-2/4 animate-pulse rounded-md bg-gray-400" />
        )}
        {slug ? (
          <p className="text-xl">
            الموضوع:{" "}
            {
              categories?.find(
                (categoryItem) =>
                  categoryItem.value === category ||
                  categoryItem.value === storyData?.categories?.[0]?.name
              )?.label
            }
          </p>
        ) : (
          <div className="h-6 w-1/6 animate-pulse rounded-md bg-gray-400" />
        )}

        {mainImage ? (
          <div className="relative h-[500px] w-full md:w-[500px]">
            <Image
              src={"data:image/jpeg;base64," + mainImage}
              alt={(imagePrompt || storyData?.imagePrompt) as string}
              width={500}
              height={500}
              unoptimized={true}
            />
          </div>
        ) : (
          <div className="h-96 w-full animate-pulse rounded-md bg-gray-400 md:w-96" />
        )}

        {content ? (
          <div className="flex flex-col gap-4">
            {content?.split("\n").map((paragraph, index) => (
              <p key={index} className="text-2xl">
                {paragraph?.replace(/🍆|🌈|🏳️‍🌈|/gm, "")}
              </p>
            ))}
          </div>
        ) : (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-full animate-pulse rounded-md bg-gray-400"
            />
          ))
        )}
      </div>
    </>
  );
}
