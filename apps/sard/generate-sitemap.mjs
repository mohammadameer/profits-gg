// @ts-nocheck
import { writeFileSync } from "fs";
import { globby } from "globby";
import prettier from "prettier";
import fs from "fs";
import cheerio from "cheerio";
import { prisma } from "./src/server/db.mjs";
import categories from "./src/utils/sitemap-categories.mjs";

function generate() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ["ar-sa", "en-us"].forEach(async (lang) => {
    const pages = await globby([
      `.next/server/pages/${lang}/**/*.html`,
      `!.next/server/pages/${lang}/404.html`,
      `!.next/server/pages/${lang}/500.html`,
    ]);

    const sites = {
      "ar-sa": "https://www.sard.dev/ar-sa",
      "en-us": "https://www.sard.dev/en-us",
    };

    const siteUrl = Object.entries(sites).find(([key]) => key === lang)?.[1];

    const urls = [];

    await Promise.all(
      pages.map(async (page) => {
        const html = fs.readFileSync(page, "utf8");
        const $ = cheerio.load(html);
        const canonicalLink = $('link[rel="canonical"]').attr("href");
        console.log("page", page);

        urls.push(canonicalLink);
        if (page.endsWith("short-learning-stories-for-childrens/story.html")) {
          const stories = await prisma.story.findMany({
            where: {
              language: lang,
              hidden: false,
            },
            select: {
              slug: true,
            },
          });

          stories.forEach((story) => {
            urls.push(`${canonicalLink}/${encodeURIComponent(story.slug)}`);
          });
        }

        if (page.endsWith("stories-categories.html")) {
          categories.forEach((category) => {
            urls.push(
              `${canonicalLink}/${encodeURIComponent(
                Object.entries(category.label).find(([key]) => key === lang)?.[1]
              )}`
            );
          });
        }
      })
    );

    // remove duplicates urls and admin, test urls
    const uniqueUrls = [...new Set(urls)].filter((url) => !url.includes("admin") && !url.includes("test"));

    const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
        <url>
            <loc>${siteUrl}</loc>            
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        ${uniqueUrls.map((url) => {
          return `<url>
                  <loc>${url}</loc>
                  <lastmod>${new Date().toISOString()}</lastmod>
                  <changefreq>daily</changefreq>
                  <priority>0.7</priority>                  
              </url>
            `;
        })}
    </urlset>
    `;

    const formatted = prettier.format(sitemap, {
      parser: "html",
    });

    writeFileSync(`public/sitemap-${lang}.xml`, formatted);
  });
}

generate();
