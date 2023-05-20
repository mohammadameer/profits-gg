import { type NextPage } from "next";
import Head from "next/head";
import { NextSeo } from "next-seo";

import { api } from "~/utils/api";
import { Button, SelectInput } from "@profits-gg/ui";
import { useForm } from "react-hook-form";
import { required } from "@profits-gg/lib/utils/formRules";
import { useCallback, useState } from "react";
import { useReCaptcha } from "next-recaptcha-v3";
import va from "@vercel/analytics";
import { toast } from "react-hot-toast";

type FormValues = {
  eage: string;
  category: string;
  length: string;
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
  const { control, handleSubmit } = useForm<FormValues>();

  const { executeRecaptcha } = useReCaptcha();

  const { mutate: createStory } = api.story.create.useMutation();
  const { data: stories } = api.story.list.useQuery({
    category: 
  });

  // console.log("stories", stories);

  const [story, setStory] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateStory = useCallback(
    async (values: FormValues) => {
      va.track("create-story");

      if (!values.category) {
        va.track("create-story-no-category");
        return;
      }

      if (isLoading) {
        va.track("create-story-already-loading");
        return;
      }

      setStory("");

      const token = await executeRecaptcha?.("createStory");

      setIsLoading(true);

      va.track("creating-story");

      const response = await fetch("/api/openai/chat", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          category: values.category,
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

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);

        if (chunkValue.includes("rate limit exceeded")) {
          toast.error("انتظر دقيقتين وحاول مرة اخرى");
          setIsLoading(false);
          va.track("rate-limit-exceeded");
          return;
        }

        setStory((prev) => prev + chunkValue);
      }

      if (story) {
        createStory({
          category: values.category,
          content: story,
        });
      }

      setIsLoading(false);
      va.track("created-story");
    },
    [executeRecaptcha, story, createStory, isLoading]
  );

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
      <div className="flex min-h-screen flex-col bg-gray-200 pb-20">
        <div className="p-5">
          <p className="text text-4xl font-bold text-gray-900 md:text-5xl">
            📖 سرد
          </p>
        </div>

        <h1 className="p-6 py-10 text-6xl font-bold md:py-24 md:text-8xl">
          قصص اطفال تعليمية قصيرة
        </h1>

        <form
          onSubmit={handleSubmit(handleCreateStory)}
          className="flex flex-col items-center justify-center p-6"
        >
          <div className="flex w-full flex-col justify-center gap-4 p-6 md:flex-row">
            <SelectInput
              name="category"
              label="موضوع القصة"
              className="w-full md:w-2/3 lg:w-1/3"
              options={[
                {
                  label: "النوم في الوقت المناسب",
                  value: "sleeping-on-time",
                },
                {
                  label: "النظافة الشخصية",
                  value: "personal-hygiene",
                },
                {
                  label: "التنمر",
                  value: "bullying",
                },
                {
                  label: "الثقة في النفس",
                  value: "self-confidence",
                },
                {
                  label: "المسؤولية",
                  value: "responsibility",
                },
                {
                  label: "التعاون",
                  value: "cooperation",
                },
                {
                  label: "التسامح",
                  value: "tolerance",
                },
                {
                  label: "الصدق",
                  value: "honesty",
                },
              ]}
              control={control}
              disabled={isLoading}
              classNames={SelectInputClassNames}
              rules={{ required }}
            />
          </div>
          <Button
            text="قصة جديدة"
            type="submit"
            loading={isLoading}
            className="w-full md:w-2/6"
          />
        </form>

        <div className="flex flex-col items-center justify-center gap-4 p-6">
          {story && (
            <div className="flex flex-col items-center justify-center gap-4 p-6">
              <p className="text text-2xl font-bold leading-10 text-gray-900 md:text-3xl">
                {story}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
