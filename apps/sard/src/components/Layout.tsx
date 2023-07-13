import { useRouter } from "next/router";
import { Button } from "@profits-gg/ui";
import clsx from "clsx";
import Link from "next/link";

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
          <Link
            href="/"
            className="text transform cursor-pointer text-4xl font-bold text-gray-900 duration-300 hover:scale-105 active:scale-95 md:text-5xl"
          >
            📖 سرد
          </Link>
          <Button
            id="new-story"
            text="قصة جديدة 🪄"
            onClick={() => {
              router.push("/stories/choose-category");
            }}
            className=" !bg-blue-500 !text-white"
          />
        </div>
        {children}
        <div className="flex flex-col items-center justify-between gap-8 p-4 lg:flex-row">
          <div className="flex gap-4">
            <Link href="/">الصفحة الرئيسية</Link>
            <Link href="/categories">مواضيع قصص</Link>
          </div>
          <div className="flex gap-4">
            <p>تواصل معنا بـ</p>
            <a
              id="email"
              className="text text-center font-bold text-gray-900"
              href="mailto:mohammad@sard.dev"
            >
              الإيميل
            </a>
            |
            <a
              id="whatsapp"
              className="text text-center font-bold text-gray-900"
              href="https://wa.me/message/ENCFJL362JZCA1"
              target="_blank"
            >
              الواتساب
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
