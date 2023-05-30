import { useRouter } from "next/router";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <div className="flex w-full pr-5 pt-5">
        <p
          className="text transform cursor-pointer text-4xl font-bold text-gray-900 duration-300 hover:scale-105 active:scale-95 md:text-5xl"
          onClick={() => router.back()}
        >
          📖 سرد
        </p>
      </div>
      {children}
    </div>
  );
}
