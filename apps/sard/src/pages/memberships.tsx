import { Modal } from "@profits-gg/ui";
import clsx from "clsx";
import { useRouter } from "next/router";
import { usePostHog } from "posthog-js/react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "~/utils/api";
import memberships from "~/utils/memberships";
import va from "@vercel/analytics";

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

  return (
    <div className="flex justify-center !bg-gray-200 p-6">
      <div className="flex flex-col gap-4 md:w-2/3 lg:w-1/3">
        <p className="text text-xl font-bold text-gray-900 md:text-2xl">
          {user ? "انتهت صلاحية باقتك" : "وصلت الحد الأقصى للقصص في اليوم"}
        </p>

        <p className="text text-xl text-gray-900">
          يمكنك قراءة القصص التي تم إنشاؤها من قبل أو {user ? "إعادة" : ""}{" "}
          الإشتراك في عدد لا نهائي من القصص الجديدة
        </p>

        <form className="flex w-full flex-col gap-4">
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className={clsx(
                "flex w-full cursor-pointer select-none flex-col justify-between rounded-md border-4 border-transparent bg-gray-300 p-4 transition-all duration-300 hover:scale-105 active:scale-95"
              )}
              onClick={() => {
                gtag?.("event", "conversion", {
                  send_to: "AW-10865811504/Z5RhCNPd8KcYELDAnL0o",
                  value: membership.discountPrice,
                  currency: "SAR",
                });
                window.open(membership.url, "_blank");
              }}
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

          <p className="text text-center text-gray-900">
            لديك اشتراك سابق؟{" "}
            <span
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
      </div>
    </div>
  );
}
