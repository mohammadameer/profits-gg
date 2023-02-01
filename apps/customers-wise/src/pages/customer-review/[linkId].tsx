import type { Review } from "@prisma/client";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Button from "../../components/form/Button";
import TextAreaInput from "../../components/form/TextAreaInput";
import { trpc } from "../../utils/trpc";

export default function CustomerReview() {
  const router = useRouter();
  const { linkId } = router.query;

  const { control, handleSubmit, watch, setValue } = useForm<Review>();

  const rating = watch("rating");

  const { data: link } = trpc.links.retrieve.useQuery({
    linkId: linkId as string,
  });
  const { data: location } = trpc.locations.retrieve.useQuery(
    {
      locationId: link?.locationId as string,
    },
    { enabled: !!link }
  );
  const { mutate: createReview, isLoading: isCreatingReview } =
    trpc.reviews.create.useMutation();

  const onSubmit = (data: Review) => {
    createReview(
      {
        ...data,
        rating: (data.rating as number) ?? 0,
        comment: (data.comment as string) ?? "",
        organizationId: link?.organizationId as string,
        locationId: link?.locationId as string,
        linkId: linkId as string,
      },
      {
        onSuccess: () => {
          router.push("/review-success");
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col items-center justify-center gap-12 py-10 md:min-h-screen"
    >
      <p className="text-4xl">رأيك يهمنا</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {[
          { label: "😡", value: 0 },
          { label: "😠", value: 2 },
          { label: "😐", value: 4 },
          { label: "😊", value: 6 },
          { label: "😃", value: 8 },
          { label: "😍", value: 10 },
        ].map((emoji) => (
          <div
            key={emoji.value}
            className={clsx(
              "flex cursor-pointer flex-col items-center gap-2 grayscale hover:scale-105 hover:grayscale-0 active:scale-95 ",
              rating === emoji.value && "scale-105 grayscale-0"
            )}
            onClick={() => setValue("rating", emoji.value)}
          >
            <p className="text-6xl">{emoji.label}</p>
          </div>
        ))}
      </div>
      <TextAreaInput
        control={control}
        name="comment"
        label="ايش ملاحظاتك؟"
        placeholder="مشكلة، اقتراح، انتقاد، شكر ..."
        className="w-full md:w-3/4 lg:w-1/2"
        height="h-64"
      />

      <Button
        text="ارسال"
        type="submit"
        className="w-full md:w-3/4 lg:w-1/2"
        loading={isCreatingReview}
      />
    </form>
  );
}
