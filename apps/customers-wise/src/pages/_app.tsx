import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";

import { IBM_Plex_Sans_Arabic } from "@next/font/google";
import Layout from "../components/Layout";
import Script from "next/script";
import { usePostHog } from "next-use-posthog";
import { useEffect } from "react";
import posthog from "posthog-js";
import { useRouter } from "next/router";
import { DirectionProvider } from "@radix-ui/react-direction";

const ibmPlexSansArabicLight = IBM_Plex_Sans_Arabic({
  weight: "100",
  subsets: ["arabic"],
});
const ibmPlexSansArabicRegular = IBM_Plex_Sans_Arabic({
  weight: "400",
  subsets: ["arabic"],
});
const ibmPlexSansArabicMideum = IBM_Plex_Sans_Arabic({
  weight: "500",
  subsets: ["arabic"],
});
const ibmPlexSansArabicBold = IBM_Plex_Sans_Arabic({
  weight: "700",
  subsets: ["arabic"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();

  useEffect(() => {
    // Init PostHog
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY as string);

    // Track page views
    const handleRouteChange = () => posthog.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return (
    <DirectionProvider dir="rtl">
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </SessionProvider>
    </DirectionProvider>
  );
};

export default trpc.withTRPC(MyApp);
