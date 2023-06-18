import { Button, Modal } from "@profits-gg/ui";
import clsx from "clsx";
import { useRouter } from "next/router";
import categories from "~/utils/categories";

export default function StoryModal() {
  const router = useRouter();

  return (
    <div className="!bg-gray-200 p-6">
      <div className="mt-4 grid w-full grow grid-cols-12 gap-4 pb-4">
        {categories.map((category) => (
          <div
            className={clsx(
              "col-span-6 flex cursor-pointer flex-col rounded-md border-4 border-transparent bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
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
    </div>
  );
}