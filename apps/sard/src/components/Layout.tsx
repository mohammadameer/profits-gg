import { useRouter } from "next/router";
import { useMempershipModalOpen } from "~/contexts/membership";
import { Button, Modal, TextInput } from "@profits-gg/ui";
import clsx from "clsx";
import memberships, {
  Membership,
  expirationByAmount,
} from "~/utils/memberships";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import useLocalStorage from "@profits-gg/lib/hooks/useLocalStorage";
import { set, useForm } from "react-hook-form";
import { required } from "@profits-gg/lib/utils/formRules";
import { toast } from "react-hot-toast";
import va from "@vercel/analytics";
import { usePostHog } from "posthog-js/react/dist/types";

type FormValues = {
  emailOrPhoneNumber: string;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { checkout_session_id } = router.query;

  const posthog = usePostHog();

  const [userId, setUserId] = useLocalStorage<string>("userId", "");

  const { control, handleSubmit } = useForm<FormValues>();

  const { isMempershipModalOpen, setIsMempershipModalOpen } =
    useMempershipModalOpen();
  const [selectedMembership, setSelectedMembership] = useState<
    Membership | undefined
  >();
  const [isActivateMembershipModalOpen, setIsActivateMembershipModalOpen] =
    useState<boolean>(false);
  const [checkoutSessionSuccess, setCheckoutSessionSuccess] =
    useState<boolean>(false);

  const { data: checkoutSession } = api.stripe.getCheckoutSession.useQuery(
    {
      id: checkout_session_id as string,
    },
    {
      enabled: checkout_session_id ? true : false,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onSuccess: (data) => {
        if (data?.payment_status == "paid") {
          setCheckoutSessionSuccess(true);
          va.track("Checkout Session Success");
        }
      },
    }
  );
  const { data: user } = api.user.get.useQuery(
    {
      id: userId,
      email: checkoutSession?.customer_details?.email as string,
      phoneNumber: checkoutSession?.customer_details?.phone as string,
    },
    {
      enabled:
        (checkoutSession?.customer_details?.email &&
          checkoutSession?.customer_details?.phone) ||
        userId
          ? true
          : false,
      onSuccess: (data) => {
        if (data?.id) {
          setUserId(data?.id as string);
          posthog?.identify(data?.id as string, {
            name: data?.name,
            email: data?.email,
            phoneNumber: data?.phoneNumber,
          });
          va.track("User Set");
        }
      },
    }
  );

  const { mutate: checkUser, isLoading: isCheckingUser } =
    api.user.checkUser.useMutation();

  const handleActivateMembership = async ({
    emailOrPhoneNumber,
  }: FormValues) => {
    va.track("Activate Membership Clicked");
    if (!emailOrPhoneNumber) return;
    if (isCheckingUser) return;

    if (!emailOrPhoneNumber.includes("@")) {
      if (emailOrPhoneNumber.length != 10) {
        va.track("Activate Membership Number Error");
        toast.error("رقم الجوال يجب أن لا يقل عن ٩ أرقام");
        return;
      }
    }

    checkUser(
      {
        email: emailOrPhoneNumber,
        phoneNumber: emailOrPhoneNumber,
      },
      {
        onSuccess: (data) => {
          if (data?.id) {
            setUserId(data?.id);
            posthog?.identify(data?.id as string, {
              name: data?.name,
              email: data?.email,
              phoneNumber: data?.phoneNumber,
            });
            va.track("Activate Membership User Set");
            if (data?.membershipExpiration) {
              if (new Date(data?.membershipExpiration) > new Date()) {
                va.track("Activate Membership Success");
                toast.success("تم تفعيل الإشتراك بنجاح");
                setIsActivateMembershipModalOpen(false);
                setIsMempershipModalOpen(false);
                router.push("/");
                return;
              } else {
                va.track("Activate Membership Expired");
                toast.error("انتهت صلاحية الإشتراك");
                setIsActivateMembershipModalOpen(false);
                setIsMempershipModalOpen(true);
                return;
              }
            }
          } else {
            va.track("Activate Membership User Not Found");
            toast.error(
              "لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني أو رقم الجوال"
            );
            return;
          }
        },
        onError: () => {
          va.track("Activate Membership Email Or Phone Number Not Found");
          toast.error(
            "لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني أو رقم الجوال"
          );
        },
      }
    );
  };

  useEffect(() => {
    if (!user) return;
    setUserId(user?.id as string);
    posthog?.identify(user?.id as string, {
      name: user?.name,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
    });
  }, [user]);

  const membership = memberships.find(
    (membership) =>
      membership.discountPrice * 100 == checkoutSession?.amount_total
  );

  const expirationSeconds = membership?.discountPrice
    ? expirationByAmount[membership?.discountPrice * 100]
    : null;

  return (
    <>
      <div
        className={clsx(
          "flex min-h-screen flex-col bg-gray-200 transition-all duration-300",
          isMempershipModalOpen ||
            checkoutSessionSuccess ||
            isActivateMembershipModalOpen
            ? "blur-3xl"
            : null
        )}
      >
        <div className="flex w-full pr-5 pt-5">
          <p
            className="text transform cursor-pointer text-4xl font-bold text-gray-900 duration-300 hover:scale-105 active:scale-95 md:text-5xl"
            onClick={() => router.push("/")}
          >
            📖 سرد
          </p>
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

      {/* Checkout Session Success Modal */}
      <Modal
        open={checkoutSessionSuccess}
        setOpen={setCheckoutSessionSuccess}
        className="!bg-gray-200 shadow-md"
      >
        <p className="text text-xl font-bold text-gray-900 md:text-2xl">
          تم الإشتراك بنجاح 🥳
        </p>

        <p className="text text-xl text-gray-900">
          أنت مشترك الآن في باقة{" "}
          <span className="font-bold">{membership?.product}</span>
        </p>

        <p className="text text-xl text-gray-900">
          تنتهي صلاحية الباقة في{" "}
          {membership?.discountPrice != undefined &&
          expirationSeconds != undefined ? (
            <span className="font-bold">
              {new Date(
                new Date(
                  (checkoutSession?.created as number) * 1000
                ).getTime() +
                  expirationSeconds * 1000
              ).toLocaleString("ar-EG", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}{" "}
              -{" "}
              {new Date(
                new Date(
                  (checkoutSession?.created as number) * 1000
                ).getTime() +
                  expirationSeconds * 1000
              ).toLocaleString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          ) : null}
        </p>
      </Modal>

      {/* Membership Modal */}
      <Modal
        open={isMempershipModalOpen}
        setOpen={setIsMempershipModalOpen}
        onClose={() => router.push("/")}
        className="!bg-gray-200 shadow-md"
      >
        <p className="text text-xl font-bold text-gray-900 md:text-2xl">
          {user ? "انتهت صلاحية باقتك" : "وصلت الحد الأقصى للقصص في اليوم"}
        </p>

        <p className="text text-xl text-gray-900">
          يمكنك قراءة القصص التي تم إنشاؤها من قبل أو {user ? "إعادة" : ""}{" "}
          الإشتراك في عدد لا نهائي من القصص الجديدة
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!selectedMembership) return;
            window.open(selectedMembership?.url, "_blank");
          }}
          className="flex w-full flex-col gap-4"
        >
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className={clsx(
                "flex w-full cursor-pointer select-none flex-col justify-between rounded-md border-4 border-transparent bg-gray-300 p-4 transition-all duration-300 hover:scale-105 active:scale-95",
                selectedMembership?.id == membership.id &&
                  "border-4 !border-blue-500 "
              )}
              onClick={() => setSelectedMembership(membership)}
            >
              <p className="text-xl font-bold">{membership.product}</p>
              <p className="text-end text-xl">
                {membership.price ? (
                  <span className="line-through">
                    {membership.price.toLocaleString("ar-EG")}
                  </span>
                ) : null}{" "}
                {membership.discount
                  ? `(خصم ${(membership?.discount).toLocaleString(
                      "ar-EG"
                    )}٪) 🔥`
                  : null}{" "}
                بـ {(membership?.discountPrice).toLocaleString("ar-EG")} ريال
              </p>
            </div>
          ))}

          <Button
            text={
              selectedMembership
                ? `إدفع ${(selectedMembership?.discountPrice).toLocaleString(
                    "ar-EG"
                  )} ريال`
                : "إختر باقة"
            }
            type="submit"
            className="w-full !bg-blue-500 !text-white"
            disabled={selectedMembership ? false : true}
          />

          <p className="text text-center text-gray-900">
            لديك اشتراك سابق؟{" "}
            <span
              className="cursor-pointer text-blue-500 underline"
              onClick={() => {
                setIsMempershipModalOpen(false);
                setIsActivateMembershipModalOpen(true);
              }}
            >
              {" "}
              تفعيل الإشتراك
            </span>
          </p>
        </form>
      </Modal>

      {/* login Modal */}
      <Modal
        open={isActivateMembershipModalOpen}
        setOpen={setIsActivateMembershipModalOpen}
        onClose={() => {
          setIsMempershipModalOpen(true);
          setIsActivateMembershipModalOpen(false);
        }}
        className="!bg-gray-200 shadow-md"
      >
        <p className="text text-xl font-bold text-gray-900 md:text-2xl">
          تفعيل الإشتراك
        </p>

        <p className="text text-xl text-gray-900">
          يمكنك تفعيل الإشتراك بإستخدام البريد الإلكتروني أو رقم الجوال الذي تم
          استخدامه عند الإشتراك
        </p>

        <form
          onSubmit={handleSubmit(handleActivateMembership)}
          className="w-full"
        >
          <TextInput
            label="البريد الإلكتروني أو رقم الجوال"
            name="emailOrPhoneNumber"
            control={control}
            rules={{ required }}
            className="w-full"
            inputClassName="!bg-gray-200 focus:!border-gray-500"
          />
          <Button
            text="تفعيل الإشتراك"
            type="submit"
            loading={isCheckingUser}
            className="mt-2 w-full !bg-blue-500 !text-white"
          />
        </form>
      </Modal>
    </>
  );
}
