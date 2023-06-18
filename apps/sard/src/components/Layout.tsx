import { useRouter } from "next/router";
import { Button } from "@profits-gg/ui";
import clsx from "clsx";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <>
      <div
        className={clsx(
          "flex min-h-screen flex-col bg-gray-200 transition-all duration-300"
        )}
      >
        <div className="flex w-full items-center justify-between p-6">
          <p
            className="text transform cursor-pointer text-4xl font-bold text-gray-900 duration-300 hover:scale-105 active:scale-95 md:text-5xl"
            onClick={() => router.push("/")}
          >
            📖 سرد
          </p>
          <Button
            text="قصة جديدة 🪄"
            onClick={() => {
              router.push("/stories/choose-category");
            }}
            className=" !bg-blue-500 !text-white"
          />
        </div>
        {children}
        <div className="flex justify-end gap-4 p-4">
          <p>تواصل معنا بـ</p>
          <a
            className="text text-center font-bold text-gray-900"
            href="mailto:mohammad@sard.dev"
          >
            الإيميل
          </a>
          |
          <a
            className="text text-center font-bold text-gray-900"
            href="https://wa.me/message/ENCFJL362JZCA1"
            target="_blank"
          >
            الواتساب
          </a>
        </div>
      </div>
    </>
  );
}
