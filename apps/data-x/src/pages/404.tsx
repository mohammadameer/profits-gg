import { Button } from "@profits-gg/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function NotFound() {
  const router = useRouter();

  const { status } = useSession();
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-8">
      <h1 className="text-4xl">الصفحة غير موجودة 🚁</h1>
      <Button text="الرجوع للصفحة الرئيسية" onClick={() => router.push("/")} />
    </div>
  );
}
