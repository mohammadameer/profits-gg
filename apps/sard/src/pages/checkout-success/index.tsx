import { Button, Modal } from "@profits-gg/ui";
import { useRouter } from "next-multilingual/router";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "~/utils/api";
import memberships, { expirationByAmount } from "~/utils/memberships";
import va from "@vercel/analytics";
import { useMessages } from "next-multilingual/messages";
import Head from "next-multilingual/head";

export default function CheckoutSuccessModal() {
  const router = useRouter();
  const { checkout_session_id } = router.query;

  const messages = useMessages();

  const posthog = usePostHog();

  const [userId, setUserId] = useLocalStorage<string>("userId", "");

  const [checkoutSessionSuccess, setCheckoutSessionSuccess] = useState<boolean>(false);

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
        (checkoutSession?.customer_details?.email && checkoutSession?.customer_details?.phone) || userId
          ? true
          : false,
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

  const membership = memberships.find(
    (membership) => membership.discountPrice * 100 == checkoutSession?.amount_total
  );

  const expirationSeconds = membership?.discountPrice
    ? expirationByAmount[membership?.discountPrice * 100]
    : null;

  useEffect(() => {
    if (!user) return;
    setUserId(user?.id);
    posthog?.identify(user?.id, {
      name: user?.name,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
    });
  }, [user]);

  return (
    <>
      <Head>
        <title>{messages.format("title")}</title>
        <meta name="description" content={messages.format("description")} />
        <meta property="og:title" content={messages.format("title")} />
        <meta property="og:description" content={messages.format("description")} />
      </Head>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 !bg-gray-200">
        <p className="text text-xl font-bold text-gray-900 md:text-2xl">{messages?.format("title")}</p>

        <p className="text text-xl text-gray-900">
          {messages.format("youSubscribedTo")} <span className="font-bold">{membership?.product}</span>
        </p>

        <p className="text text-xl text-gray-900">
          {messages.format("endIn")}{" "}
          {membership?.discountPrice != undefined && expirationSeconds != undefined ? (
            <span className="font-bold">
              {new Date(
                new Date((checkoutSession?.created as number) * 1000).getTime() + expirationSeconds * 1000
              ).toLocaleString(router.locale, {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}{" "}
              -{" "}
              {new Date(
                new Date((checkoutSession?.created as number) * 1000).getTime() + expirationSeconds * 1000
              ).toLocaleString(router.locale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          ) : null}
        </p>

        <Button
          text={messages.format("mainPage")}
          onClick={() => {
            router.push("/");
          }}
          className="mt-4"
        />
      </div>
    </>
  );
}
