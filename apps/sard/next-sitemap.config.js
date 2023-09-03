/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.sard.dev/ar-sa",
  generateRobotsTxt: true, // (optional)
  alternateRefs: [
    {
      href: "https://www.sard.dev/en-us",
      hreflang: "en-us",
    },
  ],
  // ...other options
};
