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
import { useRouter } from "next/router";

import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";

// Check that PostHog is client-side (used to handle Next.js SSR)
// if (typeof window !== "undefined") {
//   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {

//     // Enable debug mode in development
//     // loaded: (posthog) => {
//     //   if (process.env.NODE_ENV === "development") posthog.debug();
//     // },
//   });
// }

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
    <>
      {router?.pathname != "/" ? (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-10865811504"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            <!-- Google tag (gtag.js) -->
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', 'AW-10865811504');
          `}
          </Script>
          <Script strategy="afterInteractive">
            {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

              ttq.load('CI1LOKRC77U4209V8L3G');
              ttq.page();
            }(window, document, 'ttq');
          `}
          </Script>
        </>
      ) : null}
      <PostHogProvider client={posthog}>
        <Layout>
          {/* <SessionProvider session={session}> */}
          <Component {...pageProps} />
          <Analytics />
          {/* </SessionProvider> */}
        </Layout>
        <Toaster />

        <ReactQueryDevtools initialIsOpen={false} />
      </PostHogProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
