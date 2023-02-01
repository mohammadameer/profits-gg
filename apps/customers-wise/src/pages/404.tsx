import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Button from "../components/form/Button";

export default function NotFound() {
  const router = useRouter();

  const { status } = useSession();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8">
      <h1 className="text-4xl">الصفحة غير موجودة 🚁</h1>
      <Button
        text="الرجوع للصفحة الرئيسية"
        onClick={() => {
          if (status === "authenticated") {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        }}
      />
    </div>
  );
}
