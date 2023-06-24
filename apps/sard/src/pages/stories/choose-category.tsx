import { Button, Modal } from "@profits-gg/ui";
import clsx from "clsx";
import { useRouter } from "next/router";
import categories, { fields } from "~/utils/categories";

export default function StoryModal() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 !bg-gray-200 p-6">
      <div className="mt-4 grid grid-cols-12 gap-4 pb-4 md:w-2/3 lg:w-1/3">
        <p className="col-span-full mb-4 text-4xl font-bold text-gray-900">
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
                    "category col-span-6 flex cursor-pointer flex-col rounded-md border-4 border-transparent bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                  )}
                  onClick={() => {
                    router.push(`/stories/new?category=${category.value}`);
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
  );
}
