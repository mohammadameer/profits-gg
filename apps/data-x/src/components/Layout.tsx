import type { FC, ReactNode } from "react";
import React, { useEffect, useState } from "react";

// utils
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import posthog from "posthog-js";
import { toast, Toaster } from "react-hot-toast";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import {
  Button,
  CodeInput,
  MenuButton,
  Modal,
  SelectInput,
  TextInput,
} from "@profits-gg/ui";
import { required } from "@profits-gg/lib/utils/formRules";
import { api } from "../utils/api";

type LayoutProps = {
  children: ReactNode;
  className?: string;
};

const nonAuthPages: string[] = [];

export const LoginModalContext = React.createContext({
  setLoginOpen: (open: boolean) => {},
});

const Layout: FC<LayoutProps> = ({ children }) => {
  const { control, watch, handleSubmit, setValue } = useForm();

  const email = watch("email");
  const code = watch("code");
  const organization = watch("organization");

  const router = useRouter();
  const route = router.route;
  const { error } = router.query;

  const { data, status } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userIdentified, setUserIdentified] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { invalidate } = api.useContext();

  // const { data: session } = api.auth.getSession.useQuery();

  // alert when login error
  useEffect(() => {
    if (error) {
      toast("خطأ في تسجيل الدخول", {
        icon: "🚨",
      });
    }
  }, [error]);

  // go to dashboard if not authenticated and identify user if loged in
  useEffect(() => {
    if (data?.user?.id && !userIdentified) {
      posthog.identify(data?.user?.id, {
        email: data?.user?.email,
        name: data?.user?.name,
      });
      setUserIdentified(true);
    }
  }, [status, data]);

  const loginWithEmail = async () => {
    try {
      if (emailSent) {
        window.location.href = `/api/auth/callback/email?email=${encodeURIComponent(
          email,
        )}&token=${code}`;
      } else {
        setLoading(true);
        const res = await signIn("email", {
          email,
          redirect: false,
          callbackUrl: "/",
        });
        setLoading(false);
        if (res?.error) {
          toast("خطأ في تسجيل الدخول", {
            icon: "🚨",
          });
        } else {
          setEmailSent(true);
        }
      }
    } catch (e) {
      toast("خطأ في تسجيل الدخول", {
        icon: "🚨",
      });
      console.error(e);
    }
  };

  const isNonAuthPage =
    nonAuthPages.some((page) => route.includes(page)) || false;
  const isAuthenticated = status === "authenticated";

  return (
    <div className="flex min-h-screen bg-gray-900">
      {!isNonAuthPage ? (
        <div
          className={clsx(
            "fixed top-0 left-0 z-20 flex w-full items-center justify-between px-8 py-6 transition-all",
            loginOpen && "blur-[4px]",
          )}
        >
          <div className="flex items-end gap-4">
            <p
              className="cursor-pointer select-none text-6xl transition-all hover:scale-105 active:scale-95"
              onClick={() => router.push("/")}
            >
              🗃️
            </p>
          </div>

          <div className="hidden items-center justify-between gap-2 lg:flex">
            <Button
              text={
                status === "authenticated"
                  ? "تسجيل الخروج  🫡"
                  : " تسجيل /  تسجيل الدخول 👤"
              }
              onClick={() => {
                if (status === "authenticated") {
                  signOut({ callbackUrl: "/" });
                } else {
                  setLoginOpen(true);
                }
              }}
            />
          </div>
          <MenuButton
            isOpen={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            strokeWidth="2"
            lineProps={{ strokeLinecap: "round" }}
            className="z-10 block lg:hidden"
          />
        </div>
      ) : null}

      {menuOpen && !isNonAuthPage ? (
        <div
          className={clsx(
            "fixed top-0 left-0 z-10 flex h-screen w-full flex-col justify-between overflow-scroll bg-gray-800 px-6 pb-20 pt-32 md:right-0 md:w-3/12 md:rounded-l-lg md:pt-36 md:pb-10",
            route == "/" && "md:hidden",
          )}
        >
          <div className="flex grow flex-col justify-end gap-4 ">
            <Button
              text={
                status === "authenticated"
                  ? "تسجيل الخروج  🫡"
                  : " تسجيل /  تسجيل الدخول 👤"
              }
              onClick={() => {
                if (status === "authenticated") {
                  signOut({ callbackUrl: "/" });
                } else {
                  setLoginOpen(true);
                }
              }}
              className="md:hidden"
            />
          </div>
        </div>
      ) : null}

      <div
        className={clsx(
          `relative flex grow flex-col items-start gap-8 px-6 transition-all`,
          "pt-32",
          loginOpen && "blur-[4px]",
        )}
      >
        <LoginModalContext.Provider
          value={{
            setLoginOpen,
          }}
        >
          {children}
        </LoginModalContext.Provider>
      </div>
      <Toaster />

      <Modal
        open={loginOpen}
        setOpen={setLoginOpen}
        onClose={() => {
          setLoading(false);
          setEmailSent(false);
          setValue("email", "");
          setValue("code", "");
        }}
      >
        <form
          onSubmit={handleSubmit(loginWithEmail)}
          className="flex w-full flex-col p-4"
        >
          <p className="mb-8 text-xl">تسجيل / تسجيل الدخول 👤 بــ</p>
          <Button
            text="حساب Google"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          />
          <div className="my-4 h-1 w-full bg-gray-500" />
          <TextInput
            name="email"
            label="الإيميل"
            control={control}
            rules={{ required: required }}
            autoComplete="true"
          />
          {emailSent ? (
            <CodeInput
              name="code"
              label="رمز الدخول"
              control={control}
              rules={{ required }}
            />
          ) : null}
          <Button
            text={emailSent ? "تأكد رمز الدخول" : "إرسال رمز الدخول"}
            loading={loading}
            type="submit"
            className="mt-2"
          />
        </form>
      </Modal>
    </div>
  );
};

export default Layout;
