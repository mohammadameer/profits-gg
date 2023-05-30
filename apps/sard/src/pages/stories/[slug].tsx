import { useReCaptcha } from "next-recaptcha-v3";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import va from "@vercel/analytics";
import Image from "next/image";
import useDebounce from "@profits-gg/lib/hooks/useDebounce";

const categories = {
  "sleeping-on-time": "النوم في الوقت المناسب",
  "personal-hygiene": "النظافة الشخصية",
  bullying: "التنمر",
  "self-confidence": "الثقة في النفس",
  responsibility: "المسؤولية",
  cooperation: "التعاون",
  tolerance: "التسامح",
  honesty: "الصدق",
};

export default function Story() {
  const router = useRouter();
  const { slug: slugFromRouter, category, gender } = router.query;

  const { executeRecaptcha, loaded: isRecaptchaLoaded } = useReCaptcha();

  const createCalledRef = useRef(false);

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
  const { mutate: getImage, isLoading: isGettingImage } =
    api.openai.getImage.useMutation();

  const { mutate: createStory, isLoading: isCreatingStory } =
    api.story.create.useMutation();

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

    const token = await executeRecaptcha?.("createStory");

    va.track("creating-story");

    const response = await fetch("/api/openai/chat", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        category: category as string,
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
        toast.error("وصلت الحد الأقصى للقصص في اليوم");
        setIsLoading(false);
        va.track("rate-limit-exceeded");
        router.back();
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
      if (categories[category as keyof typeof categories]) {
        // check if story is already created
        if (!title && !description && !slug && !mainImage && !content) {
          handleCreateStory();
          createCalledRef.current = true;
        }
      } else {
        toast.error("الموضوع غير موجود");
        router.back();
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
          title,
          description,
          slug: slug.trim(),
          mainImage,
          imagePrompt,
          content: debouncedContent,
          category: category as string,
          gender: gender as string,
          wordCount: debouncedContent.split(" ").length,
          language: "ar",
          version: 2,
        },
        {
          onSuccess: () => {
            va.track("created-story");
          },
        }
      );
    }
  }, [title, description, debouncedContent, imagePrompt, mainImage]);

  return (
    <div className="flex flex-col gap-8 p-6 py-10  pb-20 md:pt-24">
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
          {storyData?.categories?.[0]?.name
            ? categories[
                storyData?.categories?.[0]?.name as keyof typeof categories
              ]
            : category
            ? categories[category as keyof typeof categories]
            : ""}
        </p>
      ) : (
        <div className="h-6 w-1/6 animate-pulse rounded-md bg-gray-400" />
      )}

      {mainImage ? (
        <Image
          src={mainImage as string}
          alt={(imagePrompt || storyData?.imagePrompt) as string}
          width={500}
          height={500}
        />
      ) : (
        <div className="h-96 w-96 animate-pulse rounded-md bg-gray-400" />
      )}

      {content ? (
        <div className="flex flex-col gap-4">
          {content?.split("\n").map((paragraph, index) => (
            <p key={index} className="text-2xl">
              {paragraph}
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
  );
}
