import { useRouter } from "next/router";
import type { FC } from "react";

export type GridCardProps = {
  title?: string;
  titleComponent?: () => JSX.Element;
  link: string;
  onClick?: () => void;
};

const GridCard: FC<GridCardProps> = ({
  link,
  title,
  titleComponent,
  onClick,
}) => {
  const router = useRouter();
  return (
    <div
      className="col-span-full h-48 cursor-pointer rounded-lg bg-white p-4 transition-all hover:scale-105 active:scale-95 md:col-span-6 lg:col-span-4"
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          router.push(link);
        }
      }}
    >
      {titleComponent ? (
        titleComponent()
      ) : (
        <p className="select-none text-xl text-black/80">{title}</p>
      )}
    </div>
  );
};

export default GridCard;
