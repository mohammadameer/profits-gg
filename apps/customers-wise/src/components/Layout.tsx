import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";

// utils
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "./form/Button";
import { useRouter } from "next/router";
import { MenuButton } from "./MenuButton";
import useWindowSize from "../hooks/utils/useWindowSize";
import posthog from "posthog-js";
import { toast, Toaster } from "react-hot-toast";
import clsx from "clsx";
import Modal from "./Modal";
import TextInput from "./form/TextInput";
import { useForm } from "react-hook-form";
import { required } from "../utils/formRules";
import CodeInput from "./form/CodeInput";
import SelectInput from "./form/SelectInput";
import { trpc } from "../utils/trpc";

type LayoutProps = {
  children: ReactNode;
  className?: string;
};

const nonAuthPages = ["customer-review", "/review-success", "privacy"];

const Layout: FC<LayoutProps> = ({ children }) => {
  const { control, watch, handleSubmit, setValue } = useForm();

  const email = watch("email");
  const code = watch("code");
  const organization = watch("organization");

  const router = useRouter();
  const route = router.route;
  const { error } = router.query;

  const { data, status } = useSession();

  const { width } = useWindowSize();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userIdentified, setUserIdentified] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { invalidate } = trpc.useContext();

  const { data: session } = trpc.auth.getSession.useQuery();

  const { data: organizations } = trpc.organizations.list.useQuery();

  const { mutate: updateUser } = trpc.users.update.useMutation();

  const updateOrganization = async () => {
    await updateUser(
      {
        organization,
      },
      {
        onSuccess: () => invalidate(),
      }
    );
  };

  // show sidbar on desktops
  useEffect(() => {
    if (width && width > 1024) {
      setMenuOpen(true);
    }
  }, [width]);

  useEffect(() => {
    if (width && width < 768) {
      setMenuOpen(false);
    } else {
      if (width) setMenuOpen(true);
    }
  }, [route]);

  // alert when login error
  useEffect(() => {
    if (error) {
      toast("خطأ في تسجيل الدخول", {
        icon: "🚨",
      });
    }
  }, [error]);

  // handle load and change organization
  useEffect(() => {
    if (session) {
      setValue("organization", session.user?.organization?.id);
    }
  }, [session]);

  useEffect(() => {
    if (organization) {
      updateOrganization();
    }
  }, [organization]);

  // go to dashboard if not authenticated and identify user if loged in
  useEffect(() => {
    if (status === "unauthenticated" && !isNonAuthPage) {
      router.push("/");
    } else {
      if (data?.user?.id && !userIdentified) {
        posthog.identify(data?.user?.id, {
          email: data?.user?.email,
          name: data?.user?.name,
        });
        setUserIdentified(true);
      }
    }
  }, [status, data]);

  const loginWithEmail = async () => {
    try {
      if (emailSent) {
        window.location.href = `/api/auth/callback/email?email=${encodeURIComponent(
          email
        )}&token=${code}`;
      } else {
        setLoading(true);
        const res = await signIn("email", {
          email,
          redirect: false,
          callbackUrl: "/dashboard",
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
            loginOpen && "blur-[4px]"
          )}
        >
          <div className="flex items-end gap-4">
            <p className="text-6xl">👥</p>
          </div>

          <div className="hidden w-9/12 items-center justify-between gap-2 md:flex">
            {status === "authenticated" && route.includes("/dashboard") ? (
              <div className="w-3/12">
                <SelectInput
                  name="organization"
                  placeholder="المؤسسة"
                  noError={true}
                  control={control}
                  options={organizations?.map((organization) => ({
                    label: organization.name,
                    value: organization.id,
                  }))}
                />
              </div>
            ) : (
              <div />
            )}
            <div>
              {status === "authenticated" && !route.includes("/dashboard") ? (
                <Button
                  text="صفحة التحكم"
                  noStyles
                  onClick={() => router.push("/dashboard")}
                />
              ) : null}
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
          </div>
          <MenuButton
            isOpen={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            strokeWidth="2"
            lineProps={{ strokeLinecap: "round" }}
            className="z-10 block  md:hidden"
          />
        </div>
      ) : null}
      {menuOpen && !isNonAuthPage ? (
        <div
          className={clsx(
            "fixed top-0 left-0 z-10 flex h-screen w-full flex-col justify-between overflow-scroll bg-gray-800 px-6 pb-20 pt-32 md:right-0 md:w-3/12 md:rounded-l-lg md:pt-36 md:pb-10",
            route == "/" && "md:hidden"
          )}
        >
          <div className="flex flex-col gap-4 ">
            {status === "authenticated" && route.includes("/dashboard") ? (
              <SelectInput
                name="organization"
                placeholder="المؤسسة"
                noError={true}
                control={control}
                options={organizations?.map((organization) => ({
                  label: organization.name,
                  value: organization.id,
                }))}
              />
            ) : (
              <div />
            )}
            <Button
              noStyles={route !== "/dashboard"}
              text="📊 إحصائياتي"
              onClick={() => router.push("/dashboard")}
              className={clsx(!isAuthenticated && "hidden")}
            />
            <Button
              noStyles={!route.includes("reviews")}
              text="🗣️ مراجعات عملائي"
              onClick={() => router.push("/dashboard/reviews")}
              className={clsx(!isAuthenticated && "hidden")}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              noStyles={!route.includes("links")}
              text="🔗 روابط المراجعات"
              onClick={() => router.push("/dashboard/links")}
              className={clsx(!isAuthenticated && "hidden")}
            />
            <Button
              noStyles={!route.includes("user")}
              text="👤 حسابي"
              onClick={() => router.push("/dashboard/user")}
              className={clsx(!isAuthenticated && "hidden")}
            />
            {status === "authenticated" &&
            !route.includes("/dashboard") &&
            route != "/" ? (
              <Button
                text="صفحة التحكم"
                noStyles
                onClick={() => router.push("/dashboard")}
                className="md:hidden"
              />
            ) : null}
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
      {!isNonAuthPage && route != "/" && (
        <div className="hidden md:block md:h-screen md:w-3/12" />
      )}
      <div
        className={clsx(
          `relative flex grow flex-col items-start gap-8 px-6 transition-all`,
          !isNonAuthPage && "pt-28",
          route == "/" && "pt-0",
          loginOpen && "blur-[4px]"
        )}
      >
        {status === "authenticated" || route === "/" || isNonAuthPage ? (
          children
        ) : (
          <div className="grow bg-gray-900" />
        )}
      </div>
      <Toaster />
      {route === "/" ? (
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
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            />
            <div className="my-4 h-1 w-full bg-gray-500" />
            <TextInput
              name="email"
              label="الإيميل"
              control={control}
              rules={{ required }}
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
      ) : null}
    </div>
  );
};

export default Layout;
