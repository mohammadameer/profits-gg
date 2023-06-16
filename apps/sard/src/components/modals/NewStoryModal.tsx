import { Button, Modal } from "@profits-gg/ui";
import { router } from "@trpc/server";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import categories, { Category } from "~/utils/categories";

type StoryModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function StoryModal({ open, setOpen }: StoryModalProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>();

  useEffect(() => {
    if (!open) {
      setSelectedCategory(undefined);
      document.body.style.overflow = "unset";
    } else {
      document.body.style.overflow = "hidden";
    }
  }, [open]);

  return (
    <Modal open={open} setOpen={setOpen} className="!bg-gray-200 shadow-md">
      <div className="mt-4 grid w-full grow grid-cols-12 gap-4 pb-4">
        {categories.map((category) => (
          <div
            className={clsx(
              "col-span-6 flex cursor-pointer flex-col rounded-md border-4 border-transparent bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95",
              selectedCategory?.id === category.id &&
                "border-4 !border-blue-500 "
            )}
            onClick={() => {
              setOpen(false);
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
    </Modal>
  );
}
