import { List, Stage } from "@prisma/client";
import { required } from "@profits-gg/lib/utils/formRules";
import { Button, Page, TextInput } from "@profits-gg/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { api } from "../../../utils/api";

export default function NewStage() {
  const router = useRouter();

  const { control, handleSubmit } = useForm<Stage>();

  const { mutate: createStage, isLoading: isCreatingStage } =
    api.stage.create.useMutation();

  const onSubmit = async (data: Stage) => {
    createStage(
      {
        name: data.name as string,
        description: data.description as string,
      },
      {
        onSuccess: () => {
          router.push(`/user/stages`);
        },
      },
    );
  };

  return (
    <Page
      title="🔗 رابط جديد"
      pages={[
        { title: "شخصي", link: "/" },
        {
          title: "🚦 المراحل",
          link: "/user/stages",
        },
        {
          title: "🚦 مرحلة جديدة",
          link: "/user/stages/create",
        },
      ]}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4 md:w-1/2"
      >
        <TextInput
          name="name"
          label="الإسم"
          placeholder="إسم المرحلة"
          control={control}
          rules={{ required }}
        />
        <TextInput
          name="description"
          label="الوصف"
          placeholder="وصف المرحلة"
          control={control}
        />
        <Button
          text="إضافة"
          type="submit"
          className="w-full md:w-1/2"
          loading={isCreatingStage}
        />
      </form>
    </Page>
  );
}
