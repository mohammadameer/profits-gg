import { Button, Modal } from "@profits-gg/ui";
import clsx from "clsx";
import { useRouter } from "next/router";
import { usePostHog } from "posthog-js/react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "~/utils/api";
import memberships from "~/utils/memberships";
import va from "@vercel/analytics";
import { useEffect } from "react";

export default function MembershipModal() {
  const router = useRouter();

  const posthog = usePostHog();

  const [userId, setUserId] = useLocalStorage<string>("userId", "");

  const { data: user } = api.user.get.useQuery(
    {
      id: userId,
    },
    {
      enabled: userId ? true : false,
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

  useEffect(() => {
    if (user?.id && user?.membershipExpiration) {
      const membershipExpiration = new Date(user?.membershipExpiration);

      if (membershipExpiration > new Date()) {
        router.push("/");
      }
    }
  }, [user]);

  return (
    <div className="flex justify-center !bg-gray-200 p-6">
      <div className="flex flex-col gap-4 md:w-2/3 lg:w-1/3">
        <p className="text text-xl font-bold text-gray-900 md:text-2xl">
          {user
            ? "انتهت صلاحية باقتك"
            : "وصلت الحد الأقصى للقصص الجديدة في اليوم تعال بكرة"}
        </p>

        <p className="text text-xl text-gray-900">
          بإمكانك قراءة القصص التي تم إنشاؤها من قبل أو {user ? "إعادة" : ""}{" "}
          الإشتراك في عدد لا نهائي من القصص الجديدة
        </p>

        <form className="flex w-full flex-col gap-4">
          {memberships.map((membership) => (
            <a
              key={membership.id}
              className={clsx(
                "membership flex w-full cursor-pointer select-none flex-col justify-between rounded-md border-4 border-transparent bg-gray-300 p-4 transition-all duration-300 hover:scale-105 active:scale-95"
              )}
              onClick={() => {
                // gtag?.("event", "conversion", {
                //   send_to: "AW-10865811504/Z5RhCNPd8KcYELDAnL0o",
                //   value: membership.discountPrice,
                //   currency: "SAR",
                // });
              }}
              href={membership.url}
              target="_blank"
              rel="noreferrer noopener"
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
            </a>
          ))}

          <p className="text text-center text-gray-900">
            لديك اشتراك سابق؟{" "}
            <span
              id="activate-membership"
              className="cursor-pointer text-blue-500 underline"
              onClick={() => {
                router.push(`/activate-membership`);
              }}
            >
              {" "}
              تفعيل الإشتراك
            </span>
          </p>
        </form>

        <Button
          text="العودة للصفحة الرئيسية"
          className="mt-8 w-full"
          onClick={() => {
            router.push("/");
          }}
        />
      </div>
    </div>
  );
}
