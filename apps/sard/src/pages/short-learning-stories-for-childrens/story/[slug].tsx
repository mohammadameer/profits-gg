import { ReCaptcha, ReCaptchaProvider } from "next-recaptcha-v3";
import {
  type LocalizedRouteParameters,
  getLocalizedRouteParameters,
  useRouter,
} from "next-multilingual/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import va from "@vercel/analytics";
import useDebounce from "@profits-gg/lib/hooks/useDebounce";
import clsx from "clsx";
import { useLocalStorage } from "usehooks-ts";
import categories from "~/utils/categories";
import Compressor from "compressorjs";
import { type GetStaticPaths, type GetServerSidePropsContext } from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import SuperJSON from "superjson";
import { prisma } from "~/server/db";
import StoryImage from "~/components/StoryImage";
import StoriesInSameCategory from "~/components/StoriesInSameCategory";
import PdfDownloader from "~/components/PDFDownloader";
import { useMessages } from "next-multilingual/messages";
import arSANames from "~/utils/ar-SA.names";
import enUSNames from "~/utils/en-US.names";
import { getStaticPathsLocales, getStaticPropsLocales } from "next-multilingual";
import SEO from "~/components/SEO";
import { useGetLocalizedUrl } from "next-multilingual/url";
import Link from "next-multilingual/link";
import { Button } from "@profits-gg/ui";

const getFontSize = (fontSize: number) => {
  switch (fontSize) {
    case 1:
      return "text-2xl";
    case 2:
      return "text-3xl";
    case 3:
      return "text-4xl";
    case 4:
      return "text-5xl";
    case 5:
      return "text-6xl";
    default:
      return "text-2xl";
  }
};

export default function Story({
  names,
  localizedRouteParameters,
}: {
  names: string[];
  localizedRouteParameters: LocalizedRouteParameters;
}) {
  const router = useRouter();
  const { slug: slugFromRouter, category, characterName, place } = router.query;

  const { getLocalizedUrl } = useGetLocalizedUrl();
  const messages = useMessages();

  const [token, setToken] = useState<string>();

  const createCalledRef = useRef(false);

  const [userId] = useLocalStorage<string>("userId", "");

  const { data: storyData } = api.story.get.useQuery(
    {
      slug: slugFromRouter as string,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: false,
    }
  );

  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    refetch: refetchUser,
  } = api.user.get.useQuery(
    {
      id: userId,
    },
    {
      enabled: false,
    }
  );
  const { mutate: getImage, isLoading: isGettingImage } = api.openai.getImage.useMutation();

  const {
    mutate: createStory,
    isLoading: isCreatingStory,
    data: storyCreateData,
  } = api.story.create.useMutation();

  const [prepation, setPrepation] = useState<string>(storyData?.prepation as string);
  const [title, setTitle] = useState<string>(storyData?.title as string);
  const [description, setDescription] = useState<string>(storyData?.description as string);
  const [slug, setSlug] = useState<string>(storyData?.slug as string);
  const [mainImage, setMainImage] = useState<string>(storyData?.mainImage as string);
  const [content, setContent] = useState<string>(storyData?.content as string);
  const [imagePrompt, setImagePrompt] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(2);

  const debouncedImagePrompt = useDebounce(imagePrompt, 500);
  const debouncedContent = useDebounce(content, 5000);

  const handleCreateStory = useCallback(async () => {
    setIsLoading(true);

    setPrepation("");
    setTitle("");
    setDescription("");
    setSlug("");
    setMainImage("");
    setContent("");
    setImagePrompt("");

    va.track("creating-story");

    const response = await fetch("/api/openai/chat", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        language: router.locale,
        category: category as string,
        characterName: characterName as string,
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
          router.push("/memberships");
        }

        return;
      }

      result += chunkValue;

      const [prepation, title, description, slug, imagePrompt, content] = result.split("#");

      if (prepation) setPrepation(prepation);
      if (title) setTitle(title);
      if (description) setDescription(description);
      if (slug) setSlug(slug);
      if (imagePrompt) setImagePrompt(imagePrompt);
      if (content) setContent(content);
    }

    setIsLoading(false);
  }, [token, category, characterName, isLoading, user]);

  // create story if category is selected or get story if slug is selected
  useEffect(() => {
    if (
      category &&
      characterName &&
      slugFromRouter == "new" &&
      token &&
      !isLoading &&
      !createCalledRef.current
    ) {
      // check if category is valid
      if (
        categories?.find((categoryItem) => categoryItem.value === category) &&
        names?.find((name) => name === (characterName as string))
      ) {
        // check if story is already created
        if (!prepation && !title && !description && !slug && !mainImage && !content) {
          handleCreateStory();
          createCalledRef.current = true;
        }
      } else {
        va.track("invalid params");
        toast.error("بيانات غير صحيحة", {
          icon: "👀",
        });
        router.push("/");
      }
    }
  }, [category, characterName, token, slugFromRouter, isLoading]);

  // get image if image prompt is set
  useEffect(() => {
    if (debouncedImagePrompt && !mainImage && !isGettingImage) {
      va.track("getting-image");
      getImage(
        {
          prompt: debouncedImagePrompt,
        },
        {
          onSuccess: (data) => {
            setMainImage(data);
          },
        }
      );
    }
  }, [debouncedImagePrompt]);

  // if prepation title, description, content and image are set, update the story
  useEffect(() => {
    if (
      !storyCreateData &&
      !storyData &&
      prepation &&
      title &&
      description &&
      debouncedContent &&
      imagePrompt &&
      mainImage &&
      slug &&
      !isCreatingStory
    ) {
      const handleCreateStory = async () => {
        function dataURLtoFile(dataurl: string, filename: string) {
          let arr = dataurl.split(",") as any[],
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[arr.length - 1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
        }

        const compressedImage = await new Promise<string>((resolve) => {
          const url = "data:image/png;base64," + mainImage;
          const imageFile = dataURLtoFile(url, `${Date.now()}.png`);

          new Compressor(imageFile, {
            strict: true,
            checkOrientation: true,
            maxWidth: 0,
            maxHeight: 0,
            minWidth: 0,
            minHeight: 0,
            width: 256,
            height: 256,
            resize: "cover",
            quality: 0.4,
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
        });

        const smallCompressedImage = await new Promise<string>((resolve) => {
          const url = "data:image/png;base64," + mainImage;
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
        });

        createStory(
          {
            account: userId,
            prepation,
            title,
            description,
            slug: slug.trim(),
            mainImage: compressedImage?.replace("data:image/jpeg;base64,", ""),
            smallImage: smallCompressedImage?.replace("data:image/jpeg;base64,", ""),
            imagePrompt,
            content: debouncedContent,
            category: category as string,
            wordCount: debouncedContent.split(" ").length,
            language: router.locale,
            version: 4,
          },
          {
            onSuccess: () => {
              va.track("created-story");
            },
          }
        );
      };
      handleCreateStory();
    }
  }, [prepation, title, description, debouncedContent, imagePrompt, mainImage, isCreatingStory]);

  return (
    <>
      <SEO
        title={`${messages.format("story")} ${title}`}
        description={`${messages.format("story")} ${messages.format("about")} ${title}, ${description}`}
        image={`https://www.sard.dev/images/${storyData?.slug as string}.jpg`}
        url={getLocalizedUrl(
          `/short-learning-stories-for-childrens/story/${encodeURIComponent(storyData?.slug as string)}`,
          router.locale,
          localizedRouteParameters,
          true
        )}
        keywords={[messages.format("story"), title, description]}
        published_time={storyData?.createdAt?.toISOString()}
        modified_time={storyData?.updatedAt?.toISOString()}
      />

      <ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY} useEnterprise={true}>
        <ReCaptcha onValidate={setToken} action="page_view" />
        <div key={storyData?.id} className={clsx("flex flex-col gap-6 p-6 py-10  pb-20 md:pt-12")}>
          {title ? (
            <h1 className="pb-8 text-6xl font-bold md:pb-14 ">
              {messages.format("story")} {title}
            </h1>
          ) : (
            <div className="h-24 w-3/4 animate-pulse rounded-md bg-gray-400" />
          )}
          <div className="flex justify-end gap-4">
            <Button
              text={messages.format("increaseFont")}
              onClick={() => {
                if (fontSize < 5) {
                  setFontSize(fontSize + 1);
                }
              }}
            />
            <Button
              text={messages.format("decreaseFont")}
              onClick={() => {
                if (fontSize > 1) {
                  setFontSize(fontSize - 1);
                }
              }}
            />
          </div>
          {description ? (
            <h2 className={clsx("leading-normal", getFontSize(fontSize))}>{description}</h2>
          ) : (
            <div className="h-10 w-2/4 animate-pulse rounded-md bg-gray-400" />
          )}
          {slug ? (
            <p className={clsx("leading-normal", getFontSize(fontSize))}>
              {messages.format("about")}{" "}
              {
                // @ts-ignore
                categories?.find(
                  (categoryItem) =>
                    categoryItem.value === category || categoryItem.value === storyData?.categories?.[0]?.name
                )?.label[router.locale]
              }
            </p>
          ) : (
            <div className="h-6 w-1/6 animate-pulse rounded-md bg-gray-400" />
          )}

          {!isLoading && storyData?.id ? (
            <div>
              <PdfDownloader
                text={messages.format("downloadStoryAsPDF")}
                downloadFileName={title}
                rootElementId="sard_page"
              />
            </div>
          ) : (
            <div className="h-14" />
          )}

          {mainImage ? (
            <div className="relative aspect-square max-h-[500px] w-full md:w-[500px]" id="page-break-after">
              <StoryImage
                id={storyData?.id as string}
                src={mainImage}
                alt={(imagePrompt || storyData?.imagePrompt) as string}
              />
            </div>
          ) : (
            <div className="h-96 w-full animate-pulse rounded-md bg-gray-400 md:w-96" />
          )}

          {content ? (
            <div className="flex flex-col gap-4 break-words">
              {content?.split("\n").map((paragraph, index) => (
                <p
                  key={index}
                  className={clsx("break-inside-avoid break-words leading-normal", getFontSize(fontSize))}>
                  {paragraph?.replace(/🍆|🌈|🏳️‍🌈|/gm, "")}
                </p>
              ))}
            </div>
          ) : (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 w-full animate-pulse rounded-md bg-gray-400" />
            ))
          )}

          {content && !isLoading ? (
            <div className="my-4 flex w-1/2 flex-col gap-4 border-t border-black pt-6" id="page-break-after">
              <p className={getFontSize(fontSize)}>{messages.format("storyEnded")}</p>
            </div>
          ) : null}

          {!isLoading && storyData?.id ? (
            <Link
              href="/short-learning-stories-for-childrens/new-and-special-story-for-your-children"
              className="text h-auto rounded-lg bg-blue-500 px-6 py-4 text-center font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 lg:w-1/3">
              {messages.format("newStory")} 🪄
            </Link>
          ) : null}

          <Link
            href="/short-learning-stories-for-childrens"
            className="text h-auto rounded-lg bg-white px-6 py-4 text-center font-bold transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 lg:w-1/3">
            {messages.format("returnToStories")} 📃
          </Link>

          {!isLoading && storyData?.id ? (
            <StoriesInSameCategory
              storyId={storyData?.id}
              categoryName={storyData?.categories?.[0]?.name as string}
            />
          ) : null}
        </div>
      </ReCaptchaProvider>
    </>
  );
}

export async function getStaticProps(context: GetServerSidePropsContext<{ slug: string }>) {
  const slug = decodeURIComponent(context?.params?.slug as string);

  const { locale } = getStaticPropsLocales(context);

  const localizedRouteParameters = getLocalizedRouteParameters(
    context,
    {
      slug,
    },
    import.meta.url
  );

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(),
    transformer: SuperJSON,
  });

  await helpers?.story?.get?.prefetch({
    slug,
  });

  const allNames = {
    "ar-sa": arSANames,
    "en-us": enUSNames,
  };

  return {
    props: {
      trpcState: helpers?.dehydrate(),
      slug,
      localizedRouteParameters,
      names: allNames[locale as keyof typeof allNames],
      key: slug,
    },
  };
}

export const getStaticPaths: GetStaticPaths = async (context) => {
  const { locales } = getStaticPathsLocales(context);

  const storiesPaths: { params: { slug: string }; locale: string }[] = [];

  await Promise.all(
    locales?.map(async (locale) => {
      await prisma.story
        .findMany({
          where: {
            language: locale,
            hidden: false,
          },
          select: {
            slug: true,
          },
        })
        .then((data) => {
          data.forEach((story) => {
            storiesPaths.push({
              params: {
                slug: story.slug as string,
              },
              locale,
            });
            storiesPaths.push({
              params: {
                slug: encodeURIComponent(story.slug as string),
              },
              locale,
            });
          });
        });

      return locale;
    })
  );

  return {
    paths: storiesPaths,
    fallback: "blocking",
  };
};
