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
  return (
    <Image
      id={id}
      key={id}
      src={src?.includes("http") ? src : "data:image/png;base64," + src}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      className="rounded-md"
      priority
    />
  );
}
