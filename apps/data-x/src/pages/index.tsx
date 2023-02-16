import { GridCard } from "@profits-gg/ui";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { LoginModalContext } from "../components/Layout";

const Home: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const { setLoginOpen } = useContext(LoginModalContext);

  return (
    <div className="flex w-full grow flex-col items-center gap-10 pb-20">
      <div className="flex w-full flex-col gap-8 px-4 md:px-28">
        <p className="text-2xl">البيانات</p>
        <div className="grid w-full grid-cols-12 gap-4">
          <GridCard
            titleComponent={() => (
              <div className="flex gap-2">
                <p className="select-none text-xl text-black/80">
                  ☁️ المتاجر الإلكترونية
                </p>
                <p className="select-none text-black/40">+54 ألف</p>
              </div>
            )}
            link="/data/onlineStore"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-8 px-4 md:px-28">
        <p className="text-2xl">شخصي</p>
        <div className="grid w-full grid-cols-12 gap-4">
          {/* <GridCard
            title="🚦 المراحل"
            link="/user/stages"
            onClick={() => {
              if (status !== "authenticated") {
                setLoginOpen?.(true);
              } else {
                router.push("/user/stages");
              }
            }}
          /> */}
          <GridCard
            title="🗂️ القوائم"
            link="/user/lists"
            onClick={() => {
              if (status !== "authenticated") {
                setLoginOpen?.(true);
              } else {
                router.push("/user/lists");
              }
            }}
          />
          <GridCard
            title="📦 الإشتراك"
            link="/user/subscription"
            onClick={() => {
              if (status !== "authenticated") {
                setLoginOpen?.(true);
              } else {
                router.push("/user/subscription");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
