import type { Organization } from "@prisma/client";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Button from "../../../../components/form/Button";
import TextInput from "../../../../components/form/TextInput";
import Page from "../../../../components/Page";
import { required } from "../../../../utils/formRules";
import { trpc } from "../../../../utils/trpc";

export default function NewOrganization() {
  const router = useRouter();

  const { control, handleSubmit } = useForm<Organization>();

  const { mutate: createOrganization, isLoading: isCreatingOrganization } =
    trpc.organizations.create.useMutation();

  const onSubmit = async (data: Organization) => {
    createOrganization(
      {
        ...data,
      },
      {
        onSuccess: () => {
          router.push(`/dashboard/user/organizations/`);
        },
      }
    );
  };

  return (
    <Page
      title="🔗 رابط جديد"
      pages={[
        {
          title: "👤 حسابي",
          link: "/dashboard/user",
        },
        {
          title: "🏬 مؤسساتي",
          link: "/dashboard/user/organizations",
        },
        {
          title: "🏬 مؤسسة جديدة",
          link: "/dashboard/user/organizations/new",
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
          placeholder="إسم المؤسسة"
          control={control}
          rules={{ required }}
        />
        <TextInput
          name="description"
          label="الوصف"
          placeholder="وصف للمؤسسة"
          control={control}
        />
        <Button
          text="إضافة"
          type="submit"
          className="w-full md:w-1/2"
          loading={isCreatingOrganization}
        />
      </form>
    </Page>
  );
}
