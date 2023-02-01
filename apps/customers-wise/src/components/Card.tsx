import { useRouter } from "next/router";
import type { FC } from "react";

type CardProps = {
  title: string;
  link: string;
};

const Card: FC<CardProps> = ({ link, title }) => {
  const router = useRouter();
  return (
    <div
      className="col-span-full h-48 cursor-pointer rounded-lg bg-white p-4 transition-all hover:scale-105 active:scale-95 md:col-span-4"
      onClick={() => router.push(link)}
    >
      <p className="select-none text-xl text-black/80">{title}</p>
    </div>
  );
};

export default Card;
