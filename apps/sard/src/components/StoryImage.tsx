import Image from "next/image";
import { api } from "~/utils/api";

export default function StoryImage({
  index,
  id,
  src,
  alt,
}: {
  index?: number;
  id: string;
  src: string;
  alt: string;
}) {
  if (!src) return null;

  return (
    <Image
      id={id}
      key={id}
      src={("data:image/png;base64," + src) as string}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      className="rounded-md"
      priority={index == 0 ? true : false}
      fetchPriority="high"
    />
  );
}
