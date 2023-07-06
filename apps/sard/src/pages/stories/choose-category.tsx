import { Button, Modal, SelectInput } from "@profits-gg/ui";
import clsx from "clsx";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import categories, { fields } from "~/utils/categories";
import names from "~/utils/names";

export default function StoryModal() {
  const router = useRouter();

  const { control, watch } = useForm({
    defaultValues: {
      characterName: null,
    },
  });

  const characterName = watch("characterName");

  return (
    <>
      <NextSeo
        title="سرد - قصة خاصة جديدة لطفلك"
        description="أنشئ قصة خاصة لطفلك، باسم طفلك وموضوع مخصص"
        canonical="https://sard.dev/"
        openGraph={{
          url: "https://sard.dev/",
          title: "سرد - قصة خاصة جديدة لطفلك",
          description: "أنشئ قصة خاصة لطفلك، باسم طفلك وموضوع مخصص",
          siteName: "سرد",
        }}
      />
      <h1 className="md:pt-18 col-span-full p-6 py-4 pt-8 text-4xl font-bold md:text-8xl">
        قصة خاصة جديدة لطفلك
      </h1>
      <div className="flex flex-col items-center gap-4 !bg-gray-200 p-6">
        <div className="mt-4 grid grid-cols-12 gap-4 pb-4 md:w-full">
          <p className="col-span-full mb-4 text-2xl font-bold text-gray-900 md:mt-0 md:text-4xl">
            اختر إسم شخصية القصة
          </p>
          <SelectInput
            control={control}
            label="إسم شخصية القصة"
            name="characterName"
            options={[
              {
                label: "إسم شخصية عشوائي",
                value: null,
              },
              ...(names.map((name) => ({
                label: name,
                value: name,
              })) as any),
            ]}
            className="col-span-full md:col-span-6"
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
          <p className="col-span-full mb-4 text-2xl font-bold text-gray-900 md:mt-0 md:text-4xl">
            اختر موضوع قصتك
          </p>
          {fields.map((field) => (
            <div
              key={field.value}
              className="col-span-full grid grid-cols-12 gap-4"
            >
              <p className="sticky top-0 col-span-full bg-gray-200 pb-4 text-2xl font-bold text-gray-900">
                {field.label}
              </p>
              {categories
                .filter((category) => category.field == field.value)
                .map((category) => (
                  <div
                    key={category.value}
                    className={clsx(
                      "category col-span-6 flex cursor-pointer select-none flex-col rounded-md border-4 border-transparent bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 md:col-span-3"
                    )}
                    onClick={() => {
                      const name = characterName
                        ? characterName
                        : names[Math.floor(Math.random() * names.length)];

                      router.push(
                        `/stories/new?category=${category.value}&characterName=${name}`
                      );
                    }}
                  >
                    <p className="text-4xl">{category.emoji}</p>
                    <p className="text text-xl font-bold text-gray-900">
                      {category.label}
                    </p>
                  </div>
                ))}
            </div>
          ))}

          <Button
            text="العودة للصفحة الرئيسية"
            className="col-span-full mt-8"
            onClick={() => {
              router.push("/");
            }}
          />
        </div>
      </div>
    </>
  );
}
