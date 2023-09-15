import { Button } from "@profits-gg/ui";
import clsx from "clsx";
import { useRouter } from "next-multilingual/router";
import { usePostHog } from "posthog-js/react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "~/utils/api";
import memberships from "~/utils/memberships";
import va from "@vercel/analytics";
import { useEffect } from "react";
import { useMessages } from "next-multilingual/messages";
import { useGetLocalizedUrl } from "next-multilingual/url";
import SEO from "~/components/SEO";

export default function Memberships() {
  const router = useRouter();

  const { getLocalizedUrl } = useGetLocalizedUrl();

  const messages = useMessages();

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
          setUserId(data?.id);
          posthog?.identify(data?.id, {
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
    <>
      <SEO
        title={messages.format("title")}
        description={messages.format("description")}
        url={getLocalizedUrl(`/memberships`, router.locale, undefined, true)}
        keywords={[messages.format("title"), messages.format("description")]}
      />
      <div className="flex justify-center !bg-gray-200 p-6">
        <div className="flex flex-col gap-4 md:w-2/3 lg:w-1/3">
          <p className="text text-xl font-bold text-gray-900 md:text-2xl">
            {user ? messages.format("ended") : messages.format("reachedMaxToday")}
          </p>

          <p className="text text-xl text-gray-900">
            {messages.format("description1")} {user ? messages.format("retry") : ""}{" "}
            {messages.format("description2")}
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
                rel="noreferrer noopener">
                <p className="text-xl font-bold">{messages.format(membership.product)}</p>
                <p className="text-end text-xl">
                  {membership.price ? (
                    <span className="line-through">
                      {membership.price.toLocaleString(router.locale)} {messages.format("sar")}
                    </span>
                  ) : null}{" "}
                  {membership.discount
                    ? `(${messages.format("discount")} ${(membership?.discount).toLocaleString(
                        router.locale
                      )}٪) 🔥`
                    : null}{" "}
                  {messages.format("for")} {(membership?.discountPrice).toLocaleString(router.locale)}{" "}
                  {messages.format("sar")}
                </p>
              </a>
            ))}

            <p className="text text-center text-gray-900">
              {messages.format("alreadySubscribed")}{" "}
              <span
                id="activate-membership"
                className="cursor-pointer text-blue-500 underline"
                onClick={() => {
                  router.push(`/activate-membership`);
                }}>
                {" "}
                {messages.format("activate")}{" "}
              </span>
            </p>
          </form>

          <Button
            text={messages.format("mainPage")}
            className="mt-8 w-full"
            onClick={() => {
              router.push("/");
            }}
          />
        </div>
      </div>
    </>
  );
}
