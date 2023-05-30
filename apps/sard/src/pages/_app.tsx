import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import Hotjar from "@hotjar/browser";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "~/components/Layout";
import { useEffect } from "react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      Hotjar.init(3513573, 6);
    }
  }, []);

  return (
    <Layout>
      <SessionProvider session={session}>
        <ReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}
          useEnterprise={true}
        >
          <Component {...pageProps} />
        </ReCaptchaProvider>
        <Analytics />
        <Toaster />
      </SessionProvider>
    </Layout>
  );
};

export default api.withTRPC(MyApp);
