import type { Link } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Button from "../../../components/form/Button";
import TextInput from "../../../components/form/TextInput";
import Page from "../../../components/Page";
import { required } from "../../../utils/formRules";
import { trpc } from "../../../utils/trpc";

export default function NewLink() {
  const router = useRouter();
  const { locationId } = router.query;

  const { control, handleSubmit } = useForm<Link>();

  const { data: session } = trpc.auth.getSession.useQuery();

  const { data: location } = trpc.locations.retrieve.useQuery({
    locationId: locationId as string,
  });
  const { mutate: createLink, isLoading: isCreatingLink } =
    trpc.links.create.useMutation();

  const onSubmit = async (data: Link) => {
    createLink(
      {
        ...data,
        locationId: locationId as string,
      },
      {
        onSuccess: () => {
          router.push(`/dashboard/locations/${locationId}/links`);
        },
      }
    );
  };

  return (
    <Page
      title="🔗 رابط جديد"
      pages={[
        { title: "📍 فروعي", link: "/dashboard/locations" },
        {
          title: location ? `📍 ${location.name}` : "...",
          link: "/dashboard/locations/" + locationId,
        },
        {
          title: "🔗 الروابط",
          link: "/dashboard/locations/" + locationId + "/links",
        },
        {
          title: "🔗 رابط جديد",
          link: "/dashboard/locations/" + locationId + "/links/new",
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
          placeholder="إسم الرابط"
          control={control}
          rules={{ required }}
        />
        <TextInput
          name="description"
          label="الوصف"
          placeholder="وصف للرابط"
          control={control}
        />
        <Button
          text="إضافة"
          type="submit"
          className="w-full md:w-1/2"
          loading={isCreatingLink}
        />
      </form>
    </Page>
  );
}
