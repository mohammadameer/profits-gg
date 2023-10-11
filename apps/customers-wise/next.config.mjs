// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

const moduleExports = {
  // Your existing module.exports
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["ar"],
    defaultLocale: "ar",
  },
  transpilePackages: ["@profits-gg/ui", "@profits-gg/config"],
};

export default moduleExports;
