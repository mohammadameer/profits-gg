import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { IBM_Plex_Sans_Arabic } from "@next/font/google";

import { api } from "../utils/api";

import "../styles/globals.css";
import Layout from "../components/Layout";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { posthog } from "posthog-js";

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
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
