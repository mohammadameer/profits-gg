import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { ReCaptchaProvider } from "next-recaptcha-v3";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}
        useEnterprise={true}
      >
        <Component {...pageProps} />
      </ReCaptchaProvider>
      <Analytics />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
