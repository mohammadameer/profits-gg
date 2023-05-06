import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { Button, SelectInput } from "@profits-gg/ui";
import { useForm } from "react-hook-form";
import { required } from "@profits-gg/lib/utils/formRules";
import { useState } from "react";
import va from "@vercel/analytics";

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

  const [story, setStory] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const createStory = async (values: FormValues) => {
    if (!values.eage || !values.category || !values.length) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (story) {
      setStory("");
    }

    va.track("story-created");
    
    setIsLoading(true);

    const response = await fetch("/api/openai/chat", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        message: `انا ام او اب واريد تعليم ابني، هل يمكنك كتابة قصة عن ${values.category} لشخص عمره ما بين ${values.eage} ولا تتعدى ${values.length}`,
      }),
    });

    if (!response.ok) {
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
      setStory((prev) => prev + chunkValue);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>📖 سرد</title>
        <meta name="description" content="سرد - قصص" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-gray-200 pb-20">
        <div className="p-5">
          <p className="text text-4xl font-bold text-gray-900 md:text-5xl">
            📖 سرد
          </p>
        </div>

        <h1 className="p-6 py-10 text-6xl font-bold md:py-24 md:text-8xl">
          قصص تعليمية
        </h1>

        <form
          onSubmit={handleSubmit(createStory)}
          className="flex grow flex-col items-center justify-center p-6"
        >
          <div className="flex w-full flex-col gap-4 p-6 md:flex-row">
            <SelectInput
              name="eage"
              label="العمر"
              options={[
                {
                  label: "٠ - ٥ سنوات",
                  value: "٠ - ٥ سنوات",
                },
                {
                  label: "٥ - ١٠ سنوات",
                  value: "٥ - ١٠ سنوات",
                },
                {
                  label: "١٠ - ١٥ سنوات",
                  value: "١٠ - ١٥ سنوات",
                },
                {
                  label: "١٥ - ٢٠ سنوات",
                  value: "١٥ - ٢٠ سنوات",
                },
                {
                  label: "آكبر من ٢٠ سنة",
                  value: "آكبر من ٢٠ سنة",
                },
              ]}
              control={control}
              disabled={isLoading}
              classNames={SelectInputClassNames}
              rules={{ required }}
            />
            <SelectInput
              name="category"
              label="موضوع القصة"
              options={[
                {
                  label: "النوم في الوقت المناسب",
                  value: "النوم في الوقت المناسب",
                },
                {
                  label: "النظافة الشخصية",
                  value: "النظافة الشخصية",
                },
                {
                  label: "التنمر",
                  value: "التنمر",
                },
                {
                  label: "الثقة في النفس",
                  value: "الثقة في النفس",
                },
                {
                  label: "المسؤولية",
                  value: "المسؤولية",
                },
                {
                  label: "التعاون",
                  value: "التعاون",
                },
                {
                  label: "التسامح",
                  value: "التسامح",
                },
                {
                  label: "الصدق",
                  value: "الصدق",
                },
              ]}
              control={control}
              disabled={isLoading}
              classNames={SelectInputClassNames}
              rules={{ required }}
            />
            <SelectInput
              name="length"
              label="طول القصة"
              options={[
                {
                  label: "دقيقة واحدة",
                  value: "دقيقة واحدة",
                },
                {
                  label: "٣ دقائق",
                  value: "٣ دقائق",
                },
                {
                  label: "٥ دقائق",
                  value: "٥ دقائق",
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