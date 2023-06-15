import Image from "next/image";
import { api } from "~/utils/api";

export default function StoryImage({ id, alt }: { id: string; alt: string }) {
  const { data } = api.story.storyImage.useQuery({
    id,
  });

  if (!data?.mainImage) return null;

  return (
    <Image
      id={id}
      key={id}
      src={
        data?.mainImage?.includes("http")
          ? data?.mainImage
          : "data:image/png;base64," + data?.mainImage
      }
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      className="rounded-md"
      unoptimized={true}
    />
  );
}
