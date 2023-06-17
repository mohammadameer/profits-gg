import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { Analytics } from "@vercel/analytics/react";
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

import { IBM_Plex_Sans_Arabic } from "next/font/google";

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    // Enable debug mode in development
    // loaded: (posthog) => {
    //   if (process.env.NODE_ENV === "development") posthog.debug();
    // },
  });
}

const IBM = IBM_Plex_Sans_Arabic({
  weight: ["100", "400", "500", "700"],
  subsets: ["arabic"],
});

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
          <Component {...pageProps} />
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
