import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { api } from "~/utils/api";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "~/components/Layout";
import { useEffect } from "react";
import { MempershipModalOpenProvider } from "~/contexts/membership";
import { useRouter } from "next/router";

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    // Enable debug mode in development
    // loaded: (posthog) => {
    //   if (process.env.NODE_ENV === "development") posthog.debug();
    // },
  });
}

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);
  return (
    <PostHogProvider client={posthog}>
      <MempershipModalOpenProvider>
        <Layout>
          {/* <SessionProvider session={session}> */}
          <ReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}
            useEnterprise={true}
          >
            <Component {...pageProps} />
          </ReCaptchaProvider>
          <Analytics />
          {/* </SessionProvider> */}
        </Layout>
        <Toaster />

        <ReactQueryDevtools initialIsOpen={false} />
      </MempershipModalOpenProvider>
    </PostHogProvider>
  );
};

export default api.withTRPC(MyApp);
