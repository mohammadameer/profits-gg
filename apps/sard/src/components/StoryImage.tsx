import clsx from "clsx";
import Image from "next/image";
import { api } from "~/utils/api";

export default function StoryImage({
  index,
  id,
  src,
  alt,
  className,
}: {
  index?: number;
  id: string;
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) return null;

  return (
    <Image
      id={id}
      key={id}
      src={"data:image/png;base64," + src}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      className={clsx("rounded-md", className)}
      priority={index == 0 ? true : false}
      fetchPriority="high"
    />
  );
}
