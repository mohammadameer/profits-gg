/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

import { getConfig } from "next-multilingual/config";

const multilingualConfig = getConfig("sard", ["ar-SA", "en-US"], "en-US", {
  reactStrictMode: true,
  poweredByHeader: false,
  // basePath: '/some-path',
  // debug: true,

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  transpilePackages: [
    "@profits-gg/ui",
    "@profits-gg/lib",
    "@profits-gg/config",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
      },
    ],
  },
});

export const i18n = multilingualConfig.i18n;

export const config = multilingualConfig;

export default config;