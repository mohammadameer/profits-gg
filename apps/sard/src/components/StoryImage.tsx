import Image from "next/image";
import { api } from "~/utils/api";

export default function StoryImage({
  id,
  src,
  alt,
}: {
  id: string;
  src: string;
  alt: string;
}) {
  const { data } = api.story.storyImage.useQuery(
    {
      id,
    },
    {
      retry: false,
      enabled: !!id,
    }
  );

  const getSrc = () => {
    if (data?.mainImage?.includes("http")) {
      return data?.mainImage;
    }

    return "data:image/png;base64," + data?.mainImage;
  };

  if (!data?.mainImage && !src) return null;

  return (
    <Image
      id={id}
      key={id}
      src={id ? getSrc() : src}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      className="rounded-md"
      priority
    />
  );
}
